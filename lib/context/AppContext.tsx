"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import {
  ParsedTransaction,
  StatementCoverage,
  RecurringItem,
  IncomeAssessment,
  LimitAssessment,
  UserCreditState,
} from "@/lib/engine/types";
import {
  CanonicalCategoryId,
  StatementAnalytics,
  calculateStatementAnalytics,
} from "@/lib/engine/categories";
import {
  parseStatementCSV,
  ParseStats,
  generatePriyaStatementCSV,
} from "@/lib/engine/parse";
import { useAuth } from "@/lib/supabase/auth-context";
import { supabase } from "@/lib/supabase/client";

export interface StudentProfile {
  name: string;
  dob: string;
  is18Plus: boolean;
  college: string;
  isClusterApproved: boolean;
  email: string;
  courseProgram?: string;
  graduationYear?: number;
}

export interface ConsentSettings {
  bankTransactions: boolean;
  identityVerification: boolean;
  collegeEnrolment: boolean;
}

export const priyaDemoProfile: StudentProfile = {
  name: "Priya Sharma",
  dob: "2004-04-12",
  is18Plus: true,
  college: "Jaipur Engineering College (JECRC)",
  isClusterApproved: true,
  email: "priya.sharma@jecrc.edu.in",
  courseProgram: "B.Tech Computer Science (Final Year)",
  graduationYear: 2026,
};

export interface BankAccountDetails {
  bankName: string;
  accountHolderName: string;
  accountNumber: string;
  accountType: "Savings" | "Current" | "Other";
  ifscCode: string;
  startDate: string;
  endDate: string;
  nickname?: string;
  isSaved?: boolean;
}

interface AppContextType {
  // Profile & Eligibility
  profile: StudentProfile;
  setProfile: React.Dispatch<React.SetStateAction<StudentProfile>>;
  consents: ConsentSettings;
  setConsents: React.Dispatch<React.SetStateAction<ConsentSettings>>;
  saveConsentsToDatabase: (consents: ConsentSettings) => Promise<void>;

  // Ledger & Financials
  rawCSV: string;
  setRawCSV: (csv: string) => void;
  transactions: ParsedTransaction[];
  setTransactions: React.Dispatch<React.SetStateAction<ParsedTransaction[]>>;
  coverage: StatementCoverage | null;
  setCoverage: (cov: StatementCoverage | null) => void;
  recurringItems: RecurringItem[];
  setRecurringItems: React.Dispatch<React.SetStateAction<RecurringItem[]>>;
  income: IncomeAssessment | null;
  setIncome: (inc: IncomeAssessment | null) => void;
  limitAssessment: LimitAssessment | null;
  setLimitAssessment: (lim: LimitAssessment | null) => void;
  rentConfirmed: boolean;
  setRentConfirmed: (v: boolean) => void;

  // Bank Statement Analytics Experience
  activeFileName: string;
  setActiveFileName: (name: string) => void;
  uploadStats: ParseStats | null;
  setUploadStats: (stats: ParseStats | null) => void;
  analytics: StatementAnalytics | null;
  activeCategoryFilter: CanonicalCategoryId | null;
  setActiveCategoryFilter: (cat: CanonicalCategoryId | null) => void;
  updateTransactionCategory: (id: string, newCategory: CanonicalCategoryId) => void;
  ingestStatementCSV: (csvContent: string, fileName?: string) => Promise<boolean>;
  loadPriyaDemoStatement: () => Promise<void>;
  bankAccount: BankAccountDetails | null;
  setBankAccount: React.Dispatch<React.SetStateAction<BankAccountDetails | null>>;

  // Credit Line & Cycles
  creditState: UserCreditState;
  setCreditState: React.Dispatch<React.SetStateAction<UserCreditState>>;

  // Ingestion actions
  processUploadedTransactions: (
    txs: ParsedTransaction[],
    cov: StatementCoverage,
    rawText: string,
    fileName?: string
  ) => Promise<boolean>;
  clearUserFinancialData: () => Promise<void>;

  // UI state
  judgeLensOpen: boolean;
  setJudgeLensOpen: (v: boolean) => void;
  chatOpen: boolean;
  setChatOpen: (v: boolean) => void;
  darkMode: boolean;
  setDarkMode: (v: boolean) => void;
  founderNotice: string | null;
  setFounderNotice: (n: string | null) => void;
  isSandboxMode: boolean;
  setIsSandboxMode: (v: boolean) => void;

  // Actions
  resetSession: () => void;
  loadSampleProfile: (type: "priya" | "volatile" | "thin") => Promise<void>;
}

