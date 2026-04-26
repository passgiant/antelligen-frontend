export type TimelineCategory = "CORPORATE" | "ANNOUNCEMENT" | "MACRO";

export interface HypothesisResult {
  hypothesis: string;
  supporting_tools_called: string[];
}

export interface TimelineEvent {
  title: string;
  date: string;
  category: TimelineCategory;
  type: string;
  detail: string;
  source: string | null;
  url: string | null;
  causality: HypothesisResult[] | null;
  // ETF holdings 분해 시 constituent 이벤트에 채워짐. ETF 자체 이벤트는 null.
  constituent_ticker?: string | null;
  weight_pct?: number | null;
  // MACRO 이벤트의 LLM 랭커 점수(0~1). curated seed는 1.0. UI 강조에 사용.
  importance_score?: number | null;
  // 공시 분류 v2 — 1~5 정수 척도. CORPORATE/ANNOUNCEMENT만 채워짐. (KR A.2)
  importance_score_1to5?: number | null;
  // "v1" = 규칙 베이스 분류, "v2" = LLM 재분류. (KR A.4)
  classifier_version?: string | null;
  // SEC 8-K raw Item 코드(예: "1.01,9.01"). DART는 null.
  items_str?: string | null;
  // PR3 — 이벤트 ±N거래일 abnormal return (= R_stock - R_benchmark, %).
  // status="OK" 인 행만 값 노출. 그 외는 ar_status 만 채워짐.
  abnormal_return_5d?: number | null;
  abnormal_return_20d?: number | null;
  // "OK" | "INSUFFICIENT_DATA" | "BENCHMARK_MISSING" | "BENCHMARK_DATA_MISSING" | "STOCK_DATA_MISSING"
  ar_status?: string | null;
  // 매핑된 시장 벤치마크(^GSPC | ^KS11 등). status != BENCHMARK_MISSING 일 때만 채워짐.
  benchmark_ticker?: string | null;
}

export interface TimelineResponse {
  ticker: string;
  // ADR-0001: /timeline 은 chart_interval(봉 단위), /macro-timeline 은 lookback_range(조회 기간).
  chart_interval?: string | null;
  lookback_range?: string | null;
  count: number;
  events: TimelineEvent[];
  is_etf: boolean;
  asset_type?: string;
}
