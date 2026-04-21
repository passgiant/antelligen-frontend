"use client";

import { useState } from "react";
import { useAtomValue } from "jotai";
import { economicScheduleAtom } from "@/features/dashboard/application/atoms/economicScheduleAtom";
import { useEconomicSchedule } from "@/features/dashboard/application/hooks/useEconomicSchedule";
import type {
  EventImpactAnalysis,
  ScheduleImportance,
} from "@/features/dashboard/domain/model/economicSchedule";
import ScheduleCalendar from "@/features/dashboard/ui/components/ScheduleCalendar";

const IMPORTANCE_LABEL: Record<ScheduleImportance, string> = {
  HIGH: "중요",
  MEDIUM: "보통",
  LOW: "낮음",
};

const IMPORTANCE_BADGE: Record<ScheduleImportance, string> = {
  HIGH: "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300",
  MEDIUM: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  LOW: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
};

function formatDateTime(value: string): string {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(
    date.getHours()
  )}:${pad(date.getMinutes())}`;
}

function AnalysisCard({ item }: { item: EventImpactAnalysis }) {
  return (
    <div className="rounded-xl border border-indigo-200 bg-indigo-50/60 p-4 dark:border-indigo-900/60 dark:bg-indigo-900/20">
      <div className="flex flex-wrap items-center gap-2">
        <span
          className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${IMPORTANCE_BADGE[item.importance]}`}
        >
          {IMPORTANCE_LABEL[item.importance]}
        </span>
        {item.eventCountry && (
          <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
            {item.eventCountry}
          </span>
        )}
        <span className="text-xs text-zinc-500 dark:text-zinc-400">
          {formatDateTime(item.eventAt)}
        </span>
        {item.direction && (
          <span className="ml-auto rounded-full bg-indigo-200/70 px-2 py-0.5 text-[11px] font-semibold text-indigo-800 dark:bg-indigo-800/40 dark:text-indigo-200">
            {item.direction}
          </span>
        )}
      </div>

      <p className="mt-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
        {item.eventTitle}
      </p>

      {item.summary && (
        <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
          {item.summary}
        </p>
      )}

      {item.impactTags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {item.impactTags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-white px-2 py-0.5 text-[11px] font-medium text-indigo-700 shadow-sm dark:bg-zinc-900/60 dark:text-indigo-300"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {(item.keyDrivers.length > 0 || item.risks.length > 0) && (
        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {item.keyDrivers.length > 0 && (
            <div>
              <p className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                핵심 드라이버
              </p>
              <ul className="mt-1 space-y-0.5 text-xs text-zinc-700 dark:text-zinc-300">
                {item.keyDrivers.map((d, i) => (
                  <li key={i} className="flex gap-1">
                    <span className="text-emerald-500">•</span>
                    <span>{d}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {item.risks.length > 0 && (
            <div>
              <p className="text-[11px] font-semibold text-rose-700 dark:text-rose-400">리스크</p>
              <ul className="mt-1 space-y-0.5 text-xs text-zinc-700 dark:text-zinc-300">
                {item.risks.map((r, i) => (
                  <li key={i} className="flex gap-1">
                    <span className="text-rose-500">•</span>
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function SchedulePanel() {
  useEconomicSchedule();

  const state = useAtomValue(economicScheduleAtom);
  const [isAnalysisOpen, setIsAnalysisOpen] = useState(false);

  return (
    <div className="w-full">
      <h3 className="mb-4 text-center text-sm font-semibold text-zinc-500 dark:text-zinc-400">
        경제 일정 알림
      </h3>

      <div className="rounded-3xl border border-zinc-200 bg-white/60 p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/40">
        {state.status === "LOADING" && (
          <div className="space-y-3">
            <div className="h-32 animate-pulse rounded-xl bg-zinc-100 dark:bg-zinc-800/60" />
            <div className="h-16 animate-pulse rounded-xl bg-zinc-100 dark:bg-zinc-800/60" />
          </div>
        )}

        {state.status === "ERROR" && (
          <div className="rounded-xl bg-rose-50 p-5 text-center dark:bg-rose-900/20">
            <p className="text-sm font-medium text-rose-700 dark:text-rose-300">
              {state.message}
            </p>
          </div>
        )}

        {state.status === "SUCCESS" && (() => {
          const { analyses, upcomingEvents } = state.data;
          const isEmpty = analyses.length === 0 && upcomingEvents.length === 0;

          if (isEmpty) {
            return (
              <div className="rounded-xl bg-zinc-50 p-8 text-center dark:bg-zinc-800/40">
                <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                  예정된 경제 일정이 없습니다
                </p>
              </div>
            );
          }

          return (
            <div className="space-y-5">
              <section>
                {upcomingEvents.length > 0 ? (
                  <ScheduleCalendar events={upcomingEvents} />
                ) : (
                  <>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-600 dark:text-zinc-400">
                      다가오는 경제 일정
                    </p>
                    <p className="rounded-xl bg-zinc-50 p-4 text-center text-xs text-zinc-500 dark:bg-zinc-800/40 dark:text-zinc-400">
                      예정된 경제 일정이 없습니다
                    </p>
                  </>
                )}
              </section>

              {analyses.length > 0 && (
                <section>
                  <button
                    type="button"
                    onClick={() => setIsAnalysisOpen((v) => !v)}
                    aria-expanded={isAnalysisOpen}
                    className="flex w-full items-center justify-between rounded-xl border border-indigo-200 bg-indigo-50/60 px-4 py-2.5 text-left transition-colors hover:bg-indigo-100/70 dark:border-indigo-900/60 dark:bg-indigo-900/20 dark:hover:bg-indigo-900/30"
                  >
                    <span className="flex items-center gap-2">
                      <span className="text-xs font-semibold uppercase tracking-wide text-indigo-600 dark:text-indigo-400">
                        오늘의 매크로 분석
                      </span>
                      <span className="rounded-full bg-indigo-200/70 px-2 py-0.5 text-[10px] font-semibold text-indigo-800 dark:bg-indigo-800/40 dark:text-indigo-200">
                        {analyses.length}
                      </span>
                    </span>
                    <span
                      className={`text-indigo-600 transition-transform dark:text-indigo-400 ${
                        isAnalysisOpen ? "rotate-180" : ""
                      }`}
                      aria-hidden
                    >
                      ▾
                    </span>
                  </button>

                  {isAnalysisOpen && (
                    <div className="mt-3 space-y-3">
                      {analyses.map((item) => (
                        <AnalysisCard key={item.id} item={item} />
                      ))}
                    </div>
                  )}
                </section>
              )}
            </div>
          );
        })()}
      </div>
    </div>
  );
}
