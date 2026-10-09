"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/supabase/auth-context";
import { SUPPORTED_INSTITUTIONS, Institution } from "@/config/institutions";

export default function SignUpPage() {
  const router = useRouter();
  const { signUp, isLiveDb } = useAuth();

  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [institutionSearch, setInstitutionSearch] = useState("");
  const [selectedInstitution, setSelectedInstitution] = useState<string>("");
  const [isCustomInstitution, setIsCustomInstitution] = useState(false);
  const [customInstitutionName, setCustomInstitutionName] = useState("");
  const [courseProgram, setCourseProgram] = useState("B.Tech / B.E.");
  const [graduationYear, setGraduationYear] = useState<number>(2025);
  const [dateOfBirth, setDateOfBirth] = useState("2003-08-15");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Filter institutions based on search query
  const filteredInstitutions = SUPPORTED_INSTITUTIONS.filter((inst) =>
    inst.name.toLowerCase().includes(institutionSearch.toLowerCase()) ||
    inst.city.toLowerCase().includes(institutionSearch.toLowerCase())
  );

  const calculateAge = (dobString: string): number => {
    if (!dobString) return 0;
    const dob = new Date(dobString);
    const diffMs = Date.now() - dob.getTime();
    const ageDt = new Date(diffMs);
    return Math.abs(ageDt.getUTCFullYear() - 1970);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const institutionFinal = isCustomInstitution
      ? customInstitutionName.trim()
      : selectedInstitution.trim();

    if (!institutionFinal) {
      setError("Please select or specify your college or university.");
      return;
    }

    const age = calculateAge(dateOfBirth);
    if (age < 18) {
      setError("You must be at least 18 years old to apply for an Ascend credit line under RBI regulations.");
      return;
    }

    setLoading(true);

    try {
      const { error: signUpError } = await signUp({
        email,
        password,
        displayName,
        institution: institutionFinal,
        courseProgram,
        graduationYear,
        dateOfBirth,
      });

      if (signUpError) {
        setError(signUpError.message || "Failed to create account. Please check your details.");
        setLoading(false);
        return;
      }

      // Route to consent and data onboarding
      router.push("/start");
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred during account creation.");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto pt-4 pb-12">
      <div className="text-center mb-6">
        <span className="inline-block px-3 py-1 rounded-full text-xs font-mono font-medium tracking-wide bg-paper-2 border border-rule text-ink-soft mb-3">
          {isLiveDb ? "CLOUD SUPABASE REGISTRATION" : "SECURE LOCAL STORAGE REGISTRATION"}
        </span>
        <h1 className="text-3xl font-serif font-bold text-ink tracking-tight">
          Create your student account
        </h1>
        <p className="mt-2 text-sm text-ink-soft max-w-md mx-auto">
          Start building your verifiable credit track record. Open to verified students across colleges nationwide.
        </p>
      </div>

      <div className="bg-paper-2 border border-rule rounded-xl p-6 sm:p-8 shadow-sm">
        {error && (
          <div className="mb-5 p-3 rounded-lg bg-red-50 border border-red-200 text-red-800 text-sm">
            <p className="font-medium">Registration alert</p>
            <p className="text-xs mt-0.5">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono font-semibold uppercase tracking-wider text-ink-soft mb-1">
              Full Legal Name
            </label>
            <input
              type="text"
              required
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="e.g. Ananya Sen"
              className="w-full px-3.5 py-2.5 bg-paper border border-rule rounded-lg text-ink text-sm focus:outline-none focus:ring-2 focus:ring-ledger-green/50 focus:border-ledger-green"
            />
            <p className="text-[11px] text-ink-soft mt-1">
              Must match your college student card or government ID.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono font-semibold uppercase tracking-wider text-ink-soft mb-1">
                Student Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ananya@univ.ac.in"
                className="w-full px-3.5 py-2.5 bg-paper border border-rule rounded-lg text-ink text-sm focus:outline-none focus:ring-2 focus:ring-ledger-green/50 focus:border-ledger-green"
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-semibold uppercase tracking-wider text-ink-soft mb-1">
                Password
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full px-3.5 py-2.5 bg-paper border border-rule rounded-lg text-ink text-sm focus:outline-none focus:ring-2 focus:ring-ledger-green/50 focus:border-ledger-green"
              />
            </div>
          </div>

          {/* College / Institution Selector */}
          <div>
            <label className="block text-xs font-mono font-semibold uppercase tracking-wider text-ink-soft mb-1">
              College or University
            </label>

            {!isCustomInstitution ? (
              <div className="space-y-2">
                <input
                  type="text"
                  value={institutionSearch}
                  onChange={(e) => setInstitutionSearch(e.target.value)}
                  placeholder="Type to search your campus..."
                  className="w-full px-3.5 py-2 bg-paper border border-rule rounded-lg text-ink text-sm focus:outline-none focus:ring-2 focus:ring-ledger-green/50"
                />

                <div className="max-h-36 overflow-y-auto border border-rule rounded-lg bg-paper divide-y divide-rule/50">
                  {filteredInstitutions.slice(0, 6).map((inst) => (
                    <button
                      key={inst.id}
                      type="button"
                      onClick={() => {
                        setSelectedInstitution(inst.name);
                        setInstitutionSearch(inst.name);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs flex justify-between items-center transition-colors ${
                        selectedInstitution === inst.name
                          ? "bg-ledger-green/10 text-ledger-green font-semibold"
                          : "text-ink hover:bg-paper-2"
                      }`}
                    >
                      <span>{inst.name}</span>
                      <span className="text-[10px] text-ink-soft font-mono">{inst.city}</span>
                    </button>
                  ))}
                  {filteredInstitutions.length === 0 && (
                    <div className="p-3 text-xs text-ink-soft text-center">
                      No matching institution in quick list.
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-center text-xs pt-1">
                  <span className="text-ink-soft">
                    Selected: <strong className="text-ink">{selectedInstitution || "None"}</strong>
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setIsCustomInstitution(true);
                      setSelectedInstitution("");
                    }}
                    className="text-ledger-green hover:underline font-medium cursor-pointer"
                  >
                    Other institution not listed
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <input
                  type="text"
                  required
                  value={customInstitutionName}
                  onChange={(e) => setCustomInstitutionName(e.target.value)}
                  placeholder="Enter full college name, city and state"
                  className="w-full px-3.5 py-2.5 bg-paper border border-rule rounded-lg text-ink text-sm focus:outline-none focus:ring-2 focus:ring-ledger-green/50"
                />
                <button
                  type="button"
                  onClick={() => setIsCustomInstitution(false)}
                  className="text-xs text-ink-soft hover:text-ink underline cursor-pointer"
                >
                  Return to institution search list
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-mono font-semibold uppercase tracking-wider text-ink-soft mb-1">
                Program / Degree
              </label>
              <select
                value={courseProgram}
                onChange={(e) => setCourseProgram(e.target.value)}
                className="w-full px-3 py-2 bg-paper border border-rule rounded-lg text-ink text-xs focus:outline-none focus:ring-2 focus:ring-ledger-green/50"
              >
                <option value="B.Tech / B.E.">B.Tech / B.E.</option>
                <option value="B.Com">B.Com</option>
                <option value="B.Sc">B.Sc</option>
                <option value="B.A. / Economics">B.A. / Economics</option>
                <option value="B.B.A. / B.M.S.">B.B.A. / B.M.S.</option>
                <option value="M.B.A. / P.G.D.M.">M.B.A. / P.G.D.M.</option>
                <option value="M.Tech / M.Sc">M.Tech / M.Sc</option>
                <option value="Other Degree">Other Degree</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono font-semibold uppercase tracking-wider text-ink-soft mb-1">
                Graduation Year
              </label>
              <select
                value={graduationYear}
                onChange={(e) => setGraduationYear(Number(e.target.value))}
                className="w-full px-3 py-2 bg-paper border border-rule rounded-lg text-ink text-xs focus:outline-none focus:ring-2 focus:ring-ledger-green/50"
              >
                <option value={2024}>2024 (Final Year / Recent)</option>
                <option value={2025}>2025 (Final Year)</option>
                <option value={2026}>2026 (Pre-final Year)</option>
                <option value={2027}>2027</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono font-semibold uppercase tracking-wider text-ink-soft mb-1">
                Date of Birth
              </label>
              <input
                type="date"
                required
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                className="w-full px-3 py-2 bg-paper border border-rule rounded-lg text-ink text-xs focus:outline-none focus:ring-2 focus:ring-ledger-green/50"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-ledger-green text-paper font-medium rounded-lg text-sm hover:bg-[#23472c] transition-colors focus:outline-none focus:ring-2 focus:ring-ledger-green/50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-sm"
            >
              {loading ? "Creating student profile..." : "Create Account and Proceed to Onboarding"}
            </button>
          </div>
        </form>

        <div className="mt-5 p-3 rounded-lg border border-rule/70 bg-paper/50 text-[11px] text-ink-soft leading-relaxed">
          <p className="font-semibold text-ink mb-0.5">Regulatory Notice</p>
          Ascend is not a bank or NBFC. Credit lines are issued and held by regulated partner lenders. Ascend provides underwriting technology and credit-building tools under explicit consent.
        </div>

        <div className="mt-5 pt-4 border-t border-rule/60 text-center text-xs text-ink-soft">
          Already have an account?{" "}
          <Link href="/login" className="text-ledger-green font-semibold hover:underline">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
