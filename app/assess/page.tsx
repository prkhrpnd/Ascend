"use client";

import React from "react";
import NextLink from "next/link";
import { useAuth } from "@/lib/supabase/auth-context";
import { useApp } from "@/lib/context/AppContext";
import { SimulationBadge } from "@/components/SimulationBadge";
import { formatPaise } from "@/lib/utils";
import { Check, X, ShieldCheck, ArrowRight, AlertCircle, Info, FileText } from "lucide-react";

export default function AssessPage() {
  const { user } = useAuth();
  const { limitAssessment, income, coverage, profile, isSandboxMode, loadSampleProfile } = useApp();

  const studentName = profile.name || user?.email?.split("@")[0] || "Student";

  if (!limitAssessment) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-ledger-green/10 text-ledger-green mx-auto flex items-center justify-center">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h1 className="font-serif font-bold text-2xl sm:text-3xl text-ink">
            No Cash Flow Assessment Yet
          </h1>
          <p className="text-xs text-ink-soft max-w-md mx-auto leading-relaxed">
            Link your bank statement to calculate the Three Caps (Tier Cap, Capacity Cap, and Stress Due-Date Cap) and run the Day-1 Backtest.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2 font-mono text-xs">
          <NextLink
            href="/link"
            className="px-6 py-2.5 rounded-full bg-pin-red text-white font-bold text-xs hover:bg-pin-pressed transition-colors flex items-center gap-2 cursor-pointer"
          >
            <span>Link Bank Account</span>
            <ArrowRight className="w-4 h-4" />
          </NextLink>

          <NextLink
            href="/link"
            className="px-6 py-2.5 rounded-full bg-[#e5e5e0] hover:bg-[#dadad3] text-[#111110] font-medium text-xs transition-colors flex items-center gap-2 cursor-pointer"
          >
            <FileText className="w-4 h-4 text-ink-soft" />
            <span>Upload Statement CSV</span>
          </NextLink>
        </div>

        {/* Developer Sandbox Option */}
        <div className="pt-6 border-t border-rule/60 max-w-sm mx-auto text-xs font-mono text-ink-soft">
          <p className="mb-2 text-[11px] uppercase tracking-wider font-semibold">
            Developer / Evaluator Mode
          </p>
          <button
            type="button"
            onClick={() => loadSampleProfile("priya")}
            className="px-4 py-2 rounded-full bg-slate-100 border border-slate-300 hover:bg-slate-200 text-ink text-[11px] cursor-pointer"
          >
            Load Simulated Benchmark Statement
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-4 space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between">
          <h1 className="font-serif font-bold text-2xl sm:text-3xl text-ink">
            Day-1 Backtest and Three Caps
          </h1>
          <SimulationBadge
            label={isSandboxMode ? "SIMULATED BENCHMARK" : "DETERMINISTIC ENGINE"}
            size="sm"
          />
        </div>
        <p className="text-xs text-ink-soft mt-1">
          Replays verified statement cash flow against candidate starter lines under baseline and stress conditions.
        </p>
      </div>

      {/* Mandatory Disclaimer Callout */}
      <div className="p-4 rounded-2xl bg-white border border-rule text-xs space-y-1">
        <span className="font-mono text-[10px] font-bold text-ledger-green uppercase tracking-wider block">
          Crucial Regulatory Framing
        </span>
        <p className="font-serif font-bold text-sm text-ink">
          "A backtest is an affordability signal, not months of real repayment. Real credit history starts with your first live cycle."
        </p>
        <p className="text-ink-soft text-[11px]">
          We never report backtested months to credit bureaus. Only real future AutoPay cycles build your formal score.
        </p>
      </div>

      {/* The Three Caps Panel */}
      <section className="p-6 rounded-2xl bg-white border border-rule space-y-4">
        <div>
          <span className="font-mono text-[10px] font-bold text-ledger-green uppercase tracking-wider block">
            Conservative Cap Triad
          </span>
          <h2 className="font-serif font-bold text-xl text-ink">
            Limit = min(Tier Cap, Capacity Cap, Stress Due-Date Cap)
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-mono">
          {/* Cap 1: Tier Cap */}
          <div
            className={`p-4 rounded-2xl border space-y-2 ${
              limitAssessment.bindingCap === "tierCap"
                ? "bg-slate-100 border-2 border-ledger-green"
                : "bg-slate-100 border-rule"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-ink-soft text-[11px]">1. Tier Starter Cap</span>
              {limitAssessment.bindingCap === "tierCap" && (
                <span className="px-1.5 py-0.5 rounded-full bg-ledger-green text-white text-[9px] font-bold">
                  BINDING CAP
                </span>
              )}
            </div>
            <div className="font-serif text-2xl font-black text-ink">
              {formatPaise(limitAssessment.tierCapPaise)}
            </div>
            <p className="text-[11px] text-ink-soft font-sans">
              Configured starter tier ceiling. Every student begins at ₹500 to prove repayment rhythm safely.
            </p>
          </div>

          {/* Cap 2: Capacity Cap */}
          <div
            className={`p-4 rounded-2xl border space-y-2 ${
              limitAssessment.bindingCap === "capacityCap"
                ? "bg-slate-100 border-2 border-ledger-green"
                : "bg-slate-100 border-rule"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-ink-soft text-[11px]">2. Capacity Cap (20%)</span>
              {limitAssessment.bindingCap === "capacityCap" && (
                <span className="px-1.5 py-0.5 rounded-full bg-ledger-green text-white text-[9px] font-bold">
                  BINDING CAP
                </span>
              )}
            </div>
            <div className="font-serif text-2xl font-black text-ink">
              {formatPaise(limitAssessment.capacityCapPaise)}
            </div>
            <p className="text-[11px] text-ink-soft font-sans">
              20% of median monthly qualifying cash flow ({income ? formatPaise(income.medianQualifyingIncomePaise) : "₹0"}).
            </p>
          </div>

          {/* Cap 3: Stress Due-Date Cap */}
          <div
            className={`p-4 rounded-2xl border space-y-2 ${
              limitAssessment.bindingCap === "stressDueDateCap"
                ? "bg-slate-100 border-2 border-ledger-green"
                : "bg-slate-100 border-rule"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-ink-soft text-[11px]">3. Stress Due-Date Cap</span>
              {limitAssessment.bindingCap === "stressDueDateCap" && (
                <span className="px-1.5 py-0.5 rounded-full bg-ledger-green text-white text-[9px] font-bold">
                  BINDING CAP
                </span>
              )}
            </div>
            <div className="font-serif text-2xl font-black text-ink">
              {formatPaise(limitAssessment.stressDueDateCapPaise)}
            </div>
            <p className="text-[11px] text-ink-soft font-sans">
              Lowest pre-income balance minus ₹300 safety buffer. Guarantees zero overdraft risk.
            </p>
          </div>
        </div>

        {/* Final Limit Decision */}
        <div className="p-4 rounded-2xl bg-slate-100 border border-rule flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
          <div>
            <span className="text-ink-soft text-[10px] block">Approved Starter Credit Ceiling:</span>
            <span className="font-serif font-black text-3xl text-ledger-green">
              {formatPaise(limitAssessment.finalLimitPaise)}
            </span>
          </div>
          <div className="sm:max-w-md text-ink font-sans text-xs">
            <p className="leading-snug">{limitAssessment.reasonText}</p>
          </div>
        </div>
      </section>

      {/* Day-1 Backtest Tick Strips */}
      <section className="space-y-4">
        <div>
          <h2 className="font-serif font-bold text-xl text-ink">Historical Month-by-Month Replay</h2>
          <p className="text-xs text-ink-soft mt-0.5">
            Testing candidate starter lines against verified cash flow history for {studentName} under baseline conditions and simulated 7-day income delays.
          </p>
        </div>

        <div className="space-y-3">
          {limitAssessment.backtests.map((bt) => {
            const isApprovedLine = bt.lineAmountPaise === limitAssessment.finalLimitPaise;

            return (
              <div
                key={bt.lineAmountPaise}
                className={`p-4 rounded-2xl border text-xs font-mono space-y-3 transition-colors ${
                  isApprovedLine ? "bg-white border-2 border-rule" : "bg-slate-100 border-rule"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-rule/50 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-serif font-bold text-base text-ink">
                      Candidate Line: {formatPaise(bt.lineAmountPaise)}
                    </span>
                    {isApprovedLine && (
                      <span className="px-2 py-0.5 rounded-full bg-ledger-green text-white text-[10px] font-bold">
                        RECOMMENDED
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-[11px]">
                    <span className="text-ink">
                      Normal Case: <strong>{bt.normalMonthsPassed} of {bt.totalMonths} months</strong>
                    </span>
                    <span className={bt.stressMonthsPassed === bt.totalMonths ? "text-ledger-green font-bold" : "text-vermilion font-bold"}>
                      Stress Case: <strong>{bt.stressMonthsPassed} of {bt.totalMonths} months</strong>
                    </span>
                  </div>
                </div>

                {/* Month Tick Strip */}
                <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
                  {bt.details.map((m) => (
                    <div key={m.monthKey} className="p-2.5 rounded-xl bg-white border border-rule space-y-1.5">
                      <span className="text-[10px] text-ink-soft font-bold block">{m.monthKey}</span>

                      {/* Normal Status */}
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-ink-soft">Normal</span>
                        {m.normalCovered ? (
                          <span className="text-ledger-green flex items-center font-bold">
                            <Check className="w-3 h-3 stroke-[3]" /> PASS
                          </span>
                        ) : (
                          <span className="text-vermilion flex items-center font-bold">
                            <X className="w-3 h-3 stroke-[3]" /> FAIL
                          </span>
                        )}
                      </div>

                      {/* Stress Status */}
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-ink-soft">Stress</span>
                        {m.stressCovered ? (
                          <span className="text-ledger-green flex items-center font-bold">
                            <Check className="w-3 h-3 stroke-[3]" /> PASS
                          </span>
                        ) : (
                          <span className="text-vermilion flex items-center font-bold">
                            <X className="w-3 h-3 stroke-[3]" /> FAIL
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Navigation Footer */}
      <div className="flex items-center justify-between pt-4">
        <NextLink href="/ledger" className="text-xs text-ink-soft underline font-mono">
          Back to Ledger
        </NextLink>

        <NextLink
          href="/simulator"
          className="px-6 py-2.5 rounded-full bg-pin-red hover:bg-pin-pressed text-white font-bold text-xs transition-colors flex items-center gap-2 cursor-pointer"
        >
          <span>Next: Affordability Simulator</span>
          <ArrowRight className="w-4 h-4" />
        </NextLink>
      </div>
    </div>
  );
}
