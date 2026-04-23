"use client";

import { useEffect } from "react";
import { useAtom, useAtomValue } from "jotai";
import { selectedAnomalyBarAtom } from "@/features/dashboard/application/atoms/selectedAnomalyBarAtom";
import { anomalyCausalityAtom } from "@/features/dashboard/application/atoms/anomalyCausalityAtom";
import { useAnomalyCausality } from "@/features/dashboard/application/hooks/useAnomalyCausality";

export default function AnomalyCausalityPopup() {
  const [selected, setSelected] = useAtom(selectedAnomalyBarAtom);
  const state = useAtomValue(anomalyCausalityAtom);
  useAnomalyCausality();

  useEffect(() => {
    if (!selected) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelected(null);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [selected, setSelected]);

  if (!selected) return null;

  const { ticker, bar } = selected;
  const isUp = bar.direction === "up";
  const directionColor = isUp ? "text-red-500" : "text-blue-500";
  const directionLabel = isUp ? "상승" : "하락";
  const returnSign = bar.return_pct >= 0 ? "+" : "";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={() => setSelected(null)}
      role="dialog"
      aria-modal="true"
      aria-labelledby="anomaly-causality-title"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-700 dark:bg-zinc-900"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
          <div>
            <h2
              id="anomaly-causality-title"
              className="text-base font-bold text-zinc-900 dark:text-zinc-50"
            >
              <span className="mr-1.5 text-yellow-500">★</span>
              이상치 봉 인과 분석
            </h2>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              {ticker} · {bar.date}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setSelected(null)}
            className="rounded-md p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
            aria-label="닫기"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                d="M18 6L6 18M6 6l12 12"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        {/* Summary 그리드 */}
        <div className="grid grid-cols-3 gap-3 bg-zinc-50 px-6 py-3 dark:bg-zinc-800/50">
          <div>
            <div className="text-[10px] uppercase tracking-wide text-zinc-400">방향</div>
            <div className={`text-sm font-semibold ${directionColor}`}>{directionLabel}</div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wide text-zinc-400">수익률</div>
            <div className={`text-sm font-semibold ${directionColor}`}>
              {returnSign}
              {bar.return_pct.toFixed(2)}%
            </div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wide text-zinc-400">Z-score</div>
            <div className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">
              {bar.z_score.toFixed(2)}
            </div>
          </div>
        </div>

        {/* Body — 스크롤 */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <h3 className="mb-2 text-sm font-semibold text-zinc-800 dark:text-zinc-100">
            인과 가설
          </h3>

          {state.status === "LOADING" && (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="mb-3 h-8 w-8 animate-spin rounded-full border-2 border-purple-500/20 border-t-purple-500" />
              <p className="text-sm font-medium text-zinc-700 dark:text-zinc-200">
                인과 관계를 분석 중입니다
              </p>
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                최초 요청은 최대 1분이 소요됩니다. 이후에는 캐시에서 즉시 표시됩니다.
              </p>
            </div>
          )}

          {state.status === "ERROR" && (
            <p className="text-sm text-red-500">{state.message}</p>
          )}

          {state.status === "SUCCESS" && state.hypotheses.length === 0 && (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              이 봉에 대한 인과 가설이 아직 없습니다.
            </p>
          )}

          {state.status === "SUCCESS" && state.hypotheses.length > 0 && (
            <ul className="space-y-2">
              {state.hypotheses.map((h, i) => (
                <li key={i} className="rounded-lg bg-purple-500/5 p-3">
                  <p className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-200">
                    {h.hypothesis}
                  </p>
                  {h.supporting_tools_called.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {h.supporting_tools_called.map((tool) => (
                        <span
                          key={tool}
                          className="rounded-full bg-purple-500/10 px-1.5 py-0.5 text-[10px] text-purple-500"
                        >
                          {tool}
                        </span>
                      ))}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer — 고정, cached 뱃지 */}
        {state.status === "SUCCESS" && (
          <div className="border-t border-zinc-200 px-6 py-2 text-right text-[10px] text-zinc-400 dark:border-zinc-800">
            {state.cached ? "캐시 히트" : "신규 생성"}
          </div>
        )}
      </div>
    </div>
  );
}
