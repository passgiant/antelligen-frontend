import type { Period } from "@/features/dashboard/domain/model/period";

const PERIODS: Period[] = ["1D", "1W", "1M", "1Y"];

interface PeriodTabsProps {
  selected: Period;
  onChange: (period: Period) => void;
}

export default function PeriodTabs({ selected, onChange }: PeriodTabsProps) {
  return (
    <div className="flex gap-1 rounded-lg bg-zinc-100 p-1 dark:bg-zinc-800">
      {PERIODS.map((p) => (
        <button
          key={p}
          type="button"
          onClick={() => onChange(p)}
          className={[
            "rounded-md px-3 py-1 text-xs font-semibold transition-colors",
            selected === p
              ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-700 dark:text-zinc-50"
              : "text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200",
          ].join(" ")}
        >
          {p}
        </button>
      ))}
    </div>
  );
}
