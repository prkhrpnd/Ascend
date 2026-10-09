import { ParsedTransaction, TransactionType } from "./types";

export type CategoryGroup =
  | "essential_expenses"
  | "lifestyle_discretionary"
  | "debt_obligations"
  | "transfers_investments"
  | "income_credits"
  | "uncategorized";

export type ConfidenceLevel = "high" | "needs_review" | "uncategorized";

export type CanonicalCategoryId =
  | "housing_rent"
  | "utilities_bills"
  | "groceries"
  | "food_dining"
  | "transport_fuel"
  | "shopping"
  | "healthcare_pharmacy"
  | "education"
  | "entertainment_subscriptions"
  | "loan_repayments_emis"
  | "insurance"
  | "investments_savings"
  | "transfers_own_accounts"
  | "cash_withdrawals"
  | "income_salary"
  | "refunds_reversals"
  | "other_credits"
  | "uncategorized";

export interface CategoryMetadata {
  id: CanonicalCategoryId;
  label: string;
  description: string;
  group: CategoryGroup;
  color: string;
  isExpense: boolean;
  isCredit: boolean;
  isConsumerSpend: boolean; // True for ordinary consumption expenses
}

export const CATEGORIES: Record<CanonicalCategoryId, CategoryMetadata> = {
  housing_rent: {
    id: "housing_rent",
    label: "Housing and Rent",
    description: "Hostel fees, PG accommodations, monthly rent, and maintenance charges",
    group: "essential_expenses",
    color: "#6366F1", // Indigo
    isExpense: true,
    isCredit: false,
    isConsumerSpend: true,
  },
  utilities_bills: {
    id: "utilities_bills",
    label: "Utilities and Bills",
    description: "Electricity, water, gas, Wi-Fi, broadband, and mobile recharges",
    group: "essential_expenses",
    color: "#0284C7", // Sky blue
    isExpense: true,
    isCredit: false,
    isConsumerSpend: true,
  },
  groceries: {
    id: "groceries",
    label: "Groceries",
    description: "Supermarkets, daily provisions, dairy, quick commerce, and kirana stores",
    group: "essential_expenses",
    color: "#059669", // Emerald
    isExpense: true,
    isCredit: false,
    isConsumerSpend: true,
  },
  food_dining: {
    id: "food_dining",
    label: "Food and Dining",
    description: "Campus cafeteria, restaurants, cafes, food delivery apps, and snacks",
    group: "lifestyle_discretionary",
    color: "#F59E0B", // Amber
    isExpense: true,
    isCredit: false,
    isConsumerSpend: true,
  },
  transport_fuel: {
    id: "transport_fuel",
    label: "Transport and Fuel",
    description: "Metro, cab rides, auto-rickshaws, bus tickets, trains, petrol, and tolls",
    group: "essential_expenses",
    color: "#8B5CF6", // Violet
    isExpense: true,
    isCredit: false,
    isConsumerSpend: true,
  },
  shopping: {
    id: "shopping",
    label: "Shopping",
    description: "Apparel, electronics, e-commerce orders, footwear, and personal goods",
    group: "lifestyle_discretionary",
    color: "#EC4899", // Pink
    isExpense: true,
    isCredit: false,
    isConsumerSpend: true,
  },
  healthcare_pharmacy: {
    id: "healthcare_pharmacy",
    label: "Healthcare and Pharmacy",
    description: "Medicines, doctor visits, diagnostic tests, clinic fees, and medical supplies",
    group: "essential_expenses",
    color: "#EF4444", // Red
    isExpense: true,
    isCredit: false,
    isConsumerSpend: true,
  },
  education: {
    id: "education",
    label: "Education",
    description: "College exam fees, books, photocopies, online courses, and academic supplies",
    group: "essential_expenses",
    color: "#3B82F6", // Blue
    isExpense: true,
    isCredit: false,
    isConsumerSpend: true,
  },
  entertainment_subscriptions: {
    id: "entertainment_subscriptions",
    label: "Entertainment and Subscriptions",
    description: "Streaming apps, music subscriptions, movies, events, and video games",
    group: "lifestyle_discretionary",
    color: "#A855F7", // Purple
    isExpense: true,
    isCredit: false,
    isConsumerSpend: true,
  },
  loan_repayments_emis: {
    id: "loan_repayments_emis",
    label: "Loan Repayments and EMIs",
    description: "Credit app repayments, student loan EMIs, and debt installments",
    group: "debt_obligations",
    color: "#DC2626", // Dark Red
    isExpense: true,
    isCredit: false,
    isConsumerSpend: true,
  },
  insurance: {
    id: "insurance",
    label: "Insurance",
    description: "Health insurance premiums, vehicle insurance, and term cover policies",
    group: "essential_expenses",
    color: "#0D9488", // Teal
    isExpense: true,
    isCredit: false,
    isConsumerSpend: true,
  },
  investments_savings: {
    id: "investments_savings",
    label: "Investments and Savings",
    description: "Mutual fund SIPs, stock purchases, recurring deposits, and savings transfers",
    group: "transfers_investments",
    color: "#15803D", // Green
    isExpense: false, // Tracked separately from consumer spending
    isCredit: false,
    isConsumerSpend: false,
  },
  transfers_own_accounts: {
    id: "transfers_own_accounts",
    label: "Transfers Between Own Accounts",
    description: "Self-account transfers, sweep deposits, and secondary wallet movements",
    group: "transfers_investments",
    color: "#64748B", // Slate
    isExpense: false, // Excluded from consumer spend
    isCredit: false,
    isConsumerSpend: false,
  },
  cash_withdrawals: {
    id: "cash_withdrawals",
    label: "Cash Withdrawals",
    description: "ATM cash withdrawals and manual bank branch cash payouts",
    group: "essential_expenses",
    color: "#78716C", // Stone
    isExpense: true,
    isCredit: false,
    isConsumerSpend: true,
  },
  income_salary: {
    id: "income_salary",
    label: "Income and Salary",
    description: "Monthly allowance, tutoring stipend, salary, internship pay, and gig earnings",
    group: "income_credits",
    color: "#16A34A", // Vibrant Green
    isExpense: false,
    isCredit: true,
    isConsumerSpend: false,
  },
  refunds_reversals: {
    id: "refunds_reversals",
    label: "Refunds and Reversals",
    description: "Merchant refunds, failed transaction chargebacks, and promotional cashbacks",
    group: "income_credits",
    color: "#2563EB", // Blue
    isExpense: false,
    isCredit: true,
    isConsumerSpend: false,
  },
  other_credits: {
    id: "other_credits",
    label: "Other Credits",
    description: "Bank interest credits, peer transfers, bill splits, and miscellaneous deposits",
    group: "income_credits",
    color: "#0891B2", // Cyan
    isExpense: false,
    isCredit: true,
    isConsumerSpend: false,
  },
  uncategorized: {
    id: "uncategorized",
    label: "Uncategorized / Needs Review",
    description: "Unmatched transactions requiring user review or manual assignment",
    group: "uncategorized",
    color: "#94A3B8", // Gray
    isExpense: true,
    isCredit: false,
    isConsumerSpend: true,
  },
};

