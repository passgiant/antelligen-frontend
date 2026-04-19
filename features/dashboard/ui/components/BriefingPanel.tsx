"use client";

import { useAtomValue } from "jotai";
import { selectedEventAtom } from "@/features/dashboard/application/atoms/economicEventAtom";
import { briefingAtom } from "@/features/dashboard/application/atoms/briefingAtom";

function BriefingSkeleton() {
  return (
    <div className="space-y-3">
      <div className="h-4 w-3/4 animate-pulse rounded bg-zinc-100 dark:bg-zinc-800" />
      <div className="h-4 w-full animate-pulse rounded bg-zinc-100 dark:bg-zinc-800" />
      <div className="h-4 w-5/6 animate-pulse rounded bg-zinc-100 dark:bg-zinc-800" />
      <div className="h-4 w-2/3 animate-pulse rounded bg-zinc-100 dark:bg-zinc-800" />
    </div>
  );
}

export default function BriefingPanel() {
  const selectedEvent = useAtomValue(selectedEventAtom);
  const briefing = useAtomValue(briefingAtom);

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
          AI 브리핑
        </h3>
        <button
          type="button"
          className="rounded-lg bg-blue-500 px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-blue-600 active:bg-blue-700"
        >
          분석
        </button>
      </div>

      {!selectedEvent && briefing.status === "IDLE" && (
        <div className="h-24" />
      )}

      {briefing.status === "LOADING" && <BriefingSkeleton />}

      {briefing.status === "SUCCESS" && (
        <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
          {briefing.content}
        </p>
      )}

      {briefing.status === "ERROR" && (
        <p className="text-sm text-red-500">{briefing.message}</p>
      )}
    </div>
  );
}
