"use client";

import React, { useState, useMemo } from "react";
import { ParsedTransaction } from "@/lib/engine/types";
import { CanonicalCategoryId, CATEGORIES } from "@/lib/engine/categories";
import { formatPaise, formatDate } from "@/lib/utils";
import {
  Search,
  Filter,
  ArrowUpDown,
  CheckCircle2,
  AlertCircle,
  Edit3,
  ChevronLeft,
  ChevronRight,
  TrendingDown,
  TrendingUp,
  Sparkles,
} from "lucide-react";

interface TransactionExplorerProps {
  transactions: ParsedTransaction[];
  activeCategoryFilter?: CanonicalCategoryId | null;
  onSelectCategoryFilter?: (cat: CanonicalCategoryId | null) => void;
  onUpdateCategory: (id: string, newCategory: CanonicalCategoryId) => void;
}

export function TransactionExplorer({
  transactions,
  activeCategoryFilter,
  onSelectCategoryFilter,
  onUpdateCategory,
}: TransactionExplorerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<"ALL" | "DR" | "CR">("ALL");
  const [sortBy, setSortBy] = useState<"date_desc" | "date_asc" | "amount_desc" | "amount_asc">("date_desc");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;

  // Filter & Search logic
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      // Narration search
      if (searchQuery.trim().length > 0) {
        const q = searchQuery.toLowerCase();
        const matchesNarration = tx.narration.toLowerCase().includes(q);
        const matchesCategory = (CATEGORIES[tx.category as CanonicalCategoryId]?.label || "").toLowerCase().includes(q);
        if (!matchesNarration && !matchesCategory) return false;
      }

      // Type filter
      if (typeFilter !== "ALL" && tx.type !== typeFilter) {
        return false;
      }

      // Category filter (e.g. from chart click)
      if (activeCategoryFilter && tx.category !== activeCategoryFilter) {
        return false;
      }

      return true;
    });
  }, [transactions, searchQuery, typeFilter, activeCategoryFilter]);

  // Sorting logic
  const sortedTransactions = useMemo(() => {
    const list = [...filteredTransactions];
    list.sort((a, b) => {
      if (sortBy === "date_desc") return b.date.localeCompare(a.date);
      if (sortBy === "date_asc") return a.date.localeCompare(b.date);
      if (sortBy === "amount_desc") return b.amount_paise - a.amount_paise;
      if (sortBy === "amount_asc") return a.amount_paise - b.amount_paise;
      return 0;
    });
    return list;
  }, [filteredTransactions, sortBy]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(sortedTransactions.length / pageSize));
  const pageTransactions = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedTransactions.slice(start, start + pageSize);
  }, [sortedTransactions, currentPage, pageSize]);

  // Reset to page 1 on search or filter change
  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setCurrentPage(1);
  };

  const handleTypeChange = (type: "ALL" | "DR" | "CR") => {
    setTypeFilter(type);
    setCurrentPage(1);
  };

  const allCategoryKeys = Object.keys(CATEGORIES) as CanonicalCategoryId[];

  return (
    <div className="bg-white rounded-xl border border-rule shadow-sm space-y-4 p-4 sm:p-5">
      {/* Controls Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-ink-soft absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search by narration, payee, or merchant..."
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-rule text-xs text-ink placeholder:text-ink-soft focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-slate-50/50"
          />
          {searchQuery && (
            <button
              onClick={() => handleSearchChange("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-ink-soft hover:text-ink"
            >
              Clear
            </button>
          )}
        </div>

        {/* Filters and Sorting */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Direction Filter */}
          <div className="flex rounded-lg border border-rule bg-slate-50 p-0.5">
            <button
              onClick={() => handleTypeChange("ALL")}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                typeFilter === "ALL" ? "bg-white font-bold text-ink shadow-sm" : "text-ink-soft hover:text-ink"
              }`}
            >
              All
            </button>
            <button
              onClick={() => handleTypeChange("DR")}
              className={`px-2.5 py-1 rounded-md transition-colors flex items-center gap-1 ${
                typeFilter === "DR" ? "bg-white font-bold text-rose-600 shadow-sm" : "text-ink-soft hover:text-ink"
              }`}
            >
              <TrendingDown className="w-3 h-3 text-rose-500" />
              Debits
            </button>
            <button
              onClick={() => handleTypeChange("CR")}
              className={`px-2.5 py-1 rounded-md transition-colors flex items-center gap-1 ${
                typeFilter === "CR" ? "bg-white font-bold text-emerald-600 shadow-sm" : "text-ink-soft hover:text-ink"
              }`}
            >
              <TrendingUp className="w-3 h-3 text-emerald-500" />
              Credits
            </button>
          </div>

          {/* Category Dropdown Filter */}
          <div className="flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-ink-soft" />
            <select
              value={activeCategoryFilter || ""}
              onChange={(e) => {
                const val = e.target.value as CanonicalCategoryId;
                if (onSelectCategoryFilter) {
                  onSelectCategoryFilter(val ? val : null);
                }
                setCurrentPage(1);
              }}
              className="px-2.5 py-1.5 rounded-lg border border-rule text-xs text-ink bg-white focus:outline-none focus:border-blue-500"
            >
              <option value="">All Categories ({transactions.length})</option>
              {allCategoryKeys.map((catKey) => (
                <option key={catKey} value={catKey}>
                  {CATEGORIES[catKey].label}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-1">
            <ArrowUpDown className="w-3.5 h-3.5 text-ink-soft" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-2.5 py-1.5 rounded-lg border border-rule text-xs text-ink bg-white focus:outline-none focus:border-blue-500"
            >
              <option value="date_desc">Newest First</option>
              <option value="date_asc">Oldest First</option>
              <option value="amount_desc">Highest Amount</option>
              <option value="amount_asc">Lowest Amount</option>
            </select>
          </div>
        </div>
      </div>

      {/* Active Filter Notice */}
      {activeCategoryFilter && (
        <div className="flex items-center justify-between p-2 rounded-lg bg-blue-50 border border-blue-200 text-xs">
          <span className="text-blue-900 font-medium">
            Filtering by category:{" "}
            <strong>{CATEGORIES[activeCategoryFilter]?.label || activeCategoryFilter}</strong> (
            {filteredTransactions.length} records)
          </span>
          <button
            onClick={() => onSelectCategoryFilter && onSelectCategoryFilter(null)}
            className="text-blue-700 font-semibold hover:underline"
          >
            Clear Category Filter
          </button>
        </div>
      )}

      {/* Transactions Table */}
      <div className="overflow-x-auto rounded-lg border border-rule">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-rule font-mono text-[11px] text-ink-soft">
              <th className="py-2.5 px-3">Date</th>
              <th className="py-2.5 px-3">Description / Narration</th>
              <th className="py-2.5 px-3">Category</th>
              <th className="py-2.5 px-3">Rule Confidence</th>
              <th className="py-2.5 px-3 text-right">Debit (DR)</th>
              <th className="py-2.5 px-3 text-right">Credit (CR)</th>
              <th className="py-2.5 px-3 text-right">Balance</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-rule">
            {pageTransactions.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-ink-soft">
                  No transactions match the selected filters or search keywords.
                </td>
              </tr>
            ) : (
              pageTransactions.map((tx) => {
                const isDebit = tx.type === "DR";
                const catMeta = CATEGORIES[tx.category as CanonicalCategoryId] || CATEGORIES.uncategorized;
                const isHighValue = tx.amount_paise >= 200000; // >= Rs 2,000

                return (
                  <tr key={tx.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Date */}
                    <td className="py-2.5 px-3 font-mono text-ink-soft whitespace-nowrap">
                      {formatDate(tx.date)}
                    </td>

                    {/* Narration */}
                    <td className="py-2.5 px-3">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-ink break-words max-w-xs sm:max-w-md">
                            {tx.narration}
                          </span>
                          {isHighValue && (
                            <span className="px-1.5 py-0.2 rounded bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-mono shrink-0">
                              High Value
                            </span>
                          )}
                          {tx.isUserOverride && (
                            <span className="px-1.5 py-0.2 rounded bg-purple-50 text-purple-700 border border-purple-200 text-[10px] font-mono flex items-center gap-0.5 shrink-0">
                              <Edit3 className="w-2.5 h-2.5" />
                              User Edited
                            </span>
                          )}
                        </div>

                        {/* Auxiliary Metadata: Ref ID, Payment Method, Source Category */}
                        {(tx.referenceId || tx.paymentMethod || tx.sourceCategory) && (
                          <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-ink-soft font-mono pt-0.5">
                            {tx.referenceId && (
                              <span className="bg-slate-100 px-1 py-0.5 rounded text-slate-700">
                                Ref: {tx.referenceId}
                              </span>
                            )}
                            {tx.paymentMethod && (
                              <span className="bg-blue-50 text-blue-700 px-1 py-0.5 rounded">
                                {tx.paymentMethod}
                              </span>
                            )}
                            {tx.sourceCategory && (
                              <span className="text-slate-400">
                                (Src: {tx.sourceCategory})
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Category Dropdown (Inline Manual Override) */}
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <select
                        value={tx.category}
                        onChange={(e) => onUpdateCategory(tx.id, e.target.value as CanonicalCategoryId)}
                        className="py-1 px-2 rounded-md border border-rule text-xs bg-white text-ink font-medium focus:ring-1 focus:ring-blue-500 cursor-pointer max-w-[170px]"
                        title="Click to change or override category"
                      >
                        {allCategoryKeys.map((k) => (
                          <option key={k} value={k}>
                            {CATEGORIES[k].label}
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* Rule Confidence */}
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      {tx.isUserOverride ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-mono text-purple-700">
                          <CheckCircle2 className="w-3 h-3 text-purple-600" />
                          Manual override
                        </span>
                      ) : tx.confidenceLevel === "high" ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-700">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          High ({Math.round((tx.confidence || 0.9) * 100)}%)
                        </span>
                      ) : tx.confidenceLevel === "needs_review" ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-mono text-amber-700">
                          <AlertCircle className="w-3 h-3 text-amber-600" />
                          Needs Review
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-mono text-slate-500">
                          <AlertCircle className="w-3 h-3 text-slate-400" />
                          Unmatched
                        </span>
                      )}
                      {tx.ruleUsed && (
                        <div className="text-[10px] text-ink-soft truncate max-w-[140px]" title={tx.ruleUsed}>
                          {tx.ruleUsed}
                        </div>
                      )}
                    </td>

                    {/* Debit Amount */}
                    <td className="py-2.5 px-3 text-right font-mono font-bold whitespace-nowrap">
                      {isDebit ? (
                        <span className="text-rose-600">
                          {formatPaise(tx.amount_paise)}
                        </span>
                      ) : (
                        <span className="text-slate-300">-</span>
                      )}
                    </td>

                    {/* Credit Amount */}
                    <td className="py-2.5 px-3 text-right font-mono font-bold whitespace-nowrap">
                      {!isDebit ? (
                        <span className="text-emerald-600">
                          {formatPaise(tx.amount_paise)}
                        </span>
                      ) : (
                        <span className="text-slate-300">-</span>
                      )}
                    </td>

                    {/* Balance */}
                    <td className="py-2.5 px-3 text-right font-mono text-ink-soft whitespace-nowrap">
                      {tx.balance_paise > 0 ? formatPaise(tx.balance_paise) : "N/A"}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-ink-soft pt-1">
        <div>
          Showing {pageTransactions.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} to{" "}
          {Math.min(currentPage * pageSize, sortedTransactions.length)} of {sortedTransactions.length} transactions
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-1.5 rounded border border-rule disabled:opacity-40 hover:bg-slate-50 cursor-pointer disabled:cursor-not-allowed"
            aria-label="Previous Page"
          >
            <ChevronLeft className="w-4 h-4 text-ink" />
          </button>
          <span className="px-2 font-mono text-ink">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-1.5 rounded border border-rule disabled:opacity-40 hover:bg-slate-50 cursor-pointer disabled:cursor-not-allowed"
            aria-label="Next Page"
          >
            <ChevronRight className="w-4 h-4 text-ink" />
          </button>
        </div>
      </div>
    </div>
  );
}
