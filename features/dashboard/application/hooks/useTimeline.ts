"use client";

import { useEffect } from "react";
import { useAtomValue, useSetAtom } from "jotai";
import { tickerAtom } from "@/features/dashboard/application/atoms/tickerAtom";
import { chartIntervalAtom } from "@/features/dashboard/application/atoms/chartIntervalAtom";
import { timelineAtom } from "@/features/dashboard/application/atoms/timelineAtom";
import { streamTimeline } from "@/features/dashboard/infrastructure/api/timelineApi";

export function useTimeline() {
  const ticker = useAtomValue(tickerAtom);
  const chartInterval = useAtomValue(chartIntervalAtom);
  const setTimeline = useSetAtom(timelineAtom);

  useEffect(() => {
    const effectiveTicker = ticker ?? "NVDA";

    setTimeline({ status: "LOADING" });

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 300_000);

    streamTimeline(
      effectiveTicker,
      chartInterval,
      (progress) => {
        setTimeline({ status: "LOADING_WITH_PROGRESS", progress });
      },
      controller.signal,
    )
      .then((data) => {
        const interval = data.chart_interval ?? "";
        if (data.is_etf) {
          setTimeline({
            status: "ETF",
            ticker: data.ticker,
            period: interval,
          });
          return;
        }
        setTimeline({
          status: "SUCCESS",
          events: data.events,
          ticker: data.ticker,
          period: interval,
        });
      })
      .catch((err) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setTimeline({ status: "ERROR", message: "타임라인 데이터를 불러오는데 실패했습니다." });
      })
      .finally(() => {
        clearTimeout(timeoutId);
      });

    return () => {
      controller.abort();
      clearTimeout(timeoutId);
    };
  }, [ticker, chartInterval, setTimeline]);
}
