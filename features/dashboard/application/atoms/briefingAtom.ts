import { atom } from "jotai";
import type { BriefingState } from "@/features/dashboard/domain/state/briefingState";

export const briefingAtom = atom<BriefingState>({ status: "IDLE" });
