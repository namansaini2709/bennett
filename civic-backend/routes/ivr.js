const express = require('express');
const crypto = require('crypto');
const fs = require('fs/promises');
const os = require('os');
const path = require('path');
const { spawn } = require('child_process');
const prisma = require('../config/db');

const router = express.Router();

const LANGUAGE_BY_DIGIT = {
  '1': 'en',
  '2': 'hi'
};

const CATEGORY_BY_DIGIT = {
  '1': 'road_issue',
  '2': 'water_supply',
  '3': 'electricity',
  '4': 'garbage',
  '5': 'drainage',
  '6': 'street_light',
  '7': 'traffic',
  '8': 'pollution',
  '9': 'encroachment',
  '0': 'other'
};

const PRIORITY_BY_CATEGORY = {
  water_supply: 'high',
  electricity: 'high',
  road_issue: 'medium',
  garbage: 'medium',
  drainage: 'medium',
  street_light: 'medium',
  traffic: 'medium',
  pollution: 'medium',
  encroachment: 'low',
  other: 'low'
};

const DEFAULT_CITY = process.env.IVR_DEFAULT_CITY || 'Delhi';
const DEFAULT_STATE = process.env.IVR_DEFAULT_STATE || 'Delhi';
const DEFAULT_LATITUDE = Number(process.env.IVR_DEFAULT_LATITUDE || 28.6139);
const DEFAULT_LONGITUDE = Number(process.env.IVR_DEFAULT_LONGITUDE || 77.2090);
const IVR_USE_RECORDING_TRANSCRIPTION = process.env.IVR_USE_RECORDING_TRANSCRIPTION === 'true';
const IVR_TRANSCRIPTION_PROVIDER = process.env.IVR_TRANSCRIPTION_PROVIDER || 'twilio_speech';
const IVR_LOCAL_WHISPER_SCRIPT = process.env.IVR_LOCAL_WHISPER_SCRIPT || path.join(__dirname, '..', 'scripts', 'transcribe_local_whisper.py');
const IVR_LOCAL_WHISPER_PYTHON = process.env.IVR_LOCAL_WHISPER_PYTHON || 'python';
const IVR_LOCAL_WHISPER_MODEL = process.env.IVR_LOCAL_WHISPER_MODEL || 'tiny';
const IVR_LOCAL_WHISPER_DEVICE = process.env.IVR_LOCAL_WHISPER_DEVICE || 'cpu';
const IVR_TRANSCRIPTION_TIMEOUT_MS = Number(process.env.IVR_TRANSCRIPTION_TIMEOUT_MS || 8000);
const IVR_GEMINI_TIMEOUT_MS = Number(process.env.IVR_GEMINI_TIMEOUT_MS || 4000);

