"use client";

import { useEffect, useRef, useState } from "react";
import { useSetAtom } from "jotai";
import { checkKrPortfolioHasData, triggerCollectKrPortfolio } from "@/features/smart-money/infrastructure/api/smartMoneyApi";
import { krPortfolioRefreshAtom } from "@/features/smart-money/application/atoms/smartMoneyBootstrapAtom";

type BootstrapState = "idle" | "collecting" | "error";

export default function KrPortfolioBootstrap() {
  const [state, setState] = useState<BootstrapState>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const triggered = useRef(false);
  const setRefresh = useSetAtom(krPortfolioRefreshAtom);

  useEffect(() => {
    if (triggered.current) return;
    triggered.current = true;

    (async () => {
      try {
        const hasData = await checkKrPortfolioHasData();
        if (hasData) return;

        setState("collecting");
        await triggerCollectKrPortfolio();
        setRefresh((prev) => prev + 1);
        setState("idle");
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        setErrorMsg(msg.includes("OPEN_DART_API_KEY")
          ? ".env에 OPEN_DART_API_KEY가 설정되지 않았습니다."
          : "국내 포트폴리오 수집 중 오류가 발생했습니다. 서버 로그를 확인하세요."
        );
        setState("error");
      }
    })();
  }, [setRefresh]);

  if (state === "idle") return null;

  if (state === "error") {
    return (
      <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300">
        ⚠ {errorMsg}
      </div>
    );
  }

  return (
    <div className="mb-4 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700 dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-300">
      <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
      국내 포트폴리오 데이터를 수집하는 중입니다 (KOSPI 150종목 DART API 조회)... 잠시 기다려주세요.
    </div>
  );
}
