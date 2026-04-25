"use client";

import { useState } from "react";
import GlobalPortfolioTable from "@/features/smart-money/ui/components/GlobalPortfolioTable";
import GlobalPortfolioBootstrap from "@/features/smart-money/ui/components/GlobalPortfolioBootstrap";
import KrPortfolioTable from "@/features/smart-money/ui/components/KrPortfolioTable";
import KrPortfolioBootstrap from "@/features/smart-money/ui/components/KrPortfolioBootstrap";
import { smartMoneyStyles as s } from "@/features/smart-money/ui/components/smartMoneyStyles";

type Tab = "global" | "kr";

export default function GlobalPortfolioPage() {
  const [activeTab, setActiveTab] = useState<Tab>("global");

  return (
    <div className={s.page}>
      <div className={s.container}>
        <div className={s.header.wrap}>
          <h1 className={s.header.title}>저명 투자자 포트폴리오</h1>
        </div>

        {/* 탭 */}
        <div className={`${s.tabs.wrap} mb-6`}>
          <button
            className={`${s.tabs.btn} ${activeTab === "global" ? s.tabs.active : s.tabs.inactive}`}
            onClick={() => setActiveTab("global")}
          >
            🌎 글로벌 (미국)
          </button>
          <button
            className={`${s.tabs.btn} ${activeTab === "kr" ? s.tabs.active : s.tabs.inactive}`}
            onClick={() => setActiveTab("kr")}
          >
            🇰🇷 국내
          </button>
        </div>

        {activeTab === "global" && (
          <>
            <GlobalPortfolioBootstrap />
            <GlobalPortfolioTable />
          </>
        )}

        {activeTab === "kr" && (
          <>
            <KrPortfolioBootstrap />
            <KrPortfolioTable />
          </>
        )}
      </div>
    </div>
  );
}
