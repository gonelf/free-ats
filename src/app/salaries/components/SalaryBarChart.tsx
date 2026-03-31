/**
 * Pure-CSS salary comparison bar chart.
 * Server component — no JS required. Renders instantly, fully accessible.
 */

import { formatSalary } from "../salary-data";

type Props = {
  localLow: number;
  localMedian: number;
  localHigh: number;
  remoteLow: number;
  remoteMedian: number;
  remoteHigh: number;
  currency: "USD" | "GBP";
};

function Bar({
  label,
  low,
  median,
  high,
  maxValue,
  currency,
  color,
}: {
  label: string;
  low: number;
  median: number;
  high: number;
  maxValue: number;
  currency: "USD" | "GBP";
  color: "teal" | "emerald";
}) {
  const lowPct = Math.round((low / maxValue) * 100);
  const medianPct = Math.round((median / maxValue) * 100);
  const highPct = Math.round((high / maxValue) * 100);

  const trackColor = color === "teal" ? "bg-teal-100" : "bg-emerald-100";
  const fillColor = color === "teal" ? "bg-teal-500" : "bg-emerald-500";
  const textColor = color === "teal" ? "text-teal-700" : "text-emerald-600";

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-600 font-medium">{label}</span>
        <span className={`font-bold ${textColor}`}>{formatSalary(median, currency)}</span>
      </div>
      {/* Track */}
      <div className={`relative h-7 rounded-lg ${trackColor} overflow-hidden`}>
        {/* Range fill (low → high) */}
        <div
          className={`absolute top-0 bottom-0 ${fillColor} opacity-30`}
          style={{ left: `${lowPct}%`, width: `${highPct - lowPct}%` }}
        />
        {/* Median marker */}
        <div
          className={`absolute top-0 bottom-0 w-1 ${fillColor}`}
          style={{ left: `${medianPct}%` }}
        />
      </div>
      {/* Labels */}
      <div className="flex justify-between text-xs text-slate-400">
        <span>{formatSalary(low, currency)}</span>
        <span className="text-slate-500">median</span>
        <span>{formatSalary(high, currency)}</span>
      </div>
    </div>
  );
}

export function SalaryBarChart({
  localLow,
  localMedian,
  localHigh,
  remoteLow,
  remoteMedian,
  remoteHigh,
  currency,
}: Props) {
  const maxValue = localHigh * 1.05; // 5% headroom

  return (
    <div className="space-y-6">
      <Bar
        label="Local (In-person)"
        low={localLow}
        median={localMedian}
        high={localHigh}
        maxValue={maxValue}
        currency={currency}
        color="teal"
      />
      <Bar
        label="Remote (via KiteHR)"
        low={remoteLow}
        median={remoteMedian}
        high={remoteHigh}
        maxValue={maxValue}
        currency={currency}
        color="emerald"
      />
    </div>
  );
}
