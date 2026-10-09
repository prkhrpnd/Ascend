"use client";

import React, { useState } from "react";
import { CanonicalCategoryId, CATEGORIES } from "@/lib/engine/categories";
import { formatPaise } from "@/lib/utils";

interface CategoryBarData {
  id: CanonicalCategoryId;
  label: string;
  amountPaise: number;
  transactionCount: number;
  percentOfOutflows: number;
  color: string;
}

interface CategoryBarChartProps {
  categories: CategoryBarData[];
  totalOutflowPaise: number;
  activeFilter?: CanonicalCategoryId | null;
  onSelectCategory?: (id: CanonicalCategoryId | null) => void;
}

export function CategoryBarChart({
  categories,
  totalOutflowPaise,
  activeFilter,
  onSelectCategory,
}: CategoryBarChartProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  // Filter to expense categories with amount > 0, sorted descending
  const sortedCategories = categories
    .filter((c) => c.amountPaise > 0 && CATEGORIES[c.id]?.isExpense)
    .sort((a, b) => b.amountPaise - a.amountPaise);

  if (sortedCategories.length === 0) {
    return (
      <div className="p-8 text-center bg-white rounded-xl border border-rule text-sm text-ink-soft">
        No expense transactions found in this statement.
      </div>
    );
  }

  const maxAmount = Math.max(...sortedCategories.map((c) => c.amountPaise), 1);

  return (
    <div className="space-y-3 w-full max-w-full overflow-hidden box-border">
      <div className="flex items-center justify-between text-xs text-ink-soft">
        <span className="truncate">Click any category bar to filter transaction table</span>
        {activeFilter && (
          <button
            onClick={() => onSelectCategory && onSelectCategory(null)}
            className="text-xs font-semibold text-blue-600 hover:underline cursor-pointer shrink-0 ml-2"
          >
            Clear Filter
          </button>
        )}
      </div>

      <div className="space-y-2.5 w-full max-w-full box-border">
        {sortedCategories.map((item) => {
          const widthPercent = Math.min(100, Math.max(4, Math.round((item.amountPaise / maxAmount) * 100)));
          const isSelected = activeFilter === item.id;
          const isHovered = hoveredId === item.id;

          return (
            <div
              key={item.id}
              onClick={() => {
                if (onSelectCategory) {
                  onSelectCategory(isSelected ? null : item.id);
                }
              }}
              onMouseEnter={() => setHoveredId(item.id)}
              onMouseLeave={() => setHoveredId(null)}
              className={`p-2.5 rounded-lg border transition-all cursor-pointer box-border w-full max-w-full overflow-hidden ${
                isSelected
                  ? "bg-blue-50/80 border-blue-500 shadow-sm"
                  : isHovered
                  ? "bg-slate-50 border-slate-300"
                  : "bg-white border-rule hover:border-slate-300"
              }`}
            >
              <div className="flex items-center justify-between gap-2 text-xs mb-1.5 font-medium w-full min-w-0">
                <div className="flex items-center gap-2 min-w-0 flex-1 overflow-hidden">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-ink font-semibold truncate">{item.label}</span>
                  <span className="text-[11px] text-ink-soft shrink-0">
                    ({item.transactionCount} {item.transactionCount === 1 ? "entry" : "entries"})
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-2 text-right">
                  <span className="font-mono font-bold text-ink whitespace-nowrap">{formatPaise(item.amountPaise)}</span>
                  <span className="text-[11px] text-ink-soft w-10 text-right whitespace-nowrap shrink-0">
                    {item.percentOfOutflows}%
                  </span>
                </div>
              </div>

              {/* Bar track */}
              <div className="w-full max-w-full h-2.5 bg-slate-100 rounded-full overflow-hidden relative box-border">
                <div
                  className="h-full rounded-full transition-all duration-500 max-w-full"
                  style={{
                    width: `${widthPercent}%`,
                    backgroundColor: item.color,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
