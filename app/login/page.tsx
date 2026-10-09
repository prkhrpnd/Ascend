"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/supabase/auth-context";

export default function LoginPage() {
  const router = useRouter();
  const { signIn, isLiveDb } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { error: signInError } = await signIn({ email, password });
      if (signInError) {
        setError(signInError.message || "Failed to sign in. Please verify your email and password.");
        setLoading(false);
        return;
      }

      router.push("/line");
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred during sign in.");
      setLoading(false);
    }
  };

  const handleDemoFill = (studentEmail: string) => {
    setEmail(studentEmail);
    setPassword("StudentPass@123");
  };

  return (
    <div className="max-w-md mx-auto pt-6 pb-12">
      <div className="text-center mb-8">
        <span className="inline-block px-3 py-1 rounded-full text-xs font-mono font-medium tracking-wide bg-paper-2 border border-rule text-ink-soft mb-3">
          {isLiveDb ? "CLOUD SUPABASE AUTH" : "LOCAL ISOLATED AUTH (SANDBOX)"}
        </span>
        <h1 className="text-3xl font-serif font-bold text-ink tracking-tight">
          Welcome back to Ascend
        </h1>
        <p className="mt-2 text-sm text-ink-soft">
          Sign in to access your student credit line, verified cash flow, and bureau records.
        </p>
      </div>

      <div className="bg-paper-2 border border-rule rounded-xl p-6 sm:p-8 shadow-sm">
        {error && (
          <div className="mb-5 p-3 rounded-lg bg-red-50 border border-red-200 text-red-800 text-sm">
            <p className="font-medium">Sign in error</p>
            <p className="text-xs mt-0.5">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-mono font-semibold uppercase tracking-wider text-ink-soft mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@college.edu.in"
              className="w-full px-3.5 py-2.5 bg-paper border border-rule rounded-lg text-ink text-sm focus:outline-none focus:ring-2 focus:ring-ledger-green/50 focus:border-ledger-green"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-mono font-semibold uppercase tracking-wider text-ink-soft">
                Password
              </label>
              <Link
                href="/forgot-password"
                className="text-xs text-ledger-green hover:underline font-medium"
              >
                Forgot password?
              </Link>
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full px-3.5 py-2.5 bg-paper border border-rule rounded-lg text-ink text-sm focus:outline-none focus:ring-2 focus:ring-ledger-green/50 focus:border-ledger-green"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-ledger-green text-paper font-medium rounded-lg text-sm hover:bg-[#23472c] transition-colors focus:outline-none focus:ring-2 focus:ring-ledger-green/50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-sm"
          >
            {loading ? "Signing in..." : "Sign in to Ascend"}
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-rule/60 text-center text-xs text-ink-soft">
          Don't have an account yet?{" "}
          <Link href="/signup" className="text-ledger-green font-semibold hover:underline">
            Create student account
          </Link>
        </div>
      </div>

      {/* Quick Testing Helper */}
      <div className="mt-6 p-4 rounded-xl border border-rule/70 bg-paper/60 text-xs text-ink-soft">
        <p className="font-mono font-semibold text-ink uppercase tracking-wider text-[11px] mb-1.5">
          Quick Demo Credentials
        </p>
        <p className="mb-2 text-ink-soft">
          Click below to populate quick testing login credentials:
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => handleDemoFill("student.tester@univ.ac.in")}
            className="px-2.5 py-1 rounded bg-paper-2 border border-rule hover:border-ink-soft text-[11px] font-mono text-ink cursor-pointer"
          >
            student.tester@univ.ac.in
          </button>
          <button
            type="button"
            onClick={() => handleDemoFill("rahul.sharma@iitd.ac.in")}
            className="px-2.5 py-1 rounded bg-paper-2 border border-rule hover:border-ink-soft text-[11px] font-mono text-ink cursor-pointer"
          >
            rahul.sharma@iitd.ac.in
          </button>
        </div>
      </div>
    </div>
  );
}
