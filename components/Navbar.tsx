"use client";

import React, { useState } from "react";
import NextLink from "next/link";
import { usePathname } from "next/navigation";
import { useApp } from "@/lib/context/AppContext";
import { SimulationBadge } from "./SimulationBadge";
import {
  Moon,
  Sun,
  Menu,
  X,
  CreditCard,
  FileSpreadsheet,
  PieChart,
  Layers,
  Activity,
  Home,
  ShieldCheck,
  ChevronDown,
  Sparkles,
} from "lucide-react";

export function Navbar() {
  const pathname = usePathname();
  const { darkMode, setDarkMode, profile, loadPriyaDemoStatement, activeFileName } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [creditMenuOpen, setCreditMenuOpen] = useState(false);

  // Core navigation items required by the statement analytics experience
  const navItems = [
    { href: "/", label: "Overview", icon: Home },
    { href: "/statements", label: "Bank Statements", icon: FileSpreadsheet },
    { href: "/spending", label: "Spending Analysis", icon: PieChart },
    { href: "/categories", label: "Expense Categories", icon: Layers },
    { href: "/cashflow", label: "Cash Flow", icon: Activity },
  ];

  // Secondary credit & underwriting products
  const creditItems = [
    { href: "/line", label: "Credit Line (₹500 Starter)" },
    { href: "/assess", label: "Underwriting Assessment" },
    { href: "/simulator", label: "Stress Backtest Simulator" },
    { href: "/score", label: "Score & Bureau Reporting" },
    { href: "/offer", label: "Digital Agreement & Key Fact Statement" },
    { href: "/how-it-works", label: "How It Works (Four Forces)" },
    { href: "/declarations", label: "Declarations & Open Source" },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-rule">
      {/* Top Demo Context Bar */}
      <div className="bg-blue-50/80 border-b border-blue-100 px-4 py-1.5 text-xs text-blue-900 flex items-center justify-between">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-medium">
              Synthetic Demo Student: <strong>{profile.name}</strong> ({profile.college})
            </span>
            <SimulationBadge label="PROTOTYPE" size="sm" className="hidden sm:inline-flex" />
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => loadPriyaDemoStatement()}
              className="font-mono text-[11px] text-blue-700 hover:text-blue-900 underline flex items-center gap-1 cursor-pointer"
            >
              <Sparkles className="w-3 h-3 text-blue-600" />
              <span>Reset to Priya Statement</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-6">
          <NextLink href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-serif font-black text-base shadow-sm group-hover:scale-105 transition-transform">
              A
            </div>
            <div>
              <span className="font-serif font-black text-xl tracking-tight text-ink">
                Ascend
              </span>
              <span className="hidden sm:inline-block font-sans text-[11px] text-ink-soft ml-2 border-l border-rule pl-2">
                Student Financial Health
              </span>
            </div>
          </NextLink>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <NextLink
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors ${
                    isActive
                      ? "bg-blue-50 text-blue-700 font-bold border border-blue-200"
                      : "text-ink-soft hover:text-ink hover:bg-slate-50"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </NextLink>
              );
            })}
          </nav>
        </div>

        {/* Right Tools & Dropdowns */}
        <div className="flex items-center gap-2.5">
          {/* Credit Line Dropdown */}
          <div className="relative hidden md:block">
            <button
              onClick={() => setCreditMenuOpen(!creditMenuOpen)}
              className="px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-rule text-xs font-medium text-ink flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <CreditCard className="w-3.5 h-3.5 text-blue-600" />
              <span>Starter Credit Line</span>
              <ChevronDown className="w-3 h-3 text-ink-soft" />
            </button>

            {creditMenuOpen && (
              <div
                className="absolute right-0 mt-2 w-64 bg-white border border-rule rounded-xl shadow-lg p-2 z-50 text-xs"
                onMouseLeave={() => setCreditMenuOpen(false)}
              >
                <div className="px-2.5 py-1 text-[10px] font-mono text-ink-soft uppercase tracking-wider border-b border-rule mb-1">
                  Credit & Underwriting Flows
                </div>
                {creditItems.map((c) => (
                  <NextLink
                    key={c.href}
                    href={c.href}
                    onClick={() => setCreditMenuOpen(false)}
                    className="block px-2.5 py-1.5 rounded-lg hover:bg-slate-50 text-ink hover:text-blue-600 transition-colors"
                  >
                    {c.label}
                  </NextLink>
                ))}
              </div>
            )}
          </div>

          {/* Quick Credit Eligibility Button */}
          <NextLink
            href="/assess"
            className="px-3.5 py-1.5 rounded-lg bg-blue-600 text-white font-mono text-xs font-bold shadow-sm hover:bg-blue-700 transition-colors hidden sm:flex items-center gap-1.5"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Credit Check</span>
          </NextLink>

          {/* Dark Mode Toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-lg border border-rule text-ink-soft hover:text-ink hover:bg-slate-50 transition-colors cursor-pointer"
            title={darkMode ? "Switch to Day Mode" : "Switch to Night Mode"}
            aria-label="Toggle theme"
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-ink" />}
          </button>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg border border-rule text-ink-soft hover:text-ink lg:hidden cursor-pointer"
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-rule bg-white px-4 py-3 space-y-2 text-xs">
          <div className="font-mono text-[10px] text-ink-soft uppercase tracking-wider">
            Statement Analytics
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NextLink
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                  pathname === item.href
                    ? "bg-blue-50 text-blue-700 font-bold"
                    : "text-ink hover:bg-slate-50"
                }`}
              >
                <Icon className="w-4 h-4 text-blue-600" />
                <span>{item.label}</span>
              </NextLink>
            );
          })}

          <div className="pt-2 border-t border-rule font-mono text-[10px] text-ink-soft uppercase tracking-wider">
            Ascend Credit Tools
          </div>
          {creditItems.map((c) => (
            <NextLink
              key={c.href}
              href={c.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-1.5 rounded-lg text-ink hover:bg-slate-50"
            >
              {c.label}
            </NextLink>
          ))}
        </div>
      )}
    </header>
  );
}
