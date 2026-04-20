import { httpClient } from "@/infrastructure/http/httpClient";
import type { ApiResponse } from "@/infrastructure/http/apiResponse";

export interface TitleRequest {
  eventIdx: number;
  date: string;
  category: string;
  type: string;
  detail: string;
}

export interface TitleResult {
  eventIdx: number;
  title: string;
}

interface TitleItem {
  date: string;
  type: string;
  detail_hash: string;
  title: string;
}

interface TitleBatchResponse {
  titles: TitleItem[];
}

export async function fetchEventTitles(
  ticker: string,
  events: TitleRequest[],
  signal?: AbortSignal
): Promise<TitleResult[]> {
  const res = await httpClient<ApiResponse<TitleBatchResponse>>("/api/v1/history-agent/titles", {
    method: "POST",
    body: JSON.stringify({
      ticker,
      events: events.map(({ date, type, detail }) => ({ date, type, detail })),
    }),
    signal,
  });
  // Backend guarantees response order matches request order
  return res.data.titles.map((item, i) => ({
    eventIdx: events[i].eventIdx,
    title: item.title,
  }));
}
