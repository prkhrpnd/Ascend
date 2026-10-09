"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { ReportCardData } from "@/lib/report/store";
import { ShieldCheck, CheckCircle2, AlertCircle, FileText, Lock } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function ReportViewerPage() {
  const params = useParams();
  const token = params.token as string;

  const [report, setReport] = useState<ReportCardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetch(`/api/report/${token}`)
      .then((res) => {
        if (!res.ok) {
          setNotFound(true);
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data && data.report) {
          setReport(data.report);
        }
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) {
    return (
      <div className="py-20 text-center font-mono text-xs text-ink-soft">
        Verifying private token...
      </div>
    );
  }

  if (notFound || !report) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-vermilion/10 text-vermilion flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h1 className="font-serif font-black text-2xl text-ink">404: Report Access Revoked</h1>
        <p className="text-xs text-ink-soft leading-relaxed font-sans">
          This report card link has either expired after 30 days or access was voluntarily revoked by the student.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto py-8 space-y-6">
      {/* Brand & Viewer Ribbon */}
      <div className="text-center space-y-1">
        <span className="font-serif font-black text-2xl text-ink">Ascend</span>
        <p className="text-[11px] font-mono text-ink-soft">
          Verified Student Discipline Report Card (Read-Only)
        </p>
      </div>

      {/* Main Totals Card */}
      <div className="p-6 rounded-xl bg-paper border-2 border-rule space-y-6 shadow-sm font-mono text-xs">
        <div className="flex items-center justify-between border-b border-rule pb-3">
          <div>
            <span className="text-[10px] text-ink-soft uppercase block">Member</span>
            <h2 className="font-serif font-bold text-xl text-ink">{report.studentName}</h2>
          </div>
          <span className="px-2 py-0.5 rounded bg-ledger-green/10 text-ledger-green font-bold text-[10px]">
            ACTIVE FILE
          </span>
        </div>

        <div className="space-y-4">
          <div className="p-3.5 rounded bg-paper-2 border border-rule flex justify-between items-center">
            <span className="text-ink">Bills Paid on Time:</span>
            <span className="font-bold text-ledger-green text-base">
              {report.billsPaidOnTimeCount} of {report.billsPaidOnTimeCount} Bills
            </span>
          </div>

          <div className="p-3.5 rounded bg-paper-2 border border-rule flex justify-between items-center">
            <span className="text-ink">Savings Discipline Rate:</span>
            <span className="font-bold text-ink text-base">
              {report.savingsRatePercent !== null ? `${report.savingsRatePercent}% of monthly inflow` : "Calibrating"}
            </span>
          </div>

          <div className="p-3.5 rounded bg-paper-2 border border-rule flex justify-between items-center">
            <span className="text-ink">Total Starter Credit Cost:</span>
            <span className="font-bold text-ink text-base">₹{report.maxCreditCostRupees} Total</span>
          </div>
        </div>

        <div className="pt-2 border-t border-rule/60 text-[11px] text-ink-soft space-y-1 font-sans">
          <p><strong>Period:</strong> {report.periodText}</p>
          <p><strong>Last Updated:</strong> {formatDate(report.lastUpdated)}</p>
          <p className="text-[10px] text-ink-soft/80 pt-1">
            Privacy Guarantee: Ascend never discloses individual merchant narrations, bank account numbers, or line-item purchases to third parties.
          </p>
        </div>
      </div>
    </div>
  );
}
