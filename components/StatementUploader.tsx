"use client";

import React, { useState, useRef } from "react";
import { useApp } from "@/lib/context/AppContext";
import { parseStatementCSV, ParseResult, getStatementCSVTemplate } from "@/lib/engine/parse";
import { formatPaise, formatDate } from "@/lib/utils";
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Download,
  Sparkles,
  RefreshCw,
  Info,
  Calendar,
  Wallet,
  Check,
  ChevronDown,
  ChevronUp,
  Tag,
  Eye,
  X,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

interface StatementUploaderProps {
  onSuccess?: () => void;
}

interface PendingPreviewState {
  file: File;
  rawText: string;
  result: ParseResult;
}

export function StatementUploader({ onSuccess }: StatementUploaderProps) {
  const {
    activeFileName,
    uploadStats,
    coverage,
    ingestStatementCSV,
    loadPriyaDemoStatement,
    transactions,
  } = useApp();

  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);
  const [showSkippedDetails, setShowSkippedDetails] = useState(false);
  const [pendingPreview, setPendingPreview] = useState<PendingPreviewState | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileProcess = async (file: File) => {
    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".csv")) {
      setErrorMessage("Please select a standard .csv file format.");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setErrorMessage("File exceeds 2 MB limit. Please upload a 6-month statement file.");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setSuccessNotice(null);

    try {
      const text = await file.text();
      const parseRes = parseStatementCSV(text, undefined, file.name);

      if (parseRes.success && parseRes.transactions.length > 0) {
        // Render preview before final confirmation
        setPendingPreview({
          file,
          rawText: text,
          result: parseRes,
        });
      } else {
        setErrorMessage(
          parseRes.error?.message ||
            "Could not parse transactions from this statement. Please verify that column headers include Date, Narration, and Amount/Debit/Credit."
        );
      }
    } catch (err: any) {
      setErrorMessage(err.message || "An unexpected error occurred while parsing the CSV file.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmImport = async () => {
    if (!pendingPreview) return;

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const success = await ingestStatementCSV(
        pendingPreview.rawText,
        pendingPreview.file.name
      );

      if (success) {
        setSuccessNotice(
          `Successfully processed ${pendingPreview.file.name}. ${pendingPreview.result.transactions.length} transactions imported.`
        );
        setPendingPreview(null);
        if (onSuccess) onSuccess();
      } else {
        setErrorMessage("Failed to commit statement transactions. Please check file formatting.");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to import statement transactions.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelPreview = () => {
    setPendingPreview(null);
    setErrorMessage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      await handleFileProcess(files[0]);
    }
  };

  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      await handleFileProcess(files[0]);
    }
  };

  const handleDownloadTemplate = () => {
    const templateContent = getStatementCSVTemplate();
    const blob = new Blob([templateContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "ascend_bank_statement_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleLoadDemoPriya = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    setSuccessNotice(null);
    setPendingPreview(null);
    try {
      await loadPriyaDemoStatement();
      setSuccessNotice("Priya's realistic 6-month demo statement loaded and analyzed.");
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to load demo statement.");
    } finally {
      setIsLoading(false);
    }
  };

  // Compute preview metrics
  const previewMetrics = pendingPreview
    ? (() => {
        let totalCr = 0;
        let totalDr = 0;
        pendingPreview.result.transactions.forEach((tx) => {
          if (tx.type === "CR") totalCr += tx.amount_paise;
          else totalDr += tx.amount_paise;
        });
        return { totalCr, totalDr };
      })()
    : null;

  return (
    <div className="bg-white rounded-2xl border border-rule shadow-sm p-6 sm:p-8 space-y-6 box-border">
      {/* Header and Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-rule pb-4">
        <div>
          <h2 className="text-xl font-serif font-black text-ink">
            Bank Statement Upload and Ingestion
          </h2>
          <p className="text-xs text-ink-soft mt-1">
            Upload any standard Indian bank CSV from your laptop or try our realistic student demo file.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Download Template Button */}
          <button
            onClick={handleDownloadTemplate}
            className="px-3 py-1.5 rounded-lg border border-rule hover:bg-slate-50 text-xs text-ink font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Download formatted sample CSV file"
          >
            <Download className="w-3.5 h-3.5 text-ink-soft" />
            <span>CSV Template</span>
          </button>

          {/* Quick Demo Loader */}
          <button
            onClick={handleLoadDemoPriya}
            disabled={isLoading}
            className="px-3.5 py-1.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100 font-mono text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Load Priya Demo Statement</span>
          </button>
        </div>
      </div>

      {/* Drag & Drop Upload Zone (when not in preview mode) */}
      {!pendingPreview && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-8 sm:p-12 text-center transition-all cursor-pointer ${
            isDragging
              ? "border-blue-500 bg-blue-50/50 scale-[1.01]"
              : "border-slate-300 hover:border-blue-400 bg-slate-50/50 hover:bg-slate-50"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileInputChange}
            className="hidden"
          />

          <div className="max-w-md mx-auto space-y-3">
            <div className="w-12 h-12 mx-auto rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shadow-inner">
              {isLoading ? (
                <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
              ) : (
                <UploadCloud className="w-6 h-6 text-blue-600" />
              )}
            </div>

            <div className="space-y-1">
              <p className="text-sm font-semibold text-ink">
                {isLoading
                  ? "Parsing bank statement transactions..."
                  : "Drop your bank statement CSV here, or click to browse"}
              </p>
              <p className="text-xs text-ink-soft">
                Supports statements with Date, Narration, Debit, Credit, and Balance columns up to 2 MB
              </p>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-rule text-[11px] font-mono text-ink-soft">
              <span>Supports SBI, HDFC, ICICI, Axis, Kotak, Debit_INR/Credit_INR schemas</span>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Statement Preview Card Before Final Confirmation */}
      {pendingPreview && (
        <div className="p-5 sm:p-6 rounded-xl bg-blue-50/60 border border-blue-300 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-blue-200 pb-3">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-blue-700" />
              <h3 className="font-serif font-bold text-base text-ink">
                Statement Preview & Import Confirmation
              </h3>
            </div>
            <div className="flex items-center gap-2 font-mono text-xs">
              <span className="px-2 py-0.5 rounded bg-white border border-blue-200 text-blue-800 font-bold">
                {pendingPreview.file.name} ({Math.round(pendingPreview.file.size / 1024)} KB)
              </span>
              <button
                type="button"
                onClick={handleCancelPreview}
                className="p-1 rounded hover:bg-blue-100 text-ink-soft cursor-pointer"
                title="Cancel preview"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
            <div className="bg-white p-3 rounded-lg border border-blue-100 space-y-0.5">
              <span className="text-[10px] text-ink-soft uppercase block">Valid Records</span>
              <span className="font-bold text-ink text-sm">
                {pendingPreview.result.transactions.length} rows
              </span>
            </div>
            <div className="bg-white p-3 rounded-lg border border-blue-100 space-y-0.5">
              <span className="text-[10px] text-ink-soft uppercase block">Date Range</span>
              <span className="font-bold text-ink text-xs truncate block">
                {pendingPreview.result.stats?.startDate} to {pendingPreview.result.stats?.endDate}
              </span>
            </div>
            <div className="bg-white p-3 rounded-lg border border-blue-100 space-y-0.5">
              <span className="text-[10px] text-ink-soft uppercase block">Total Credits</span>
              <span className="font-bold text-emerald-700 text-sm">
                {previewMetrics ? formatPaise(previewMetrics.totalCr) : "₹0"}
              </span>
            </div>
            <div className="bg-white p-3 rounded-lg border border-blue-100 space-y-0.5">
              <span className="text-[10px] text-ink-soft uppercase block">Total Debits</span>
              <span className="font-bold text-rose-600 text-sm">
                {previewMetrics ? formatPaise(previewMetrics.totalDr) : "₹0"}
              </span>
            </div>
          </div>

          {/* Column Mapping Badges */}
          {pendingPreview.result.stats && (
            <div className="p-3 bg-white rounded-lg border border-blue-100 text-xs font-mono space-y-1">
              <span className="text-[10px] uppercase font-bold text-ink-soft block">
                Detected Column Mapping:
              </span>
              <div className="flex flex-wrap gap-2 text-[11px]">
                <span className="px-2 py-0.5 rounded bg-slate-50 border border-rule text-ink">
                  Date: <strong>{pendingPreview.result.stats.startDate ? "Detected" : "Mapped"}</strong>
                </span>
                <span className="px-2 py-0.5 rounded bg-slate-50 border border-rule text-ink">
                  Currency: <strong>{pendingPreview.result.stats.currencyDetected || "INR"}</strong>
                </span>
                <span className="px-2 py-0.5 rounded bg-slate-50 border border-rule text-ink">
                  Running Balance: <strong>{pendingPreview.result.stats.hasBalances ? "Verified" : "None"}</strong>
                </span>
                <span className="px-2 py-0.5 rounded bg-slate-50 border border-rule text-ink">
                  Deduplication: <strong>{pendingPreview.result.stats.duplicateRows} duplicates filtered</strong>
                </span>
              </div>
            </div>
          )}

          {/* First 5 Preview Rows Table */}
          <div className="bg-white rounded-lg border border-blue-100 overflow-hidden text-xs">
            <div className="px-3 py-2 bg-slate-50 border-b border-rule font-bold text-ink flex items-center justify-between text-[11px] font-mono">
              <span>First 5 Sample Transactions Preview</span>
              <span className="text-ink-soft font-normal">Review before final ingestion</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-[11px]">
                <thead className="bg-slate-50/50 border-b border-rule text-ink-soft uppercase text-[10px]">
                  <tr>
                    <th className="px-3 py-2">Date</th>
                    <th className="px-3 py-2">Narration</th>
                    <th className="px-3 py-2">Type</th>
                    <th className="px-3 py-2 text-right">Amount</th>
                    <th className="px-3 py-2 text-right">Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {pendingPreview.result.transactions.slice(0, 5).map((tx, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/60">
                      <td className="px-3 py-1.5 whitespace-nowrap text-ink-soft">{tx.date}</td>
                      <td className="px-3 py-1.5 max-w-xs truncate text-ink">{tx.narration}</td>
                      <td className="px-3 py-1.5">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            tx.type === "CR"
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-rose-50 text-rose-700"
                          }`}
                        >
                          {tx.type}
                        </span>
                      </td>
                      <td
                        className={`px-3 py-1.5 text-right font-bold whitespace-nowrap ${
                          tx.type === "CR" ? "text-emerald-700" : "text-rose-700"
                        }`}
                      >
                        {formatPaise(tx.amount_paise)}
                      </td>
                      <td className="px-3 py-1.5 text-right text-ink-soft whitespace-nowrap">
                        {tx.balance_paise > 0 ? formatPaise(tx.balance_paise) : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Confirmation Buttons */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={handleCancelPreview}
              className="px-4 py-2.5 rounded-xl border border-rule bg-white hover:bg-slate-50 text-xs font-mono text-ink font-semibold transition-colors cursor-pointer"
            >
              Cancel / Choose Different File
            </button>

            <button
              type="button"
              onClick={handleConfirmImport}
              disabled={isLoading}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-mono text-xs font-bold shadow transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Processing Transactions...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirm & Ingest Statement</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Alerts */}
      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold">Parsing Error</span>
            <p>{errorMessage}</p>
          </div>
        </div>
      )}

      {successNotice && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2.5">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{successNotice}</span>
        </div>
      )}

      {/* Inconsistent or Short Statement Warnings */}
      {uploadStats?.warnings && uploadStats.warnings.length > 0 && (
        <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 space-y-1">
          <div className="flex items-center gap-1.5 font-bold">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>Statement Observations and Warnings</span>
          </div>
          <ul className="list-disc list-inside text-[11px] space-y-0.5">
            {uploadStats.warnings.map((w, idx) => (
              <li key={idx}>{w}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Active Statement Summary Card */}
      {transactions.length > 0 && !pendingPreview && (
        <div className="p-4 sm:p-5 rounded-xl bg-blue-50/60 border border-blue-200/80 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-blue-200/60 pb-3">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-700" />
              <span className="font-mono text-xs font-bold text-ink">
                Active Statement: {activeFileName || "Uploaded Statement"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 border border-blue-200 text-[10px] font-mono font-bold">
                Currency: {uploadStats?.currencyDetected || "INR"}
              </span>
              <div className="flex items-center gap-1.5 text-[11px] font-mono text-emerald-700 bg-white px-2 py-0.5 rounded border border-emerald-200">
                <Check className="w-3 h-3 text-emerald-600" />
                <span>{transactions.length} valid transactions</span>
              </div>
            </div>
          </div>

          {/* Key Statement Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            {/* Date Range */}
            <div className="bg-white p-3 rounded-lg border border-rule space-y-1">
              <div className="flex items-center gap-1.5 text-ink-soft text-[11px]">
                <Calendar className="w-3.5 h-3.5 text-blue-600" />
                <span>Period Covered</span>
              </div>
              <p className="font-mono font-bold text-ink text-xs">
                {coverage ? `${formatDate(coverage.startDate)} to ${formatDate(coverage.endDate)}` : "N/A"}
              </p>
              <p className="text-[10px] text-ink-soft">
                {coverage ? `${coverage.monthsCount} full months` : ""}
              </p>
            </div>

            {/* Balances */}
            <div className="bg-white p-3 rounded-lg border border-rule space-y-1">
              <div className="flex items-center gap-1.5 text-ink-soft text-[11px]">
                <Wallet className="w-3.5 h-3.5 text-blue-600" />
                <span>Starting Balance</span>
              </div>
              <p className="font-mono font-bold text-ink">
                {uploadStats?.hasBalances ? formatPaise(uploadStats.startingBalancePaise) : "N/A"}
              </p>
              <p className="text-[10px] text-ink-soft">
                Ending: {uploadStats?.hasBalances ? formatPaise(uploadStats.endingBalancePaise) : "N/A"}
              </p>
            </div>

            {/* Rows Accounting */}
            <div className="bg-white p-3 rounded-lg border border-rule space-y-1">
              <span className="text-ink-soft text-[11px] block">Row Accounting</span>
              <p className="font-mono font-bold text-ink">
                {uploadStats ? `${uploadStats.validTransactions} valid` : `${transactions.length} rows`}
              </p>
              <p className="text-[10px] text-ink-soft">
                Skipped: {uploadStats?.skippedRows || 0} | Duplicates: {uploadStats?.duplicateRows || 0}
              </p>
            </div>

            {/* Balance Continuity */}
            <div className="bg-white p-3 rounded-lg border border-rule space-y-1">
              <span className="text-ink-soft text-[11px] block">Balance Continuity</span>
              <p className="font-mono font-bold text-ink">
                {uploadStats?.continuityDiscrepancies === 0 ? (
                  <span className="text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Verified 100%
                  </span>
                ) : (
                  <span className="text-amber-700">
                    {uploadStats?.continuityDiscrepancies} jumps detected
                  </span>
                )}
              </p>
              <p className="text-[10px] text-ink-soft">
                Running ledger checked
              </p>
            </div>
          </div>

          {/* Skipped Rows Drawer / Details */}
          {uploadStats?.skippedRowDetails && uploadStats.skippedRowDetails.length > 0 && (
            <div className="border-t border-blue-200/60 pt-3">
              <button
                type="button"
                onClick={() => setShowSkippedDetails(!showSkippedDetails)}
                className="text-xs font-mono text-ink-soft hover:text-ink flex items-center gap-1.5 cursor-pointer"
              >
                <span>
                  {uploadStats.skippedRowDetails.length} skipped or invalid rows detected
                </span>
                {showSkippedDetails ? (
                  <ChevronUp className="w-3.5 h-3.5" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5" />
                )}
              </button>

              {showSkippedDetails && (
                <div className="mt-2 p-3 rounded-lg bg-white border border-rule text-xs space-y-2 max-h-40 overflow-y-auto font-mono text-[11px]">
                  {uploadStats.skippedRowDetails.map((item, idx) => (
                    <div key={idx} className="flex items-start justify-between py-1 border-b border-slate-100 last:border-0">
                      <span className="text-ink font-semibold">Row #{item.rowNumber}</span>
                      <span className="text-rose-600 text-right">{item.reason}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Format Guidelines Tip */}
      <div className="bg-slate-50 p-4 rounded-xl border border-rule space-y-2 text-xs">
        <div className="flex items-center gap-1.5 text-ink font-semibold">
          <Info className="w-4 h-4 text-blue-600" />
          <span>Expected Bank Statement Columns</span>
        </div>
        <p className="text-ink-soft text-[11px] leading-relaxed">
          Ascend auto-detects columns across standard Indian banking exports. Supported column combinations include:
          <code className="font-mono bg-white px-1.5 py-0.5 rounded border border-rule mx-1 text-ink">Transaction_Date</code> (or Date),
          <code className="font-mono bg-white px-1.5 py-0.5 rounded border border-rule mx-1 text-ink">Description</code> (or Narration),
          <code className="font-mono bg-white px-1.5 py-0.5 rounded border border-rule mx-1 text-ink">Debit_INR</code> (or Debit),
          <code className="font-mono bg-white px-1.5 py-0.5 rounded border border-rule mx-1 text-ink">Credit_INR</code> (or Credit),
          <code className="font-mono bg-white px-1.5 py-0.5 rounded border border-rule mx-1 text-ink">Balance_INR</code> (or Balance), and
          <code className="font-mono bg-white px-1.5 py-0.5 rounded border border-rule mx-1 text-ink">Reference_ID</code>.
          Zero in one amount column does not invalidate the other. Files with INR column suffixes are recognized as INR-denominated without requiring a separate Currency column.
        </p>
      </div>
    </div>
  );
}
