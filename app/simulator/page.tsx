"use client";

import React, { useState, useEffect, useMemo } from "react";
import NextLink from "next/link";
import { useAuth } from "@/lib/supabase/auth-context";
import { useApp } from "@/lib/context/AppContext";
import { SimulationBadge } from "@/components/SimulationBadge";
import { simulateAffordability } from "@/lib/engine/simulate";
import { formatPaise, formatDate } from "@/lib/utils";
import { SimulationResult, SimulationDay } from "@/lib/engine/types";
import { POLICY } from "@/config/policy";
import {
  Sliders,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  ShieldAlert,
  FileText,
  Info,
  Calendar,
  AlertCircle,
  HelpCircle,
} from "lucide-react";

export default function SimulatorPage() {
  const { user } = useAuth();
  const {
    transactions,
    coverage,
    income,
    creditState,
    profile,
    uploadStats,
    analytics,
    activeFileName,
    loadSampleProfile,
  } = useApp();

  // 1. Sort transactions chronologically to determine latest valid running balance
  const { sortedTransactions, latestBalanceTx, hasRunningBalances } = useMemo(() => {
    if (!transactions || transactions.length === 0) {
      return { sortedTransactions: [], latestBalanceTx: null, hasRunningBalances: false };
    }

    const sorted = [...transactions].sort((a, b) => {
      const dateCmp = (a.date || "").localeCompare(b.date || "");
      if (dateCmp !== 0) return dateCmp;
      return (a.time || "").localeCompare(b.time || "");
    });

    const txsWithBal = sorted.filter(
      (t) => typeof t.balance_paise === "number" && t.balance_paise > 0
    );

    const latest = txsWithBal.length > 0 ? txsWithBal[txsWithBal.length - 1] : null;
    const valid = txsWithBal.length > 0;

    return {
      sortedTransactions: sorted,
      latestBalanceTx: latest,
      hasRunningBalances: valid,
    };
  }, [transactions]);

  // Derived starting values from statement
  const startingBalancePaise = latestBalanceTx?.balance_paise ?? 0;
  const startingDateStr = latestBalanceTx?.date ?? "";

  // Statement-derived daily spending rate
  const statementDailySpendPaise = useMemo(() => {
    if (analytics?.averageDailySpendPaise && analytics.averageDailySpendPaise > 0) {
      return analytics.averageDailySpendPaise;
    }
    if (transactions.length > 0) {
      const totalDebitPaise = transactions
        .filter((t) => t.type === "DR")
        .reduce((sum, t) => sum + t.amount_paise, 0);
      const days = analytics?.daysCount || 30;
      return Math.round(totalDebitPaise / Math.max(1, days));
    }
    return 25000; // Rs 250 fallback
  }, [analytics, transactions]);

  // Dynamic state controls for simulation
  const [purchaseAmountRupees, setPurchaseAmountRupees] = useState<number>(500);
  const [drawAmountRupees, setDrawAmountRupees] = useState<number>(300);
  const [purchaseDayOffset, setPurchaseDayOffset] = useState<number>(6);
  const [allowanceRupees, setAllowanceRupees] = useState<number>(6000);
  const [earnedRupees, setEarnedRupees] = useState<number>(1500);

  // Sync allowance and earned income when statement income changes
  useEffect(() => {
    if (income) {
      const detectedAllowance = Math.round((income.medianQualifyingIncomePaise || 600000) / 100);
      setAllowanceRupees(detectedAllowance);

      if (income.months && income.months.length > 0) {
        const totalEarned = income.months.reduce((acc, m) => acc + (m.earnedIncomePaise || 0), 0);
        const avgEarned = Math.round(totalEarned / (income.months.length * 100));
        setEarnedRupees(avgEarned);
      }
    }
  }, [income]);

  // Hover state for interactive SVG graph tooltip
  const [hoveredDayIndex, setHoveredDayIndex] = useState<number | null>(null);

  // 2. Compute 60-day Forward Projection dynamically
  const simResult: SimulationResult | null = useMemo(() => {
    if (!hasRunningBalances || startingBalancePaise <= 0) {
      return null;
    }

    return simulateAffordability({
      currentBalancePaise: startingBalancePaise,
      monthlyAllowancePaise: allowanceRupees * 100,
      monthlyEarnedPaise: earnedRupees * 100,
      primaryIncomeDay: income?.primaryIncomeDay || 1,
      dueDay: income?.dueDate || ((1 + POLICY.dueDateOffsetDays - 1) % 30 + 1),
      dailyMedianSpendPaise: statementDailySpendPaise,
      drawAmountPaise: drawAmountRupees * 100,
      purchaseAmountPaise: purchaseAmountRupees * 100,
      purchaseDayOffset,
      startDateStr: startingDateStr,
      drawDayOffset: 1,
    });
  }, [
    hasRunningBalances,
    startingBalancePaise,
    startingDateStr,
    allowanceRupees,
    earnedRupees,
    income,
    statementDailySpendPaise,
    drawAmountRupees,
    purchaseAmountRupees,
    purchaseDayOffset,
  ]);

  // Active hovered day object
  const hoveredDay = useMemo(() => {
    if (!simResult || hoveredDayIndex === null) return null;
    return simResult.days.find((d) => d.dayIndex === hoveredDayIndex) || null;
  }, [simResult, hoveredDayIndex]);

  // 3. Empty state: No transactions uploaded yet
  if (!transactions || transactions.length === 0) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-ledger-green/10 text-ledger-green mx-auto flex items-center justify-center">
          <Sliders className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h1 className="font-serif font-bold text-2xl sm:text-3xl text-ink">
            Affordability Simulator
          </h1>
          <p className="text-xs text-ink-soft max-w-md mx-auto leading-relaxed">
            Link your bank statement to simulate forward cash flow resilience, test potential campus purchases, and see how unexpected delays affect your balance.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2 font-mono text-xs">
          <NextLink
            href="/link"
            className="px-6 py-3 rounded-lg bg-ledger-green text-paper font-bold shadow hover:bg-[#23472c] transition-colors flex items-center gap-2"
          >
            <span>Link Bank Account</span>
            <ArrowRight className="w-4 h-4" />
          </NextLink>

          <NextLink
            href="/link"
            className="px-6 py-3 rounded-lg border border-rule bg-paper-2 hover:bg-rule/30 text-ink font-semibold transition-colors flex items-center gap-2"
          >
            <FileText className="w-4 h-4 text-ink-soft" />
            <span>Upload Statement CSV</span>
          </NextLink>
        </div>

        <div className="pt-6 border-t border-rule/60 max-w-sm mx-auto text-xs font-mono text-ink-soft">
          <p className="mb-2 text-[11px] uppercase tracking-wider font-semibold">
            Developer / Evaluator Mode
          </p>
          <button
            type="button"
            onClick={() => loadSampleProfile("priya")}
            className="px-4 py-2 rounded bg-paper border border-rule hover:bg-paper-2 text-ink text-[11px] cursor-pointer"
          >
            Load Simulated Benchmark Statement
          </button>
        </div>
      </div>
    );
  }

  // 4. Warning state: Transactions present, but missing valid running balance sequence
  if (!hasRunningBalances || startingBalancePaise <= 0) {
    return (
      <div className="max-w-3xl mx-auto py-10 space-y-6">
        <div className="p-6 rounded-xl bg-amber-50/70 border border-amber-300 text-ink space-y-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-amber-700 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h2 className="font-serif font-bold text-lg text-amber-900">
                Running Balance Missing in Statement
              </h2>
              <p className="text-xs font-mono text-amber-800 leading-relaxed">
                Unable to calculate a reliable cash-balance projection. Upload a statement with a running balance or provide a verified opening balance.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-paper border border-amber-200 text-xs font-mono space-y-2 text-ink-soft">
            <p className="font-semibold text-ink text-[11px] uppercase tracking-wider">
              Diagnostic Information
            </p>
            <ul className="list-disc list-inside space-y-1">
              <li>Uploaded rows: {transactions.length} records parsed</li>
              <li>Running balance column: Not detected or contains all zero values</li>
              <li>Statement file: {activeFileName || "Uploaded statement"}</li>
            </ul>
            <p className="pt-2 text-[11px] text-ink">
              Ascend requires a verified running account balance from your bank statement to calculate daily forward projections and prevent inaccurate simulations.
            </p>
          </div>

          <div className="pt-2 flex items-center gap-3 font-mono text-xs">
            <NextLink
              href="/link"
              className="px-5 py-2.5 rounded-lg bg-ledger-green text-paper font-bold hover:bg-[#23472c] transition-colors flex items-center gap-2"
            >
              <FileText className="w-4 h-4" />
              <span>Upload CSV with Balance Column</span>
            </NextLink>
            <button
              type="button"
              onClick={() => loadSampleProfile("priya")}
              className="px-4 py-2.5 rounded-lg bg-paper border border-rule hover:bg-paper-2 text-ink font-semibold"
            >
              Load Benchmark Statement
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 5. Dynamic Chart Coordinate Computation
  const svgWidth = 660;
  const svgHeight = 250;
  const padLeft = 65;
  const padRight = 20;
  const padTop = 25;
  const padBottom = 35;
  const plotWidth = svgWidth - padLeft - padRight;
  const plotHeight = svgHeight - padTop - padBottom;

  // Compute dynamic domain from actual simulation numbers
  let yDomainMin = 0;
  let yDomainMax = 100000;
  let domainSpan = 100000;

  if (simResult && simResult.days.length > 0) {
    const allBalances = simResult.days.flatMap((d) => [d.safeBalancePaise, d.stressBalancePaise]);
    const rawMin = Math.min(0, POLICY.bufferPaise, ...allBalances);
    const rawMax = Math.max(POLICY.bufferPaise * 1.5, startingBalancePaise, ...allBalances);
    const range = Math.max(25000, rawMax - rawMin); // At least Rs 250 dynamic range

    // Add 8% padding to domain bounds to prevent clipping
    yDomainMin = Math.floor(rawMin - range * 0.08);
    yDomainMax = Math.ceil(rawMax + range * 0.08);
    domainSpan = Math.max(1000, yDomainMax - yDomainMin);
  }

  const getYCoord = (valPaise: number) => {
    const clamped = Math.max(yDomainMin, Math.min(yDomainMax, valPaise));
    const frac = (clamped - yDomainMin) / domainSpan;
    return padTop + plotHeight * (1 - frac);
  };

  const getXCoord = (dayIdx: number) => {
    return padLeft + ((dayIdx - 1) / 59) * plotWidth;
  };

  // Safe and Stress polyline point strings
  const safePolylinePoints = simResult
    ? simResult.days.map((d) => `${getXCoord(d.dayIndex)},${getYCoord(d.safeBalancePaise)}`).join(" ")
    : "";

  const stressPolylinePoints = simResult
    ? simResult.days.map((d) => `${getXCoord(d.dayIndex)},${getYCoord(d.stressBalancePaise)}`).join(" ")
    : "";

  // Buffer line Y coordinate
  const yBufferCoord = getYCoord(POLICY.bufferPaise);
  // Zero line Y coordinate
  const yZeroCoord = getYCoord(0);

  // Due Date X coordinates
  const xDue1 = simResult?.dueDay1Index ? getXCoord(simResult.dueDay1Index) : null;
  const xDue2 = simResult?.dueDay2Index ? getXCoord(simResult.dueDay2Index) : null;

  return (
    <div className="max-w-4xl mx-auto py-4 space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between">
          <h1 className="font-serif font-bold text-2xl sm:text-3xl text-ink">
            Affordability Simulator
          </h1>
          <SimulationBadge label="PROJECTION: NOT A PROMISE" size="sm" />
        </div>
        <p className="text-xs text-ink-soft mt-1">
          Explore forward cash flow resilience against unplanned campus purchases and delayed family allowances.
        </p>
      </div>

      {/* Statement Source Banner */}
      <div className="p-4 rounded-xl bg-paper-2 border border-rule flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-ledger-green" />
            <span className="font-bold text-ink">Active Statement: {activeFileName}</span>
          </div>
          <p className="text-ink-soft text-[11px]">
            Verified Starting Balance: <span className="font-bold text-ink">{formatPaise(startingBalancePaise)}</span> as of {formatDate(startingDateStr)}
          </p>
        </div>
        <div className="flex items-center gap-4 text-[11px] text-ink-soft">
          <div>
            <span className="block text-[10px] uppercase">Daily Spend</span>
            <span className="font-bold text-ink">{formatPaise(statementDailySpendPaise)}/day</span>
          </div>
          <div>
            <span className="block text-[10px] uppercase">Transactions</span>
            <span className="font-bold text-ink">{transactions.length} rows</span>
          </div>
          <div>
            <span className="block text-[10px] uppercase">Safety Buffer</span>
            <span className="font-bold text-ink">{formatPaise(POLICY.bufferPaise)}</span>
          </div>
        </div>
      </div>

      {/* Simulator Interactive Controls */}
      <div className="p-6 rounded-xl bg-paper-2 border border-rule space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs font-mono">
          {/* Purchase Slider + Numeric Input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-bold text-ink flex items-center gap-1.5">
                <span>Hypothetical Campus Purchase</span>
              </label>
              <div className="flex items-center gap-1">
                <span className="text-ink-soft">₹</span>
                <input
                  type="number"
                  min="0"
                  max="3000"
                  step="50"
                  value={purchaseAmountRupees}
                  onChange={(e) => setPurchaseAmountRupees(Math.max(0, Number(e.target.value)))}
                  className="w-20 px-2 py-1 rounded bg-paper border border-rule text-right font-bold text-ink focus:outline-none focus:ring-1 focus:ring-ink"
                />
              </div>
            </div>
            <input
              type="range"
              min="0"
              max="3000"
              step="50"
              value={purchaseAmountRupees}
              onChange={(e) => setPurchaseAmountRupees(Number(e.target.value))}
              className="w-full accent-ledger-green cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-ink-soft">
              <span>₹0</span>
              <span>₹1,500</span>
              <span>₹3,000</span>
            </div>

            {/* Purchase Timing Offset */}
            <div className="pt-2 flex items-center justify-between text-[11px]">
              <span className="text-ink-soft">Purchase Occurs On:</span>
              <div className="flex items-center gap-2">
                {[
                  { label: "Day 6", val: 6 },
                  { label: "Day 14", val: 14 },
                  { label: "Day 21", val: 21 },
                ].map((opt) => (
                  <button
                    key={opt.val}
                    type="button"
                    onClick={() => setPurchaseDayOffset(opt.val)}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors ${
                      purchaseDayOffset === opt.val
                        ? "bg-ledger-green text-paper"
                        : "bg-paper border border-rule text-ink-soft hover:text-ink"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Draw Amount Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-bold text-ink flex items-center gap-1.5">
                <span>Starter Credit Draw Amount</span>
              </label>
              <div className="flex items-center gap-1">
                <span className="text-ink-soft">₹</span>
                <input
                  type="number"
                  min="0"
                  max="500"
                  step="50"
                  value={drawAmountRupees}
                  onChange={(e) => setDrawAmountRupees(Math.min(500, Math.max(0, Number(e.target.value))))}
                  className="w-20 px-2 py-1 rounded bg-paper border border-rule text-right font-bold text-ink focus:outline-none focus:ring-1 focus:ring-ink"
                />
              </div>
            </div>
            <input
              type="range"
              min="0"
              max="500"
              step="50"
              value={drawAmountRupees}
              onChange={(e) => setDrawAmountRupees(Number(e.target.value))}
              className="w-full accent-ledger-green cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-ink-soft">
              <span>₹0</span>
              <span>₹250</span>
              <span>₹500 (Tier Cap)</span>
            </div>

            {/* Draw Repayment Notice */}
            <div className="pt-2 text-[10px] text-ink-soft">
              Cycle 1 term: First cycle interest-free. Repaid on Due Date 1 ({income?.dueDate ? `Day ${income.dueDate}` : "Day 3"}).
            </div>
          </div>
        </div>

        {/* Self-Declared Income Assumptions */}
        <div className="pt-4 border-t border-rule/70 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-ink-soft">Monthly Family Allowance:</span>
              <div className="flex items-center gap-1">
                <span className="text-ink-soft">₹</span>
                <input
                  type="number"
                  min="0"
                  max="30000"
                  step="500"
                  value={allowanceRupees}
                  onChange={(e) => setAllowanceRupees(Math.max(0, Number(e.target.value)))}
                  className="w-20 px-2 py-0.5 rounded bg-paper border border-rule text-right font-bold text-ink"
                />
              </div>
            </div>
            <p className="text-[10px] text-ink-soft">
              Arrives on Day {income?.primaryIncomeDay || 1}. Stress scenario tests a 7-day delay.
            </p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-ink-soft">Monthly Earned Income:</span>
              <div className="flex items-center gap-1">
                <span className="text-ink-soft">₹</span>
                <input
                  type="number"
                  min="0"
                  max="15000"
                  step="250"
                  value={earnedRupees}
                  onChange={(e) => setEarnedRupees(Math.max(0, Number(e.target.value)))}
                  className="w-20 px-2 py-0.5 rounded bg-paper border border-rule text-right font-bold text-ink"
                />
              </div>
            </div>
            <p className="text-[10px] text-ink-soft">
              Tutoring or freelance income. Stress scenario applies a 25% haircut.
            </p>
          </div>
        </div>

        <div className="p-3 rounded-lg bg-paper border border-rule text-[11px] text-ink-soft font-mono flex items-center justify-between">
          <span>Self-declared scenario adjustments change only the projection, never the approved limit.</span>
          <span className="text-ledger-green font-bold uppercase text-[10px]">Deterministic Rule</span>
        </div>
      </div>

      {/* Daily Balance Projection Graph */}
      {simResult && (
        <section className="p-5 rounded-xl bg-paper-2 border border-rule space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-rule pb-3">
            <div>
              <h2 className="font-serif font-bold text-base text-ink">60-Day Forward Projection</h2>
              <span className="text-[11px] text-ink-soft font-mono">
                Derived directly from {activeFileName} running balance and spending rate
              </span>
            </div>
            <div className="flex items-center gap-4 text-[11px] font-mono">
              <span className="flex items-center gap-1.5 text-ledger-green font-bold">
                <span className="w-3 h-1 bg-ledger-green rounded" /> Safe Line
              </span>
              <span className="flex items-center gap-1.5 text-red-700 font-bold">
                <span className="w-3 h-1 bg-red-700 rounded" /> Stress Delay
              </span>
              <span className="flex items-center gap-1.5 text-amber-700 font-bold">
                <span className="w-3 h-0.5 border-t border-dashed border-amber-700" /> ₹300 Buffer
              </span>
            </div>
          </div>

          {/* Interactive Scaled SVG Chart */}
          <div className="relative h-72 w-full bg-paper rounded-lg border border-rule p-2 overflow-hidden select-none">
            <svg
              className="w-full h-full"
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              preserveAspectRatio="none"
              onMouseLeave={() => setHoveredDayIndex(null)}
              onMouseMove={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const xPos = ((e.clientX - rect.left) / rect.width) * svgWidth;
                if (xPos >= padLeft && xPos <= padLeft + plotWidth) {
                  const frac = (xPos - padLeft) / plotWidth;
                  const dayIdx = Math.min(60, Math.max(1, Math.round(frac * 59) + 1));
                  setHoveredDayIndex(dayIdx);
                } else {
                  setHoveredDayIndex(null);
                }
              }}
            >
              <defs>
                <pattern
                  id="breach-hatch"
                  width="10"
                  height="10"
                  patternTransform="rotate(45 0 0)"
                  patternUnits="userSpaceOnUse"
                >
                  <line x1="0" y1="0" x2="0" y2="10" stroke="#EF4444" strokeWidth="2" opacity="0.3" />
                </pattern>
              </defs>

              {/* Y Axis Grid and Labels */}
              <g className="text-[9px] font-mono" fill="#78716C">
                {/* Max tick */}
                <line
                  x1={padLeft}
                  y1={getYCoord(yDomainMax)}
                  x2={svgWidth - padRight}
                  y2={getYCoord(yDomainMax)}
                  stroke="#E7E5E4"
                  strokeWidth="1"
                />
                <text x="8" y={getYCoord(yDomainMax) + 4} fill="#78716C">
                  {formatPaise(yDomainMax)}
                </text>

                {/* ₹300 Safety Buffer Line */}
                <line
                  x1={padLeft}
                  y1={yBufferCoord}
                  x2={svgWidth - padRight}
                  y2={yBufferCoord}
                  stroke="#B45309"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                />
                <text x="8" y={yBufferCoord + 3} fill="#B45309" fontWeight="bold">
                  ₹300 Buffer
                </text>

                {/* ₹0 Zero Line */}
                <line
                  x1={padLeft}
                  y1={yZeroCoord}
                  x2={svgWidth - padRight}
                  y2={yZeroCoord}
                  stroke="#78716C"
                  strokeWidth="1.5"
                />
                <text x="8" y={yZeroCoord + 3} fill="#44403C" fontWeight="bold">
                  ₹0 Zero
                </text>

                {/* Min tick if negative */}
                {yDomainMin < 0 && (
                  <>
                    <line
                      x1={padLeft}
                      y1={getYCoord(yDomainMin)}
                      x2={svgWidth - padRight}
                      y2={getYCoord(yDomainMin)}
                      stroke="#FCA5A5"
                      strokeWidth="1"
                      strokeDasharray="2 2"
                    />
                    <text x="8" y={getYCoord(yDomainMin) - 2} fill="#DC2626">
                      {formatPaise(yDomainMin)}
                    </text>
                  </>
                )}
              </g>

              {/* Due Date 1 Vertical Marker */}
              {xDue1 !== null && (
                <g>
                  <line
                    x1={xDue1}
                    y1={padTop}
                    x2={xDue1}
                    y2={svgHeight - padBottom}
                    stroke="#D97706"
                    strokeWidth="1.5"
                    strokeDasharray="3 3"
                  />
                  <text
                    x={xDue1 - 25}
                    y={padTop - 6}
                    fill="#D97706"
                    fontSize="9"
                    fontFamily="monospace"
                    fontWeight="bold"
                  >
                    Due Date 1
                  </text>
                </g>
              )}

              {/* Due Date 2 Vertical Marker */}
              {xDue2 !== null && (
                <g>
                  <line
                    x1={xDue2}
                    y1={padTop}
                    x2={xDue2}
                    y2={svgHeight - padBottom}
                    stroke="#D97706"
                    strokeWidth="1.5"
                    strokeDasharray="3 3"
                  />
                  <text
                    x={xDue2 - 25}
                    y={padTop - 6}
                    fill="#D97706"
                    fontSize="9"
                    fontFamily="monospace"
                    fontWeight="bold"
                  >
                    Due Date 2
                  </text>
                </g>
              )}

              {/* Safe Baseline Polyline */}
              <polyline
                fill="none"
                stroke="#2F5D3A"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={safePolylinePoints}
              />

              {/* Stress Delay Polyline */}
              <polyline
                fill="none"
                stroke="#C8412B"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={stressPolylinePoints}
              />

              {/* X Axis Date Tick Labels */}
              <g className="text-[9px] font-mono" fill="#78716C">
                <text x={padLeft} y={svgHeight - 12} textAnchor="start">
                  Day 1 ({simResult.days[0]?.dateStr.substring(5)})
                </text>
                <text x={getXCoord(15)} y={svgHeight - 12} textAnchor="middle">
                  Day 15
                </text>
                <text x={getXCoord(30)} y={svgHeight - 12} textAnchor="middle">
                  Day 30
                </text>
                <text x={getXCoord(45)} y={svgHeight - 12} textAnchor="middle">
                  Day 45
                </text>
                <text x={svgWidth - padRight} y={svgHeight - 12} textAnchor="end">
                  Day 60 ({simResult.days[59]?.dateStr.substring(5)})
                </text>
              </g>

              {/* Interactive Hover Vertical Cursor & Points */}
              {hoveredDay && (
                <g>
                  <line
                    x1={getXCoord(hoveredDay.dayIndex)}
                    y1={padTop}
                    x2={getXCoord(hoveredDay.dayIndex)}
                    y2={svgHeight - padBottom}
                    stroke="#1C1917"
                    strokeWidth="1"
                    strokeDasharray="2 2"
                  />
                  {/* Safe Point */}
                  <circle
                    cx={getXCoord(hoveredDay.dayIndex)}
                    cy={getYCoord(hoveredDay.safeBalancePaise)}
                    r="4"
                    fill="#2F5D3A"
                    stroke="#FAF8F5"
                    strokeWidth="1.5"
                  />
                  {/* Stress Point */}
                  <circle
                    cx={getXCoord(hoveredDay.dayIndex)}
                    cy={getYCoord(hoveredDay.stressBalancePaise)}
                    r="4"
                    fill="#C8412B"
                    stroke="#FAF8F5"
                    strokeWidth="1.5"
                  />
                </g>
              )}
            </svg>

            {/* Interactive Tooltip Card */}
            {hoveredDay && (
              <div
                className="absolute top-3 right-3 pointer-events-none bg-paper/95 backdrop-blur-sm border border-rule shadow-md rounded-lg p-3 text-xs font-mono space-y-1.5 z-10 max-w-xs"
              >
                <div className="flex items-center justify-between border-b border-rule/60 pb-1">
                  <span className="font-bold text-ink">
                    Day {hoveredDay.dayIndex} ({formatDate(hoveredDay.dateStr)})
                  </span>
                  {hoveredDay.isDueDate && (
                    <span className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 text-[9px] font-bold">
                      DUE DATE
                    </span>
                  )}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-ledger-green font-semibold flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-ledger-green" /> Safe Balance:
                    </span>
                    <span className="font-bold text-ink">{formatPaise(hoveredDay.safeBalancePaise)}</span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-red-700 font-semibold flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-red-700" /> Stress Balance:
                    </span>
                    <span className="font-bold text-ink">{formatPaise(hoveredDay.stressBalancePaise)}</span>
                  </div>
                </div>

                {hoveredDay.events && hoveredDay.events.length > 0 && (
                  <div className="pt-1 border-t border-rule/50 space-y-0.5 text-[10px] text-ink-soft">
                    {hoveredDay.events.map((ev, i) => (
                      <div key={i} className="text-amber-800 font-sans">
                        • {ev}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Buffer Breach Warning & Safer Choices Recommendation */}
          {simResult.stressBreachedBuffer && simResult.saferChoices && (
            <div className="p-4 rounded-lg bg-red-50/70 border border-red-200 space-y-2 text-xs font-mono">
              <div className="flex items-center gap-1.5 text-red-800 font-bold">
                <AlertTriangle className="w-4 h-4" />
                <span>Stress Buffer Breach Detected ({formatDate(simResult.firstBufferBreachDateStr || "")})</span>
              </div>
              <p className="text-ink font-sans text-xs">
                Under a 7-day family allowance delay combined with P90 variable spend, balance drops below the ₹300 safety buffer.
              </p>
              <div className="p-2.5 rounded bg-paper border border-rule space-y-1">
                <span className="font-bold text-ink-soft text-[10px] uppercase block">Safer Choices</span>
                <p className="text-ink text-xs font-sans">{simResult.saferChoices.explanation}</p>
              </div>
            </div>
          )}
        </section>
      )}

      {/* Phase 7: Scenario Comparison Table */}
      {simResult && (
        <section className="p-6 rounded-xl bg-paper-2 border border-rule space-y-4">
          <div className="flex items-center justify-between border-b border-rule pb-3">
            <div>
              <h2 className="font-serif font-bold text-base text-ink">
                Scenario Comparison (60-Day Forward Forecast)
              </h2>
              <span className="text-[11px] text-ink-soft font-mono">
                Observed bank statement baseline compared with stress delay scenario
              </span>
            </div>
            <span className="text-[10px] font-mono px-2 py-1 rounded bg-paper border border-rule text-ink-soft">
              Deterministic Cash Flow Model
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs font-mono text-left border-collapse">
              <thead>
                <tr className="border-b border-rule text-ink-soft uppercase text-[10px]">
                  <th className="py-2.5 pr-4 font-semibold">Metric</th>
                  <th className="py-2.5 px-4 font-semibold text-ledger-green">Safe Baseline</th>
                  <th className="py-2.5 px-4 font-semibold text-red-700">Stress Delay</th>
                  <th className="py-2.5 pl-4 font-semibold text-ink">Differential / Impact</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-rule/60 text-ink">
                <tr>
                  <td className="py-2.5 pr-4 font-medium text-ink-soft">Verified Starting Balance</td>
                  <td className="py-2.5 px-4 font-bold">{formatPaise(simResult.startingBalancePaise)}</td>
                  <td className="py-2.5 px-4 font-bold">{formatPaise(simResult.startingBalancePaise)}</td>
                  <td className="py-2.5 pl-4 text-ink-soft">Identical starting state ({formatDate(simResult.startDateStr)})</td>
                </tr>

                <tr>
                  <td className="py-2.5 pr-4 font-medium text-ink-soft">Lowest Projected Balance</td>
                  <td className="py-2.5 px-4 font-bold text-ledger-green">
                    {formatPaise(simResult.minSafeBalancePaise)}
                    <span className="block text-[10px] text-ink-soft font-normal">on {formatDate(simResult.minSafeDateStr)}</span>
                  </td>
                  <td className="py-2.5 px-4 font-bold text-red-700">
                    {formatPaise(simResult.minStressBalancePaise)}
                    <span className="block text-[10px] text-ink-soft font-normal">on {formatDate(simResult.minStressDateStr)}</span>
                  </td>
                  <td className="py-2.5 pl-4 text-ink-soft font-medium">
                    Stress is {formatPaise(simResult.minSafeBalancePaise - simResult.minStressBalancePaise)} lower
                  </td>
                </tr>

                <tr>
                  <td className="py-2.5 pr-4 font-medium text-ink-soft">Due Date 1 (Pre-Repayment Balance)</td>
                  <td className="py-2.5 px-4">{formatPaise(simResult.preRepayment1SafePaise)}</td>
                  <td className="py-2.5 px-4">{formatPaise(simResult.preRepayment1StressPaise)}</td>
                  <td className="py-2.5 pl-4 text-ink-soft">Cash on hand before credit settlement</td>
                </tr>

                <tr>
                  <td className="py-2.5 pr-4 font-medium text-ink-soft">Due Date 1 (Post-Repayment Balance)</td>
                  <td className="py-2.5 px-4 font-semibold">{formatPaise(simResult.postRepayment1SafePaise)}</td>
                  <td className="py-2.5 px-4 font-semibold">{formatPaise(simResult.postRepayment1StressPaise)}</td>
                  <td className="py-2.5 pl-4 text-ink-soft">After repaying ₹{drawAmountRupees} draw</td>
                </tr>

                <tr>
                  <td className="py-2.5 pr-4 font-medium text-ink-soft">Days Below ₹300 Safety Buffer</td>
                  <td className="py-2.5 px-4 font-semibold">
                    {simResult.daysBelowBufferSafe === 0 ? (
                      <span className="text-ledger-green">0 days</span>
                    ) : (
                      <span className="text-amber-700">{simResult.daysBelowBufferSafe} days</span>
                    )}
                  </td>
                  <td className="py-2.5 px-4 font-semibold">
                    {simResult.daysBelowBufferStress === 0 ? (
                      <span className="text-ledger-green">0 days</span>
                    ) : (
                      <span className="text-red-700 font-bold">{simResult.daysBelowBufferStress} days</span>
                    )}
                  </td>
                  <td className="py-2.5 pl-4 text-ink-soft">
                    {simResult.firstBufferBreachDateStr ? `First breach: ${formatDate(simResult.firstBufferBreachDateStr)}` : "Buffer intact"}
                  </td>
                </tr>

                <tr>
                  <td className="py-2.5 pr-4 font-medium text-ink-soft">Days Below ₹0 (Negative Balance)</td>
                  <td className="py-2.5 px-4 font-semibold">
                    {simResult.daysBelowZeroSafe === 0 ? (
                      <span className="text-ledger-green">0 days</span>
                    ) : (
                      <span className="text-red-700 font-bold">{simResult.daysBelowZeroSafe} days</span>
                    )}
                  </td>
                  <td className="py-2.5 px-4 font-semibold">
                    {simResult.daysBelowZeroStress === 0 ? (
                      <span className="text-ledger-green">0 days</span>
                    ) : (
                      <span className="text-red-700 font-bold">{simResult.daysBelowZeroStress} days</span>
                    )}
                  </td>
                  <td className="py-2.5 pl-4 text-ink-soft">
                    {simResult.daysBelowZeroStress > 0 ? "Account would overdraw under delay" : "No overdraft"}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Plain-Language Regulatory & Responsible Finance Disclosure */}
          <div className="p-3.5 rounded-lg bg-paper border border-rule text-xs font-mono space-y-1 text-ink-soft">
            <div className="flex items-center gap-1.5 font-bold text-ink text-[11px] uppercase">
              <Info className="w-3.5 h-3.5 text-ledger-green" />
              <span>Responsible Finance Disclosure</span>
            </div>
            <p className="font-sans text-xs leading-relaxed text-ink">
              A positive balance alone does not establish affordability. The student may still have essential campus obligations or unrecorded off-ledger expenses not reflected in the uploaded statement. Projections are illustrative simulations under stated assumptions, not credit bureau scores or approval guarantees.
            </p>
          </div>
        </section>
      )}

      {/* Navigation Footer */}
      <div className="flex items-center justify-between pt-4">
        <NextLink href="/assess" className="text-xs text-ink-soft underline font-mono">
          Back to Day-1 Backtest
        </NextLink>

        <NextLink
          href="/offer"
          className="px-6 py-3 rounded-lg bg-ledger-green text-paper font-mono font-bold text-xs shadow hover:bg-[#23472c] transition-colors flex items-center gap-2"
        >
          <span>Next: Review Credit Offer</span>
          <ArrowRight className="w-4 h-4" />
        </NextLink>
      </div>
    </div>
  );
}
