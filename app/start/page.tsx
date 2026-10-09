"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/supabase/auth-context";
import { useApp } from "@/lib/context/AppContext";
import { SimulationBadge } from "@/components/SimulationBadge";
import { SUPPORTED_INSTITUTIONS } from "@/config/institutions";
import { ShieldCheck, AlertCircle, CheckCircle, ArrowRight, Lock, EyeOff, Ban } from "lucide-react";

export default function StartEligibilityPage() {
  const router = useRouter();
  const { user, profile: authProfile, updateProfile } = useAuth();
  const { profile, setProfile, consents, setConsents, saveConsentsToDatabase } = useApp();

  const [step, setStep] = useState<"eligibility" | "consent">("eligibility");
  const [legalName, setLegalName] = useState(profile.name || authProfile?.display_name || "");
  const [dob, setDob] = useState(profile.dob || authProfile?.date_of_birth || "2003-05-20");
  const [collegeSearch, setCollegeSearch] = useState("");
  const [selectedCollege, setSelectedCollege] = useState(profile.college || authProfile?.institution || "");
  const [isCustomCollege, setIsCustomCollege] = useState(false);
  const [customCollege, setCustomCollege] = useState("");
  const [email, setEmail] = useState(profile.email || authProfile?.email || "");
  const [program, setProgram] = useState(profile.courseProgram || authProfile?.course_program || "B.Tech / B.E.");
  const [gradYear, setGradYear] = useState<number>(profile.graduationYear || authProfile?.graduation_year || 2025);
  const [ageError, setAgeError] = useState("");
  const [consentError, setConsentError] = useState("");

  useEffect(() => {
    if (authProfile) {
      if (!legalName) setLegalName(authProfile.display_name || "");
      if (!email) setEmail(authProfile.email || "");
      if (!selectedCollege) setSelectedCollege(authProfile.institution || "");
      if (authProfile.date_of_birth) setDob(authProfile.date_of_birth);
      if (authProfile.course_program) setProgram(authProfile.course_program);
      if (authProfile.graduation_year) setGradYear(authProfile.graduation_year);
    }
  }, [authProfile]);

  const filteredColleges = SUPPORTED_INSTITUTIONS.filter(
    (c) =>
      c.name.toLowerCase().includes(collegeSearch.toLowerCase()) ||
      c.city.toLowerCase().includes(collegeSearch.toLowerCase())
  );

  const calculateAge = (dobString: string): number => {
    if (!dobString) return 0;
    const birthDate = new Date(dobString);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const handleEligibilitySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAgeError("");

    const age = calculateAge(dob);
    if (age < 18) {
      setAgeError("You must be at least 18 years old to apply for starter credit under Indian lending guidelines.");
      return;
    }

    const finalCollege = isCustomCollege ? customCollege.trim() : selectedCollege.trim();
    if (!finalCollege) {
      setAgeError("Please select or enter your institution.");
      return;
    }

    setProfile({
      name: legalName,
      dob,
      is18Plus: true,
      college: finalCollege,
      isClusterApproved: true,
      email,
      courseProgram: program,
      graduationYear: gradYear,
    });

    if (user) {
      await updateProfile({
        display_name: legalName,
        institution: finalCollege,
        course_program: program,
        graduation_year: gradYear,
        date_of_birth: dob,
      });
    }

    setStep("consent");
  };

  const handleConsentProceed = async () => {
    if (!consents.bankTransactions) {
      setConsentError("Consent for cash flow assessment is required to read transactions and compute starter limit.");
      return;
    }

    await saveConsentsToDatabase(consents);
    router.push("/link");
  };

  return (
    <div className="max-w-2xl mx-auto py-4 space-y-8">
      {/* Step Indicators */}
      <div className="flex items-center justify-between border-b border-rule pb-3 font-mono text-xs">
        <div className="flex items-center gap-2">
          <span
            className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
              step === "eligibility" ? "bg-vermilion text-paper" : "bg-ledger-green text-paper"
            }`}
          >
            1
          </span>
          <span className={step === "eligibility" ? "font-bold text-ink" : "text-ink-soft"}>Eligibility</span>
        </div>

        <div className="w-12 h-0.5 bg-rule" />

        <div className="flex items-center gap-2">
          <span
            className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
              step === "consent" ? "bg-vermilion text-paper" : "bg-paper-2 text-ink-soft border border-rule"
            }`}
          >
            2
          </span>
          <span className={step === "consent" ? "font-bold text-ink" : "text-ink-soft"}>Consent</span>
        </div>

        <div className="w-12 h-0.5 bg-rule" />

        <div className="flex items-center gap-2 text-ink-soft">
          <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold bg-paper-2 border border-rule">
            3
          </span>
          <span>Bank Data</span>
        </div>
      </div>

      {step === "eligibility" ? (
        /* Step 1: Student Eligibility Form */
        <div className="bg-paper-2 border border-rule rounded-xl p-6 sm:p-8 space-y-6">
          <div>
            <div className="flex items-center justify-between">
              <h1 className="font-serif font-bold text-2xl text-ink">Student Eligibility Check</h1>
              <SimulationBadge label="NATIONWIDE PILOT" size="sm" />
            </div>
            <p className="text-xs text-ink-soft mt-1">
              Ascend offers responsible starter credit to enrolled students across colleges in India. Complete your enrollment details below.
            </p>
          </div>

          {!user && (
            <div className="p-3 rounded-lg bg-paper border border-rule/80 text-xs flex items-center justify-between">
              <span className="text-ink-soft">Already created your student account?</span>
              <Link href="/login" className="text-ledger-green font-semibold hover:underline">
                Sign in to sync your records
              </Link>
            </div>
          )}

          <form onSubmit={handleEligibilitySubmit} className="space-y-4 text-xs font-mono">
            {/* Legal Name */}
            <div>
              <label className="block text-ink font-semibold mb-1">Full Legal Name</label>
              <input
                type="text"
                required
                value={legalName}
                onChange={(e) => setLegalName(e.target.value)}
                placeholder="e.g. Ananya Sen"
                className="w-full p-2.5 rounded bg-paper border border-rule text-ink focus:outline-none focus:ring-1 focus:ring-ink"
              />
              <p className="text-[10px] text-ink-soft mt-1">
                Must match your government identity document and college records.
              </p>
            </div>

            {/* DOB */}
            <div>
              <label className="block text-ink font-semibold mb-1">Date of Birth (Must be 18+)</label>
              <input
                type="date"
                required
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="w-full p-2.5 rounded bg-paper border border-rule text-ink focus:outline-none focus:ring-1 focus:ring-ink"
              />
              {ageError && (
                <p className="text-vermilion text-[11px] font-sans font-semibold mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{ageError}</span>
                </p>
              )}
            </div>

            {/* College Selector */}
            <div>
              <label className="block text-ink font-semibold mb-1">College or University</label>
              {!isCustomCollege ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={collegeSearch}
                    onChange={(e) => setCollegeSearch(e.target.value)}
                    placeholder="Search your college or city..."
                    className="w-full p-2.5 rounded bg-paper border border-rule text-ink focus:outline-none focus:ring-1 focus:ring-ink"
                  />
                  <div className="max-h-36 overflow-y-auto border border-rule rounded bg-paper divide-y divide-rule/40">
                    {filteredColleges.slice(0, 5).map((col) => (
                      <button
                        key={col.id}
                        type="button"
                        onClick={() => {
                          setSelectedCollege(col.name);
                          setCollegeSearch(col.name);
                        }}
                        className={`w-full text-left p-2 text-xs flex justify-between items-center ${
                          selectedCollege === col.name ? "bg-ledger-green/10 text-ledger-green font-bold" : "text-ink hover:bg-paper-2"
                        }`}
                      >
                        <span>{col.name}</span>
                        <span className="text-[10px] text-ink-soft">{col.city}</span>
                      </button>
                    ))}
                  </div>
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-ink-soft">
                      Selected: <strong className="text-ink">{selectedCollege || "None"}</strong>
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setIsCustomCollege(true);
                        setSelectedCollege("");
                      }}
                      className="text-ledger-green hover:underline cursor-pointer"
                    >
                      Other college not in list
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-1">
                  <input
                    type="text"
                    required
                    value={customCollege}
                    onChange={(e) => setCustomCollege(e.target.value)}
                    placeholder="Enter full institution name and city"
                    className="w-full p-2.5 rounded bg-paper border border-rule text-ink focus:outline-none focus:ring-1 focus:ring-ink"
                  />
                  <button
                    type="button"
                    onClick={() => setIsCustomCollege(false)}
                    className="text-[11px] text-ink-soft hover:underline cursor-pointer"
                  >
                    Back to college search list
                  </button>
                </div>
              )}
            </div>

            {/* Email and Degree */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-ink font-semibold mb-1">Student Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@univ.edu.in"
                  className="w-full p-2.5 rounded bg-paper border border-rule text-ink focus:outline-none focus:ring-1 focus:ring-ink"
                />
              </div>

              <div>
                <label className="block text-ink font-semibold mb-1">Program and Grad Year</label>
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={program}
                    onChange={(e) => setProgram(e.target.value)}
                    className="p-2.5 rounded bg-paper border border-rule text-ink focus:outline-none focus:ring-1 focus:ring-ink text-[11px]"
                  >
                    <option value="B.Tech / B.E.">B.Tech</option>
                    <option value="B.Com">B.Com</option>
                    <option value="B.Sc">B.Sc</option>
                    <option value="B.A.">B.A.</option>
                    <option value="M.B.A.">M.B.A.</option>
                  </select>
                  <select
                    value={gradYear}
                    onChange={(e) => setGradYear(Number(e.target.value))}
                    className="p-2.5 rounded bg-paper border border-rule text-ink focus:outline-none focus:ring-1 focus:ring-ink text-[11px]"
                  >
                    <option value={2024}>2024</option>
                    <option value={2025}>2025</option>
                    <option value={2026}>2026</option>
                    <option value={2027}>2027</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 rounded bg-ledger-green text-paper font-mono font-bold text-xs shadow hover:bg-[#23472c] transition-colors flex items-center gap-2 cursor-pointer"
              >
                <span>Continue to Data Consent</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* Step 2: Per-Purpose Consent Cards */
        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between">
              <h1 className="font-serif font-bold text-2xl text-ink">Per-Purpose Data Consent</h1>
              <SimulationBadge label="DPDP ACT READY" size="sm" />
            </div>
            <p className="text-xs text-ink-soft mt-1">
              Under India's Digital Personal Data Protection Act, you control what is shared, why it is needed, and how long it is stored. Consents are not preselected.
            </p>
          </div>

          {consentError && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-800 text-xs">
              {consentError}
            </div>
          )}

          {/* Consent Cards */}
          <div className="space-y-3">
            {/* Card 1: Bank Transactions */}
            <div className="p-4 rounded-lg bg-paper-2 border border-rule space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-serif font-bold text-sm text-ink">1. Bank Statement Transactions</h3>
                  <span className="text-[11px] text-ink-soft font-mono">Purpose: Deterministic cash flow limit calculation</span>
                </div>
                <input
                  type="checkbox"
                  checked={consents.bankTransactions}
                  onChange={(e) => {
                    setConsents({ ...consents, bankTransactions: e.target.checked });
                    setConsentError("");
                  }}
                  className="w-4 h-4 accent-ledger-green cursor-pointer"
                />
              </div>
              <div className="text-[11px] text-ink-soft space-y-1">
                <p><strong>What is read:</strong> Transaction dates, narrations, debits, credits, and balances.</p>
                <p><strong>Retention:</strong> Retained for active credit line assessment (max 90 days if idle).</p>
                <p className="font-mono text-ledger-green"><strong>Your right:</strong> Revocable anytime with one tap on Privacy page.</p>
              </div>
            </div>

            {/* Card 2: Identity */}
            <div className="p-4 rounded-lg bg-paper-2 border border-rule space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-serif font-bold text-sm text-ink">2. Identity Verification</h3>
                  <span className="text-[11px] text-ink-soft font-mono">Purpose: Verifying applicant age (18+) and enrollment</span>
                </div>
                <input
                  type="checkbox"
                  checked={consents.identityVerification}
                  onChange={(e) => setConsents({ ...consents, identityVerification: e.target.checked })}
                  className="w-4 h-4 accent-ledger-green cursor-pointer"
                />
              </div>
              <div className="text-[11px] text-ink-soft space-y-1">
                <p><strong>What is read:</strong> Legal name and college identity details.</p>
                <p><strong>Retention:</strong> Audit logs preserved as mandated by RBI lending partner compliance.</p>
              </div>
            </div>

            {/* Card 3: College Enrollment */}
            <div className="p-4 rounded-lg bg-paper-2 border border-rule space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-serif font-bold text-sm text-ink">3. Enrollment and Partner Reporting</h3>
                  <span className="text-[11px] text-ink-soft font-mono">Purpose: Monthly repayment reporting to credit bureau</span>
                </div>
                <input
                  type="checkbox"
                  checked={consents.collegeEnrolment}
                  onChange={(e) => setConsents({ ...consents, collegeEnrolment: e.target.checked })}
                  className="w-4 h-4 accent-ledger-green cursor-pointer"
                />
              </div>
              <div className="text-[11px] text-ink-soft space-y-1">
                <p><strong>What is shared:</strong> On-time repayment status reported to simulated credit bureau.</p>
                <p className="font-mono text-ledger-green"><strong>Positive impact:</strong> Builds verifiable starter credit score.</p>
              </div>
            </div>
          </div>

          {/* Hard Guardrails Notice */}
          <div className="p-4 rounded-lg bg-paper border border-rule space-y-3">
            <h4 className="font-mono font-bold text-xs uppercase tracking-wider text-ink flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-ledger-green" />
              <span>Ascend Non-Negotiable Privacy Guarantees</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-[11px] text-ink-soft">
              <div className="flex items-center gap-1.5">
                <Ban className="w-3.5 h-3.5 text-vermilion" />
                <span>No phone contacts access</span>
              </div>
              <div className="flex items-center gap-1.5">
                <EyeOff className="w-3.5 h-3.5 text-vermilion" />
                <span>No gallery or camera access</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-ledger-green" />
                <span>No data selling to third parties</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={() => setStep("eligibility")}
              className="text-xs font-mono text-ink-soft hover:underline cursor-pointer"
            >
              Back to Eligibility
            </button>

            <button
              type="button"
              onClick={handleConsentProceed}
              className="px-6 py-2.5 rounded bg-ledger-green text-paper font-mono font-bold text-xs shadow hover:bg-[#23472c] transition-colors flex items-center gap-2 cursor-pointer"
            >
              <span>Grant Consent and Link Bank Data</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
