import type { AnalysisResult } from '../types';

export const analyzeNewsletterData = async (csvData: string, userQuery: string): Promise<AnalysisResult> => {
  try {
    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ csvData, userQuery }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("API Error Response:", errorData);
      throw new Error(errorData.error || `Request failed with status ${response.status}`);
    }

    const result: AnalysisResult = await response.json();
    return result;

  } catch (error) {
    console.error("Analysis service call failed:", error);
    throw new Error("Failed to get a valid response from the analysis service. Check the console for details.");
  }
};
