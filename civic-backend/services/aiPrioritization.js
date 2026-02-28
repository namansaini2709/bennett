const prisma = require('../config/db');

// ── Config ──────────────────────────────────────────────────────────
const AI_ENABLED = process.env.AI_PRIORITIZATION_ENABLED !== 'false';
const AI_MODEL = process.env.AI_PRIORITIZATION_MODEL || process.env.IVR_GEMINI_MODEL || 'gemini-2.0-flash';
const AI_TIMEOUT_MS = Number(process.env.AI_PRIORITIZATION_TIMEOUT_MS || 5000);

// Rule-based fallback weights per category
const CATEGORY_WEIGHTS = {
  electricity: 85,
  drainage: 80,
  water_supply: 75,
  road_issue: 65,
  pollution: 55,
  traffic: 50,
  street_light: 50,
  garbage: 40,
  encroachment: 30,
  other: 20
};

const CATEGORY_DEPARTMENTS = {
  road_issue: 'Public Works Department (PWD)',
  water_supply: 'Water Supply Board',
  electricity: 'Electricity Board',
  garbage: 'Sanitation Department',
  drainage: 'Drainage Cell',
  street_light: 'Electrical Maintenance',
  traffic: 'Traffic Police',
  pollution: 'Environment Department',
  encroachment: 'Anti-Encroachment Cell',
  other: 'General Administration'
};

// ── Helpers ─────────────────────────────────────────────────────────

function scoreToPriority(score) {
  if (score >= 76) return 'urgent';
  if (score >= 51) return 'high';
  if (score >= 26) return 'medium';
  return 'low';
}

function safeJsonParse(text) {
  try { return JSON.parse(text); } catch { return null; }
}

function extractJsonBlock(text = '') {
  const trimmed = String(text).trim();
  if (!trimmed) return null;

  const direct = safeJsonParse(trimmed);
  if (direct) return direct;

  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (fenced && fenced[1]) {
    const parsed = safeJsonParse(fenced[1].trim());
    if (parsed) return parsed;
  }

  const firstBrace = trimmed.indexOf('{');
  const lastBrace = trimmed.lastIndexOf('}');
  if (firstBrace >= 0 && lastBrace > firstBrace) {
    return safeJsonParse(trimmed.slice(firstBrace, lastBrace + 1));
  }
  return null;
}

// ── Rule-based fallback ─────────────────────────────────────────────

function ruleBasedPrioritize(reportData) {
  const baseScore = CATEGORY_WEIGHTS[reportData.category] || 20;
  const dept = CATEGORY_DEPARTMENTS[reportData.category] || 'General Administration';

  // Boost if description mentions urgency keywords
  const urgencyKeywords = [
    'danger', 'dangerous', 'accident', 'death', 'dying', 'emergency',
    'flood', 'fire', 'collapse', 'electric shock', 'electrocution',
    'child', 'children', 'hospital', 'school', 'injured', 'injury',
    'immediate', 'urgent', 'critical', 'severe', 'fatal'
  ];

  const descLower = `${reportData.title} ${reportData.description}`.toLowerCase();
  const keywordHits = urgencyKeywords.filter(kw => descLower.includes(kw)).length;
  const keywordBoost = Math.min(keywordHits * 5, 15);

  // Boost for media evidence
  const mediaBoost = reportData.mediaCount > 0 ? 5 : 0;

  const finalScore = Math.min(baseScore + keywordBoost + mediaBoost, 100);

  return {
    priority: scoreToPriority(finalScore),
    priorityScore: finalScore,
    reasoning: `Rule-based: category ${reportData.category} (base ${baseScore}) + keyword urgency (+${keywordBoost}) + media evidence (+${mediaBoost})`,
    suggestedDepartment: dept,
    tags: keywordHits > 0 ? ['keyword_urgency_detected'] : []
  };
}

// ── Gemini AI Analysis ──────────────────────────────────────────────

async function callGemini(reportData) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY not configured');

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${AI_MODEL}:generateContent?key=${apiKey}`;

  const prompt = `You are an expert Indian municipal civic complaint triage AI for the "Civic Setu" platform.
Analyze the following civic complaint and determine its priority.

REPORT DATA:
- Title: ${reportData.title}
- Description: ${reportData.description}
- Category: ${reportData.category}
- Location: ${reportData.address || 'Not specified'}${reportData.city ? ', ' + reportData.city : ''}${reportData.locality ? ', ' + reportData.locality : ''}
- Media attached: ${reportData.mediaCount || 0} file(s)

PRIORITIZATION CRITERIA:
1. **Life Safety** — Risk of injury/death (exposed wires, road cave-ins, flooding) → urgent/high
2. **Public Health** — Contaminated water, sewage overflow, garbage pileup → high
3. **Essential Services** — Power outage, no water supply affecting many → high
4. **Infrastructure Damage** — Potholes, broken roads, drainage blockage → medium/high
5. **Quality of Life** — Street lights out, minor littering, noise → medium/low
6. **Administrative** — Encroachment, minor complaints → low

