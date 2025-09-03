import React, { useState } from 'react';
import { supabase } from '../services/supabaseClient';

interface AuthComponentProps {
  onAuthSuccess: () => void;
}

export const AuthComponent: React.FC<AuthComponentProps> = ({ onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) throw error;
        setMessage('Check your email for the confirmation link!');
      }

      onAuthSuccess();
    } catch (error: any) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-slate-900/50 border border-slate-700 rounded-lg">
      <h2 className="text-2xl font-bold mb-4 text-center">
        {isLogin ? 'Sign In' : 'Sign Up'}
      </h2>
      
      {message && (
        <div className={`mb-4 p-3 rounded ${message.includes('Check your email') ? 'bg-green-900/50 border border-green-700' : 'bg-red-900/50 border border-red-700'}`}>
          {message}
        </div>
      )}

      <form onSubmit={handleAuth} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-1">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-md text-slate-200 focus:outline-none focus:ring-2 focus:ring-fuchsia-500"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-1">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-md text-slate-200 focus:outline-none focus:ring-2 focus:ring-fuchsia-500"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-fuchsia-600 text-white font-bold py-2 px-4 rounded-md hover:bg-fuchsia-500 transition-colors disabled:opacity-50"
        >
          {loading ? 'Loading...' : isLogin ? 'Sign In' : 'Sign Up'}
        </button>
      </form>

      <div className="mt-4 text-center">
        <button
          onClick={() => setIsLogin(!isLogin)}
          className="text-fuchsia-400 hover:text-fuchsia-300"
        >
          {isLogin
            ? "Don't have an account? Sign Up"
            : 'Already have an account? Sign In'}
        </button>
      </div>
    </div>
  );
};