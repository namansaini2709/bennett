const prisma = require('../config/db');

// ── Config ──────────────────────────────────────────────────────────
const AI_ENABLED = process.env.AI_PRIORITIZATION_ENABLED !== 'false';
const AI_MODEL = process.env.AI_PRIORITIZATION_MODEL || process.env.IVR_GEMINI_MODEL || 'gemini-2.0-flash';
const AI_TIMEOUT_MS = Number(process.env.AI_PRIORITIZATION_TIMEOUT_MS || 10000);
const NEARBY_RADIUS_KM = Number(process.env.AI_NEARBY_RADIUS_KM || 2);

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

const VALID_CATEGORIES = [
  'road_issue', 'water_supply', 'electricity', 'garbage',
  'drainage', 'street_light', 'traffic', 'pollution',
  'encroachment', 'other'
];

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

// ── Fetch image as base64 for Gemini Vision ─────────────────────────

async function fetchImageAsBase64(imageUrl) {
  try {
    const response = await fetch(imageUrl);
    if (!response.ok) throw new Error(`Failed to fetch image: ${response.status}`);

    const contentType = response.headers.get('content-type') || 'image/jpeg';
    const arrayBuffer = await response.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');

    // Only use supported MIME types for Gemini
    const mimeType = contentType.startsWith('image/') ? contentType.split(';')[0] : 'image/jpeg';

    return { base64, mimeType };
  } catch (error) {
    console.error('[AI-Vision] Failed to fetch image:', error.message);
    return null;
  }
}

// ── Nearby Report Clustering ────────────────────────────────────────

async function countNearbyReports({ latitude, longitude, category, radiusKm = NEARBY_RADIUS_KM }) {
  if (!latitude || !longitude) return 0;

  try {
    // Haversine-based nearby count using raw SQL
    const result = await prisma.$queryRaw`
      SELECT COUNT(*)::int as count
      FROM "Report"
      WHERE "isDeleted" = false
        AND "status" NOT IN ('resolved', 'closed', 'rejected')
        AND "category" = ${category}::"Category"
        AND (
          6371 * acos(
            LEAST(1.0, cos(radians(${latitude})) * cos(radians("latitude")) * cos(radians("longitude") - radians(${longitude}))
            + sin(radians(${latitude})) * sin(radians("latitude")))
          )
        ) < ${radiusKm}
    `;

    return result[0]?.count || 0;
  } catch (error) {
    console.error('[AI-Cluster] Nearby query failed:', error.message);
    return 0;
  }
}

// ── Rule-based fallback ─────────────────────────────────────────────

function ruleBasedPrioritize(reportData) {
  const baseScore = CATEGORY_WEIGHTS[reportData.category] || 20;
  const dept = CATEGORY_DEPARTMENTS[reportData.category] || 'General Administration';

  const urgencyKeywords = [
    'danger', 'dangerous', 'accident', 'death', 'dying', 'emergency',
    'flood', 'fire', 'collapse', 'electric shock', 'electrocution',
    'child', 'children', 'hospital', 'school', 'injured', 'injury',
    'immediate', 'urgent', 'critical', 'severe', 'fatal'
  ];

  const descLower = `${reportData.title} ${reportData.description}`.toLowerCase();
  const keywordHits = urgencyKeywords.filter(kw => descLower.includes(kw)).length;
  const keywordBoost = Math.min(keywordHits * 5, 15);
  const mediaBoost = reportData.mediaCount > 0 ? 5 : 0;
  const clusterBoost = Math.min((reportData.nearbyCount || 0) * 5, 20);

  const finalScore = Math.min(baseScore + keywordBoost + mediaBoost + clusterBoost, 100);

  return {
    priority: scoreToPriority(finalScore),
    priorityScore: finalScore,
    category: reportData.category,
    reasoning: `Rule-based: category ${reportData.category} (base ${baseScore}) + keyword urgency (+${keywordBoost}) + media (+${mediaBoost}) + ${reportData.nearbyCount || 0} nearby similar reports (+${clusterBoost})`,
    suggestedDepartment: dept,
    tags: keywordHits > 0 ? ['keyword_urgency_detected'] : []
  };
}

