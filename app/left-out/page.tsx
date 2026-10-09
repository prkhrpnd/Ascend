"use client";

import React from "react";
import { SimulationBadge } from "@/components/SimulationBadge";
import { Ban, UserX, Compass, ShieldAlert } from "lucide-react";

export default function WhatWeLeftOutPage() {
  const omittedFeatures = [
    {
      title: "Investment Advice and Stock Picks",
      why: "Ascend focuses strictly on starter credit discipline. We never recommend stocks, crypto, mutual funds, or trading tips.",
    },
    {
      title: "Hosted Books and Heavy Courses",
      why: "Students learn directly through bite-sized Moment Cards triggered inside their own ledger data.",
    },
    {
      title: "Multi-Bank Account Aggregation",
      why: "Focusing on the student's primary UPI campus account keeps underwriting explainable and eliminates data clutter.",
    },
    {
      title: "Peer or Group Liability",
      why: "Group liability penalises disciplined students for roommates' defaults. Ascend relies entirely on individual accountability.",
    },
    {
      title: "Parent Guarantors",
      why: "Students build an independent, self-sovereign credit record without needing parents to co-sign or pledge collateral.",
    },
    {
      title: "Unrestricted Public Lending",
      why: "Strict student-focused beachhead. We focus specifically on enrolled higher education students before expanding to general retail credit.",
    },
    {
      title: "Secured-Line (FD-Backed) Fallback",
      why: "A promising future phase, but omitted from this 24-hour prototype sprint to maintain single-spine focus.",
    },
    {
      title: "Real Payment Gateways and Real Bureaus",
      why: "Regulated NBFC integration and bureau reporting APIs are simulated to demonstrate the complete lifecycle without production risk.",
    },
  ];

  return (
    <div className="max-w-4xl mx-auto py-4 space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between">
          <h1 className="font-serif font-black text-2xl sm:text-3xl text-ink">
            What We Left Out (Deliberate Omissions)
          </h1>
          <SimulationBadge label="SCOPE BOUNDARY" size="sm" />
        </div>
        <p className="text-xs text-ink-soft mt-1">
          A disciplined product is defined as much by what it refuses to build as what it builds.
        </p>
      </div>

      {/* Out of Scope Personas */}
      <section className="p-6 rounded-xl bg-paper-2 border border-rule space-y-4">
        <div className="flex items-center gap-2">
          <UserX className="w-5 h-5 text-vermilion" />
          <h2 className="font-serif font-bold text-xl text-ink">Out of Scope Personas</h2>
        </div>
        <p className="text-xs text-ink-soft leading-relaxed font-sans">
          This prototype is focused on disciplined final-year students with allowance and tutoring cash flows.
          Other segments are deliberately reserved for later roadmap phases:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono pt-1">
          <div className="p-4 rounded-lg bg-paper border border-rule space-y-2">
            <span className="font-bold text-ink block">Aarav (Irregular Freelancer)</span>
            <p className="text-[11px] text-ink-soft font-sans">
              Irregular gig income with pre-income balance frequently below ₹300. In our prototype, Aarav is supported
              only as a decline demo (yielding Limit ₹0 with helpful next steps), rather than a full product journey.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-paper border border-rule space-y-2">
            <span className="font-bold text-ink block">Kabir (Salaried Software Trainee)</span>
            <p className="text-[11px] text-ink-soft font-sans">
              Has consistent monthly salary deposits and corporate health benefits. Kabir can already qualify for mainstream
              bank cards. Building for Kabir would distract from our core unserved beachhead.
            </p>
          </div>
        </div>
      </section>

      {/* Feature Omissions List */}
      <section className="space-y-4">
        <h2 className="font-serif font-bold text-xl text-ink">Deliberately Omitted Capabilities</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
          {omittedFeatures.map((feat, idx) => (
            <div key={idx} className="p-4 rounded-lg bg-paper-2 border border-rule space-y-1.5">
              <span className="font-bold text-ink block">{feat.title}</span>
              <p className="text-[11px] text-ink-soft font-sans leading-relaxed">{feat.why}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
