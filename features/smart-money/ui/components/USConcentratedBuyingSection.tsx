"use client";

import { useUSConcentratedBuying } from "@/features/smart-money/application/hooks/useUSConcentratedBuying";
import { smartMoneyStyles as s } from "@/features/smart-money/ui/components/smartMoneyStyles";

function formatUSD(valueInThousands: number): string {
  const millions = valueInThousands / 1000;
  if (millions >= 1000) {
    return `$${(millions / 1000).toFixed(1)}B`;
  }
  return `$${millions.toFixed(0)}M`;
}

export default function USConcentratedBuyingSection() {
  const { usConcentratedState } = useUSConcentratedBuying(20);

  return (
    <div className={s.concentrated.section}>
      <div className={s.concentrated.sectionHeader}>
        <div>
          <h2 className={s.concentrated.sectionTitle}>해외 스마트머니 집중 매수 종목 (미국)</h2>
          <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">
            19명 글로벌 유명 투자자의 최신 분기 신규편입·비중확대 종목 집계 (SEC 13F)
          </p>
        </div>
      </div>

      {usConcentratedState.status === "LOADING" && (
        <div className={s.concentrated.loading}>데이터를 불러오는 중입니다...</div>
      )}

      {usConcentratedState.status === "ERROR" && (
        <div className={s.concentrated.error}>{usConcentratedState.message}</div>
      )}

      {usConcentratedState.status === "SUCCESS" && usConcentratedState.items.length === 0 && (
        <div className={s.concentrated.empty}>
          <span className={s.emptyText}>데이터가 없습니다. 글로벌 포트폴리오를 먼저 수집해주세요.</span>
        </div>
      )}

      {usConcentratedState.status === "SUCCESS" && usConcentratedState.items.length > 0 && (
        <>
          {usConcentratedState.items[0].reportedAt && (
            <p className="mb-3 text-xs text-slate-400 dark:text-slate-500">
              기준일: {usConcentratedState.items[0].reportedAt} (SEC 13F 분기 공시)
            </p>
          )}
          <div className={s.concentrated.grid}>
            {usConcentratedState.items.map((item) => (
              <div key={item.ticker} className={s.concentrated.card}>
                <div className={s.concentrated.cardHeader}>
                  <span className={s.concentrated.cardName}>{item.stockName ?? item.ticker}</span>
                  <span className={s.concentrated.cardCode}>{item.ticker}</span>
                </div>

                <div className={s.concentrated.cardAmounts}>
                  <div className={s.concentrated.cardAmountRow}>
                    <span className={s.concentrated.cardAmountLabel}>총 매수 시장가치</span>
                    <span className={s.concentrated.cardAmountValue}>{formatUSD(item.totalMarketValue)}</span>
                  </div>
                </div>

                <div className={s.concentrated.scoreWrap}>
                  <div className={s.concentrated.scoreLabel}>
                    <span className={s.concentrated.scoreLabelText}>매수 투자자 수</span>
                    <span className={s.concentrated.scoreLabelValue}>{item.investorCount}명</span>
                  </div>
                  <div className={s.concentrated.scoreBar}>
                    <div
                      className={s.concentrated.scoreBarFill}
                      style={{ width: `${Math.min((item.investorCount / 19) * 100, 100)}%` }}
                    />
                  </div>
                </div>

                <div className="flex flex-wrap gap-1">
                  {item.investors.map((name) => (
                    <span
                      key={name}
                      className="rounded bg-blue-50 px-1.5 py-0.5 text-xs text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                    >
                      {name}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
