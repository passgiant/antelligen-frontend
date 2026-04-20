export type TimelineCategory = "PRICE" | "CORPORATE" | "ANNOUNCEMENT";

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
}

export interface TimelineResponse {
  ticker: string;
  period: string;
  count: number;
  events: TimelineEvent[];
  is_etf: boolean;
}
