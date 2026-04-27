export type AgentSignal = "bullish" | "bearish" | "neutral" | null;
export type AgentName = "news" | "disclosure" | "finance";

export interface FinanceData {
  stockName: string | null;
  market: string | null;
  currentPrice: string | null;
  roe: number | null;
  roa: number | null;
  debtRatio: number | null;
  fiscalYear: string | null;
  sales: number | null;
  operatingIncome: number | null;
  netIncome: number | null;
}

export interface DisclosureFiling {
  title: string;
  filedAt: string;
  type: string;
}

export interface DisclosureOtherSummary {
  ownership: number;
  unknown: number;
  majorEvent: number;
}

export interface DisclosureData {
  coreFiling: DisclosureFiling[];
  otherSummary: DisclosureOtherSummary;
}

export interface AgentResult {
  agentName: AgentName;
  status: "success" | "error";
  data: FinanceData | DisclosureData | Record<string, unknown>;
  signal: AgentSignal;
  confidence: number | null;
  summary: string | null;
  keyPoints: string[];
  executionTimeMs: number;
  errorMessage: string | null;
}

export interface BusinessOverview {
  corpName: string;
  summary: string;
  revenueSources: string[];
  source: "rag_summary" | "llm_only" | "asset_llm_only" | string;
  foundingStory: string | null;
  businessModel: string | null;
}

export interface StockAnalysisResult {
  sessionId: string;
  resultStatus: "success" | "partial_failure" | "failure";
  answer: string;
  agentResults: AgentResult[];
  totalExecutionTimeMs: number;
  businessOverview: BusinessOverview | null;
}

export interface StockAnalysisRequest {
  query: string;
  ticker: string;
  sessionId?: string;
}

export interface AnalysisHistoryItem {
  ticker: string;
  query: string;
  overallSignal: AgentSignal;
  confidence: number | null;
  summary: string | null;
  keyPoints: string[];
  executionTimeMs: number;
  createdAt: string;
}
