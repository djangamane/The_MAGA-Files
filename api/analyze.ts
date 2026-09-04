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

// Past this, the endpoint fails instead of quietly answering from an archive.
const MAX_DATA_AGE_DAYS = 45;
// Past this, it still answers but flags the age to the caller.
const WARN_DATA_AGE_DAYS = 7;

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

/** Newest newsletter date found in the raw feed, or null if none parse. */
function newestDate(csv: string): Date | null {
  const dates: number[] = [];

  // ISO timestamps in the Date column.
  for (const m of csv.matchAll(/\b(20\d{2})-(\d{2})-(\d{2})T/g)) {
    dates.push(Date.UTC(+m[1], +m[2] - 1, +m[3]));
  }
  // The human date printed inside each newsletter body. The Date column was
  // empty for most rows in the Sheet, so this is the reliable signal.
  const monthRe = new RegExp(`\\b(${MONTHS.join('|')})\\s+(\\d{1,2}),\\s+(20\\d{2})`, 'g');
  for (const m of csv.matchAll(monthRe)) {
    dates.push(Date.UTC(+m[3], MONTHS.indexOf(m[1]), +m[2]));
  }

  if (!dates.length) return null;
  return new Date(Math.max(...dates));
}

function ageInDays(d: Date): number {
  return Math.floor((Date.now() - d.getTime()) / 86_400_000);
}

const PROMPT_HEADER =
  'You are an expert data analyst and sociologist specializing in monitoring ' +
  'and analyzing extremist rhetoric, specifically white supremacy. Your analysis ' +
  'must be exceptionally detailed, nuanced, and academic in tone. You will be ' +
  'given a dataset in CSV format containing newsletter data. Your task is to ' +
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
  const dataUrl = process.env.DATA_SOURCE_URL || process.env.CSV_URL;

  if (!apiKey) {
    return res.status(500).json({
      error: 'Server is not configured: GEMINI_API_KEY is not set.',
    });
  }
  if (!dataUrl) {
    return res.status(500).json({
      error: 'Server is not configured: DATA_SOURCE_URL is not set.',
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
    const csv = await dataRes.text();

    const latest = newestDate(csv);
    const age = latest ? ageInDays(latest) : null;

    if (age !== null && age > MAX_DATA_AGE_DAYS) {
      return res.status(503).json({
        error:
          `The data source has not updated in ${age} days (most recent entry ` +
          `${latest!.toISOString().slice(0, 10)}). Analysis is disabled rather ` +
          `than answering questions about current events from a stale archive.`,
        dataFreshness: {
          latestEntry: latest!.toISOString().slice(0, 10),
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
            `Based on the following CSV data from a series of newsletters, ` +
            `please perform the requested analysis.\n\n` +
            `User Query: "${query}"\n\nCSV Data:\n---\n${csv}\n---\n\n` +
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
