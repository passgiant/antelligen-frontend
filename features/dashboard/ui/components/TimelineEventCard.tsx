"use client";

import { useState } from "react";
import type { TimelineEvent, TimelineCategory } from "@/features/dashboard/domain/model/timelineEvent";

const CATEGORY_STYLE: Record<TimelineCategory, { bg: string; text: string; label: string }> = {
  PRICE:        { bg: "bg-amber-500/10",   text: "text-amber-500",   label: "가격" },
  CORPORATE:    { bg: "bg-blue-500/10",    text: "text-blue-500",    label: "기업" },
  ANNOUNCEMENT: { bg: "bg-emerald-500/10", text: "text-emerald-500", label: "공시" },
};

interface Props {
  event: TimelineEvent;
  eventIdx: number;
  isLast?: boolean;
  isSelected?: boolean;
  cardRef?: (el: HTMLDivElement | null) => void;
  titleOverride?: string | null;
  isTitleLoading?: boolean;
  onClick?: (idx: number, event: TimelineEvent) => void;
}

export default function TimelineEventCard({ event, eventIdx, isLast = false, isSelected = false, cardRef, titleOverride, isTitleLoading = false, onClick }: Props) {
  const [causalityOpen, setCausalityOpen] = useState(false);
  const style = CATEGORY_STYLE[event.category];

  return (
    <div
      ref={cardRef}
      className="relative flex gap-3"
      data-history-event-id={eventIdx}
      onClick={() => onClick?.(eventIdx, event)}
      style={{ cursor: onClick ? "pointer" : undefined }}
    >
      {/* 세로 라인 */}
      <div className="flex flex-col items-center">
        <div className={`mt-1 h-2.5 w-2.5 flex-shrink-0 rounded-full transition-colors ${isSelected ? "bg-purple-500" : "bg-zinc-300 dark:bg-zinc-600"}`} />
        {!isLast && (
          <div className="mt-1 flex-1 w-px bg-zinc-200 dark:bg-zinc-700" />
        )}
      </div>

      {/* 카드 내용 */}
      <div className={`mb-4 flex-1 rounded-xl border p-3 transition-colors ${isSelected ? "border-purple-400 bg-purple-50 dark:border-purple-700 dark:bg-purple-900/20" : "border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-800/50"}`}>
        {/* 날짜 + 카테고리 */}
        <div className="mb-1.5 flex items-center justify-between gap-2">
          <span className="text-xs text-zinc-400">{event.date}</span>
          <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${style.bg} ${style.text}`}>
            {style.label}
          </span>
        </div>

        {/* 타이틀 */}
        {isTitleLoading ? (
          <div className="mb-1 h-4 w-3/4 animate-pulse rounded bg-zinc-200 dark:bg-zinc-700" />
        ) : (
          <p className={`mb-1 text-sm font-semibold text-zinc-800 dark:text-zinc-100 ${titleOverride != null ? "animate-title-fade-in" : ""}`}>
            {titleOverride ?? event.title}
          </p>
        )}

        {/* 상세 내용 */}
        <p className="text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
          {event.detail}
        </p>

        {/* 출처 링크 */}
        {event.url && (
          <a
            href={event.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1.5 inline-block text-xs text-blue-500 hover:underline"
          >
            {event.source ?? "출처 보기"}
          </a>
        )}

        {/* 인과관계 아코디언 */}
        {event.causality && event.causality.length > 0 && (
          <div className="mt-2">
            <button
              type="button"
              onClick={() => setCausalityOpen((prev) => !prev)}
              className="flex items-center gap-1 text-xs font-medium text-purple-500 hover:text-purple-600"
            >
              <span>인과 분석 ({event.causality.length})</span>
              <span className={`transition-transform ${causalityOpen ? "rotate-90" : ""}`}>▶</span>
            </button>

            {causalityOpen && (
              <ul className="mt-2 space-y-2">
                {event.causality.map((item, idx) => (
                  <li key={idx} className="rounded-lg bg-purple-500/5 p-2">
                    <p className="text-xs text-zinc-600 dark:text-zinc-300">{item.hypothesis}</p>
                    {item.supporting_tools_called.length > 0 && (
                      <div className="mt-1 flex flex-wrap gap-1">
                        {item.supporting_tools_called.map((tool) => (
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
        )}
      </div>
    </div>
  );
}
