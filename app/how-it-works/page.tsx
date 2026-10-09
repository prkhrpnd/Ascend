"use client";

import React from "react";
import NextLink from "next/link";
import { ArrowRight, ShieldCheck, HeartHandshake, AlertOctagon, CheckCircle2, XCircle } from "lucide-react";
import { SimulationBadge } from "@/components/SimulationBadge";

export default function HowItWorksPage() {
  const forces = [
    {
      force: "Cold Start",
      meaning: "No history, no credit, no way to build a file",
      solution: "Starter ₹500 line plus verified bureau reporting and Day-1 historical backtest",
    },
    {
      force: "Buy Now, Regret Later",
      meaning: "Cheap, high-limit debt turns into a compounding spiral",
      solution: "Strict ₹500 starter ceiling, capacity and stress caps, receipt Cost Card, cooling-off pause, slip ladder",
    },
    {
      force: "Boredom Barrier",
      meaning: "Nobody reads 40-page financial disclaimers",
      solution: "30-second Moment Cards inside her actual transactions, short bite-sized Learn Hub, Ask About My Money",
    },
    {
      force: "Trust Collapse",
      meaning: "Harassment from loan apps, hidden fees, contact scraping",
      solution: "Per-purpose consent cards, zero contact or photo access, zero late-fee revenue, student-controlled Parent Report Card",
    },
  ];

  const ladderSteps = [
    {
      step: "3 Days Before Due Date",
      title: "Gentle Early Warning",
      desc: "Forecasts your balance against upcoming AutoPay. Alerts only if buffer is breached.",
    },
    {
      step: "On Due Date",
      title: "Friendly Due Reminder",
      desc: "AutoPay prepares to clear. If allowance was delayed, you get immediate assistance options.",
    },
    {
      step: "Cash Squeeze Choice",
      title: "Shift Date or Split",
      desc: "One-time option to shift due date by 7 days or split repayment into two smaller halves.",
    },
    {
      step: "Worst Case Miss",
      title: "Responsible Freeze (Zero Harassment)",
      desc: "Flat ₹50 late fee from partner. Draws paused. Ascend earns ₹0. Never call parents, friends, or contacts.",
    },
  ];

  return (
    <div className="space-y-12 max-w-4xl mx-auto py-4">
      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-bold text-vermilion uppercase tracking-wider">
            Architecture and Philosophy
          </span>
          <SimulationBadge label="MODEL SPEC" size="sm" />
        </div>
        <h1 className="font-serif font-black text-3xl sm:text-4xl text-ink">
          How Ascend Answers the Four Forces
        </h1>
        <p className="text-sm sm:text-base text-ink-soft leading-relaxed">
          Traditional credit products push quick limits to capture late fees. Ascend uses deterministic
          cash flow math to build clean repayment records.
        </p>
      </div>

      {/* Core Tension Card */}
      <div className="p-6 rounded-xl bg-paper-2 border-2 border-rule space-y-2">
        <span className="font-mono text-xs font-bold text-vermilion uppercase tracking-wider">Core Tension</span>
        <h2 className="font-serif font-bold text-xl text-ink">
          Safety and trust cost speed and growth, and we accept that on purpose.
        </h2>
        <p className="text-xs text-ink-soft leading-relaxed">
          We reject instant 5-minute ₹50,000 limits, phone permissions, and predatory fees.
          Every rupee extended is backed by a 6-month historical stress backtest.
        </p>
      </div>

      {/* The Four Forces Table */}
      <section className="space-y-4">
        <h3 className="font-serif font-bold text-xl text-ink">The Four Forces of Young Credit</h3>
        <div className="border border-rule rounded-lg overflow-hidden bg-paper shadow-sm">
          <div className="divide-y divide-rule">
            {forces.map((f, i) => (
              <div key={i} className="p-4 sm:p-5 grid grid-cols-1 md:grid-cols-3 gap-2 sm:gap-4 text-xs">
                <div>
                  <span className="font-serif font-bold text-sm text-ink block">{f.force}</span>
                  <span className="text-[11px] text-ink-soft mt-0.5 block">{f.meaning}</span>
                </div>
                <div className="md:col-span-2 p-3 rounded bg-paper-2 border border-rule/60 text-ink">
                  <span className="font-mono font-semibold text-vermilion text-[10px] block mb-0.5 uppercase">
                    Where Ascend Answers It
                  </span>
                  <span>{f.solution}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* The Slip Ladder Comparison */}
      <section className="space-y-4">
        <div>
          <h3 className="font-serif font-bold text-xl text-ink">The Ascend Slip Ladder</h3>
          <p className="text-xs text-ink-soft mt-1">
            How Ascend handles repayment stress compared to informal and predatory loan apps.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* Predatory Apps */}
          <div className="p-4 rounded-lg bg-vermilion/5 border border-vermilion/30 space-y-3">
            <div className="flex items-center gap-1.5 text-vermilion font-bold font-mono">
              <XCircle className="w-4 h-4" />
              <span>Predatory Loan Apps</span>
            </div>
            <ul className="space-y-2 text-ink-soft">
              <li className="flex items-start gap-1.5">
                <span className="text-vermilion font-bold">•</span>
                <span>Scrapes full contact book and photo gallery on installation.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-vermilion font-bold">•</span>
                <span>Charges 30% to 60%+ annual interest hidden in processing fees.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-vermilion font-bold">•</span>
                <span>Calls parents, college mates, and contacts to harass on missed dates.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-vermilion font-bold">•</span>
                <span>Compounds daily penalty interest to trigger debt cycles.</span>
              </li>
            </ul>
          </div>

          {/* Ascend Ladder */}
          <div className="p-4 rounded-lg bg-ledger-green/5 border border-ledger-green/30 space-y-3">
            <div className="flex items-center gap-1.5 text-ledger-green font-bold font-mono">
              <CheckCircle2 className="w-4 h-4" />
              <span>The Ascend Responsible Ladder</span>
            </div>
            <ul className="space-y-2 text-ink">
              <li className="flex items-start gap-1.5">
                <span className="text-ledger-green font-bold">•</span>
                <span>Never accesses contacts, photos, or SMS. Per-purpose consent only.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-ledger-green font-bold">•</span>
                <span>Transparent 1.5% monthly cost with tear-off receipt before borrowing.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-ledger-green font-bold">•</span>
                <span>Offers one-time due date shift or two-instalment split on cash squeeze.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-ledger-green font-bold">•</span>
                <span>Ascend earns exactly ₹0 from late fees. Never compounding penalties.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Step-by-step Ladder */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2">
          {ladderSteps.map((ls, idx) => (
            <div key={idx} className="p-3 rounded bg-paper-2 border border-rule text-xs space-y-1">
              <span className="font-mono text-[10px] text-vermilion font-bold block">{ls.step}</span>
              <span className="font-serif font-bold text-ink block">{ls.title}</span>
              <p className="text-[11px] text-ink-soft leading-tight">{ls.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA to start journey */}
      <div className="pt-4 flex justify-end">
        <NextLink
          href="/start"
          className="px-6 py-3 rounded bg-vermilion text-paper font-mono font-bold text-sm shadow hover:bg-vermilion/90 transition-colors flex items-center gap-2"
        >
          <span>Begin Step 1: Eligibility</span>
          <ArrowRight className="w-4 h-4" />
        </NextLink>
      </div>
    </div>
  );
}
