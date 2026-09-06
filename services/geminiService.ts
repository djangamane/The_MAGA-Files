import type { AnalysisResult } from '../types';

/**
 * Calls the server-side analysis endpoint.
 *
 * This file used to hold a GoogleGenerativeAI client keyed on
 * `import.meta.env.VITE_GEMINI_API_KEY`. Vite inlines every VITE_-prefixed
 * variable into the client bundle, so that key was readable by anyone who
 * opened devtools on maga.talk2keisha.com. The key and the data source now
 * live in `api/analyze.ts` and never reach the browser.
 */

export interface DataFreshness {
  latestEntry: string | null;
  ageInDays: number | null;
  stale: boolean;
}

export interface AnalysisResponse {
  result: AnalysisResult;
  dataFreshness: DataFreshness;
}

/**
 * The CSV is fetched server-side now, so the caller only supplies the query.
 * Throws with the server's message on failure, including the stale-data case.
 */
export const analyzeNewsletterData = async (
  userQuery: string
): Promise<AnalysisResponse> => {
  const response = await fetch('/api/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: userQuery }),
  });

  let payload: any = null;
  try {
    payload = await response.json();
  } catch {
    throw new Error(`Analysis service returned an unreadable response (${response.status}).`);
  }

  if (!response.ok) {
    throw new Error(payload?.error || `Analysis failed with status ${response.status}.`);
  }

  return payload as AnalysisResponse;
};