function escapeXml(text = '') {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function twimlResponse(res, body) {
  res.type('text/xml').send(`<?xml version="1.0" encoding="UTF-8"?><Response>${body}</Response>`);
}

function normalizePhone(rawPhone = '') {
  const trimmed = String(rawPhone).trim();
  if (!trimmed) return '';
  if (trimmed.startsWith('+')) {
    return `+${trimmed.replace(/[^\d]/g, '')}`;
  }
  const digits = trimmed.replace(/[^\d]/g, '');
  return digits ? `+${digits}` : '';
}

function phoneToLocalPart(phone) {
  return phone.replace(/\D/g, '') || crypto.randomUUID().replace(/-/g, '');
}

function categoryTitle(category) {
  return category.replace(/_/g, ' ').replace(/\b\w/g, (ch) => ch.toUpperCase());
}

function getTwilioRequestUrl(req) {
  const configuredBase = process.env.IVR_PUBLIC_BASE_URL;
  const baseUrl = configuredBase || `${req.protocol}://${req.get('host')}`;
  return `${baseUrl}${req.originalUrl}`;
}

function getBaseUrl(req) {
  return process.env.IVR_PUBLIC_BASE_URL || `${req.protocol}://${req.get('host')}`;
}

function buildIvrUrl(req, path, params = {}) {
  const base = getBaseUrl(req);
  const query = new URLSearchParams(params).toString();
  return `${base}${path}${query ? `?${query}` : ''}`;
}

function getTwilioParams(req) {
  return {
    ...(req.query || {}),
    ...(req.body || {})
  };
}

function getTwilioSignatureExpected(authToken, url, params) {
  const sortedKeys = Object.keys(params || {}).sort();
  let payload = url;
  for (const key of sortedKeys) {
    const value = params[key];
    payload += `${key}${value}`;
  }
  return crypto.createHmac('sha1', authToken).update(payload, 'utf8').digest('base64');
}

function isValidTwilioSignature(req) {
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const provided = req.get('X-Twilio-Signature');
  if (!authToken || !provided) {
    return false;
  }

  const expected = getTwilioSignatureExpected(authToken, getTwilioRequestUrl(req), req.body || {});
  const a = Buffer.from(expected);
  const b = Buffer.from(provided);
  if (a.length !== b.length) {
    return false;
  }
  return crypto.timingSafeEqual(a, b);
}

function verifyTwilioIfEnabled(req, res, next) {
  if (process.env.IVR_VALIDATE_TWILIO_SIGNATURE !== 'true') {
    return next();
  }

  if (!isValidTwilioSignature(req)) {
    return res.status(403).json({
      success: false,
      message: 'Invalid Twilio signature'
    });
  }
  return next();
}

function safeJsonParse(text) {
  try {
    return JSON.parse(text);
  } catch (error) {
    return null;
  }
}

function withTimeout(promise, timeoutMs, label) {
  let timeoutHandle;
  const timeoutPromise = new Promise((_, reject) => {
    timeoutHandle = setTimeout(() => reject(new Error(`${label}_timeout`)), timeoutMs);
  });

  return Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timeoutHandle));
}

function extractJsonBlock(text = '') {
  const trimmed = String(text).trim();
  if (!trimmed) return null;

  const direct = safeJsonParse(trimmed);
  if (direct) return direct;

  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (fenced && fenced[1]) {
    const parsedFenced = safeJsonParse(fenced[1].trim());
    if (parsedFenced) return parsedFenced;
  }

  const firstBrace = trimmed.indexOf('{');
  const lastBrace = trimmed.lastIndexOf('}');
  if (firstBrace >= 0 && lastBrace > firstBrace) {
    const candidate = trimmed.slice(firstBrace, lastBrace + 1);
    return safeJsonParse(candidate);
  }
  return null;
}