export interface TransparentCategoryRule {
  id: string;
  category: CanonicalCategoryId;
  type: TransactionType;
  keywords: string[];
  ruleName: string;
  confidence: number;
}

export const TRANSPARENT_RULES: TransparentCategoryRule[] = [
  // 1. Housing and Rent (DR)
  {
    id: "rule_rent_pg",
    category: "housing_rent",
    type: "DR",
    keywords: ["HOSTEL", "MESS ACCT", "RENT", "LANDLORD", "PG ACCOMMODATION", "SOCIETY", "MAINTENANCE CHARGE", "ROOM RENT", "HOSTEL FEE"],
    ruleName: "Hostel and Rent Narration Match",
    confidence: 0.95,
  },

  // 2. Utilities and Bills (DR)
  {
    id: "rule_utilities_electricity",
    category: "utilities_bills",
    type: "DR",
    keywords: ["ELECTRICITY", "JVVNL", "BESCOM", "TNEB", "MSEDCL", "POWER CORP", "WATER BOARD", "GAS BILL", "INDANE", "HP GAS", "BHARAT GAS", "PIPED GAS"],
    ruleName: "Utility Board or Electricity Match",
    confidence: 0.92,
  },
  {
    id: "rule_utilities_telecom",
    category: "utilities_bills",
    type: "DR",
    keywords: ["PREPAID", "POSTPAID", "JIO RECHARGE", "AIRTEL PAYMENT", "VI PREPAID", "ACT FIBERNET", "BROADBAND", "TATA PLAY", "DTH"],
    ruleName: "Telecom, Internet, or DTH Bill",
    confidence: 0.9,
  },

  // 3. Groceries (DR)
  {
    id: "rule_groceries_stores",
    category: "groceries",
    type: "DR",
    keywords: ["BLINKIT", "ZEPTO", "INSTAMART", "BIGBASKET", "DMART", "KIRANA", "SUPERMARKET", "GROCERY", "PROVISION", "VEG MART", "FRUIT SHOP", "NATURES BASKET"],
    ruleName: "Grocery and Quick Commerce Merchants",
    confidence: 0.94,
  },

  // 4. Food and Dining (DR)
  {
    id: "rule_food_dining",
    category: "food_dining",
    type: "DR",
    keywords: ["SWIGGY", "ZOMATO", "EATS", "CAFE", "RESTAURANT", "DHABA", "CHAAT", "PIZZA", "BURGER", "DOMINOS", "MCDONALD", "KFC", "SUBWAY", "STARBUCKS", "CHAI", "CANTEEN", "BAKERY", "COFFEE"],
    ruleName: "Food Delivery and Dining Merchants",
    confidence: 0.95,
  },

  // 5. Transport and Fuel (DR)
  {
    id: "rule_transport_rides",
    category: "transport_fuel",
    type: "DR",
    keywords: ["UBER", "OLA", "RAPIDO", "AUTO", "RIKSHAW", "METRO", "RAILWAY", "IRCTC", "BUS", "REDBUS", "MAKEMYTRIP", "PETROL", "DIESEL", "HPCL", "BPCL", "IOCL", "SHELL", "FASTAG", "TOLL"],
    ruleName: "Rides, Public Transit, or Fuel Stations",
    confidence: 0.93,
  },

  // 6. Shopping (DR)
  {
    id: "rule_shopping_retail",
    category: "shopping",
    type: "DR",
    keywords: ["AMAZON", "FLIPKART", "MYNTRA", "AJIO", "MEESHO", "NYKAA", "ZARA", "H&M", "UNIQLO", "DECATHLON", "CROMA", "VIJAY SALES", "RELIANCE RETAIL", "CLOTHING", "FOOTWEAR", "SHOPPING"],
    ruleName: "E-Commerce and Retail Merchants",
    confidence: 0.91,
  },

  // 7. Healthcare and Pharmacy (DR)
  {
    id: "rule_healthcare_medical",
    category: "healthcare_pharmacy",
    type: "DR",
    keywords: ["APOLLO", "PHARMACY", "NETMEDS", "1MG", "MEDPLUS", "HOSPITAL", "CLINIC", "DOCTOR", "LAB", "DIAGNOSTICS", "PATHOLOGY", "MEDICINE", "CHEMIST", "DENTAL"],
    ruleName: "Pharmacy, Lab, or Hospital Match",
    confidence: 0.94,
  },

  // 8. Education (DR)
  {
    id: "rule_education_campus",
    category: "education",
    type: "DR",
    keywords: ["TUITION FEE", "EXAM FEE", "COLLEGE FEE", "BOOKS", "COURSERA", "UDEMY", "UNACADEMY", "STATIONERY", "XEROX", "LIBRARY", "STUDENT FEE", "ACADEMIC", "SEMESTER FEE"],
    ruleName: "Education, Exam, and Academic Payments",
    confidence: 0.93,
  },

  // 9. Entertainment and Subscriptions (DR)
  {
    id: "rule_entertainment_subs",
    category: "entertainment_subscriptions",
    type: "DR",
    keywords: ["SPOTIFY", "NETFLIX", "PRIME VIDEO", "YOUTUBE PREMIUM", "HOTSTAR", "SONYLIV", "BOOKMYSHOW", "PVR", "INOX", "CINEMA", "THEATRE", "GAMING", "STEAM", "PLAYSTATION"],
    ruleName: "Streaming and Entertainment Subscriptions",
    confidence: 0.94,
  },

  // 10. Loan Repayments and EMIs (DR)
  {
    id: "rule_loan_repayments",
    category: "loan_repayments_emis",
    type: "DR",
    keywords: ["KREDITBEE", "MONEYVIEW", "SLICE", "KISSHT", "FIBE", "ZESTMONEY", "EARLYSALARY", "LOAN REPAYMENT", "EMI PAYMENT", "BAJAJ FINSERV", "HOME CREDIT", "MUTHOOT"],
    ruleName: "Lending Platform and EMI Repayment Match",
    confidence: 0.96,
  },

  // 11. Insurance (DR)
  {
    id: "rule_insurance_premium",
    category: "insurance",
    type: "DR",
    keywords: ["LIC", "HDFC LIFE", "ICICI PRU", "MAX LIFE", "STAR HEALTH", "CARE HEALTH", "POLICYBAZAAR", "INSURANCE PREMIUM", "GENERAL INSURANCE"],
    ruleName: "Insurance Policy Premium Match",
    confidence: 0.95,
  },

  // 12. Investments and Savings (DR)
  {
    id: "rule_investments_outflow",
    category: "investments_savings",
    type: "DR",
    keywords: ["ZERODHA", "GROWW", "UPSTOX", "KITE", "MUTUAL FUND", "SIP", "NSDL", "CDSL", "PPF", "NPS", "COIN", "RECURRING DEPOSIT", "FD BOOKING"],
    ruleName: "Broker, Mutual Fund, or Savings Outflow",
    confidence: 0.95,
  },

  // 13. Transfers Between Own Accounts (DR)
  {
    id: "rule_transfers_own_out",
    category: "transfers_own_accounts",
    type: "DR",
    keywords: ["SELF TRANSFER", "OWN ACCOUNT", "TRANSFER TO SELF", "SWEEP OUT", "SAVINGS TO CURRENT", "SECONDARY ACCOUNT"],
    ruleName: "Self-Account Transfer Outflow",
    confidence: 0.92,
  },

  // 14. Cash Withdrawals (DR)
  {
    id: "rule_cash_withdrawals",
    category: "cash_withdrawals",
    type: "DR",
    keywords: ["ATM WDL", "CASH WITHDRAWAL", "NFS ATM", "ATM CASH", "BRANCH CASH WDL"],
    ruleName: "ATM Cash Withdrawal Match",
    confidence: 0.96,
  },

  // 15. Income and Salary (CR)
  {
    id: "rule_income_salary_cr",
    category: "income_salary",
    type: "CR",
    keywords: [
      "SALARY", "STIPEND", "PAYROLL", "INTERNSHIP", "FREELANCE", "CLIENT", "CONSULTING",
      "ALLOWANCE", "POCKET MONEY", "RAJESH VERMA", "PAPA", "MOM", "FAMILY", "HOME TRANSFER",
      "TUITION", "COACHING", "BATCH", "STUDENT FEES RECEIVED"
    ],
    ruleName: "Allowance, Salary, Stipend, or Tutoring Inflow",
    confidence: 0.95,
  },

  // 16. Refunds and Reversals (CR)
  {
    id: "rule_refunds_cr",
    category: "refunds_reversals",
    type: "CR",
    keywords: ["REFUND", "REVERSAL", "CASHBACK", "RETURN CREDIT", "REVERSAL OF", "CHARGEBACK"],
    ruleName: "Merchant Refund or Payment Reversal",
    confidence: 0.96,
  },

  // 17. Investments and Savings (CR)
  {
    id: "rule_investments_inflow",
    category: "investments_savings",
    type: "CR",
    keywords: ["DIVIDEND", "MUTUAL FUND REDEMPTION", "ZERODHA WITHDRAWAL", "GROWW PAYOUT", "FD CLOSURE", "INTEREST ON FD"],
    ruleName: "Investment Redemption or Dividend Return",
    confidence: 0.9,
  },

  // 18. Transfers Between Own Accounts (CR)
  {
    id: "rule_transfers_own_in",
    category: "transfers_own_accounts",
    type: "CR",
    keywords: ["SELF TRANSFER", "FROM OWN ACCOUNT", "SWEEP IN", "TRANSFER FROM SELF"],
    ruleName: "Self-Account Deposit Inflow",
    confidence: 0.92,
  },

  // 19. Other Credits (CR)
  {
    id: "rule_other_credits_cr",
    category: "other_credits",
    type: "CR",
    keywords: ["INTEREST CREDIT", "UPI CREDIT", "SPLIT", "ANANYA", "ROOMIE", "CONTRIBUTION", "CREDIT"],
    ruleName: "Peer Bill Split or Deposit Credit",
    confidence: 0.75,
  },
];

