"use client";

import React from "react";
import NextLink from "next/link";
import { useParams, useRouter } from "next/navigation";
import learnCards from "@/content/learn.json";
import { ArrowLeft, BookOpen, Clock, ShieldCheck } from "lucide-react";
import { SimulationBadge } from "@/components/SimulationBadge";

export default function LearnCardDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const card = learnCards.find((c) => c.id === id);

  if (!card) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4">
        <h1 className="font-serif font-bold text-2xl text-ink">Lesson Not Found</h1>
        <NextLink href="/learn" className="text-xs text-ink underline font-mono">
          Return to Learn Hub
        </NextLink>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-4 space-y-6">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1.5 text-xs text-ink-soft hover:text-ink font-mono transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Learn Hub</span>
      </button>

      {/* Card Container */}
      <article className="p-6 sm:p-8 rounded-xl bg-paper-2 border-2 border-rule space-y-6">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="px-2.5 py-0.5 rounded bg-paper border border-rule font-bold text-ink">
            {card.section}
          </span>
          <div className="flex items-center gap-1 text-ink-soft">
            <Clock className="w-3.5 h-3.5" />
            <span>{card.readSeconds} seconds read</span>
          </div>
        </div>

        <h1 className="font-serif font-black text-2xl sm:text-3xl text-ink leading-tight">
          {card.title}
        </h1>

        {/* Core Takeaway */}
        <div className="p-4 rounded-lg bg-paper border border-rule font-mono text-xs">
          <span className="text-[10px] text-vermilion font-bold uppercase tracking-wider block mb-1">
            Core Takeaway
          </span>
          <p className="font-serif font-bold text-base text-ink leading-snug">{card.takeaway}</p>
        </div>

        {/* Body Text */}
        <div className="text-sm text-ink leading-relaxed font-sans space-y-3">
          <p>{card.body}</p>
        </div>

        {/* Real-world Rupee Example */}
        <div className="p-4 rounded-lg bg-marigold/10 border border-marigold/40 font-mono text-xs space-y-1">
          <span className="text-[10px] text-ink font-bold uppercase tracking-wider block">
            Real Example
          </span>
          <p className="text-ink font-sans text-xs">{card.example}</p>
        </div>

        {/* Source and Verification Footnote */}
        <div className="pt-4 border-t border-rule text-[11px] font-mono text-ink-soft">
          Note: {card.sourceNote}
        </div>
      </article>
    </div>
  );
}
