"use client";

import { useEffect } from "react";
import { useAtomValue, useSetAtom } from "jotai";
import { tickerAtom } from "@/features/dashboard/application/atoms/tickerAtom";
import { assetProfileAtom } from "@/features/company-profile/application/atoms/assetProfileAtom";
import { fetchCompanyProfile } from "@/features/company-profile/infrastructure/api/companyProfileApi";
import { HttpError } from "@/infrastructure/http/httpClient";

const FALLBACK_TICKER = "NVDA";

export function useAssetProfile() {
  const ticker = useAtomValue(tickerAtom);
  const setState = useSetAtom(assetProfileAtom);

  useEffect(() => {
    const target = (ticker ?? FALLBACK_TICKER).trim();
    if (!target) {
      setState({ status: "IDLE" });
      return;
    }

    let cancelled = false;
    setState({ status: "LOADING" });

    fetchCompanyProfile(target)
      .then((data) => {
        if (cancelled) return;
        setState({ status: "SUCCESS", data });
      })
      .catch((err) => {
        if (cancelled) return;
        if (err instanceof HttpError && err.status === 404) {
          setState({ status: "NOT_FOUND", ticker: target });
        } else {
          setState({ status: "ERROR", message: "프로필 조회에 실패했습니다." });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [ticker, setState]);
}
