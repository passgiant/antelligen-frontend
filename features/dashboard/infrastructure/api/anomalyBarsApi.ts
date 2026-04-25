import { httpClient } from "@/infrastructure/http/httpClient";
import type { ApiResponse } from "@/infrastructure/http/apiResponse";
import type { Period } from "@/features/dashboard/domain/model/period";

/**
 * 차트 이상치 봉 1건 (§13.4 C / §17).
 * - return_pct: 해당 봉의 수익률(%) — 직전 봉 대비.
 * - z_score: (return_pct/100 - μ) / σ, 봉 단위별 rolling window 기준.
 * - direction: "up" | "down" — 프론트 색 구분용 (한국식 up=빨강 / down=파랑).
 */
export interface AnomalyBar {
  date: string; // ISO "yyyy-mm-dd"
  return_pct: number;
  z_score: number;
  direction: "up" | "down";
  close: number;
  causality: string | null;
}

export interface AnomalyBarsResponse {
  ticker: string;
  chart_interval: string;
  count: number;
  events: AnomalyBar[];
}

export async function fetchAnomalyBars(
  ticker: string,
  chartInterval: Period,
  signal?: AbortSignal,
): Promise<AnomalyBarsResponse> {
  // ADR-0001: chartInterval 사용. 1Y → 1Q 별칭 처리는 백엔드에서 수행.
  const res = await httpClient<ApiResponse<AnomalyBarsResponse>>(
    `/api/v1/history-agent/anomaly-bars?ticker=${encodeURIComponent(ticker)}&chartInterval=${chartInterval}`,
    { signal }
  );
  return res.data;
}
