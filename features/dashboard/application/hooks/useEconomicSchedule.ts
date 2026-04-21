"use client";

import { useEffect } from "react";
import { useSetAtom } from "jotai";
import { economicScheduleAtom } from "@/features/dashboard/application/atoms/economicScheduleAtom";
import { fetchScheduleBoard } from "@/features/dashboard/infrastructure/api/scheduleApi";

export function useEconomicSchedule() {
  const setSchedule = useSetAtom(economicScheduleAtom);

  useEffect(() => {
    setSchedule({ status: "LOADING" });

    fetchScheduleBoard()
      .then((data) => {
        setSchedule({ status: "SUCCESS", data });
      })
      .catch(() => {
        setSchedule({
          status: "ERROR",
          message: "경제 일정을 불러오는데 실패했습니다.",
        });
      });
  }, [setSchedule]);
}