// ── Gemini AI Vision Analysis ───────────────────────────────────────

async function callGemini(reportData) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY not configured');

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${AI_MODEL}:generateContent?key=${apiKey}`;

  const nearbyInfo = reportData.nearbyCount > 0
    ? `\n- Similar reports nearby (within ${NEARBY_RADIUS_KM}km): ${reportData.nearbyCount} report(s) — this indicates a WIDESPREAD issue and should BOOST priority significantly.`
    : '';

  const imageInfo = reportData.imageUrls && reportData.imageUrls.length > 0
    ? `\n- Photos attached: ${reportData.imageUrls.length} image(s) — CAREFULLY ANALYZE the images to determine the ACTUAL issue type, severity, and affected area.`
    : '';

  const prompt = `You are an expert Indian municipal civic complaint triage AI for the "Civic Setu" platform.

YOUR PRIMARY JOB: Look at the uploaded photo(s) carefully and determine what civic issue this is, how severe it is, and which department should handle it.

REPORT DATA:
- Title: ${reportData.title || 'Not provided'}
- Description: ${reportData.description || 'Not provided'}
- Category selected by citizen: ${reportData.category || 'other'}
- Location: ${reportData.address || 'Not specified'}${reportData.city ? ', ' + reportData.city : ''}${reportData.locality ? ', ' + reportData.locality : ''}${imageInfo}${nearbyInfo}

IMPORTANT INSTRUCTIONS:
1. If photo(s) are attached, OVERRIDE the citizen's category selection if the image clearly shows a different issue type. For example:
   - Image shows a pothole → category should be "road_issue" regardless of what citizen selected
   - Image shows overflowing garbage → category should be "garbage"
   - Image shows broken street light → category should be "street_light"
   - Image shows waterlogging → category should be "drainage"
   - Image shows exposed electric wires → category should be "electricity" with URGENT priority
   - Image shows sewage overflow → category should be "drainage" with HIGH priority

2. SEVERITY from image: Judge how bad the issue is from the photo:
   - Minor cosmetic damage → low (1-25)
   - Moderate issue affecting daily life → medium (26-50)
   - Significant damage or safety concern → high (51-75)
   - Immediate danger to life/property → urgent (76-100)

3. NEARBY REPORTS BOOST: If there are similar reports nearby, this is a WIDESPREAD issue — boost the score by 5 per nearby report (up to +20).

ALLOWED CATEGORIES: road_issue, water_supply, electricity, garbage, drainage, street_light, traffic, pollution, encroachment, other

