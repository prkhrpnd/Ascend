"use client";

import React, { useState, useEffect } from "react";
import { PolicyType, ConfigChangeLog } from "@/config/policy";
import { useApp } from "@/lib/context/AppContext";
import { SimulationBadge } from "@/components/SimulationBadge";
import { Sliders, Save, RotateCcw, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function ConfigAdminPage() {
  const { setFounderNotice } = useApp();
  const [policy, setPolicy] = useState<PolicyType | null>(null);
  const [logs, setLogs] = useState<ConfigChangeLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [reason, setReason] = useState("");
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Form states
  const [dueDateOffset, setDueDateOffset] = useState<number>(2);
  const [bufferPaise, setBufferPaise] = useState<number>(30000);
  const [capacityRatio, setCapacityRatio] = useState<number>(0.2);
  const [dependentWeight, setDependentWeight] = useState<number>(0.8);
  const [monthlyInterestBps, setMonthlyInterestBps] = useState<number>(150);

  const fetchConfig = () => {
    fetch("/api/config")
      .then((r) => r.json())
      .then((data) => {
        setPolicy(data.policy);
        setLogs(data.logs || []);
        setDueDateOffset(data.policy.dueDateOffsetDays);
        setBufferPaise(data.policy.bufferPaise);
        setCapacityRatio(data.policy.capacityIncomeRatio);
        setDependentWeight(data.policy.dependentIncomeWeight);
        setMonthlyInterestBps(data.policy.pricing.monthlyInterestBps);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      alert("Please enter a reason for this policy update.");
      return;
    }

    const updates: Partial<PolicyType> = {
      dueDateOffsetDays: Number(dueDateOffset),
      bufferPaise: Number(bufferPaise),
      capacityIncomeRatio: Number(capacityRatio),
      dependentIncomeWeight: Number(dependentWeight),
      pricing: {
        ...policy!.pricing,
        monthlyInterestBps: Number(monthlyInterestBps),
      },
    };

    try {
      const res = await fetch("/api/config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ updates, reason }),
      });
      const data = await res.json();
      if (res.ok) {
        setPolicy(data.policy);
        setLogs(data.logs);
        setFounderNotice(reason);
        setSavedSuccess(true);
        setReason("");
        setTimeout(() => setSavedSuccess(false), 3000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading || !policy) {
    return <div className="py-12 text-center font-mono text-xs text-ink-soft">Loading policy config...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto py-4 space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between">
          <h1 className="font-serif font-black text-2xl sm:text-3xl text-ink">
            Founder Policy Update Panel
          </h1>
          <SimulationBadge label="SINGLE SOURCE OF TRUTH" size="sm" />
        </div>
        <p className="text-xs text-ink-soft mt-1">
          Adjust risk, due dates, buffers, and pricing across the entire application without touching code.
        </p>
      </div>

      {savedSuccess && (
        <div className="p-3 rounded bg-ledger-green/10 border border-ledger-green text-ledger-green text-xs font-mono flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>Policy successfully updated! Notice banner dispatched to home screen.</span>
        </div>
      )}

      {/* Policy Form */}
      <form onSubmit={handleUpdate} className="p-6 rounded-xl bg-paper-2 border border-rule space-y-6 text-xs font-mono">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Due date offset */}
          <div>
            <label className="block text-ink font-bold mb-1">
              Due Date Offset Days (after primary income day)
            </label>
            <input
              type="number"
              min="1"
              max="10"
              value={dueDateOffset}
              onChange={(e) => setDueDateOffset(Number(e.target.value))}
              className="w-full p-2.5 rounded bg-paper border border-rule font-bold text-ink focus:outline-none focus:ring-1 focus:ring-ink"
            />
            <span className="text-[10px] text-ink-soft mt-0.5 block font-sans">
              Currently: {dueDateOffset} days. (Test 14 verification point)
            </span>
          </div>

          {/* Buffer Paise */}
          <div>
            <label className="block text-ink font-bold mb-1">
              Safety Buffer (Paise)
            </label>
            <input
              type="number"
              step="5000"
              value={bufferPaise}
              onChange={(e) => setBufferPaise(Number(e.target.value))}
              className="w-full p-2.5 rounded bg-paper border border-rule font-bold text-ink focus:outline-none focus:ring-1 focus:ring-ink"
            />
            <span className="text-[10px] text-ink-soft mt-0.5 block font-sans">
              Currently: ₹{bufferPaise / 100} safety cushion
            </span>
          </div>

          {/* Capacity Ratio */}
          <div>
            <label className="block text-ink font-bold mb-1">
              Capacity Income Ratio
            </label>
            <input
              type="number"
              step="0.05"
              min="0.05"
              max="0.5"
              value={capacityRatio}
              onChange={(e) => setCapacityRatio(Number(e.target.value))}
              className="w-full p-2.5 rounded bg-paper border border-rule font-bold text-ink focus:outline-none focus:ring-1 focus:ring-ink"
            />
            <span className="text-[10px] text-ink-soft mt-0.5 block font-sans">
              Currently: {Math.round(capacityRatio * 100)}% of monthly qualifying cash flow
            </span>
          </div>

          {/* Dependent Income Weight */}
          <div>
            <label className="block text-ink font-bold mb-1">
              Parent Allowance Weight
            </label>
            <input
              type="number"
              step="0.05"
              min="0.1"
              max="1.0"
              value={dependentWeight}
              onChange={(e) => setDependentWeight(Number(e.target.value))}
              className="w-full p-2.5 rounded bg-paper border border-rule font-bold text-ink focus:outline-none focus:ring-1 focus:ring-ink"
            />
            <span className="text-[10px] text-ink-soft mt-0.5 block font-sans">
              Currently: {Math.round(dependentWeight * 100)}% weight for parental allowances
            </span>
          </div>

          {/* Monthly Interest Bps */}
          <div className="sm:col-span-2">
            <label className="block text-ink font-bold mb-1">
              Monthly Interest Basis Points (bps)
            </label>
            <input
              type="number"
              step="10"
              value={monthlyInterestBps}
              onChange={(e) => setMonthlyInterestBps(Number(e.target.value))}
              className="w-full p-2.5 rounded bg-paper border border-rule font-bold text-ink focus:outline-none focus:ring-1 focus:ring-ink"
            />
            <span className="text-[10px] text-ink-soft mt-0.5 block font-sans">
              Currently: {monthlyInterestBps} bps = {(monthlyInterestBps / 100).toFixed(2)}% per 30 days
            </span>
          </div>
        </div>

        {/* Change Reason Input */}
        <div className="pt-2 border-t border-rule space-y-1">
          <label className="block text-ink font-bold">
            Reason for Policy Change (Required for Audit Trail and Banner)
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Partner requested due date offset alignment for Diwali holiday"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full p-2.5 rounded bg-paper border border-rule text-ink focus:outline-none focus:ring-1 focus:ring-ink"
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 rounded bg-vermilion text-paper font-bold shadow hover:bg-vermilion/90 transition-colors flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>Apply and Log Policy Update</span>
          </button>
        </div>
      </form>

      {/* Change Logs Audit Trail */}
      <section className="space-y-3 text-xs font-mono">
        <h2 className="font-serif font-bold text-base text-ink">Configuration Change Log</h2>
        <div className="border border-rule rounded-lg bg-paper overflow-hidden shadow-sm">
          <div className="divide-y divide-rule/60">
            {logs.map((log) => (
              <div key={log.id} className="p-3.5 space-y-1">
                <div className="flex justify-between items-center text-[10px] text-ink-soft">
                  <span className="font-bold text-ink uppercase">{log.field}</span>
                  <span>{formatDate(log.timestamp)}</span>
                </div>
                <div className="text-ink">
                  Reason: <strong>{log.reason}</strong>
                </div>
                {log.oldValue !== null && (
                  <div className="text-[11px] text-ink-soft">
                    Old: {JSON.stringify(log.oldValue)} → New: {JSON.stringify(log.newValue)}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
