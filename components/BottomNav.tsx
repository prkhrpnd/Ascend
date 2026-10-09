"use client";

import React from "react";
import NextLink from "next/link";
import { usePathname } from "next/navigation";
import { Home, Receipt, CreditCard, Shield, Award } from "lucide-react";

export function BottomNav() {
  const pathname = usePathname();

  const items = [
    { href: "/", label: "Home", icon: Home },
    { href: "/ledger", label: "Money", icon: Receipt },
    { href: "/line", label: "Credit", icon: CreditCard },
    { href: "/score", label: "Score", icon: Award },
    { href: "/settings", label: "Privacy", icon: Shield },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-white/95 dark:bg-[#1c1c1a]/95 backdrop-blur-md border-t border-rule safe-area-bottom">
      <div className="grid grid-cols-5 h-16">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <NextLink
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-1 transition-colors ${
                isActive ? "text-pin-red font-bold" : "text-ink-soft hover:text-ink"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-sans font-medium tracking-tight">{item.label}</span>
            </NextLink>
          );
        })}
      </div>
    </nav>
  );
}
