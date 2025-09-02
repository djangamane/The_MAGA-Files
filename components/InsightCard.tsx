import React from 'react';

interface InsightCardProps {
  title: string;
  children: React.ReactNode;
}

export const InsightCard: React.FC<InsightCardProps> = ({ title, children }) => {
  return (
    <div className="bg-slate-900/50 border border-slate-700 rounded-lg shadow-lg">
      <div className="p-4 border-b border-slate-700">
        <h3 className="text-lg font-bold text-fuchsia-300">{title}</h3>
      </div>
      <div className="p-4">
        {children}
      </div>
    </div>
  );
};
