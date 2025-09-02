
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
