"use client";

import React, { useState, useEffect } from "react";
import { useApp, BankAccountDetails } from "@/lib/context/AppContext";
import {
  Building2,
  User,
  CreditCard,
  Eye,
  EyeOff,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Tag,
  Lock,
} from "lucide-react";

const COMMON_BANKS = [
  "State Bank of India",
  "HDFC Bank",
  "ICICI Bank",
  "Axis Bank",
  "Punjab National Bank",
  "Kotak Mahindra Bank",
  "Bank of Baroda",
  "Canara Bank",
  "Union Bank of India",
  "IndusInd Bank",
  "Other Bank",
];

export function BankAccountDetailsForm() {
  const { bankAccount, setBankAccount, coverage, transactions } = useApp();

  const [bankName, setBankName] = useState<string>(bankAccount?.bankName || "State Bank of India");
  const [customBankName, setCustomBankName] = useState<string>("");
  const [accountHolderName, setAccountHolderName] = useState<string>(
    bankAccount?.accountHolderName || "Priya Sharma"
  );
  const [accountNumber, setAccountNumber] = useState<string>(
    bankAccount?.accountNumber ? bankAccount.accountNumber.replace(/[^0-9]/g, "") || "50100439284589" : "50100439284589"
  );
  const [showAccountNumber, setShowAccountNumber] = useState<boolean>(false);
  const [accountType, setAccountType] = useState<"Savings" | "Current" | "Other">(
    bankAccount?.accountType || "Savings"
  );
  const [ifscCode, setIfscCode] = useState<string>(bankAccount?.ifscCode || "SBIN0001234");
  const [startDate, setStartDate] = useState<string>(
    bankAccount?.startDate || coverage?.startDate || "2026-04-01"
  );
  const [endDate, setEndDate] = useState<string>(
    bankAccount?.endDate || coverage?.endDate || "2026-09-30"
  );
  const [nickname, setNickname] = useState<string>(bankAccount?.nickname || "Campus Allowance Account");

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  // Sync statement dates if coverage updates
  useEffect(() => {
    if (coverage?.startDate && !bankAccount?.startDate) {
      setStartDate(coverage.startDate);
    }
    if (coverage?.endDate && !bankAccount?.endDate) {
      setEndDate(coverage.endDate);
    }
  }, [coverage, bankAccount]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // 1. Bank Name
    const effectiveBank = bankName === "Other Bank" ? customBankName.trim() : bankName.trim();
    if (!effectiveBank) {
      newErrors.bankName = "Please select or enter your bank name.";
    }

    // 2. Account Holder Name
    if (!accountHolderName.trim() || accountHolderName.trim().length < 2) {
      newErrors.accountHolderName = "Account holder name is required.";
    }

    // 3. Account Number
    const rawAcc = accountNumber.replace(/\s+/g, "");
    if (!rawAcc) {
      newErrors.accountNumber = "Account number is required.";
    } else if (!/^\d{9,18}$/.test(rawAcc)) {
      newErrors.accountNumber = "Account number must be between 9 and 18 digits.";
    }

    // 4. IFSC Code
    const cleanIfsc = ifscCode.trim().toUpperCase();
    if (!cleanIfsc) {
      newErrors.ifscCode = "IFSC code is required.";
    } else if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(cleanIfsc)) {
      newErrors.ifscCode = "Invalid IFSC format. Example: SBIN0001234 (4 letters, 0, 6 characters).";
    }

    // 5. Statement Dates
    if (!startDate) {
      newErrors.startDate = "Statement start date is required.";
    }
    if (!endDate) {
      newErrors.endDate = "Statement end date is required.";
    }
    if (startDate && endDate && startDate > endDate) {
      newErrors.endDate = "End date must be on or after start date.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const effectiveBank = bankName === "Other Bank" ? customBankName.trim() : bankName.trim();
    const cleanIfsc = ifscCode.trim().toUpperCase();
    const rawAcc = accountNumber.replace(/\s+/g, "");

    const updatedAccount: BankAccountDetails = {
      bankName: effectiveBank,
      accountHolderName: accountHolderName.trim(),
      accountNumber: rawAcc,
      accountType,
      ifscCode: cleanIfsc,
      startDate,
      endDate,
      nickname: nickname.trim() || undefined,
      isSaved: true,
    };

    setBankAccount(updatedAccount);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 4000);
  };

  const getMaskedAccountDisplay = () => {
    const raw = accountNumber.replace(/\s+/g, "");
    if (raw.length <= 4) return raw;
    return `•••• •••• ${raw.slice(-4)}`;
  };

  return (
    <div className="bg-white rounded-2xl border border-rule shadow-sm p-6 sm:p-8 space-y-6 box-border">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-rule pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-blue-600" />
            <h2 className="text-lg font-serif font-bold text-ink">
              Bank Account Details
            </h2>
          </div>
          <p className="text-xs text-ink-soft mt-0.5">
            Identify the primary account linked to your uploaded statement records
          </p>
        </div>

        <div className="flex items-center gap-1.5 text-[11px] font-mono text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Session-Only: Never Transmitted</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 text-xs font-mono">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Bank Name Dropdown */}
          <div className="space-y-1">
            <label className="font-bold text-ink block">Bank Name *</label>
            <select
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-paper border border-rule text-ink focus:outline-none focus:ring-1 focus:ring-blue-500 font-sans text-xs"
            >
              {COMMON_BANKS.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
            {bankName === "Other Bank" && (
              <input
                type="text"
                placeholder="Enter bank name"
                value={customBankName}
                onChange={(e) => setCustomBankName(e.target.value)}
                className="w-full mt-1.5 px-3 py-2 rounded-xl bg-paper border border-rule text-ink font-sans text-xs"
              />
            )}
            {errors.bankName && <p className="text-rose-600 text-[11px]">{errors.bankName}</p>}
          </div>

          {/* Account Holder Name */}
          <div className="space-y-1">
            <label className="font-bold text-ink block">Account Holder Name *</label>
            <input
              type="text"
              placeholder="e.g. Priya Sharma"
              value={accountHolderName}
              onChange={(e) => setAccountHolderName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-paper border border-rule text-ink font-sans text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            {errors.accountHolderName && (
              <p className="text-rose-600 text-[11px]">{errors.accountHolderName}</p>
            )}
          </div>

          {/* Account Number with Masked Toggle */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="font-bold text-ink block">Account Number *</label>
              <button
                type="button"
                onClick={() => setShowAccountNumber(!showAccountNumber)}
                className="text-[11px] text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
              >
                {showAccountNumber ? (
                  <>
                    <EyeOff className="w-3 h-3" />
                    <span>Mask</span>
                  </>
                ) : (
                  <>
                    <Eye className="w-3 h-3" />
                    <span>Reveal</span>
                  </>
                )}
              </button>
            </div>
            <div className="relative">
              <input
                type={showAccountNumber ? "text" : "password"}
                placeholder="Enter 9 to 18 digit account number"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value.replace(/[^0-9]/g, ""))}
                maxLength={18}
                className="w-full px-3 py-2 rounded-xl bg-paper border border-rule text-ink font-mono text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 tracking-wider"
              />
            </div>
            {!showAccountNumber && accountNumber.length > 4 && (
              <span className="text-[10px] text-ink-soft block font-mono">
                Masked preview: {getMaskedAccountDisplay()}
              </span>
            )}
            {errors.accountNumber && (
              <p className="text-rose-600 text-[11px]">{errors.accountNumber}</p>
            )}
          </div>

          {/* Account Type */}
          <div className="space-y-1">
            <label className="font-bold text-ink block">Account Type *</label>
            <div className="grid grid-cols-3 gap-2 pt-0.5">
              {(["Savings", "Current", "Other"] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setAccountType(type)}
                  className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-colors cursor-pointer ${
                    accountType === type
                      ? "bg-blue-50 border-blue-500 text-blue-900"
                      : "bg-paper border-rule text-ink-soft hover:bg-slate-50"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* IFSC Code */}
          <div className="space-y-1">
            <label className="font-bold text-ink block">IFSC Code *</label>
            <input
              type="text"
              placeholder="e.g. SBIN0001234"
              value={ifscCode}
              onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
              maxLength={11}
              className="w-full px-3 py-2 rounded-xl bg-paper border border-rule text-ink font-mono text-xs uppercase focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            {errors.ifscCode && <p className="text-rose-600 text-[11px]">{errors.ifscCode}</p>}
          </div>

          {/* Optional Account Nickname */}
          <div className="space-y-1">
            <label className="font-bold text-ink block">
              Account Nickname <span className="font-normal text-ink-soft">(Optional)</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Campus Pocket Account"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-paper border border-rule text-ink font-sans text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Statement Period Start Date */}
          <div className="space-y-1">
            <label className="font-bold text-ink block">Statement Start Date *</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-paper border border-rule text-ink font-mono text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            {errors.startDate && <p className="text-rose-600 text-[11px]">{errors.startDate}</p>}
          </div>

          {/* Statement Period End Date */}
          <div className="space-y-1">
            <label className="font-bold text-ink block">Statement End Date *</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-paper border border-rule text-ink font-mono text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            {errors.endDate && <p className="text-rose-600 text-[11px]">{errors.endDate}</p>}
          </div>
        </div>

        {/* Security Disclosure Notice */}
        <div className="p-3 rounded-xl bg-slate-50 border border-rule text-[11px] text-ink-soft flex items-start gap-2 leading-relaxed">
          <Lock className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
          <span>
            Privacy Notice: Account details remain strictly in your browser session for statement cross-verification.
            Ascend never requests banking passwords, OTPs, or connects directly to your financial institution.
          </span>
        </div>

        {/* Action Row */}
        <div className="flex items-center justify-between pt-2">
          {saveSuccess ? (
            <div className="inline-flex items-center gap-1.5 text-xs text-emerald-700 font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Account details verified & saved in session.</span>
            </div>
          ) : (
            <span className="text-[11px] text-ink-soft">
              * Required fields for audit verification
            </span>
          )}

          <button
            type="submit"
            className="px-5 py-2.5 rounded-full bg-pin-red hover:bg-pin-pressed text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-2"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Save Account Details</span>
          </button>
        </div>
      </form>
    </div>
  );
}