RETURN STRICT JSON with these exact keys:
{
  "priority": "low | medium | high | urgent",
  "priorityScore": <number 1-100>,
  "reasoning": "<1-2 sentence explanation of why this priority was assigned>",
  "suggestedDepartment": "<the most relevant government department>",
  "tags": ["<relevant tags like: safety_hazard, public_health, infrastructure, essential_service, quality_of_life, environmental, traffic_safety, child_safety>"]
}`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), AI_TIMEOUT_MS);

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.1,
          responseMimeType: 'application/json'
        }
      }),
      signal: controller.signal
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Gemini API failed (${response.status}): ${text}`);
    }

    const data = await response.json();
    const textOutput = data?.candidates?.[0]?.content?.parts
      ?.map(part => part.text || '')
      .join('\n')
      .trim();

    if (!textOutput) throw new Error('Empty Gemini response');

    const parsed = extractJsonBlock(textOutput);
    if (!parsed || typeof parsed !== 'object') throw new Error('Invalid JSON from Gemini');

    // Validate and sanitize
    const validPriorities = ['low', 'medium', 'high', 'urgent'];
    const priority = validPriorities.includes(parsed.priority) ? parsed.priority : 'medium';
    const priorityScore = typeof parsed.priorityScore === 'number'
      ? Math.max(1, Math.min(100, Math.round(parsed.priorityScore)))
      : 50;

    return {
      priority,
      priorityScore,
      reasoning: typeof parsed.reasoning === 'string' ? parsed.reasoning.slice(0, 500) : '',
      suggestedDepartment: typeof parsed.suggestedDepartment === 'string' ? parsed.suggestedDepartment.slice(0, 100) : '',
      tags: Array.isArray(parsed.tags) ? parsed.tags.filter(t => typeof t === 'string').slice(0, 10) : []
    };
  } finally {
    clearTimeout(timeout);
  }
}

// ── Public API ──────────────────────────────────────────────────────

/**
 * Analyze a report and return AI-determined priority data.
 * Falls back to rule-based analysis if Gemini fails or is disabled.
 */
async function analyzeReport(reportData) {
  if (!AI_ENABLED) {
    console.log('[AI-Priority] AI disabled, using rule-based fallback');
    return ruleBasedPrioritize(reportData);
  }

  try {
    const result = await callGemini(reportData);
    console.log(`[AI-Priority] Gemini result: ${result.priority} (score: ${result.priorityScore})`);
    return result;
  } catch (error) {
    console.error('[AI-Priority] Gemini failed, falling back to rules:', error.message);
    return ruleBasedPrioritize(reportData);
  }
}

/**
 * Analyze and update an existing report in the database.
 * Used for re-prioritization by admins.
 */
async function analyzeAndUpdateReport(reportId) {
  const report = await prisma.report.findUnique({
    where: { id: reportId },
    include: { media: { select: { id: true } } }
  });

  if (!report) throw new Error('Report not found');

  const result = await analyzeReport({
    title: report.title,
    description: report.description,
    category: report.category,
    address: report.address,
    city: report.city,
    locality: report.locality,
    mediaCount: report.media?.length || 0
  });

  const updated = await prisma.report.update({
    where: { id: reportId },
    data: {
      priority: result.priority,
      priorityScore: result.priorityScore,
      aiPriorityReasoning: result.reasoning,
      suggestedDepartment: result.suggestedDepartment,
      aiTags: result.tags
    }
  });

  return { report: updated, aiResult: result };
}

/**
 * Bulk re-prioritize reports that haven't been AI-analyzed yet.
 */
async function bulkReprioritize({ limit = 50 } = {}) {
  const reports = await prisma.report.findMany({
    where: {
      isDeleted: false,
      priorityScore: null
    },
    include: { media: { select: { id: true } } },
    take: limit,
    orderBy: { createdAt: 'desc' }
  });

  const results = [];
  for (const report of reports) {
    try {
      const result = await analyzeReport({
        title: report.title,
        description: report.description,
        category: report.category,
        address: report.address,
        city: report.city,
        locality: report.locality,
        mediaCount: report.media?.length || 0
      });

      await prisma.report.update({
        where: { id: report.id },
        data: {
          priority: result.priority,
          priorityScore: result.priorityScore,
          aiPriorityReasoning: result.reasoning,
          suggestedDepartment: result.suggestedDepartment,
          aiTags: result.tags
        }
      });

      results.push({ id: report.id, status: 'success', priority: result.priority, score: result.priorityScore });
    } catch (error) {
      results.push({ id: report.id, status: 'failed', error: error.message });
    }
  }

  return results;
}

module.exports = {
  analyzeReport,
  analyzeAndUpdateReport,
  bulkReprioritize,
  ruleBasedPrioritize,
  scoreToPriority
};
