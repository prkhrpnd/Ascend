"use client";

import React, { useState } from "react";
import NextLink from "next/link";
import { useApp } from "@/lib/context/AppContext";
import {
  CATEGORIES,
  CanonicalCategoryId,
  TRANSPARENT_RULES,
  CategoryGroup,
} from "@/lib/engine/categories";
import { formatPaise } from "@/lib/utils";
import {
  Layers,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Filter,
  Info,
  Edit3,
  HelpCircle,
} from "lucide-react";

export default function ExpenseCategoriesPage() {
  const {
    analytics,
    transactions,
    activeCategoryFilter,
    setActiveCategoryFilter,
  } = useApp();

  const [selectedGroup, setSelectedGroup] = useState<CategoryGroup | "ALL">("ALL");

  const groups: Array<{ id: CategoryGroup | "ALL"; label: string }> = [
    { id: "ALL", label: "All Categories (18)" },
    { id: "essential_expenses", label: "Essential Living" },
    { id: "lifestyle_discretionary", label: "Lifestyle & Discretionary" },
    { id: "debt_obligations", label: "Debt & Repayments" },
    { id: "transfers_investments", label: "Investments & Transfers" },
    { id: "income_credits", label: "Income & Credits" },
    { id: "uncategorized", label: "Needs Review" },
  ];

  const categoryKeys = Object.keys(CATEGORIES) as CanonicalCategoryId[];

  const filteredCategories = categoryKeys.filter((key) => {
    if (selectedGroup === "ALL") return true;
    return CATEGORIES[key].group === selectedGroup;
  });

  // User-modified transactions
  const userOverriddenTransactions = transactions.filter((t) => t.isUserOverride);

  return (
    <div className="space-y-8 max-w-7xl mx-auto py-2">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-rule shadow-sm p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-300 text-ink text-xs font-mono">
            <Layers className="w-3.5 h-3.5 text-ink" />
            <span>18 Personal Finance Categories</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-black text-ink tracking-tight">
            Expense Categories and Transparent Rules
          </h1>
          <p className="text-xs sm:text-sm text-ink-soft max-w-3xl leading-relaxed">
            Ascend uses transparent keyword patterns and directional logic to classify every transaction.
            Credits are never classified as expenses, and investments/transfers are segregated from consumer spend.
          </p>
        </div>

        <NextLink
          href="/spending"
          className="px-5 py-2.5 rounded-full bg-pin-red hover:bg-pin-pressed text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer shrink-0"
        >
          <span>View Spending Analysis</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </NextLink>
      </div>

      {/* Explanatory Policy Card: Consumer Spending vs Transfers */}
      <div className="bg-slate-100 rounded-2xl border border-rule p-5 space-y-2 text-xs">
        <div className="flex items-center gap-2 text-ink font-bold">
          <Info className="w-4 h-4 text-ink" />
          <span>Why Investments and Self Transfers Are Excluded from Consumer Spending</span>
        </div>
        <p className="text-ink-soft leading-relaxed text-[11px]">
          Transfers between own accounts (e.g. sweep-in/out or moving cash to another savings account) and investments
          (e.g. Zerodha, Groww SIPs, or PPF deposits) represent asset allocation rather than true consumption. Ascend
          tracks them in your balance sheet but excludes them from your cost of living calculation to prevent false
          risk flags.
        </p>
      </div>

      {/* Category Group Filter Buttons */}
      <div className="flex flex-wrap items-center gap-2">
        {groups.map((g) => (
          <button
            key={g.id}
            onClick={() => setSelectedGroup(g.id)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer ${
              selectedGroup === g.id
                ? "bg-ink text-white font-bold"
                : "bg-white border border-rule text-ink-soft hover:text-ink hover:bg-slate-100"
            }`}
          >
            {g.label}
          </button>
        ))}
      </div>

      {/* 18 Categories Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCategories.map((catKey) => {
          const meta = CATEGORIES[catKey];
          const totalData = analytics?.categoryTotals[catKey];
          const amount = totalData?.amountPaise || 0;
          const count = totalData?.transactionCount || 0;
          const percent = totalData?.percentOfOutflows || 0;

          // Find rules that map to this category
          const matchingRules = TRANSPARENT_RULES.filter((r) => r.category === catKey);

          return (
            <div
              key={catKey}
              className="bg-white rounded-xl border border-rule shadow-sm p-5 space-y-4 hover:border-slate-300 transition-all flex flex-col justify-between"
            >
              <div className="space-y-2.5">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3.5 h-3.5 rounded-full shrink-0"
                      style={{ backgroundColor: meta.color }}
                    />
                    <h3 className="font-serif font-bold text-sm text-ink">{meta.label}</h3>
                  </div>

                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded uppercase font-semibold ${
                      meta.isCredit
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : meta.isConsumerSpend
                        ? "bg-blue-50 text-blue-700 border border-blue-200"
                        : "bg-slate-100 text-slate-700 border border-slate-200"
                    }`}
                  >
                    {meta.isCredit ? "Credit Inflow" : meta.isConsumerSpend ? "Expense" : "Transfer"}
                  </span>
                </div>

                <p className="text-xs text-ink-soft leading-normal">{meta.description}</p>

                {/* Amount and percentage in active statement */}
                <div className="p-2.5 rounded-lg bg-slate-50 border border-rule flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] text-ink-soft block">Current Statement Total</span>
                    <span className="font-mono font-bold text-ink">{formatPaise(amount)}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-ink-soft block">Occurrences</span>
                    <span className="font-mono text-ink">
                      {count} {count === 1 ? "txn" : "txns"}{" "}
                      {meta.isExpense && percent > 0 ? `(${percent}%)` : ""}
                    </span>
                  </div>
                </div>

                {/* Rules / Keywords Sample */}
                <div className="space-y-1 text-[11px]">
                  <span className="text-ink-soft font-semibold block">Transparent Trigger Rules:</span>
                  <div className="flex flex-wrap gap-1">
                    {matchingRules.flatMap((r) => r.keywords).slice(0, 5).map((kw, idx) => (
                      <span
                        key={idx}
                        className="px-1.5 py-0.5 rounded bg-slate-100 text-ink text-[10px] font-mono"
                      >
                        {kw}
                      </span>
                    ))}
                    {matchingRules.flatMap((r) => r.keywords).length > 5 && (
                      <span className="text-[10px] text-ink-soft self-center">
                        +{matchingRules.flatMap((r) => r.keywords).length - 5} more
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* View in table button */}
              <NextLink
                href="/spending"
                onClick={() => setActiveCategoryFilter(catKey)}
                className="pt-2 text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center justify-between border-t border-rule"
              >
                <span>Filter Transactions in Table</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </NextLink>
            </div>
          );
        })}
      </div>

      {/* Manual Override Audit Log Card */}
      {userOverriddenTransactions.length > 0 && (
        <div className="bg-white rounded-2xl border border-rule shadow-sm p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-rule pb-3">
            <Edit3 className="w-4 h-4 text-purple-600" />
            <h2 className="text-base font-serif font-bold text-ink">
              User Category Override Audit Log ({userOverriddenTransactions.length} modified)
            </h2>
          </div>

          <div className="space-y-2">
            {userOverriddenTransactions.map((tx) => (
              <div
                key={tx.id}
                className="p-3 rounded-lg border border-purple-200 bg-purple-50/50 flex items-center justify-between text-xs"
              >
                <div className="space-y-0.5">
                  <span className="font-semibold text-ink">{tx.narration}</span>
                  <div className="text-[11px] text-purple-800">
                    Manually reassigned to:{" "}
                    <strong>{CATEGORIES[tx.category as CanonicalCategoryId]?.label || tx.category}</strong>
                  </div>
                </div>
                <div className="text-right font-mono">
                  <span className="font-bold text-ink">{formatPaise(tx.amount_paise)}</span>
                  <span className="block text-[10px] text-ink-soft">{tx.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
