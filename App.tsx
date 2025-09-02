import React, { useState, useCallback } from 'react';
import { AnalysisDashboard } from './components/AnalysisDashboard';
import { AnalysisResults } from './components/AnalysisResults';
import { ResearchPaperSection } from './components/ResearchPaperSection';
import { WhyItMattersSection } from './components/WhyItMattersSection';
import { MonetizationSection } from './components/MonetizationSection';
import { LoadingSpinner } from './components/LoadingSpinner';
import { Logo } from './components/Logo';

import type { AnalysisResult } from './types';
import { analyzeNewsletterData } from './services/geminiService';

// The CSV URL is now managed via environment variables for easy configuration on Vercel.
const CSV_URL = import.meta.env.VITE_CSV_URL;

const App: React.FC = () => {
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [currentQuery, setCurrentQuery] = useState<string>('');

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
 
      setLoadingMessage(`Analyzing data for: "${query}"`);
      const result = await analyzeNewsletterData(csvData, query);
      setAnalysisResult(result);
 
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
  }, []);

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
