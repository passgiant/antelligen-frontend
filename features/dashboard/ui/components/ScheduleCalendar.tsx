"use client";

import { useMemo, useState } from "react";
import type {
  EconomicSchedule,
  ScheduleImportance,
} from "@/features/dashboard/domain/model/economicSchedule";

const IMPORTANCE_LABEL: Record<ScheduleImportance, string> = {
  HIGH: "중요",
  MEDIUM: "보통",
  LOW: "낮음",
};

const IMPORTANCE_DOT: Record<ScheduleImportance, string> = {
  HIGH: "bg-rose-500",
  MEDIUM: "bg-amber-500",
  LOW: "bg-zinc-400",
};

const IMPORTANCE_BADGE: Record<ScheduleImportance, string> = {
  HIGH: "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300",
  MEDIUM: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  LOW: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
};

const WEEKDAY_LABELS = ["월", "화", "수", "목", "금", "토", "일"];

function toDateKey(value: string): string {
  if (!value) return "";
  return value.slice(0, 10);
}

function startOfWeek(date: Date): Date {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d;
}

function formatKey(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function formatTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function groupByDate(events: EconomicSchedule[]): Map<string, EconomicSchedule[]> {
  const map = new Map<string, EconomicSchedule[]>();
  for (const ev of events) {
    const key = toDateKey(ev.releaseAt);
    if (!key) continue;
    const list = map.get(key) ?? [];
    list.push(ev);
    map.set(key, list);
  }
  for (const [, list] of map) {
    list.sort((a, b) => a.releaseAt.localeCompare(b.releaseAt));
  }
  return map;
}

interface Props {
  events: EconomicSchedule[];
}

export default function ScheduleCalendar({ events }: Props) {
  const [rangeDays, setRangeDays] = useState<7 | 14>(7);

  const { days, eventsByDate, todayKey } = useMemo(() => {
    const today = new Date();
    const weekStart = startOfWeek(today);

    const list: Date[] = [];
    for (let i = 0; i < rangeDays; i++) {
      const d = new Date(weekStart);
      d.setDate(weekStart.getDate() + i);
      list.push(d);
    }

    return {
      days: list,
      eventsByDate: groupByDate(events),
      todayKey: formatKey(today),
    };
  }, [events, rangeDays]);

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-600 dark:text-zinc-400">
          다가오는 경제 일정
        </p>
        <div className="inline-flex rounded-full bg-zinc-100 p-0.5 text-xs dark:bg-zinc-800">
          {([7, 14] as const).map((days) => (
            <button
              key={days}
              type="button"
              onClick={() => setRangeDays(days)}
              className={`rounded-full px-3 py-1 font-semibold transition-colors ${
                rangeDays === days
                  ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-700 dark:text-zinc-100"
                  : "text-zinc-500 dark:text-zinc-400"
              }`}
            >
              {days}일
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1.5">
        {WEEKDAY_LABELS.map((label) => (
          <div
            key={label}
            className="text-center text-[11px] font-semibold text-zinc-500 dark:text-zinc-400"
          >
            {label}
          </div>
        ))}

        {days.map((date, idx) => {
          const key = formatKey(date);
          const dayEvents = eventsByDate.get(key) ?? [];
          const isToday = key === todayKey;
          const hasEvents = dayEvents.length > 0;
          const popoverOnLeft = idx % 7 >= 5;

          return (
            <div
              key={key}
              className={`group relative flex min-h-[96px] flex-col gap-1 rounded-lg border p-1.5 ${
                isToday
                  ? "border-indigo-400 bg-indigo-50 dark:border-indigo-700 dark:bg-indigo-900/30"
                  : "border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"
              } ${hasEvents ? "cursor-pointer hover:border-indigo-400 hover:shadow-md" : ""}`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`text-[11px] font-bold ${
                    isToday
                      ? "text-indigo-600 dark:text-indigo-300"
                      : "text-zinc-700 dark:text-zinc-300"
                  }`}
                >
                  {date.getDate()}
                </span>
                {dayEvents.length > 0 && (
                  <span className="rounded-full bg-zinc-200 px-1.5 py-0.5 text-[10px] font-semibold text-zinc-700 dark:bg-zinc-700 dark:text-zinc-200">
                    {dayEvents.length}
                  </span>
                )}
              </div>

              <div className="flex flex-1 flex-wrap items-start content-start gap-1">
                {dayEvents.map((ev) => (
                  <span
                    key={ev.id}
                    className={`inline-block h-2 w-2 rounded-full ${IMPORTANCE_DOT[ev.importance]}`}
                  />
                ))}
              </div>

              {hasEvents && (
                <div
                  className={`pointer-events-none invisible absolute top-full z-30 mt-2 flex max-h-[70vh] w-72 flex-col rounded-xl border border-zinc-200 bg-white p-3 text-left opacity-0 shadow-xl transition-opacity before:absolute before:-top-2 before:left-0 before:right-0 before:h-2 before:content-[''] group-hover:pointer-events-auto group-hover:visible group-hover:opacity-100 dark:border-zinc-700 dark:bg-zinc-900 ${
                    popoverOnLeft ? "right-0" : "left-0"
                  }`}
                >
                  <p className="mb-2 shrink-0 text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                    {formatKey(date)} · {dayEvents.length}건
                  </p>
                  <ul className="space-y-2 overflow-y-auto pr-1">
                    {dayEvents.map((ev) => (
                      <li key={ev.id} className="flex gap-2">
                        <span
                          className={`mt-1 h-2 w-2 shrink-0 rounded-full ${IMPORTANCE_DOT[ev.importance]}`}
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span
                              className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${IMPORTANCE_BADGE[ev.importance]}`}
                            >
                              {IMPORTANCE_LABEL[ev.importance]}
                            </span>
                            {ev.country && (
                              <span className="text-[10px] font-medium text-zinc-500 dark:text-zinc-400">
                                {ev.country}
                              </span>
                            )}
                            <span className="text-[10px] text-zinc-500 dark:text-zinc-400">
                              {formatTime(ev.releaseAt)}
                            </span>
                          </div>
                          <p className="mt-0.5 text-xs font-semibold leading-snug text-zinc-900 dark:text-zinc-100">
                            {ev.eventName}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