const emptyCreditState: UserCreditState = {
  state: "ELIGIBILITY",
  currentTierIndex: 0,
  limitPaise: 0,
  selfSetCapPaise: 0,
  outstandingPaise: 0,
  availablePaise: 0,
  cycleNumber: 0,
  cleanCycles: 0,
  consecutiveCleanCycles: 0,
  stressCyclesPassed: 0,
  missedCycles: 0,
  historyStrength: 0,
  cycleHistory: [],
  drawCountToday: 0,
  autoPayActive: true,
  slipScenarioActive: false,
};

const initialConsents: ConsentSettings = {
  bankTransactions: true,
  identityVerification: true,
  collegeEnrolment: true,
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const { user, profile: authProfile } = useAuth();

  // Default to Priya Sharma as the active demo user
  const [profile, setProfile] = useState<StudentProfile>(priyaDemoProfile);
  const [consents, setConsents] = useState<ConsentSettings>(initialConsents);
  const [rawCSV, setRawCSV] = useState<string>("");
  const [transactions, setTransactions] = useState<ParsedTransaction[]>([]);
  const [coverage, setCoverage] = useState<StatementCoverage | null>(null);
  const [recurringItems, setRecurringItems] = useState<RecurringItem[]>([]);
  const [income, setIncome] = useState<IncomeAssessment | null>(null);
  const [limitAssessment, setLimitAssessment] = useState<LimitAssessment | null>(null);
  const [rentConfirmed, setRentConfirmed] = useState<boolean>(false);
  const [creditState, setCreditState] = useState<UserCreditState>(emptyCreditState);

  // Bank Statement Analytics State
  const [activeFileName, setActiveFileName] = useState<string>("priya_bank_statement.csv");
  const [uploadStats, setUploadStats] = useState<ParseStats | null>(null);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<CanonicalCategoryId | null>(null);
  const [bankAccount, setBankAccount] = useState<BankAccountDetails | null>({
    bankName: "State Bank of India",
    accountHolderName: "Priya Sharma",
    accountNumber: "••••••••4589",
    accountType: "Savings",
    ifscCode: "SBIN0001234",
    startDate: "2026-04-01",
    endDate: "2026-09-30",
    nickname: "Campus Allowance Account",
    isSaved: true,
  });

  const [judgeLensOpen, setJudgeLensOpen] = useState<boolean>(false);
  const [chatOpen, setChatOpen] = useState<boolean>(false);
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [founderNotice, setFounderNotice] = useState<string | null>(null);
  const [isSandboxMode, setIsSandboxMode] = useState<boolean>(false);

  // Scoped storage key
  const userStorageKey = user ? `ascend_user_${user.id}_state` : "ascend_demo_priya_state";

  // Recompute analytics dynamically whenever transactions change
  const analytics: StatementAnalytics | null = useMemo(() => {
    if (!transactions || transactions.length === 0) return null;
    return calculateStatementAnalytics(transactions);
  }, [transactions]);

  // Sync profile when auth profile changes (if user signs in)
  useEffect(() => {
    if (authProfile) {
      setProfile({
        name: authProfile.display_name || priyaDemoProfile.name,
        dob: authProfile.date_of_birth || priyaDemoProfile.dob,
        is18Plus: true,
        college: authProfile.institution || priyaDemoProfile.college,
        isClusterApproved: true,
        email: authProfile.email || priyaDemoProfile.email,
        courseProgram: authProfile.course_program || priyaDemoProfile.courseProgram,
        graduationYear: authProfile.graduation_year || priyaDemoProfile.graduationYear,
      });
    } else if (!user) {
      setProfile(priyaDemoProfile);
    }
  }, [authProfile, user]);

  // Load user data on mount or storage change
  useEffect(() => {
    try {
      const saved = localStorage.getItem(userStorageKey);
      if (saved) {
        const data = JSON.parse(saved);
        if (data.consents) setConsents(data.consents);
        if (data.transactions && Array.isArray(data.transactions) && data.transactions.length > 0) {
          setTransactions(data.transactions);
        }
        if (data.coverage) setCoverage(data.coverage);
        if (data.recurringItems) setRecurringItems(data.recurringItems);
        if (data.income) setIncome(data.income);
        if (data.limitAssessment) setLimitAssessment(data.limitAssessment);
        if (data.rentConfirmed !== undefined) setRentConfirmed(data.rentConfirmed);
        if (data.creditState) setCreditState(data.creditState);
        if (data.activeFileName) setActiveFileName(data.activeFileName);
        if (data.uploadStats) setUploadStats(data.uploadStats);
        if (data.isSandboxMode !== undefined) setIsSandboxMode(data.isSandboxMode);
      } else {
        // Auto-load Priya's realistic statement as baseline demo data on first visit
        const priyaCSV = generatePriyaStatementCSV();
        const parseRes = parseStatementCSV(priyaCSV, undefined, "priya_bank_statement.csv");
        if (parseRes.success) {
          setTransactions(parseRes.transactions);
          setCoverage(parseRes.coverage);
          setRawCSV(priyaCSV);
          if (parseRes.stats) setUploadStats(parseRes.stats);
          setActiveFileName("priya_bank_statement.csv");
        }
      }
    } catch (e) {
      console.warn("Could not hydrate user session from storage", e);
    }

    // Check founder policy updates
    fetch("/api/config")
      .then((r) => r.json())
      .then((d) => {
        if (d.lastUpdateReason) {
          setFounderNotice(d.lastUpdateReason);
        }
      })
      .catch(() => {});
  }, [userStorageKey]);

  // Save user data on change
  useEffect(() => {
    try {
      localStorage.setItem(
        userStorageKey,
        JSON.stringify({
          consents,
          transactions,
          coverage,
          recurringItems,
          income,
          limitAssessment,
          rentConfirmed,
          creditState,
          activeFileName,
          uploadStats,
          isSandboxMode,
        })
      );
    } catch (e) {
      console.warn("Could not save user session to storage", e);
    }
  }, [
    userStorageKey,
    consents,
    transactions,
    coverage,
    recurringItems,
    income,
    limitAssessment,
    rentConfirmed,
    creditState,
    activeFileName,
    uploadStats,
    isSandboxMode,
  ]);

  // Dark mode effect
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  const saveConsentsToDatabase = useCallback(
    async (newConsents: ConsentSettings) => {
      setConsents(newConsents);
      if (!user) return;

      try {
        const purposes: Array<{ purpose: string; granted: boolean; categories: string[] }> = [
          {
            purpose: "cash_flow_assessment",
            granted: newConsents.bankTransactions,
            categories: ["transactions", "balances"],
          },
          {
            purpose: "identity_verification",
            granted: newConsents.identityVerification,
            categories: ["pan", "college_id"],
          },
          {
            purpose: "account_aggregator_sync",
            granted: newConsents.collegeEnrolment,
            categories: ["enrollment_status"],
          },
        ];

        for (const p of purposes) {
          if (p.granted) {
            await supabase.from("consents").insert({
              user_id: user.id,
              purpose: p.purpose as any,
              data_categories: p.categories,
              consent_version: "v2.0",
              status: "granted",
              expires_at: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(),
            });
          }
        }
      } catch (err) {
        console.error("Failed to save consents to database", err);
      }
    },
    [user]
  );

  const processUploadedTransactions = async (
    txs: ParsedTransaction[],
    cov: StatementCoverage,
    rawText: string,
    fileName: string = "uploaded_statement.csv"
  ): Promise<boolean> => {
    try {
      setTransactions(txs);
      setCoverage(cov);
      setRawCSV(rawText);
      setActiveFileName(fileName);

      // Run deterministic financial assessment
      const assessRes = await fetch("/api/assess", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transactions: txs,
          coverage: cov,
        }),
      });

      const assessData = await assessRes.json();
      if (!assessRes.ok) {
        throw new Error(assessData.error?.message || "Assessment calculation failed");
      }

      setRecurringItems(assessData.recurringItems || []);
      setIncome(assessData.incomeAssessment || null);
      setLimitAssessment(assessData.limitAssessment || null);

      if (assessData.limitAssessment) {
        setCreditState((prev) => ({
          ...prev,
          limitPaise: assessData.limitAssessment.finalLimitPaise,
          selfSetCapPaise: assessData.limitAssessment.finalLimitPaise,
          availablePaise: assessData.limitAssessment.finalLimitPaise,
          outstandingPaise: 0,
          state: assessData.limitAssessment.isEligible ? "OFFERED" : "LINKED",
        }));
      }

      return true;
    } catch (err) {
      console.error("Error processing statement transactions:", err);
      return false;
    }
  };

  /**
   * Ingest CSV content directly from upload component.
   */
  const ingestStatementCSV = async (csvContent: string, fileName: string = "uploaded_statement.csv"): Promise<boolean> => {
    const parseRes = parseStatementCSV(csvContent, undefined, fileName);
    if (!parseRes.success || !parseRes.coverage) {
      throw new Error(parseRes.error?.message || "Failed to parse bank statement CSV");
    }

    setUploadStats(parseRes.stats || null);
    setActiveFileName(fileName);
    setRawCSV(csvContent);
    setTransactions(parseRes.transactions);
    setCoverage(parseRes.coverage);

    return await processUploadedTransactions(parseRes.transactions, parseRes.coverage, csvContent, fileName);
  };

  /**
   * 1-click loading of Priya's realistic statement demo.
   */
  const loadPriyaDemoStatement = async () => {
    const csv = generatePriyaStatementCSV();
    await ingestStatementCSV(csv, "priya_bank_statement.csv");
  };

  /**
   * Inline manual override of a transaction's category.
   * Immediately marks row as user-categorized and recalculates analytics.
   */
  const updateTransactionCategory = (id: string, newCategory: CanonicalCategoryId) => {
    setTransactions((prevTxs) => {
      return prevTxs.map((t) => {
        if (t.id === id) {
          return {
            ...t,
            category: newCategory,
            source: "user",
            confidenceLevel: "high",
            confidence: 1.0,
            ruleUsed: "Manual User Assignment",
            isUserOverride: true,
          };
        }
        return t;
      });
    });
  };

  const clearUserFinancialData = async () => {
    if (user) {
      await supabase.from("transactions").delete().eq("user_id", user.id);
      await supabase.from("statement_uploads").delete().eq("user_id", user.id);
      await supabase.from("financial_analyses").delete().eq("user_id", user.id);
    }
    setTransactions([]);
    setCoverage(null);
    setRawCSV("");
    setUploadStats(null);
    setActiveFileName("");
    setRecurringItems([]);
    setIncome(null);
    setLimitAssessment(null);
    setRentConfirmed(false);
    setCreditState(emptyCreditState);
    setIsSandboxMode(false);
    localStorage.removeItem(userStorageKey);
  };

  const resetSession = () => {
    localStorage.removeItem(userStorageKey);
    setConsents(initialConsents);
    setTransactions([]);
    setCoverage(null);
    setUploadStats(null);
    setActiveFileName("");
    setRecurringItems([]);
    setIncome(null);
    setLimitAssessment(null);
    setRentConfirmed(false);
    setCreditState(emptyCreditState);
    setIsSandboxMode(false);
  };

  const loadSampleProfile = async (type: "priya" | "volatile" | "thin") => {
    try {
      setIsSandboxMode(true);
      const res = await fetch("/api/ingest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile: type }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || "Failed to load sample");

      setTransactions(data.transactions);
      setCoverage(data.coverage);
      setRawCSV(data.csvContent);
      setActiveFileName(`${type}_sample_statement.csv`);

      const assessRes = await fetch("/api/assess", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transactions: data.transactions,
          coverage: data.coverage,
        }),
      });
      const assessData = await assessRes.json();
      if (assessRes.ok) {
        setTransactions(assessData.filteredTransactions || data.transactions);
        setRecurringItems(assessData.recurringItems || []);
        setIncome(assessData.incomeAssessment || null);
        setLimitAssessment(assessData.limitAssessment || null);

        if (assessData.limitAssessment) {
          setCreditState((prev) => ({
            ...prev,
            limitPaise: assessData.limitAssessment.finalLimitPaise,
            selfSetCapPaise: assessData.limitAssessment.finalLimitPaise,
            availablePaise: assessData.limitAssessment.finalLimitPaise,
            state: assessData.limitAssessment.isEligible ? "ASSESSED" : "LINKED",
          }));
        }
      }
    } catch (err) {
      console.error("Error loading sample profile:", err);
    }
  };

  return (
    <AppContext.Provider
      value={{
        profile,
        setProfile,
        consents,
        setConsents,
        saveConsentsToDatabase,
        rawCSV,
        setRawCSV,
        transactions,
        setTransactions,
        coverage,
        setCoverage,
        recurringItems,
        setRecurringItems,
        income,
        setIncome,
        limitAssessment,
        setLimitAssessment,
        rentConfirmed,
        setRentConfirmed,
        activeFileName,
        setActiveFileName,
        uploadStats,
        setUploadStats,
        analytics,
        activeCategoryFilter,
        setActiveCategoryFilter,
        updateTransactionCategory,
        ingestStatementCSV,
        loadPriyaDemoStatement,
        bankAccount,
        setBankAccount,
        creditState,
        setCreditState,
        processUploadedTransactions,
        clearUserFinancialData,
        judgeLensOpen,
        setJudgeLensOpen,
        chatOpen,
        setChatOpen,
        darkMode,
        setDarkMode,
        founderNotice,
        setFounderNotice,
        isSandboxMode,
        setIsSandboxMode,
        resetSession,
        loadSampleProfile,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
