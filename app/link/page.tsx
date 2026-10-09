"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/supabase/auth-context";
import { useApp } from "@/lib/context/AppContext";
import { SimulationBadge } from "@/components/SimulationBadge";
import { parseStatementCSV, ColumnMapping } from "@/lib/engine/parse";
import { supabase } from "@/lib/supabase/client";
import {
  Upload,
  FileText,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Shield,
  Building2,
  Lock,
  Download,
  ChevronDown,
  ChevronUp,
  RefreshCw,
} from "lucide-react";

const SUPPORTED_FIPS = [
  { id: "sbi", name: "State Bank of India", code: "SBIN" },
  { id: "hdfc", name: "HDFC Bank", code: "HDFC" },
  { id: "icici", name: "ICICI Bank", code: "ICIC" },
  { id: "kotak", name: "Kotak Mahindra Bank", code: "KKBK" },
  { id: "axis", name: "Axis Bank", code: "UTIB" },
  { id: "pnb", name: "Punjab National Bank", code: "PUNB" },
];

export default function LinkStatementPage() {
  const router = useRouter();
  const { user } = useAuth();
  const {
    processUploadedTransactions,
    loadSampleProfile,
    consents,
    profile,
  } = useApp();

  const [activeTab, setActiveTab] = useState<"aa" | "csv">("aa");

  // Account Aggregator State
  const [selectedFip, setSelectedFip] = useState(SUPPORTED_FIPS[0].id);
  const [mobileNumber, setMobileNumber] = useState("9876543210");
  const [aaStep, setAaStep] = useState<"select" | "consent" | "otp" | "syncing" | "done">("select");
  const [otpCode, setOtpCode] = useState("123456");
  const [aaError, setAaError] = useState<string | null>(null);

  // CSV Upload State
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvRawText, setCsvRawText] = useState<string>("");
  const [parsedPreview, setParsedPreview] = useState<any | null>(null);
  const [showMappingModal, setShowMappingModal] = useState(false);
  const [columnMapping, setColumnMapping] = useState<ColumnMapping>({});
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  // Evaluator drawer state
  const [showEvaluatorDrawer, setShowEvaluatorDrawer] = useState(false);
  const [loadingTestProfile, setLoadingTestProfile] = useState<string | null>(null);

  // 1. Account Aggregator Simulation Flow
  const handleStartAaConsent = () => {
    if (!mobileNumber || mobileNumber.length < 10) {
      setAaError("Please provide a valid 10-digit mobile number linked to your bank account.");
      return;
    }
    setAaError(null);
    setAaStep("consent");
  };

  const handleApproveAaConsent = () => {
    setAaStep("otp");
  };

  const handleVerifyOtpAndSync = async () => {
    if (otpCode !== "123456" && otpCode.length < 4) {
      setAaError("Invalid verification code. Use sandbox OTP: 123456");
      return;
    }
    setAaError(null);
    setAaStep("syncing");

    try {
      const fip = SUPPORTED_FIPS.find((f) => f.id === selectedFip) || SUPPORTED_FIPS[0];

      // Record bank connection in Supabase
      if (user) {
        await supabase.from("bank_connections").insert({
          user_id: user.id,
          fip_id: fip.id,
          fip_name: fip.name,
          masked_account_number: `XXXX-XXXX-${Math.floor(1000 + Math.random() * 9000)}`,
          status: "active",
          linked_at: new Date().toISOString(),
        });
      }

      // Fetch simulated student transaction ledger for this bank connection
      const res = await fetch("/api/ingest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile: "priya" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || "Failed to fetch AA statement");

      const success = await processUploadedTransactions(
        data.transactions,
        data.coverage,
        data.csvContent,
        `${fip.code}_Statement_AA_Sync.csv`
      );

      if (success) {
        setAaStep("done");
        setTimeout(() => {
          router.push("/ledger");
        }, 1200);
      } else {
        throw new Error("Cash flow analysis failed on retrieved statement.");
      }
    } catch (err: any) {
      setAaError(err?.message || "Failed to sync transactions via Account Aggregator.");
      setAaStep("select");
    }
  };

  // 2. CSV Statement Upload Handlers
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".csv")) {
      setUploadError("Please upload a standard CSV bank statement file (.csv).");
      return;
    }

    setUploadError(null);
    setCsvFile(file);

    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = (evt.target?.result as string) || "";
      setCsvRawText(text);

      const res = parseStatementCSV(text, columnMapping);
      if (!res.success) {
        setUploadError(res.error?.message || "Could not parse transactions from CSV.");
        setParsedPreview(null);
      } else {
        setParsedPreview(res);
      }
    };
    reader.readAsText(file);
  };

  const handleApplyCustomMapping = () => {
    if (!csvRawText) return;
    const res = parseStatementCSV(csvRawText, columnMapping);
    if (!res.success) {
      setUploadError(res.error?.message || "Parsing failed with specified column mapping.");
    } else {
      setParsedPreview(res);
      setUploadError(null);
      setShowMappingModal(false);
    }
  };

  const handleConfirmCsvIngest = async () => {
    if (!parsedPreview || !parsedPreview.transactions) return;
    setUploading(true);
    setUploadError(null);

    try {
      const success = await processUploadedTransactions(
        parsedPreview.transactions,
        parsedPreview.coverage,
        csvRawText,
        csvFile?.name || "bank_statement.csv"
      );

      if (success) {
        router.push("/ledger");
      } else {
        throw new Error("Financial assessment could not be computed from statement data.");
      }
    } catch (err: any) {
      setUploadError(err?.message || "Failed to process statement transactions.");
      setUploading(false);
    }
  };

  const handleDownloadSampleCsv = () => {
    const sampleHeaders = "date,narration,amount,type,balance\n";
    const sampleRows = [
      "2024-05-02,UPI/PARENT ALLOWANCE/ICICI,6000.00,CR,8420.00",
      "2024-05-05,UPI/CAMPUS MESS HOSTEL RENT,3000.00,DR,5420.00",
      "2024-05-12,UPI/TUTORING CLASS STIPEND,1500.00,CR,6920.00",
      "2024-05-18,UPI/COLLEGE BOOKSTORE,450.00,DR,6470.00",
      "2024-06-02,UPI/PARENT ALLOWANCE/ICICI,6000.00,CR,12470.00",
      "2024-06-05,UPI/CAMPUS MESS HOSTEL RENT,3000.00,DR,9470.00",
      "2024-06-15,UPI/TUTORING CLASS STIPEND,1500.00,CR,10970.00",
      "2024-07-02,UPI/PARENT ALLOWANCE/ICICI,6000.00,CR,16970.00",
      "2024-07-05,UPI/CAMPUS MESS HOSTEL RENT,3000.00,DR,13970.00",
      "2024-07-20,UPI/CANTEEN AND GROCERIES,800.00,DR,13170.00",
      "2024-08-02,UPI/PARENT ALLOWANCE/ICICI,6000.00,CR,19170.00",
      "2024-08-05,UPI/CAMPUS MESS HOSTEL RENT,3000.00,DR,16170.00",
      "2024-09-02,UPI/PARENT ALLOWANCE/ICICI,6000.00,CR,22170.00",
      "2024-09-05,UPI/CAMPUS MESS HOSTEL RENT,3000.00,DR,19170.00",
      "2024-10-02,UPI/PARENT ALLOWANCE/ICICI,6000.00,CR,25170.00",
      "2024-10-05,UPI/CAMPUS MESS HOSTEL RENT,3000.00,DR,22170.00",
    ].join("\n");

    const blob = new Blob([sampleHeaders + sampleRows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "ascend_student_statement_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 3. Evaluator Test Profile Handler
  const handleSelectTestFixture = async (type: "priya" | "volatile" | "thin") => {
    setLoadingTestProfile(type);
    try {
      await loadSampleProfile(type);
      router.push("/ledger");
    } catch (err: any) {
      setUploadError(err?.message || "Failed to load test profile.");
    } finally {
      setLoadingTestProfile(null);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-4 space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between">
          <h1 className="font-serif font-bold text-2xl sm:text-3xl text-ink">
            Link Your Bank Data
          </h1>
          <SimulationBadge label="DPDP CONSENT GATED" size="sm" />
        </div>
        <p className="text-xs text-ink-soft mt-1">
          Link your primary savings bank account to verify your regular cash flow and compute your starter credit limit.
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-rule">
        <button
          onClick={() => setActiveTab("aa")}
          className={`py-2.5 px-4 text-xs font-mono font-medium border-b-2 cursor-pointer transition-colors ${
            activeTab === "aa"
              ? "border-ledger-green text-ledger-green font-bold"
              : "border-transparent text-ink-soft hover:text-ink"
          }`}
        >
          Account Aggregator (Recommended)
        </button>
        <button
          onClick={() => setActiveTab("csv")}
          className={`py-2.5 px-4 text-xs font-mono font-medium border-b-2 cursor-pointer transition-colors ${
            activeTab === "csv"
              ? "border-ledger-green text-ledger-green font-bold"
              : "border-transparent text-ink-soft hover:text-ink"
          }`}
        >
          Upload Bank Statement CSV
        </button>
      </div>

      {/* Tab 1: Account Aggregator Flow */}
      {activeTab === "aa" && (
        <div className="bg-paper-2 border border-rule rounded-xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-rule pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-ink text-paper flex items-center justify-center font-serif font-bold text-xs">
                AA
              </div>
              <div>
                <h2 className="font-serif font-bold text-sm text-ink">Account Aggregator Protocol</h2>
                <p className="text-[10px] text-ink-soft font-mono">RBI regulated financial data exchange</p>
              </div>
            </div>
            <SimulationBadge label="SIMULATED SANDBOX" size="sm" />
          </div>

          {aaError && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-800 text-xs font-mono flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{aaError}</span>
            </div>
          )}

          {aaStep === "select" && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-mono font-semibold uppercase tracking-wider text-ink-soft mb-2">
                  Select Your Bank (Financial Information Provider)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {SUPPORTED_FIPS.map((fip) => (
                    <button
                      key={fip.id}
                      type="button"
                      onClick={() => setSelectedFip(fip.id)}
                      className={`p-3 rounded-lg border text-left text-xs transition-colors cursor-pointer ${
                        selectedFip === fip.id
                          ? "border-ledger-green bg-ledger-green/10 text-ledger-green font-bold"
                          : "border-rule bg-paper text-ink hover:bg-paper-2"
                      }`}
                    >
                      <div className="font-medium">{fip.name}</div>
                      <div className="text-[10px] text-ink-soft font-mono mt-0.5">{fip.code}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono font-semibold uppercase tracking-wider text-ink-soft mb-1.5">
                  Mobile Number Registered with Bank
                </label>
                <input
                  type="tel"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  placeholder="9876543210"
                  className="w-full px-3.5 py-2.5 bg-paper border border-rule rounded-lg text-ink text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ledger-green/50"
                />
                <p className="text-[10px] text-ink-soft mt-1">
                  We use this number to discover linked savings accounts via the Account Aggregator network.
                </p>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={handleStartAaConsent}
                  className="px-6 py-2.5 rounded-lg bg-ledger-green text-paper font-mono font-bold text-xs shadow hover:bg-[#23472c] transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <span>Request Account Discovery</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {aaStep === "consent" && (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-paper border border-rule space-y-3">
                <div className="flex items-center justify-between border-b border-rule/50 pb-2">
                  <span className="font-mono text-xs font-bold text-ink">AA Consent Artifact Review</span>
                  <span className="text-[10px] font-mono text-ledger-green">Consent Handle: AA-{Date.now().toString().slice(-6)}</span>
                </div>
                <div className="text-xs space-y-1.5 text-ink-soft font-mono">
                  <p><strong>Bank:</strong> {SUPPORTED_FIPS.find((f) => f.id === selectedFip)?.name}</p>
                  <p><strong>Purpose:</strong> Starter Credit Limit Assessment and Capacity Calculation</p>
                  <p><strong>Date Range:</strong> Past 6 months of statement history</p>
                  <p><strong>Data Frequency:</strong> One-time synchronous fetch</p>
                  <p><strong>Consent Validity:</strong> 90 days (Revocable anytime on Privacy Settings)</p>
                </div>
              </div>

              <div className="flex justify-between items-center pt-2">
                <button
                  type="button"
                  onClick={() => setAaStep("select")}
                  className="text-xs font-mono text-ink-soft hover:underline cursor-pointer"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleApproveAaConsent}
                  className="px-6 py-2.5 rounded-lg bg-ledger-green text-paper font-mono font-bold text-xs shadow hover:bg-[#23472c] transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <span>Approve Consent and Send OTP</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {aaStep === "otp" && (
            <div className="space-y-4 max-w-sm mx-auto text-center py-2">
              <div className="w-10 h-10 rounded-full bg-ledger-green/10 text-ledger-green mx-auto flex items-center justify-center font-bold">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="font-serif font-bold text-base text-ink">Enter Authorization Code</h3>
              <p className="text-xs text-ink-soft">
                Enter the 6-digit OTP sent to <span className="font-mono text-ink font-semibold">{mobileNumber}</span>.
              </p>

              <div>
                <input
                  type="text"
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  className="w-44 mx-auto text-center font-mono text-xl tracking-widest p-2 bg-paper border border-rule rounded-lg text-ink focus:outline-none focus:ring-2 focus:ring-ledger-green/50"
                />
                <p className="text-[11px] font-mono text-ink-soft mt-1.5">
                  Sandbox auto-code: <span className="text-ledger-green font-bold">123456</span>
                </p>
              </div>

              <div className="pt-2 flex justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setAaStep("consent")}
                  className="px-4 py-2 text-xs font-mono text-ink-soft hover:underline cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleVerifyOtpAndSync}
                  className="px-6 py-2 rounded-lg bg-ledger-green text-paper font-mono font-bold text-xs shadow hover:bg-[#23472c] transition-colors cursor-pointer"
                >
                  Verify and Sync Bank Data
                </button>
              </div>
            </div>
          )}

          {aaStep === "syncing" && (
            <div className="py-8 text-center space-y-3">
              <RefreshCw className="w-8 h-8 text-ledger-green mx-auto animate-spin" />
              <h3 className="font-serif font-bold text-base text-ink">Syncing Bank Statement via AA Protocol</h3>
              <p className="text-xs text-ink-soft font-mono max-w-sm mx-auto">
                Decrypting transaction records and computing deterministic cash flow limits...
              </p>
            </div>
          )}

          {aaStep === "done" && (
            <div className="py-8 text-center space-y-3">
              <CheckCircle2 className="w-10 h-10 text-ledger-green mx-auto" />
              <h3 className="font-serif font-bold text-lg text-ink">Statement Linked Successfully</h3>
              <p className="text-xs text-ink-soft font-mono">
                Redirecting to verified transaction ledger...
              </p>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: CSV File Upload Flow */}
      {activeTab === "csv" && (
        <div className="bg-paper-2 border border-rule rounded-xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-rule pb-3">
            <div>
              <h2 className="font-serif font-bold text-sm text-ink">Upload Bank Statement CSV</h2>
              <p className="text-[10px] text-ink-soft font-mono">Direct file parsing and deterministic limit computation</p>
            </div>
            <button
              type="button"
              onClick={handleDownloadSampleCsv}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded border border-rule bg-paper hover:bg-paper-2 text-xs font-mono text-ink cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-ink-soft" />
              <span>Download CSV Template</span>
            </button>
          </div>

          {uploadError && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-800 text-xs font-mono flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{uploadError}</span>
            </div>
          )}

          {/* Upload Dropzone */}
          <div className="p-6 rounded-lg bg-paper border-2 border-rule border-dashed text-center space-y-3">
            <Upload className="w-8 h-8 text-ink-soft mx-auto" />
            <div>
              <p className="text-sm font-serif font-bold text-ink">Choose a CSV file or drag and drop</p>
              <p className="text-xs text-ink-soft mt-0.5">
                Bank statements up to 2 MB containing Date, Narration, Amount, and Balance.
              </p>
            </div>

            <label className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-ledger-green text-paper font-mono font-bold text-xs shadow hover:bg-[#23472c] transition-colors cursor-pointer">
              <FileText className="w-4 h-4" />
              <span>Browse File</span>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>

            {csvFile && (
              <p className="text-xs font-mono text-ink font-semibold pt-1">
                Selected: {csvFile.name} ({(csvFile.size / 1024).toFixed(1)} KB)
              </p>
            )}
          </div>

          {/* Parsed Preview Table */}
          {parsedPreview && parsedPreview.transactions && (
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-serif font-bold text-sm text-ink">Extraction Preview</h3>
                  <p className="text-[11px] font-mono text-ink-soft">
                    {parsedPreview.transactions.length} transactions extracted | Coverage: {parsedPreview.coverage?.monthsCount} months ({parsedPreview.coverage?.startDate} to {parsedPreview.coverage?.endDate})
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowMappingModal(!showMappingModal)}
                  className="text-xs font-mono text-ledger-green hover:underline cursor-pointer"
                >
                  Adjust Column Mapping
                </button>
              </div>

              {/* First 4 extracted rows */}
              <div className="border border-rule rounded-lg overflow-hidden bg-paper">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-paper-2 border-b border-rule text-ink-soft">
                    <tr>
                      <th className="p-2">Date</th>
                      <th className="p-2">Narration</th>
                      <th className="p-2 text-right">Amount</th>
                      <th className="p-2">Type</th>
                      <th className="p-2 text-right">Balance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-rule/40 text-ink">
                    {parsedPreview.transactions.slice(0, 4).map((t: any) => (
                      <tr key={t.id}>
                        <td className="p-2 whitespace-nowrap">{t.date}</td>
                        <td className="p-2 truncate max-w-[200px]">{t.narration}</td>
                        <td className="p-2 text-right font-semibold">₹{(t.amountPaise / 100).toLocaleString("en-IN")}</td>
                        <td className="p-2">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] ${t.type === "CR" ? "bg-ledger-green/10 text-ledger-green" : "bg-paper-2 text-ink"}`}>
                            {t.type}
                          </span>
                        </td>
                        <td className="p-2 text-right text-ink-soft">₹{(t.balancePaise / 100).toLocaleString("en-IN")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  disabled={uploading}
                  onClick={handleConfirmCsvIngest}
                  className="px-6 py-2.5 rounded-lg bg-ledger-green text-paper font-mono font-bold text-xs shadow hover:bg-[#23472c] transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {uploading ? (
                    <span>Assessing transactions...</span>
                  ) : (
                    <>
                      <span>Confirm and Calculate Credit Limit</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Optional Column Mapping Modal */}
          {showMappingModal && (
            <div className="p-4 rounded-lg bg-paper border border-rule space-y-3 text-xs font-mono">
              <h4 className="font-bold text-ink">Custom Column Mapping</h4>
              <p className="text-ink-soft text-[11px]">
                If your bank uses specific column names, map them below:
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div>
                  <label className="block text-ink-soft mb-1">Date Column</label>
                  <input
                    type="text"
                    value={columnMapping.date || ""}
                    onChange={(e) => setColumnMapping({ ...columnMapping, date: e.target.value })}
                    placeholder="e.g. Txn Date"
                    className="w-full p-1.5 bg-paper-2 border border-rule rounded text-ink text-xs"
                  />
                </div>
                <div>
                  <label className="block text-ink-soft mb-1">Narration Column</label>
                  <input
                    type="text"
                    value={columnMapping.narration || ""}
                    onChange={(e) => setColumnMapping({ ...columnMapping, narration: e.target.value })}
                    placeholder="e.g. Description"
                    className="w-full p-1.5 bg-paper-2 border border-rule rounded text-ink text-xs"
                  />
                </div>
                <div>
                  <label className="block text-ink-soft mb-1">Amount Column</label>
                  <input
                    type="text"
                    value={columnMapping.amount || ""}
                    onChange={(e) => setColumnMapping({ ...columnMapping, amount: e.target.value })}
                    placeholder="e.g. Amount"
                    className="w-full p-1.5 bg-paper-2 border border-rule rounded text-ink text-xs"
                  />
                </div>
                <div>
                  <label className="block text-ink-soft mb-1">Balance Column</label>
                  <input
                    type="text"
                    value={columnMapping.balance || ""}
                    onChange={(e) => setColumnMapping({ ...columnMapping, balance: e.target.value })}
                    placeholder="e.g. Balance"
                    className="w-full p-1.5 bg-paper-2 border border-rule rounded text-ink text-xs"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowMappingModal(false)}
                  className="px-3 py-1.5 text-ink-soft hover:underline cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleApplyCustomMapping}
                  className="px-4 py-1.5 bg-ledger-green text-paper rounded font-bold cursor-pointer"
                >
                  Apply Mapping
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Evaluator Test Fixtures Drawer (Strictly Separated for Evaluation) */}
      <div className="pt-2 border-t border-rule/70">
        <button
          type="button"
          onClick={() => setShowEvaluatorDrawer(!showEvaluatorDrawer)}
          className="w-full flex items-center justify-between text-xs font-mono text-ink-soft hover:text-ink py-2 cursor-pointer"
        >
          <span className="font-semibold uppercase tracking-wider">
            Evaluator Test Fixtures (Simulated Benchmark Profiles)
          </span>
          {showEvaluatorDrawer ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showEvaluatorDrawer && (
          <div className="mt-2 p-4 rounded-xl border border-dashed border-rule bg-paper/50 space-y-3 text-xs font-mono">
            <p className="text-[11px] text-ink-soft leading-relaxed">
              These test cases are synthetic benchmarks for policy stress testing and edge cases. They are isolated from authenticated user data.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleSelectTestFixture("volatile")}
                disabled={loadingTestProfile !== null}
                className="p-3 rounded-lg border border-rule bg-paper hover:bg-paper-2 text-left cursor-pointer transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-ink">Volatile Cash Flow Fixture</span>
                  <span className="text-[10px] text-vermilion font-bold">Limit ₹0 Demo</span>
                </div>
                <p className="text-[10px] text-ink-soft font-sans mt-1">
                  Irregular freelance inflows with pre-income balances dipping below policy threshold.
                </p>
              </button>

              <button
                type="button"
                onClick={() => handleSelectTestFixture("thin")}
                disabled={loadingTestProfile !== null}
                className="p-3 rounded-lg border border-rule bg-paper hover:bg-paper-2 text-left cursor-pointer transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-ink">Thin History Fixture</span>
                  <span className="text-[10px] text-marigold font-bold">2 Months Only</span>
                </div>
                <p className="text-[10px] text-ink-soft font-sans mt-1">
                  Only 2 months of history. Triggers INSUFFICIENT_HISTORY policy rule.
                </p>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
