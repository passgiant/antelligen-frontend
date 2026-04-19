"use client";

import { useRef } from "react";
import NasdaqChart from "@/features/dashboard/ui/components/NasdaqChart";
import EventTimeline from "@/features/dashboard/ui/components/EventTimeline";
import ConnectorOverlay from "@/features/dashboard/ui/components/ConnectorOverlay";
import BriefingPanel from "@/features/dashboard/ui/components/BriefingPanel";
import HistoryPanel from "@/features/dashboard/ui/components/HistoryPanel";
import StockSearch from "@/features/dashboard/ui/components/StockSearch";

export default function DashboardLayout() {
  const wrapperRef = useRef<HTMLDivElement>(null);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

      {/* 종목 조회 */}
      <section className="mb-6">
        <StockSearch />
      </section>

      {/* 차트 + 타임라인 연결선 오버레이 영역 */}
      <div ref={wrapperRef} className="relative">
        <ConnectorOverlay wrapperRef={wrapperRef} />

        {/* 메인 차트 영역 */}
        <section className="mb-6">
          <NasdaqChart />
        </section>

        {/* 경제 이벤트 타임라인 */}
        <section className="mb-6">
          <EventTimeline />
        </section>

        {/* 히스토리 패널 */}
        <section className="mb-6">
          <HistoryPanel />
        </section>

        {/* AI 브리핑 패널 */}
        <section>
          <BriefingPanel />
        </section>
      </div>
    </div>
  );
}
