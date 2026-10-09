"use client";

import React, { useState, useEffect } from "react";
import { useApp } from "@/lib/context/AppContext";
import { SimulationBadge } from "@/components/SimulationBadge";
import { ShieldCheck, Trash2, Ban, EyeOff, RotateCcw, CheckCircle2 } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface AuditLog {
  id: string;
  action: string;
  details: string;
  timestamp: string;
}

export default function PrivacyPage() {
  const { consents, setConsents, resetSession, transactions } = useApp();
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  useEffect(() => {
    fetch("/api/report")
      .then((r) => r.json())
      .then((d) => {
        if (d.auditLogs) setAuditLogs(d.auditLogs);
      })
      .catch(() => {});
  }, []);

  const handleDeleteStatement = () => {
    if (confirm("Are you sure you want to delete all uploaded bank statement records from this browser session?")) {
      resetSession();
      alert("All transaction records have been purged from browser storage.");
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-4 space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between">
          <h1 className="font-serif font-black text-2xl sm:text-3xl text-ink">
            Privacy and Consent Governance
          </h1>
          <SimulationBadge label="DPDP COMPLIANT" size="sm" />
        </div>
        <p className="text-xs text-ink-soft mt-1">
          Full data sovereignty under India's Digital Personal Data Protection Act framework.
        </p>
      </div>

      {/* Active Consents Management */}
      <section className="p-6 rounded-xl bg-paper-2 border border-rule space-y-4">
        <h2 className="font-serif font-bold text-lg text-ink">Per-Purpose Active Consents</h2>
        <div className="space-y-3 text-xs font-mono">
          <div className="p-3 rounded bg-paper border border-rule flex items-center justify-between">
            <div>
              <span className="font-bold text-ink block">Bank Statement Analysis</span>
              <span className="text-[11px] text-ink-soft">Used for deterministic limit backtest</span>
            </div>
            <input
              type="checkbox"
              checked={consents.bankTransactions}
              onChange={(e) => setConsents({ ...consents, bankTransactions: e.target.checked })}
              className="w-4 h-4 accent-vermilion"
            />
          </div>

          <div className="p-3 rounded bg-paper border border-rule flex items-center justify-between">
            <div>
              <span className="font-bold text-ink block">Student Identity Verification</span>
              <span className="text-[11px] text-ink-soft">Used for 18+ and bureau matching</span>
            </div>
            <input
              type="checkbox"
              checked={consents.identityVerification}
              onChange={(e) => setConsents({ ...consents, identityVerification: e.target.checked })}
              className="w-4 h-4 accent-vermilion"
            />
          </div>

          <div className="p-3 rounded bg-paper border border-rule flex items-center justify-between">
            <div>
              <span className="font-bold text-ink block">Campus Enrolment Verification</span>
              <span className="text-[11px] text-ink-soft">Used for campus student eligibility verification</span>
            </div>
            <input
              type="checkbox"
              checked={consents.collegeEnrolment}
              onChange={(e) => setConsents({ ...consents, collegeEnrolment: e.target.checked })}
              className="w-4 h-4 accent-vermilion"
            />
          </div>
        </div>

        {/* Data Purge Action */}
        <div className="pt-3 border-t border-rule flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
          <span className="text-ink-soft">Current active records: {transactions.length} rows</span>
          <button
            onClick={handleDeleteStatement}
            className="px-4 py-2 rounded bg-vermilion text-paper font-bold hover:bg-vermilion/90 transition-colors flex items-center gap-1.5 self-start sm:self-auto"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete All Statement Records</span>
          </button>
        </div>
      </section>

      {/* What We Never Touch */}
      <section className="p-5 rounded-xl bg-vermilion/5 border border-vermilion/30 space-y-2 text-xs font-mono">
        <div className="flex items-center gap-1.5 text-vermilion font-bold">
          <Ban className="w-4 h-4" />
          <span>Non-Negotiable Privacy Guarantees</span>
        </div>
        <p className="text-ink font-sans text-xs">
          Ascend operates with zero device snooping. We never access your contacts, camera roll, SMS inbox,
          or GPS location. We never call parents or friends.
        </p>
      </section>

      {/* Privacy and Share Event Audit Log */}
      <section className="space-y-3 text-xs font-mono">
        <h3 className="font-serif font-bold text-base text-ink">Parent Share and Revoke Audit Trail</h3>
        {auditLogs.length === 0 ? (
          <div className="p-4 rounded bg-paper-2 border border-rule text-ink-soft text-center">
            No parent share or revocation events logged yet.
          </div>
        ) : (
          <div className="border border-rule rounded-lg bg-paper overflow-hidden">
            <div className="divide-y divide-rule/60">
              {auditLogs.map((log) => (
                <div key={log.id} className="p-3 flex justify-between items-center gap-2">
                  <div>
                    <span className="font-bold text-ink block">{log.action}</span>
                    <span className="text-[11px] text-ink-soft font-sans">{log.details}</span>
                  </div>
                  <span className="text-[10px] text-ink-soft shrink-0">{formatDate(log.timestamp)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
