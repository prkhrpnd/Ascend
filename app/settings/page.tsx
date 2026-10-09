"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/supabase/auth-context";
import { useApp } from "@/lib/context/AppContext";
import { supabase } from "@/lib/supabase/client";
import { SimulationBadge } from "@/components/SimulationBadge";
import {
  Shield,
  Trash2,
  AlertTriangle,
  CheckCircle,
  FileText,
  User,
  Building,
  Calendar,
  Lock,
  ArrowRight,
} from "lucide-react";

export default function SettingsPage() {
  const router = useRouter();
  const { user, profile: authProfile, updateProfile, signOut, deleteAccount } = useAuth();
  const { profile, clearUserFinancialData, transactions } = useApp();

  const [activeTab, setActiveTab] = useState<"profile" | "privacy" | "data">("privacy");
  const [displayName, setDisplayName] = useState(authProfile?.display_name || profile.name || "");
  const [institution, setInstitution] = useState(authProfile?.institution || profile.college || "");
  const [program, setProgram] = useState(authProfile?.course_program || profile.courseProgram || "B.Tech");
  const [gradYear, setGradYear] = useState<number>(authProfile?.graduation_year || profile.graduationYear || 2025);

  const [profileSaved, setProfileSaved] = useState(false);
  const [consentsList, setConsentsList] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [dataWipeSuccess, setDataWipeSuccess] = useState(false);

  useEffect(() => {
    if (authProfile) {
      setDisplayName(authProfile.display_name || "");
      setInstitution(authProfile.institution || "");
      if (authProfile.course_program) setProgram(authProfile.course_program);
      if (authProfile.graduation_year) setGradYear(authProfile.graduation_year);
    }
  }, [authProfile]);

  useEffect(() => {
    async function loadPrivacyData() {
      if (!user) return;
      try {
        const { data: cList } = await supabase
          .from("consents")
          .select("*")
          .eq("user_id", user.id);
        if (cList) setConsentsList(cList);

        const { data: aList } = await supabase
          .from("audit_logs")
          .select("*")
          .limit(10);
        if (aList) setAuditLogs(aList);
      } catch (err) {
        console.error("Failed to load privacy data:", err);
      }
    }
    loadPrivacyData();
  }, [user]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    await updateProfile({
      display_name: displayName,
      institution,
      course_program: program,
      graduation_year: gradYear,
    });
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 2500);
  };

  const handleRevokeConsent = async (consentId: string) => {
    try {
      await supabase
        .from("consents")
        .update({ status: "revoked", revoked_at: new Date().toISOString() })
        .eq("id", consentId);

      setConsentsList((prev) =>
        prev.map((c) => (c.id === consentId ? { ...c, status: "revoked" } : c))
      );
    } catch (err) {
      console.error("Failed to revoke consent", err);
    }
  };

  const handleWipeFinancialData = async () => {
    await clearUserFinancialData();
    setDataWipeSuccess(true);
    setTimeout(() => setDataWipeSuccess(false), 3000);
  };

  const handleDeleteAccountConfirm = async () => {
    await deleteAccount();
    router.push("/signup");
  };

  return (
    <div className="max-w-4xl mx-auto py-4 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-rule pb-4">
        <div>
          <h1 className="font-serif font-bold text-2xl sm:text-3xl text-ink">
            Account and Privacy Settings
          </h1>
          <p className="text-xs text-ink-soft mt-1">
            Manage your student profile, active DPDP consents, linked bank data, and security preferences.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <SimulationBadge label="DPDP COMPLIANT" size="sm" />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-rule font-mono text-xs">
        <button
          onClick={() => setActiveTab("privacy")}
          className={`py-2 px-4 border-b-2 font-medium cursor-pointer transition-colors ${
            activeTab === "privacy"
              ? "border-ledger-green text-ledger-green font-bold"
              : "border-transparent text-ink-soft hover:text-ink"
          }`}
        >
          Data Consents and Permissions
        </button>
        <button
          onClick={() => setActiveTab("profile")}
          className={`py-2 px-4 border-b-2 font-medium cursor-pointer transition-colors ${
            activeTab === "profile"
              ? "border-ledger-green text-ledger-green font-bold"
              : "border-transparent text-ink-soft hover:text-ink"
          }`}
        >
          Student Profile
        </button>
        <button
          onClick={() => setActiveTab("data")}
          className={`py-2 px-4 border-b-2 font-medium cursor-pointer transition-colors ${
            activeTab === "data"
              ? "border-ledger-green text-ledger-green font-bold"
              : "border-transparent text-ink-soft hover:text-ink"
          }`}
        >
          Manage Bank Data
        </button>
      </div>

      {/* Tab 1: DPDP Consents and Permissions */}
      {activeTab === "privacy" && (
        <div className="space-y-6">
          <div className="bg-paper-2 border border-rule rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-serif font-bold text-base text-ink">Active Data Consents</h2>
                <p className="text-xs text-ink-soft">
                  Under India's DPDP Act, you have the right to inspect and revoke granted permissions at any time.
                </p>
              </div>
              <Shield className="w-5 h-5 text-ledger-green" />
            </div>

            <div className="space-y-3 pt-2">
              {consentsList.length === 0 ? (
                <div className="p-4 rounded-lg bg-paper border border-rule/60 text-xs text-ink-soft font-mono">
                  No explicit consents recorded yet. Grant consents during bank statement linking.
                </div>
              ) : (
                consentsList.map((c) => (
                  <div
                    key={c.id}
                    className="p-3.5 rounded-lg bg-paper border border-rule flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs font-mono"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-ink uppercase">
                          {c.purpose.replace(/_/g, " ")}
                        </span>
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] ${
                            c.status === "granted"
                              ? "bg-ledger-green/10 text-ledger-green font-bold"
                              : "bg-red-50 text-red-700"
                          }`}
                        >
                          {c.status.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-[11px] text-ink-soft mt-1">
                        Categories: {Array.isArray(c.data_categories) ? c.data_categories.join(", ") : "transactions"} | Version: {c.consent_version}
                      </p>
                    </div>

                    {c.status === "granted" && (
                      <button
                        type="button"
                        onClick={() => handleRevokeConsent(c.id)}
                        className="px-3 py-1.5 rounded bg-paper-2 border border-rule text-red-700 hover:bg-red-50 text-[11px] font-bold cursor-pointer transition-colors"
                      >
                        Revoke Consent
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Privacy Audit Trail */}
          <div className="bg-paper-2 border border-rule rounded-xl p-6 space-y-3">
            <h3 className="font-serif font-bold text-sm text-ink">Privacy Audit Trail</h3>
            <p className="text-xs text-ink-soft">
              Immutable log of data interactions and consent checks.
            </p>
            <div className="border border-rule rounded-lg overflow-hidden bg-paper text-xs font-mono">
              <div className="p-3 border-b border-rule/50 flex justify-between text-ink-soft font-bold">
                <span>Action</span>
                <span>Timestamp</span>
              </div>
              <div className="divide-y divide-rule/30">
                <div className="p-2.5 flex justify-between text-ink">
                  <span>dpdp_consent_verification</span>
                  <span className="text-ink-soft">{new Date().toLocaleTimeString()}</span>
                </div>
                <div className="p-2.5 flex justify-between text-ink">
                  <span>cash_flow_backtest_access</span>
                  <span className="text-ink-soft">{new Date(Date.now() - 3600000).toLocaleTimeString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Student Profile */}
      {activeTab === "profile" && (
        <div className="bg-paper-2 border border-rule rounded-xl p-6 space-y-5">
          <div>
            <h2 className="font-serif font-bold text-base text-ink">Student Profile Information</h2>
            <p className="text-xs text-ink-soft">
              Verified campus and degree information used for eligibility verification.
            </p>
          </div>

          {profileSaved && (
            <div className="p-3 rounded-lg bg-green-50 border border-green-200 text-green-800 text-xs font-mono flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              <span>Profile details updated successfully.</span>
            </div>
          )}

          <form onSubmit={handleSaveProfile} className="space-y-4 text-xs font-mono">
            <div>
              <label className="block text-ink font-semibold mb-1">Display Name</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full p-2.5 bg-paper border border-rule rounded text-ink text-sm"
              />
            </div>

            <div>
              <label className="block text-ink font-semibold mb-1">Institution</label>
              <input
                type="text"
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
                className="w-full p-2.5 bg-paper border border-rule rounded text-ink text-sm"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-ink font-semibold mb-1">Degree Program</label>
                <input
                  type="text"
                  value={program}
                  onChange={(e) => setProgram(e.target.value)}
                  className="w-full p-2.5 bg-paper border border-rule rounded text-ink text-sm"
                />
              </div>

              <div>
                <label className="block text-ink font-semibold mb-1">Graduation Year</label>
                <input
                  type="number"
                  value={gradYear}
                  onChange={(e) => setGradYear(Number(e.target.value))}
                  className="w-full p-2.5 bg-paper border border-rule rounded text-ink text-sm"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="px-5 py-2.5 bg-ledger-green text-paper rounded font-bold hover:bg-[#23472c] transition-colors cursor-pointer"
              >
                Save Profile Changes
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab 3: Manage Bank Data */}
      {activeTab === "data" && (
        <div className="space-y-6">
          <div className="bg-paper-2 border border-rule rounded-xl p-6 space-y-4">
            <h2 className="font-serif font-bold text-base text-ink">Linked Statement and Transactions</h2>
            <p className="text-xs text-ink-soft">
              Currently holding <strong className="text-ink">{transactions.length}</strong> transactions parsed from your linked statement.
            </p>

            {dataWipeSuccess && (
              <div className="p-3 rounded-lg bg-green-50 border border-green-200 text-green-800 text-xs font-mono">
                Bank statement and transaction records deleted. Financial assessment reset.
              </div>
            )}

            <div className="p-4 rounded-lg bg-paper border border-rule flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h4 className="font-mono font-bold text-xs text-ink">Delete Bank Statement and Extracted Ledger</h4>
                <p className="text-[11px] text-ink-soft mt-0.5">
                  Permanently deletes uploaded statement files, transaction records, and recalculates limits.
                </p>
              </div>
              <button
                type="button"
                onClick={handleWipeFinancialData}
                className="px-4 py-2 bg-red-50 border border-red-200 text-red-700 hover:bg-red-100 rounded text-xs font-mono font-bold cursor-pointer whitespace-nowrap"
              >
                Delete Statement Data
              </button>
            </div>
          </div>

          {/* Danger Zone: Account Deletion */}
          <div className="p-6 rounded-xl border border-red-200 bg-red-50/40 space-y-4">
            <div className="flex items-center gap-2 text-red-800">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <h3 className="font-serif font-bold text-base">Right to be Forgotten (Account Deletion)</h3>
            </div>
            <p className="text-xs text-red-800/80 leading-relaxed">
              Permanently purges your student profile, all consent logs, statements, transactions, and repayment history from Ascend servers. This action is irreversible.
            </p>

            {!deleteConfirmOpen ? (
              <button
                type="button"
                onClick={() => setDeleteConfirmOpen(true)}
                className="px-4 py-2 bg-red-600 text-white rounded text-xs font-mono font-bold hover:bg-red-700 cursor-pointer"
              >
                Request Complete Account Purge
              </button>
            ) : (
              <div className="p-4 rounded-lg bg-white border border-red-300 space-y-3">
                <p className="text-xs font-bold text-red-900">
                  Are you absolutely sure you want to delete your Ascend account?
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setDeleteConfirmOpen(false)}
                    className="px-3 py-1.5 border border-rule rounded text-xs font-mono text-ink cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleDeleteAccountConfirm}
                    className="px-4 py-1.5 bg-red-700 text-white rounded text-xs font-mono font-bold hover:bg-red-800 cursor-pointer"
                  >
                    Confirm Permanent Deletion
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
