export type TimelineCategory = "CORPORATE" | "ANNOUNCEMENT" | "MACRO";

// KR2-(3) 신뢰도 등급. 누락/이상치는 "LOW" 로 다운그레이드해 KR5 회색 처리 트리거.
export type HypothesisConfidence = "HIGH" | "MEDIUM" | "LOW";

// KR2-(2) 추정 원인 계층. 누락은 "SUPPORTING" 으로 fallback.
export type HypothesisLayer = "DIRECT" | "SUPPORTING" | "MARKET";

export interface HypothesisSource {
  label: string;
  url?: string | null;
}

export interface HypothesisResult {
  hypothesis: string;
  supporting_tools_called: string[];
  // 백엔드 v2 스키마(KR2 확장). 옛 응답에서는 누락 가능 — UI 에서 default fallback.
  confidence?: HypothesisConfidence;
  layer?: HypothesisLayer;
  sources?: HypothesisSource[];
  evidence?: string | null;
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
