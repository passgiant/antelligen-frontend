"use client";

import { useAtomValue } from "jotai";
import { assetProfileAtom } from "@/features/company-profile/application/atoms/assetProfileAtom";
import { useAssetProfile } from "@/features/company-profile/application/hooks/useAssetProfile";
import type {
  AssetType,
  CompanyProfile,
} from "@/features/company-profile/domain/model/companyProfile";

function normalizeUrl(url: string | null): string | null {
  if (!url) return null;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `https://${url}`;
}

function formatDate(yyyymmdd: string | null): string | null {
  if (!yyyymmdd || yyyymmdd.length !== 8) return yyyymmdd;
  return `${yyyymmdd.slice(0, 4)}-${yyyymmdd.slice(4, 6)}-${yyyymmdd.slice(6, 8)}`;
}

function formatAccMt(mm: string | null): string | null {
  if (!mm) return null;
  return `${parseInt(mm, 10)}월`;
}

const ASSET_BADGE: Record<AssetType, { label: string; className: string }> = {
  EQUITY: {
    label: "EQUITY",
    className:
      "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
  },
  INDEX: {
    label: "INDEX",
    className:
      "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  },
  ETF: {
    label: "ETF",
    className:
      "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300",
  },
};

function PanelShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
      <h3 className="mb-4 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
        종목 프로필
      </h3>
      {children}
    </div>
  );
}

function PanelSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="animate-pulse rounded-xl border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-800/50"
        >
          <div className="mb-2 h-3 w-20 rounded bg-zinc-200 dark:bg-zinc-700" />
          <div className="h-3 w-full rounded bg-zinc-200 dark:bg-zinc-700" />
          <div className="mt-1 h-3 w-3/4 rounded bg-zinc-200 dark:bg-zinc-700" />
        </div>
      ))}
    </div>
  );
}

function MetaRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[80px_1fr] gap-2 py-2 border-b border-zinc-100 text-xs dark:border-zinc-800">
      <dt className="font-medium text-zinc-500 dark:text-zinc-400">{label}</dt>
      <dd className="break-words text-zinc-800 dark:text-zinc-200">
        {value ?? <span className="text-zinc-400 dark:text-zinc-600">—</span>}
      </dd>
    </div>
  );
}

function ProfileBody({ profile }: { profile: CompanyProfile }) {
  const isEquity = profile.asset_type === "EQUITY";
  const isUS = profile.corp_cls === "US";
  const showMeta = isEquity && !isUS;
  const homepageUrl = normalizeUrl(profile.hm_url);
  const irUrl = normalizeUrl(profile.ir_url);
  const badge = ASSET_BADGE[profile.asset_type];
  const subtitle =
    profile.corp_name_eng ?? profile.stock_code ?? profile.corp_code;

  return (
    <div className="space-y-4">
      <header className="border-b border-zinc-200 pb-3 dark:border-zinc-800">
        <div className="flex items-start gap-2">
          <h4 className="flex-1 break-words text-base font-bold text-zinc-900 dark:text-zinc-50">
            {profile.corp_name}
          </h4>
          <span
            className={`shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-medium ${badge.className}`}
          >
            {badge.label}
          </span>
        </div>
        {subtitle && subtitle !== profile.corp_name && (
          <p className="mt-1 break-words text-xs text-zinc-500 dark:text-zinc-400">
            {subtitle}
          </p>
        )}
      </header>

      {profile.business_summary && (
        <section>
          <p className="whitespace-pre-line break-words text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
            {profile.business_summary}
          </p>
        </section>
      )}

      {profile.main_revenue_sources.length > 0 && (
        <section>
          <h5 className="mb-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
            {isEquity ? "주요 매출원" : "주요 구성"}
          </h5>
          <ul className="list-inside list-disc space-y-1 text-xs text-zinc-700 dark:text-zinc-300">
            {profile.main_revenue_sources.map((src) => (
              <li key={src} className="break-words">
                {src}
              </li>
            ))}
          </ul>
        </section>
      )}

      {isEquity && profile.founding_story && (
        <section>
          <h5 className="mb-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
            창업 스토리
          </h5>
          <p className="whitespace-pre-line break-words text-xs leading-relaxed text-zinc-700 dark:text-zinc-300">
            {profile.founding_story}
          </p>
        </section>
      )}

      {isEquity && profile.business_model && (
        <section>
          <h5 className="mb-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
            비즈니스 모델
          </h5>
          <p className="whitespace-pre-line break-words text-xs leading-relaxed text-zinc-700 dark:text-zinc-300">
            {profile.business_model}
          </p>
        </section>
      )}

      {showMeta && (
        <section>
          <dl>
            <MetaRow label="대표자" value={profile.ceo_nm} />
            <MetaRow label="설립일" value={formatDate(profile.est_dt)} />
            <MetaRow label="결산월" value={formatAccMt(profile.acc_mt)} />
            <MetaRow
              label="홈페이지"
              value={
                homepageUrl ? (
                  <a
                    href={homepageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={profile.hm_url ?? undefined}
                    className="block truncate text-blue-600 hover:underline dark:text-blue-400"
                  >
                    {profile.hm_url}
                  </a>
                ) : null
              }
            />
            <MetaRow
              label="IR"
              value={
                irUrl ? (
                  <a
                    href={irUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={profile.ir_url ?? undefined}
                    className="block truncate text-blue-600 hover:underline dark:text-blue-400"
                  >
                    {profile.ir_url}
                  </a>
                ) : null
              }
            />
          </dl>
        </section>
      )}

      {profile.overview_source === "llm_only" && (
        <p className="text-[10px] text-zinc-400 dark:text-zinc-500">
          ※ 사업보고서 미수집 종목으로, 일반 정보 기반 추정 요약입니다.
        </p>
      )}
      {profile.overview_source === "asset_llm_only" && (
        <p className="text-[10px] text-zinc-400 dark:text-zinc-500">
          ※ 지수/ETF 정보로, AI 일반 지식 기반 요약입니다.
        </p>
      )}
    </div>
  );
}

export default function AssetProfilePanel() {
  useAssetProfile();
  const state = useAtomValue(assetProfileAtom);

  if (state.status === "IDLE" || state.status === "LOADING") {
    return (
      <PanelShell>
        <PanelSkeleton />
      </PanelShell>
    );
  }

  if (state.status === "NOT_FOUND") {
    return (
      <PanelShell>
        <div className="flex h-24 items-center justify-center">
          <p className="text-sm text-zinc-400">
            ‘{state.ticker}’ 종목 정보를 찾을 수 없습니다.
          </p>
        </div>
      </PanelShell>
    );
  }

  if (state.status === "ERROR") {
    return (
      <PanelShell>
        <div className="flex h-24 items-center justify-center">
          <p className="text-sm text-red-500">{state.message}</p>
        </div>
      </PanelShell>
    );
  }

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
      <h3 className="mb-4 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
        종목 프로필
      </h3>
      <div className="max-h-[42.25rem] overflow-y-auto pr-1 [scrollbar-width:thin] [scrollbar-color:theme(colors.zinc.300)_transparent] dark:[scrollbar-color:theme(colors.zinc.700)_transparent]">
        <ProfileBody profile={state.data} />
      </div>
    </div>
  );
}
