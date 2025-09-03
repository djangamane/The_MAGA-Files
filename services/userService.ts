import { supabase } from './supabaseClient';
import type { AnalysisResult } from '../types';
import { sendAnalysisEmail } from './emailService';

export interface User {
  id: string;
  email: string;
  created_at: string;
  is_subscriber: boolean;
  query_count: number;
  last_query_date: string;
}

export interface UserAnalysis {
  id: string;
  user_id: string;
  query: string;
  result: AnalysisResult;
  created_at: string;
}

/**
 * Get user by ID
 */
export const getUser = async (userId: string): Promise<User | null> => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching user:', error);
    return null;
  }

  return data;
};

/**
 * Create a new user
 */
export const createUser = async (email: string): Promise<User | null> => {
  const { data, error } = await supabase
    .from('users')
    .insert([
      {
        email: email,
        is_subscriber: false,
        query_count: 0,
        last_query_date: new Date().toISOString(),
      },
    ])
    .select()
    .single();

  if (error) {
    console.error('Error creating user:', error);
    return null;
  }

  return data;
};

/**
 * Update user's query count
 */
export const incrementUserQueryCount = async (userId: string): Promise<boolean> => {
  const { error } = await supabase
    .from('users')
    .update({
      query_count: supabase.rpc('increment'),
      last_query_date: new Date().toISOString(),
    })
    .eq('id', userId);

  if (error) {
    console.error('Error updating user query count:', error);
    return false;
  }

  return true;
};

/**
 * Save analysis result for a user
 */
export const saveUserAnalysis = async (
  userId: string,
  query: string,
  result: AnalysisResult
): Promise<UserAnalysis | null> => {
  const { data, error } = await supabase
    .from('user_analyses')
    .insert([
      {
        user_id: userId,
        query: query,
        result: result,
        created_at: new Date().toISOString(),
      },
    ])
    .select()
    .single();

  if (error) {
    console.error('Error saving user analysis:', error);
    return null;
  }

  return data;
};

/**
 * Get user's analysis history
 */
export const getUserAnalyses = async (userId: string): Promise<UserAnalysis[] | null> => {
  const { data, error } = await supabase
    .from('user_analyses')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching user analyses:', error);
    return null;
  }

  return data;
};

/**
 * Send analysis result via email to user
 */
export const sendAnalysisToUser = async (
  userId: string,
  query: string,
  result: AnalysisResult
): Promise<boolean> => {
  const user = await getUser(userId);
  if (!user) {
    console.error('User not found');
    return false;
  }

  try {
    // Send the analysis result to the user's email
    const response = await sendAnalysisEmail(user.email, query, result);
    return response.success;
  } catch (error) {
    console.error('Error sending analysis email:', error);
    return false;
  }
};

/**
 * Check if user can perform a query (based on free tier limits)
 */
export const canUserPerformQuery = async (userId: string): Promise<boolean> => {
  const user = await getUser(userId);
  
  if (!user) return false;
  
  // If user is a subscriber, they can always perform queries
  if (user.is_subscriber) return true;
  
  // For free users, check if they're within the daily limit (3 queries per day)
  const today = new Date().toISOString().split('T')[0];
  const lastQueryDate = user.last_query_date.split('T')[0];
  
  // If last query was not today, reset count
  if (lastQueryDate !== today) {
    await supabase
      .from('users')
      .update({ query_count: 0 })
      .eq('id', userId);
    return true;
  }
  
  // Check if user has remaining queries for today
  return user.query_count < 3;
};