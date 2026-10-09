"use client";

import React, { useState } from "react";
import NextLink from "next/link";
import learnCards from "@/content/learn.json";
import { SimulationBadge } from "@/components/SimulationBadge";
import { BookOpen, CheckCircle2, HelpCircle, ArrowRight, Sparkles, AlertCircle } from "lucide-react";

export default function LearnHubPage() {
  const [selectedSection, setSelectedSection] = useState<string>("All");
  const [quizScore, setQuizScore] = useState<number | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});

  const sections = [
    "All",
    "Credit basics",
    "Understanding cost",
    "Everyday money",
    "Borrowing safely",
    "Your first job",
    "Investing basics",
    "Myth or Fact",
  ];

  const filteredCards =
    selectedSection === "All"
      ? learnCards
      : learnCards.filter((c) => c.section === selectedSection);

  // 3-Question Knowledge Check
  const quizQuestions = [
    {
      q: "What is the primary role of a licensed credit bureau?",
      options: [
        "To approve and disburse consumer loans",
        "To maintain your repayment history and report it to lenders",
        "To invest your savings in government bonds",
      ],
      correct: 1,
    },
    {
      q: "If an app charges 1.5% interest per 30-day month, what is the yearly equivalent?",
      options: [
        "About 1.5% a year",
        "About 18% a year before compounding",
        "Over 60% with late fees",
      ],
      correct: 1,
    },
    {
      q: "What does RBI Fair Practices Code strictly prohibit during loan recovery?",
      options: [
        "Sending an email receipt",
        "Calling before 8 AM, accessing your phone contacts, or harassing family",
        "Setting up scheduled AutoPay on salary dates",
      ],
      correct: 1,
    },
  ];

  const handleQuizSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let score = 0;
    quizQuestions.forEach((q, idx) => {
      if (quizAnswers[idx] === q.correct) score++;
    });
    setQuizScore(score);
  };

  return (
    <div className="max-w-4xl mx-auto py-4 space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between">
          <h1 className="font-serif font-black text-2xl sm:text-3xl text-ink">
            Financial Learn Hub
          </h1>
          <SimulationBadge label="BITE-SIZED LESSONS" size="sm" />
        </div>
        <p className="text-xs text-ink-soft mt-1">
          Practical credit and cash flow fundamentals designed for final-year college students.
        </p>
      </div>

      {/* Section Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 text-xs font-mono no-scrollbar">
        {sections.map((s) => (
          <button
            key={s}
            onClick={() => setSelectedSection(s)}
            className={`whitespace-nowrap px-3 py-1.5 rounded-full border transition-colors ${
              selectedSection === s
                ? "bg-ink text-paper border-ink font-bold"
                : "bg-paper-2 border-rule text-ink-soft hover:text-ink"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredCards.map((card) => (
          <NextLink
            key={card.id}
            href={`/learn/${card.id}`}
            className="p-5 rounded-xl bg-paper-2 border border-rule hover:border-ink transition-all flex flex-col justify-between space-y-4 group"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[10px] font-mono">
                <span className="px-2 py-0.5 rounded bg-paper border border-rule text-ink font-semibold">
                  {card.section}
                </span>
                <span className="text-ink-soft">{card.readSeconds}s read</span>
              </div>

              <h2 className="font-serif font-bold text-base text-ink group-hover:text-vermilion transition-colors">
                {card.title}
              </h2>

              <p className="text-xs text-ink-soft font-sans line-clamp-2 leading-relaxed">
                {card.takeaway}
              </p>
            </div>

            <div className="pt-2 border-t border-rule/50 flex items-center justify-between text-xs font-mono text-ink-soft">
              <span className="text-[10px] italic">{card.sourceNote}</span>
              <span className="flex items-center gap-1 text-ink font-bold text-[11px] group-hover:translate-x-1 transition-transform">
                Read card <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </NextLink>
        ))}
      </div>

      {/* 3-Question Knowledge Check */}
      <section className="p-6 rounded-xl bg-paper border-2 border-rule space-y-6">
        <div>
          <span className="font-mono text-xs font-bold text-vermilion uppercase tracking-wider block">
            Knowledge Check
          </span>
          <h2 className="font-serif font-black text-xl text-ink">
            Test Your Financial Credit Literacy
          </h2>
          <p className="text-xs text-ink-soft mt-0.5">
            3 foundational questions to measure credit literacy growth.
          </p>
        </div>

        <form onSubmit={handleQuizSubmit} className="space-y-5 text-xs font-mono">
          {quizQuestions.map((q, qIdx) => (
            <div key={qIdx} className="p-4 rounded-lg bg-paper-2 border border-rule space-y-2.5">
              <span className="font-bold text-ink block font-serif text-sm">
                {qIdx + 1}. {q.q}
              </span>
              <div className="space-y-1.5 font-sans">
                {q.options.map((opt, oIdx) => (
                  <label
                    key={oIdx}
                    className="flex items-start gap-2 cursor-pointer p-2 rounded hover:bg-paper select-none"
                  >
                    <input
                      type="radio"
                      name={`question_${qIdx}`}
                      required
                      checked={quizAnswers[qIdx] === oIdx}
                      onChange={() => setQuizAnswers({ ...quizAnswers, [qIdx]: oIdx })}
                      className="w-4 h-4 accent-vermilion mt-0.5"
                    />
                    <span className="text-xs text-ink">{opt}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}

          <div className="flex items-center justify-between pt-2">
            <button
              type="submit"
              className="px-6 py-2.5 rounded bg-ink text-paper font-mono font-bold text-xs hover:bg-ink-soft transition-colors"
            >
              Submit Knowledge Check
            </button>

            {quizScore !== null && (
              <div className="flex items-center gap-2 font-mono text-xs">
                <span className="text-ink-soft">Your Score:</span>
                <span className="font-bold text-base text-ledger-green">
                  {quizScore} of {quizQuestions.length} Correct
                </span>
                <span className="text-[10px] text-ink-soft">(Illustrative)</span>
              </div>
            )}
          </div>
        </form>
      </section>
    </div>
  );
}
