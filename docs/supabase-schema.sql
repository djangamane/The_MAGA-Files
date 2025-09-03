-- Supabase database schema for The MAGA Files application

-- Users table
-- Stores user information and query limits
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_subscriber BOOLEAN DEFAULT FALSE,
  query_count INTEGER DEFAULT 0,
  last_query_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User analyses table
-- Stores analysis results for users who have purchased the premium feature
CREATE TABLE user_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  query TEXT NOT NULL,
  result JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_analyses ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can only view and update their own data
CREATE POLICY "Users can view their own data" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own data" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view their own analyses" ON user_analyses
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own analyses" ON user_analyses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Grant permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON TABLE users TO authenticated;
GRANT ALL ON TABLE user_analyses TO authenticated;