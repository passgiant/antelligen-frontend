"use client";

import { useEffect, useMemo, useState } from "react";
import { useAtom, useAtomValue } from "jotai";
import { selectedAnomalyBarAtom } from "@/features/dashboard/application/atoms/selectedAnomalyBarAtom";
import { anomalyCausalityAtom } from "@/features/dashboard/application/atoms/anomalyCausalityAtom";
import { anomalyBarsAtom } from "@/features/dashboard/application/atoms/anomalyBarsAtom";
import { useAnomalyCausality } from "@/features/dashboard/application/hooks/useAnomalyCausality";
import LimitsInfoModal from "@/features/dashboard/ui/components/LimitsInfoModal";
import type { AnomalyBar } from "@/features/dashboard/infrastructure/api/anomalyBarsApi";
import type {
  HypothesisConfidence,
  HypothesisLayer,
  HypothesisResult,
  HypothesisSource,
} from "@/features/dashboard/domain/model/timelineEvent";

const CONFIDENCE_LABEL: Record<HypothesisConfidence, string> = {
  HIGH: "신뢰도 상",
  MEDIUM: "신뢰도 중",
  LOW: "신뢰도 하",
};

const CONFIDENCE_BADGE: Record<HypothesisConfidence, string> = {
  HIGH: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  MEDIUM: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  LOW: "bg-zinc-500/10 text-zinc-500 dark:text-zinc-400",
};

const LAYER_LABEL: Record<HypothesisLayer, string> = {
  DIRECT: "직접",
  SUPPORTING: "보조",
  MARKET: "시장",
};

function getConfidence(h: HypothesisResult): HypothesisConfidence {
  return h.confidence ?? "LOW";
}

function getLayer(h: HypothesisResult): HypothesisLayer {
  return h.layer ?? "SUPPORTING";
}

/** 모든 hypothesis 의 sources 를 (label,url) 기준 dedupe 한다. KR4 "관련 뉴스" 펼침 섹션. */
function dedupeSources(hypotheses: HypothesisResult[]): HypothesisSource[] {
  const seen = new Set<string>();
  const out: HypothesisSource[] = [];
  for (const h of hypotheses) {
    for (const s of h.sources ?? []) {
      const key = `${s.label}|${s.url ?? ""}`;
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(s);
    }
  }
  return out;
}

/** 같은 ticker 의 다른 이상치 봉 중 target 과 가장 유사한 것 Top n.
 *
 * 유사도: 같은 direction 우선 → |return_pct| 절대 차이 작은 순 → |z_score| 차이.
 * target 봉 자체는 제외. backend 추가 필드 없이 anomalyBars 응답만으로 계산.
 */
function findSimilarEvents(target: AnomalyBar, all: AnomalyBar[], n = 3): AnomalyBar[] {
  const sameDir = all.filter(
    (b) => b.date !== target.date && b.direction === target.direction,
  );
  const scored = sameDir
    .map((b) => ({
      bar: b,
      retDiff: Math.abs(Math.abs(b.return_pct) - Math.abs(target.return_pct)),
      zDiff: Math.abs(b.z_score - target.z_score),
    }))
    .sort((a, b) => a.retDiff - b.retDiff || a.zDiff - b.zDiff);
  return scored.slice(0, n).map((x) => x.bar);
}

/** "이후 전개" 단일 셀. 한국식 색(상승 빨강/하락 파랑). null=데이터 부족 회색 "—" 표기. */
function FutureReturnCell({ label, value }: { label: string; value: number | null | undefined }) {
  const hasValue = value != null;
  const color = !hasValue
    ? "text-zinc-400 dark:text-zinc-500"
    : value >= 0
      ? "text-red-500"
      : "text-blue-500";
  const sign = hasValue ? (value >= 0 ? "+" : "") : "";
  return (
    <div className="rounded-md bg-white px-2 py-1.5 text-center dark:bg-zinc-900/40">
      <div className="text-[10px] uppercase tracking-wide text-zinc-400">{label}</div>
      <div className={`mt-0.5 text-sm font-semibold ${color}`}>
        {hasValue ? `${sign}${value.toFixed(2)}%` : "—"}
      </div>
    </div>
  );
}

