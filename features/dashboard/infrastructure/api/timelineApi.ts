import { httpClient } from "@/infrastructure/http/httpClient";
import { env } from "@/infrastructure/config/env";
import type { ApiResponse } from "@/infrastructure/http/apiResponse";
import type { TimelineResponse } from "@/features/dashboard/domain/model/timelineEvent";
import type { TimelineProgress } from "@/features/dashboard/domain/state/timelineState";
import type { Period } from "@/features/dashboard/domain/model/period";

export async function fetchTimeline(
  ticker: string,
  chartInterval: Period,
  signal?: AbortSignal,
): Promise<TimelineResponse> {
  // §18.2: enrich_titles 파라미터 생략 — backend default(True)로 항상 LLM 타이틀.
  const res = await httpClient<ApiResponse<TimelineResponse>>(
    `/api/v1/history-agent/timeline?ticker=${encodeURIComponent(ticker)}&chartInterval=${chartInterval}`,
    { signal }
  );
  return res.data;
}

export function streamTimeline(
  ticker: string,
  chartInterval: Period,
  onProgress: (progress: TimelineProgress) => void,
  signal?: AbortSignal,
): Promise<TimelineResponse> {
  return new Promise((resolve, reject) => {
    // §18.2: enrich_titles 생략 — backend default(True).
    const url = `${env.apiBaseUrl}/api/v1/history-agent/timeline/stream?ticker=${encodeURIComponent(ticker)}&chartInterval=${chartInterval}`;

    fetch(url, {
      credentials: "include",
      headers: { Accept: "text/event-stream" },
      signal,
    })
      .then(async (response) => {
        if (!response.ok || !response.body) {
          reject(new Error(`HTTP ${response.status}`));
          return;
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const chunks = buffer.split("\n\n");
          buffer = chunks.pop() ?? "";

          for (const chunk of chunks) {
            if (!chunk.trim()) continue;

            let eventName = "message";
            let eventData = "";

            for (const line of chunk.split("\n")) {
              if (line.startsWith("event: ")) eventName = line.slice(7);
              else if (line.startsWith("data: ")) eventData = line.slice(6);
            }

            if (eventName === "progress") {
              onProgress(JSON.parse(eventData) as TimelineProgress);
            } else if (eventName === "done") {
              resolve(JSON.parse(eventData) as TimelineResponse);
              return;
            } else if (eventName === "error") {
              const { message } = JSON.parse(eventData) as { message: string };
              reject(new Error(message));
              return;
            }
          }
        }
      })
      .catch(reject);
  });
}
