"use client";

import React from "react";
import NextLink from "next/link";
import { useApp } from "@/lib/context/AppContext";
import { formatPaise, formatDate } from "@/lib/utils";
import { CategoryBarChart } from "@/components/charts/CategoryBarChart";
import { IncomeExpenseChart } from "@/components/charts/IncomeExpenseChart";
import { SpendingTrendChart } from "@/components/charts/SpendingTrendChart";
import { CategoryDonutChart } from "@/components/charts/CategoryDonutChart";
import { TransactionExplorer } from "@/components/TransactionExplorer";
import {
  TrendingUp,
  TrendingDown,
  PieChart,
  Calendar,
  Layers,
  ArrowRight,
  ShieldCheck,
  Repeat,
  ShoppingBag,
  Clock,
  Sparkles,
} from "lucide-react";

export default function SpendingAnalysisPage() {
  const {
    transactions,
    analytics,
    activeCategoryFilter,
    setActiveCategoryFilter,
    updateTransactionCategory,
  } = useApp();

  return (
    <div className="space-y-8 max-w-7xl mx-auto py-2">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-rule shadow-sm p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-xs font-mono">
            <PieChart className="w-3.5 h-3.5 text-blue-600" />
            <span>Interactive Statement Analytics</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-black text-ink tracking-tight">
            Spending Analysis and Expense Breakdown
          </h1>
          <p className="text-xs sm:text-sm text-ink-soft max-w-3xl leading-relaxed">
            Detailed spending summaries, time-series trends, and dynamic category breakdowns parsed
            from your uploaded statement. Click any category bar in the charts to filter the transaction explorer.
          </p>
        </div>

        <NextLink
          href="/assess"
          className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-mono font-bold shadow-sm flex items-center justify-center gap-2 transition-colors cursor-pointer shrink-0"
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Apply to Credit Limit</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </NextLink>
      </div>

      {/* Dynamic Spending Metrics Grid (Step 5) */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {/* Total Inflow */}
        <div className="bg-white p-4 rounded-xl border border-rule shadow-sm space-y-1">
          <span className="text-[11px] text-ink-soft block font-medium">Total Inflows</span>
          <p className="font-mono font-bold text-lg text-emerald-700">
            {analytics ? formatPaise(analytics.totalInflowPaise) : "₹0"}
          </p>
          <p className="text-[10px] text-ink-soft">Incoming credits</p>
        </div>

        {/* Total Outflow */}
        <div className="bg-white p-4 rounded-xl border border-rule shadow-sm space-y-1">
          <span className="text-[11px] text-ink-soft block font-medium">Total Outflows</span>
          <p className="font-mono font-bold text-lg text-rose-600">
            {analytics ? formatPaise(analytics.totalOutflowPaise) : "₹0"}
          </p>
          <p className="text-[10px] text-ink-soft">All debits analyzed</p>
        </div>

        {/* Net Cash Flow */}
        <div className="bg-white p-4 rounded-xl border border-rule shadow-sm space-y-1">
          <span className="text-[11px] text-ink-soft block font-medium">Net Cash Flow</span>
          <p
            className={`font-mono font-bold text-lg ${
              analytics && analytics.netCashFlowPaise >= 0 ? "text-emerald-700" : "text-rose-700"
            }`}
          >
            {analytics ? (
              <>
                {analytics.netCashFlowPaise >= 0 ? "+" : ""}
                {formatPaise(analytics.netCashFlowPaise)}
              </>
            ) : (
              "₹0"
            )}
          </p>
          <p className="text-[10px] text-ink-soft">
            Savings: <strong>{analytics?.savingsRatePercent || 0}%</strong>
          </p>
        </div>

        {/* Average Daily Spend */}
        <div className="bg-white p-4 rounded-xl border border-rule shadow-sm space-y-1">
          <span className="text-[11px] text-ink-soft block font-medium">Average Daily Spend</span>
          <p className="font-mono font-bold text-lg text-ink">
            {analytics ? formatPaise(analytics.averageDailySpendPaise) : "₹0"}
          </p>
          <p className="text-[10px] text-ink-soft">
            Over {analytics?.daysCount || 0} statement days
          </p>
        </div>

        {/* Recurring vs One-Off */}
        <div className="bg-white p-4 rounded-xl border border-rule shadow-sm space-y-1 col-span-2 md:col-span-1">
          <span className="text-[11px] text-ink-soft block font-medium">Fixed Recurring</span>
          <p className="font-mono font-bold text-lg text-blue-700">
            {analytics ? formatPaise(analytics.recurringExpenseTotalPaise) : "₹0"}
          </p>
          <p className="text-[10px] text-ink-soft">
            Rent & bill commitments
          </p>
        </div>
      </div>

      {/* Row 1 Charts: Vertically Stacked Category Donut & Category Breakdown */}
      {/* Top Section: Top Categories Share (Donut Chart) */}
      <div className="min-w-0 bg-white rounded-2xl border border-rule shadow-sm p-6 space-y-4 overflow-hidden box-border">
        <div className="flex items-center justify-between border-b border-rule pb-3">
          <div>
            <h2 className="text-base font-serif font-bold text-ink">Top Categories Share</h2>
            <p className="text-xs text-ink-soft mt-0.5">
              Proportion of total statement spend
            </p>
          </div>
          {activeCategoryFilter && (
            <button
              onClick={() => setActiveCategoryFilter(null)}
              className="text-xs font-semibold text-blue-600 hover:underline cursor-pointer"
            >
              Clear Filter
            </button>
          )}
        </div>

        {analytics ? (
          <div className="flex justify-center w-full py-1">
            <div className="w-full max-w-2xl">
              <CategoryDonutChart
                categoryTotals={analytics.categoryTotals}
                totalOutflowPaise={analytics.totalOutflowPaise}
                activeFilter={activeCategoryFilter}
                onSelectCategory={setActiveCategoryFilter}
              />
            </div>
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-ink-soft">No expense data available.</div>
        )}
      </div>

      {/* Bottom Section: Expense Breakdown by Category (Bar Chart) */}
      <div className="min-w-0 bg-white rounded-2xl border border-rule shadow-sm p-6 space-y-4 overflow-hidden box-border">
        <div className="flex items-center justify-between border-b border-rule pb-3">
          <div>
            <h2 className="text-base font-serif font-bold text-ink">
              Expense Breakdown by Category
            </h2>
            <p className="text-xs text-ink-soft mt-0.5">
              Sorted by highest spend. Click any bar to filter the transaction list below.
            </p>
          </div>
          {activeCategoryFilter && (
            <button
              onClick={() => setActiveCategoryFilter(null)}
              className="text-xs font-semibold text-blue-600 hover:underline cursor-pointer"
            >
              Clear Filter
            </button>
          )}
        </div>

        {analytics ? (
          <CategoryBarChart
            categories={Object.values(analytics.categoryTotals)}
            totalOutflowPaise={analytics.totalOutflowPaise}
            activeFilter={activeCategoryFilter}
            onSelectCategory={setActiveCategoryFilter}
          />
        ) : (
          <div className="p-8 text-center text-xs text-ink-soft">No expense data available.</div>
        )}
      </div>

      {/* Row 2 Charts: Monthly Comparison & Spending Trends Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Income vs Expenses Comparison */}
        <div className="bg-white rounded-2xl border border-rule shadow-sm p-6 space-y-4">
          <div className="border-b border-rule pb-3">
            <h2 className="text-base font-serif font-bold text-ink">
              Income vs Expenses Comparison (Monthly)
            </h2>
            <p className="text-xs text-ink-soft mt-0.5">
              Cash flow comparison across each statement month
            </p>
          </div>

          {analytics && analytics.monthlyBreakdown.length > 0 ? (
            <IncomeExpenseChart data={analytics.monthlyBreakdown} />
          ) : null}
        </div>

        {/* Daily Spending Trends Over Time */}
        <div className="bg-white rounded-2xl border border-rule shadow-sm p-6 space-y-4">
          <div className="border-b border-rule pb-3">
            <h2 className="text-base font-serif font-bold text-ink">
              Spending Trends Over Time (Daily Outflows)
            </h2>
            <p className="text-xs text-ink-soft mt-0.5">
              Timeline of daily outflows with peak expense indicators
            </p>
          </div>

          {transactions.length > 0 ? (
            <SpendingTrendChart transactions={transactions} />
          ) : null}
        </div>
      </div>

      {/* Transaction Explorer and Filtering (Step 7) */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-xl font-serif font-black text-ink">
              Transaction Explorer and Category Editor
            </h2>
            <p className="text-xs text-ink-soft mt-0.5">
              Search, filter, and manually re-categorize any transaction. Changes immediately update all charts above.
            </p>
          </div>

          <span className="text-[11px] font-mono text-ink-soft bg-white px-3 py-1 rounded-lg border border-rule">
            {transactions.length} Total Statement Records
          </span>
        </div>

        <TransactionExplorer
          transactions={transactions}
          activeCategoryFilter={activeCategoryFilter}
          onSelectCategoryFilter={setActiveCategoryFilter}
          onUpdateCategory={updateTransactionCategory}
        />
      </div>
    </div>
  );
}
