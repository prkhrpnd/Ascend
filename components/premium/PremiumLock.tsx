"use client";

import React, { useState, useRef } from "react";
import { Lock } from "lucide-react";

export interface PremiumLockProps {
  children: React.ReactNode;
  locked?: boolean;
  defaultLocked?: boolean;
  title?: string;
  description?: string;
  unlockLabel?: string;
  onUnlock?: () => void;
  className?: string;
}

export function PremiumLock({
  children,
  locked,
  defaultLocked = true,
  title = "Unlock Premium",
  description = "Get your complete category-wise expense analysis with Ascend Premium",
  unlockLabel = "Unlock Premium",
  onUnlock,
  className = "",
}: PremiumLockProps) {
  const [unlocked, setUnlocked] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  // If locked prop is explicitly provided, it controls the state.
  // Otherwise, use internal state initialized with defaultLocked.
  const isLocked = locked !== undefined ? locked : !unlocked && defaultLocked;

  const handleUnlock = () => {
    setUnlocked(true);
    onUnlock?.();
    // Move focus sensibly to the revealed content for screen readers / keyboard users
    setTimeout(() => {
      contentRef.current?.focus();
    }, 50);
  };

  return (
    <div className={`relative rounded-2xl overflow-hidden ${className}`}>
      {/* Content under the cover */}
      <div
        ref={contentRef}
        tabIndex={isLocked ? -1 : 0}
        aria-hidden={isLocked ? true : undefined}
        inert={isLocked ? true : undefined}
        className={`outline-none transition-[filter,opacity] duration-300 ${
          isLocked
            ? "filter blur-md select-none pointer-events-none opacity-60"
            : "filter-none opacity-100"
        }`}
      >
        {children}
      </div>

      {/* Locked Paywall Cover Overlay */}
      {isLocked && (
        <div
          role="region"
          aria-label="Ascend Premium paywall"
          className="absolute inset-0 z-10 flex flex-col items-center justify-center p-6 text-center bg-white/75 dark:bg-[#181816]/80 backdrop-blur-md rounded-2xl border border-rule/50"
        >
          <div className="w-12 h-12 rounded-full bg-pin-light dark:bg-pin-red/10 border border-pin-red/20 flex items-center justify-center text-pin-red mb-3 shadow-inner">
            <Lock className="w-5 h-5 text-pin-red" />
          </div>

          <h3 className="text-lg font-serif font-bold text-ink tracking-tight">
            {title}
          </h3>

          <p className="text-xs text-ink-soft max-w-md mx-auto leading-relaxed mt-1 mb-5">
            {description}
          </p>

          <button
            type="button"
            onClick={handleUnlock}
            aria-label={unlockLabel}
            className="px-6 py-2.5 rounded-full bg-pin-red hover:bg-pin-pressed text-white text-xs font-bold flex items-center justify-center gap-2 transition-transform hover:scale-[1.02] active:scale-[0.98] shadow-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-pin-red focus:ring-offset-2 dark:focus:ring-offset-slate-900"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>{unlockLabel}</span>
          </button>

          <p className="text-[11px] font-mono text-ink-soft/80 mt-2.5">
            Demo only: no payment required
          </p>
        </div>
      )}
    </div>
  );
}