export interface CategorizationResult {
  category: CanonicalCategoryId;
  ruleUsed: string;
  confidenceLevel: ConfidenceLevel;
  confidence: number;
}

/**
 * Categorize a transaction based on narration, direction (CR vs DR), and transparent keyword rules.
 * Strictly guarantees that credits are never classified as expenses.
 */
export function categorizeTransaction(
  narration: string,
  type: TransactionType,
  sourceCategoryHint?: string
): CategorizationResult {
  const upper = (narration || "").toUpperCase();

  // 1. Try matching transparent rules for the given transaction direction first
  for (const rule of TRANSPARENT_RULES) {
    if (rule.type === type) {
      for (const kw of rule.keywords) {
        if (upper.includes(kw)) {
          return {
            category: rule.category,
            ruleUsed: rule.ruleName,
            confidenceLevel: rule.confidence >= 0.85 ? "high" : "needs_review",
            confidence: rule.confidence,
          };
        }
      }
    }
  }

  // 2. If narration had no high-confidence rule match, use source category as hint
  if (sourceCategoryHint && sourceCategoryHint.trim().length > 0) {
    const hintUpper = sourceCategoryHint.trim().toUpperCase().replace(/[^A-Z0-9\s&]/g, "");

    const HINT_MAP: Record<string, CanonicalCategoryId> = {
      FOOD: "food_dining",
      DINING: "food_dining",
      "FOOD & DINING": "food_dining",
      "FOOD AND DINING": "food_dining",
      RESTAURANT: "food_dining",
      GROCERY: "groceries",
      GROCERIES: "groceries",
      RENT: "housing_rent",
      HOUSING: "housing_rent",
      "HOUSING & RENT": "housing_rent",
      "HOUSING AND RENT": "housing_rent",
      HOSTEL: "housing_rent",
      UTILITY: "utilities_bills",
      UTILITIES: "utilities_bills",
      BILLS: "utilities_bills",
      "UTILITIES & BILLS": "utilities_bills",
      "UTILITIES AND BILLS": "utilities_bills",
      ELECTRICITY: "utilities_bills",
      TRANSPORT: "transport_fuel",
      FUEL: "transport_fuel",
      "TRANSPORT & FUEL": "transport_fuel",
      "TRANSPORT AND FUEL": "transport_fuel",
      TRAVEL: "transport_fuel",
      SHOPPING: "shopping",
      RETAIL: "shopping",
      HEALTH: "healthcare_pharmacy",
      HEALTHCARE: "healthcare_pharmacy",
      PHARMACY: "healthcare_pharmacy",
      MEDICAL: "healthcare_pharmacy",
      EDUCATION: "education",
      BOOKS: "education",
      TUITION: "education",
      ENTERTAINMENT: "entertainment_subscriptions",
      SUBSCRIPTION: "entertainment_subscriptions",
      SUBSCRIPTIONS: "entertainment_subscriptions",
      "ENTERTAINMENT & SUBSCRIPTIONS": "entertainment_subscriptions",
      "ENTERTAINMENT AND SUBSCRIPTIONS": "entertainment_subscriptions",
      LOAN: "loan_repayments_emis",
      EMI: "loan_repayments_emis",
      DEBT: "loan_repayments_emis",
      INSURANCE: "insurance",
      INVESTMENT: "investments_savings",
      INVESTMENTS: "investments_savings",
      SAVINGS: "investments_savings",
      TRANSFER: "transfers_own_accounts",
      "SELF TRANSFER": "transfers_own_accounts",
      CASH: "cash_withdrawals",
      ATM: "cash_withdrawals",
      SALARY: "income_salary",
      INCOME: "income_salary",
      ALLOWANCE: "income_salary",
      STIPEND: "income_salary",
      REFUND: "refunds_reversals",
      REVERSAL: "refunds_reversals",
      CASHBACK: "refunds_reversals",
    };

    let matchedCat: CanonicalCategoryId | undefined = HINT_MAP[hintUpper];
    if (!matchedCat) {
      // Partial keyword match in hint
      for (const [key, catId] of Object.entries(HINT_MAP)) {
        if (hintUpper.includes(key) || key.includes(hintUpper)) {
          matchedCat = catId;
          break;
        }
      }
    }

    if (matchedCat) {
      const meta = CATEGORIES[matchedCat];
      // Directional check: Credits must never be classified as expenses
      if (type === "CR") {
        if (meta && meta.isCredit) {
          return {
            category: matchedCat,
            ruleUsed: `Source Category Hint (${sourceCategoryHint})`,
            confidenceLevel: "high",
            confidence: 0.88,
          };
        } else {
          // If credit arrived with an expense label, treat as refund/reversal
          return {
            category: "refunds_reversals",
            ruleUsed: `Credit Reversal of ${sourceCategoryHint}`,
            confidenceLevel: "needs_review",
            confidence: 0.8,
          };
        }
      } else {
        // Debit
        if (meta && !meta.isCredit) {
          return {
            category: matchedCat,
            ruleUsed: `Source Category Hint (${sourceCategoryHint})`,
            confidenceLevel: "high",
            confidence: 0.88,
          };
        }
      }
    }
  }

  // 3. Fallback defaults respecting transaction direction
  if (type === "CR") {
    // If incoming credit didn't match specific salary or refund, classify as other_credits
    return {
      category: "other_credits",
      ruleUsed: "Default Inflow Credit Rule",
      confidenceLevel: "needs_review",
      confidence: 0.5,
    };
  }

  // Fallback for DR transactions
  return {
    category: "uncategorized",
    ruleUsed: "Unmatched Expense Narration",
    confidenceLevel: "uncategorized",
    confidence: 0.2,
  };
}

