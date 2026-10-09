"use client";

import React, { useState } from "react";
import NextLink from "next/link";
import { useAuth } from "@/lib/supabase/auth-context";
import { useApp } from "@/lib/context/AppContext";
import { SimulationBadge } from "@/components/SimulationBadge";
import { checkGraduation } from "@/lib/engine/cycle";
import { POLICY } from "@/config/policy";
import { formatPaise } from "@/lib/utils";
import {
  Award,
  ShieldCheck,
  CheckCircle2,
  TrendingUp,
  Gift,
  ArrowRight,
  ExternalLink,
  Sparkles,
} from "lucide-react";

export default function HistoryStrengthPage() {
  const { user } = useAuth();
  const { creditState, setCreditState, profile } = useApp();
  const [inviteCopied, setInviteCopied] = useState(false);

  const studentName = profile.name || user?.email?.split("@")[0] || "Student";
  const isGraduated = checkGraduation(creditState);
  const score = creditState.historyStrength;

  const canStepUp = creditState.consecutiveCleanCycles >= 2 && creditState.currentTierIndex < POLICY.tiers.length - 1;
  const nextTierPaise = POLICY.tiers[creditState.currentTierIndex + 1];

  const handleApplyStepUp = () => {
    if (!canStepUp) return;
    setCreditState((prev) => ({
      ...prev,
      currentTierIndex: prev.currentTierIndex + 1,
      limitPaise: nextTierPaise,
      selfSetCapPaise: nextTierPaise,
      availablePaise: nextTierPaise - prev.outstandingPaise,
    }));
  };

  const referralCode = user
    ? `ASCEND-${user.id.replace(/[^a-zA-Z0-9]/g, "").slice(-6).toUpperCase()}`
    : "ASCEND-STUDENT-PILOT";

  return (
    <div className="max-w-4xl mx-auto py-4 space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between">
          <h1 className="font-serif font-black text-2xl sm:text-3xl text-ink">
            Credit History Progress
          </h1>
          <SimulationBadge label="ILLUSTRATIVE PROGRESS" size="sm" />
        </div>
        <p className="text-xs text-ink-soft mt-1">
          Tracking repayment consistency toward formal credit milestones for {studentName}.
        </p>
      </div>

      {/* Mandatory Regulatory Framing Callout */}
      <div className="p-3.5 rounded-2xl bg-white border border-rule text-xs font-mono text-ink-soft leading-relaxed">
        <strong>Important notice:</strong> Illustrative progress indicator only. Not a credit bureau score. Formal bureau scores (such as CIBIL, Experian, or CRIF) are calculated directly by licensed bureaus after 6 months of active repayment reporting.
      </div>

      {/* Altimeter Gauge Panel */}
      <section className="p-6 rounded-2xl bg-white border border-rule space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="font-mono text-xs font-bold text-ledger-green uppercase tracking-wider block">
              Repayment Progress Indicator
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="font-serif font-black text-5xl text-ink">{score}</span>
              <span className="font-mono text-sm text-ink-soft">/ 100</span>
            </div>
            <p className="text-xs text-ink-soft mt-1 font-sans">
              Clean cycles: {creditState.cleanCycles} | Stress cycles passed: {creditState.stressCyclesPassed}
            </p>
          </div>

          {/* Goal Milestones */}
          <div className="flex flex-col gap-2 text-xs font-mono">
            <div
              className={`p-2.5 rounded-xl border flex items-center justify-between gap-4 ${
                score >= 70 ? "bg-ledger-green/10 border-ledger-green text-ledger-green font-bold" : "bg-slate-100 border-rule text-ink-soft"
              }`}
            >
              <span>Milestone: Tenancy Rental Ready (70+)</span>
              {score >= 70 ? <span>ACHIEVED</span> : <span>IN PROGRESS</span>}
            </div>

            <div
              className={`p-2.5 rounded-xl border flex items-center justify-between gap-4 ${
                score >= 85 ? "bg-ledger-green/10 border-ledger-green text-ledger-green font-bold" : "bg-slate-100 border-rule text-ink-soft"
              }`}
            >
              <span>Milestone: Two-Wheeler Finance Ready (85+)</span>
              {score >= 85 ? <span>ACHIEVED</span> : <span>IN PROGRESS</span>}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1">
          <div className="w-full bg-slate-100 rounded-full h-4 overflow-hidden border border-rule flex p-0.5">
            <div
              style={{ width: `${score}%` }}
              className="bg-ledger-green h-full rounded-full transition-all duration-700"
            />
          </div>
          <div className="flex justify-between text-[10px] font-mono text-ink-soft">
            <span>0 Starter</span>
            <span>40 Basic File</span>
            <span>70 Tenancy Rental</span>
            <span>85 Vehicle Finance</span>
            <span>100 Bureau Ready</span>
          </div>
        </div>
      </section>

      {/* Graduation Card */}
      {isGraduated ? (
        <section className="p-6 rounded-2xl bg-ledger-green/10 border border-ledger-green space-y-4">
          <div className="flex items-center gap-2">
            <Award className="w-6 h-6 text-ledger-green" />
            <h2 className="font-serif font-black text-2xl text-ink">
              Graduation Achieved: Bureau-Ready!
            </h2>
          </div>

          <p className="text-sm text-ink font-sans leading-relaxed">
            Congratulations, {studentName}! You have completed 6 consecutive clean cycles with responsible utilisation and navigated real-world cash stress without late defaults. Your credit file demonstrates verified discipline.
          </p>

          <div className="p-4 rounded-2xl bg-white border border-ledger-green/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
            <div>
              <span className="font-bold text-ink block">Partner Prime Referral Available</span>
              <span className="text-ink-soft text-[11px]">
                Pre-approved for LendPartner Prime Student Card (₹15,000 limit) or Two-Wheeler EMI.
              </span>
            </div>

            <button
              onClick={() => alert("Simulated referral dispatched to LendPartner Finance.")}
              className="px-4 py-2.5 rounded-full bg-pin-red text-white font-bold hover:bg-pin-pressed transition-colors flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
            >
              <span>Accept Prime Referral</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </section>
      ) : (
        <section className="p-5 rounded-2xl bg-white border border-rule space-y-3 text-xs font-mono">
          <h2 className="font-serif font-bold text-base text-ink">Path to Bureau-Ready Graduation</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-slate-100 border border-rule space-y-1">
              <span className="text-ink-soft text-[10px] block">Criteria 1</span>
              <span className="font-bold text-ink block">6 Clean Cycles</span>
              <span className="text-ink-soft text-[11px] font-sans">
                Progress: {creditState.cleanCycles} of 6 completed
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-100 border border-rule space-y-1">
              <span className="text-ink-soft text-[10px] block">Criteria 2</span>
              <span className="font-bold text-ink block">1 Stress Cycle Passed</span>
              <span className="text-ink-soft text-[11px] font-sans">
                Progress: {creditState.stressCyclesPassed} of 1 passed
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-100 border border-rule space-y-1">
              <span className="text-ink-soft text-[10px] block">Criteria 3</span>
              <span className="font-bold text-ink block">Utilisation Under 50%</span>
              <span className="text-ink-soft text-[11px] font-sans">
                Status: Verified on-time rhythm
              </span>
            </div>
          </div>
        </section>
      )}

      {/* Step-Up Tier Offer */}
      {canStepUp && (
        <section className="p-5 rounded-2xl bg-white border border-marigold space-y-3 text-xs font-mono">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] text-marigold font-bold uppercase tracking-wider block">
                Eligible for Tier Upgrade
              </span>
              <h2 className="font-serif font-bold text-lg text-ink">
                Unlock Next Tier: {formatPaise(nextTierPaise)}
              </h2>
            </div>
            <button
              onClick={handleApplyStepUp}
              className="px-5 py-2 rounded-full bg-pin-red text-white font-bold hover:bg-pin-pressed transition-colors cursor-pointer text-xs"
            >
              Opt In to Upgrade
            </button>
          </div>
          <p className="text-ink-soft font-sans">
            Ascend never auto-increases credit limits. Upgrades are strictly opt-in after demonstrating 2 clean cycles.
          </p>
        </section>
      )}

      {/* Classmate Referral Loop */}
      <section className="p-5 rounded-2xl bg-white border border-rule space-y-3 text-xs font-mono">
        <div className="flex items-center gap-2">
          <Gift className="w-4 h-4 text-ledger-green" />
          <h2 className="font-serif font-bold text-base text-ink">Classmate Referral Loop (Simulation)</h2>
        </div>
        <p className="text-ink-soft font-sans">
          Invite a classmate at your college or university. You both receive ₹25 cashback, credited
          <strong className="text-ink ml-1">only after the invitee's first on-time repayment</strong> (capped at 3 rewards).
        </p>
        <div className="flex items-center gap-2 pt-1">
          <input
            type="text"
            readOnly
            value={referralCode}
            className="p-2 rounded-xl bg-slate-100 border border-rule font-bold text-ink text-xs select-all"
          />
          <button
            onClick={() => {
              setInviteCopied(true);
              setTimeout(() => setInviteCopied(false), 2000);
            }}
            className="px-4 py-2 rounded-full bg-[#e5e5e0] hover:bg-[#dadad3] text-[#111110] text-xs font-bold transition-colors cursor-pointer"
          >
            {inviteCopied ? "Copied" : "Copy Code"}
          </button>
        </div>
        <p className="text-[10px] text-ink-soft font-sans">
          Rewards require real on-time repayment discipline to prevent referral abuse.
        </p>
      </section>

      {/* Navigation Footer */}
      <div className="flex items-center justify-between pt-4">
        <NextLink href="/line" className="text-xs text-ink-soft underline font-mono">
          Back to My Line
        </NextLink>

        <NextLink
          href="/report"
          className="px-6 py-2.5 rounded-full bg-pin-red text-white font-bold text-xs hover:bg-pin-pressed transition-colors flex items-center gap-2 cursor-pointer"
        >
          <span>Next: Shareable Report Card</span>
          <ArrowRight className="w-4 h-4" />
        </NextLink>
      </div>
    </div>
  );
}
