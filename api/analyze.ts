/**
 * Server-side analysis endpoint.
 *
 * Two things live here that used to live in the browser bundle:
 *
 *   1. The Gemini API key. Vite inlines every VITE_-prefixed variable into the
 *      client bundle, so `VITE_GEMINI_API_KEY` was readable by any visitor to
 *      maga.talk2keisha.com. It must never carry the VITE_ prefix again.
 *   2. The data source URL. Keeping it server-side means the source can be
 *      re-pointed without a rebuild, and lets us check freshness before
 *      spending a model call on stale data.
 *
 * On freshness: the previous source (a published Google Sheet) stopped
 * updating on 2026-02-26 and nobody noticed for 189 days, because nothing
 * checked. The endpoint now reports the age of the data it used, and refuses
 * outright past MAX_DATA_AGE_DAYS. Answering a question about "today's news"
 * from a six-month-old archive without saying so is worse than failing.
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

const MODEL = 'gemini-2.5-flash';

// The Fragile News Source blog API, fed daily by the soWSnewsletter GitHub
// Action. Public, no auth, and it reports its own `staleDays` — which is why
// it is the default rather than the Google Sheet this used to read.
//
// It is currently shallow: ingest only began 2026-09-01, so it holds a handful
// of issues and deepens by one a day. The 562-issue back catalogue lives in
// soWSnewsletter/docs and can be pushed through POST /api/blog/ingest to
// backfill it. Until that happens, expect analyses to reflect recent coverage
// rather than the full archive.
const DEFAULT_DATA_SOURCE = 'https://fns-news.onrender.com/api/blog?limit=400';

// Past this, the endpoint fails instead of quietly answering from an archive.
const MAX_DATA_AGE_DAYS = 45;
// Past this, it still answers but flags the age to the caller.
const WARN_DATA_AGE_DAYS = 7;

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

/** Newest newsletter date found in the raw feed, or null if none parse. */
function newestDate(raw: string): Date | null {
  const dates: number[] = [];

  // ISO timestamps — the Sheet's Date column, and publishedAt in the blog API.
  for (const m of raw.matchAll(/\b(20\d{2})-(\d{2})-(\d{2})(?:T|"|\b)/g)) {
    dates.push(Date.UTC(+m[1], +m[2] - 1, +m[3]));
  }
  // The human date printed inside each newsletter body. The Sheet's Date
  // column was empty for most rows, so this is the reliable signal there.
  const monthRe = new RegExp(`\\b(${MONTHS.join('|')})\\s+(\\d{1,2}),\\s+(20\\d{2})`, 'g');
  for (const m of raw.matchAll(monthRe)) {
    dates.push(Date.UTC(+m[3], MONTHS.indexOf(m[1]), +m[2]));
  }

  if (!dates.length) return null;
  return new Date(Math.max(...dates));
}

/**
 * Normalise whatever the source returns into text for the model, plus the
 * best available age signal.
 *
 * Two shapes are supported. The blog API returns JSON and computes its own
 * `staleDays`, which is authoritative and used in preference to date-scraping.
 * The legacy Google Sheet returns CSV, where the age has to be inferred.
 */
function normalise(raw: string): { text: string; ageInDays: number | null; latest: Date | null } {
  const trimmed = raw.trimStart();

  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    try {
      const parsed = JSON.parse(trimmed);
      const entries = Array.isArray(parsed) ? parsed : parsed?.entries;

      if (Array.isArray(entries) && entries.length) {
        const text = entries
          .map((e: any) => {
            const date = e?.publishedAt || e?.id || '';
            const body = e?.newsletter || e?.body || e?.content || '';
            const links = Array.isArray(e?.relatedArticles)
              ? e.relatedArticles.join('\n')
              : e?.relatedArticles || '';
            return `--- ISSUE ${date} ---\n${body}\n${links}`.trim();
          })
          .join('\n\n');

        const reported = typeof parsed?.staleDays === 'number' ? parsed.staleDays : null;
        const latest = newestDate(trimmed);
        return {
          text,
          ageInDays: reported ?? (latest ? ageInDays(latest) : null),
          latest,
        };
      }
    } catch {
      // Malformed JSON: fall through and treat it as opaque text.
    }
  }

  const latest = newestDate(raw);
  return { text: raw, ageInDays: latest ? ageInDays(latest) : null, latest };
}

function ageInDays(d: Date): number {
  return Math.floor((Date.now() - d.getTime()) / 86_400_000);
}

const PROMPT_HEADER =
  'You are an expert data analyst and sociologist specializing in monitoring ' +
  'and analyzing extremist rhetoric, specifically white supremacy. Your analysis ' +
  'must be exceptionally detailed, nuanced, and academic in tone. You will be ' +
  'given a dataset containing newsletter data. Your task is to ' +
  "analyze this data based on the user's prompt and provide deep, comprehensive, " +
  'and structured insights. The output must be in JSON format, strictly adhering ' +
  'to the provided schema. Do not include markdown formatting like ```json in ' +
  "your response. Prioritize depth and thoroughness in all fields, especially " +
  "the 'overallSummary' and 'description' for trends.";

const SCHEMA = `{
  "overallSummary": "A high-level academic summary of the findings based on the user's query and the provided data.",
  "keyThemes": ["A list of the most prominent, recurring themes or topics discovered in the data relevant to the query."],
  "emergingTrends": [
    {
      "trend": "A concise name for the trend.",
      "description": "A detailed explanation of the trend and its significance.",
      "supportingData": ["A few direct snippets or phrases from the data that exemplify this trend."]
    }
  ],
  "notableQuotes": [
    { "quote": "The verbatim quote.", "context": "The source or context of the quote (e.g., newsletter title, date, or section)." }
  ],
  "dataConnections": "An analysis of how different data points, themes, or trends connect to each other to form a larger narrative or pattern."
}`;

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  const dataUrl = process.env.DATA_SOURCE_URL || process.env.CSV_URL || DEFAULT_DATA_SOURCE;

  if (!apiKey) {
    return res.status(500).json({
      error: 'Server is not configured: GEMINI_API_KEY is not set.',
    });
  }
  const query = typeof req.body === 'string'
    ? (JSON.parse(req.body || '{}').query)
    : req.body?.query;

  if (!query || typeof query !== 'string' || !query.trim()) {
    return res.status(400).json({ error: 'A non-empty "query" is required.' });
  }
  if (query.length > 2000) {
    return res.status(400).json({ error: 'Query is too long.' });
  }

  try {
    const dataRes = await fetch(dataUrl, { redirect: 'follow' });
    if (!dataRes.ok) {
      return res.status(502).json({
        error: `Data source returned ${dataRes.status}. The archive may have moved or been retired.`,
      });
    }
    const { text: corpus, ageInDays: age, latest } = normalise(await dataRes.text());

    if (!corpus.trim()) {
      return res.status(502).json({
        error: 'The data source returned no usable content.',
      });
    }

    if (age !== null && age > MAX_DATA_AGE_DAYS) {
      return res.status(503).json({
        error:
          `The data source has not updated in ${age} days (most recent entry ` +
          `${latest!.toISOString().slice(0, 10)}). Analysis is disabled rather ` +
          `than answering questions about current events from a stale archive.`,
        dataFreshness: {
          latestEntry: latest ? latest.toISOString().slice(0, 10) : null,
          ageInDays: age,
          stale: true,
        },
      });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: MODEL });

    const result = await model.generateContent({
      contents: [{
        role: 'user',
        parts: [{
          text:
            `${PROMPT_HEADER}\n\n` +
            `Based on the following newsletter archive, please perform the ` +
            `requested analysis.\n\n` +
            `User Query: "${query}"\n\nNewsletter data:\n---\n${corpus}\n---\n\n` +
            `Please provide your analysis in the following JSON format:\n${SCHEMA}`,
        }],
      }],
      generationConfig: { temperature: 0.2, responseMimeType: 'application/json' },
    });

    const parsed = JSON.parse((await result.response).text().trim());

    return res.status(200).json({
      result: parsed,
      dataFreshness: {
        latestEntry: latest ? latest.toISOString().slice(0, 10) : null,
        ageInDays: age,
        stale: age !== null && age > WARN_DATA_AGE_DAYS,
      },
    });
  } catch (err: any) {
    console.error('analyze failed:', err?.message || err);
    return res.status(500).json({
      error: 'Analysis failed. Please try again.',
    });
  }
}
