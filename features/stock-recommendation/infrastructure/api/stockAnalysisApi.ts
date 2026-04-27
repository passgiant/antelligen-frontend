import { agentHttpClient } from "@/infrastructure/http/agentHttpClient";
import type { ApiResponse } from "@/infrastructure/http/apiResponse";
import type {
  AgentName,
  AgentResult,
  AgentSignal,
  AnalysisHistoryItem,
  BusinessOverview,
  DisclosureData,
  FinanceData,
  StockAnalysisRequest,
  StockAnalysisResult,
} from "@/features/stock-recommendation/domain/model/stockAnalysis";

// ── Raw API response shapes (snake_case) ──────────────────────────────────────

interface RawFinanceData {
  stock_name: string | null;
  market: string | null;
  current_price: string | null;
  roe: number | null;
  roa: number | null;
  debt_ratio: number | null;
  fiscal_year: string | null;
  sales: number | null;
  operating_income: number | null;
  net_income: number | null;
}

interface RawDisclosureFiling {
  title: string;
  filed_at: string;
  type: string;
}

interface RawDisclosureData {
  filings: {
    core: RawDisclosureFiling[];
    other_summary: {
      ownership?: number;
      unknown?: number;
      major_event?: number;
    };
  };
}

interface RawAgentResult {
  agent_name: AgentName;
  status: "success" | "error";
  data: RawFinanceData | RawDisclosureData | Record<string, unknown>;
  signal: AgentSignal;
  confidence: number | null;
  summary: string | null;
  key_points: string[];
  execution_time_ms: number;
  error_message: string | null;
}

interface RawBusinessOverview {
  corp_name: string;
  summary: string;
  revenue_sources: string[];
  source: string;
  founding_story: string | null;
  business_model: string | null;
}

interface RawQueryResponse {
  session_id: string;
  result_status: "success" | "partial_failure" | "failure";
  answer: string;
  agent_results: RawAgentResult[];
  total_execution_time_ms: number;
  business_overview: RawBusinessOverview | null;
}

interface RawHistoryItem {
  ticker: string;
  query: string;
  overall_signal: AgentSignal;
  confidence: number | null;
  summary: string | null;
  key_points: string[];
  execution_time_ms: number;
  created_at: string;
}

// ── Mappers ───────────────────────────────────────────────────────────────────

function mapFinanceData(raw: RawFinanceData | null | undefined): FinanceData {
  return {
    stockName: raw?.stock_name ?? null,
    market: raw?.market ?? null,
    currentPrice: raw?.current_price ?? null,
    roe: raw?.roe ?? null,
    roa: raw?.roa ?? null,
    debtRatio: raw?.debt_ratio ?? null,
    fiscalYear: raw?.fiscal_year ?? null,
    sales: raw?.sales ?? null,
    operatingIncome: raw?.operating_income ?? null,
    netIncome: raw?.net_income ?? null,
  };
}

function mapDisclosureData(raw: RawDisclosureData | null | undefined): DisclosureData {
  return {
    coreFiling: (raw?.filings?.core ?? []).map((f) => ({
      title: f.title,
      filedAt: f.filed_at,
      type: f.type,
    })),
    otherSummary: {
      ownership: raw?.filings?.other_summary?.ownership ?? 0,
      unknown: raw?.filings?.other_summary?.unknown ?? 0,
      majorEvent: raw?.filings?.other_summary?.major_event ?? 0,
    },
  };
}

function mapBusinessOverview(
  raw: RawBusinessOverview | null | undefined
): BusinessOverview | null {
  if (!raw) return null;
  return {
    corpName: raw.corp_name,
    summary: raw.summary,
    revenueSources: raw.revenue_sources ?? [],
    source: raw.source,
    foundingStory: raw.founding_story ?? null,
    businessModel: raw.business_model ?? null,
  };
}

function mapAgentResult(raw: RawAgentResult): AgentResult {
  let data: AgentResult["data"];
  if (raw.agent_name === "finance") {
    data = mapFinanceData(raw.data as RawFinanceData | null);
  } else if (raw.agent_name === "disclosure") {
    data = mapDisclosureData(raw.data as RawDisclosureData | null);
  } else {
    data = (raw.data ?? {}) as Record<string, unknown>;
  }

  return {
    agentName: raw.agent_name,
    status: raw.status,
    data,
    signal: raw.signal,
    confidence: raw.confidence,
    summary: raw.summary,
    keyPoints: raw.key_points ?? [],
    executionTimeMs: raw.execution_time_ms,
    errorMessage: raw.error_message,
  };
}

// ── Public API functions ──────────────────────────────────────────────────────

export async function queryStockAnalysis(
  request: StockAnalysisRequest
): Promise<StockAnalysisResult> {
  const res = await agentHttpClient<ApiResponse<RawQueryResponse>>(
    "/api/v1/agent/query",
    {
      method: "POST",
      body: JSON.stringify({
        query: request.query,
        ticker: request.ticker,
        session_id: request.sessionId,
      }),
    }
  );

  const raw = res.data;
  return {
    sessionId: raw.session_id,
    resultStatus: raw.result_status,
    answer: raw.answer,
    agentResults: raw.agent_results.map(mapAgentResult),
    totalExecutionTimeMs: raw.total_execution_time_ms,
    businessOverview: mapBusinessOverview(raw.business_overview),
  };
}

export async function fetchAnalysisHistory(
  ticker: string,
  limit = 10
): Promise<AnalysisHistoryItem[]> {
  const res = await agentHttpClient<ApiResponse<RawHistoryItem[]>>(
    `/api/v1/agent/history?ticker=${encodeURIComponent(ticker)}&limit=${limit}`
  );

  return (res.data ?? []).map((item) => ({
    ticker: item.ticker,
    query: item.query,
    overallSignal: item.overall_signal,
    confidence: item.confidence,
    summary: item.summary,
    keyPoints: item.key_points ?? [],
    executionTimeMs: item.execution_time_ms,
    createdAt: item.created_at,
  }));
}