export interface StatementAnalytics {
  totalInflowPaise: number;
  totalOutflowPaise: number;
  consumerSpendingPaise: number;
  netCashFlowPaise: number;
  savingsRatePercent: number;
  averageDailySpendPaise: number;
  totalTransactions: number;
  daysCount: number;
  startDate: string;
  endDate: string;
  topCategory: {
    id: CanonicalCategoryId;
    label: string;
    amountPaise: number;
    percent: number;
    color: string;
  } | null;
  largestExpense: {
    narration: string;
    amountPaise: number;
    date: string;
    category: string;
  } | null;
  recurringExpenseTotalPaise: number;
  oneOffExpenseTotalPaise: number;
  categoryTotals: Record<
    CanonicalCategoryId,
    {
      id: CanonicalCategoryId;
      label: string;
      amountPaise: number;
      transactionCount: number;
      percentOfOutflows: number;
      color: string;
      group: CategoryGroup;
      isConsumerSpend: boolean;
    }
  >;
  monthlyBreakdown: Array<{
    monthKey: string;
    monthLabel: string;
    inflowPaise: number;
    outflowPaise: number;
    netPaise: number;
  }>;
  insights: string[];
}

/**
 * Calculate dynamic spending summaries and analytics from an array of parsed transactions.
 */
