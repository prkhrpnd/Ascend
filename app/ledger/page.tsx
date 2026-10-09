"use client";

import React, { useState } from "react";
import NextLink from "next/link";
import { useAuth } from "@/lib/supabase/auth-context";
import { useApp } from "@/lib/context/AppContext";
import { SimulationBadge } from "@/components/SimulationBadge";
import { formatPaise, formatDate } from "@/lib/utils";
import {
  Filter,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Receipt,
  FileText,
  Calendar,
  Sparkles,
  ShieldCheck,
} from "lucide-react";

export default function LedgerPage() {
  const { user } = useAuth();
  const {
    transactions,
    coverage,
    recurringItems,
    income,
    rentConfirmed,
    setRentConfirmed,
    profile,
    isSandboxMode,
    loadSampleProfile,
  } = useApp();

  const [activeTab, setActiveTab] = useState<"all" | "inflows" | "outflows">("all");
  const [rentCircleAnimation, setRentCircleAnimation] = useState(false);

  // If no transactions exist, render a clean, helpful empty state
  if (transactions.length === 0) {
    return (
      <div className="max-w-3xl mx-auto py-8 text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-ledger-green/10 text-ledger-green mx-auto flex items-center justify-center">
          <Receipt className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h1 className="font-serif font-bold text-2xl sm:text-3xl text-ink">
            No Verified Transactions Yet
          </h1>
          <p className="text-xs text-ink-soft max-w-md mx-auto leading-relaxed">
            Your verified cash flow ledger and starter credit limits are calculated directly from your bank statement. Link your account or upload a statement to begin.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2 font-mono text-xs">
          <NextLink
            href="/link"
            className="w-full sm:w-auto px-6 py-3 rounded-lg bg-ledger-green text-paper font-bold shadow hover:bg-[#23472c] transition-colors flex items-center justify-center gap-2"
          >
            <span>Link Account via Aggregator</span>
            <ArrowRight className="w-4 h-4" />
          </NextLink>

          <NextLink
            href="/link"
            className="w-full sm:w-auto px-6 py-3 rounded-lg border border-rule bg-paper-2 hover:bg-rule/30 text-ink font-semibold transition-colors flex items-center justify-center gap-2"
          >
            <FileText className="w-4 h-4 text-ink-soft" />
            <span>Upload Statement CSV</span>
          </NextLink>
        </div>

        {/* Quick sandbox evaluation button for evaluators */}
        <div className="pt-8 border-t border-rule/60 max-w-sm mx-auto text-xs font-mono text-ink-soft">
          <p className="mb-2 text-[11px] uppercase tracking-wider font-semibold">
            Developer / Evaluator Mode
          </p>
          <button
            type="button"
            onClick={() => loadSampleProfile("priya")}
            className="px-4 py-2 rounded bg-paper border border-rule hover:bg-paper-2 text-ink text-[11px] cursor-pointer"
          >
            Load Simulated Benchmark Statement
          </button>
        </div>
      </div>
    );
  }

  const rentItem = recurringItems.find((r) => r.isRent || r.normalizedPayee.includes("HOSTEL"));

  const handleConfirmRent = (confirmed: boolean) => {
    setRentConfirmed(confirmed);
    if (confirmed) {
      setRentCircleAnimation(true);
      setTimeout(() => setRentCircleAnimation(false), 2000);
    }
  };

  const filteredTxs = transactions.filter((t) => {
    if (activeTab === "inflows") return t.type === "CR";
    if (activeTab === "outflows") return t.type === "DR";
    return true;
  });

  const categoryLabels: Record<string, string> = {
    rent_hostel: "Hostel and Rent",
    food_delivery: "Food Delivery",
    groceries: "Local Kirana",
    transport: "Campus Transport",
    utilities: "Mess Electricity",
    phone_subscription: "Mobile and Subscriptions",
    loan_app_repayment: "Loan App Repayment",
    friend_transfer: "Peer Transfers",
    unknown: "General Expenses",
  };

  // Find round trip or loan app items from current data
  const roundTripItems = transactions.filter((t) => t.isRoundTrip);
  const loanAppItems = transactions.filter((t) => t.isLoanApp);

  const studentName = profile.name || user?.email?.split("@")[0] || "Student";

  return (
    <div className="max-w-5xl mx-auto py-4 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-rule pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-serif font-bold text-2xl sm:text-3xl text-ink">
              Verified Cash Flow Ledger
            </h1>
            <SimulationBadge
              label={isSandboxMode ? "SIMULATED BENCHMARK" : "VERIFIED STATEMENT DATA"}
              size="sm"
            />
          </div>
          <p className="text-xs text-ink-soft mt-1">
            Deterministic cash flow parsing and categorisation for {studentName} ({profile.college || "Campus Pilot"}).
          </p>
        </div>

        <NextLink
          href="/assess"
          className="px-5 py-2.5 rounded-lg bg-ledger-green text-paper font-mono font-bold text-xs shadow hover:bg-[#23472c] transition-colors flex items-center justify-center gap-2 self-start sm:self-auto cursor-pointer"
        >
          <span>Run Day-1 Backtest</span>
          <ArrowRight className="w-4 h-4" />
        </NextLink>
      </div>

      {/* Coverage and Confidence Ribbon */}
      {coverage && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
          <div className="p-3 rounded-lg bg-paper-2 border border-rule">
            <span className="text-ink-soft text-[10px] block">Verified Period</span>
            <span className="font-bold text-ink mt-0.5 block">
              {formatDate(coverage.startDate)} to {formatDate(coverage.endDate)}
            </span>
          </div>
          <div className="p-3 rounded-lg bg-paper-2 border border-rule">
            <span className="text-ink-soft text-[10px] block">History Depth</span>
            <span className="font-bold text-ink mt-0.5 block">{coverage.monthsCount} Calendar Months</span>
          </div>
          <div className="p-3 rounded-lg bg-paper-2 border border-rule">
            <span className="text-ink-soft text-[10px] block">Transactions Parsed</span>
            <span className="font-bold text-ink mt-0.5 block">{coverage.totalTransactions} Verified</span>
          </div>
          <div className="p-3 rounded-lg bg-paper-2 border border-rule">
            <span className="text-ink-soft text-[10px] block">Coverage Confidence</span>
            <span className="font-bold text-ledger-green uppercase mt-0.5 block flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{coverage.confidence}</span>
            </span>
          </div>
        </div>
      )}

      {/* Flags & Special Filters Panel */}
      {(roundTripItems.length > 0 || loanAppItems.length > 0) && (
        <div className="space-y-3">
          {roundTripItems.length > 0 && (
            <div className="p-3.5 rounded-lg bg-paper-2 border border-rule flex items-start gap-3 text-xs">
              <Filter className="w-4 h-4 text-marigold shrink-0 mt-0.5" />
              <div className="flex-1 font-mono">
                <span className="font-bold text-ink block">Round-Trip Filter Triggered</span>
                <p className="text-ink-soft text-[11px] font-sans mt-0.5">
                  Detected offsetting reciprocal peer transfers ({roundTripItems.length} transactions). Excluded from qualifying regular monthly income.
                </p>
              </div>
              <span className="px-2 py-0.5 rounded bg-marigold/10 border border-marigold text-ink text-[10px] font-mono font-bold">
                NET ZERO
              </span>
            </div>
          )}

          {loanAppItems.length > 0 && (
            <div className="p-3.5 rounded-lg bg-red-50/50 border border-red-200 flex items-start gap-3 text-xs">
              <AlertTriangle className="w-4 h-4 text-red-700 shrink-0 mt-0.5" />
              <div className="flex-1 font-mono">
                <span className="font-bold text-red-800 block">Third-Party Borrowing Inflow Flagged</span>
                <p className="text-red-900/80 text-[11px] font-sans mt-0.5">
                  External app lending inflow detected. Classified as borrowed funds rather than earned income, and excluded from repayment capacity calculation.
                </p>
              </div>
              <span className="px-2 py-0.5 rounded bg-red-100 border border-red-300 text-red-800 text-[10px] font-mono font-bold">
                EXCLUDED
              </span>
            </div>
          )}
        </div>
      )}

      {/* Signature Moment: One-Tap Rent Confirmation */}
      {rentItem && (
        <div
          className={`p-4 rounded-xl border-2 transition-all relative ${
            rentConfirmed
              ? "bg-ledger-green/5 border-ledger-green/40"
              : "bg-paper-2 border-ledger-green/30"
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-ink">
                  Recurring Fixed Obligation Detection
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-paper border border-rule">
                  {rentItem.occurrences} monthly occurrences
                </span>
              </div>
              <p className="font-serif text-lg font-bold text-ink">
                Is ₹{(rentItem.amount_paise / 100).toLocaleString("en-IN")} to {rentItem.normalizedPayee} your monthly accommodation / mess payment?
              </p>
              <p className="text-xs text-ink-soft">
                Found recurring outflow on day {rentItem.dayOfMonth} of every month with 28 to 32 day periodicity.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {rentConfirmed ? (
                <div className="flex items-center gap-2 text-ledger-green font-mono text-xs font-bold">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Obligation Confirmed</span>
                </div>
              ) : (
                <>
                  <button
                    onClick={() => handleConfirmRent(true)}
                    className="px-4 py-2 rounded-lg bg-ledger-green text-paper font-mono text-xs font-bold hover:bg-[#23472c] transition-colors cursor-pointer"
                  >
                    Yes, Confirm Amount
                  </button>
                  <button
                    onClick={() => handleConfirmRent(false)}
                    className="px-3 py-2 rounded-lg border border-rule text-ink-soft font-mono text-xs hover:bg-paper transition-colors cursor-pointer"
                  >
                    No
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Cash Flow Visualisation: Monthly Bar Chart */}
      {income && (
        <section className="p-5 rounded-xl bg-paper-2 border border-rule space-y-4">
          <div className="flex items-center justify-between border-b border-rule pb-2">
            <div>
              <h2 className="font-serif font-bold text-base text-ink">Monthly Cash Flow Breakdown</h2>
              <span className="text-[11px] text-ink-soft font-mono">Inflows vs Outflows across verified history</span>
            </div>
            <div className="flex items-center gap-3 text-[11px] font-mono">
              <span className="flex items-center gap-1 text-ledger-green">
                <span className="w-2.5 h-2.5 rounded bg-ledger-green" /> Inflows
              </span>
              <span className="flex items-center gap-1 text-red-700">
                <span className="w-2.5 h-2.5 rounded bg-red-700" /> Outflows
              </span>
            </div>
          </div>

          <div className="space-y-3">
            {income.months.map((m) => {
              const maxVal = 1000000; // Rs 10,000 scale
              const inWidth = Math.min(100, Math.round((m.totalInflowPaise / maxVal) * 100));
              const outWidth = Math.min(100, Math.round((m.totalOutflowPaise / maxVal) * 100));

              return (
                <div key={m.monthKey} className="space-y-1 text-xs font-mono">
                  <div className="flex justify-between text-[11px] text-ink-soft">
                    <span className="font-bold text-ink">{m.monthKey}</span>
                    <span>
                      In: {formatPaise(m.totalInflowPaise)} | Out: {formatPaise(m.totalOutflowPaise)} | Min Balance:{" "}
                      <strong className="text-ink">{formatPaise(m.lowestPreIncomeBalancePaise)}</strong>
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="w-full bg-paper rounded h-2.5 overflow-hidden flex">
                      <div
                        style={{ width: `${inWidth}%` }}
                        className="bg-ledger-green h-full rounded transition-all duration-500"
                      />
                    </div>
                    <div className="w-full bg-paper rounded h-2.5 overflow-hidden flex">
                      <div
                        style={{ width: `${outWidth}%` }}
                        className="bg-red-700 h-full rounded transition-all duration-500"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-3 rounded-lg bg-paper border border-rule flex flex-col sm:flex-row sm:items-center justify-between text-xs font-mono">
            <span>Median Monthly Qualifying Inflow:</span>
            <span className="font-bold text-base text-ink">{formatPaise(income.medianQualifyingIncomePaise)}</span>
          </div>
        </section>
      )}

      {/* Category Breakdown & Ledger Entries */}
      <section className="space-y-4">
        {/* Navigation Tabs */}
        <div className="flex items-center justify-between border-b border-rule pb-2">
          <div className="flex items-center gap-1 text-xs font-mono">
            <button
              onClick={() => setActiveTab("all")}
              className={`px-3 py-1.5 rounded transition-colors cursor-pointer ${
                activeTab === "all" ? "bg-ink text-paper font-bold" : "text-ink-soft hover:bg-paper-2"
              }`}
            >
              All ({transactions.length})
            </button>
            <button
              onClick={() => setActiveTab("inflows")}
              className={`px-3 py-1.5 rounded transition-colors cursor-pointer ${
                activeTab === "inflows" ? "bg-ink text-paper font-bold" : "text-ink-soft hover:bg-paper-2"
              }`}
            >
              Credits Only
            </button>
            <button
              onClick={() => setActiveTab("outflows")}
              className={`px-3 py-1.5 rounded transition-colors cursor-pointer ${
                activeTab === "outflows" ? "bg-ink text-paper font-bold" : "text-ink-soft hover:bg-paper-2"
              }`}
            >
              Debits Only
            </button>
          </div>

          <span className="text-[11px] font-mono text-ink-soft hidden sm:inline">
            Rupees right-aligned with Indian digit grouping
          </span>
        </div>

        {/* Ledger Table */}
        <div className="border border-rule rounded-lg bg-paper overflow-hidden shadow-sm">
          <div className="overflow-x-auto max-h-[440px]">
            <table className="w-full text-xs font-mono divide-y divide-rule text-left">
              <thead className="bg-paper-2 sticky top-0 z-10 text-[11px] text-ink-soft uppercase tracking-wider">
                <tr>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Narration</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3 text-right">Debit</th>
                  <th className="py-2.5 px-3 text-right">Credit</th>
                  <th className="py-2.5 px-3 text-right">Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-rule/60">
                {filteredTxs.map((t) => (
                  <tr
                    key={t.id}
                    className={`hover:bg-paper-2/60 transition-colors ${
                      t.isLoanApp
                        ? "bg-red-50/40"
                        : t.isRoundTrip
                        ? "bg-marigold/5"
                        : t.narration.includes("RENT") && rentConfirmed
                        ? "bg-ledger-green/5"
                        : ""
                    }`}
                  >
                    <td className="py-2 px-3 whitespace-nowrap text-ink-soft">{t.date}</td>
                    <td className="py-2 px-3 font-sans text-ink">
                      <div className="font-mono text-[11px]">{t.narration}</div>
                      {t.isLoanApp && (
                        <span className="text-[10px] text-red-700 font-mono">
                          [External Loan Excluded]
                        </span>
                      )}
                      {t.isRoundTrip && (
                        <span className="text-[10px] text-marigold font-mono">
                          [Round-Trip Excluded]
                        </span>
                      )}
                    </td>
                    <td className="py-2 px-3 whitespace-nowrap">
                      <span className="px-1.5 py-0.5 rounded border border-rule text-[10px] bg-paper-2">
                        {categoryLabels[t.category] || t.category}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-right font-bold text-red-700 whitespace-nowrap">
                      {t.type === "DR" ? formatPaise(t.amount_paise) : ""}
                    </td>
                    <td className="py-2 px-3 text-right font-bold text-ledger-green whitespace-nowrap">
                      {t.type === "CR" ? formatPaise(t.amount_paise) : ""}
                    </td>
                    <td className="py-2 px-3 text-right font-medium text-ink whitespace-nowrap">
                      {formatPaise(t.balance_paise)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Double-Rule Table Footer Total */}
          <div className="p-3 bg-paper-2 border-t double-rule-total flex items-center justify-between text-xs font-mono">
            <span className="font-bold text-ink">Closing Statement Balance:</span>
            <span className="font-bold text-base text-ink">
              {transactions.length > 0 ? formatPaise(transactions[transactions.length - 1].balance_paise) : "₹0"}
            </span>
          </div>
        </div>
      </section>

      {/* Bottom Step-through Banner */}
      <div className="flex items-center justify-between pt-4">
        <NextLink
          href="/link"
          className="text-xs text-ink-soft underline font-mono"
        >
          Link another statement
        </NextLink>

        <NextLink
          href="/assess"
          className="px-6 py-3 rounded-lg bg-ledger-green text-paper font-mono font-bold text-xs shadow hover:bg-[#23472c] transition-colors flex items-center gap-2"
        >
          <span>Next: Day-1 Backtest and Three Caps</span>
          <ArrowRight className="w-4 h-4" />
        </NextLink>
      </div>
    </div>
  );
}
