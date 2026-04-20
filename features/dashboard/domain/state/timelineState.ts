import type { TimelineEvent } from "@/features/dashboard/domain/model/timelineEvent";

export type TimelineProgress = {
  step: string;
  label: string;
  pct: number;
};

export type TimelineState =
  | { status: "IDLE" }
  | { status: "LOADING" }
  | { status: "LOADING_WITH_PROGRESS"; progress: TimelineProgress }
  | { status: "SUCCESS"; events: TimelineEvent[]; ticker: string; period: string }
  | { status: "ETF"; ticker: string; period: string }
  | { status: "ERROR"; message: string };