RETURN STRICT JSON:
{
  "category": "<the CORRECT category based on image analysis — may differ from citizen's selection>",
  "priority": "low | medium | high | urgent",
  "priorityScore": <number 1-100>,
  "reasoning": "<What you see in the image, why this category and priority>",
  "suggestedDepartment": "<the department that should handle this>",
  "tags": ["<relevant tags: pothole, waterlogging, exposed_wires, garbage_dump, broken_road, sewage, fallen_tree, safety_hazard, public_health, etc.>"],
  "severityFromImage": "<what the image shows and how severe it looks>"
}`;

  // Build parts array — text + images
  const parts = [{ text: prompt }];

  // Add images as inline_data for Gemini Vision
  if (reportData.imageUrls && reportData.imageUrls.length > 0) {
    // Limit to 3 images to keep request size reasonable
    const imagesToProcess = reportData.imageUrls.slice(0, 3);

    for (const url of imagesToProcess) {
      const imageData = await fetchImageAsBase64(url);
      if (imageData) {
        parts.push({
          inline_data: {
            mime_type: imageData.mimeType,
            data: imageData.base64
          }
        });
        console.log(`[AI-Vision] Added image to analysis: ${url.substring(0, 60)}...`);
      }
    }
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), AI_TIMEOUT_MS);

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts }],
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
    const aiCategory = VALID_CATEGORIES.includes(parsed.category) ? parsed.category : reportData.category;

    return {
      category: aiCategory,
      priority,
      priorityScore,
      reasoning: typeof parsed.reasoning === 'string' ? parsed.reasoning.slice(0, 500) : '',
      suggestedDepartment: typeof parsed.suggestedDepartment === 'string' ? parsed.suggestedDepartment.slice(0, 100) : '',
      tags: Array.isArray(parsed.tags) ? parsed.tags.filter(t => typeof t === 'string').slice(0, 10) : [],
      severityFromImage: typeof parsed.severityFromImage === 'string' ? parsed.severityFromImage.slice(0, 300) : ''
    };
  } finally {
    clearTimeout(timeout);
  }
}

// ── Public API ──────────────────────────────────────────────────────

/**
 * Analyze a report (with optional images) and return AI-determined
 * category, priority, department, tags, and reasoning.
 * Falls back to rule-based analysis if Gemini fails or is disabled.
 */
async function analyzeReport(reportData) {
  // Count nearby similar reports for cluster-based priority boost
  if (reportData.latitude && reportData.longitude) {
    try {
      reportData.nearbyCount = await countNearbyReports({
        latitude: reportData.latitude,
        longitude: reportData.longitude,
        category: reportData.category
      });
      if (reportData.nearbyCount > 0) {
        console.log(`[AI-Cluster] Found ${reportData.nearbyCount} similar reports within ${NEARBY_RADIUS_KM}km`);
      }
    } catch (err) {
      console.error('[AI-Cluster] Error:', err.message);
      reportData.nearbyCount = 0;
    }
  }

  if (!AI_ENABLED) {
    console.log('[AI-Priority] AI disabled, using rule-based fallback');
    return ruleBasedPrioritize(reportData);
  }

  try {
    const result = await callGemini(reportData);
    console.log(`[AI-Vision] Result: category=${result.category}, priority=${result.priority} (score: ${result.priorityScore})`);
    return result;
  } catch (error) {
    console.error('[AI-Priority] Gemini failed, falling back to rules:', error.message);
    return ruleBasedPrioritize(reportData);
  }
}

/**
 * Analyze and update an existing report in the database.
 * Fetches media URLs for vision analysis.
 */
async function analyzeAndUpdateReport(reportId) {
  const report = await prisma.report.findUnique({
    where: { id: reportId },
    include: { media: { select: { id: true, url: true, type: true } } }
  });

  if (!report) throw new Error('Report not found');

  // Get image URLs for vision analysis
  const imageUrls = (report.media || [])
    .filter(m => m.type === 'image')
    .map(m => m.url);

  const result = await analyzeReport({
    title: report.title,
    description: report.description,
    category: report.category,
    address: report.address,
    city: report.city,
    locality: report.locality,
    latitude: report.latitude,
    longitude: report.longitude,
    mediaCount: report.media?.length || 0,
    imageUrls
  });

  const updated = await prisma.report.update({
    where: { id: reportId },
    data: {
      category: result.category,
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
    include: { media: { select: { id: true, url: true, type: true } } },
    take: limit,
    orderBy: { createdAt: 'desc' }
  });

  const results = [];
  for (const report of reports) {
    try {
      const imageUrls = (report.media || [])
        .filter(m => m.type === 'image')
        .map(m => m.url);

      const result = await analyzeReport({
        title: report.title,
        description: report.description,
        category: report.category,
        address: report.address,
        city: report.city,
        locality: report.locality,
        latitude: report.latitude,
        longitude: report.longitude,
        mediaCount: report.media?.length || 0,
        imageUrls
      });

      await prisma.report.update({
        where: { id: report.id },
        data: {
          category: result.category,
          priority: result.priority,
          priorityScore: result.priorityScore,
          aiPriorityReasoning: result.reasoning,
          suggestedDepartment: result.suggestedDepartment,
          aiTags: result.tags
        }
      });

      results.push({ id: report.id, status: 'success', category: result.category, priority: result.priority, score: result.priorityScore });
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
