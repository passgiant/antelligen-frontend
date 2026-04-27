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
import { timelineAtom, selectedTimelineEventAtom } from "@/features/dashboard/application/atoms/timelineAtom";
import { selectedBarTimeAtom } from "@/features/dashboard/application/atoms/selectedBarAtom";
import { selectedAnomalyBarAtom } from "@/features/dashboard/application/atoms/selectedAnomalyBarAtom";
import { chartIntervalAtom } from "@/features/dashboard/application/atoms/chartIntervalAtom";
import { tickerAtom } from "@/features/dashboard/application/atoms/tickerAtom";
import { companyNameAtom } from "@/features/dashboard/application/atoms/companyNameAtom";
import { chartApiAtom, chartContainerAtom } from "@/features/dashboard/application/atoms/chartApiAtom";
import { anomalyBarsAtom } from "@/features/dashboard/application/atoms/anomalyBarsAtom";
import { markerVisibilityAtom } from "@/features/dashboard/application/atoms/markerVisibilityAtom";
import type { AnomalyBar } from "@/features/dashboard/infrastructure/api/anomalyBarsApi";
import { useNasdaqChart } from "@/features/dashboard/application/hooks/useNasdaqChart";
import { useAnomalyBars } from "@/features/dashboard/application/hooks/useAnomalyBars";
import ChartSkeleton from "@/features/dashboard/ui/components/skeletons/ChartSkeleton";
import ChartIntervalTabs from "@/features/dashboard/ui/components/ChartIntervalTabs";
import MarkerToggleChips from "@/features/dashboard/ui/components/MarkerToggleChips";

const MARKER_COLOR_SELECTED = "#a855f7";
// 한국식: 상승 = 빨강, 하락 = 파랑 (ADR-0001 §4 결정)
const ANOMALY_COLOR_STAR = "#EAB308";           // zscore — 노랑 ★
const ANOMALY_COLOR_CUMULATIVE_5D = "#F97316";   // 5일 누적 — 오렌지 🔻
const ANOMALY_COLOR_CUMULATIVE_20D = "#DC2626";  // 20일 누적 — 진홍 📉
const ANOMALY_COLOR_DRAWDOWN_START = "#7C3AED";  // Drawdown 시작 — 보라 🔽
const ANOMALY_COLOR_DRAWDOWN_RECOVERY = "#10B981"; // Drawdown 회복 — 에메랄드 🔼
const ANOMALY_COLOR_VOLATILITY_CLUSTER = "#F59E0B"; // 변동성 클러스터 — 앰버 ⚡

// OKR 다층 탐지 — backend type 별 마커 텍스트·색.
const ANOMALY_MARKER_BY_TYPE: Record<string, { text: string; color: string }> = {
  zscore:             { text: "★", color: ANOMALY_COLOR_STAR },
  cumulative_5d:      { text: "🔻", color: ANOMALY_COLOR_CUMULATIVE_5D },
  cumulative_20d:     { text: "📉", color: ANOMALY_COLOR_CUMULATIVE_20D },
  drawdown_start:     { text: "🔽", color: ANOMALY_COLOR_DRAWDOWN_START },
  drawdown_recovery:  { text: "🔼", color: ANOMALY_COLOR_DRAWDOWN_RECOVERY },
  volatility_cluster: { text: "⚡", color: ANOMALY_COLOR_VOLATILITY_CLUSTER },
};

