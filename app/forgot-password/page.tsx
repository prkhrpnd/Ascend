"use client";

import React, { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email);
      if (resetError) {
        setError(resetError.message || "Failed to initiate password reset.");
        setLoading(false);
        return;
      }
      setSubmitted(true);
      setLoading(false);
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred.");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto pt-8 pb-12">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-serif font-bold text-ink tracking-tight">
          Reset your password
        </h1>
        <p className="mt-2 text-sm text-ink-soft">
          Enter your registered student email address to receive password recovery instructions.
        </p>
      </div>

      <div className="bg-paper-2 border border-rule rounded-xl p-6 sm:p-8 shadow-sm">
        {submitted ? (
          <div className="text-center py-4 space-y-4">
            <div className="w-12 h-12 bg-ledger-green/10 text-ledger-green rounded-full flex items-center justify-center mx-auto text-xl font-bold">
              ✓
            </div>
            <h3 className="text-base font-serif font-bold text-ink">
              Password Reset Link Generated
            </h3>
            <p className="text-xs text-ink-soft leading-relaxed">
              If an account is associated with <span className="font-mono font-medium text-ink">{email}</span>, password reset instructions have been recorded.
            </p>
            <div className="pt-2">
              <Link
                href="/login"
                className="inline-block px-4 py-2 bg-ledger-green text-paper text-xs font-medium rounded-lg hover:bg-[#23472c]"
              >
                Back to Sign in
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-800 text-xs">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-mono font-semibold uppercase tracking-wider text-ink-soft mb-1.5">
                Registered Student Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@college.edu.in"
                className="w-full px-3.5 py-2.5 bg-paper border border-rule rounded-lg text-ink text-sm focus:outline-none focus:ring-2 focus:ring-ledger-green/50"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-ledger-green text-paper font-medium rounded-lg text-sm hover:bg-[#23472c] transition-colors focus:outline-none focus:ring-2 focus:ring-ledger-green/50 disabled:opacity-50 cursor-pointer shadow-sm"
            >
              {loading ? "Sending..." : "Send Reset Instructions"}
            </button>

            <div className="pt-2 text-center text-xs text-ink-soft">
              Remembered your credentials?{" "}
              <Link href="/login" className="text-ledger-green font-semibold hover:underline">
                Sign in
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
