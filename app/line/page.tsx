"use client";

import React, { useState } from "react";
import NextLink from "next/link";
import { useAuth } from "@/lib/supabase/auth-context";
import { useApp } from "@/lib/context/AppContext";
import { SimulationBadge } from "@/components/SimulationBadge";
import { formatPaise } from "@/lib/utils";
import {
  CreditCard,
  ArrowRight,
  TrendingUp,
  Clock,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Send,
  PauseCircle,
  HelpCircle,
  FileText,
} from "lucide-react";

export default function LineDashboardPage() {
  const { user } = useAuth();
  const { creditState, setCreditState, income, profile, transactions, isSandboxMode } = useApp();

  const [drawAmount, setDrawAmount] = useState<number>(300);
  const [coolingOffWarning, setCoolingOffWarning] = useState<string | null>(null);
  const [slipScenarioOn, setSlipScenarioOn] = useState<boolean>(false);
  const [activeMomentCard, setActiveMomentCard] = useState<{
    title: string;
    body: string;
    takeaway: string;
  } | null>(null);

  const [showStamp, setShowStamp] = useState<boolean>(false);
  const [slipModalStep, setSlipModalStep] = useState<"EARLY_WARNING" | "REMINDER" | "CHOICE" | "MISSED_DONE" | null>(null);

  const studentName = profile.name || user?.email?.split("@")[0] || "Student";
  const limit = creditState.limitPaise;
  const selfCap = creditState.selfSetCapPaise || limit;
  const outstanding = creditState.outstandingPaise;
  const available = creditState.availablePaise;
  const utilPercent = selfCap > 0 ? Math.round((outstanding / selfCap) * 100) : 0;
  const dueDay = income?.dueDate || 3;

  // If user has not activated credit line yet
  if (limit === 0 || creditState.state === "ELIGIBILITY") {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-ledger-green/10 text-ledger-green mx-auto flex items-center justify-center">
          <CreditCard className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h1 className="font-serif font-bold text-2xl sm:text-3xl text-ink">
            Starter Credit Line Inactive
          </h1>
          <p className="text-xs text-ink-soft max-w-md mx-auto leading-relaxed">
            {transactions.length > 0
              ? "Your cash flow assessment is ready. Review and accept your Starter Credit Offer to activate your revolving line."
              : "Link your bank statement to calculate your cash flow capacity and activate your starter line."}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2 font-mono text-xs">
          {transactions.length > 0 ? (
            <NextLink
              href="/offer"
              className="px-6 py-2.5 rounded-full bg-pin-red text-white font-bold text-xs hover:bg-pin-pressed transition-colors flex items-center gap-2 cursor-pointer"
            >
              <span>Review Starter Credit Offer</span>
              <ArrowRight className="w-4 h-4" />
            </NextLink>
          ) : (
            <>
              <NextLink
                href="/link"
                className="px-6 py-2.5 rounded-full bg-pin-red text-white font-bold text-xs hover:bg-pin-pressed transition-colors flex items-center gap-2 cursor-pointer"
              >
                <span>Link Bank Account</span>
                <ArrowRight className="w-4 h-4" />
              </NextLink>

              <NextLink
                href="/link"
                className="px-6 py-2.5 rounded-full bg-[#e5e5e0] hover:bg-[#dadad3] text-[#111110] font-medium text-xs border-transparent transition-colors flex items-center gap-2 cursor-pointer"
              >
                <FileText className="w-4 h-4 text-ink-soft" />
                <span>Upload Statement CSV</span>
              </NextLink>
            </>
          )}
        </div>
      </div>
    );
  }

  // Handle Draw Action
  const handleDraw = (e: React.FormEvent) => {
    e.preventDefault();
    const paiseToDraw = drawAmount * 100;
    if (paiseToDraw <= 0 || paiseToDraw > available) return;

    if (creditState.drawCountToday >= 2) {
      setCoolingOffWarning(
        "Cooling-off pause: Multiple draws detected today. Ascend pauses repeated draws for 30 minutes to prevent impulse borrowing. (Demo override available below)"
      );
      return;
    }

    setCreditState((prev) => ({
      ...prev,
      outstandingPaise: prev.outstandingPaise + paiseToDraw,
      availablePaise: prev.availablePaise - paiseToDraw,
      drawCountToday: prev.drawCountToday + 1,
      lastDrawTimestamp: Date.now(),
      state: "ACTIVE",
    }));

    setCoolingOffWarning(null);
  };

  // Time Travel: Advance One Cycle
  const handleAdvanceCycle = async () => {
    if (slipScenarioOn) {
      setSlipModalStep("EARLY_WARNING");
      return;
    }

    try {
      const res = await fetch("/api/cycle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          state: creditState,
          slipScenario: false,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setCreditState(data.nextState);
        setActiveMomentCard(data.momentCard || null);
        setShowStamp(true);
        setTimeout(() => setShowStamp(false), 3000);
      }
    } catch (err) {
      console.error("Cycle advance failed", err);
    }
  };

  // Handle Slip Ladder Choice
  const handleResolveSlip = async (action: "SHIFT_DUE_DATE" | "SPLIT_INSTALLMENTS" | "REPAY_ON_TIME" | "MISS_PAYMENT") => {
    try {
      const res = await fetch("/api/cycle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          state: creditState,
          slipScenario: true,
          slipAction: action,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setCreditState(data.nextState);
        setActiveMomentCard(data.momentCard || null);
        setSlipModalStep(null);
        if (action !== "MISS_PAYMENT") {
          setShowStamp(true);
          setTimeout(() => setShowStamp(false), 3000);
        }
      }
    } catch (err) {
      console.error("Slip resolution failed", err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-4 space-y-8 relative">
      {/* Ink Stamp Overlay on On-Time Repayment */}
      {showStamp && (
        <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
          <div className="w-56 h-56 rounded-full border-4 border-dashed border-ledger-green text-ledger-green flex flex-col items-center justify-center font-serif font-black tracking-widest uppercase bg-paper/90 shadow-2xl ink-stamp-animate">
            <span className="text-3xl">ON TIME</span>
            <span className="text-[11px] font-mono tracking-normal mt-1 text-ink">AUTOPAY SUCCESS</span>
            <span className="text-[10px] font-mono text-ledger-green font-bold mt-1">BUREAU REPORTED</span>
          </div>
        </div>
      )}

      {/* Header with State & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-rule pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-serif font-black text-2xl sm:text-3xl text-ink">
              My Starter Line
            </h1>
            <SimulationBadge
              label={isSandboxMode ? "SIMULATED LINE" : "ACTIVE ROTATING LINE"}
              size="sm"
            />
          </div>
          <p className="text-xs text-ink-soft mt-1">
            Current Cycle #{creditState.cycleNumber + 1} | Partner: LendPartner Finance (SIMULATED)
          </p>
        </div>

        <NextLink
          href="/score"
          className="px-4 py-2 rounded-full bg-[#e5e5e0] hover:bg-[#dadad3] text-[#111110] font-mono text-xs font-bold transition-colors flex items-center gap-1.5 self-start sm:self-auto"
        >
          <span>View Credit Progress</span>
          <ArrowRight className="w-4 h-4" />
        </NextLink>
      </div>

      {/* Disbursal Flow Strip */}
      <div className="p-3.5 rounded-2xl bg-white border border-rule text-xs font-mono">
        <span className="text-[10px] font-bold text-ink-soft uppercase block mb-1">
          Regulated Disbursal Flow (Direct to Account)
        </span>
        <div className="flex items-center gap-2 text-ink flex-wrap text-[11px]">
          <span className="px-2 py-0.5 rounded-full bg-slate-100 border border-rule font-bold">LendPartner Finance</span>
          <span>→ Direct Transfer →</span>
          <span className="px-2 py-0.5 rounded-full bg-slate-100 border border-rule font-bold">{studentName}'s Bank Account</span>
          <span>→ UPI QR →</span>
          <span className="px-2 py-0.5 rounded-full bg-slate-100 border border-rule font-bold">Campus Spend</span>
        </div>
      </div>

      {/* Main Metrics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
        <div className="p-4 rounded-2xl bg-white border border-rule space-y-1">
          <span className="text-ink-soft text-[10px] block">Outstanding Balance</span>
          <span className="font-serif font-black text-2xl text-vermilion block">
            {formatPaise(outstanding)}
          </span>
          <span className="text-[10px] text-ink-soft block font-sans">Due on day {dueDay}</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-rule space-y-1">
          <span className="text-ink-soft text-[10px] block">Available to Draw</span>
          <span className="font-serif font-black text-2xl text-ledger-green block">
            {formatPaise(available)}
          </span>
          <span className="text-[10px] text-ink-soft block font-sans">Self-set cap: {formatPaise(selfCap)}</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-rule space-y-1">
          <span className="text-ink-soft text-[10px] block">Utilisation Rate</span>
          <span
            className={`font-serif font-black text-2xl block ${
              utilPercent >= 60 ? "text-vermilion" : "text-ink"
            }`}
          >
            {utilPercent}%
          </span>
          <span className="text-[10px] text-ink-soft block font-sans">
            {utilPercent >= 60 ? "Alert: Over 60%" : "Under safe 50%"}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-rule space-y-1">
          <span className="text-ink-soft text-[10px] block">AutoPay Mandate</span>
          <span className="font-serif font-bold text-base text-ledger-green block mt-1">
            ACTIVE (SIMULATED)
          </span>
          <span className="text-[10px] text-ink-soft block font-sans">2 days after regular income</span>
        </div>
      </div>

      {/* Utilisation Alert Banner */}
      {utilPercent >= 60 && (
        <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-xs font-mono text-ink flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-vermilion shrink-0 mt-0.5" />
          <div>
            <strong className="text-red-800">Utilisation Alert (60%+):</strong> You have drawn {utilPercent}% of
            your starter cap. Keeping utilisation below 50% builds a stronger bureau vintage file.
          </div>
        </div>
      )}

      {/* Draw Action Strip */}
      <section className="p-5 rounded-2xl bg-white border border-rule space-y-4">
        <div>
          <h2 className="font-serif font-bold text-base text-ink">Draw to Your UPI Account</h2>
          <p className="text-xs text-ink-soft mt-0.5">
            Instant transfer from LendPartner to your verified bank account.
          </p>
        </div>

        <form onSubmit={handleDraw} className="flex flex-col sm:flex-row items-center gap-3 text-xs font-mono">
          <div className="flex-1 w-full relative">
            <span className="absolute left-3 top-2.5 text-ink-soft font-bold">₹</span>
            <input
              type="number"
              min="50"
              max={available / 100}
              step="50"
              value={drawAmount}
              onChange={(e) => setDrawAmount(Number(e.target.value))}
              disabled={available <= 0}
              className="w-full pl-7 pr-3 py-2 rounded-xl bg-slate-100 border border-rule text-ink font-bold focus:outline-none focus:ring-1 focus:ring-ink"
            />
          </div>

          <button
            type="submit"
            disabled={available <= 0 || drawAmount * 100 > available}
            className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-pin-red text-white font-bold hover:bg-pin-pressed disabled:opacity-40 transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Draw ₹{drawAmount}</span>
          </button>
        </form>

        {coolingOffWarning && (
          <div className="p-3.5 rounded-2xl bg-marigold/10 border border-marigold text-xs font-mono text-ink space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-ink">
              <PauseCircle className="w-4 h-4 text-marigold" />
              <span>{coolingOffWarning}</span>
            </div>
            <button
              onClick={() => {
                setCreditState((prev) => ({ ...prev, drawCountToday: 0 }));
                setCoolingOffWarning(null);
              }}
              className="text-[10px] underline font-bold text-ink hover:text-ledger-green cursor-pointer"
            >
              Demo: Override cooling-off timer
            </button>
          </div>
        )}
      </section>

      {/* Time-Travel Control & Slip Scenario Scrubber */}
      <section className="p-6 rounded-2xl bg-white border border-rule space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-rule pb-3">
          <div>
            <span className="font-mono text-xs font-bold text-ledger-green uppercase tracking-wider block">
              Time Travel Scrubber (Signature Demonstration)
            </span>
            <h2 className="font-serif font-black text-xl text-ink">Advance One Cycle (30 Days)</h2>
          </div>

          <label className="flex items-center gap-2.5 cursor-pointer bg-slate-100 p-2.5 rounded-2xl border border-rule select-none">
            <input
              type="checkbox"
              checked={slipScenarioOn}
              onChange={(e) => setSlipScenarioOn(e.target.checked)}
              className="w-4 h-4 accent-ledger-green cursor-pointer"
            />
            <div className="font-mono text-xs">
              <span className="font-bold text-ink block">Simulate Repayment Stress</span>
              <span className="text-[10px] text-ink-soft">Test responsible slip ladder</span>
            </div>
          </label>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs font-mono">
          <div className="space-y-1">
            <p className="text-ink-soft font-sans">
              Turns the ledger page by 30 days. Triggers AutoPay collection, bureau reporting, and history updates.
            </p>
            {slipScenarioOn ? (
              <span className="text-vermilion font-bold block">
                Scenario Mode: Allowance is delayed by 7 days.
              </span>
            ) : (
              <span className="text-ledger-green font-bold block">
                Scenario Mode: Normal on-time AutoPay execution.
              </span>
            )}
          </div>

          <button
            onClick={handleAdvanceCycle}
            className="px-6 py-2.5 rounded-full bg-pin-red text-white font-bold hover:bg-pin-pressed transition-transform active:scale-95 flex items-center gap-2 shrink-0 cursor-pointer"
          >
            <Clock className="w-4 h-4" />
            <span>Turn Ledger Page (Advance Cycle)</span>
          </button>
        </div>
      </section>

      {/* Moment Card */}
      {activeMomentCard && (
        <div className="p-4 rounded-2xl bg-white border border-ledger-green/40 space-y-2 animate-in fade-in duration-300">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-marigold" />
              <h3 className="font-serif font-bold text-sm text-ink">{activeMomentCard.title}</h3>
            </div>
            <button
              onClick={() => setActiveMomentCard(null)}
              className="text-xs text-ink-soft font-mono hover:text-ink cursor-pointer"
            >
              Dismiss
            </button>
          </div>
          <p className="text-xs text-ink font-sans leading-relaxed">{activeMomentCard.body}</p>
          <div className="pt-1 text-[11px] font-mono text-ledger-green font-bold">
            Takeaway: {activeMomentCard.takeaway}
          </div>
        </div>
      )}

      {/* Slip Scenario Ladder Modal */}
      {slipModalStep && (
        <div className="fixed inset-0 z-50 bg-ink/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-[32px] border border-rule shadow-2xl p-6 space-y-5 animate-in zoom-in-95 duration-200">
            {slipModalStep === "EARLY_WARNING" && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-vermilion">
                  <AlertTriangle className="w-5 h-5" />
                  <h3 className="font-serif font-bold text-lg text-ink">Early Warning (3 Days Prior)</h3>
                </div>
                <p className="text-xs text-ink-soft leading-relaxed font-sans">
                  Our cash flow forecast shows your monthly deposit is arriving 7 days late. AutoPay for ₹
                  {outstanding / 100} is due on day {dueDay}.
                </p>
                <div className="p-3 rounded-xl bg-slate-100 border border-rule text-xs font-mono space-y-1">
                  <span className="font-bold text-ink block">Zero Harassment Guarantee:</span>
                  <span className="text-[11px] text-ink-soft">
                    Ascend never calls parents, contacts, or employers. You have structured assistance choices below.
                  </span>
                </div>
                <div className="flex justify-end gap-2 pt-2 font-mono text-xs">
                  <button
                    onClick={() => setSlipModalStep("CHOICE")}
                    className="px-4 py-2 rounded-full bg-ink text-white font-bold hover:bg-slate-800 cursor-pointer"
                  >
                    View Assistance Options
                  </button>
                </div>
              </div>
            )}

            {slipModalStep === "CHOICE" && (
              <div className="space-y-4 text-xs font-mono">
                <div>
                  <h3 className="font-serif font-bold text-lg text-ink">Cash Squeeze Choice</h3>
                  <p className="text-ink-soft mt-0.5 font-sans">
                    Pick a structured repayment plan to protect your credit history from damage.
                  </p>
                </div>

                <div className="space-y-2">
                  <button
                    onClick={() => handleResolveSlip("SHIFT_DUE_DATE")}
                    className="w-full p-3 rounded-xl border border-rule bg-white hover:bg-slate-100 text-left transition-colors cursor-pointer"
                  >
                    <span className="font-bold text-ink block">1. One-Time Due Date Shift (7 Days)</span>
                    <span className="text-[11px] text-ink-soft font-sans">
                      Aligns repayment with delayed income arrival. Zero fee.
                    </span>
                  </button>

                  <button
                    onClick={() => handleResolveSlip("SPLIT_INSTALLMENTS")}
                    className="w-full p-3 rounded-xl border border-rule bg-white hover:bg-slate-100 text-left transition-colors cursor-pointer"
                  >
                    <span className="font-bold text-ink block">2. Split into Two Instalments</span>
                    <span className="text-[11px] text-ink-soft font-sans">
                      Pay ₹{Math.round(outstanding / 200)} now and remainder next week.
                    </span>
                  </button>

                  <button
                    onClick={() => handleResolveSlip("REPAY_ON_TIME")}
                    className="w-full p-3 rounded-xl border border-ledger-green/40 bg-ledger-green/5 hover:bg-ledger-green/10 text-left transition-colors cursor-pointer"
                  >
                    <span className="font-bold text-ledger-green block">3. Clear in Full Right Now</span>
                    <span className="text-[11px] text-ink-soft font-sans">
                      Use available cash reserve to settle on schedule.
                    </span>
                  </button>

                  <button
                    onClick={() => handleResolveSlip("MISS_PAYMENT")}
                    className="w-full p-3 rounded-xl border border-red-200 bg-red-50/50 hover:bg-red-100/50 text-left transition-colors cursor-pointer"
                  >
                    <span className="font-bold text-vermilion block">4. Miss Payment Anyway (Stress Demo)</span>
                    <span className="text-[11px] text-ink-soft font-sans">
                      Partner applies flat ₹50 fee, draws paused, bureau impact recorded. Never calls family.
                    </span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Cycle History Table */}
      <section className="space-y-3">
        <h3 className="font-serif font-bold text-lg text-ink">Cycle History Records</h3>
        {creditState.cycleHistory.length === 0 ? (
          <div className="p-6 rounded-2xl bg-white border border-rule text-center text-xs font-mono text-ink-soft">
            No completed cycles yet. Draw funds and use the Time Travel Scrubber to advance your first cycle.
          </div>
        ) : (
          <div className="border border-rule rounded-2xl bg-white overflow-hidden">
            <table className="w-full text-xs font-mono divide-y divide-rule text-left">
              <thead className="bg-[#f6f6f3] text-[11px] text-ink-soft uppercase tracking-wider">
                <tr>
                  <th className="p-2.5">Cycle #</th>
                  <th className="p-2.5 text-right">Drawn</th>
                  <th className="p-2.5 text-right">Repaid</th>
                  <th className="p-2.5">Status</th>
                  <th className="p-2.5">Bureau Record</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-rule/60">
                {creditState.cycleHistory.map((c) => (
                  <tr key={c.cycleNumber} className="hover:bg-slate-50">
                    <td className="p-2.5 font-bold text-ink">Cycle #{c.cycleNumber}</td>
                    <td className="p-2.5 text-right">{formatPaise(c.drawnPaise)}</td>
                    <td className="p-2.5 text-right font-bold">{formatPaise(c.repaidPaise)}</td>
                    <td className="p-2.5">
                      {c.onTime ? (
                        <span className="px-1.5 py-0.5 rounded-full bg-ledger-green/10 text-ledger-green font-bold text-[10px]">
                          ON TIME
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.5 rounded-full bg-red-100 text-red-800 font-bold text-[10px]">
                          MISSED (+₹50 LATE FEE)
                        </span>
                      )}
                    </td>
                    <td className="p-2.5 text-ink-soft text-[11px]">
                      {c.onTime ? "Reported Positive Tick" : "Reported Overdue Flag"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
