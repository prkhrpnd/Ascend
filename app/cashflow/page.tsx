"use client";

import React from "react";
import NextLink from "next/link";
import { useApp } from "@/lib/context/AppContext";
import { IncomeExpenseChart } from "@/components/charts/IncomeExpenseChart";
import { formatPaise, formatDate } from "@/lib/utils";
import {
  Activity,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  TrendingDown,
  Calendar,
  Wallet,
  AlertCircle,
  CheckCircle2,
  Lock,
} from "lucide-react";

export default function CashFlowPage() {
  const {
    analytics,
    income,
    coverage,
    limitAssessment,
  } = useApp();

  return (
    <div className="space-y-8 max-w-7xl mx-auto py-2">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-rule shadow-sm p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-xs font-mono">
            <Activity className="w-3.5 h-3.5 text-blue-600" />
            <span>Cash Flow Rhythm & Liquidity Analysis</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-black text-ink tracking-tight">
            Student Cash Flow Engine
          </h1>
          <p className="text-xs sm:text-sm text-ink-soft max-w-3xl leading-relaxed">
            Ascend analyzes the timing of your regular allowances, tuition inflows, and fixed hostel obligations.
            We align your starter credit due date exactly 2 days after your main cash lands, eliminating default risk.
          </p>
        </div>

        <NextLink
          href="/assess"
          className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-mono font-bold shadow-sm flex items-center justify-center gap-2 transition-colors cursor-pointer shrink-0"
        >
          <ShieldCheck className="w-4 h-4" />
          <span>View Credit Limit Offer</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </NextLink>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Median Monthly Inflow */}
        <div className="bg-white p-5 rounded-2xl border border-rule shadow-sm space-y-1.5">
          <span className="text-[11px] text-ink-soft block font-medium">Median Qualifying Inflow</span>
          <p className="font-serif font-black text-2xl text-ink">
            {income ? formatPaise(income.medianQualifyingIncomePaise) : "₹0"}
          </p>
          <p className="text-[10px] text-ink-soft">
            Excludes loan-app disbursals & friend round-trips
          </p>
        </div>

        {/* Primary Inflow Day */}
        <div className="bg-white p-5 rounded-2xl border border-rule shadow-sm space-y-1.5">
          <span className="text-[11px] text-ink-soft block font-medium">Primary Allowance Day</span>
          <p className="font-serif font-black text-2xl text-blue-700">
            {income ? `Day ${income.primaryIncomeDay}` : "Day 1"} of month
          </p>
          <p className="text-[10px] text-ink-soft">
            {income?.largestRecurringPayee || "Direct Allowance"}
          </p>
        </div>

        {/* Calibrated Due Date */}
        <div className="bg-white p-5 rounded-2xl border border-rule shadow-sm space-y-1.5">
          <span className="text-[11px] text-ink-soft block font-medium">Calibrated Line Due Date</span>
          <p className="font-serif font-black text-2xl text-emerald-700">
            {income ? `Day ${income.dueDate}` : "Day 3"} of month
          </p>
          <p className="text-[10px] text-ink-soft">
            Offset by +2 days after income lands
          </p>
        </div>

        {/* Net Savings Buffer */}
        <div className="bg-white p-5 rounded-2xl border border-rule shadow-sm space-y-1.5">
          <span className="text-[11px] text-ink-soft block font-medium">Overall Savings Rate</span>
          <p className="font-serif font-black text-2xl text-ink">
            {analytics?.savingsRatePercent || 0}%
          </p>
          <p className="text-[10px] text-ink-soft">
            Net cash retained after all expenses
          </p>
        </div>
      </div>

      {/* Cash Flow Comparison Chart */}
      <div className="bg-white rounded-2xl border border-rule shadow-sm p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-rule pb-3">
          <div>
            <h2 className="text-base font-serif font-bold text-ink">
              Monthly Inflow vs Outflow History
            </h2>
            <p className="text-xs text-ink-soft mt-0.5">
              Net balance changes month by month
            </p>
          </div>
          <span className="text-xs font-mono text-ink-soft">
            {analytics ? `${analytics.monthlyBreakdown.length} months plotted` : ""}
          </span>
        </div>

        {analytics && analytics.monthlyBreakdown.length > 0 ? (
          <IncomeExpenseChart data={analytics.monthlyBreakdown} />
        ) : null}
      </div>

      {/* Monthly Breakdown Table */}
      {income && income.months.length > 0 && (
        <div className="bg-white rounded-2xl border border-rule shadow-sm p-6 space-y-4">
          <div className="border-b border-rule pb-3">
            <h2 className="text-base font-serif font-bold text-ink">
              Detailed Monthly Inflow Qualification Table
            </h2>
            <p className="text-xs text-ink-soft mt-0.5">
              Breakdown of qualifying earned income, dependent allowances, and excluded noise
            </p>
          </div>

          <div className="overflow-x-auto rounded-lg border border-rule">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-rule font-mono text-[11px] text-ink-soft">
                  <th className="py-2.5 px-3">Month</th>
                  <th className="py-2.5 px-3 text-right">Earned & Tutoring</th>
                  <th className="py-2.5 px-3 text-right">Allowance</th>
                  <th className="py-2.5 px-3 text-right">Loan App (Excluded)</th>
                  <th className="py-2.5 px-3 text-right">Round Trips</th>
                  <th className="py-2.5 px-3 text-right">Qualifying Inflow</th>
                  <th className="py-2.5 px-3 text-right">Total Outflow</th>
                  <th className="py-2.5 px-3 text-right">Pre-Income Low</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-rule font-mono">
                {income.months.map((m) => (
                  <tr key={m.monthKey} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-bold text-ink">{m.monthKey}</td>
                    <td className="py-2.5 px-3 text-right text-ink">
                      {formatPaise(m.earnedIncomePaise)}
                    </td>
                    <td className="py-2.5 px-3 text-right text-ink">
                      {formatPaise(m.dependentAllowancePaise)}
                    </td>
                    <td className="py-2.5 px-3 text-right text-rose-600">
                      {m.loanAppPaise > 0 ? formatPaise(m.loanAppPaise) : "-"}
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-500">
                      {m.roundTripPaise > 0 ? formatPaise(m.roundTripPaise) : "-"}
                    </td>
                    <td className="py-2.5 px-3 text-right text-emerald-700 font-bold">
                      {formatPaise(m.qualifyingIncomePaise)}
                    </td>
                    <td className="py-2.5 px-3 text-right text-ink">
                      {formatPaise(m.totalOutflowPaise)}
                    </td>
                    <td className="py-2.5 px-3 text-right text-ink-soft">
                      {formatPaise(m.lowestPreIncomeBalancePaise)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Credit Underwriting Linkage Explanation */}
      <div className="bg-slate-50 rounded-2xl border border-rule p-6 sm:p-8 space-y-4">
        <h3 className="text-lg font-serif font-bold text-ink">
          How Ascend Safeguards Student Cash Flow
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="bg-white p-4 rounded-xl border border-rule space-y-1.5">
            <span className="font-bold text-ink block">1. Capacity Cap (20%)</span>
            <p className="text-ink-soft text-[11px] leading-relaxed">
              Ascend limits your credit line to at most 20% of your verified median monthly inflow.
              If you receive ₹6,000, your theoretical capacity cap is ₹1,200.
            </p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-rule space-y-1.5">
            <span className="font-bold text-ink block">2. Fixed Rent Deduction</span>
            <p className="text-ink-soft text-[11px] leading-relaxed">
              Hostel mess and rent charges (e.g. ₹3,000) are reserved before any credit repayment can be scheduled.
              Your shelter is never compromised for debt service.
            </p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-rule space-y-1.5">
            <span className="font-bold text-ink block">3. Stress Buffer Validation</span>
            <p className="text-ink-soft text-[11px] leading-relaxed">
              We test whether your account maintained positive liquidity during historical low-balance periods.
              Your initial line starts at ₹500 and only grows after clean cycles.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
