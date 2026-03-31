"use client";

import { useEffect, useState } from "react";
import { useAtom } from "jotai";
import { useRouter } from "next/navigation";
import { authAtom } from "@/features/auth/application/atoms/authAtom";
import { askMarketAnalysis } from "@/features/stock-recommendation/infrastructure/api/marketAnalysisApi";
import type { MarketAnalysisResponse } from "@/features/stock-recommendation/domain/model/marketAnalysis";

export function useStockRecommendation() {
  const [auth] = useAtom(authAtom);
  const router = useRouter();

  const [answer, setAnswer] = useState<MarketAnalysisResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (auth.status === "UNAUTHENTICATED") {
      router.replace("/login");
    }
  }, [auth.status, router]);

  const isReady = auth.status === "AUTHENTICATED";

  async function ask(question: string) {
    setIsLoading(true);
    setError(null);
    try {
      const result = await askMarketAnalysis({ question });
      setAnswer(result);
    } catch {
      setError("질문 처리 중 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setIsLoading(false);
    }
  }

  return { isReady, answer, isLoading, error, ask };
}
