"use client";

import { useState } from "react";
import { useStockRecommendation } from "@/features/stock-recommendation/application/hooks/useStockRecommendation";

export default function StockQuestionForm() {
  const [question, setQuestion] = useState("");
  const { isReady, answer, isLoading, error, ask } = useStockRecommendation();

  if (!isReady) return null;

  const isEmpty = question.trim().length === 0;

  async function handleSubmit() {
    if (isEmpty) return;
    await ask(question);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="주식에 대해 궁금한 점을 입력하세요."
          rows={4}
          className="w-full resize-none rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 placeholder-zinc-400 outline-none focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder-zinc-500 dark:focus:border-zinc-500 dark:focus:ring-zinc-800"
        />
        <button
          onClick={handleSubmit}
          disabled={isEmpty || isLoading}
          className="self-end rounded-full bg-zinc-900 px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200 dark:disabled:opacity-40"
        >
          {isLoading ? "분석 중..." : "전송"}
        </button>
      </div>

      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}

      {answer && (
        <div className="rounded-xl border border-zinc-200 bg-white px-6 py-5 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="mb-3 text-xs font-medium text-zinc-400">답변</p>
          <p className="whitespace-pre-wrap text-sm text-zinc-800 dark:text-zinc-200">
            {answer.answer}
          </p>
        </div>
      )}
    </div>
  );
}
