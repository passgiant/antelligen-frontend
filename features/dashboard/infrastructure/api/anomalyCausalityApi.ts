import { httpClient } from "@/infrastructure/http/httpClient";
import type { ApiResponse } from "@/infrastructure/http/apiResponse";
import type { HypothesisResult } from "@/features/dashboard/domain/model/timelineEvent";

export interface AnomalyCausalityResponse {
  ticker: string;
  date: string;
  hypotheses: HypothesisResult[];
  cached: boolean;
}

export async function fetchAnomalyCausality(
  ticker: string,
  barDate: string,
  signal?: AbortSignal,
): Promise<AnomalyCausalityResponse> {
  const res = await httpClient<ApiResponse<AnomalyCausalityResponse>>(
    `/api/v1/history-agent/anomaly-bars/${encodeURIComponent(ticker)}/${barDate}/causality`,
    { signal },
  );
  return res.data;
}
