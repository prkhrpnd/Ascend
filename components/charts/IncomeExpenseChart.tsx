"use client";

import React, { useState } from "react";
import { formatPaise } from "@/lib/utils";

export interface MonthlyCashFlowPoint {
  monthKey: string;
  monthLabel: string;
  inflowPaise: number;
  outflowPaise: number;
  netPaise: number;
}

interface IncomeExpenseChartProps {
  data: MonthlyCashFlowPoint[];
}

export function IncomeExpenseChart({ data }: IncomeExpenseChartProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return (
      <div className="p-8 text-center bg-white rounded-xl border border-rule text-sm text-ink-soft">
        No monthly cash flow data available.
      </div>
    );
  }

  // Find max value for scale
  const maxVal = Math.max(
    ...data.map((d) => Math.max(d.inflowPaise, d.outflowPaise)),
    100000
  );

  const chartHeight = 180;

  return (
    <div className="bg-white rounded-xl border border-rule p-4 space-y-4">
      {/* Legend & Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-emerald-600" />
            <span className="text-ink font-medium">Inflows (Income)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-rose-500" />
            <span className="text-ink font-medium">Outflows (Expenses)</span>
          </div>
        </div>

        {hoveredIdx !== null && data[hoveredIdx] && (
          <div className="text-xs font-mono font-medium text-ink bg-slate-50 px-2.5 py-1 rounded border border-rule">
            {data[hoveredIdx].monthLabel}: Inflow {formatPaise(data[hoveredIdx].inflowPaise)} | Outflow {formatPaise(data[hoveredIdx].outflowPaise)} | Net:{" "}
            <span
              className={
                data[hoveredIdx].netPaise >= 0 ? "text-emerald-700 font-bold" : "text-rose-700 font-bold"
              }
            >
              {data[hoveredIdx].netPaise >= 0 ? "+" : ""}
              {formatPaise(data[hoveredIdx].netPaise)}
            </span>
          </div>
        )}
      </div>

      {/* Bar Chart Area */}
      <div className="grid grid-flow-col auto-cols-fr gap-3 items-end pt-4" style={{ height: `${chartHeight}px` }}>
        {data.map((item, idx) => {
          const inflowHeight = Math.max(4, Math.round((item.inflowPaise / maxVal) * (chartHeight - 35)));
          const outflowHeight = Math.max(4, Math.round((item.outflowPaise / maxVal) * (chartHeight - 35)));
          const isHovered = hoveredIdx === idx;

          return (
            <div
              key={item.monthKey}
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
              className={`flex flex-col items-center justify-end h-full p-1 rounded-lg transition-colors cursor-pointer ${
                isHovered ? "bg-blue-50/60" : "hover:bg-slate-50"
              }`}
            >
              <div className="flex items-end gap-1.5 w-full justify-center">
                {/* Inflow Bar */}
                <div
                  className="w-4 sm:w-6 bg-emerald-600 hover:bg-emerald-700 rounded-t transition-all duration-300 relative group"
                  style={{ height: `${inflowHeight}px` }}
                  title={`Inflow: ${formatPaise(item.inflowPaise)}`}
                />
                {/* Outflow Bar */}
                <div
                  className="w-4 sm:w-6 bg-rose-500 hover:bg-rose-600 rounded-t transition-all duration-300 relative group"
                  style={{ height: `${outflowHeight}px` }}
                  title={`Outflow: ${formatPaise(item.outflowPaise)}`}
                />
              </div>

              {/* Month Label */}
              <div className="text-[11px] font-mono text-ink-soft text-center mt-2 truncate w-full">
                {item.monthLabel.split(" ")[0]}
              </div>

              {/* Net Badge */}
              <div
                className={`text-[9px] font-mono font-bold mt-0.5 ${
                  item.netPaise >= 0 ? "text-emerald-700" : "text-rose-600"
                }`}
              >
                {item.netPaise >= 0 ? "+" : ""}
                {Math.round(item.netPaise / 100).toLocaleString("en-IN")}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
