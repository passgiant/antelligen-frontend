"use client";

import { useEffect, useRef } from "react";
import { useAtomValue, useSetAtom } from "jotai";
import { tickerAtom } from "@/features/dashboard/application/atoms/tickerAtom";
import { periodAtom } from "@/features/dashboard/application/atoms/periodAtom";
import { timelineAtom } from "@/features/dashboard/application/atoms/timelineAtom";
import { streamTimeline } from "@/features/dashboard/infrastructure/api/timelineApi";
import { enrichTitlesAtom } from "@/features/history/application/historyAtoms";

export function useTimeline() {
  const ticker = useAtomValue(tickerAtom);
  const period = useAtomValue(periodAtom);
  const periodRef = useRef(period);
  const setTimeline = useSetAtom(timelineAtom);
  const enrichTitles = useAtomValue(enrichTitlesAtom);

  useEffect(() => {
    periodRef.current = period;
  }, [period]);

  useEffect(() => {
    const effectiveTicker = ticker ?? "IXIC";

    setTimeline({ status: "LOADING" });

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 300_000);

    streamTimeline(
      effectiveTicker,
      periodRef.current,
      (progress) => {
        setTimeline({ status: "LOADING_WITH_PROGRESS", progress });
      },
      controller.signal,
      enrichTitles,
    )
      .then((data) => {
        if (data.is_etf) {
          setTimeline({
            status: "ETF",
            ticker: data.ticker,
            period: data.period,
          });
          return;
        }
        setTimeline({
          status: "SUCCESS",
          events: data.events,
          ticker: data.ticker,
          period: data.period,
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
  }, [ticker, enrichTitles, setTimeline]); // eslint-disable-line react-hooks/exhaustive-deps
}
