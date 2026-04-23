"use client";

import { useState } from "react";
import { HttpError } from "@/infrastructure/http/httpClient";
import type { CompanyProfile } from "@/features/company-profile/domain/model/companyProfile";
import { fetchCompanyProfile } from "@/features/company-profile/infrastructure/api/companyProfileApi";
import CompanyProfileCard from "@/features/company-profile/ui/components/CompanyProfileCard";

export default function CompanyProfileForm() {
  const [ticker, setTicker] = useState("");
  const [profile, setProfile] = useState<CompanyProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = ticker.trim();
    if (!trimmed) {
      setError("종목코드를 입력하세요.");
      return;
    }
    setLoading(true);
    setError(null);
    setProfile(null);

    try {
      const result = await fetchCompanyProfile(trimmed);
      setProfile(result);
    } catch (err) {
      if (err instanceof HttpError) {
        if (err.status === 404) {
          setError(`'${trimmed}' 종목을 찾을 수 없습니다.`);
        } else {
          setError(`조회 실패 (HTTP ${err.status})`);
        }
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("알 수 없는 오류가 발생했습니다.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={ticker}
          onChange={(e) => setTicker(e.target.value)}
          placeholder="예: 005930"
          className="flex-1 rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder-zinc-500"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-zinc-900 px-5 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          {loading ? "조회 중..." : "조회"}
        </button>
      </form>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
          {error}
        </div>
      )}

      {profile && <CompanyProfileCard profile={profile} />}

      {!profile && !error && !loading && (
        <div className="rounded-md border border-zinc-200 bg-zinc-50 p-6 text-center text-sm text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
          종목코드를 입력하면 DART 기업개황 정보를 조회합니다.
        </div>
      )}
    </div>
  );
}
