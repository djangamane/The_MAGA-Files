import { GoogleGenerativeAI } from "@google/generative-ai";
import type { AnalysisResult } from '../types';

// Agent 1: Data Analysis Agent - Focuses on identifying patterns, themes, and trends
const getDataAnalysis = async (model: any, csvData: string, userQuery: string) => {
  const prompt = `
    Act as a Data Analysis Agent. Analyze the following CSV data and answer the user's question with a focus on identifying patterns, themes, and trends.
    
    User's question: ${userQuery}
    
    CSV Data:
    ${csvData}
    
    Provide your analysis in the following JSON format:
    {
      "keyThemes": ["List of key themes found in the data"],
      "emergingTrends": [
        {
          "trend": "Name of the trend",
          "description": "Description of the trend",
          "supportingData": ["List of supporting data points"]
        }
      ]
    }
    
    Important: Respond ONLY with valid JSON in the exact format specified above. Do not include any other text, explanations, or markdown formatting.
  `;
  
  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();
  
  // Clean up and parse JSON
  let cleanedText = text.trim();
  cleanedText = cleanedText.replace(/```json/g, '').replace(/```/g, '').trim();
  
  const jsonStart = cleanedText.indexOf('{');
  const jsonEnd = cleanedText.lastIndexOf('}');
  
  if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
    cleanedText = cleanedText.substring(jsonStart, jsonEnd + 1);
  }
  
  cleanedText = cleanedText.trim();
  
  try {
    return JSON.parse(cleanedText);
  } catch (error) {
    console.error("Failed to parse data analysis response:", cleanedText);
    throw new Error("Failed to parse data analysis response");
  }
};

// Agent 2: Context Agent - Provides historical and contextual insights
const getContextAnalysis = async (model: any, csvData: string, userQuery: string) => {
  const prompt = `
    Act as a Context Agent. Analyze the following CSV data and provide historical and contextual insights related to the user's question.
    
    User's question: ${userQuery}
    
    CSV Data:
    ${csvData}
    
    Provide your analysis in the following JSON format:
    {
      "notableQuotes": [
        {
          "quote": "A notable quote from the data",
          "context": "Context for the quote"
        }
      ],
      "historicalInsights": ["List of historical insights from the data"]
    }
    
    Important: Respond ONLY with valid JSON in the exact format specified above. Do not include any other text, explanations, or markdown formatting.
  `;
  
  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();
  
  // Clean up and parse JSON
  let cleanedText = text.trim();
  cleanedText = cleanedText.replace(/```json/g, '').replace(/```/g, '').trim();
  
  const jsonStart = cleanedText.indexOf('{');
  const jsonEnd = cleanedText.lastIndexOf('}');
  
  if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
    cleanedText = cleanedText.substring(jsonStart, jsonEnd + 1);
  }
  
  cleanedText = cleanedText.trim();
  
  try {
    return JSON.parse(cleanedText);
  } catch (error) {
    console.error("Failed to parse context analysis response:", cleanedText);
    throw new Error("Failed to parse context analysis response");
  }
};

// Agent 3: Synthesis Agent - Combines insights from other agents
const getSynthesisAnalysis = async (model: any, csvData: string, userQuery: string, dataInsights: any, contextInsights: any) => {
  const prompt = `
    Act as a Synthesis Agent. Using the data analysis and context analysis provided, create a comprehensive analysis that answers the user's question.
    
    User's question: ${userQuery}
    
    CSV Data:
    ${csvData}
    
    Data Analysis Insights:
    ${JSON.stringify(dataInsights, null, 2)}
    
    Context Analysis Insights:
    ${JSON.stringify(contextInsights, null, 2)}
    
    Provide your comprehensive analysis in the following JSON format:
    {
      "overallSummary": "A comprehensive summary that combines all insights",
      "dataConnections": "Explanation of connections and patterns in the data, incorporating context"
    }
    
    Important: Respond ONLY with valid JSON in the exact format specified above. Do not include any other text, explanations, or markdown formatting.
  `;
  
  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();
  
  // Clean up and parse JSON
  let cleanedText = text.trim();
  cleanedText = cleanedText.replace(/```json/g, '').replace(/```/g, '').trim();
  
  const jsonStart = cleanedText.indexOf('{');
  const jsonEnd = cleanedText.lastIndexOf('}');
  
  if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
    cleanedText = cleanedText.substring(jsonStart, jsonEnd + 1);
  }
  
  cleanedText = cleanedText.trim();
  
  try {
    return JSON.parse(cleanedText);
  } catch (error) {
    console.error("Failed to parse synthesis analysis response:", cleanedText);
    throw new Error("Failed to parse synthesis analysis response");
  }
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
    
    // Get the generative model
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    
    // Run the three agents in parallel for efficiency
    const [dataInsights, contextInsights] = await Promise.all([
      getDataAnalysis(model, csvData, userQuery),
      getContextAnalysis(model, csvData, userQuery)
    ]);
    
    // Run the synthesis agent with the results from the first two agents
    const synthesisInsights = await getSynthesisAnalysis(model, csvData, userQuery, dataInsights, contextInsights);
    
    // Combine all insights into the final result
    const analysisResult: AnalysisResult = {
      overallSummary: synthesisInsights.overallSummary,
      keyThemes: dataInsights.keyThemes || [],
      emergingTrends: dataInsights.emergingTrends || [],
      notableQuotes: contextInsights.notableQuotes || [],
      dataConnections: synthesisInsights.dataConnections
    };
    
    return analysisResult;

  } catch (error) {
    console.error("Analysis service call failed:", error);
    throw new Error(`Failed to get a valid response from the analysis service: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};