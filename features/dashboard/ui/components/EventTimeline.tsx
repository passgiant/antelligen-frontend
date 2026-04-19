"use client";

import { useEffect, useRef } from "react";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { economicEventAtom, selectedEventAtom } from "@/features/dashboard/application/atoms/economicEventAtom";
import { selectedBarTimeAtom } from "@/features/dashboard/application/atoms/selectedBarAtom";
import { nasdaqAtom } from "@/features/dashboard/application/atoms/nasdaqAtom";
import { periodAtom } from "@/features/dashboard/application/atoms/periodAtom";
import { useEconomicEvents } from "@/features/dashboard/application/hooks/useEconomicEvents";
import EventTimelineItem from "@/features/dashboard/ui/components/EventTimelineItem";
import EventTimelineGroupItem from "@/features/dashboard/ui/components/EventTimelineGroupItem";
import type { EconomicEvent } from "@/features/dashboard/domain/model/economicEvent";

function TimelineSkeleton() {
  return (
    <div className="flex gap-3 overflow-x-auto pb-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="w-40 flex-shrink-0 animate-pulse rounded-xl border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900"
        >
          <div className="mb-2 h-4 w-16 rounded bg-zinc-100 dark:bg-zinc-800" />
          <div className="h-5 w-20 rounded bg-zinc-100 dark:bg-zinc-800" />
          <div className="mt-1 h-3 w-24 rounded bg-zinc-100 dark:bg-zinc-800" />
        </div>
      ))}
    </div>
  );
}

export default function EventTimeline() {
  useEconomicEvents();

  const scrollRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const startScrollLeft = useRef(0);
  const hasDragged = useRef(false);

  const period = useAtomValue(periodAtom);
  const eventState = useAtomValue(economicEventAtom);
  const nasdaqState = useAtomValue(nasdaqAtom);
  const [selectedEvent, setSelectedEvent] = useAtom(selectedEventAtom);
  const setSelectedBarTime = useSetAtom(selectedBarTimeAtom);

  // 탭 변경 또는 데이터 로드 완료 시 스크롤을 가장 오른쪽으로
  useEffect(() => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
  }, [period, eventState]);

  // 선택된 패널로 스크롤 (마커 클릭 시 포함)
  useEffect(() => {
    if (!selectedEvent || !scrollRef.current) return;
    const el = scrollRef.current.querySelector<HTMLElement>(
      `[data-event-id="${selectedEvent.id}"]`
    );
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, [selectedEvent]);

  const onMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    isDragging.current = true;
    hasDragged.current = false;
    startX.current = e.pageX;
    startScrollLeft.current = scrollRef.current.scrollLeft;
    scrollRef.current.style.cursor = "grabbing";
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current || !scrollRef.current) return;
    const dx = e.pageX - startX.current;
    if (Math.abs(dx) > 4) hasDragged.current = true;
    scrollRef.current.scrollLeft = startScrollLeft.current - dx;
  };

  const onMouseUp = () => {
    isDragging.current = false;
    if (scrollRef.current) scrollRef.current.style.cursor = "grab";
  };

  if (period === "1Y") return null;

  const handleClick = (event: EconomicEvent) => {
    if (hasDragged.current) return;

    if (selectedEvent?.id === event.id) {
      setSelectedEvent(null);
      setSelectedBarTime(null);
      return;
    }

    setSelectedEvent(event);

    // 이벤트 날짜와 가장 가까운 bar time을 찾아 마커 위치 설정
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
        <div className="mb-3 h-4 w-32 animate-pulse rounded bg-zinc-100 dark:bg-zinc-800" />
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
        <p className="text-sm text-zinc-400">해당 기간에 경제 이벤트가 없습니다.</p>
      </div>
    );
  }

  const dateMap = new Map<string, EconomicEvent[]>();
  for (const event of eventState.events) {
    const existing = dateMap.get(event.date) ?? [];
    dateMap.set(event.date, [...existing, event]);
  }
  const dateGroups = Array.from(dateMap.entries()).sort(([a], [b]) =>
    a.localeCompare(b)
  );

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
      <h3 className="mb-3 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
        주요 경제 지표
      </h3>
      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{ cursor: "grab" }}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
      >
        {dateGroups.map(([date, events]) =>
          events.length === 1 ? (
            <div key={date} className="w-44 flex-shrink-0">
              <EventTimelineItem
                event={events[0]}
                isSelected={selectedEvent?.id === events[0].id}
                onClick={handleClick}
              />
            </div>
          ) : (
            <div key={date} className="w-52 flex-shrink-0">
              <EventTimelineGroupItem
                events={events}
                isSelected={events.some((e) => e.id === selectedEvent?.id)}
                onClick={handleClick}
              />
            </div>
          )
        )}
      </div>
    </div>
  );
}
