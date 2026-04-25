"use client";

import { useState } from "react";
import { useSetAtom } from "jotai";

import { useKrInvestors, useKrPortfolio } from "@/features/smart-money/application/hooks/useKrPortfolio";
import type { KrInvestor, KrPortfolioItem, KrChangeType } from "@/features/smart-money/domain/model/krPortfolioItem";
import { smartMoneyStyles as s } from "@/features/smart-money/ui/components/smartMoneyStyles";
import { triggerCollectKrPortfolio } from "@/features/smart-money/infrastructure/api/smartMoneyApi";
import { krPortfolioRefreshAtom } from "@/features/smart-money/application/atoms/smartMoneyBootstrapAtom";

const INVESTOR_TYPE_LABEL: Record<string, string> = {
  PENSION: "연기금",
  ASSET_MANAGER: "자산운용사",
  INDIVIDUAL: "개인",
};

const CHANGE_TYPE_LABEL: Record<KrChangeType, string> = {
  NEW: "신규편입",
  INCREASED: "비중확대",
  DECREASED: "비중축소",
  CLOSED: "청산",
};

const CHANGE_TYPE_STYLE: Record<KrChangeType, string> = {
  NEW: s.portfolio.badge.NEW,
  INCREASED: s.portfolio.badge.INCREASED,
  DECREASED: s.portfolio.badge.DECREASED,
  CLOSED: s.portfolio.badge.CLOSED,
};

function groupByType(investors: KrInvestor[]): Record<string, KrInvestor[]> {
  return investors.reduce<Record<string, KrInvestor[]>>((acc, inv) => {
    const label = INVESTOR_TYPE_LABEL[inv.type] ?? inv.type;
    (acc[label] ??= []).push(inv);
    return acc;
  }, {});
}

function filterItems(items: KrPortfolioItem[], onlyBuying: boolean): KrPortfolioItem[] {
  if (!onlyBuying) return items;
  return items.filter((i) => i.changeType === "NEW" || i.changeType === "INCREASED");
}

export default function KrPortfolioTable() {
  const [selectedName, setSelectedName] = useState<string | null>(null);
  const [onlyBuying, setOnlyBuying] = useState(false);
  const [isCollecting, setIsCollecting] = useState(false);
  const [collectError, setCollectError] = useState<string | null>(null);
  const setRefresh = useSetAtom(krPortfolioRefreshAtom);

  const { krInvestorsState } = useKrInvestors();
  const { krPortfolioState } = useKrPortfolio(selectedName);

  function handleCollect() {
    setIsCollecting(true);
    setCollectError(null);
    triggerCollectKrPortfolio()
      .then(() => setRefresh((prev) => prev + 1))
      .catch(() => setCollectError("수집 중 오류가 발생했습니다. 서버 로그를 확인하세요."))
      .finally(() => setIsCollecting(false));
  }

  const investors = krInvestorsState.status === "SUCCESS" ? krInvestorsState.investors : [];
  const grouped = groupByType(investors);

  return (
    <div>
      {/* 투자자 선택 */}
      <div className={s.portfolio.toolbar}>
        <select
          value={selectedName ?? ""}
          onChange={(e) => setSelectedName(e.target.value || null)}
          className={s.portfolio.selector}
        >
          <option value="">투자자 선택</option>
          {Object.entries(grouped).map(([typeLabel, group]) => (
            <optgroup key={typeLabel} label={typeLabel}>
              {group.map((inv) => (
                <option key={inv.name} value={inv.name}>
                  {inv.name}
                </option>
              ))}
            </optgroup>
          ))}
        </select>

        <div className={s.portfolio.toggleWrap}>
          <span className={s.portfolio.toggleLabel}>신규편입·비중확대만 보기</span>
          <button
            role="switch"
            aria-checked={onlyBuying}
            onClick={() => setOnlyBuying((p) => !p)}
            className={`${s.portfolio.toggle} ${onlyBuying ? s.portfolio.toggleOn : s.portfolio.toggleOff}`}
          >
            <span
              className={`${s.portfolio.toggleThumb} ${onlyBuying ? s.portfolio.toggleThumbOn : s.portfolio.toggleThumbOff}`}
            />
          </button>
        </div>
      </div>

      <p className="mb-3 text-xs text-slate-400 dark:text-slate-500">
        DART 대량보유보고 기준 · 5% 이상 보유 종목만 공시 의무 적용
      </p>

      <div className={s.card}>
        {krPortfolioState.status === "IDLE" && (
          <div className={s.portfolio.idle}>투자자를 선택하면 보유 종목이 표시됩니다.</div>
        )}
        {krPortfolioState.status === "LOADING" && (
          <div className={s.portfolio.loading}>데이터를 불러오는 중입니다...</div>
        )}
        {krPortfolioState.status === "ERROR" && (
          <div className={s.portfolio.error}>{krPortfolioState.message}</div>
        )}
        {collectError && (
          <div className="px-4 py-3 text-sm text-red-600 dark:text-red-400">⚠ {collectError}</div>
        )}
        {isCollecting && (
          <div className="flex items-center gap-2 px-4 py-3 text-sm text-blue-600 dark:text-blue-400">
            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
            DART 대량보유보고 수집 중입니다 (800종목 조회)... 잠시 기다려주세요.
          </div>
        )}
        {krPortfolioState.status === "SUCCESS" && (() => {
          const filtered = filterItems(krPortfolioState.items, onlyBuying);
          if (filtered.length === 0 && !isCollecting) {
            return (
              <div className="flex flex-col items-center gap-3 py-8 text-sm text-slate-500 dark:text-slate-400">
                <span>보유 데이터가 없습니다. (DART 5% 이상 대량보유보고 기준)</span>
                <button
                  onClick={handleCollect}
                  disabled={isCollecting}
                  className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  DART에서 데이터 수집하기
                </button>
              </div>
            );
          }
          if (filtered.length === 0) return null;
          const latestDate = filtered[0]?.reportedAt;
          return (
            <>
              {latestDate && (
                <p className={`px-4 pt-3 ${s.portfolio.reportedAt}`}>
                  기준일: {latestDate} (DART 대량보유보고)
                </p>
              )}
              <div className="w-full">
                <div className="grid grid-cols-[1fr_6rem_9rem_7rem_6rem] border-b border-slate-200 bg-slate-100 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
                  <span>종목명</span>
                  <span>종목코드</span>
                  <span className="text-right">보유주식수</span>
                  <span className="text-right">지분율</span>
                  <span className="text-right">변동</span>
                </div>
                {filtered.map((item) => (
                  <div
                    key={item.stockCode}
                    className="grid grid-cols-[1fr_6rem_9rem_7rem_6rem] items-center border-b border-slate-100 px-4 py-3.5 last:border-b-0 dark:border-slate-800"
                  >
                    <span className={s.portfolio.table.colName}>{item.stockName}</span>
                    <span className="text-sm font-mono text-slate-500 dark:text-slate-400">{item.stockCode}</span>
                    <span className={s.portfolio.table.colNumber}>{item.sharesHeld.toLocaleString("ko-KR")}</span>
                    <span className={`${s.portfolio.table.colWeight} text-right`}>{item.ownershipRatio.toFixed(2)}%</span>
                    <span className="flex justify-end">
                      <span className={`${s.portfolio.badge.base} ${CHANGE_TYPE_STYLE[item.changeType]}`}>
                        {CHANGE_TYPE_LABEL[item.changeType]}
                      </span>
                    </span>
                  </div>
                ))}
              </div>
            </>
          );
        })()}
      </div>
    </div>
  );
}
