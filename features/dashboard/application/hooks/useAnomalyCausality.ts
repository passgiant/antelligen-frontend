"use client";

import { useEffect } from "react";
import { useAtomValue, useSetAtom } from "jotai";
import { selectedAnomalyBarAtom } from "@/features/dashboard/application/atoms/selectedAnomalyBarAtom";
import { anomalyCausalityAtom } from "@/features/dashboard/application/atoms/anomalyCausalityAtom";
import { fetchAnomalyCausality } from "@/features/dashboard/infrastructure/api/anomalyCausalityApi";

export function useAnomalyCausality() {
  const selected = useAtomValue(selectedAnomalyBarAtom);
  const setState = useSetAtom(anomalyCausalityAtom);

  useEffect(() => {
    if (!selected) {
      setState({ status: "IDLE" });
      return;
    }

    const { ticker, bar } = selected;
    setState({ status: "LOADING", ticker, date: bar.date });

    const controller = new AbortController();
    fetchAnomalyCausality(ticker, bar.date, controller.signal)
      .then((data) => {
        setState({
          status: "SUCCESS",
          ticker: data.ticker,
          date: String(data.date),
          hypotheses: data.hypotheses,
          cached: data.cached,
        });
      })
      .catch((err) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setState({
          status: "ERROR",
          ticker,
          date: bar.date,
          message: "인과 분석을 불러오는데 실패했습니다.",
        });
      });

    return () => controller.abort();
  }, [selected, setState]);
}
