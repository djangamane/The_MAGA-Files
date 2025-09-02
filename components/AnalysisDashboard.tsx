import React, { useState } from 'react';

interface AnalysisDashboardProps {
  onAnalyze: (query: string) => void;
  isLoading: boolean;
}

const PREDEFINED_QUERIES = [
    "What are the dominant narratives present in the data?",
    "Summarize the key themes across all news sources.",
    "Identify emerging trends or shifts in language over time.",
    "Extract the most frequently mentioned figures, organizations, or locations.",
];

export const AnalysisDashboard: React.FC<AnalysisDashboardProps> = ({ onAnalyze, isLoading }) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onAnalyze(query);
    }
  };
  
  const handlePredefinedQuery = (predefinedQuery: string) => {
    setQuery(predefinedQuery);
    onAnalyze(predefinedQuery);
  };

  return (
    <div className="w-full max-w-3xl flex flex-col gap-8">
      <div className="bg-slate-900/50 p-6 rounded-lg border border-fuchsia-500/40 shadow-2xl shadow-fuchsia-500/10">
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-slate-100">Analysis Console</h2>
        </div>
        <p className="text-slate-400 mb-4">Enter a question to analyze your data, or select a predefined query below.</p>
        
        <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-2 mb-4">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g., Query the database..."
            className="flex-grow bg-slate-800 border border-slate-600 rounded-md p-3 focus:ring-2 focus:ring-fuchsia-500 focus:outline-none transition-shadow"
            disabled={isLoading}
            aria-label="Analysis Query Input"
          />
          <button
            type="submit"
            disabled={isLoading || !query.trim()}
            className="bg-fuchsia-600 text-white font-bold py-3 px-6 rounded-md hover:bg-fuchsia-500 disabled:bg-slate-600 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105"
          >
            {isLoading ? 'Analyzing...' : 'Analyze'}
          </button>
        </form>

        <div className="flex flex-wrap gap-2">
            {PREDEFINED_QUERIES.map(q => (
                <button 
                    key={q} 
                    onClick={() => handlePredefinedQuery(q)}
                    disabled={isLoading}
                    className="text-xs bg-slate-700 hover:bg-slate-600 text-slate-300 font-medium py-1.5 px-3 rounded-full transition-colors duration-200 disabled:opacity-50"
                >
                    {q}
                </button>
            ))}
        </div>
      </div>
    </div>
  );
};
