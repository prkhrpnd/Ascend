import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/supabase/auth-context";
import { AppProvider } from "@/lib/context/AppContext";
import { Navbar } from "@/components/Navbar";
import { BottomNav } from "@/components/BottomNav";
import { JudgeLens } from "@/components/JudgeLens";
import { AskMoneyModal } from "@/components/AskMoneyModal";

export const metadata: Metadata = {
  title: "Ascend: Responsible Starter Credit for Students",
  description:
    "Data-first starter credit line and credit-building product for final-year students in India. Transparent, deterministic, and safe.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col antialiased selection:bg-marigold selection:text-ink pb-20 xl:pb-6">
        <AuthProvider>
          <AppProvider>
            <Navbar />
            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
              {children}
            </main>
            <JudgeLens />
            <AskMoneyModal />
            <BottomNav />
          </AppProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
