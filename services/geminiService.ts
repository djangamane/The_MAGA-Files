import { GoogleGenerativeAI } from "@google/generative-ai";
import type { AnalysisResult } from '../types';

export const analyzeNewsletterData = async (csvData: string, userQuery: string): Promise<AnalysisResult> => {
  // Check if API key is available
  const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
  if (!API_KEY) {
    throw new Error("VITE_GEMINI_API_KEY is not set. Please add your Google Generative AI API key to your environment variables.");
  }

  const genAI = new GoogleGenerativeAI(API_KEY);

  const prompt = `
    You are an expert data analyst and sociologist specializing in monitoring and analyzing extremist rhetoric, specifically white supremacy. Your analysis must be exceptionally detailed, nuanced, and academic in tone. You will be given a dataset in CSV format containing newsletter data. Your task is to analyze this data based on the user's prompt and provide deep, comprehensive, and structured insights. The output must be in JSON format, strictly adhering to the provided schema. Do not include markdown formatting like \`\`\`json in your response. Prioritize depth and thoroughness in all fields, especially the 'overallSummary' and 'description' for trends.
    
    Based on the following CSV data from a series of newsletters, please perform the requested analysis.
    
    User Query: "${userQuery}"

    CSV Data:
    ---
    ${csvData}
    ---
    
    Please provide your analysis in the following JSON format:
    {
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
        {
          "quote": "The verbatim quote.",
          "context": "The source or context of the quote (e.g., newsletter title, date, or section)."
        }
      ],
      "dataConnections": "An analysis of how different data points, themes, or trends connect to each other to form a larger narrative or pattern."
    }
  `;

  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
    });

    const result = await model.generateContent({
      contents: [{
        role: "user",
        parts: [{ text: prompt }]
      }],
      generationConfig: {
        temperature: 0.2,
        responseMimeType: "application/json",
      },
    });

    const jsonText = (await result.response).text.trim();
    const parsedResult: AnalysisResult = JSON.parse(jsonText);
    return parsedResult;

  } catch (error) {
    console.error("Gemini API call failed:", error);
    throw new Error("Failed to get a valid response from the Gemini API.");
  }
};