"use client";

interface Props {
  /** 누적 abnormal return (%, 종목 - 벤치마크). null/undefined 면 미표시. */
  value?: number | null;
  /** "5d" | "20d" 등 윈도우 라벨. */
  windowLabel?: string;
}

// toFixed(2) 가 "0.00" 으로 반올림하는 경계와 일치 — 표시-색상 일관성.
const ZERO_NEAR_THRESHOLD = 0.005;
const STRONG_THRESHOLD = 5;

/** AR 표시 배지. 양수=초록, 음수=빨강, |ar|≥5% 이면 굵게. 0 근방은 zinc. */
export default function ARBadge({ value, windowLabel = "5d" }: Props) {
  if (value == null || Number.isNaN(value)) return null;

  const sign = value > 0 ? "+" : "";
  const isStrong = Math.abs(value) >= STRONG_THRESHOLD;
  const isZeroNear = Math.abs(value) < ZERO_NEAR_THRESHOLD;
  const tone = isZeroNear
    ? "text-zinc-500 dark:text-zinc-400"
    : value > 0
    ? "text-emerald-600 dark:text-emerald-400"
    : "text-rose-600 dark:text-rose-400";
  const weight = isStrong ? "font-bold" : "font-semibold";

  return (
    <span
      className={`inline-flex items-baseline gap-1 rounded-md px-1.5 py-0.5 text-xs ${tone} ${weight}`}
      title={`±${windowLabel} 누적 초과 수익률 ${sign}${value.toFixed(2)}%`}
    >
      <span className="text-[10px] font-normal text-zinc-400 dark:text-zinc-500">
        {windowLabel}
      </span>
      {sign}
      {value.toFixed(2)}%
    </span>
  );
}
