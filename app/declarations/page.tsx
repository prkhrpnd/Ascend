"use client";

import React from "react";
import { SimulationBadge } from "@/components/SimulationBadge";
import { ShieldCheck, BookOpen, Cpu, Database, CheckCircle2 } from "lucide-react";

export default function DeclarationsPage() {
  const libraries = [
    { name: "next", version: "14.2.15", purpose: "React Framework (App Router, API routes, SSR)" },
    { name: "react / react-dom", version: "18.3.1", purpose: "Core UI rendering and state hooks" },
    { name: "papaparse", version: "5.4.1", purpose: "In-browser and server CSV statement parsing" },
    { name: "zod", version: "3.23.8", purpose: "Strict runtime schema validation across all API routes" },
    { name: "lucide-react", version: "0.453.0", purpose: "Accessible SVG interface icons" },
    { name: "tailwindcss", version: "3.4.14", purpose: "Design tokens and utility typography styling" },
    { name: "@supabase/supabase-js", version: "2.45.4", purpose: "Authentication, Row Level Security (RLS), and database queries" },
    { name: "vitest", version: "2.1.3", purpose: "Deterministic unit test suite for financial engine" },
  ];

  const fonts = [
    { name: "Fraunces", license: "Open Font License (OFL)", source: "Google Fonts", usage: "Headings, hero copy, and key milestones" },
    { name: "JetBrains Mono", license: "OFL (JetBrains)", source: "Google Fonts", usage: "All rupee amounts, dates, tables, and policy values" },
    { name: "Caveat", license: "OFL", source: "Google Fonts", usage: "Handwritten margin notes (sparingly, never for disclosures)" },
    { name: "System Sans", license: "System Native", source: "OS Native", usage: "Body text and accessibility readability" },
  ];

  const simulatedComponents = [
    { component: "Bank Account Aggregator", status: "SIMULATED", notes: "Parses synthetic or uploaded CSVs. No real banking credentials requested." },
    { component: "Lending Partner (LendPartner Finance)", status: "SIMULATED", notes: "Demonstrates regulated lender separation. Ascend is not an NBFC." },
    { component: "Credit Bureau Reporting", status: "SIMULATED", notes: "Simulates monthly repayment ticks sent to credit bureaus like CIBIL." },
    { component: "AutoPay Mandate Execution", status: "SIMULATED", notes: "Simulates scheduled NACH/e-mandate execution 2 days after allowance." },
    { component: "Partner Risk Cockpit Data", status: "SIMULATED", notes: "Funnel and vintage curves for cohort of 315 synthetic users." },
  ];

  return (
    <div className="max-w-4xl mx-auto py-4 space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between">
          <h1 className="font-serif font-black text-2xl sm:text-3xl text-ink">
            Declarations and Disclosures
          </h1>
          <SimulationBadge label="SECTION 12 COMPLIANCE" size="sm" />
        </div>
        <p className="text-xs text-ink-soft mt-1">
          Complete inventory of software libraries, typography licenses, AI interfaces, and simulated components.
        </p>
      </div>

      {/* Origin Statement */}
      <div className="p-4 rounded-xl bg-paper-2 border border-rule text-xs font-mono space-y-1">
        <span className="font-bold text-ink block">Hackathon Build Origin:</span>
        <p className="text-ink-soft font-sans">
          This prototype was built from scratch during the hackathon sprint. AI coding assistants were
          used exclusively for code generation and engineering iteration during the prototype sprint.
          All financial underwriting logic is deterministic TypeScript in /lib/engine.
        </p>
      </div>

      {/* Simulated Components Table */}
      <section className="space-y-3">
        <h2 className="font-serif font-bold text-xl text-ink">Table of Simulated Components</h2>
        <div className="border border-rule rounded-lg bg-paper overflow-hidden shadow-sm">
          <table className="w-full text-xs font-mono divide-y divide-rule text-left">
            <thead className="bg-paper-2 text-[11px] text-ink-soft uppercase tracking-wider">
              <tr>
                <th className="p-3">Component</th>
                <th className="p-3">Status</th>
                <th className="p-3">Compliance Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-rule/60">
              {simulatedComponents.map((sc, i) => (
                <tr key={i} className="hover:bg-paper-2/40">
                  <td className="p-3 font-bold text-ink">{sc.component}</td>
                  <td className="p-3">
                    <SimulationBadge label={sc.status} size="sm" />
                  </td>
                  <td className="p-3 text-ink-soft font-sans">{sc.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Libraries Used */}
      <section className="space-y-3">
        <h2 className="font-serif font-bold text-xl text-ink">Software Libraries (npm)</h2>
        <div className="border border-rule rounded-lg bg-paper overflow-hidden shadow-sm">
          <table className="w-full text-xs font-mono divide-y divide-rule text-left">
            <thead className="bg-paper-2 text-[11px] text-ink-soft uppercase tracking-wider">
              <tr>
                <th className="p-3">Package</th>
                <th className="p-3">Version</th>
                <th className="p-3">Architecture Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-rule/60">
              {libraries.map((lib, i) => (
                <tr key={i} className="hover:bg-paper-2/40">
                  <td className="p-3 font-bold text-ink">{lib.name}</td>
                  <td className="p-3 text-vermilion">{lib.version}</td>
                  <td className="p-3 text-ink-soft font-sans">{lib.purpose}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Fonts Declared */}
      <section className="space-y-3">
        <h2 className="font-serif font-bold text-xl text-ink">Typography and Fonts</h2>
        <div className="border border-rule rounded-lg bg-paper overflow-hidden shadow-sm">
          <table className="w-full text-xs font-mono divide-y divide-rule text-left">
            <thead className="bg-paper-2 text-[11px] text-ink-soft uppercase tracking-wider">
              <tr>
                <th className="p-3">Font Name</th>
                <th className="p-3">License</th>
                <th className="p-3">Source</th>
                <th className="p-3">Usage in Digital Khata</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-rule/60">
              {fonts.map((f, i) => (
                <tr key={i} className="hover:bg-paper-2/40">
                  <td className="p-3 font-bold text-ink">{f.name}</td>
                  <td className="p-3 text-ink-soft">{f.license}</td>
                  <td className="p-3 text-ink-soft">{f.source}</td>
                  <td className="p-3 text-ink-soft font-sans">{f.usage}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Gemini AI API Declaration */}
      <section className="p-5 rounded-xl bg-paper-2 border border-rule space-y-3 text-xs font-mono">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-marigold" />
          <h2 className="font-serif font-bold text-base text-ink">Google Gemini API Declaration</h2>
        </div>
        <p className="text-ink-soft font-sans">
          What is sent: Only unknown transaction narration strings and engine numbers for educational
          plain-language chat. No personal names or identity numbers are ever sent.
        </p>
        <p className="text-ink-soft font-sans">
          Refusal constraint: Deterministic regex pre-filter strictly refuses investment recommendations,
          stock tips, and crypto queries without making any model API call.
        </p>
      </section>
    </div>
  );
}
