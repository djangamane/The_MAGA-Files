import React from 'react';

export const ResearchPaperSection: React.FC = () => {
    return (
        <section className="bg-slate-900/50 border border-fuchsia-500/40 rounded-lg p-8 shadow-2xl shadow-fuchsia-500/10">
            <div className="text-center">
                <h2 className="text-3xl font-bold text-slate-100 mb-2">MAGA: The Covert Call for Colonialism’s Comeback</h2>
                <p className="text-slate-400 mb-6 text-lg">The Foundational Research Paper</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8 items-center">
                <div className="md:col-span-2">
                    <h3 className="font-bold text-fuchsia-400 mb-2">Abstract</h3>
                    <p className="text-slate-300 mb-6">
                        The paper reveals how MAGA rhetoric revives colonial ideologies, embedding systemic racism and white supremacist narratives into modern politics. Drawing on Dr. Welsing and Dr. Wilson, it exposes the covert mechanics of authoritarian nationalism and racial domination.
                    </p>
                     <blockquote className="border-l-4 border-fuchsia-500 pl-4 my-6">
                        <p className="text-slate-200 italic text-lg">
                            “MAGA is a contemporary manifestation of white supremacy, cloaked in patriotic slogans but driven by colonial legacies.”
                        </p>
                    </blockquote>
                </div>
                <div className="text-center">
                    <a 
                        href="/MAGA.pdf" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-block bg-slate-700 text-slate-100 font-bold py-3 px-6 rounded-md hover:bg-slate-600 transition-colors text-center w-full"
                    >
                        Read the Full Paper
                        <span className="block text-xs text-slate-400 mt-1">(370+ downloads on SSRN)</span>
                    </a>
                </div>
            </div>
        </section>
    );
};