async function extractIssueWithGemini({ transcript, language, fallbackCategory }) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || !transcript) {
    return null;
  }

  const model = process.env.IVR_GEMINI_MODEL || 'gemini-2.0-flash';
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const prompt = [
    'You are classifying an Indian civic complaint from an IVR transcript.',
    'Return strict JSON with keys: category, priority, description, addressHint, reporterName.',
    'Allowed categories: road_issue, water_supply, electricity, garbage, drainage, street_light, traffic, pollution, encroachment, other.',
    'Allowed priorities: low, medium, high, urgent.',
    `Fallback category from DTMF: ${fallbackCategory}.`,
    `Language: ${language}.`,
    `Transcript: ${transcript}`
  ].join('\n');

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }]
        }
      ],
      generationConfig: {
        temperature: 0.1,
        responseMimeType: 'application/json'
      }
    })
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Gemini API failed (${response.status}): ${text}`);
  }

  const data = await response.json();
  const textOutput = data?.candidates?.[0]?.content?.parts
    ?.map((part) => part.text || '')
    .join('\n')
    .trim();

  if (!textOutput) {
    return null;
  }

  const parsed = extractJsonBlock(textOutput);
  if (!parsed || typeof parsed !== 'object') {
    return null;
  }

  return parsed;
}

function buildTwilioBasicAuthHeader() {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  if (!accountSid || !authToken) {
    return null;
  }
  return `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString('base64')}`;
}

function normalizeTwilioRecordingUrl(url = '') {
  const value = String(url || '').trim();
  if (!value) return '';
  if (value.endsWith('.wav') || value.endsWith('.mp3')) {
    return value;
  }
  return `${value}.wav`;
}

async function downloadTwilioRecordingToTemp(recordingUrl, callSid = 'unknown') {
  const authHeader = buildTwilioBasicAuthHeader();
  if (!authHeader) {
    throw new Error('Missing Twilio credentials for recording download');
  }

  const normalizedUrl = normalizeTwilioRecordingUrl(recordingUrl);
  if (!normalizedUrl) {
    throw new Error('Missing recording URL');
  }

  const response = await fetch(normalizedUrl, {
    headers: { Authorization: authHeader }
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Could not fetch Twilio recording (${response.status}): ${errorText}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  const fileName = `ivr_${callSid}_${Date.now()}.wav`;
  const tempPath = path.join(os.tmpdir(), fileName);
  await fs.writeFile(tempPath, Buffer.from(arrayBuffer));
  return tempPath;
}

function runLocalWhisper({ audioPath, language }) {
  const scriptPath = IVR_LOCAL_WHISPER_SCRIPT;
  const model = IVR_LOCAL_WHISPER_MODEL;
  const device = IVR_LOCAL_WHISPER_DEVICE;
  const lang = language === 'hi' ? 'hi' : 'en';

  return new Promise((resolve, reject) => {
    const args = [scriptPath, '--audio', audioPath, '--language', lang, '--model', model, '--device', device];
    const child = spawn(IVR_LOCAL_WHISPER_PYTHON, args, { stdio: ['ignore', 'pipe', 'pipe'] });
    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (chunk) => {
      stdout += chunk.toString();
    });
    child.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
    });
    child.on('error', (error) => {
      reject(error);
    });
    child.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`Local whisper script failed (${code}): ${stderr || 'no stderr'}`));
        return;
      }

      const transcript = String(stdout || '').trim();
      resolve(transcript);
    });
  });
}

async function transcribeWithLocalWhisper(recordingUrl, language, callSid) {
  let audioPath = '';
  try {
    audioPath = await downloadTwilioRecordingToTemp(recordingUrl, callSid);
    return await runLocalWhisper({ audioPath, language });
  } finally {
    if (audioPath) {
      await fs.unlink(audioPath).catch(() => {});
    }
  }
}

async function transcribeRecording({ recordingUrl, language, callSid }) {
  if (!recordingUrl || !IVR_USE_RECORDING_TRANSCRIPTION) {
    return '';
  }

  if (IVR_TRANSCRIPTION_PROVIDER === 'local_whisper') {
    return withTimeout(
      transcribeWithLocalWhisper(recordingUrl, language, callSid),
      IVR_TRANSCRIPTION_TIMEOUT_MS,
      'local_whisper'
    );
  }

  return '';
}

async function sendTwilioSms(to, body) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_SMS_FROM;

  if (!accountSid || !authToken || !from || !to) {
    return { sent: false, reason: 'missing_twilio_sms_config' };
  }

  const endpoint = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
  const form = new URLSearchParams({
    To: to,
    From: from,
    Body: body
  });

  const auth = Buffer.from(`${accountSid}:${authToken}`).toString('base64');
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: form.toString()
  });

  if (!response.ok) {
    const errorText = await response.text();
    return { sent: false, reason: `twilio_sms_failed_${response.status}`, details: errorText };
  }

  const payload = await response.json();
  return { sent: true, sid: payload.sid };
}

async function getOrCreateIvrUser(phone, languageCode) {
  const normalizedPhone = normalizePhone(phone);
  if (!normalizedPhone) {
    return null;
  }

  const existing = await prisma.user.findUnique({
    where: { phone: normalizedPhone }
  });

  if (existing) {
    if (languageCode && existing.language !== languageCode) {
      return prisma.user.update({
        where: { id: existing.id },
        data: { language: languageCode }
      });
    }
    return existing;
  }

  const localPart = phoneToLocalPart(normalizedPhone);
  const email = `ivr_${localPart}@civicsetu.local`;

  return prisma.user.create({
    data: {
      name: `IVR Caller ${localPart.slice(-6)}`,
      email,
      phone: normalizedPhone,
      password: `ivr-${crypto.randomUUID()}`,
      role: 'citizen',
      language: languageCode || 'hi',
      city: DEFAULT_CITY,
      state: DEFAULT_STATE,
      isVerified: false
    }
  });
}

function categoryPrompt(languageCode) {
  if (languageCode === 'hi') {
    return [
      'Sadak samasya ke liye 1 dabayen.',
      'Pani ke liye 2.',
      'Bijli ke liye 3.',
      'Kachra ke liye 4.',
      'Drainage ke liye 5.',
      'Street light ke liye 6.',
      'Traffic ke liye 7.',
      'Pradushan ke liye 8.',
      'Atikraman ke liye 9.',
      'Anya ke liye 0 dabayen.'
    ].join(' ');
  }

  return [
    'Press 1 for road issue.',
    'Press 2 for water.',
    'Press 3 for electricity.',
    'Press 4 for garbage.',
    'Press 5 for drainage.',
    'Press 6 for street light.',
    'Press 7 for traffic.',
    'Press 8 for pollution.',
    'Press 9 for encroachment.',
    'Press 0 for other issues.'
  ].join(' ');
}

function descriptionPrompt(languageCode) {
  if (languageCode === 'hi') {
    return 'Ab tone aayegi. Tone ke baad pehle apna naam, phir samasya, aur exact location ya landmark dheere boliye.';
  }
  return 'You will hear a tone now. After the tone, say your name, issue, and exact location or nearby landmark slowly.';
}

function thankYouPrompt(languageCode, ticketId) {
  if (languageCode === 'hi') {
    return `Dhanyavaad. Aapki shikayat darj ho gayi hai. Aapka ticket number ${ticketId} hai.`;
  }
  return `Thank you. Your issue has been registered. Your ticket number is ${ticketId}.`;
}

router.all('/twilio', verifyTwilioIfEnabled, async (req, res) => {
  try {
    const incomingUrl = escapeXml(buildIvrUrl(req, '/api/ivr/twilio/incoming'));
    twimlResponse(res, `<Redirect method="POST">${incomingUrl}</Redirect>`);
  } catch (error) {
    console.error('IVR base route error:', error);
    twimlResponse(res, '<Say>System error. Please try again later.</Say><Hangup/>');
  }
});

router.all('/twilio/incoming', verifyTwilioIfEnabled, async (req, res) => {
  try {
    const params = getTwilioParams(req);
    console.log('[IVR] incoming', { from: params.From, callSid: params.CallSid });
    const languageUrl = escapeXml(buildIvrUrl(req, '/api/ivr/twilio/language'));
    const incomingUrl = escapeXml(buildIvrUrl(req, '/api/ivr/twilio/incoming'));
    const gather = [
      `<Gather input="dtmf" numDigits="1" timeout="8" action="${languageUrl}" method="POST">`,
      '<Say language="hi-IN" voice="alice">Namaskar. Bhasha chunein. Hindi ke liye 2 dabayen. English ke liye 1 dabayen.</Say>',
      '</Gather>',
      `<Redirect method="POST">${incomingUrl}</Redirect>`
    ].join('');

    twimlResponse(res, gather);
  } catch (error) {
    console.error('IVR incoming error:', error);
    twimlResponse(res, '<Say>System error. Please try again later.</Say><Hangup/>');
  }
});

router.all('/twilio/language', verifyTwilioIfEnabled, async (req, res) => {
  try {
    const params = getTwilioParams(req);
    console.log('[IVR] language', { digit: params.Digits, from: params.From, callSid: params.CallSid });
    const digit = params.Digits;
    const language = LANGUAGE_BY_DIGIT[digit] || 'hi';
    const categoryUrl = escapeXml(buildIvrUrl(req, '/api/ivr/twilio/category', { lang: language }));
    const languageUrl = escapeXml(buildIvrUrl(req, '/api/ivr/twilio/language', { lang: language }));
    const gather = [
      `<Gather input="dtmf" numDigits="1" timeout="10" action="${categoryUrl}" method="POST">`,
      `<Say language="${language === 'hi' ? 'hi-IN' : 'en-IN'}" voice="alice">${escapeXml(categoryPrompt(language))}</Say>`,
      '</Gather>',
      `<Redirect method="POST">${languageUrl}</Redirect>`
    ].join('');

    twimlResponse(res, gather);
  } catch (error) {
    console.error('IVR language step error:', error);
    twimlResponse(res, '<Say>System error. Please try again later.</Say><Hangup/>');
  }
});

router.all('/twilio/category', verifyTwilioIfEnabled, async (req, res) => {
  try {
    const params = getTwilioParams(req);
    console.log('[IVR] category', { digit: params.Digits, lang: req.query.lang, from: params.From, callSid: params.CallSid });
    const language = req.query.lang === 'en' ? 'en' : 'hi';
    const digit = params.Digits;
    const category = CATEGORY_BY_DIGIT[digit] || 'other';
    const finalizeUrl = escapeXml(buildIvrUrl(req, '/api/ivr/twilio/finalize', { lang: language, category }));
    const categoryUrl = escapeXml(buildIvrUrl(req, '/api/ivr/twilio/category', { lang: language }));
    const speechLanguage = language === 'hi' ? 'hi-IN' : 'en-IN';
    const speechHints = [
      'sector',
      'road',
      'street',
      'gali',
      'nagar',
      'near',
      'pani',
      'bijli',
      'kachra',
      'drainage',
      'street light',
      'Delhi',
      'Noida',
      'Gurgaon'
    ].join(',');
    const twiml = IVR_USE_RECORDING_TRANSCRIPTION && IVR_TRANSCRIPTION_PROVIDER === 'local_whisper'
      ? [
          `<Say language="${language === 'hi' ? 'hi-IN' : 'en-IN'}" voice="alice">${escapeXml(descriptionPrompt(language))}</Say>`,
          `<Record playBeep="true" timeout="3" maxLength="30" action="${finalizeUrl}" method="POST"/>`,
          `<Redirect method="POST">${categoryUrl}</Redirect>`
        ].join('')
      : [
          `<Gather input="speech" language="${speechLanguage}" hints="${escapeXml(speechHints)}" speechModel="phone_call" speechTimeout="auto" actionOnEmptyResult="true" action="${finalizeUrl}" method="POST">`,
          `<Say language="${language === 'hi' ? 'hi-IN' : 'en-IN'}" voice="alice">${escapeXml(descriptionPrompt(language))}</Say>`,
          '</Gather>',
          `<Redirect method="POST">${categoryUrl}</Redirect>`
        ].join('');

    twimlResponse(res, twiml);
  } catch (error) {
    console.error('IVR category step error:', error);
    twimlResponse(res, '<Say>System error. Please try again later.</Say><Hangup/>');
  }
});

router.all('/twilio/finalize', verifyTwilioIfEnabled, async (req, res) => {
  try {
    const params = getTwilioParams(req);
    console.log('[IVR] finalize', { lang: req.query.lang, category: req.query.category, from: params.From, callSid: params.CallSid });
    const language = req.query.lang === 'en' ? 'en' : 'hi';
    const requestedCategory = String(req.query.category || '');
    const callerPhone = params.From;
    const callSid = String(params.CallSid || 'unknown');
    let speech = String(params.SpeechResult || '').trim();
    const recordingUrl = String(params.RecordingUrl || '').trim();
    const callerCity = String(params.CallerCity || '').trim();
    const callerState = String(params.CallerState || '').trim();
    const callerCountry = String(params.CallerCountry || '').trim();
    const fallbackDescription = language === 'hi' ? 'Voice transcript capture nahi hua.' : 'Voice transcript was not captured.';

    let category = PRIORITY_BY_CATEGORY[requestedCategory] ? requestedCategory : 'other';
    let priority = PRIORITY_BY_CATEGORY[category] || 'medium';
    let description = speech || fallbackDescription;
    let aiSummary = '';
    let addressHint = '';
    let reporterName = '';

    if (!speech && recordingUrl) {
      try {
        const transcriptFromRecording = await transcribeRecording({ recordingUrl, language, callSid });
        if (transcriptFromRecording) {
          speech = transcriptFromRecording;
        }
      } catch (transcriptionError) {
        console.error('IVR recording transcription failed:', transcriptionError.message);
      }
    }

    console.log('[IVR] speech', { hasSpeech: Boolean(speech), length: speech.length, hasRecording: Boolean(recordingUrl) });

    if (speech) {
      try {
        const ai = await withTimeout(
          extractIssueWithGemini({
            transcript: speech,
            language,
            fallbackCategory: category
          }),
          IVR_GEMINI_TIMEOUT_MS,
          'gemini'
        );

        if (ai?.category && PRIORITY_BY_CATEGORY[ai.category]) {
          category = ai.category;
        }
        if (ai?.priority && ['low', 'medium', 'high', 'urgent'].includes(ai.priority)) {
          priority = ai.priority;
        } else {
          priority = PRIORITY_BY_CATEGORY[category] || priority;
        }
        if (typeof ai?.description === 'string' && ai.description.trim()) {
          aiSummary = ai.description.trim();
        }
        if (typeof ai?.addressHint === 'string' && ai.addressHint.trim()) {
          addressHint = ai.addressHint.trim();
        }
        if (typeof ai?.reporterName === 'string' && ai.reporterName.trim()) {
          reporterName = ai.reporterName.trim();
        }
      } catch (aiError) {
        console.error('IVR Gemini extraction failed:', aiError.message);
      }
    }

    if (speech && aiSummary) {
      description = `Transcript: ${speech}\nAI Summary: ${aiSummary}`;
    } else if (speech) {
      description = speech;
    } else if (aiSummary) {
      description = aiSummary;
    } else {
      description = fallbackDescription;
    }

    const user = await getOrCreateIvrUser(callerPhone, language);
    if (!user) {
      twimlResponse(res, '<Say>Could not identify caller number. Please try again.</Say><Hangup/>');
      return;
    }

    if (reporterName && user.name.startsWith('IVR Caller')) {
      try {
        await prisma.user.update({
          where: { id: user.id },
          data: { name: reporterName }
        });
        user.name = reporterName;
      } catch (nameUpdateError) {
        console.error('IVR reporter name update failed:', nameUpdateError.message);
      }
    }

    const fallbackAddressParts = [callerCity, callerState, callerCountry].filter(Boolean);
    const fallbackAddress = fallbackAddressParts.length
      ? `Approx caller area: ${fallbackAddressParts.join(', ')}`
      : `Reported via IVR from ${callerPhone || 'unknown number'}`;
    const finalAddress = (addressHint || fallbackAddress || 'Location pending from IVR transcript').trim();
    const finalCity = (callerCity || user.city || DEFAULT_CITY || 'Delhi').trim();

    const report = await prisma.report.create({
      data: {
        reporterId: user.id,
        title: `IVR ${categoryTitle(category)} Report`,
        description,
        category,
        priority,
        address: finalAddress,
        locality: callerCity || undefined,
        city: finalCity,
        latitude: Number.isFinite(user.latitude) ? user.latitude : DEFAULT_LATITUDE,
        longitude: Number.isFinite(user.longitude) ? user.longitude : DEFAULT_LONGITUDE,
        isAnonymous: false,
        statusHistory: {
          create: {
            status: 'submitted',
            changedById: user.id,
            comment: 'Report submitted via IVR'
          }
        }
      }
    });

    const ticketId = report.id.slice(0, 8).toUpperCase();
    const smsText = `Civic Setu: Your complaint ticket ${ticketId} is registered. Track status in app/dashboard.`;
    const normalizedPhone = normalizePhone(callerPhone);

    try {
      await sendTwilioSms(normalizedPhone, smsText);
    } catch (smsError) {
      console.error('IVR SMS send failed:', smsError.message);
    }

    const say = `<Say language="${language === 'hi' ? 'hi-IN' : 'en-IN'}" voice="alice">${escapeXml(thankYouPrompt(language, ticketId))}</Say><Hangup/>`;
    twimlResponse(res, say);
  } catch (error) {
    console.error('IVR finalize error:', error);
    twimlResponse(res, '<Say>We could not register your issue right now. Please try again later.</Say><Hangup/>');
  }
});

router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'IVR endpoints are available',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
