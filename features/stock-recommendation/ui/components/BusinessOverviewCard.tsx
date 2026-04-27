import type { BusinessOverview } from "@/features/stock-recommendation/domain/model/stockAnalysis";

interface Props {
  overview: BusinessOverview;
}

export default function BusinessOverviewCard({ overview }: Props) {
  return (
    <section className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <h3 className="mb-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
        회사 개요
        {overview.corpName && (
          <span className="ml-2 text-xs font-normal text-zinc-500 dark:text-zinc-400">
            {overview.corpName}
          </span>
        )}
      </h3>

      {overview.summary && (
        <p className="whitespace-pre-line text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
          {overview.summary}
        </p>
      )}

      {overview.revenueSources.length > 0 && (
        <>
          <h4 className="mt-3 mb-1 text-xs font-semibold text-zinc-900 dark:text-zinc-100">
            주요 매출원
          </h4>
          <ul className="list-inside list-disc space-y-0.5 text-xs text-zinc-700 dark:text-zinc-300">
            {overview.revenueSources.map((src) => (
              <li key={src}>{src}</li>
            ))}
          </ul>
        </>
      )}

      {overview.source === "llm_only" && (
        <p className="mt-3 text-[11px] text-zinc-400 dark:text-zinc-500">
          ※ 사업보고서 미수집 종목 — 일반 정보 기반 추정 요약
        </p>
      )}
      {overview.source === "asset_llm_only" && (
        <p className="mt-3 text-[11px] text-zinc-400 dark:text-zinc-500">
          ※ 지수/ETF 자산 — 일반 정보 기반 설명
        </p>
      )}
    </section>
  );
}
