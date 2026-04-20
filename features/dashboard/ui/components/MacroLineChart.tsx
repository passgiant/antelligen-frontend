"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { EconomicIndicator } from "@/features/dashboard/domain/model/economicIndicator";
import IndicatorSkeleton from "@/features/dashboard/ui/components/skeletons/IndicatorSkeleton";

interface MacroLineChartProps {
  title: string;
  unit: string;
  color: string;
  data: EconomicIndicator[] | null;
  isLoading: boolean;
  errorMessage?: string;
}

export default function MacroLineChart({
  title,
  unit,
  color,
  data,
  isLoading,
  errorMessage,
}: MacroLineChartProps) {
  if (isLoading) return <IndicatorSkeleton />;

  if (errorMessage) {
    return (
      <div className="flex h-44 items-center justify-center rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <p className="text-xs text-red-500">{errorMessage}</p>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex h-44 items-center justify-center rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <p className="text-xs text-zinc-400">데이터가 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
      <p className="mb-3 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
        {title}
        <span className="ml-1 text-xs font-normal text-zinc-400">({unit})</span>
      </p>
      <ResponsiveContainer width="100%" height={144}>
        <LineChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 9, fill: "#71717a" }}
            tickFormatter={(v: string) => v.slice(0, 7)}
            stroke="#3f3f46"
          />
          <YAxis
            tick={{ fontSize: 9, fill: "#71717a" }}
            stroke="#3f3f46"
            domain={["auto", "auto"]}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#18181b",
              border: "1px solid #3f3f46",
              borderRadius: "8px",
              fontSize: "12px",
              color: "#f4f4f5",
            }}
            formatter={(value) => [`${value}${unit}`, title]}
            labelFormatter={(label) => label}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
