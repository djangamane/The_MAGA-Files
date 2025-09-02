import React, { useState, useCallback } from 'react';
import { AnalysisDashboard } from './components/AnalysisDashboard';
import { AnalysisResults } from './components/AnalysisResults';
import { ResearchPaperSection } from './components/ResearchPaperSection';
import { WhyItMattersSection } from './components/WhyItMattersSection';
import { MonetizationSection } from './components/MonetizationSection';
import { LoadingSpinner } from './components/LoadingSpinner';
import { Logo } from './components/Logo';

import type { AnalysisResult, Trend, NotableQuote } from './types';
import { analyzeNewsletterData } from './services/geminiService';

// The CSV URL is now managed via environment variables for easy configuration on Vercel.
const CSV_URL = import.meta.env.VITE_CSV_URL;

const App: React.FC = () => {
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [currentQuery, setCurrentQuery] = useState<string>('');

  // Agent 1: Data Pattern Analysis - Focuses on identifying patterns, themes, and trends
  const performPatternAnalysis = useCallback(async (csvData: string, userQuery: string) => {
    const patternPrompt = `
      Act as a Data Pattern Analyst Agent with expertise in sociological and political data analysis. Your role is to conduct a rigorous, academic-level analysis of patterns, themes, and trends in the provided CSV data in response to the user's question.
      
      Approach this task with the thoroughness of a graduate-level researcher. Identify subtle patterns, emerging trends, and underlying themes that might not be immediately obvious. Provide detailed, nuanced insights that would be valuable to an academic researcher or policy analyst.
      
      User's question: ${userQuery}
      
      CSV Data:
      ${csvData.substring(0, 5000)} // Limit data size to prevent overly long responses
      
      Please provide your analysis in the following JSON format:
      {
        "keyThemes": ["List of key themes found in the data, with detailed explanations of their significance"],
        "emergingTrends": [
          {
            "trend": "Name of the trend with academic-level specificity",
            "description": "Comprehensive description of the trend, including its potential causes, implications, and significance",
            "supportingData": ["List of specific data points that support this trend, with contextual details"]
          }
        ]
      }
      
      Important: Respond ONLY with valid JSON in the exact format specified above. Do not include any other text, explanations, or markdown formatting. Ensure your analysis is thorough, detailed, and exhibits academic rigor. Keep your response under 8000 characters.
    `;
    
    // Create a specialized version of the analysis with the pattern-focused prompt
    return await analyzeNewsletterData(csvData, patternPrompt);
  }, []);

  // Agent 2: Context Analysis - Provides historical and contextual insights
  const performContextAnalysis = useCallback(async (csvData: string, userQuery: string) => {
    const contextPrompt = `
      Act as a Context Analyst Agent with expertise in historical analysis and political science. Your role is to provide deep, scholarly-level historical and contextual insights from the provided CSV data in response to the user's question.
      
      Approach this with the analytical depth of a PhD-level historian or political scientist. Go beyond surface-level observations to provide nuanced historical context, trace the evolution of ideas or rhetoric, and identify significant events or shifts in the data. Your analysis should demonstrate sophisticated understanding of political and social dynamics.
      
      User's question: ${userQuery}
      
      CSV Data:
      ${csvData.substring(0, 5000)} // Limit data size to prevent overly long responses
      
      Please provide your analysis in the following JSON format:
      {
        "notableQuotes": [
          {
            "quote": "A particularly significant or revealing quote from the data, selected for its analytical value",
            "context": "Deep contextual analysis of the quote, including its historical significance, rhetorical strategies employed, and broader implications"
          }
        ],
        "historicalInsights": ["List of detailed historical insights from the data, each with substantial analytical depth and scholarly rigor"]
      }
      
      Important: Respond ONLY with valid JSON in the exact format specified above. Do not include any other text, explanations, or markdown formatting. Ensure your analysis is thorough, detailed, and exhibits academic rigor. Keep your response under 8000 characters.
    `;
    
    // Create a specialized version of the analysis with the context-focused prompt
    return await analyzeNewsletterData(csvData, contextPrompt);
  }, []);

  // Agent 3: Synthesis Analysis - Combines insights from other agents
  const performSynthesisAnalysis = useCallback(async (csvData: string, userQuery: string, patternResult: any, contextResult: any) => {
    const synthesisPrompt = `
      Act as a Synthesis Analyst Agent with expertise in interdisciplinary research and systems thinking. Your role is to synthesize the insights from the Data Pattern Analyst and Context Analyst into a comprehensive, scholarly-level analysis that answers the user's question.
      
      Approach this task with the integrative thinking of a senior research fellow. Your synthesis should reveal connections and insights that emerge only when the pattern analysis and contextual analysis are combined. Provide a nuanced, sophisticated understanding that demonstrates deep analytical reasoning.
      
      User's question: ${userQuery}
      
      CSV Data:
      ${csvData.substring(0, 3000)} // Limit data size to prevent overly long responses
      
      Data Pattern Analysis Results:
      ${JSON.stringify(patternResult, null, 2).substring(0, 2000)}
      
      Context Analysis Results:
      ${JSON.stringify(contextResult, null, 2).substring(0, 2000)}
      
      Please provide your comprehensive analysis in the following JSON format:
      {
        "overallSummary": "A comprehensive, scholarly-level summary that synthesizes all insights into a cohesive narrative. This should demonstrate deep understanding and analytical sophistication, integrating patterns and context into a unified perspective.",
        "dataConnections": "Detailed explanation of connections and patterns in the data, incorporating historical and contextual insights. Explain how the identified trends relate to the historical context, what the quotes reveal about broader patterns, and how all elements form a coherent analytical framework."
      }
      
      Important: Respond ONLY with valid JSON in the exact format specified above. Do not include any other text, explanations, or markdown formatting. Ensure your analysis is thorough, detailed, and exhibits academic rigor. Keep your response under 8000 characters.
    `;
    
    // Create a specialized version of the analysis with the synthesis-focused prompt
    return await analyzeNewsletterData(csvData, synthesisPrompt);
  }, []);

  const performAnalysis = useCallback(async (query: string) => {
    if (!CSV_URL) {
      setError("Data source URL is not configured. Please set VITE_CSV_URL in your environment variables.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);
    setCurrentQuery(query);
 
    try {
      setLoadingMessage('Fetching latest data...');
      const response = await fetch(CSV_URL);
      if (!response.ok) {
        throw new Error(`Failed to fetch data from the source. Status: ${response.status}`);
      }
      const csvData = await response.text();
 
      setLoadingMessage('Analyzing data patterns...');
      const patternResult = await performPatternAnalysis(csvData, query);
 
      setLoadingMessage('Analyzing context...');
      const contextResult = await performContextAnalysis(csvData, query);
 
      setLoadingMessage('Synthesizing insights...');
      const synthesisResult = await performSynthesisAnalysis(csvData, query, patternResult, contextResult);
 
      // Combine results from all three agents
      const combinedResult: AnalysisResult = {
        overallSummary: synthesisResult.overallSummary,
        keyThemes: patternResult.keyThemes || [],
        emergingTrends: patternResult.emergingTrends || [],
        notableQuotes: contextResult.notableQuotes || [],
        dataConnections: synthesisResult.dataConnections
      };
 
      setAnalysisResult(combinedResult);
 
    } catch (err) {
      console.error(err);
      if (err instanceof Error) {
        setError(`An error occurred during analysis: ${err.message}. Please check the console for more details.`);
      } else {
        setError("An unknown error occurred during analysis. Please try a different query.");
      }
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  }, [performPatternAnalysis, performContextAnalysis, performSynthesisAnalysis]);

  return (
    <div className="min-h-screen text-slate-200 font-sans flex flex-col selection:bg-fuchsia-500 selection:text-white">
      {/* Fullscreen Video Background */}
      <div className="fixed top-0 left-0 w-full h-full -z-20 overflow-hidden">
        <video autoPlay loop muted playsInline className="w-full h-full object-cover">
            <source src="/cyber_background.mp4" type="video/mp4" />
        </video>
      </div>
      <div className="fixed top-0 left-0 w-full h-full bg-slate-900/80 -z-10"></div>

      <main className="flex-grow container mx-auto p-4 md:p-8 flex flex-col items-center gap-12">
        <div className="w-full text-center mt-8">
          <div className="flex justify-center items-center mb-6 h-60">
            <Logo />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-100 mb-4 bg-clip-text text-transparent bg-gradient-to-r from-fuchsia-400 to-cyan-400">
            The MAGA Files: Your AI Truth Machine
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Ask any question. Expose the narratives. Follow the data.
          </p>
        </div>
        
        <AnalysisDashboard onAnalyze={performAnalysis} isLoading={isLoading} />

        <div className="w-full max-w-5xl min-h-[10rem]">
          {isLoading && (
              <div className="flex flex-col items-center justify-center p-8 bg-slate-900/50 rounded-lg border border-slate-700">
                  <LoadingSpinner />
                  <p className="text-slate-300 mt-4 text-lg">{loadingMessage || `Analyzing data for: "${currentQuery}"`}</p>
                  <p className="text-slate-500 text-sm mt-1">This may take a moment...</p>
              </div>
          )}
          {error && (
              <div className="bg-red-900/50 border border-red-700 text-red-300 p-4 rounded-lg">
                  <h3 className="font-bold">Analysis Failed</h3>
                  <p>{error}</p>
              </div>
          )}
          {analysisResult && !isLoading && <AnalysisResults result={analysisResult} currentQuery={currentQuery} />}
        </div>

        <div className="w-full max-w-5xl space-y-16">
          <ResearchPaperSection />
          <WhyItMattersSection />
          <MonetizationSection />
        </div>
      </main>
      <footer className="text-center p-4 text-slate-500 text-sm">
        <p>The MAGA Files. For educational and research purposes.</p>
        <div className="mt-4 text-xs text-slate-600">[ Ad Placeholder ]</div>
      </footer>
    </div>
  );
};

export default App;