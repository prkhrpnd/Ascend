"use client";

import React, { useState } from "react";
import { CanonicalCategoryId, CATEGORIES } from "@/lib/engine/categories";
import { formatPaise } from "@/lib/utils";

interface DonutSlice {
  id: CanonicalCategoryId | "other";
  label: string;
  amountPaise: number;
  percent: number;
  color: string;
}

interface CategoryDonutChartProps {
  categoryTotals: Record<
    CanonicalCategoryId,
    {
      id: CanonicalCategoryId;
      label: string;
      amountPaise: number;
      transactionCount: number;
      percentOfOutflows: number;
      color: string;
      isConsumerSpend: boolean;
    }
  >;
  totalOutflowPaise: number;
  activeFilter?: CanonicalCategoryId | null;
  onSelectCategory?: (id: CanonicalCategoryId | null) => void;
}

export function CategoryDonutChart({
  categoryTotals,
  totalOutflowPaise,
  activeFilter,
  onSelectCategory,
}: CategoryDonutChartProps) {
  const [hoveredSlice, setHoveredSlice] = useState<DonutSlice | null>(null);

  // Filter to expense categories with amount > 0, sorted descending
  const activeCategories = (Object.keys(categoryTotals) as CanonicalCategoryId[])
    .map((k) => categoryTotals[k])
    .filter((c) => c.amountPaise > 0 && CATEGORIES[c.id]?.isExpense)
    .sort((a, b) => b.amountPaise - a.amountPaise);

  if (activeCategories.length === 0 || totalOutflowPaise === 0) {
    return (
      <div className="p-8 text-center text-sm text-ink-soft">
        No expense data available.
      </div>
    );
  }

  // Top 5 categories + Other
  const top5 = activeCategories.slice(0, 5);
  const remaining = activeCategories.slice(5);
  const remainingTotal = remaining.reduce((sum, c) => sum + c.amountPaise, 0);

  const slices: DonutSlice[] = top5.map((c) => ({
    id: c.id,
    label: c.label,
    amountPaise: c.amountPaise,
    percent: Math.round((c.amountPaise / totalOutflowPaise) * 100),
    color: c.color,
  }));

  if (remainingTotal > 0) {
    slices.push({
      id: "other",
      label: "Other Categories",
      amountPaise: remainingTotal,
      percent: Math.max(1, 100 - slices.reduce((sum, s) => sum + s.percent, 0)),
      color: "#94A3B8",
    });
  }

  // SVG Donut calculation
  const radius = 64;
  const strokeWidth = 24;
  const circumference = 2 * Math.PI * radius;
  let currentOffset = 0;

  return (
    <div className="w-full space-y-4">
      <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-10 justify-center">
        {/* SVG Donut Visual */}
        <div className="relative w-44 h-44 sm:w-48 sm:h-48 shrink-0 flex items-center justify-center">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
            {slices.map((slice) => {
              const dashLength = (slice.percent / 100) * circumference;
              const dashOffset = currentOffset;
              currentOffset -= dashLength;

              const isSelected = activeFilter === slice.id;
              const isHovered = hoveredSlice?.id === slice.id;

              return (
                <circle
                  key={slice.id}
                  cx="80"
                  cy="80"
                  r={radius}
                  fill="transparent"
                  stroke={slice.color}
                  strokeWidth={isHovered || isSelected ? strokeWidth + 4 : strokeWidth}
                  strokeDasharray={`${dashLength} ${circumference - dashLength}`}
                  strokeDashoffset={dashOffset}
                  className="transition-all duration-300 cursor-pointer"
                  onMouseEnter={() => setHoveredSlice(slice)}
                  onMouseLeave={() => setHoveredSlice(null)}
                  onClick={() => {
                    if (slice.id !== "other" && onSelectCategory) {
                      onSelectCategory(activeFilter === slice.id ? null : (slice.id as CanonicalCategoryId));
                    }
                  }}
                />
              );
            })}
          </svg>

          {/* Donut Center Display */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-4">
            <span className="text-[10px] font-mono text-ink-soft uppercase tracking-wider">
              {hoveredSlice ? hoveredSlice.label : "Total Outflows"}
            </span>
            <span className="font-serif font-black text-sm sm:text-base text-ink">
              {hoveredSlice ? formatPaise(hoveredSlice.amountPaise) : formatPaise(totalOutflowPaise)}
            </span>
            {hoveredSlice && (
              <span className="text-[10px] font-mono font-bold text-blue-600">
                {hoveredSlice.percent}% of spend
              </span>
            )}
          </div>
        </div>

        {/* Legend */}
        <div className="flex-1 max-w-md space-y-2 w-full">
          {slices.map((slice) => {
            const isSelected = activeFilter === slice.id;
            return (
              <div
                key={slice.id}
                onClick={() => {
                  if (slice.id !== "other" && onSelectCategory) {
                    onSelectCategory(isSelected ? null : (slice.id as CanonicalCategoryId));
                  }
                }}
                onMouseEnter={() => setHoveredSlice(slice)}
                onMouseLeave={() => setHoveredSlice(null)}
                className={`flex items-center justify-between p-2 rounded-lg text-xs cursor-pointer transition-colors ${
                  isSelected
                    ? "bg-blue-50 border border-blue-400 font-semibold"
                    : "hover:bg-slate-50 border border-transparent"
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: slice.color }}
                  />
                  <span className="text-ink truncate font-medium">{slice.label}</span>
                </div>
                <div className="flex items-center gap-3 shrink-0 ml-2">
                  <span className="font-mono text-ink-soft">{formatPaise(slice.amountPaise)}</span>
                  <span className="font-mono font-bold text-ink w-10 text-right">
                    {slice.percent}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
