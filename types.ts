export interface Trend {
  trend: string;
  description: string;
  supportingData: string[];
}

export interface NotableQuote {
  quote: string;
  context: string;
}

export interface AnalysisResult {
  overallSummary: string;
  keyThemes: string[];
  emergingTrends: Trend[];
  notableQuotes: NotableQuote[];
  dataConnections: string;
}

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