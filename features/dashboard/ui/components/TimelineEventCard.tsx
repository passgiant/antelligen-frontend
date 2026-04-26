"use client";

import { useAtomValue, useSetAtom } from "jotai";
import type { TimelineEvent, TimelineCategory } from "@/features/dashboard/domain/model/timelineEvent";
import {
  expandedTimelineEventsAtom,
  toggleExpandedTimelineEventAtom,
} from "@/features/dashboard/application/atoms/expandedTimelineAtom";
import {
  getTimelineColor,
  getTimelineSizeTokens,
} from "@/features/dashboard/domain/model/timelineEventTheme";
import ARBadge from "@/features/dashboard/ui/components/ARBadge";

const AR_STATUS_LABEL: Record<string, string> = {
  INSUFFICIENT_DATA: "거래일 부족",
  BENCHMARK_MISSING: "벤치마크 없음",
  BENCHMARK_DATA_MISSING: "벤치마크 데이터 없음",
  STOCK_DATA_MISSING: "종목 데이터 없음",
};

type CategoryStyle = { bg: string; text: string; label: string };

const CATEGORY_STYLE: Record<TimelineCategory, CategoryStyle> = {
  CORPORATE:    { bg: "bg-blue-500/10",    text: "text-blue-500",    label: "기업" },
  ANNOUNCEMENT: { bg: "bg-emerald-500/10", text: "text-emerald-500", label: "공시" },
  MACRO:        { bg: "bg-violet-500/10",  text: "text-violet-500",  label: "매크로" },
};

const FALLBACK_STYLE: CategoryStyle = { bg: "bg-zinc-500/10", text: "text-zinc-500", label: "기타" };

// ANNOUNCEMENT 세분류 라벨 (8-K Item / DART 보고서 기반).
const ANNOUNCEMENT_TYPE_LABEL: Record<string, string> = {
  MERGER_ACQUISITION: "합병·인수",
  CONTRACT: "계약",
  MANAGEMENT_CHANGE: "경영진 변경",
  ACCOUNTING_ISSUE: "회계 이슈",
  REGULATORY: "규제·소송",
  PRODUCT_LAUNCH: "신제품·신기술",
  CRISIS: "위기 사건",
  MAJOR_EVENT: "주요사항",
  // v2 (KR A.1 신규 분리)
  EARNINGS_RELEASE: "실적 발표",
  DEBT_ISSUANCE: "회사채 발행",
  SHAREHOLDER_MEETING: "주주총회",
  REGULATION_FD: "공정공시",
  ARTICLES_AMENDMENT: "정관 개정",  // 8-K Item 5.03 정관·부속법 개정
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
  const expandedSet = useAtomValue(expandedTimelineEventsAtom);
  const toggleExpanded = useSetAtom(toggleExpandedTimelineEventAtom);
  const isExpanded = expandedSet.has(eventIdx);

  const categoryStyle = CATEGORY_STYLE[event.category] ?? FALLBACK_STYLE;
  const colorTokens = getTimelineColor(event);
  const sizeTokens = getTimelineSizeTokens(event);

  const cardSurfaceClass = isSelected
    ? "border-purple-400 bg-purple-50 dark:border-purple-700 dark:bg-purple-900/20"
    : "border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-800/50";

  const stopPropagation = (e: React.MouseEvent) => e.stopPropagation();

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleExpanded(eventIdx);
  };

  const detailTypeLabel =
    event.category === "ANNOUNCEMENT" ? ANNOUNCEMENT_TYPE_LABEL[event.type] : null;

  return (
    <div
      ref={cardRef}
      className="relative flex gap-3"
      data-history-event-id={eventIdx}
      onClick={() => onClick?.(eventIdx, event)}
      style={{ cursor: onClick ? "pointer" : undefined }}
    >
      {/* 세로 라인 + 점(type 색) */}
      <div className="flex flex-col items-center">
        <div
          className={`mt-1 ${sizeTokens.dot} flex-shrink-0 rounded-full transition-colors ${
            isSelected ? "bg-purple-500" : colorTokens.dot
          }`}
        />
        {!isLast && (
          <div className="mt-1 flex-1 w-px bg-zinc-200 dark:bg-zinc-700" />
        )}
      </div>

      {/* 카드 본체: 좌측 보더에 type 색, 패딩은 size 토큰 */}
      <div
        className={`mb-4 flex-1 rounded-xl border border-l-4 ${colorTokens.borderLeft} ${sizeTokens.cardPadding} transition-colors ${cardSurfaceClass}`}
      >
        {/* 상단: 날짜 + 카테고리 칩 + 세부 type 칩 + ▾ 토글 */}
        <div className="mb-1.5 flex items-center justify-between gap-2">
          <span className="text-xs text-zinc-400">{event.date}</span>
          <span className="flex items-center gap-1">
            {detailTypeLabel && (
              <span
                className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium ${colorTokens.chipBg} ${colorTokens.chipText}`}
              >
                {detailTypeLabel}
              </span>
            )}
            <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${categoryStyle.bg} ${categoryStyle.text}`}>
              {categoryStyle.label}
            </span>
            <button
              type="button"
              onClick={handleToggle}
              aria-expanded={isExpanded}
              aria-label={isExpanded ? "상세 접기" : "상세 펼치기"}
              className="flex h-5 w-5 items-center justify-center rounded text-zinc-400 transition-colors hover:bg-zinc-200/60 hover:text-zinc-600 dark:hover:bg-zinc-700/60 dark:hover:text-zinc-200"
            >
              <span className={`text-xs transition-transform ${isExpanded ? "rotate-180" : ""}`}>▾</span>
            </button>
          </span>
        </div>

        {/* 타이틀 */}
        {isTitleLoading ? (
          <div className="mb-1 h-4 w-3/4 animate-pulse rounded bg-zinc-200 dark:bg-zinc-700" />
        ) : (
          <p
            className={`${sizeTokens.titleClass} text-zinc-800 dark:text-zinc-100 ${titleOverride != null ? "animate-title-fade-in" : ""}`}
          >
            {titleOverride ?? event.title}
          </p>
        )}

        {/* expand 영역: detail / source / AR / causality */}
        {isExpanded && (
          <div className="mt-2 space-y-2">
            <p className="text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
              {event.detail}
            </p>

            {event.url && (
              <a
                href={event.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={stopPropagation}
                className="inline-block text-xs text-blue-500 hover:underline"
              >
                {event.source ?? "출처 보기"}
              </a>
            )}

            {/* PR3 — Abnormal return: status="OK" 면 배지 노출, 그 외 status 만 회색 라벨 */}
            {event.ar_status === "OK" &&
              (event.abnormal_return_5d != null || event.abnormal_return_20d != null) && (
                <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                  <span>
                    이벤트 후 누적 초과 수익률
                    {event.benchmark_ticker ? ` (vs ${event.benchmark_ticker})` : ""}
                  </span>
                  <ARBadge value={event.abnormal_return_5d} windowLabel="5d" />
                  <ARBadge value={event.abnormal_return_20d} windowLabel="20d" />
                </div>
              )}
            {event.ar_status && event.ar_status !== "OK" && (
              <p className="text-[10px] text-zinc-400 dark:text-zinc-500">
                초과 수익률: {AR_STATUS_LABEL[event.ar_status] ?? event.ar_status}
              </p>
            )}

            {event.causality && event.causality.length > 0 && (
              <div>
                <p className="mb-1 text-xs font-medium text-purple-500">
                  인과 분석 ({event.causality.length})
                </p>
                <ul className="space-y-2">
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
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
