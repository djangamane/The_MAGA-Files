import React, { useState, useEffect } from 'react';
import { EyeIcon } from './EyeIcon';

interface DataSourceInputProps {
  onConnect: (url: string) => void;
  initialUrl: string;
  isLoading: boolean;
  error: string | null;
}

export const DataSourceInput: React.FC<DataSourceInputProps> = ({ onConnect, initialUrl, isLoading, error }) => {
  const [url, setUrl] = useState(initialUrl);

  useEffect(() => {
    setUrl(initialUrl);
  }, [initialUrl]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      onConnect(url.trim());
    }
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center text-center p-4 mt-16">
        <div className="flex justify-center items-center mb-6 h-32">
            <EyeIcon />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-slate-100 mb-4 bg-clip-text text-transparent bg-gradient-to-r from-fuchsia-400 to-cyan-400">
            The MAGA Files: Your AI Truth Machine
        </h1>
        <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-8">
            To begin, connect your live CSV data source. The application will fetch the latest data from this URL for each analysis.
        </p>

      <div className="w-full max-w-2xl p-8 bg-slate-900/50 border border-slate-700 rounded-lg shadow-2xl shadow-fuchsia-500/10">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label htmlFor="csv-url" className="sr-only">CSV File URL</label>
            <input
              id="csv-url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/data.csv"
              className="w-full bg-slate-800 border border-slate-600 rounded-md p-3 text-center focus:ring-2 focus:ring-fuchsia-500 focus:outline-none transition-shadow text-lg"
              required
              disabled={isLoading}
            />
          </div>
          <button
            type="submit"
            disabled={isLoading || !url.trim()}
            className="w-full bg-fuchsia-600 text-white font-bold py-3 px-6 rounded-md hover:bg-fuchsia-500 disabled:bg-slate-600 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105"
          >
            {isLoading ? 'Connecting...' : 'Connect to Data Source'}
          </button>
        </form>
         {error && <p className="mt-4 text-red-400">{error}</p>}
         <p className="text-xs text-slate-500 mt-4">
            Note: The URL must be publicly accessible and allow cross-origin requests (CORS).
         </p>
      </div>
    </div>
  );
};
