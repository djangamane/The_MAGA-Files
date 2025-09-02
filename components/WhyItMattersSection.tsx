import React from 'react';

export const WhyItMattersSection: React.FC = () => {
    return (
        <section className="bg-slate-900/50 border border-fuchsia-500/40 rounded-lg p-8 shadow-2xl shadow-fuchsia-500/10">
            <h2 className="text-2xl font-bold text-slate-100 mb-4 text-center">Why It Matters</h2>
            <div className="text-center text-slate-300 text-lg max-w-3xl mx-auto space-y-2">
                <p>The tool lets you analyze today’s news data.</p>
                <p>The research paper provides the scholarly foundation.</p>
                <p className="font-bold text-fuchsia-400">Together, they show how MAGA functions as white supremacy, reinvented for the 21st century.</p>
            </div>
        </section>
    );
};