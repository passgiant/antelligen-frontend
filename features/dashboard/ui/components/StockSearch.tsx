"use client";

import { useState } from "react";
import { useAtom } from "jotai";
import { tickerAtom } from "@/features/dashboard/application/atoms/tickerAtom";

export default function StockSearch() {
  const [query, setQuery] = useState("");
  const [ticker, setTicker] = useAtom(tickerAtom);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim().toUpperCase();
    if (!trimmed) return;
    setTicker(trimmed);
  };

  const handleReset = () => {
    setQuery("");
    setTicker(null);
  };

  return (
    <div className="flex flex-col rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <h3 className="mb-3 text-sm font-semibold text-zinc-700 dark:text-zinc-300">종목 조회</h3>
      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="티커 입력 (예: AAPL, TSLA)"
          className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 outline-none transition-colors focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder-zinc-500 dark:focus:border-blue-400 dark:focus:ring-blue-400"
        />
        <div className="flex gap-2">
          <button
            type="submit"
            className="flex-1 rounded-lg bg-blue-500 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-600 active:bg-blue-700"
          >
            조회
          </button>
          {ticker && (
            <button
              type="button"
              onClick={handleReset}
              className="flex-1 rounded-lg border border-zinc-200 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
            >
              초기화
            </button>
          )}
        </div>
      </form>
      <p className={`mt-3 text-xs text-zinc-400 ${ticker ? "visible" : "invisible"}`}>
        조회 중: <span className="font-semibold text-blue-500">{ticker ?? "-"}</span>
      </p>
    </div>
  );
}
