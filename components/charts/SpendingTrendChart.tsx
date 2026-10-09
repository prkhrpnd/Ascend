"use client";

import React, { useState } from "react";
import { ParsedTransaction } from "@/lib/engine/types";
import { formatPaise, formatDate } from "@/lib/utils";

interface SpendingTrendChartProps {
  transactions: ParsedTransaction[];
}

export function SpendingTrendChart({ transactions }: SpendingTrendChartProps) {
  const [hoveredPoint, setHoveredPoint] = useState<{
    date: string;
    amountPaise: number;
    highestTxNarration: string;
  } | null>(null);

  // Group outflows by date
  const dailyOutflowMap: Record<
    string,
    { totalPaise: number; highestTxPaise: number; highestTxNarration: string }
  > = {};

  transactions
    .filter((t) => t.type === "DR")
    .forEach((t) => {
      if (!dailyOutflowMap[t.date]) {
        dailyOutflowMap[t.date] = {
          totalPaise: 0,
          highestTxPaise: 0,
          highestTxNarration: "",
        };
      }
      dailyOutflowMap[t.date].totalPaise += t.amount_paise;
      if (t.amount_paise > dailyOutflowMap[t.date].highestTxPaise) {
        dailyOutflowMap[t.date].highestTxPaise = t.amount_paise;
        dailyOutflowMap[t.date].highestTxNarration = t.narration;
      }
    });

  const sortedDates = Object.keys(dailyOutflowMap).sort();

  if (sortedDates.length === 0) {
    return (
      <div className="p-8 text-center bg-white rounded-xl border border-rule text-sm text-ink-soft">
        No expense data available for spending trends.
      </div>
    );
  }

  const dataPoints = sortedDates.map((date) => ({
    date,
    amountPaise: dailyOutflowMap[date].totalPaise,
    highestTxNarration: dailyOutflowMap[date].highestTxNarration,
  }));

  const maxSpend = Math.max(...dataPoints.map((d) => d.amountPaise), 100000);
  const chartHeight = 160;

  return (
    <div className="bg-white rounded-xl border border-rule p-4 space-y-3">
      <div className="flex items-center justify-between text-xs text-ink-soft">
        <span>Daily Outflow Timeline across statement period</span>
        {hoveredPoint && (
          <div className="font-mono text-ink bg-slate-50 px-2 py-0.5 rounded border border-rule">
            {formatDate(hoveredPoint.date)}: {formatPaise(hoveredPoint.amountPaise)}{" "}
            <span className="text-[10px] text-ink-soft truncate">
              ({hoveredPoint.highestTxNarration})
            </span>
          </div>
        )}
      </div>

      {/* Responsive timeline chart */}
      <div className="h-40 flex items-end gap-1 overflow-x-auto pb-1 pt-4">
        {dataPoints.map((point) => {
          const height = Math.max(4, Math.round((point.amountPaise / maxSpend) * (chartHeight - 30)));
          const isSpike = point.amountPaise >= maxSpend * 0.7;

          return (
            <div
              key={point.date}
              onMouseEnter={() => setHoveredPoint(point)}
              onMouseLeave={() => setHoveredPoint(null)}
              className="flex-1 min-w-[6px] max-w-[20px] flex flex-col items-center justify-end h-full cursor-pointer group"
            >
              {isSpike && (
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mb-1 animate-pulse" />
              )}
              <div
                className={`w-full rounded-t transition-all ${
                  isSpike
                    ? "bg-rose-500 group-hover:bg-rose-600"
                    : "bg-blue-500 group-hover:bg-blue-600"
                }`}
                style={{ height: `${height}px` }}
                title={`${formatDate(point.date)}: ${formatPaise(point.amountPaise)}`}
              />
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between text-[11px] font-mono text-ink-soft pt-1 border-t border-rule">
        <span>{formatDate(sortedDates[0])}</span>
        <span className="text-rose-600 font-semibold flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />
          Peak Outflow Spikes
        </span>
        <span>{formatDate(sortedDates[sortedDates.length - 1])}</span>
      </div>
    </div>
  );
}