export function calculateStatementAnalytics(
  transactions: ParsedTransaction[]
): StatementAnalytics {
  let totalInflowPaise = 0;
  let totalOutflowPaise = 0;
  let consumerSpendingPaise = 0;
  let recurringExpenseTotalPaise = 0;
  let oneOffExpenseTotalPaise = 0;

  // Initialize category totals map
  const categoryMap: Record<
    CanonicalCategoryId,
    {
      id: CanonicalCategoryId;
      label: string;
      amountPaise: number;
      transactionCount: number;
      percentOfOutflows: number;
      color: string;
      group: CategoryGroup;
      isConsumerSpend: boolean;
    }
  > = {} as any;

  (Object.keys(CATEGORIES) as CanonicalCategoryId[]).forEach((catId) => {
    const meta = CATEGORIES[catId];
    categoryMap[catId] = {
      id: catId,
      label: meta.label,
      amountPaise: 0,
      transactionCount: 0,
      percentOfOutflows: 0,
      color: meta.color,
      group: meta.group,
      isConsumerSpend: meta.isConsumerSpend,
    };
  });

  // Track monthly totals
  const monthlyMap: Record<string, { inflow: number; outflow: number }> = {};
  let largestExpenseItem: StatementAnalytics["largestExpense"] = null;

  // Process all transactions
  transactions.forEach((tx) => {
    const amt = tx.amount_paise;
    const catId = (tx.category as CanonicalCategoryId) in CATEGORIES
      ? (tx.category as CanonicalCategoryId)
      : "uncategorized";

    const monthKey = tx.date ? tx.date.substring(0, 7) : "2026-04";
    if (!monthlyMap[monthKey]) {
      monthlyMap[monthKey] = { inflow: 0, outflow: 0 };
    }

    if (tx.type === "CR") {
      totalInflowPaise += amt;
      monthlyMap[monthKey].inflow += amt;
      categoryMap[catId].amountPaise += amt;
      categoryMap[catId].transactionCount += 1;
    } else {
      totalOutflowPaise += amt;
      monthlyMap[monthKey].outflow += amt;
      categoryMap[catId].amountPaise += amt;
      categoryMap[catId].transactionCount += 1;

      // Check consumer spend
      if (CATEGORIES[catId]?.isConsumerSpend) {
        consumerSpendingPaise += amt;
      }

      // Check recurring vs one-off
      if (
        catId === "housing_rent" ||
        catId === "utilities_bills" ||
        catId === "entertainment_subscriptions" ||
        catId === "loan_repayments_emis" ||
        catId === "insurance"
      ) {
        recurringExpenseTotalPaise += amt;
      } else {
        oneOffExpenseTotalPaise += amt;
      }

      // Check largest single expense
      if (!largestExpenseItem || amt > largestExpenseItem.amountPaise) {
        largestExpenseItem = {
          narration: tx.narration,
          amountPaise: amt,
          date: tx.date,
          category: CATEGORIES[catId]?.label || catId,
        };
      }
    }
  });

  // Calculate percentages of total outflows for each category
  (Object.keys(categoryMap) as CanonicalCategoryId[]).forEach((catId) => {
    const item = categoryMap[catId];
    if (totalOutflowPaise > 0 && CATEGORIES[catId]?.isExpense) {
      item.percentOfOutflows = Math.round((item.amountPaise / totalOutflowPaise) * 100);
    } else {
      item.percentOfOutflows = 0;
    }
  });

  // Find top expense category by amount
  let topCategory: StatementAnalytics["topCategory"] = null;
  let maxExpenseAmount = 0;

  for (const catId of Object.keys(categoryMap) as CanonicalCategoryId[]) {
    const meta = CATEGORIES[catId];
    if (meta.isExpense && categoryMap[catId].amountPaise > maxExpenseAmount) {
      maxExpenseAmount = categoryMap[catId].amountPaise;
      topCategory = {
        id: catId,
        label: meta.label,
        amountPaise: maxExpenseAmount,
        percent: totalOutflowPaise > 0 ? Math.round((maxExpenseAmount / totalOutflowPaise) * 100) : 0,
        color: meta.color,
      };
    }
  }

  // Dates and days count
  const sortedDates = transactions.map((t) => t.date).filter(Boolean).sort();
  const startDate = sortedDates[0] || "";
  const endDate = sortedDates[sortedDates.length - 1] || "";

  let daysCount = 30;
  if (startDate && endDate) {
    const startMs = new Date(startDate).getTime();
    const endMs = new Date(endDate).getTime();
    const diff = Math.round((endMs - startMs) / (1000 * 60 * 60 * 24));
    daysCount = Math.max(1, diff + 1);
  }

  // Average daily spend
  const averageDailySpendPaise = daysCount > 0 ? Math.round(totalOutflowPaise / daysCount) : 0;

  // Net Cash Flow and Savings Rate
  const netCashFlowPaise = totalInflowPaise - totalOutflowPaise;
  const savingsRatePercent =
    totalInflowPaise > 0
      ? Math.max(0, Math.min(100, Math.round(((totalInflowPaise - totalOutflowPaise) / totalInflowPaise) * 100)))
      : 0;

  // Monthly breakdown sorted chronologically
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const monthlyBreakdown = Object.keys(monthlyMap)
    .sort()
    .map((mKey) => {
      const parts = mKey.split("-");
      const monthIdx = parseInt(parts[1], 10) - 1;
      const monthLabel = `${monthNames[monthIdx] || parts[1]} ${parts[0]}`;
      const data = monthlyMap[mKey];
      return {
        monthKey: mKey,
        monthLabel,
        inflowPaise: data.inflow,
        outflowPaise: data.outflow,
        netPaise: data.inflow - data.outflow,
      };
    });

  // Human-readable financial insights generated from actual numbers
  const insights: string[] = [];

  if (topCategory && topCategory.percent > 0) {
    insights.push(
      `${topCategory.label} represents your highest outflow at ${topCategory.percent}% of total expenses.`
    );
  }

  if (savingsRatePercent >= 15) {
    insights.push(
      `Healthy savings discipline observed: you retained ${savingsRatePercent}% of your total incoming funds over this period.`
    );
  } else if (netCashFlowPaise < 0) {
    insights.push(
      `Net cash flow was negative by ${(Math.abs(netCashFlowPaise) / 100).toLocaleString("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 })}, meaning outflows exceeded inflows over this statement.`
    );
  } else {
    insights.push(
      `Net positive cash flow of ${(netCashFlowPaise / 100).toLocaleString("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 })} gives you a viable operating buffer for a starter credit line.`
    );
  }

  if (recurringExpenseTotalPaise > 0 && totalOutflowPaise > 0) {
    const recurringPercent = Math.round((recurringExpenseTotalPaise / totalOutflowPaise) * 100);
    insights.push(
      `Fixed recurring obligations (rent, utilities, subscriptions) make up ${recurringPercent}% of expenses.`
    );
  }

  const foodDiningSpend = categoryMap.food_dining.amountPaise;
  if (foodDiningSpend > 0 && totalOutflowPaise > 0) {
    const foodPercent = Math.round((foodDiningSpend / totalOutflowPaise) * 100);
    if (foodPercent >= 20) {
      insights.push(
        `Food and dining account for ${foodPercent}% of all outflows. Trimming discretionary ordering could unlock ₹1,000 or more in monthly savings.`
      );
    }
  }

  const uncategorizedSpend = categoryMap.uncategorized.amountPaise;
  if (uncategorizedSpend > 0) {
    insights.push(
      `${categoryMap.uncategorized.transactionCount} transactions need review. Classifying them sharpens your credit limit evaluation.`
    );
  }

  return {
    totalInflowPaise,
    totalOutflowPaise,
    consumerSpendingPaise,
    netCashFlowPaise,
    savingsRatePercent,
    averageDailySpendPaise,
    totalTransactions: transactions.length,
    daysCount,
    startDate,
    endDate,
    topCategory,
    largestExpense: largestExpenseItem,
    recurringExpenseTotalPaise,
    oneOffExpenseTotalPaise,
    categoryTotals: categoryMap,
    monthlyBreakdown,
    insights,
  };
}
