import { GoogleGenerativeAI } from "@google/generative-ai";
import type { AnalysisResult } from '../types';

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
    
    // Create a prompt that combines the CSV data with the user's query
    const prompt = `
      Act as an expert research analyst with advanced expertise in political science, sociology, and data analysis. Your task is to conduct a rigorous, academic-level analysis of the provided CSV data in response to the user's question.
      
      Approach this with the analytical depth and methodological rigor of a senior academic researcher. Provide detailed, nuanced insights that demonstrate sophisticated understanding of complex political and social dynamics. Your analysis should be thorough, evidence-based, and exhibit scholarly rigor.
      
      User's question: ${userQuery}
      
      CSV Data:
      ${csvData}
      
      Please provide your analysis in the following JSON format:
      {
        "overallSummary": "A comprehensive, scholarly-level summary of the data that demonstrates deep analytical understanding. This should synthesize key insights into a coherent narrative with academic rigor.",
        "keyThemes": ["List of key themes found in the data, each explained with detailed analysis of their significance and implications"],
        "emergingTrends": [
          {
            "trend": "Name of the trend with academic-level specificity and precision",
            "description": "Comprehensive description of the trend, including its potential causes, implications, historical context, and significance. Provide detailed analysis that would be valuable to a researcher or policy analyst.",
            "supportingData": ["List of specific data points that support this trend, with contextual details and analytical significance"]
          }
        ],
        "notableQuotes": [
          {
            "quote": "A particularly significant or revealing quote from the data, selected for its analytical value and insight into broader patterns",
            "context": "Deep contextual analysis of the quote, including its historical significance, rhetorical strategies employed, ideological implications, and broader social or political meaning"
          }
        ],
        "dataConnections": "Detailed explanation of connections and patterns in the data. Explain how different elements relate to each other, what the identified trends reveal about broader dynamics, and how the quotes illuminate key themes. Provide sophisticated analytical insights."
      }
      
      Important: Respond ONLY with valid JSON in the exact format specified above. Do not include any other text, explanations, or markdown formatting. Ensure your analysis is thorough, detailed, and exhibits academic rigor. Prioritize depth and analytical sophistication over brevity. Keep your response under 10000 characters to ensure proper formatting.
    `;
    
    // Generate content
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Parse the JSON response
    try {
      // Clean up the response text to ensure it's valid JSON
      let cleanedText = text.trim();
      
      // Remove any markdown code block indicators
      cleanedText = cleanedText.replace(/```json/g, '').replace(/```/g, '').trim();
      
      // If there are multiple JSON objects, take the first one
      const jsonStart = cleanedText.indexOf('{');
      const jsonEnd = cleanedText.lastIndexOf('}');
      
      if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
        cleanedText = cleanedText.substring(jsonStart, jsonEnd + 1);
      }
      
      // Remove any leading/trailing whitespace
      cleanedText = cleanedText.trim();
      
      // Log the raw response for debugging
      console.log("Raw AI response:", cleanedText);
      
      // Try to parse the JSON
      const analysisResult: AnalysisResult = JSON.parse(cleanedText);
      return analysisResult;
    } catch (parseError) {
      console.error("Failed to parse JSON response:", text);
      // Try to extract JSON from the response using regex
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          const analysisResult: AnalysisResult = JSON.parse(jsonMatch[0]);
          return analysisResult;
        } catch (secondParseError) {
          console.error("Second parsing attempt failed:", secondParseError);
        }
      }
      
      // If parsing still fails, try to create a partial result from available data
      try {
        // Attempt to extract partial information
        const partialResult: AnalysisResult = {
          overallSummary: "Analysis completed but response was too complex to fully parse. Please try a more specific query for detailed results.",
          keyThemes: [],
          emergingTrends: [],
          notableQuotes: [],
          dataConnections: "The AI returned a detailed analysis but the response was too long or complex to parse completely. This often happens when the dataset is very rich and the AI provides extensive academic-level insights."
        };
        
        // Try to extract any usable parts
        if (text.includes('"overallSummary"')) {
          const summaryMatch = text.match(/"overallSummary"\s*:\s*"([^"]+)"/);
          if (summaryMatch && summaryMatch[1]) {
            partialResult.overallSummary = summaryMatch[1].substring(0, 500) + "...";
          }
        }
        
        return partialResult;
      } catch (partialError) {
        console.error("Failed to create partial result:", partialError);
      }
      
      throw new Error(`Failed to parse analysis response. The AI returned invalid JSON. Response: ${text.substring(0, 500)}...`);
    }

  } catch (error) {
    console.error("Analysis service call failed:", error);
    throw new Error(`Failed to get a valid response from the analysis service: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};