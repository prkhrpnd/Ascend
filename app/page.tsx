"use client";

import React, { useMemo } from "react";
import NextLink from "next/link";
import { useApp } from "@/lib/context/AppContext";
import { formatPaise, formatDate } from "@/lib/utils";
import { SimulationBadge } from "@/components/SimulationBadge";
import { calculateFinancialHealthScore } from "@/lib/engine/healthScore";
import {
  TrendingUp,
  TrendingDown,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  FileSpreadsheet,
  AlertCircle,
  HelpCircle,
  Calendar,
  Layers,
  Sparkles,
  Info,
  CheckCircle,
  ArrowUpRight,
  Wallet,
  Compass,
} from "lucide-react";

export default function OverviewPage() {
  const {
    profile,
    transactions,
    coverage,
    activeFileName,
    analytics,
    loadPriyaDemoStatement,
  } = useApp();

  // Deterministic Financial Health Score calculation
  const healthScore = useMemo(() => {
    return calculateFinancialHealthScore(analytics, coverage);
  }, [analytics, coverage]);

  // Generate at most 3 compact insights strictly derived from actual data
  const keyInsights = useMemo(() => {
    if (!analytics || analytics.totalTransactions === 0) {
      return [];
    }

    const insights: { id: string; text: string; type: "positive" | "neutral" | "warning" }[] = [];

    // 1. Net Cash Flow Insight
    if (analytics.netCashFlowPaise > 0) {
      insights.push({
        id: "net_cash_flow",
        text: `Net positive cash flow of ${formatPaise(analytics.netCashFlowPaise)} observed across this statement period.`,
        type: "positive",
      });
    } else if (analytics.netCashFlowPaise < 0) {
      insights.push({
        id: "net_cash_flow",
        text: `Net cash deficit of ${formatPaise(Math.abs(analytics.netCashFlowPaise))}: total debits exceeded credits.`,
        type: "warning",
      });
    } else {
      insights.push({
        id: "net_cash_flow",
        text: "Operating at break-even: total incoming credits matched outgoing debits.",
        type: "neutral",
      });
    }

    // 2. Spending Trend across periods (only when multiple months of history exist)
    if (analytics.monthlyBreakdown && analytics.monthlyBreakdown.length >= 2) {
      const lastMonth = analytics.monthlyBreakdown[analytics.monthlyBreakdown.length - 1];
      const prevMonth = analytics.monthlyBreakdown[analytics.monthlyBreakdown.length - 2];
      const diff = lastMonth.outflowPaise - prevMonth.outflowPaise;

      if (diff > 0) {
        insights.push({
          id: "period_trend",
          text: `Spending increased by ${formatPaise(diff)} in ${lastMonth.monthLabel} compared to ${prevMonth.monthLabel}.`,
          type: "warning",
        });
      } else if (diff < 0) {
        insights.push({
          id: "period_trend",
          text: `Spending decreased by ${formatPaise(Math.abs(diff))} in ${lastMonth.monthLabel} compared to ${prevMonth.monthLabel}.`,
          type: "positive",
        });
      } else {
        insights.push({
          id: "period_trend",
          text: `Monthly spending held steady between ${prevMonth.monthLabel} and ${lastMonth.monthLabel}.`,
          type: "neutral",
        });
      }
    } else if (analytics.topCategory && analytics.topCategory.percent > 0) {
      // Single period fallback: Top outflow category share
      insights.push({
        id: "top_category",
        text: `${analytics.topCategory.label} represents your highest outflow at ${analytics.topCategory.percent}% of statement spend.`,
        type: "neutral",
      });
    }

    // 3. Cash Withdrawal or Recurring Commitments Insight
    const cashOutflow = analytics.categoryTotals?.cash_withdrawals?.amountPaise || 0;
    if (cashOutflow > 0 && analytics.totalOutflowPaise > 0) {
      const cashPercent = Math.round((cashOutflow / analytics.totalOutflowPaise) * 100);
      if (cashPercent >= 15) {
        insights.push({
          id: "cash_withdrawals",
          text: `Cash withdrawals account for ${cashPercent}% of total debits (${formatPaise(cashOutflow)} total).`,
          type: "warning",
        });
      } else {
        insights.push({
          id: "cash_withdrawals",
          text: `Low cash withdrawal leakage (${cashPercent}% of debits), maintaining high digital traceability.`,
          type: "positive",
        });
      }
    } else if (analytics.recurringExpenseTotalPaise > 0 && analytics.totalOutflowPaise > 0) {
      const recurringPercent = Math.round((analytics.recurringExpenseTotalPaise / analytics.totalOutflowPaise) * 100);
      insights.push({
        id: "recurring_ratio",
        text: `Fixed commitments (rent, utilities) make up ${recurringPercent}% of all statement expenses.`,
        type: "neutral",
      });
    }

    return insights.slice(0, 3);
  }, [analytics]);

  // Statement period display string
  const statementPeriodText = useMemo(() => {
    if (coverage?.startDate && coverage?.endDate) {
      return `${formatDate(coverage.startDate)} to ${formatDate(coverage.endDate)}`;
    }
    if (analytics?.startDate && analytics?.endDate) {
      return `${formatDate(analytics.startDate)} to ${formatDate(analytics.endDate)}`;
    }
    return "No statement uploaded";
  }, [coverage, analytics]);

  // Color mapping for Health Score Badge
  const ratingBadgeStyles = {
    Excellent: "bg-emerald-50 text-emerald-800 border-emerald-200",
    Good: "bg-blue-50 text-blue-800 border-blue-200",
    Fair: "bg-amber-50 text-amber-800 border-amber-200",
    "Needs Attention": "bg-rose-50 text-rose-800 border-rose-200",
    "Insufficient Data": "bg-slate-100 text-slate-700 border-slate-200",
  }[healthScore.rating];

  const ratingRingColor = {
    Excellent: "#10B981", // emerald
    Good: "#3B82F6", // blue
    Fair: "#F59E0B", // amber
    "Needs Attention": "#EF4444", // rose
    "Insufficient Data": "#9CA3AF", // slate
  }[healthScore.rating];

  return (
    <div className="space-y-8 max-w-7xl mx-auto py-2">
      {/* Header Bar */}
      <div className="bg-white rounded-2xl border border-rule shadow-sm p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Profile: {profile.name}</span>
            <SimulationBadge label="DEMO" size="sm" />
          </div>

          <h1 className="text-2xl sm:text-3xl font-serif font-black text-ink tracking-tight">
            Financial Health & Account Overview
          </h1>

          <p className="text-xs sm:text-sm text-ink-soft max-w-2xl leading-relaxed">
            A scannable summary of your verified cash position, health score, and next steps.
            Derived deterministically from your active bank statement.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
          <NextLink
            href="/statements"
            className="px-4 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-rule text-xs font-medium text-ink flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-blue-600" />
            <span>Manage Bank Statements</span>
          </NextLink>

          <NextLink
            href="/assess"
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-mono font-bold shadow-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Evaluate Starter Credit</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </NextLink>
        </div>
      </div>

      {/* Component A: Financial Snapshot */}
      <section className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-sm font-serif font-bold text-ink uppercase tracking-wider">
            Financial Snapshot
          </h2>
          <span className="text-xs text-ink-soft font-mono">
            Active file: {activeFileName || "No file uploaded"}
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {/* Total Money Credited */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-rule shadow-sm space-y-1.5 box-border">
            <div className="flex items-center justify-between text-xs text-ink-soft">
              <span className="font-medium">Total Credited</span>
              <span className="p-1 rounded-md bg-emerald-50 text-emerald-600">
                <TrendingUp className="w-3.5 h-3.5" />
              </span>
            </div>
            <p className="font-mono font-bold text-lg sm:text-xl text-emerald-700 truncate">
              {analytics ? formatPaise(analytics.totalInflowPaise) : "₹0"}
            </p>
            <p className="text-[10px] text-ink-soft">All incoming credits</p>
          </div>

          {/* Total Money Debited */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-rule shadow-sm space-y-1.5 box-border">
            <div className="flex items-center justify-between text-xs text-ink-soft">
              <span className="font-medium">Total Debited</span>
              <span className="p-1 rounded-md bg-rose-50 text-rose-600">
                <TrendingDown className="w-3.5 h-3.5" />
              </span>
            </div>
            <p className="font-mono font-bold text-lg sm:text-xl text-rose-600 truncate">
              {analytics ? formatPaise(analytics.totalOutflowPaise) : "₹0"}
            </p>
            <p className="text-[10px] text-ink-soft">All expenses & withdrawals</p>
          </div>

          {/* Net Cash Flow */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-rule shadow-sm space-y-1.5 box-border">
            <div className="flex items-center justify-between text-xs text-ink-soft">
              <span className="font-medium">Net Cash Flow</span>
              <span className="p-1 rounded-md bg-blue-50 text-blue-600">
                <Wallet className="w-3.5 h-3.5" />
              </span>
            </div>
            <p
              className={`font-mono font-bold text-lg sm:text-xl truncate ${
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
              Retention rate: {analytics?.savingsRatePercent || 0}%
            </p>
          </div>

          {/* Number of Transactions Analyzed */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-rule shadow-sm space-y-1.5 box-border">
            <div className="flex items-center justify-between text-xs text-ink-soft">
              <span className="font-medium">Transactions</span>
              <span className="p-1 rounded-md bg-slate-50 text-slate-600">
                <Layers className="w-3.5 h-3.5" />
              </span>
            </div>
            <p className="font-mono font-bold text-lg sm:text-xl text-ink truncate">
              {analytics ? `${analytics.totalTransactions} rows` : "0"}
            </p>
            <p className="text-[10px] text-ink-soft">Normalized records</p>
          </div>

          {/* Selected Statement Period */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-rule shadow-sm space-y-1.5 col-span-2 md:col-span-1 box-border">
            <div className="flex items-center justify-between text-xs text-ink-soft">
              <span className="font-medium">Statement Period</span>
              <span className="p-1 rounded-md bg-slate-50 text-slate-600">
                <Calendar className="w-3.5 h-3.5" />
              </span>
            </div>
            <p className="font-mono font-bold text-xs text-ink leading-snug truncate">
              {statementPeriodText}
            </p>
            <p className="text-[10px] text-ink-soft">
              {analytics?.daysCount ? `${analytics.daysCount} active days` : "Unverified"}
            </p>
          </div>
        </div>
      </section>

      {/* Middle Section: Financial Health Score & Key Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Component B: Financial Health Score (7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-rule shadow-sm p-6 sm:p-8 space-y-6">
          <div className="flex items-start justify-between gap-4 border-b border-rule pb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-base sm:text-lg font-serif font-bold text-ink">
                  Financial Health Score
                </h2>
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded-full border font-bold ${ratingBadgeStyles}`}
                >
                  {healthScore.rating}
                </span>
              </div>
              <p className="text-xs text-ink-soft">
                Transparent evaluation derived from real cash surplus, obligation ratios, and consistency
              </p>
            </div>
          </div>

          {/* Score Visualization + Reasons Grid */}
          <div className="flex flex-col sm:flex-row items-center gap-6">
            {/* Circular Gauge Visualization */}
            <div className="relative w-32 h-32 shrink-0 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                {/* Background Ring */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                  stroke="#E2E8F0"
                  strokeWidth="8"
                />
                {/* Score Progress Ring */}
                {healthScore.isAvailable && healthScore.score !== null && (
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                    stroke={ratingRingColor}
                    strokeWidth="8"
                    strokeDasharray={2 * Math.PI * 40}
                    strokeDashoffset={
                      2 * Math.PI * 40 * (1 - Math.min(100, Math.max(0, healthScore.score)) / 100)
                    }
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out"
                  />
                )}
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                {healthScore.isAvailable && healthScore.score !== null ? (
                  <>
                    <span className="font-mono font-black text-2xl text-ink leading-none">
                      {healthScore.score}
                    </span>
                    <span className="text-[10px] font-mono text-ink-soft font-semibold mt-0.5">
                      / 100
                    </span>
                  </>
                ) : (
                  <span className="text-xs font-mono text-ink-soft font-semibold">N/A</span>
                )}
              </div>
            </div>

            {/* Concise Explanatory Reasons */}
            <div className="space-y-2 flex-1 w-full text-xs">
              <span className="font-serif font-bold text-xs text-ink block">
                Score Composition Factors:
              </span>
              <ul className="space-y-1.5 text-ink-soft font-sans">
                {healthScore.reasons.map((reason, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span className="leading-snug text-ink">{reason}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Subscores Progress Bars */}
          {healthScore.isAvailable && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-rule/60 text-xs font-mono">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/60 space-y-1">
                <span className="text-[10px] text-ink-soft block">Cash Surplus</span>
                <span className="font-bold text-ink">{healthScore.subScores.cashFlowSurplus}/35</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/60 space-y-1">
                <span className="text-[10px] text-ink-soft block">Fixed Ratio</span>
                <span className="font-bold text-ink">{healthScore.subScores.fixedObligationRatio}/25</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/60 space-y-1">
                <span className="text-[10px] text-ink-soft block">Consistency</span>
                <span className="font-bold text-ink">{healthScore.subScores.periodConsistency}/25</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/60 space-y-1">
                <span className="text-[10px] text-ink-soft block">Discipline</span>
                <span className="font-bold text-ink">{healthScore.subScores.spendingDiscipline}/15</span>
              </div>
            </div>
          )}

          {/* Regulatory & Bureau Disclosures */}
          <div className="p-3 rounded-xl bg-slate-50 border border-rule/80 text-[11px] text-ink-soft flex items-start gap-2 leading-relaxed">
            <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
            <span>{healthScore.disclaimer}</span>
          </div>
        </div>

        {/* Component C: Key Insights (5 Cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-rule shadow-sm p-6 sm:p-8 space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="border-b border-rule pb-3">
              <h2 className="text-base sm:text-lg font-serif font-bold text-ink">
                Key Insights
              </h2>
              <p className="text-xs text-ink-soft">
                At most three data-backed observations parsed from your statement
              </p>
            </div>

            {keyInsights.length > 0 ? (
              <div className="space-y-3">
                {keyInsights.map((insight, idx) => (
                  <div
                    key={insight.id || idx}
                    className={`p-3.5 rounded-xl border text-xs leading-relaxed flex items-start gap-2.5 ${
                      insight.type === "positive"
                        ? "bg-emerald-50/60 border-emerald-200 text-emerald-950"
                        : insight.type === "warning"
                        ? "bg-amber-50/60 border-amber-200 text-amber-950"
                        : "bg-slate-50 border-slate-200 text-slate-900"
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0 mt-1.5" />
                    <span className="font-medium">{insight.text}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center text-xs text-ink-soft bg-slate-50 rounded-xl border border-rule">
                Upload a statement to generate data-backed insights.
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-rule text-right">
            <NextLink
              href="/spending"
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 inline-flex items-center gap-1 cursor-pointer"
            >
              <span>Explore Detailed Spending Analysis</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </NextLink>
          </div>
        </div>
      </div>

      {/* Component D: Recommended Next Action */}
      <section className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-blue-200 uppercase tracking-wider">
            <Compass className="w-3.5 h-3.5 text-blue-300" />
            <span>Recommended Next Action</span>
          </div>
          <h3 className="text-lg sm:text-xl font-serif font-black leading-snug">
            {healthScore.actionableSuggestion}
          </h3>
          <p className="text-xs text-blue-100 leading-relaxed font-sans">
            Ascend aligns your starter ₹500 credit line with your confirmed primary cash flow cycle, protecting your ₹300 safety buffer against unplanned expenses.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
          <NextLink
            href="/assess"
            className="px-6 py-3 rounded-xl bg-white text-blue-900 hover:bg-blue-50 font-mono text-xs font-bold shadow transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Evaluate Starter Credit</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </NextLink>

          <NextLink
            href="/simulator"
            className="px-5 py-3 rounded-xl bg-blue-800/80 hover:bg-blue-800 border border-blue-400/30 text-white font-mono text-xs font-medium transition-colors flex items-center justify-center cursor-pointer"
          >
            <span>Affordability Simulator</span>
          </NextLink>
        </div>
      </section>
    </div>
  );
}
