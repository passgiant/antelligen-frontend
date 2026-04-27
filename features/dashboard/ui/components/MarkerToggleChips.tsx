"use client";

import { useAtom } from "jotai";
import {
  markerVisibilityAtom,
  type MarkerVisibility,
} from "@/features/dashboard/application/atoms/markerVisibilityAtom";
import type { AnomalyBarType } from "@/features/dashboard/infrastructure/api/anomalyBarsApi";

// KR7 — 사용자 마커 토글 chips. 차트 위 row 에 배치.

const MARKER_ORDER: AnomalyBarType[] = [
  "zscore",
  "cumulative_5d",
  "cumulative_20d",
  "drawdown_start",
  "drawdown_recovery",
  "volatility_cluster",
];

const MARKER_LABEL: Record<AnomalyBarType, { icon: string; text: string }> = {
  zscore:             { icon: "★",  text: "급등락" },
  cumulative_5d:      { icon: "🔻", text: "5일 누적" },
  cumulative_20d:     { icon: "📉", text: "20일 누적" },
  drawdown_start:     { icon: "🔽", text: "Drawdown 시작" },
  drawdown_recovery:  { icon: "🔼", text: "Drawdown 회복" },
  volatility_cluster: { icon: "⚡", text: "변동성 클러스터" },
};

const ACTIVE_STYLE: Record<AnomalyBarType, string> = {
  zscore:             "bg-yellow-500/20 text-yellow-700 dark:text-yellow-300",
  cumulative_5d:      "bg-orange-500/20 text-orange-600 dark:text-orange-300",
  cumulative_20d:     "bg-red-600/20 text-red-700 dark:text-red-300",
  drawdown_start:     "bg-violet-600/20 text-violet-700 dark:text-violet-300",
  drawdown_recovery:  "bg-emerald-600/20 text-emerald-700 dark:text-emerald-300",
  volatility_cluster: "bg-amber-500/20 text-amber-700 dark:text-amber-300",
};

export default function MarkerToggleChips() {
  const [visibility, setVisibility] = useAtom(markerVisibilityAtom);

  const toggle = (key: AnomalyBarType) => {
    const next: MarkerVisibility = { ...visibility, [key]: !visibility[key] };
    setVisibility(next);
  };

  return (
    <div className="flex flex-wrap gap-1.5">
      {MARKER_ORDER.map((key) => {
        const isActive = visibility[key];
        const label = MARKER_LABEL[key];
        return (
          <button
            key={key}
            type="button"
            onClick={() => toggle(key)}
            aria-pressed={isActive}
            className={`rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors ${
              isActive
                ? ACTIVE_STYLE[key]
                : "bg-zinc-100 text-zinc-400 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-500 dark:hover:bg-zinc-700"
            }`}
          >
            <span className="mr-1">{label.icon}</span>
            {label.text}
          </button>
        );
      })}
    </div>
  );
}