export default function AnomalyCausalityPopup() {
  const [selected, setSelected] = useAtom(selectedAnomalyBarAtom);
  const state = useAtomValue(anomalyCausalityAtom);
  const barsState = useAtomValue(anomalyBarsAtom);
  const [expanded, setExpanded] = useState(false);
  const [limitsOpen, setLimitsOpen] = useState(false);
  useAnomalyCausality();

  const dedupedSources = useMemo(
    () => (state.status === "SUCCESS" ? dedupeSources(state.hypotheses) : []),
    [state],
  );

  // KR4 펼치기: 같은 ticker 의 다른 이상치 봉 중 유사도 Top 3
  const similarEvents = useMemo<AnomalyBar[]>(() => {
    if (!selected) return [];
    if (barsState.status !== "SUCCESS") return [];
    if (barsState.ticker !== selected.ticker) return [];
    return findSimilarEvents(selected.bar, barsState.events, 3);
  }, [selected, barsState]);

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
    <>
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
              {/* OKR 다층 탐지 — type 별 마커·라벨. backend default "zscore" 호환. */}
              {(() => {
                const t = bar.type ?? "zscore";
                if (t === "cumulative_5d") {
                  return (
                    <>
                      <span className="mr-1.5">🔻</span>
                      5일 누적 변동 분석
                    </>
                  );
                }
                if (t === "cumulative_20d") {
                  return (
                    <>
                      <span className="mr-1.5">📉</span>
                      20일 누적 변동 분석
                    </>
                  );
                }
                if (t === "drawdown_start") {
                  return (
                    <>
                      <span className="mr-1.5">🔽</span>
                      Drawdown 시작 분석
                    </>
                  );
                }
                if (t === "drawdown_recovery") {
                  return (
                    <>
                      <span className="mr-1.5">🔼</span>
                      Drawdown 회복 분석
                    </>
                  );
                }
                if (t === "volatility_cluster") {
                  return (
                    <>
                      <span className="mr-1.5">⚡</span>
                      변동성 클러스터 분석
                      {bar.cluster_size != null && (
                        <span className="ml-2 text-xs font-normal text-zinc-500 dark:text-zinc-400">
                          ({bar.cluster_size}건
                          {bar.cluster_end_date ? ` · ~${bar.cluster_end_date}` : ""})
                        </span>
                      )}
                    </>
                  );
                }
                return (
                  <>
                    <span className="mr-1.5 text-yellow-500">★</span>
                    이상치 봉 인과 분석
                  </>
                );
              })()}
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

        {/* Summary 그리드 — KR4 기본 카드: 방향 / 수익률(+갭·장중) / 거래량 배수 */}
        <div className="grid grid-cols-3 gap-3 bg-zinc-50 px-6 py-3 dark:bg-zinc-800/50">
          <div>
            <div className="text-[10px] uppercase tracking-wide text-zinc-400">방향</div>
            <div className={`text-sm font-semibold ${directionColor}`}>{directionLabel}</div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wide text-zinc-400">수익률</div>
            <div className={`flex items-center gap-1.5 text-sm font-semibold ${directionColor}`}>
              <span>
                {returnSign}
                {bar.return_pct.toFixed(2)}%
              </span>
              {bar.time_of_day && (
                <span
                  className="rounded-full bg-zinc-200/60 px-1.5 py-0.5 text-[9px] font-medium text-zinc-600 dark:bg-zinc-700/60 dark:text-zinc-300"
                  title={
                    bar.time_of_day === "GAP"
                      ? "갭(시초가 변동) 비중 우세 — 일봉 OHLC 근사"
                      : "장중 변동 비중 우세 — 일봉 OHLC 근사"
                  }
                >
                  {bar.time_of_day === "GAP" ? "갭" : "장중"}
                </span>
              )}
            </div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wide text-zinc-400">거래량 배수</div>
            <div
              className="text-sm font-semibold text-zinc-800 dark:text-zinc-100"
              title={`Z-score ${bar.z_score.toFixed(2)} · 평균 거래량 대비 배수`}
            >
              {bar.volume_ratio != null ? `×${bar.volume_ratio.toFixed(2)}` : "—"}
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
              {state.hypotheses.map((h, i) => {
                const confidence = getConfidence(h);
                const layer = getLayer(h);
                const isLow = confidence === "LOW";
                const sources = h.sources ?? [];
                // KR5: 신뢰도 "낮음" → 카드 전체 회색 처리. HIGH/MEDIUM 만 보라색 강조.
                const cardBg = isLow ? "bg-zinc-500/5" : "bg-purple-500/5";
                const bodyColor = isLow
                  ? "text-zinc-500 dark:text-zinc-400"
                  : "text-zinc-700 dark:text-zinc-200";
                return (
                  <li key={i} className={`rounded-lg p-3 ${cardBg}`}>
                    {/* 신뢰도 + 계층 라벨 라인 */}
                    <div className="mb-1.5 flex flex-wrap items-center gap-1.5">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${CONFIDENCE_BADGE[confidence]}`}
                      >
                        {isLow ? "⚠ " : ""}
                        {CONFIDENCE_LABEL[confidence]}
                      </span>
                      <span className="rounded-full bg-zinc-200/60 px-2 py-0.5 text-[10px] text-zinc-600 dark:bg-zinc-700/60 dark:text-zinc-300">
                        {LAYER_LABEL[layer]}
                      </span>
                    </div>

                    <p className={`text-sm leading-relaxed ${bodyColor}`}>
                      {h.hypothesis}
                    </p>

                    {h.evidence && (
                      <p className="mt-1.5 text-xs text-zinc-500 dark:text-zinc-400">
                        근거: {h.evidence}
                      </p>
                    )}

                    {sources.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {sources.map((s, j) =>
                          s.url ? (
                            <a
                              key={j}
                              href={s.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="rounded-full bg-blue-500/10 px-2 py-0.5 text-[10px] text-blue-600 hover:bg-blue-500/20 dark:text-blue-400"
                            >
                              {s.label} ↗
                            </a>
                          ) : (
                            <span
                              key={j}
                              className="rounded-full bg-zinc-200/60 px-2 py-0.5 text-[10px] text-zinc-600 dark:bg-zinc-700/60 dark:text-zinc-300"
                            >
                              {s.label}
                            </span>
                          ),
                        )}
                      </div>
                    )}

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
                );
              })}
            </ul>
          )}

          {/* KR4 펼치기 토글 + 추가 섹션 (이후 전개/관련 출처/카테고리). 수급·유사 사건은 후속 PR */}
          {state.status === "SUCCESS" && state.hypotheses.length > 0 && (
            <>
              <button
                type="button"
                onClick={() => setExpanded((v) => !v)}
                className="mt-3 flex items-center gap-1 text-xs font-medium text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
                aria-expanded={expanded}
              >
                <span>{expanded ? "▴ 접기" : "▾ 더보기"}</span>
                <span className="text-zinc-400">이후 전개 · 관련 출처 · 카테고리</span>
              </button>

              {expanded && (
                <div className="mt-3 space-y-3 rounded-lg border border-zinc-200 bg-zinc-50 p-3 text-xs dark:border-zinc-700 dark:bg-zinc-800/40">
                  <div>
                    <div className="mb-1 font-semibold text-zinc-700 dark:text-zinc-200">
                      이후 전개{" "}
                      <span className="font-normal text-zinc-400">
                        (raw, benchmark 미차감)
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <FutureReturnCell label="+1봉" value={bar.cumulative_return_1d} />
                      <FutureReturnCell label="+5봉" value={bar.cumulative_return_5d} />
                      <FutureReturnCell label="+20봉" value={bar.cumulative_return_20d} />
                    </div>
                  </div>

                  <div>
                    <div className="mb-1 font-semibold text-zinc-700 dark:text-zinc-200">
                      관련 출처
                    </div>
                    {dedupedSources.length === 0 ? (
                      <p className="text-zinc-500 dark:text-zinc-400">
                        가설에 출처가 첨부되지 않았습니다.
                      </p>
                    ) : (
                      <ul className="space-y-1">
                        {dedupedSources.map((s, i) => (
                          <li key={`${s.label}-${i}`}>
                            {s.url ? (
                              <a
                                href={s.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline dark:text-blue-400"
                              >
                                {s.label} ↗
                              </a>
                            ) : (
                              <span className="text-zinc-600 dark:text-zinc-300">
                                {s.label}
                              </span>
                            )}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <div>
                    <div className="mb-1 font-semibold text-zinc-700 dark:text-zinc-200">
                      카테고리
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      <span className="rounded-full bg-yellow-500/10 px-2 py-0.5 text-[10px] text-yellow-700 dark:text-yellow-400">
                        ★ 이상치 봉
                      </span>
                      <span className="rounded-full bg-zinc-200/60 px-2 py-0.5 text-[10px] text-zinc-600 dark:bg-zinc-700/60 dark:text-zinc-300">
                        PRICE
                      </span>
                    </div>
                  </div>

                  <div>
                    <div className="mb-1 font-semibold text-zinc-700 dark:text-zinc-200">
                      유사 과거 사건{" "}
                      <span className="font-normal text-zinc-400">
                        (같은 방향 + 변동률 근접 Top 3)
                      </span>
                    </div>
                    {similarEvents.length === 0 ? (
                      <p className="text-zinc-500 dark:text-zinc-400">
                        같은 종목의 비교 가능한 다른 이상치 봉이 없습니다.
                      </p>
                    ) : (
                      <ul className="space-y-1">
                        {similarEvents.map((b) => {
                          const isUp = b.direction === "up";
                          const color = isUp ? "text-red-500" : "text-blue-500";
                          const sign = b.return_pct >= 0 ? "+" : "";
                          return (
                            <li key={b.date}>
                              <button
                                type="button"
                                onClick={() => setSelected({ ticker, bar: b })}
                                className="flex w-full items-center justify-between gap-2 rounded-md bg-white px-2 py-1 text-left transition hover:bg-blue-50 dark:bg-zinc-900/40 dark:hover:bg-blue-500/10"
                                title="해당 봉으로 분석 점프"
                              >
                                <span className="flex items-center gap-1.5">
                                  <span className="text-zinc-400">↗</span>
                                  <span className="text-zinc-600 dark:text-zinc-300">
                                    {b.date}
                                  </span>
                                </span>
                                <span className="flex items-center gap-2">
                                  <span className={`font-semibold ${color}`}>
                                    {sign}
                                    {b.return_pct.toFixed(2)}%
                                  </span>
                                  {b.volume_ratio != null && (
                                    <span
                                      className="text-zinc-500 dark:text-zinc-400"
                                      title="평균 거래량 대비 배수"
                                    >
                                      ×{b.volume_ratio.toFixed(2)}
                                    </span>
                                  )}
                                  {b.time_of_day && (
                                    <span className="rounded-full bg-zinc-200/60 px-1.5 py-0.5 text-[9px] text-zinc-600 dark:bg-zinc-700/60 dark:text-zinc-300">
                                      {b.time_of_day === "GAP" ? "갭" : "장중"}
                                    </span>
                                  )}
                                </span>
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>

                  <p className="text-[10px] text-zinc-400 dark:text-zinc-500">
                    수급 정보(외인/기관/개인)는 후속 PR 예정.
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer — KR5 한계 인정 + cached 상태 + 한계 안내 모달 트리거 */}
        {state.status === "SUCCESS" && (
          <div className="border-t border-zinc-200 px-6 py-2 text-[10px] dark:border-zinc-800">
            <div className="flex items-center justify-between gap-2 text-zinc-500 dark:text-zinc-400">
              <span className="flex items-center gap-2">
                <span>⚠ 본 분석은 LLM 추정이며 투자 추천이 아닙니다.</span>
                <button
                  type="button"
                  onClick={() => setLimitsOpen(true)}
                  className="text-blue-600 underline-offset-2 hover:underline dark:text-blue-400"
                >
                  ⓘ 한계 알아보기
                </button>
              </span>
              <span className="shrink-0 text-zinc-400">
                {state.cached ? "캐시 히트" : "신규 생성"}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>

    <LimitsInfoModal open={limitsOpen} onClose={() => setLimitsOpen(false)} />
    </>
  );
}
