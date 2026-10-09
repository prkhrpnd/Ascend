"use client";

import React, { useState } from "react";
import NextLink from "next/link";
import { useApp } from "@/lib/context/AppContext";
import { StatementUploader } from "@/components/StatementUploader";
import { BankAccountDetailsForm } from "@/components/BankAccountDetailsForm";
import { formatPaise, formatDate } from "@/lib/utils";
import {
  FileText,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Database,
  Code2,
  Sparkles,
  Download,
} from "lucide-react";

export default function BankStatementsPage() {
  const {
    activeFileName,
    uploadStats,
    coverage,
    transactions,
    rawCSV,
    loadPriyaDemoStatement,
  } = useApp();

  const [showRawCSV, setShowRawCSV] = useState(false);

  return (
    <div className="space-y-8 max-w-7xl mx-auto py-2">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-rule shadow-sm p-6 sm:p-8 space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-xs font-mono">
          <Database className="w-3.5 h-3.5 text-blue-600" />
          <span>Statement Ingestion & Verification Portal</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-serif font-black text-ink tracking-tight">
          Bank Statements Management
        </h1>
        <p className="text-xs sm:text-sm text-ink-soft max-w-3xl leading-relaxed">
          Upload any 6-month bank statement CSV from your laptop. Ascend parses your true cash flow,
          performs balance continuity validation, and categorizes every expense using transparent rules.
        </p>
      </div>

      {/* 1. Bank Account Details Form */}
      <BankAccountDetailsForm />

      {/* 2. Prominent Statement Uploader Card with Interactive Preview */}
      <StatementUploader />

      {/* Statement Validation & Technical Audit Report */}
      {transactions.length > 0 && (
        <div className="bg-white rounded-2xl border border-rule shadow-sm p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-rule pb-4">
            <div>
              <h2 className="text-lg font-serif font-bold text-ink">
                Ingested Statement Verification Report
              </h2>
              <p className="text-xs text-ink-soft mt-0.5">
                Integrity metrics computed from the actual uploaded transactions
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowRawCSV(!showRawCSV)}
                className="px-3 py-1.5 rounded-lg border border-rule hover:bg-slate-50 text-xs text-ink font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Code2 className="w-3.5 h-3.5 text-blue-600" />
                <span>{showRawCSV ? "Hide Raw CSV" : "View Raw CSV Data"}</span>
              </button>

              <NextLink
                href="/assess"
                className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-mono text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Evaluate Credit Eligibility</span>
                <ArrowRight className="w-3 h-3" />
              </NextLink>
            </div>
          </div>

          {/* Audit Verification Table */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 border border-rule space-y-3">
              <h3 className="font-bold text-ink">File & Coverage Metadata</h3>
              <div className="space-y-1.5 font-mono text-[11px]">
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-ink-soft">Active File Name:</span>
                  <span className="text-ink font-bold">{activeFileName || "uploaded_statement.csv"}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-ink-soft">Statement Start Date:</span>
                  <span className="text-ink font-bold">{coverage?.startDate || "N/A"}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-ink-soft">Statement End Date:</span>
                  <span className="text-ink font-bold">{coverage?.endDate || "N/A"}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-ink-soft">Tracked Months Count:</span>
                  <span className="text-ink font-bold">{coverage?.monthsCount || 0} months</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-ink-soft">Coverage Confidence:</span>
                  <span className="text-emerald-700 font-bold uppercase">{coverage?.confidence || "N/A"}</span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-rule space-y-3">
              <h3 className="font-bold text-ink">Sanitization & Balance Verification</h3>
              <div className="space-y-1.5 font-mono text-[11px]">
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-ink-soft">Total File Rows:</span>
                  <span className="text-ink font-bold">{uploadStats?.totalRawRows || transactions.length}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-ink-soft">Valid Transactions Parsed:</span>
                  <span className="text-ink font-bold">{transactions.length}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-ink-soft">Duplicates Filtered:</span>
                  <span className="text-ink font-bold">{uploadStats?.duplicateRows || 0}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-ink-soft">Skipped Invalid Rows:</span>
                  <span className="text-ink font-bold">{uploadStats?.skippedRows || 0}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-ink-soft">Balance Continuity Check:</span>
                  <span className="text-emerald-700 font-bold">
                    {uploadStats?.continuityDiscrepancies === 0 ? "100% Passed" : `${uploadStats?.continuityDiscrepancies} discrepancies`}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Raw CSV inspector view */}
          {showRawCSV && (
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between text-xs text-ink-soft">
                <span className="font-mono">Raw Uploaded CSV Payload Preview</span>
                <span>{rawCSV.length} bytes</span>
              </div>
              <pre className="p-4 rounded-xl bg-slate-900 text-slate-100 text-[11px] font-mono overflow-x-auto max-h-64 leading-relaxed">
                {rawCSV || "No raw CSV payload stored."}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
