import type { EconomicEvent, EconomicEventType } from "@/features/dashboard/domain/model/economicEvent";

const TYPE_STYLE: Record<EconomicEventType, { bg: string; text: string }> = {
  CPI:           { bg: "bg-amber-500/10",   text: "text-amber-500" },
  INTEREST_RATE: { bg: "bg-blue-500/10",    text: "text-blue-500" },
  UNEMPLOYMENT:  { bg: "bg-emerald-500/10", text: "text-emerald-500" },
};

interface EventTimelineGroupItemProps {
  events: EconomicEvent[];
  isSelected: boolean;
  onClick: (event: EconomicEvent) => void;
}

export default function EventTimelineGroupItem({
  events,
  isSelected,
  onClick,
}: EventTimelineGroupItemProps) {
  const representative = events[0];

  return (
    <button
      type="button"
      data-event-id={representative.id}
      onClick={() => onClick(representative)}
      className={[
        "w-full rounded-xl border p-3 text-left transition-all",
        isSelected
          ? "border-zinc-400 bg-zinc-100 ring-1 ring-inset ring-zinc-400 dark:border-zinc-600 dark:bg-zinc-800 dark:ring-zinc-600"
          : "border-zinc-200 bg-white hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700",
      ].join(" ")}
    >
      <div className="mb-2 text-xs text-zinc-400">{representative.date}</div>
      <div className="flex flex-col gap-2">
        {events.map((event) => {
          const style = TYPE_STYLE[event.type];
          const diff = event.value - event.previous;
          const diffSign = diff > 0 ? "+" : "";
          return (
            <div key={event.id} className="flex items-center justify-between gap-2">
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-semibold ${style.bg} ${style.text}`}
              >
                {event.label}
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-sm font-bold text-zinc-900 dark:text-zinc-50">
                  {event.value}%
                </span>
                <span
                  className={`text-xs font-medium ${
                    diff > 0
                      ? "text-red-500"
                      : diff < 0
                        ? "text-blue-500"
                        : "text-zinc-400"
                  }`}
                >
                  {diffSign}{diff.toFixed(1)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </button>
  );
}
