import { atom } from "jotai";
import type { EconomicScheduleState } from "@/features/dashboard/domain/state/economicScheduleState";

export const economicScheduleAtom = atom<EconomicScheduleState>({ status: "LOADING" });
