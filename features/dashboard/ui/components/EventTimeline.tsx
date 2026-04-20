"use client";

import { useEffect, useRef } from "react";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { economicEventAtom, selectedEventAtom } from "@/features/dashboard/application/atoms/economicEventAtom";
import { selectedBarTimeAtom } from "@/features/dashboard/application/atoms/selectedBarAtom";
import { nasdaqAtom } from "@/features/dashboard/application/atoms/nasdaqAtom";
import { periodAtom } from "@/features/dashboard/application/atoms/periodAtom";
import { useEconomicEvents } from "@/features/dashboard/application/hooks/useEconomicEvents";
import { selectedTimelineEventAtom } from "@/features/dashboard/application/atoms/timelineAtom";
import EventTimelineItem from "@/features/dashboard/ui/components/EventTimelineItem";
import EventTimelineGroupItem from "@/features/dashboard/ui/components/EventTimelineGroupItem";
import type { EconomicEvent } from "@/features/dashboard/domain/model/economicEvent";

function TimelineSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="animate-pulse rounded-xl border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-800/50"
        >
          <div className="mb-2 flex justify-between">
            <div className="h-3 w-16 rounded bg-zinc-200 dark:bg-zinc-700" />
            <div className="h-3 w-20 rounded bg-zinc-200 dark:bg-zinc-700" />
          </div>
          <div className="h-5 w-24 rounded bg-zinc-200 dark:bg-zinc-700" />
          <div className="mt-1 h-3 w-32 rounded bg-zinc-200 dark:bg-zinc-700" />
        </div>
      ))}
    </div>
  );
}

export default function EventTimeline() {
  useEconomicEvents();

  const scrollRef = useRef<HTMLDivElement>(null);

  const period = useAtomValue(periodAtom);
  const eventState = useAtomValue(economicEventAtom);
  const nasdaqState = useAtomValue(nasdaqAtom);
  const [selectedEvent, setSelectedEvent] = useAtom(selectedEventAtom);
  const setSelectedBarTime = useSetAtom(selectedBarTimeAtom);
  const setSelectedTimelineEvent = useSetAtom(selectedTimelineEventAtom);

  // 선택된 이벤트를 패널 내부 세로 스크롤 중앙으로 이동 (페이지 스크롤 없음)
  useEffect(() => {
    if (!selectedEvent || !scrollRef.current) return;
    const container = scrollRef.current;
    const el = container.querySelector<HTMLElement>(`[data-event-id="${selectedEvent.id}"]`);
    if (!el) return;
    const containerRect = container.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();
    const relativeTop = elRect.top - containerRect.top + container.scrollTop;
    container.scrollTo({
      top: relativeTop - container.clientHeight / 2 + elRect.height / 2,
      behavior: "smooth",
    });
  }, [selectedEvent]);

  const handleClick = (event: EconomicEvent) => {
    if (selectedEvent?.id === event.id) {
      setSelectedEvent(null);
      setSelectedBarTime(null);
      return;
    }

    setSelectedTimelineEvent(null);
    setSelectedEvent(event);

    if (nasdaqState.status === "SUCCESS" && nasdaqState.bars.length > 0) {
      const bars = nasdaqState.bars;
      const eventTs = new Date(event.date).getTime();
      const nearestBarTime = bars.reduce((nearest, bar) => {
        const diff = Math.abs(new Date(bar.time).getTime() - eventTs);
        const nearestDiff = Math.abs(new Date(nearest).getTime() - eventTs);
        return diff < nearestDiff ? bar.time : nearest;
      }, bars[0].time);
      setSelectedBarTime(nearestBarTime);
    }
  };

  if (eventState.status === "LOADING") {
    return (
      <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mb-4 h-4 w-32 animate-pulse rounded bg-zinc-100 dark:bg-zinc-800" />
        <TimelineSkeleton />
      </div>
    );
  }

  if (eventState.status === "ERROR") {
    return (
      <div className="flex h-24 items-center justify-center rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <p className="text-sm text-red-500">{eventState.message}</p>
      </div>
    );
  }

  if (eventState.events.length === 0) {
    return (
      <div className="flex h-24 items-center justify-center rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <p className="text-sm text-zinc-400">경제 이벤트가 없습니다.</p>
      </div>
    );
  }

  const dateMap = new Map<string, EconomicEvent[]>();
  for (const event of eventState.events) {
    const existing = dateMap.get(event.date) ?? [];
    dateMap.set(event.date, [...existing, event]);
  }
  const dateGroups = Array.from(dateMap.entries()).sort(([a], [b]) =>
    b.localeCompare(a)
  );

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
      <h3 className="mb-4 text-sm font-semibold text-zinc-700 dark:text-zinc-300">주요 경제 지표</h3>
      <div
        ref={scrollRef}
        className="max-h-96 overflow-y-auto space-y-3 pr-1 [scrollbar-width:thin] [scrollbar-color:theme(colors.zinc.300)_transparent] dark:[scrollbar-color:theme(colors.zinc.700)_transparent]"
      >
        {dateGroups.map(([date, events]) =>
          events.length === 1 ? (
            <EventTimelineItem
              key={date}
              event={events[0]}
              isSelected={selectedEvent?.id === events[0].id}
              onClick={handleClick}
            />
          ) : (
            <EventTimelineGroupItem
              key={date}
              events={events}
              isSelected={events.some((e) => e.id === selectedEvent?.id)}
              onClick={handleClick}
            />
          )
        )}
      </div>
    </div>
  );
}
