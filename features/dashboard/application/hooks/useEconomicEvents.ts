"use client";

import { useEffect } from "react";
import { useSetAtom } from "jotai";
import { economicEventAtom } from "@/features/dashboard/application/atoms/economicEventAtom";
import { fetchEconomicEvents } from "@/features/dashboard/infrastructure/api/economicEventApi";

export function useEconomicEvents() {
  const setEvents = useSetAtom(economicEventAtom);

  useEffect(() => {
    setEvents({ status: "LOADING" });

    fetchEconomicEvents("1Y")
      .then((events) => {
        setEvents({ status: "SUCCESS", events });
      })
      .catch(() => {
        setEvents({ status: "ERROR", message: "이벤트 데이터를 불러오는데 실패했습니다." });
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
