"use client";

import { useEffect, useRef } from "react";
import { useAtomValue, useSetAtom } from "jotai";
import {
  createChart,
  createSeriesMarkers,
  CandlestickSeries,
  type IChartApi,
  type ISeriesApi,
  type ISeriesMarkersPluginApi,
  type CandlestickData,
  type SeriesMarker,
  type Time,
  type MouseEventParams,
} from "lightweight-charts";
import { nasdaqAtom } from "@/features/dashboard/application/atoms/nasdaqAtom";
import { economicEventAtom, selectedEventAtom } from "@/features/dashboard/application/atoms/economicEventAtom";
import { timelineAtom, selectedTimelineEventAtom } from "@/features/dashboard/application/atoms/timelineAtom";
import { selectedBarTimeAtom } from "@/features/dashboard/application/atoms/selectedBarAtom";
import { periodAtom } from "@/features/dashboard/application/atoms/periodAtom";
import { tickerAtom } from "@/features/dashboard/application/atoms/tickerAtom";
import { companyNameAtom } from "@/features/dashboard/application/atoms/companyNameAtom";
import { chartApiAtom, chartContainerAtom } from "@/features/dashboard/application/atoms/chartApiAtom";
import { useNasdaqChart } from "@/features/dashboard/application/hooks/useNasdaqChart";
import ChartSkeleton from "@/features/dashboard/ui/components/skeletons/ChartSkeleton";
import PeriodTabs from "@/features/dashboard/ui/components/PeriodTabs";

const MARKER_COLOR_SELECTED = "#a855f7";

