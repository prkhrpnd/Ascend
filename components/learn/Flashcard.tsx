"use client";

import React, { useState } from "react";
import { Flashcard as FlashcardType } from "@/data/learn/flashcards";
import { Check, RotateCw, ExternalLink, Sparkles, BookOpen } from "lucide-react";

interface FlashcardProps {
  card: FlashcardType;
  isLearned: boolean;
  onToggleLearned: (id: string) => void;
}

export function Flashcard({ card, isLearned, onToggleLearned }: FlashcardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleCardClick = () => {
    setIsFlipped(!isFlipped);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      // Don't trigger if user was pressing space/enter on an inner button or link
      const targetTag = (e.target as HTMLElement).tagName.toLowerCase();
      if (targetTag !== "button" && targetTag !== "a" && targetTag !== "input") {
        e.preventDefault();
        setIsFlipped(!isFlipped);
      }
    }
  };

  const handleLearnedClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleLearned(card.id);
  };

  return (
    <div
      tabIndex={0}
      role="button"
      aria-label={`Flashcard: ${card.question}. ${isFlipped ? "Showing answer." : "Click or press Space to reveal answer."}`}
      aria-expanded={isFlipped}
      onKeyDown={handleKeyDown}
      onClick={handleCardClick}
      className={`group relative h-[360px] w-full rounded-2xl cursor-pointer select-none outline-none focus-visible:ring-2 focus-visible:ring-blue-600 [perspective:1000px] transition-transform duration-200 active:scale-[0.99]`}
    >
      <div
        className={`relative w-full h-full rounded-2xl transition-transform duration-500 [transform-style:preserve-3d] ${
          isFlipped ? "[transform:rotateY(180deg)]" : ""
        }`}
      >
        {/* FRONT OF CARD */}
        <div
          className={`absolute inset-0 w-full h-full p-6 rounded-2xl bg-white border border-rule flex flex-col justify-between [backface-visibility:hidden] overflow-hidden ${
            isLearned ? "border-emerald-300/80 bg-emerald-50/20" : "hover:border-slate-400"
          }`}
        >
          {/* Header Tag & Learned Toggle */}
          <div className="flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono font-medium bg-slate-100 text-ink border border-slate-200">
              <BookOpen className="w-3 h-3 text-ink" />
              <span>{card.category}</span>
            </span>

            <button
              type="button"
              onClick={handleLearnedClick}
              aria-label={isLearned ? "Mark as unlearned" : "Mark as learned"}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-semibold transition-colors cursor-pointer ${
                isLearned
                  ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                  : "bg-slate-100 text-ink-soft hover:bg-slate-200 hover:text-ink border border-transparent"
              }`}
            >
              <Check className={`w-3.5 h-3.5 ${isLearned ? "text-emerald-700 stroke-[3]" : "text-ink-soft"}`} />
              <span className="text-[11px]">{isLearned ? "Learned" : "Mark learned"}</span>
            </button>
          </div>

          {/* Question / Concept Center */}
          <div className="my-auto space-y-3 py-2">
            <span className="text-[10px] font-mono uppercase tracking-widest text-ink-soft font-bold block">
              Question & Concept
            </span>
            <h3 className="font-serif font-black text-lg sm:text-xl text-ink leading-snug">
              {card.question}
            </h3>
          </div>

          {/* Footer Call to Action */}
          <div className="pt-3 border-t border-rule/60 flex items-center justify-between text-xs text-ink-soft">
            <div className="flex items-center gap-1.5 text-[11px] font-mono text-ink group-hover:text-pin-red font-semibold">
              <RotateCw className="w-3.5 h-3.5 group-hover:rotate-45 transition-transform" />
              <span>Click or tap to flip</span>
            </div>
            <span className="text-[10px] font-mono text-ink-soft/80">Press Space/Enter</span>
          </div>
        </div>

        {/* BACK OF CARD */}
        <div
          className={`absolute inset-0 w-full h-full p-6 rounded-2xl bg-white border border-rule flex flex-col justify-between [transform:rotateY(180deg)] [backface-visibility:hidden] overflow-hidden ${
            isLearned ? "border-emerald-300/80 bg-emerald-50/20" : "hover:border-slate-400"
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between gap-2 border-b border-rule/60 pb-2.5">
            <div className="flex items-center gap-1.5 text-[11px] font-mono text-ink-soft">
              <span className="font-semibold text-ink">{card.category}</span>
            </div>

            <button
              type="button"
              onClick={handleLearnedClick}
              aria-label={isLearned ? "Mark as unlearned" : "Mark as learned"}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-semibold transition-colors cursor-pointer ${
                isLearned
                  ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                  : "bg-slate-100 text-ink-soft hover:bg-slate-200 hover:text-ink border border-transparent"
              }`}
            >
              <Check className={`w-3.5 h-3.5 ${isLearned ? "text-emerald-700 stroke-[3]" : "text-ink-soft"}`} />
              <span className="text-[11px]">{isLearned ? "Learned" : "Mark learned"}</span>
            </button>
          </div>

          {/* Scrollable Explanation Area */}
          <div className="my-auto py-2 space-y-3 overflow-y-auto pr-1 text-xs">
            {/* Explanation */}
            <div>
              <span className="text-[10px] font-mono font-bold text-ink-soft uppercase tracking-wider block mb-1">
                The Explanation
              </span>
              <p className="text-ink leading-relaxed font-sans text-xs sm:text-[13px]">
                {card.explanation}
              </p>
            </div>

            {/* Why It Matters */}
            <div className="p-3 rounded-2xl bg-slate-100 border border-slate-200 space-y-1">
              <div className="flex items-center gap-1 text-ink font-mono font-bold text-[10px] uppercase tracking-wider">
                <Sparkles className="w-3 h-3 text-ink" />
                <span>Why it matters for students</span>
              </div>
              <p className="text-ink-body font-sans text-[11px] sm:text-xs leading-relaxed">
                {card.whyItMatters}
              </p>
            </div>
          </div>

          {/* Footer: Official Source Link & Flip Back */}
          <div className="pt-2.5 border-t border-rule/60 flex items-center justify-between text-[11px] font-mono">
            <a
              href={card.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1 text-ink hover:underline font-bold"
              title={`Visit official regulator: ${card.sourceName}`}
            >
              <span>Source: {card.sourceName}</span>
              <ExternalLink className="w-3 h-3 shrink-0" />
            </a>

            <span className="text-ink-soft flex items-center gap-1 hover:text-ink">
              <RotateCw className="w-3 h-3" />
              <span>Flip back</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
