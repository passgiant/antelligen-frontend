"use client";

import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { timelineAtom, selectedTimelineEventAtom } from "@/features/dashboard/application/atoms/timelineAtom";
import { selectedBarTimeAtom } from "@/features/dashboard/application/atoms/selectedBarAtom";
import { nasdaqAtom } from "@/features/dashboard/application/atoms/nasdaqAtom";
import { chartIntervalAtom } from "@/features/dashboard/application/atoms/chartIntervalAtom";
import { useTimeline } from "@/features/dashboard/application/hooks/useTimeline";
import LazyTimelineEventCard from "@/features/history/ui/components/LazyTimelineEventCard";
import { useLazyTitles } from "@/features/history/application/useLazyTitles";
import type { TimelineEvent } from "@/features/dashboard/domain/model/timelineEvent";
import CategoryFilterChips, { type CategoryFilter } from "@/features/dashboard/ui/components/CategoryFilterChips";
import { useEffect, useMemo, useRef, useState } from "react";

function HistorySkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex gap-3">
          <div className="flex flex-col items-center">
            <div className="mt-1 h-2.5 w-2.5 flex-shrink-0 animate-pulse rounded-full bg-zinc-200 dark:bg-zinc-700" />
            {i < 3 && <div className="mt-1 flex-1 w-px bg-zinc-200 dark:bg-zinc-700" />}
          </div>
          <div className="mb-4 flex-1 animate-pulse rounded-xl border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-800/50">
            <div className="mb-2 flex justify-between">
              <div className="h-3 w-20 rounded bg-zinc-200 dark:bg-zinc-700" />
              <div className="h-3 w-10 rounded bg-zinc-200 dark:bg-zinc-700" />
            </div>
            <div className="mb-1 h-3 w-32 rounded bg-zinc-200 dark:bg-zinc-700" />
            <div className="h-3 w-48 rounded bg-zinc-200 dark:bg-zinc-700" />
          </div>
        </div>
      ))}
    </div>
  );
}

function HistoryProgress({ pct, label }: { pct: number; label: string }) {
  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
          <span>{label}</span>
          <span>{pct}%</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
          <div
            className="h-full rounded-full bg-blue-500 transition-all duration-500 ease-out"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
      <HistorySkeleton />
    </div>
  );
}