export default function NasdaqChart() {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const markersRef = useRef<ISeriesMarkersPluginApi<Time> | null>(null);

  const nasdaqState = useAtomValue(nasdaqAtom);
  const economicEventState = useAtomValue(economicEventAtom);
  const timelineState = useAtomValue(timelineAtom);
  const selectedBarTime = useAtomValue(selectedBarTimeAtom);
  const period = useAtomValue(periodAtom);
  const ticker = useAtomValue(tickerAtom);
  const companyName = useAtomValue(companyNameAtom);
  const { setPeriod } = useNasdaqChart();
  const setChartApi = useSetAtom(chartApiAtom);
  const setChartContainer = useSetAtom(chartContainerAtom);
  const setSelectedEvent = useSetAtom(selectedEventAtom);
  const setSelectedTimelineEvent = useSetAtom(selectedTimelineEventAtom);
  const setSelectedBarTime = useSetAtom(selectedBarTimeAtom);

  // period 변경 시 경제지표 선택 초기화 (history 선택은 유지)
  useEffect(() => {
    setSelectedBarTime(null);
    setSelectedEvent(null);
  }, [period, setSelectedBarTime, setSelectedEvent]);

  // ticker 변경 시 모든 선택 초기화
  useEffect(() => {
    setSelectedBarTime(null);
    setSelectedEvent(null);
    setSelectedTimelineEvent(null);
  }, [ticker, setSelectedBarTime, setSelectedEvent, setSelectedTimelineEvent]);

  // 마커 클릭 핸들러 — 최신 상태를 참조하도록 ref로 관리
  const clickHandlerRef = useRef<(params: MouseEventParams<Time>) => void>(() => {});
  useEffect(() => {
    clickHandlerRef.current = (params) => {
      if (!params.time) return;

      const clickedTime = String(params.time);

      // 같은 봉 재클릭 시 선택 해제
      if (selectedBarTime === clickedTime) {
        setSelectedBarTime(null);
        setSelectedEvent(null);
        setSelectedTimelineEvent(null);
        return;
      }

      const bars = nasdaqState.status === "SUCCESS" ? nasdaqState.bars : [];
      const toNearestBarTime = (eventDate: string): string => {
        if (bars.length === 0) return eventDate;
        const ts = new Date(eventDate).getTime();
        return bars.reduce((nearest, bar) => {
          const diff = Math.abs(new Date(bar.time).getTime() - ts);
          const nearestDiff = Math.abs(new Date(nearest.time).getTime() - ts);
          return diff < nearestDiff ? bar : nearest;
        }).time;
      };

      // History 이벤트 매칭 (1D일 때)
      if (timelineState.status === "SUCCESS" && timelineState.events.length > 0) {
        const matchedIdx = timelineState.events.findIndex(
          (e) => toNearestBarTime(e.date) === clickedTime
        );
        if (matchedIdx !== -1) {
          setSelectedTimelineEvent({ idx: matchedIdx, event: timelineState.events[matchedIdx] });
          setSelectedBarTime(clickedTime);
          setSelectedEvent(null);
          return;
        }
        // 매칭되는 History 이벤트 없음 → 선택 해제
        setSelectedTimelineEvent(null);
        setSelectedBarTime(null);
        return;
      }

      setSelectedBarTime(clickedTime);

      // 경제지표 이벤트 매칭
      if (economicEventState.status === "SUCCESS") {
        const matched = economicEventState.events.filter(
          (e) => toNearestBarTime(e.date) === clickedTime
        );
        setSelectedEvent(matched.length > 0 ? matched[0] : null);
      } else {
        setSelectedEvent(null);
      }
    };
  }, [selectedBarTime, economicEventState, timelineState, nasdaqState, setSelectedBarTime, setSelectedEvent, setSelectedTimelineEvent]);

  // 차트 초기화 + 캔들스틱 데이터 바인딩
  useEffect(() => {
    if (nasdaqState.status !== "SUCCESS" || !containerRef.current) return;

    const chart = createChart(containerRef.current, {
      layout: {
        background: { color: "transparent" },
        textColor: "#71717a",
      },
      grid: {
        vertLines: { visible: false },
        horzLines: { visible: false },
      },
      crosshair: { mode: 1 },
      localization: { dateFormat: "yyyy-MM-dd" },
      rightPriceScale: { borderColor: "#3f3f46" },
      timeScale: { borderColor: "#3f3f46", timeVisible: false },
      width: containerRef.current.clientWidth,
      height: 320,
    });

    const series = chart.addSeries(CandlestickSeries, {
      upColor: "#ef4444",
      downColor: "#3b82f6",
      borderUpColor: "#ef4444",
      borderDownColor: "#3b82f6",
      wickUpColor: "#ef4444",
      wickDownColor: "#3b82f6",
    });

    const data: CandlestickData<Time>[] = nasdaqState.bars.map((bar) => ({
      time: bar.time as Time,
      open: bar.open,
      high: bar.high,
      low: bar.low,
      close: bar.close,
    }));

    series.setData(data);
    chart.timeScale().fitContent();
    chartRef.current = chart;
    seriesRef.current = series;
    markersRef.current = createSeriesMarkers(series, []);
    setChartApi(chart);
    setChartContainer(containerRef.current);

    const clickHandler = (params: MouseEventParams<Time>) => clickHandlerRef.current(params);
    chart.subscribeClick(clickHandler);

    const observer = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width;
      if (width) chart.applyOptions({ width });
    });
    observer.observe(containerRef.current);

    return () => {
      observer.disconnect();
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
      markersRef.current = null;
      setChartApi(null);
      setChartContainer(null);
    };
  }, [nasdaqState, setChartApi, setChartContainer]);

  // 마커 바인딩 — 선택된 bar에만 마커 표시 (연봉 제외)
  useEffect(() => {
    if (!markersRef.current) return;
    if (period === "1Y" || !selectedBarTime) {
      markersRef.current.setMarkers([]);
      return;
    }
    markersRef.current.setMarkers([{
      time: selectedBarTime as Time,
      position: "aboveBar" as const,
      shape: "circle" as const,
      color: MARKER_COLOR_SELECTED,
      size: 1,
    }]);
  }, [selectedBarTime, period]);

  // 패널 선택 시 해당 bar로 차트 스크롤 — bar 인덱스 기준으로 가운데 정렬
  useEffect(() => {
    if (!selectedBarTime || !chartRef.current) return;
    if (nasdaqState.status !== "SUCCESS" || nasdaqState.bars.length === 0) return;

    const bars = nasdaqState.bars;
    const idx = bars.findIndex((b) => b.time === selectedBarTime);
    if (idx === -1) return;

    const half = period === "1D" ? 30 : period === "1W" ? 13 : period === "1M" ? 6 : 3;
    chartRef.current.timeScale().setVisibleLogicalRange({
      from: idx - half,
      to: idx + half,
    });
  }, [selectedBarTime, period, nasdaqState]);

  if (nasdaqState.status === "LOADING") {
    return <ChartSkeleton />;
  }

  if (nasdaqState.status === "ERROR") {
    return (
      <div className="flex h-96 items-center justify-center rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <p className="text-sm text-red-500">{nasdaqState.message}</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-bold text-zinc-900 dark:text-zinc-50">
            {ticker ?? "IXIC"}
          </span>
          <span className="text-xs text-zinc-400">
            {companyName ?? "NASDAQ Composite"}
          </span>
        </div>
        <PeriodTabs selected={period} onChange={setPeriod} />
      </div>
      <div ref={containerRef} className="w-full" />
    </div>
  );
}
