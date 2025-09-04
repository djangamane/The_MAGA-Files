import { createClient } from '@supabase/supabase-js';

// Supabase configuration - these should be set in your environment variables
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

console.log('Supabase config:', {
  url: SUPABASE_URL ? 'Set' : 'Missing',
  key: SUPABASE_ANON_KEY ? 'Set' : 'Missing'
});

// Create a single supabase client for interacting with your database
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);