export default function HistoryPanel() {
  useTimeline();

  const timelineState = useAtomValue(timelineAtom);
  const lazyEvents = useMemo(
    () => (timelineState.status === "SUCCESS" ? timelineState.events : []),
    [timelineState]
  );
  const lazyTicker = timelineState.status === "SUCCESS" ? timelineState.ticker : "";
  const lazyPeriod = timelineState.status === "SUCCESS" ? timelineState.period : "";
  const { getCardRef } = useLazyTitles({ events: lazyEvents, ticker: lazyTicker, chartInterval: lazyPeriod });
  const nasdaqState = useAtomValue(nasdaqAtom);
  const [selectedTimelineEvent, setSelectedTimelineEvent] = useAtom(selectedTimelineEventAtom);
  const setSelectedBarTime = useSetAtom(selectedBarTimeAtom);
  const chartInterval = useAtomValue(chartIntervalAtom);
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("ALL");

  const categoryCounts = useMemo(() => {
    const counts: Partial<Record<CategoryFilter, number>> = { ALL: lazyEvents.length };
    for (const ev of lazyEvents) {
      counts[ev.category] = (counts[ev.category] ?? 0) + 1;
    }
    return counts;
  }, [lazyEvents]);

  const visibleEvents = useMemo(() => {
    if (categoryFilter === "ALL") return lazyEvents;
    return lazyEvents.filter((ev) => ev.category === categoryFilter);
  }, [lazyEvents, categoryFilter]);

  // 봉 단위(chartInterval) 변경 시 선택 초기화 — 봉 단위가 바뀌면 근접 봉 좌표가 달라지므로
  // 이전 선택을 유지하면 SVG 연결선이 엉뚱한 봉을 가리킬 수 있다.
  // 현재 봉 단위 유지 상태의 재선택은 정상 작동 (useEffect 미트리거).
  useEffect(() => {
    setSelectedTimelineEvent(null);
    setSelectedBarTime(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chartInterval]);

  const scrollRef = useRef<HTMLDivElement>(null);

  // 선택된 이벤트를 패널 상단으로 스크롤
  useEffect(() => {
    if (!selectedTimelineEvent || !scrollRef.current) return;
    const container = scrollRef.current;
    const el = container.querySelector<HTMLElement>(
      `[data-history-event-id="${selectedTimelineEvent.idx}"]`
    );
    if (!el) return;
    const containerRect = container.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();
    const relativeTop = elRect.top - containerRect.top + container.scrollTop;
    container.scrollTo({ top: relativeTop, behavior: "smooth" });
  }, [selectedTimelineEvent]);

  // bars가 재로드되면 selectedTimelineEvent 기준으로 nearest bar time 재계산
  const selectedTimelineEventRef = useRef(selectedTimelineEvent);
  useEffect(() => {
    selectedTimelineEventRef.current = selectedTimelineEvent;
  }, [selectedTimelineEvent]);

  useEffect(() => {
    if (nasdaqState.status !== "SUCCESS" || nasdaqState.bars.length === 0) return;
    const sel = selectedTimelineEventRef.current;
    if (!sel) return;

    const eventTs = new Date(sel.event.date).getTime();
    const nearestBarTime = nasdaqState.bars.reduce((nearest, bar) => {
      const diff = Math.abs(new Date(bar.time).getTime() - eventTs);
      const nearestDiff = Math.abs(new Date(nearest).getTime() - eventTs);
      return diff < nearestDiff ? bar.time : nearest;
    }, nasdaqState.bars[0].time);
    setSelectedBarTime(nearestBarTime);
  }, [nasdaqState, setSelectedBarTime]);

  const handleClick = (idx: number, event: TimelineEvent) => {
    if (selectedTimelineEvent?.idx === idx) {
      setSelectedTimelineEvent(null);
      setSelectedBarTime(null);
      return;
    }

    setSelectedTimelineEvent({ idx, event });
    // §18.1: 봉 단위(chartInterval) 강제 전환 제거 — 사용자가 보고 있던 주/월/분기봉 뷰 유지.
    // 선택된 이벤트에 대응하는 봉(selectedBarTime)은 현재 봉 단위 기준으로 근접 탐색.

    if (nasdaqState.status === "SUCCESS" && nasdaqState.bars.length > 0) {
      const eventTs = new Date(event.date).getTime();
      const nearestBarTime = nasdaqState.bars.reduce((nearest, bar) => {
        const diff = Math.abs(new Date(bar.time).getTime() - eventTs);
        const nearestDiff = Math.abs(new Date(nearest).getTime() - eventTs);
        return diff < nearestDiff ? bar.time : nearest;
      }, nasdaqState.bars[0].time);
      setSelectedBarTime(nearestBarTime);
    }
  };

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">History</h3>
      </div>

      {timelineState.status === "IDLE" && (
        <p className="text-sm text-zinc-400">데이터를 불러오는 중입니다.</p>
      )}

      {timelineState.status === "LOADING" && <HistorySkeleton />}

      {timelineState.status === "LOADING_WITH_PROGRESS" && (
        <HistoryProgress pct={timelineState.progress.pct} label={timelineState.progress.label} />
      )}

      {timelineState.status === "ETF" && (
        <div className="flex h-24 flex-col items-center justify-center gap-1">
          <p className="text-sm font-medium text-zinc-600 dark:text-zinc-300">
            ETF는 타임라인을 제공하지 않습니다.
          </p>
          <p className="text-xs text-zinc-400">
            개별 종목을 선택하면 주요 이벤트를 확인할 수 있습니다.
          </p>
        </div>
      )}

      {timelineState.status === "ERROR" && (
        <div className="flex h-24 items-center justify-center">
          <p className="text-sm text-red-500">{timelineState.message}</p>
        </div>
      )}

      {timelineState.status === "SUCCESS" && timelineState.events.length === 0 && (
        <div className="flex h-24 items-center justify-center">
          <p className="text-sm text-zinc-400">해당 기간에 이벤트가 없습니다.</p>
        </div>
      )}

      {timelineState.status === "SUCCESS" && timelineState.events.length > 0 && (
        <>
          <CategoryFilterChips
            selected={categoryFilter}
            onChange={setCategoryFilter}
            counts={categoryCounts}
          />
          {visibleEvents.length === 0 ? (
            <div className="flex h-24 items-center justify-center">
              <p className="text-sm text-zinc-400">선택한 카테고리에 이벤트가 없습니다.</p>
            </div>
          ) : (
            <div ref={scrollRef} className="max-h-[25rem] overflow-y-auto pr-1 [scrollbar-width:thin] [scrollbar-color:theme(colors.zinc.300)_transparent] dark:[scrollbar-color:theme(colors.zinc.700)_transparent]">
              {visibleEvents.map((event) => {
                const idx = lazyEvents.indexOf(event);
                return (
                  <LazyTimelineEventCard
                    key={`${event.date}-${idx}`}
                    event={event}
                    eventIdx={idx}
                    eventKey={`${timelineState.ticker}:${timelineState.period}:${idx}`}
                    isLast={idx === lazyEvents.length - 1}
                    isSelected={selectedTimelineEvent?.idx === idx}
                    cardRef={getCardRef(idx)}
                    onClick={handleClick}
                  />
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
