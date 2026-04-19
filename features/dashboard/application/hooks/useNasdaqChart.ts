"use client";

import { useEffect } from "react";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { nasdaqAtom } from "@/features/dashboard/application/atoms/nasdaqAtom";
import { dashboardAtom } from "@/features/dashboard/application/atoms/dashboardAtom";
import { periodAtom } from "@/features/dashboard/application/atoms/periodAtom";
import { tickerAtom } from "@/features/dashboard/application/atoms/tickerAtom";
import { companyNameAtom } from "@/features/dashboard/application/atoms/companyNameAtom";
import { fetchNasdaqBars } from "@/features/dashboard/infrastructure/api/nasdaqApi";
import { fetchStockBars } from "@/features/dashboard/infrastructure/api/stockBarsApi";
import { HttpError } from "@/infrastructure/http/httpClient";

export function useNasdaqChart() {
  const [period, setPeriod] = useAtom(periodAtom);
  const ticker = useAtomValue(tickerAtom);
  const setNasdaq = useSetAtom(nasdaqAtom);
  const setDashboard = useSetAtom(dashboardAtom);
  const setCompanyName = useSetAtom(companyNameAtom);

  useEffect(() => {
    setNasdaq({ status: "LOADING" });

    if (ticker) {
      fetchStockBars(ticker, period)
        .then(({ bars, companyName }) => {
          setNasdaq({ status: "SUCCESS", bars });
          setCompanyName(companyName);
          setDashboard({ status: "LOADED" });
        })
        .catch((err) => {
          const is404 = err instanceof HttpError && err.status === 404;
          setNasdaq({
            status: "ERROR",
            message: is404
              ? `'${ticker}' 종목을 찾을 수 없습니다.`
              : `${ticker} 데이터를 불러오는데 실패했습니다.`,
          });
          setCompanyName(null);
          setDashboard({ status: "ERROR", message: "대시보드 로딩에 실패했습니다." });
        });
    } else {
      setCompanyName(null);
      fetchNasdaqBars(period)
        .then((bars) => {
          setNasdaq({ status: "SUCCESS", bars });
          setDashboard({ status: "LOADED" });
        })
        .catch(() => {
          setNasdaq({ status: "ERROR", message: "나스닥 데이터를 불러오는데 실패했습니다." });
          setDashboard({ status: "ERROR", message: "대시보드 로딩에 실패했습니다." });
        });
    }
  }, [period, ticker, setNasdaq, setDashboard]);

  return { period, setPeriod };
}
