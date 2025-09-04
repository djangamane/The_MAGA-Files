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
  const [showResendConfirmation, setShowResendConfirmation] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setShowResendConfirmation(false);

    console.log('Starting auth process:', isLogin ? 'login' : 'signup', 'for email:', email);

    try {
      if (isLogin) {
        console.log('Attempting login...');
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        console.log('Login response:', { data: data ? 'success' : null, error });

        if (error) {
          console.error('Login error:', error);
          // Check if it's an email confirmation issue
          if (error.message.includes('Email not confirmed') ||
              error.message.includes('confirmation') ||
              error.message.includes('confirm') ||
              error.message.includes('verify') ||
              error.message.includes('check your email')) {
            setMessage('Please check your email and click the confirmation link before signing in.');
            setShowResendConfirmation(true);
            return;
          }
          // Check for other common auth errors
          if (error.message.includes('Invalid login credentials')) {
            setMessage('Invalid email or password. Please check your credentials and try again.');
            return;
          }
          if (error.message.includes('Too many requests')) {
            setMessage('Too many login attempts. Please wait a few minutes before trying again.');
            return;
          }
          throw error;
        }

        console.log('Login successful, checking user record...');
        // After successful login, ensure user record exists
        if (data.user) {
          const { createUser, getUser } = await import('../services/userService');
          const existingUser = await getUser(data.user.id);
          console.log('Existing user check:', existingUser);

          if (!existingUser) {
            console.log('Creating user record...');
            await createUser(email, data.user.id);
          }
        }
      } else {
        console.log('Attempting signup...');
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              email: email,
            },
            // Disable email confirmation for now to simplify the flow
            emailRedirectTo: window.location.origin
          }
        });

        console.log('Signup response:', { data: data ? 'success' : null, error });

        if (error) {
          console.error('Signup error:', error);
          throw error;
        }

        console.log('Signup successful, creating user record...');
        // Create user record immediately after signup
        if (data.user) {
          const { createUser } = await import('../services/userService');
          const userRecord = await createUser(email, data.user.id);
          console.log('User record created:', userRecord);
        }

        // Check if user needs email confirmation
        if (data.user && !data.user.email_confirmed_at) {
          setMessage('Account created! Please check your email and click the confirmation link to activate your account.');
        } else {
          setMessage('Account created successfully! You can now sign in.');
        }
        console.log('Signup completed successfully');
      }

      onAuthSuccess();
    } catch (error: any) {
      console.error('Auth error:', error);
      setMessage(error.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleResendConfirmation = async () => {
    setLoading(true);
    setMessage('');

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
      });

      if (error) throw error;
      setMessage('Confirmation email sent! Please check your inbox.');
    } catch (error: any) {
      setMessage(`Failed to resend confirmation: ${error.message}`);
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
        <div className={`mb-4 p-3 rounded ${message.includes('Check your email') || message.includes('Confirmation email sent') ? 'bg-green-900/50 border border-green-700' : 'bg-red-900/50 border border-red-700'}`}>
          {message}
          {showResendConfirmation && (
            <div className="mt-2">
              <button
                onClick={handleResendConfirmation}
                disabled={loading}
                className="text-sm text-fuchsia-400 hover:text-fuchsia-300 underline disabled:opacity-50"
              >
                Resend confirmation email
              </button>
            </div>
          )}
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