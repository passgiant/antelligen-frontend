"use client";

import { useEffect } from "react";
import { useAtomValue, useSetAtom } from "jotai";
import { tickerAtom } from "@/features/dashboard/application/atoms/tickerAtom";
import { chartIntervalAtom } from "@/features/dashboard/application/atoms/chartIntervalAtom";
import { anomalyBarsAtom } from "@/features/dashboard/application/atoms/anomalyBarsAtom";
import { fetchAnomalyBars } from "@/features/dashboard/infrastructure/api/anomalyBarsApi";

export function useAnomalyBars() {
  const ticker = useAtomValue(tickerAtom);
  const chartInterval = useAtomValue(chartIntervalAtom);
  const setState = useSetAtom(anomalyBarsAtom);

  useEffect(() => {
    const effectiveTicker = ticker ?? "NVDA";
    setState({ status: "LOADING" });

    const controller = new AbortController();
    fetchAnomalyBars(effectiveTicker, chartInterval, controller.signal)
      .then((data) => {
        setState({
          status: "SUCCESS",
          ticker: data.ticker,
          chart_interval: data.chart_interval,
          events: data.events,
        });
      })
      .catch((err) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setState({
          status: "ERROR",
          message: "이상치 봉 데이터를 불러오는데 실패했습니다.",
        });
      });

    return () => controller.abort();
  }, [ticker, chartInterval, setState]);
}
