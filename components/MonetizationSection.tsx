import React from 'react';

const CheckIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
);

export const MonetizationSection: React.FC = () => {
  return (
    <section className="text-center">
      <h2 className="text-3xl font-bold mb-2">Unlock the Full Picture</h2>
      <p className="text-slate-400 mb-8 max-w-2xl mx-auto">
        Our mission is to make this data accessible, but advanced features require support to maintain.
      </p>

      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {/* Free Tier */}
        <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-8 text-left flex flex-col">
          <h3 className="text-2xl font-bold text-slate-100 mb-4">Free Version</h3>
          <p className="text-slate-400 mb-6 flex-grow">
            Perfect for casual exploration and understanding the core narratives.
          </p>
          <ul className="space-y-4 mb-8">
            <li className="flex items-center gap-3">
                <CheckIcon /> <span>Access to the AI analysis tool</span>
            </li>
            <li className="flex items-center gap-3">
                <CheckIcon /> <span>Limited to 5 queries per day</span>
            </li>
          </ul>
           <button disabled className="mt-auto w-full bg-slate-700 text-slate-400 font-bold py-3 px-6 rounded-md cursor-not-allowed">
            Your Current Plan
          </button>
        </div>
        
        {/* Paid Tier */}
        <div className="bg-slate-900/50 border-2 border-fuchsia-500 rounded-lg p-8 text-left flex flex-col shadow-2xl shadow-fuchsia-500/20">
            <h3 className="text-2xl font-bold text-fuchsia-400 mb-4">Unlimited Access</h3>
            <p className="text-slate-400 mb-6 flex-grow">
                For researchers, journalists, and power-users who need to dig deeper and track trends over time.
            </p>
            <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3">
                    <CheckIcon /> <span>Unlimited queries</span>
                </li>
                <li className="flex items-center gap-3">
                    <CheckIcon /> <span>Ability to save and export analysis reports</span>
                </li>
                <li className="flex items-center gap-3">
                    <CheckIcon /> <span>Priority access to new features</span>
                </li>
            </ul>
            <button className="mt-auto w-full bg-fuchsia-600 text-white font-bold py-3 px-6 rounded-md hover:bg-fuchsia-500 transition-colors">
                $10 One-Time Unlock
            </button>
        </div>
      </div>
    </section>
  );
};
