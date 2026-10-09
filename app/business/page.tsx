"use client";

import React from "react";
import { SimulationBadge } from "@/components/SimulationBadge";
import { DollarSign, ShieldCheck, TrendingUp, XCircle, CheckCircle2, ArrowRight } from "lucide-react";

export default function BusinessPage() {
  const rejectedSources = [
    { name: "Late fees from students", note: "Ascend policy config hard-codes share to ₹0." },
    { name: "Compounding penalty interest", note: "Never charged in any cycle or scenario." },
    { name: "Affiliate kickbacks from investing platforms", note: "No stock, crypto, or broker referrals." },
    { name: "Selling identifiable customer data", note: "Zero monetization of student transaction logs." },
    { name: "Sponsored loan advertisements", note: "No cross-selling of predatory third-party credit." },
  ];

  return (
    <div className="max-w-4xl mx-auto py-4 space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between">
          <h1 className="font-serif font-black text-2xl sm:text-3xl text-ink">
            Business Model and Unit Economics
          </h1>
          <SimulationBadge label="MODEL ASSUMPTION" size="sm" />
        </div>
        <p className="text-xs text-ink-soft mt-1">
          How Ascend aligns company revenue with student financial health.
        </p>
      </div>

      {/* North Star & Metrics Chain */}
      <section className="p-6 rounded-xl bg-paper-2 border-2 border-rule space-y-4">
        <div>
          <span className="font-mono text-xs font-bold text-vermilion uppercase tracking-wider block">
            The North Star Metric
          </span>
          <h2 className="font-serif font-black text-2xl text-ink">
            Bureau-Ready Graduation Rate: Target 45%
          </h2>
          <span className="px-2 py-0.5 rounded bg-marigold/10 border border-marigold text-ink text-[10px] font-mono font-bold mt-1 inline-block">
            ASSUMPTION (within 7 months of activation)
          </span>
        </div>

        <p className="text-xs text-ink-soft font-sans leading-relaxed">
          We explicitly do not treat app downloads, sign-up volume, or total lines disbursed as success.
          A line disbursed is merely a liability until clean repayment cycles prove student discipline.
        </p>

        {/* Causal Link Paragraph */}
        <div className="p-4 rounded-lg bg-paper border border-rule text-xs font-serif leading-relaxed text-ink">
          <strong>The Causal Value Engine:</strong> More on-time cycles produce more bureau-ready users,
          which lowers partner credit loss and earns graduation fees, which in turn allows higher limits
          and long-term user retention.
        </div>
      </section>

      {/* Revenue Structure */}
      <section className="space-y-4">
        <h3 className="font-serif font-bold text-xl text-ink">Legitimate Revenue Streams</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
          <div className="p-4 rounded-lg bg-paper-2 border border-rule space-y-2">
            <span className="font-bold text-ledger-green block">1. Partner Graduation Fee</span>
            <p className="text-[11px] text-ink-soft font-sans">
              Paid by the lending partner when a member successfully completes 6 clean cycles and graduates to prime products.
            </p>
            <span className="text-[10px] text-ink-soft block font-bold">Assumption: ₹450 per graduate</span>
          </div>

          <div className="p-4 rounded-lg bg-paper-2 border border-rule space-y-2">
            <span className="font-bold text-ledger-green block">2. On-Time Servicing Share</span>
            <p className="text-[11px] text-ink-soft font-sans">
              Small performance share paid by the lending partner on every cycle cleared on time via AutoPay.
            </p>
            <span className="text-[10px] text-ink-soft block font-bold">Assumption: 30 bps per clean cycle</span>
          </div>

          <div className="p-4 rounded-lg bg-paper-2 border border-rule space-y-2">
            <span className="font-bold text-ledger-green block">3. Platform Technology Fee</span>
            <p className="text-[11px] text-ink-soft font-sans">
              Fixed enterprise integration and risk calibration licensing fee paid by institutional banking partners.
            </p>
            <span className="text-[10px] text-ink-soft block font-bold">Interchange share: later phase</span>
          </div>
        </div>
      </section>

      {/* Rejected Revenue Sources Pledge */}
      <section className="p-6 rounded-xl bg-paper border border-rule space-y-4">
        <div className="flex items-center gap-2 text-vermilion">
          <XCircle className="w-5 h-5" />
          <h3 className="font-serif font-bold text-lg text-ink">Rejected Revenue Streams (The Anti-Pledge)</h3>
        </div>
        <p className="text-xs text-ink-soft">
          If a fintech earns from late fees, it is secretly incentivised to see students miss repayments. We refuse that model.
        </p>

        <div className="divide-y divide-rule/60 text-xs font-mono">
          {rejectedSources.map((rs, idx) => (
            <div key={idx} className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <span className="font-bold text-ink">{rs.name}</span>
              <span className="text-ink-soft text-[11px] font-sans">{rs.note}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
