"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import NextLink from "next/link";
import { useAuth } from "@/lib/supabase/auth-context";
import { useApp } from "@/lib/context/AppContext";
import { SimulationBadge } from "@/components/SimulationBadge";
import { calculateCostCard } from "@/lib/engine/cost";
import { formatPaise } from "@/lib/utils";
import { ShieldCheck, CheckSquare, Square, ArrowRight, FileCheck, CheckCircle2, FileText } from "lucide-react";

export default function OfferPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { limitAssessment, creditState, setCreditState, income, profile, transactions, isSandboxMode } = useApp();

  const ceilingLimit = limitAssessment?.finalLimitPaise || 50000;
  const [selfSetCapPaise, setSelfSetCapPaise] = useState<number>(creditState.selfSetCapPaise || ceilingLimit);
  const [bureauAck, setBureauAck] = useState<boolean>(false);
  const [receiptSigned, setReceiptSigned] = useState<boolean>(false);

  const studentName = profile.name || user?.email?.split("@")[0] || "Student";
  const costCard = calculateCostCard(selfSetCapPaise, 1, income?.dueDate || 3);

  if (transactions.length === 0) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-ledger-green/10 text-ledger-green mx-auto flex items-center justify-center">
          <FileCheck className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h1 className="font-serif font-bold text-2xl sm:text-3xl text-ink">
            No Credit Offer Available Yet
          </h1>
          <p className="text-xs text-ink-soft max-w-md mx-auto leading-relaxed">
            Starter credit lines are issued after assessing your verified bank transactions. Link your bank account or upload a statement to generate your personalized offer.
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
      </div>
    );
  }

  const handleAcceptOffer = () => {
    if (!bureauAck || !receiptSigned) return;

    setCreditState((prev) => ({
      ...prev,
      state: "ACTIVE",
      limitPaise: ceilingLimit,
      selfSetCapPaise,
      availablePaise: selfSetCapPaise,
      outstandingPaise: 0,
      cycleNumber: 0,
    }));

    router.push("/line");
  };

  return (
    <div className="max-w-2xl mx-auto py-4 space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between">
          <h1 className="font-serif font-bold text-2xl sm:text-3xl text-ink">
            Your Starter Credit Offer
          </h1>
          <SimulationBadge label={isSandboxMode ? "SIMULATED PARTNER OFFER" : "REGULATED OFFER"} size="sm" />
        </div>
        <p className="text-xs text-ink-soft mt-1">
          Approved by LendPartner Finance based on your verified cash flow.
        </p>
      </div>

      {/* Regulated Partner Banner */}
      <div className="p-3.5 rounded-2xl bg-white border border-rule text-xs font-mono text-ink-soft">
        Loan is issued and held by LendPartner Finance (SIMULATED). Ascend is a technology platform and not a lender.
      </div>

      {/* Self-Set Cap Control */}
      <div className="p-5 rounded-2xl bg-white border border-rule space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="font-mono text-xs font-bold text-ink uppercase tracking-wider block">
              Self-Set Borrowing Cap
            </span>
            <p className="text-[11px] text-ink-soft font-sans">
              Choose your personal ceiling below the approved line.
            </p>
          </div>
          <span className="font-serif font-black text-2xl text-ink">
            {formatPaise(selfSetCapPaise)}
          </span>
        </div>

        <input
          type="range"
          min="10000"
          max={ceilingLimit}
          step="5000"
          value={selfSetCapPaise}
          onChange={(e) => setSelfSetCapPaise(Number(e.target.value))}
          className="w-full accent-ledger-green cursor-pointer"
        />

        <div className="flex justify-between text-[10px] font-mono text-ink-soft">
          <span>₹100 (Minimum)</span>
          <span>Approved Ceiling: {formatPaise(ceilingLimit)}</span>
        </div>
      </div>

      {/* Cost Card Receipt */}
      <div className="relative border border-rule rounded-2xl bg-white overflow-hidden">
        <div className="h-4 bg-slate-100 border-b border-rule receipt-perforation-top" />

        <div className="p-6 space-y-6 font-mono text-xs">
          <div className="text-center space-y-1 border-b border-rule/60 pb-4">
            <span className="text-[10px] tracking-widest uppercase text-ink-soft font-bold block">
              ASCEND COST CARD RECEIPT
            </span>
            <h2 className="font-serif font-bold text-xl text-ink">Plain-Language Disclosure</h2>
            <p className="text-[11px] text-ink-soft font-sans">
              No hidden processing fees, no insurance charges, no compounding penalty interest.
            </p>
          </div>

          {/* Line Items */}
          <div className="space-y-3">
            <div className="flex justify-between items-center py-1 border-b border-rule/30">
              <span className="text-ink">Amount You Get (Principal):</span>
              <span className="font-bold text-ink">{formatPaise(costCard.drawAmountPaise)}</span>
            </div>

            <div className="flex justify-between items-center py-1 border-b border-rule/30">
              <div>
                <span className="text-ink block">Cost If Repaid on Due Date:</span>
                <span className="text-[10px] text-ledger-green">Cycle 1 interest-free starter offer</span>
              </div>
              <span className="font-bold text-ledger-green">₹0 Free</span>
            </div>

            <div className="flex justify-between items-center py-1 border-b border-rule/30">
              <span className="text-ink">Payment Due Date:</span>
              <span className="font-bold text-ink">{costCard.dueDateFormatted}</span>
            </div>

            <div className="flex justify-between items-center py-1 border-b border-rule/30">
              <div>
                <span className="text-ink block">Cost If Repaid Late:</span>
                <span className="text-[10px] text-ink-soft">One-time flat partner fee (never compounding)</span>
              </div>
              <span className="font-bold text-ink">₹50 Flat</span>
            </div>

            <div className="flex justify-between items-center py-1 border-b border-rule/30">
              <span className="text-vermilion font-bold">Ascend Revenue from Late Fees:</span>
              <span className="font-bold text-vermilion">Hard ₹0 Zero</span>
            </div>

            <div className="flex justify-between items-center py-1 border-b border-rule/30">
              <span className="text-ink">Annual Rate Comparison:</span>
              <span className="text-[11px] text-ink-soft font-sans text-right">
                {costCard.annualRateExplanation}
              </span>
            </div>
          </div>

          {/* Double-Rule Receipt Total */}
          <div className="pt-2 double-rule-total flex justify-between items-center text-sm">
            <span className="font-bold text-ink">Worst-Case Repayment Total:</span>
            <span className="font-black text-ink">{formatPaise(costCard.lateFeeTotalPaise)}</span>
          </div>

          {/* Bureau Notice */}
          <div className="p-3 rounded-xl bg-slate-100 border border-rule text-[11px] font-sans text-ink space-y-1">
            <span className="font-mono text-[10px] font-bold text-ink-soft uppercase block">Bureau Impact</span>
            <p>{costCard.bureauNotice}</p>
          </div>

          {/* Sign Receipt Control */}
          <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-rule/60">
            <label className="flex items-center gap-2 cursor-pointer text-ink font-mono text-xs select-none">
              <input
                type="checkbox"
                checked={receiptSigned}
                onChange={(e) => setReceiptSigned(e.target.checked)}
                className="w-4 h-4 accent-ledger-green cursor-pointer"
              />
              <span className="font-bold">I have read and signed this Cost Card receipt</span>
            </label>

            {receiptSigned && (
              <span className="font-hand text-base text-ledger-green font-bold">
                Signed by {studentName}
              </span>
            )}
          </div>
        </div>

        <div className="h-4 bg-slate-100 border-t border-rule receipt-perforation-bottom" />
      </div>

      {/* Mandatory Bureau Acknowledgement Checkbox */}
      <div className="p-4 rounded-2xl bg-white border border-rule space-y-3 text-xs">
        <label className="flex items-start gap-2.5 cursor-pointer text-ink select-none">
          <input
            type="checkbox"
            checked={bureauAck}
            onChange={(e) => setBureauAck(e.target.checked)}
            className="w-4 h-4 accent-ledger-green shrink-0 mt-0.5 cursor-pointer"
          />
          <div className="font-sans leading-tight">
            <span className="font-bold block">Mandatory Bureau Reporting Acknowledgment</span>
            <span className="text-ink-soft text-[11px] mt-0.5 block">
              I understand that on-time repayments will be reported to the credit bureau to build my verified file, and missed repayments will negatively affect my formal record.
            </span>
          </div>
        </label>
      </div>

      {/* Action Button */}
      <div className="flex items-center justify-between pt-2">
        <button
          onClick={() => router.push("/simulator")}
          className="text-xs text-ink-soft underline font-mono cursor-pointer"
        >
          Back to Simulator
        </button>

        <button
          onClick={handleAcceptOffer}
          disabled={!bureauAck || !receiptSigned}
          className="px-8 py-3.5 rounded-full bg-pin-red text-white font-bold text-xs hover:bg-pin-pressed disabled:opacity-40 transition-colors flex items-center gap-2 cursor-pointer"
        >
          <span>Accept Starter Line ({formatPaise(selfSetCapPaise)})</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
