// LOGO POSITION TEST - This is a test comment to see if changes persist

import React, { useState, useCallback, useEffect } from 'react';
import { AnalysisDashboard } from './components/AnalysisDashboard';
import { AnalysisResults } from './components/AnalysisResults';
import { ResearchPaperSection } from './components/ResearchPaperSection';
import { WhyItMattersSection } from './components/WhyItMattersSection';
import { MonetizationSection } from './components/MonetizationSection';
import { LoadingSpinner } from './components/LoadingSpinner';
import { Logo } from './components/Logo';
import { AuthComponent } from './components/AuthComponent';

import type { AnalysisResult } from './types';
import { analyzeNewsletterData } from './services/geminiService';
import { supabase } from './services/supabaseClient';
import { canUserPerformQuery, saveUserAnalysis, sendAnalysisToUser, getUser } from './services/userService';

// The CSV URL is now managed via environment variables for easy configuration on Vercel.
const CSV_URL = import.meta.env.VITE_CSV_URL;

const App: React.FC = () => {
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [currentQuery, setCurrentQuery] = useState<string>('');
  const [user, setUser] = useState<any>(null);
  const [showAuth, setShowAuth] = useState<boolean>(false); // Changed default to false
  const [isSubscriber, setIsSubscriber] = useState<boolean>(false);
  const [guestQueryCount, setGuestQueryCount] = useState<number>(0);

  // Initialize guest query count from localStorage
  useEffect(() => {
    const savedCount = localStorage.getItem('guestQueryCount');
    if (savedCount) {
      setGuestQueryCount(parseInt(savedCount, 10));
    }
  }, []);

  // Check for existing session and handle auth callback
  useEffect(() => {
    const checkSession = async () => {
      // Handle auth callback from email confirmation
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        console.error('Session error:', error);
      }

      // Clean up URL if it contains auth tokens (from email confirmation)
      if (window.location.hash && window.location.hash.includes('access_token')) {
        // Remove the hash from URL to clean it up
        window.history.replaceState(null, '', window.location.pathname);
      }

      setUser(data.session?.user || null);
      setShowAuth(false); // Don't show auth by default

      if (data.session?.user) {
        // Check if user is a subscriber
        const userData = await getUser(data.session.user.id);
        if (userData) {
          setIsSubscriber(userData.is_subscriber);
        }
      }
    };

    checkSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user || null);
      setShowAuth(false); // Don't show auth by default

      if (session?.user) {
        // Check if user is a subscriber
        const userData = await getUser(session.user.id);
        if (userData) {
          setIsSubscriber(userData.is_subscriber);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const canGuestPerformQuery = (): boolean => {
    return guestQueryCount < 3;
  };

  const incrementGuestQueryCount = () => {
    const newCount = guestQueryCount + 1;
    setGuestQueryCount(newCount);
    localStorage.setItem('guestQueryCount', newCount.toString());
  };

  const performAnalysis = useCallback(async (query: string) => {
    // If user is authenticated, proceed with normal flow
    if (user) {
      // Check if user can perform query
      const canQuery = await canUserPerformQuery(user.id);
      if (!canQuery) {
        setError("You've reached your daily query limit. Please upgrade to unlimited access.");
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
        
        // Save analysis for premium users
        await saveUserAnalysis(user.id, query, result);
        
        // Send email to subscribers
        if (isSubscriber) {
          await sendAnalysisToUser(user.id, query, result);
        }
  
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
    } else {
      // Guest user flow
      if (!canGuestPerformQuery()) {
        // Show auth when guest has used all free queries
        setShowAuth(true);
        setError("You've used all your free queries. Sign up for $10 to get unlimited access.");
        return;
      }

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
        
        // Increment guest query count
        incrementGuestQueryCount();
  
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
    }
  }, [user, isSubscriber, guestQueryCount]);

  const handleAuthSuccess = () => {
    setShowAuth(false);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setIsSubscriber(false);
    setShowAuth(false);
  };

  const handleContinueAsGuest = () => {
    setShowAuth(false);
  };

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
        <div className="w-full flex flex-col items-center text-center mt-8">
          <Logo />
          <div className="h-28" /> {/* Spacer to push content down */}
          <h1 className="text-4xl md:text-5xl font-bold text-slate-100 mb-4 bg-clip-text text-transparent bg-gradient-to-r from-fuchsia-400 to-cyan-400">
            The MAGA Files: Your AI Truth Machine
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Ask any question. Expose the narratives. Follow the data.
          </p>
          {!user && (
            <p className="text-sm text-slate-500 mt-2">
              {3 - guestQueryCount} free queries remaining
            </p>
          )}
        </div>
        
        {showAuth ? (
          <div className="w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Access Required</h2>
              {!user && (
                <button 
                  onClick={handleContinueAsGuest}
                  className="text-sm text-fuchsia-400 hover:text-fuchsia-300"
                >
                  Back
                </button>
              )}
            </div>
            {user ? (
              <AuthComponent onAuthSuccess={handleAuthSuccess} />
            ) : (
              <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-6">
                <p className="text-slate-300 mb-4">
                  You've used all your free queries. Sign up for $10 to get unlimited access and premium features.
                </p>
                <AuthComponent onAuthSuccess={handleAuthSuccess} />
                <div className="mt-4 text-center">
                  <button
                    onClick={handleContinueAsGuest}
                    className="text-fuchsia-400 hover:text-fuchsia-300"
                  >
                    Continue as Guest (0 queries remaining)
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <>
            <AnalysisDashboard onAnalyze={performAnalysis} isLoading={isLoading} />
            
            {/* Sign In / Sign Up button for guests */}
            {!user && (
              <div className="w-full max-w-3xl text-center">
                <button
                  onClick={() => setShowAuth(true)}
                  className="text-sm text-fuchsia-400 hover:text-fuchsia-300"
                >
                  Sign In / Sign Up for Premium Features ($10)
                </button>
              </div>
            )}

            {/* Upgrade to Premium section for signed-in non-subscribers */}
            {user && !isSubscriber && (
              <div className="w-full max-w-3xl text-center bg-slate-900/30 border border-slate-700 rounded-lg p-6">
                <h3 className="text-lg font-bold text-fuchsia-400 mb-2">Upgrade to Premium</h3>
                <p className="text-slate-400 mb-4">
                  Get unlimited queries and receive analysis results via email.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                  <a
                    href="https://www.paypal.com/ncp/payment/8C4NL9DQC5WL8"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-fuchsia-600 text-white font-bold py-2 px-6 rounded-md hover:bg-fuchsia-500 transition-colors"
                  >
                    Pay $10 via PayPal
                  </a>
                  <button
                    onClick={() => {
                      alert('After completing your PayPal payment, please contact support to activate your premium account. Include your email address and payment confirmation.');
                    }}
                    className="text-sm text-fuchsia-400 hover:text-fuchsia-300 underline"
                  >
                    Need help activating?
                  </button>
                </div>
                <p className="text-xs text-slate-500 mt-3">
                  Payment is processed securely through PayPal. Premium access is granted immediately after payment verification.
                </p>
              </div>
            )}

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
              <MonetizationSection isSubscriber={isSubscriber} />
            </div>
          </>
        )}
      </main>
      <footer className="text-center p-4 text-slate-500 text-sm">
        <p>The MAGA Files. For educational and research purposes.</p>
        <div className="mt-4 text-xs text-slate-600">[ Ad Placeholder ]</div>
      </footer>
    </div>
  );
};

export default App;