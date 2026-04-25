"use client";

import { useEffect, useState } from "react";
import { useAtomValue } from "jotai";
import { fetchUSConcentratedBuying } from "@/features/smart-money/infrastructure/api/smartMoneyApi";
import type { USConcentratedBuyingItem } from "@/features/smart-money/domain/model/usConcentratedBuyingItem";
import { globalPortfolioRefreshAtom } from "@/features/smart-money/application/atoms/smartMoneyBootstrapAtom";

type State =
  | { status: "LOADING" }
  | { status: "ERROR"; message: string }
  | { status: "SUCCESS"; items: USConcentratedBuyingItem[] };

export function useUSConcentratedBuying(limit: number = 20) {
  const [state, setState] = useState<State>({ status: "LOADING" });
  const refreshKey = useAtomValue(globalPortfolioRefreshAtom);

  useEffect(() => {
    setState({ status: "LOADING" });
    fetchUSConcentratedBuying(limit)
      .then((items) => setState({ status: "SUCCESS", items }))
      .catch(() => setState({ status: "ERROR", message: "데이터를 불러오지 못했습니다." }));
  }, [limit, refreshKey]);

  return { usConcentratedState: state };
}
