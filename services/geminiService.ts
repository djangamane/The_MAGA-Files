import { GoogleGenerativeAI } from "@google/generative-ai";
import type { AnalysisResult } from '../types';

// Define the analysis schema for structured output
const analysisSchema = {
  "type": "object",
  "properties": {
    "overallSummary": { "type": "string" },
    "keyThemes": {
      "type": "array",
      "items": { "type": "string" }
    },
    "emergingTrends": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "trend": { "type": "string" },
          "description": { "type": "string" },
          "supportingData": {
            "type": "array",
            "items": { "type": "string" }
          }
        },
        "required": ["trend", "description", "supportingData"]
      }
    },
    "notableQuotes": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "quote": { "type": "string" },
          "context": { "type": "string" }
        },
        "required": ["quote", "context"]
      }
    },
    "dataConnections": { "type": "string" }
  },
  "required": ["overallSummary", "keyThemes", "emergingTrends", "notableQuotes", "dataConnections"]
};

export const analyzeNewsletterData = async (csvData: string, userQuery: string): Promise<AnalysisResult> => {
  try {
    // Check if API key is available
    const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
    if (!API_KEY) {
      throw new Error("VITE_GEMINI_API_KEY is not set. Please add your Google Generative AI API key to your environment variables.");
    }

    // Initialize Google Generative AI with your API key
    const genAI = new GoogleGenerativeAI(API_KEY);
    
    // Create the prompt that combines the CSV data with the user's query
    const prompt = `
      Analyze the following CSV data and answer the user's question.
      
      User's question: ${userQuery}
      
      CSV Data:
      ${csvData}
    `;
    
    // Generate content with structured output configuration
    const response = await genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: "You are an expert data analyst and sociologist specializing in monitoring and analyzing extremist rhetoric, specifically white supremacy. Your analysis must be exceptionally detailed, nuanced, and academic in tone. You will be given a dataset in CSV format containing newsletter data. Your task is to analyze this data based on the user's prompt and provide deep, comprehensive, and structured insights. The output must be in JSON format, strictly adhering to the provided schema. Do not include markdown formatting like ```json in your response. Prioritize depth and thoroughness in all fields, especially the 'overallSummary' and 'description' for trends.",
    }).generateContent({
      contents: [{
        role: "user",
        parts: [{ text: prompt }]
      }],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: analysisSchema,
        temperature: 0.2,
      },
    });
    
    const result = await response.response;
    const text = result.text();
    
    // Log the raw response for debugging
    console.log("Raw AI response:", text);
    
    // Parse the JSON response
    try {
      const analysisResult: AnalysisResult = JSON.parse(text);
      return analysisResult;
    } catch (parseError) {
      console.error("Failed to parse JSON response:", text);
      throw new Error(`Failed to parse analysis response. The AI returned invalid JSON. Response: ${text.substring(0, 500)}...`);
    }

  } catch (error) {
    console.error("Analysis service call failed:", error);
    throw new Error(`Failed to get a valid response from the analysis service: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};