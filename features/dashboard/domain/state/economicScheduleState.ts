import type { ScheduleBoard } from "@/features/dashboard/domain/model/economicSchedule";

export type EconomicScheduleState =
  | { status: "LOADING" }
  | { status: "SUCCESS"; data: ScheduleBoard }
  | { status: "ERROR"; message: string };
