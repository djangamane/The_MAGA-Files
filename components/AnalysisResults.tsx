import React, { useState } from 'react';
import type { AnalysisResult } from '../types';
import { InsightCard } from './InsightCard';

interface AnalysisResultsProps {
  result: AnalysisResult;
  currentQuery: string;
}

type Tab = 'summary' | 'themes' | 'trends' | 'quotes' | 'connections';

export const AnalysisResults: React.FC<AnalysisResultsProps> = ({ result, currentQuery }) => {
  const [activeTab, setActiveTab] = useState<Tab>('summary');

  const tabs: { id: Tab; label: string }[] = [
    { id: 'summary', label: 'Summary' },
    { id: 'themes', label: 'Key Themes' },
    { id: 'trends', label: 'Emerging Trends' },
    { id: 'quotes', label: 'Notable Quotes' },
    { id: 'connections', label: 'Data Connections' },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'summary':
        return (
          <InsightCard title="Overall Summary">
            <p className="text-slate-300 leading-relaxed">{result.overallSummary}</p>
          </InsightCard>
        );
      case 'themes':
        return (
          <InsightCard title="Key Themes">
            <div className="flex flex-wrap gap-2">
              {result.keyThemes.map((theme, index) => (
                <span key={index} className="bg-slate-700 text-cyan-300 text-sm font-medium px-3 py-1 rounded-full">{theme}</span>
              ))}
            </div>
          </InsightCard>
        );
      case 'trends':
        return (
          <InsightCard title="Emerging Trends">
            <div className="space-y-4">
              {result.emergingTrends.map((trend, index) => (
                <div key={index} className="p-4 bg-slate-900/50 rounded-lg border border-slate-700">
                  <h4 className="font-bold text-fuchsia-400">{trend.trend}</h4>
                  <p className="text-slate-300 mt-1 mb-3">{trend.description}</p>
                  <div className="border-l-2 border-slate-600 pl-3 space-y-2">
                    {trend.supportingData.map((data, i) => (
                      <p key={i} className="text-sm text-slate-400 italic">"{data}"</p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </InsightCard>
        );
      case 'quotes':
        return (
          <InsightCard title="Notable Quotes">
            <div className="space-y-4">
              {result.notableQuotes.map((item, index) => (
                <blockquote key={index} className="border-l-4 border-fuchsia-500 pl-4">
                  <p className="text-slate-200 italic">"{item.quote}"</p>
                  <cite className="block text-right text-sm text-slate-400 mt-1 not-italic">&mdash; {item.context}</cite>
                </blockquote>
              ))}
            </div>
          </InsightCard>
        );
      case 'connections':
        return (
          <InsightCard title="Data Connections">
            <p className="text-slate-300 leading-relaxed">{result.dataConnections}</p>
          </InsightCard>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <h3 className="text-2xl font-bold text-slate-100 border-b-2 border-fuchsia-500 pb-2">
        Analysis for: <span className="text-cyan-300">"{currentQuery}"</span>
      </h3>
      
      <div className="flex flex-wrap gap-2 border-b border-slate-700 pb-2">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === tab.id
                ? 'bg-fuchsia-600 text-white'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="mt-2">
        {renderContent()}
      </div>
    </div>
  );
};
