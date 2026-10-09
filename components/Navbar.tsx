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
  BookOpen,
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
    { href: "/learn", label: "Learn", icon: BookOpen },
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
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#1c1c1a]/95 backdrop-blur-md border-b border-rule">
      {/* Top Demo Context Bar */}
      <div className="bg-[#f6f6f3] dark:bg-[#1c1c1a] border-b border-rule px-4 py-1.5 text-xs text-ink-soft flex items-center justify-between">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-medium text-ink">
              Synthetic Demo Student: <strong className="font-semibold">{profile.name}</strong> ({profile.college})
            </span>
            <SimulationBadge label="PROTOTYPE" size="sm" className="hidden sm:inline-flex" />
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => loadPriyaDemoStatement()}
              className="font-mono text-[11px] text-ink-soft hover:text-ink px-2.5 py-0.5 rounded-full hover:bg-slate-200/60 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Sparkles className="w-3 h-3 text-ink-soft" />
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
            <img
              src="/ascend-logo.png"
              alt="Ascend logo"
              className="w-8 h-8 object-contain shrink-0 group-hover:scale-105 transition-transform"
            />
            <div>
              <span className="font-bold text-xl tracking-tight text-ink">
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
                  className={`px-3.5 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 transition-colors ${
                    isActive
                      ? "bg-ink text-white font-bold"
                      : "text-ink-soft hover:text-ink hover:bg-slate-200/60"
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
              className="px-3.5 py-1.5 rounded-full bg-slate-200/80 hover:bg-slate-300/80 border border-slate-300 text-xs font-bold text-ink flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <CreditCard className="w-3.5 h-3.5 text-ink" />
              <span>Starter Credit Line</span>
              <ChevronDown className="w-3 h-3 text-ink-soft" />
            </button>

            {creditMenuOpen && (
              <div
                className="absolute right-0 mt-2 w-64 bg-white dark:bg-[#1c1c1a] border border-rule rounded-2xl p-2 z-50 text-xs"
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
                    className="block px-2.5 py-1.5 rounded-xl hover:bg-slate-100/80 text-ink hover:text-ink font-medium transition-colors"
                  >
                    {c.label}
                  </NextLink>
                ))}
              </div>
            )}
          </div>

          {/* Quick Credit Eligibility Button - Primary Pinterest Red CTA */}
          <NextLink
            href="/assess"
            className="px-4 py-1.5 rounded-full bg-pin-red hover:bg-pin-pressed text-white text-xs font-bold transition-colors hidden sm:flex items-center gap-1.5"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Credit Check</span>
          </NextLink>

          {/* Dark Mode Toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-full border border-rule text-ink-soft hover:text-ink hover:bg-slate-200/60 transition-colors cursor-pointer"
            title={darkMode ? "Switch to Day Mode" : "Switch to Night Mode"}
            aria-label="Toggle theme"
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-ink" />}
          </button>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-full border border-rule text-ink-soft hover:text-ink hover:bg-slate-200/60 lg:hidden cursor-pointer"
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-rule bg-white/95 dark:bg-[#1c1c1a]/95 backdrop-blur-md px-4 py-3 space-y-2 text-xs">
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
                className={`flex items-center gap-2 px-3.5 py-2 rounded-full font-medium ${
                  pathname === item.href
                    ? "bg-ink text-white font-bold"
                    : "text-ink hover:bg-slate-100/60"
                }`}
              >
                <Icon className="w-4 h-4 text-ink" />
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
              className="block px-3.5 py-1.5 rounded-full text-ink hover:bg-slate-100/60 font-medium"
            >
              {c.label}
            </NextLink>
          ))}
        </div>
      )}
    </header>
  );
}
