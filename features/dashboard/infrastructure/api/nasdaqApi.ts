import { httpClient } from "@/infrastructure/http/httpClient";
import type { ApiResponse } from "@/infrastructure/http/apiResponse";
import type { NasdaqBar } from "@/features/dashboard/domain/model/nasdaqBar";
import type { Period } from "@/features/dashboard/domain/model/period";

interface NasdaqBarRaw {
  bar_date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface NasdaqApiData {
  period: string;
  count: number;
  bars: NasdaqBarRaw[];
}

export async function fetchNasdaqBars(period: Period): Promise<NasdaqBar[]> {
  const res = await httpClient<ApiResponse<NasdaqApiData>>(
    `/api/v1/dashboard/nasdaq?period=${period}`
  );
  return res.data.bars.map((bar) => ({
    time: bar.bar_date,
    open: bar.open,
    high: bar.high,
    low: bar.low,
    close: bar.close,
    volume: bar.volume,
  }));
}
