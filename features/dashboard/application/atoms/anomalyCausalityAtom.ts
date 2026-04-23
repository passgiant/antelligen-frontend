import { atom } from "jotai";
import type { HypothesisResult } from "@/features/dashboard/domain/model/timelineEvent";

export type AnomalyCausalityState =
  | { status: "IDLE" }
  | { status: "LOADING"; ticker: string; date: string }
  | {
      status: "SUCCESS";
      ticker: string;
      date: string;
      hypotheses: HypothesisResult[];
      cached: boolean;
    }
  | { status: "ERROR"; ticker: string; date: string; message: string };

export const anomalyCausalityAtom = atom<AnomalyCausalityState>({ status: "IDLE" });
