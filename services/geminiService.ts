import { GoogleGenerativeAI } from "@google/generative-ai";
import type { AnalysisResult } from '../types';

// Initialize Google Generative AI with your API key
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);

export const analyzeNewsletterData = async (csvData: string, userQuery: string): Promise<AnalysisResult> => {
  try {
    // Get the generative model
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    // Create a prompt that combines the CSV data with the user's query
    const prompt = `
      Analyze the following CSV data and answer the user's question.
      
      User's question: ${userQuery}
      
      CSV Data:
      ${csvData}
      
      Please provide your analysis in the following JSON format:
      {
        "overallSummary": "A brief overall summary of the data",
        "keyThemes": ["List of key themes found in the data"],
        "emergingTrends": [
          {
            "trend": "Name of the trend",
            "description": "Description of the trend",
            "supportingData": ["List of supporting data points"]
          }
        ],
        "notableQuotes": [
          {
            "quote": "A notable quote from the data",
            "context": "Context for the quote"
          }
        ],
        "dataConnections": "Explanation of connections and patterns in the data"
      }
      
      Important: Respond ONLY with valid JSON in the exact format specified above. Do not include any other text.
    `;
    
    // Generate content
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Parse the JSON response
    try {
      // Clean up the response text to ensure it's valid JSON
      const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const analysisResult: AnalysisResult = JSON.parse(cleanedText);
      return analysisResult;
    } catch (parseError) {
      console.error("Failed to parse JSON response:", text);
      throw new Error("Failed to parse analysis response. The AI returned invalid JSON.");
    }

  } catch (error) {
    console.error("Analysis service call failed:", error);
    throw new Error(`Failed to get a valid response from the analysis service: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};