export default function NasdaqChart() {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const markersRef = useRef<ISeriesMarkersPluginApi<Time> | null>(null);

  useAnomalyBars();

  const nasdaqState = useAtomValue(nasdaqAtom);
  const timelineState = useAtomValue(timelineAtom);
  const anomalyBarsState = useAtomValue(anomalyBarsAtom);
  const markerVisibility = useAtomValue(markerVisibilityAtom);
  const selectedBarTime = useAtomValue(selectedBarTimeAtom);
  const chartInterval = useAtomValue(chartIntervalAtom);
  const ticker = useAtomValue(tickerAtom);
  const companyName = useAtomValue(companyNameAtom);
  const { setChartInterval } = useNasdaqChart();
  const setChartApi = useSetAtom(chartApiAtom);
  const setChartContainer = useSetAtom(chartContainerAtom);
  const setSelectedTimelineEvent = useSetAtom(selectedTimelineEventAtom);
  const setSelectedBarTime = useSetAtom(selectedBarTimeAtom);
  const setSelectedAnomalyBar = useSetAtom(selectedAnomalyBarAtom);

  // chartInterval 변경 시 봉 선택 초기화 (history 선택은 유지)
  useEffect(() => {
    setSelectedBarTime(null);
    setSelectedAnomalyBar(null);
  }, [chartInterval, setSelectedBarTime, setSelectedAnomalyBar]);

  // ticker 변경 시 모든 선택 초기화
  useEffect(() => {
    setSelectedBarTime(null);
    setSelectedTimelineEvent(null);
    setSelectedAnomalyBar(null);
  }, [ticker, setSelectedBarTime, setSelectedTimelineEvent, setSelectedAnomalyBar]);

  // 마커 클릭 핸들러 — 최신 상태를 참조하도록 ref로 관리
  const clickHandlerRef = useRef<(params: MouseEventParams<Time>) => void>(() => {});
  useEffect(() => {
    clickHandlerRef.current = (params) => {
      if (!params.time) return;

      const clickedTime = String(params.time);

      // 같은 봉 재클릭 시 선택 해제 (인과 팝업도 닫음)
      if (selectedBarTime === clickedTime) {
        setSelectedBarTime(null);
        setSelectedTimelineEvent(null);
        setSelectedAnomalyBar(null);
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

      // 이상치 봉 매칭 — ★ 마커 클릭 시 causality 팝업 오픈
      if (anomalyBarsState.status === "SUCCESS" && bars.length > 0) {
        const matchedAnomaly = anomalyBarsState.events.find(
          (ev) => toNearestBarTime(ev.date) === clickedTime
        );
        if (matchedAnomaly) {
          const effectiveTicker = ticker ?? "NVDA";
          setSelectedAnomalyBar({ ticker: effectiveTicker, bar: matchedAnomaly });
          setSelectedBarTime(clickedTime);
          // 같은 봉에 History 이벤트도 있으면 함께 매칭 (타임라인 스크롤용)
          if (timelineState.status === "SUCCESS") {
            const matchedIdx = timelineState.events.findIndex(
              (e) => toNearestBarTime(e.date) === clickedTime
            );
            setSelectedTimelineEvent(
              matchedIdx !== -1
                ? { idx: matchedIdx, event: timelineState.events[matchedIdx] }
                : null,
            );
          }
          return;
        }
      }

      // 이상치 봉이 아니면 팝업은 닫혀있어야 함
      setSelectedAnomalyBar(null);

      // History 이벤트 매칭 (1D일 때)
      if (timelineState.status === "SUCCESS" && timelineState.events.length > 0) {
        const matchedIdx = timelineState.events.findIndex(
          (e) => toNearestBarTime(e.date) === clickedTime
        );
        if (matchedIdx !== -1) {
          setSelectedTimelineEvent({ idx: matchedIdx, event: timelineState.events[matchedIdx] });
          setSelectedBarTime(clickedTime);
          return;
        }
        // 매칭되는 History 이벤트 없음 → 선택 해제
        setSelectedTimelineEvent(null);
        setSelectedBarTime(null);
        return;
      }

      setSelectedBarTime(clickedTime);
    };
  }, [selectedBarTime, timelineState, anomalyBarsState, nasdaqState, ticker, setSelectedBarTime, setSelectedTimelineEvent, setSelectedAnomalyBar]);

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

  // 마커 바인딩 — 이상치 봉(★) + 선택된 봉(●) 병합
  useEffect(() => {
    if (!markersRef.current) return;

    const markers: SeriesMarker<Time>[] = [];

    // 1) 이상치 봉 마커 — 차트 봉 time과 anomaly date 정밀도가 다를 수 있어
    //    가장 가까운 봉으로 스냅하고, 같은 봉에 여러 이벤트가 매핑되면 |return_pct| 최대만 표시.
    //    KR7 — markerVisibility 가 false 인 type 은 표시 안 함.
    const chartBars = nasdaqState.status === "SUCCESS" ? nasdaqState.bars : [];
    if (anomalyBarsState.status === "SUCCESS" && chartBars.length > 0) {
      const strongestByBar = new Map<string, AnomalyBar>();
      for (const ev of anomalyBarsState.events) {
        const evType = ev.type ?? "zscore";
        if (!markerVisibility[evType]) continue;
        const evTs = new Date(ev.date).getTime();
        let closestTime = chartBars[0].time;
        let minDiff = Math.abs(new Date(closestTime).getTime() - evTs);
        for (const bar of chartBars) {
          const diff = Math.abs(new Date(bar.time).getTime() - evTs);
          if (diff < minDiff) {
            minDiff = diff;
            closestTime = bar.time;
          }
        }
        const existing = strongestByBar.get(closestTime);
        if (!existing || Math.abs(ev.return_pct) > Math.abs(existing.return_pct)) {
          strongestByBar.set(closestTime, ev);
        }
      }
      for (const [barTime, ev] of strongestByBar) {
        const variant = ANOMALY_MARKER_BY_TYPE[ev.type ?? "zscore"] ?? ANOMALY_MARKER_BY_TYPE.zscore;
        markers.push({
          time: barTime as Time,
          position: ev.direction === "up" ? "aboveBar" : "belowBar",
          shape: "circle",
          color: variant.color,
          size: 0,
          text: variant.text,
        });
      }
    }

    // 2) 사용자가 선택한 봉 — 보라 원 하이라이트
    if (selectedBarTime) {
      markers.push({
        time: selectedBarTime as Time,
        position: "aboveBar",
        shape: "circle",
        color: MARKER_COLOR_SELECTED,
        size: 1,
      });
    }

    // lightweight-charts 는 time 오름차순으로 정렬된 markers 를 요구
    markers.sort((a, b) => String(a.time).localeCompare(String(b.time)));
    markersRef.current.setMarkers(markers);
  }, [anomalyBarsState, nasdaqState, selectedBarTime, markerVisibility]);

  // 패널 선택 시 해당 bar로 차트 스크롤 — bar 인덱스 기준으로 가운데 정렬
  useEffect(() => {
    if (!selectedBarTime || !chartRef.current) return;
    if (nasdaqState.status !== "SUCCESS" || nasdaqState.bars.length === 0) return;

    const bars = nasdaqState.bars;
    const idx = bars.findIndex((b) => b.time === selectedBarTime);
    if (idx === -1) return;

    const half = chartInterval === "1D" ? 30 : chartInterval === "1W" ? 13 : chartInterval === "1M" ? 6 : 3;
    chartRef.current.timeScale().setVisibleLogicalRange({
      from: idx - half,
      to: idx + half,
    });
  }, [selectedBarTime, chartInterval, nasdaqState]);

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
            {ticker ?? "NVDA"}
          </span>
          <span className="text-xs text-zinc-400">
            {companyName ?? "NVIDIA Corporation"}
          </span>
        </div>
        <ChartIntervalTabs selected={chartInterval} onChange={setChartInterval} />
      </div>
      {/* KR7 — 마커 토글. 사용자 선호 localStorage 영속화. */}
      <div className="mb-3">
        <MarkerToggleChips />
      </div>
      <div ref={containerRef} className="w-full" />
    </div>
  );
}
