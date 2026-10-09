"use client";

import React from "react";
import { SimulationBadge } from "@/components/SimulationBadge";
import { ShieldCheck, TrendingDown, Users, AlertTriangle, CheckCircle2, BarChart2 } from "lucide-react";

export default function PartnerDashboardPage() {
  const funnel = [
    { step: "Initial Campus Sign-ups", count: 2000, rate: "100%" },
    { step: "Pass 18+ and Cluster Check", count: 1800, rate: "90%" },
    { step: "Consent and Link Statement", count: 1080, rate: "60%" },
    { step: "Complete Ledger Analysis", count: 594, rate: "55%" },
    { step: "Qualify for Starter Line", count: 416, rate: "70%" },
    { step: "Activated Line Cohort", count: 315, rate: "75%" },
  ];

  return (
    <div className="max-w-5xl mx-auto py-4 space-y-8">
      {/* Top Banner (Mandatory Synthetic Label) */}
      <div className="p-3.5 rounded-lg bg-vermilion/10 border border-vermilion/40 text-xs font-mono text-vermilion flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <strong className="tracking-wide">SYNTHETIC DATA: demonstration only</strong>
        </div>
        <SimulationBadge label="PARTNER COHORT N=315" size="sm" />
      </div>

      {/* Header */}
      <div>
        <h1 className="font-serif font-black text-2xl sm:text-3xl text-ink">
          LendPartner Finance Portfolio Risk Cockpit
        </h1>
        <p className="text-xs text-ink-soft mt-1">
          Simulated pilot cohort risk monitoring for 315 active cohort students.
        </p>
      </div>

      {/* Key Risk Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
        {/* 30+ DPD */}
        <div className="p-4 rounded-xl bg-paper-2 border border-rule space-y-1">
          <span className="text-ink-soft text-[10px] block">30+ DPD Portfolio Rate</span>
          <span className="font-serif font-black text-2xl text-ledger-green block">2.8%</span>
          <span className="text-[10px] text-ink-soft block font-sans">
            Target: &lt;5% | Pullback: 8% (9 of 315 users)
          </span>
        </div>

        {/* FPD */}
        <div className="p-4 rounded-xl bg-paper-2 border border-rule space-y-1">
          <span className="text-ink-soft text-[10px] block">First-Payment Default</span>
          <span className="font-serif font-black text-2xl text-ledger-green block">1.2%</span>
          <span className="text-[10px] text-ink-soft block font-sans">
            4 of 315 first-cycle users
          </span>
        </div>

        {/* First-Loss Pool */}
        <div className="p-4 rounded-xl bg-paper-2 border border-rule space-y-1">
          <span className="text-ink-soft text-[10px] block">First-Loss Pool Usage</span>
          <span className="font-serif font-black text-2xl text-ink block">38.2%</span>
          <span className="text-[10px] text-ink-soft block font-sans">
            Pause Onboarding Line: 70%
          </span>
        </div>

        {/* Bureau Ready Rate */}
        <div className="p-4 rounded-xl bg-paper-2 border border-rule space-y-1">
          <span className="text-ink-soft text-[10px] block">Stress Cycle Pass Rate</span>
          <span className="font-serif font-black text-2xl text-marigold block">84.1%</span>
          <span className="text-[10px] text-ink-soft block font-sans">
            265 of 315 passed cash squeeze
          </span>
        </div>
      </div>

      {/* Vintage Curve Visualisation */}
      <section className="p-5 rounded-xl bg-paper-2 border border-rule space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-rule pb-2">
          <div>
            <h2 className="font-serif font-bold text-base text-ink">Cohort Vintage Curve (Cumulative 30+ DPD)</h2>
            <span className="text-[11px] text-ink-soft font-mono">By Cycle Month on Book</span>
          </div>
          <div className="flex items-center gap-3 text-[11px] font-mono">
            <span className="text-ledger-green font-bold">Current: 2.8%</span>
            <span className="text-ink-soft">Target Ceiling: 5.0%</span>
            <span className="text-vermilion">Pull-Back Line: 8.0%</span>
          </div>
        </div>

        {/* SVG Vintage Curve */}
        <div className="h-52 w-full bg-paper rounded-lg border border-rule p-2 overflow-hidden relative">
          <svg className="w-full h-full" viewBox="0 0 600 180" preserveAspectRatio="none">
            {/* 8% Pull Back Line */}
            <line x1="0" y1="40" x2="600" y2="40" stroke="#C8412B" strokeWidth="1.5" strokeDasharray="3 3" />
            <text x="8" y="35" fill="#C8412B" fontSize="9" fontFamily="monospace">
              8% Limit Increase Pull-Back Threshold
            </text>

            {/* 5% Target Ceiling Line */}
            <line x1="0" y1="80" x2="600" y2="80" stroke="#4A463E" strokeWidth="1" strokeDasharray="2 2" />
            <text x="8" y="75" fill="#4A463E" fontSize="9" fontFamily="monospace">
              5% Portfolio Target Ceiling
            </text>

            {/* Zero Base Line */}
            <line x1="0" y1="160" x2="600" y2="160" stroke="#CFC3AA" strokeWidth="1" />
            <text x="8" y="172" fill="#CFC3AA" fontSize="8" fontFamily="monospace">
              0% Baseline
            </text>

            {/* Vintage Cumulative DPD Curve */}
            {/* Cycle 1 (0.8%), Cycle 2 (1.4%), Cycle 3 (1.9%), Cycle 4 (2.3%), Cycle 5 (2.6%), Cycle 6 (2.8%) */}
            <polyline
              fill="none"
              stroke="#2F5D3A"
              strokeWidth="3"
              points="20,150 120,138 220,126 320,118 420,112 560,108"
            />

            {/* Month markers */}
            <circle cx="20" cy="150" r="4" fill="#2F5D3A" />
            <circle cx="120" cy="138" r="4" fill="#2F5D3A" />
            <circle cx="220" cy="126" r="4" fill="#2F5D3A" />
            <circle cx="320" cy="118" r="4" fill="#2F5D3A" />
            <circle cx="420" cy="112" r="4" fill="#2F5D3A" />
            <circle cx="560" cy="108" r="4" fill="#2F5D3A" />
          </svg>
        </div>
      </section>

      {/* Funnel Table */}
      <section className="space-y-3">
        <h2 className="font-serif font-bold text-lg text-ink">National Campus Pilot Funnel Breakdown</h2>
        <div className="border border-rule rounded-lg bg-paper overflow-hidden shadow-sm">
          <table className="w-full text-xs font-mono divide-y divide-rule text-left">
            <thead className="bg-paper-2 text-[11px] text-ink-soft uppercase tracking-wider">
              <tr>
                <th className="p-3">Funnel Stage</th>
                <th className="p-3 text-right">Count</th>
                <th className="p-3 text-right">Conversion Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-rule/60">
              {funnel.map((fn, idx) => (
                <tr key={idx} className="hover:bg-paper-2/40">
                  <td className="p-3 font-medium text-ink">{fn.step}</td>
                  <td className="p-3 text-right font-bold">{fn.count}</td>
                  <td className="p-3 text-right text-ink-soft">{fn.rate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* "Why Users Are Lower Risk Than They Look" Panel */}
      <section className="p-6 rounded-xl bg-paper-2 border-2 border-rule space-y-4">
        <div>
          <span className="font-mono text-xs font-bold text-vermilion uppercase tracking-wider block">
            Underwriting Defense
          </span>
          <h2 className="font-serif font-bold text-xl text-ink">
            Why Campus Students Are Lower Risk Than They Look
          </h2>
          <p className="text-xs text-ink-soft mt-1">
            Methodology description: how cash flow signals provide better risk containment than static bureau cuts.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
          <div className="p-3.5 rounded bg-paper border border-rule space-y-1">
            <span className="font-bold text-ink block">1. Day-1 Stress Backtest</span>
            <p className="text-[11px] text-ink-soft font-sans">
              Method: Instead of assuming income continues uninterrupted, the algorithm simulates that the primary
              allowance is delayed by 7 days and haircuts tutoring earnings by 25%.
            </p>
          </div>

          <div className="p-3.5 rounded bg-paper border border-rule space-y-1">
            <span className="font-bold text-ink block">2. Strict Due-Date Offset</span>
            <p className="text-[11px] text-ink-soft font-sans">
              Method: Repayment due dates are pegged strictly 2 days after the primary recurring inflow lands,
              capturing liquidity when student cash balances are at their peak.
            </p>
          </div>

          <div className="p-3.5 rounded bg-paper border border-rule space-y-1">
            <span className="font-bold text-ink block">3. Matched Control Group Calibration</span>
            <p className="text-[11px] text-ink-soft font-sans">
              Method: Comparing repayment vintage curves against an unguided cohort demonstrates that the
              responsible slip ladder prevents transition from early roll to 30+ DPD.
            </p>
          </div>

          <div className="p-3.5 rounded bg-paper border border-rule space-y-1">
            <span className="font-bold text-ink block">4. First-Loss Pool Cap</span>
            <p className="text-[11px] text-ink-soft font-sans">
              Method: An automated circuit breaker pauses all new user onboarding if first-loss pool utilisation
              crosses 70%, protecting partner capital.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
