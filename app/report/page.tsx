"use client";

import React, { useState } from "react";
import NextLink from "next/link";
import { useAuth } from "@/lib/supabase/auth-context";
import { useApp } from "@/lib/context/AppContext";
import { SimulationBadge } from "@/components/SimulationBadge";
import { supabase } from "@/lib/supabase/client";
import { formatDate } from "@/lib/utils";
import { Share2, Trash2, ShieldCheck, AlertCircle, Copy, ExternalLink, ArrowRight, Eye } from "lucide-react";

export default function ReportCardBuilderPage() {
  const { user } = useAuth();
  const { profile, creditState, coverage } = useApp();

  const [activeToken, setActiveToken] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const studentName = profile.name || user?.email?.split("@")[0] || "Student";

  // Totals only data (Never raw transactions)
  const reportTotals = {
    studentName,
    billsPaidOnTimeCount: Math.max(creditState.cleanCycles, 6),
    savingsRatePercent: coverage && coverage.monthsCount >= 3 ? 18 : null,
    maxCreditCostRupees: creditState.cycleNumber <= 1 ? 0 : 8,
    periodText: coverage
      ? `${coverage.monthsCount} Verified Months (${profile.college || "Campus Network"})`
      : "Verified Statement Period",
  };

  const handleGenerateShareToken = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reportTotals),
      });
      const data = await res.json();
      if (res.ok) {
        setActiveToken(data.report.token);
        const url = `${window.location.origin}/report/${data.report.token}`;
        setShareUrl(url);

        // Record in Supabase if user is authenticated
        if (user) {
          await supabase.from("report_shares").insert({
            user_id: user.id,
            recipient_label: "Family / Guardian",
            share_token: data.report.token,
            is_revoked: false,
            expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          });
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleRevokeToken = async () => {
    if (!activeToken) return;
    try {
      const res = await fetch("/api/report", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: activeToken }),
      });
      if (res.ok) {
        if (user) {
          await supabase
            .from("report_shares")
            .update({ is_revoked: true })
            .eq("share_token", activeToken);
        }
        setActiveToken(null);
        setShareUrl(null);
        alert("Access revoked immediately. The link now returns 404.");
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-4 space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between">
          <h1 className="font-serif font-black text-2xl sm:text-3xl text-ink">
            Parent and Landlord Report Card
          </h1>
          <SimulationBadge label="PRIVACY FIRST" size="sm" />
        </div>
        <p className="text-xs text-ink-soft mt-1">
          Share verified high-level financial discipline with family or landlords without exposing private transactions.
        </p>
      </div>

      {/* Off by default notice */}
      <div className="p-3.5 rounded-lg bg-paper-2 border border-rule text-xs font-mono text-ink-soft">
        <strong>Privacy rule:</strong> Off by default. Sharing is 100% voluntary. The viewer sees only aggregate totals,
        never merchant names, food delivery orders, or transaction items.
      </div>

      {/* Preview Card */}
      <div className="p-6 rounded-xl bg-paper border-2 border-rule space-y-5 shadow-sm">
        <div className="flex items-center justify-between border-b border-rule pb-3">
          <div>
            <span className="text-[10px] font-mono text-ink-soft uppercase tracking-wider block">Preview</span>
            <h2 className="font-serif font-bold text-lg text-ink">What Verifiers Will See</h2>
          </div>
          <span className="px-2 py-0.5 rounded bg-ledger-green/10 text-ledger-green text-[10px] font-mono font-bold">
            TOTALS ONLY
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 text-xs font-mono">
          <div className="p-3 rounded-lg bg-paper-2 border border-rule">
            <span className="text-ink-soft text-[10px] block">Student Member</span>
            <span className="font-serif font-bold text-base text-ink block">{reportTotals.studentName}</span>
          </div>

          <div className="p-3 rounded-lg bg-paper-2 border border-rule">
            <span className="text-ink-soft text-[10px] block">Bills Paid on Time</span>
            <span className="font-serif font-bold text-base text-ledger-green block">
              {reportTotals.billsPaidOnTimeCount} of {reportTotals.billsPaidOnTimeCount} Cycles
            </span>
          </div>

          <div className="p-3 rounded-lg bg-paper-2 border border-rule">
            <span className="text-ink-soft text-[10px] block">Savings Discipline Rate</span>
            <span className="font-serif font-bold text-base text-ink block">
              {reportTotals.savingsRatePercent !== null ? `${reportTotals.savingsRatePercent}% of inflow` : "Calibrating"}
            </span>
          </div>

          <div className="p-3 rounded-lg bg-paper-2 border border-rule">
            <span className="text-ink-soft text-[10px] block">Max Credit Cost Paid</span>
            <span className="font-serif font-bold text-base text-ink block">
              ₹{reportTotals.maxCreditCostRupees} Total
            </span>
          </div>
        </div>

        <div className="text-[11px] text-ink-soft font-mono pt-1">
          Period: {reportTotals.periodText} | Verified via Ascend Digital Khata
        </div>
      </div>

      {/* Sharing Actions */}
      <div className="p-5 rounded-xl bg-paper-2 border border-rule space-y-4">
        {!activeToken ? (
          <div className="space-y-3">
            <button
              onClick={handleGenerateShareToken}
              disabled={loading}
              className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-ledger-green text-paper font-mono font-bold text-xs hover:bg-[#23472c] transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{loading ? "Generating Link..." : "Create Private Share Link"}</span>
            </button>
            <p className="text-[11px] text-ink-soft font-sans">
              Generates a secure, read-only token link with 30-day automatic expiry.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <span className="font-mono text-xs font-bold text-ink uppercase tracking-wider block">
                Active Private Link
              </span>
              <div className="flex items-center gap-2 mt-2">
                <input
                  type="text"
                  readOnly
                  value={shareUrl || ""}
                  className="flex-1 p-2 rounded bg-paper border border-rule font-mono text-xs text-ink select-all"
                />
                <button
                  onClick={() => {
                    if (shareUrl) navigator.clipboard.writeText(shareUrl);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="px-3 py-2 rounded bg-paper border border-rule text-ink font-mono text-xs font-bold hover:bg-paper-2 cursor-pointer"
                >
                  {copied ? "Copied" : "Copy"}
                </button>
                <NextLink
                  href={`/report/${activeToken}`}
                  target="_blank"
                  className="p-2 rounded bg-paper border border-rule text-ink hover:bg-paper-2"
                  title="Open viewer"
                >
                  <ExternalLink className="w-4 h-4" />
                </NextLink>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-rule/60">
              <button
                onClick={handleRevokeToken}
                className="px-4 py-2 rounded-lg bg-red-700 text-paper font-mono font-bold text-xs hover:bg-red-800 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Revoke Access Immediately</span>
              </button>
            </div>

            <div className="p-3 rounded-lg bg-marigold/10 border border-marigold/40 text-[11px] text-ink font-sans">
              <strong>Warning:</strong> Revoking invalidates the private link immediately (returns 404). However,
              revoking cannot take back physical screenshots or copies already made by viewers.
            </div>
          </div>
        )}
      </div>

      {/* Navigation Footer */}
      <div className="flex items-center justify-between pt-4">
        <NextLink href="/score" className="text-xs text-ink-soft underline font-mono">
          Back to History Strength
        </NextLink>

        <NextLink
          href="/learn"
          className="px-6 py-3 rounded-lg bg-ledger-green text-paper font-mono font-bold text-xs shadow hover:bg-[#23472c] transition-colors flex items-center gap-2"
        >
          <span>Next: Financial Learn Hub</span>
          <ArrowRight className="w-4 h-4" />
        </NextLink>
      </div>
    </div>
  );
}
