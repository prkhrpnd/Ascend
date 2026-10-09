"use client";

import React, { useState, useMemo } from "react";
import { FLASHCARDS, LEARN_CATEGORIES, LearnCategory } from "@/data/learn/flashcards";
import { Flashcard } from "@/components/learn/Flashcard";
import {
  BookOpen,
  Search,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  GraduationCap,
} from "lucide-react";

export default function LearnPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  // Stored strictly in React state only: no localStorage, cookies, or backend
  const [learnedCardIds, setLearnedCardIds] = useState<Set<string>>(new Set());

  const handleToggleLearned = (id: string) => {
    setLearnedCardIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleResetLearned = () => {
    setLearnedCardIds(new Set());
  };

  // Filter cards by category and search keyword
  const filteredCards = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return FLASHCARDS.filter((card) => {
      const matchesCategory =
        selectedCategory === "All" || card.category === selectedCategory;
      if (!matchesCategory) return false;

      if (!q) return true;
      return (
        card.question.toLowerCase().includes(q) ||
        card.explanation.toLowerCase().includes(q) ||
        card.whyItMatters.toLowerCase().includes(q) ||
        card.category.toLowerCase().includes(q) ||
        card.sourceName.toLowerCase().includes(q)
      );
    });
  }, [selectedCategory, searchQuery]);

  const totalCards = FLASHCARDS.length;
  const learnedCount = learnedCardIds.size;
  const learnedPercent = Math.round((learnedCount / totalCards) * 100);

  return (
    <div className="max-w-7xl mx-auto py-4 sm:py-6 space-y-8">
      {/* Top Disclaimer Banner */}
      <div className="p-3 sm:p-4 rounded-2xl bg-amber-50/80 border border-amber-200/80 flex items-start sm:items-center gap-3 text-amber-900 text-xs font-mono">
        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5 sm:mt-0" />
        <p className="leading-relaxed">
          <strong>Official Disclaimer:</strong> Educational content only. Not financial advice. Always verify on official regulator websites.
        </p>
      </div>

      {/* Page Header */}
      <div className="bg-white rounded-2xl border border-rule p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-300 text-ink text-xs font-mono">
            <GraduationCap className="w-3.5 h-3.5 text-ink" />
            <span>Regulator-Backed Financial Literacy</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-black text-ink tracking-tight">
            Financial Knowledge Flashcards
          </h1>
          <p className="text-xs sm:text-sm text-ink-soft leading-relaxed font-sans">
            Flip-style knowledge cards curated strictly from public educational material by the Reserve Bank of India (RBI), Securities and Exchange Board of India (SEBI), and National Payments Corporation of India (NPCI).
          </p>
        </div>

        {/* Progress Tracker Card */}
        <div className="bg-slate-100 border border-rule rounded-2xl p-4 sm:p-5 min-w-[260px] space-y-3">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="font-semibold text-ink flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Learning Progress</span>
            </span>
            <span className="font-bold text-ink">
              {learnedCount} / {totalCards} learned
            </span>
          </div>

          {/* Progress Bar Track */}
          <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-600 rounded-full transition-all duration-300"
              style={{ width: `${learnedPercent}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] font-mono text-ink-soft">
            <span>{learnedPercent}% completed</span>
            {learnedCount > 0 && (
              <button
                type="button"
                onClick={handleResetLearned}
                className="hover:text-vermilion flex items-center gap-1 cursor-pointer transition-colors"
                title="Reset local learned progress"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Controls: Search and Category Filter Chips */}
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-ink-soft absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search concepts (e.g. UPI, SIP, KYC, Ombudsman, score)..."
            className="w-full pl-10 pr-4 py-2.5 rounded-full bg-white border border-rule text-xs sm:text-sm text-ink placeholder:text-ink-soft/70 focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono text-ink-soft hover:text-ink"
            >
              Clear
            </button>
          )}
        </div>

        {/* Category Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-mono no-scrollbar">
          <button
            type="button"
            onClick={() => setSelectedCategory("All")}
            className={`px-3.5 py-1.5 rounded-full border transition-all whitespace-nowrap cursor-pointer ${
              selectedCategory === "All"
                ? "bg-ink text-white border-ink font-bold"
                : "bg-white text-ink-soft border-rule hover:border-slate-300 hover:text-ink"
            }`}
          >
            All Categories ({FLASHCARDS.length})
          </button>

          {LEARN_CATEGORIES.map((cat) => {
            const count = FLASHCARDS.filter((c) => c.category === cat).length;
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full border transition-all whitespace-nowrap cursor-pointer ${
                  isSelected
                    ? "bg-ink text-white border-ink font-bold"
                    : "bg-white text-ink-soft border-rule hover:border-slate-300 hover:text-ink"
                }`}
              >
                {cat} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Cards Grid */}
      {filteredCards.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCards.map((card) => (
            <Flashcard
              key={card.id}
              card={card}
              isLearned={learnedCardIds.has(card.id)}
              onToggleLearned={handleToggleLearned}
            />
          ))}
        </div>
      ) : (
        <div className="p-12 text-center bg-white rounded-2xl border border-rule space-y-3">
          <BookOpen className="w-8 h-8 text-ink-soft mx-auto" />
          <h3 className="font-serif font-bold text-lg text-ink">No flashcards matched your filter</h3>
          <p className="text-xs text-ink-soft max-w-sm mx-auto">
            Try adjusting your search query or selecting another category to view cards.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery("");
              setSelectedCategory("All");
            }}
            className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-mono font-semibold text-ink transition-colors"
          >
            Reset All Filters
          </button>
        </div>
      )}
    </div>
  );
}
