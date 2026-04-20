"use client";

import { useEffect, useRef, useState, useCallback, type RefObject } from "react";
import { useAtomValue } from "jotai";
import { selectedTimelineEventAtom } from "@/features/dashboard/application/atoms/timelineAtom";
import { selectedBarTimeAtom } from "@/features/dashboard/application/atoms/selectedBarAtom";
import { chartApiAtom, chartContainerAtom } from "@/features/dashboard/application/atoms/chartApiAtom";
import { periodAtom } from "@/features/dashboard/application/atoms/periodAtom";
import type { Time } from "lightweight-charts";

interface Line {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

interface ConnectorOverlayProps {
  wrapperRef: RefObject<HTMLDivElement | null>;
}

export default function ConnectorOverlay({ wrapperRef }: ConnectorOverlayProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [line, setLine] = useState<Line | null>(null);

  const selectedTimelineEvent = useAtomValue(selectedTimelineEventAtom);
  const selectedBarTime = useAtomValue(selectedBarTimeAtom);
  const chartApi = useAtomValue(chartApiAtom);
  const chartContainer = useAtomValue(chartContainerAtom);
  const period = useAtomValue(periodAtom);

  const recalculate = useCallback(() => {
    if (!selectedTimelineEvent || !selectedBarTime || !chartApi || !chartContainer || !wrapperRef.current) {
      setLine(null);
      return;
    }

    const wrapperRect = wrapperRef.current.getBoundingClientRect();

    const chartX = chartApi.timeScale().timeToCoordinate(selectedBarTime as Time);
    if (chartX === null) {
      setLine(null);
      return;
    }

    if (chartX < 0 || chartX > chartContainer.clientWidth) {
      setLine(null);
      return;
    }

    const chartRect = chartContainer.getBoundingClientRect();
    const markerX = chartRect.left - wrapperRect.left + chartX;
    const markerY = chartRect.bottom - wrapperRect.top;

    const itemEl = wrapperRef.current.querySelector<HTMLElement>(
      `[data-history-event-id="${selectedTimelineEvent.idx}"]`
    );
    if (!itemEl) {
      setLine(null);
      return;
    }

    // 수직 스크롤 영역 밖이면 선 숨김
    const scrollContainer = itemEl.closest('.overflow-y-auto') as HTMLElement | null;
    if (scrollContainer) {
      const scrollRect = scrollContainer.getBoundingClientRect();
      const elRect = itemEl.getBoundingClientRect();
      if (elRect.top < scrollRect.top - 1 || elRect.bottom > scrollRect.bottom + 1) {
        setLine(null);
        return;
      }
    }

    const itemRect = itemEl.getBoundingClientRect();
    const itemCenterX = itemRect.left + itemRect.width / 2 - wrapperRect.left;
    const itemY = itemRect.top - wrapperRect.top;

    setLine({ x1: markerX, y1: markerY, x2: itemCenterX, y2: itemY });
  }, [selectedTimelineEvent, selectedBarTime, chartApi, chartContainer, wrapperRef]);

  // 선택 이벤트 / 차트 준비 상태 변경 시 좌표 재계산 (double RAF로 레이아웃 완료 후 실행)
  useEffect(() => {
    if (!selectedTimelineEvent) {
      setLine(null);
      return;
    }

    let raf1: number;
    let raf2: number;
    raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {
        recalculate();
      });
    });

    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTimelineEvent, selectedBarTime, chartApi, period]);

  // 차트 줌/패닝 시 좌표 재계산
  useEffect(() => {
    if (!chartApi) return;
    chartApi.timeScale().subscribeVisibleLogicalRangeChange(recalculate);
    return () => chartApi.timeScale().unsubscribeVisibleLogicalRangeChange(recalculate);
  }, [chartApi, recalculate]);

  // 수직 스크롤 시 좌표 재계산 (capture로 자식 scroll 이벤트 감지)
  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;
    wrapper.addEventListener("scroll", recalculate, { capture: true, passive: true });
    return () => wrapper.removeEventListener("scroll", recalculate, { capture: true });
  }, [wrapperRef, recalculate]);

  // 리사이즈 시 좌표 재계산
  useEffect(() => {
    if (!wrapperRef.current) return;

    const observer = new ResizeObserver(() => {
      recalculate();
    });
    observer.observe(wrapperRef.current);

    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTimelineEvent, selectedBarTime, chartApi, period]);

  if (!line) return null;

  const midY = (line.y1 + line.y2) / 2;

  return (
    <svg
      ref={svgRef}
      className="pointer-events-none absolute inset-0 z-10 h-full w-full overflow-visible"
      aria-hidden="true"
    >
      <path
        d={`M ${line.x1},${line.y1} L ${line.x1},${midY} L ${line.x2},${midY} L ${line.x2},${line.y2}`}
        stroke="#a855f7"
        strokeWidth={1.5}
        strokeDasharray="4 3"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx={line.x1} cy={line.y1} r={3} fill="#a855f7" />
      <circle cx={line.x2} cy={line.y2} r={3} fill="#a855f7" />
    </svg>
  );
}
