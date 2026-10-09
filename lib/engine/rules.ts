import { Category, TransactionType } from "./types";

export const LOAN_APP_KEYWORDS = [
  "KREDITBEE",
  "MONEYVIEW",
  "SLICE",
  "KISSHT",
  "FIBE",
  "ZESTMONEY",
  "EARLYSALARY",
];

export interface KeywordRule {
  category: Category;
  type: TransactionType;
  keywords: string[];
  confidence: number;
}

export const CATEGORY_RULES: KeywordRule[] = [
  // Loan apps
  {
    category: "loan_app_inflow",
    type: "CR",
    keywords: LOAN_APP_KEYWORDS,
    confidence: 0.95,
  },
  {
    category: "loan_app_repayment",
    type: "DR",
    keywords: LOAN_APP_KEYWORDS,
    confidence: 0.95,
  },
  // Allowance / dependent
  {
    category: "allowance_dependent",
    type: "CR",
    keywords: ["ALLOWANCE", "POCKET MONEY", "RAJESH VERMA", "PAPA", "MOM", "FAMILY", "HOME TRANSFER"],
    confidence: 0.9,
  },
  // Earned income
  {
    category: "earned_income",
    type: "CR",
    keywords: ["TUITION", "COACHING", "SALARY", "STIPEND", "INTERNSHIP", "FREELANCE", "CLIENT", "DESIGN"],
    confidence: 0.88,
  },
  // Rent / hostel
  {
    category: "rent_hostel",
    type: "DR",
    keywords: ["HOSTEL", "MESS ACCT", "RENT", "LANDLORD", "PG ACCOMMODATION"],
    confidence: 0.92,
  },
  // Utilities
  {
    category: "utilities",
    type: "DR",
    keywords: ["ELECTRICITY", "MESS ELECTRICITY", "WATER BILL", "JVVNL", "BESCOM", "POWER"],
    confidence: 0.85,
  },
  // Phone / subscriptions
  {
    category: "phone_subscription",
    type: "DR",
    keywords: ["PREPAID", "JIO", "AIRTEL", "VI", "SPOTIFY", "NETFLIX", "AMAZON PRIME", "YOUTUBE PREMIUM"],
    confidence: 0.9,
  },
  // Food delivery
  {
    category: "food_delivery",
    type: "DR",
    keywords: ["SWIGGY", "ZOMATO", "EATS"],
    confidence: 0.9,
  },
  // Groceries
  {
    category: "groceries",
    type: "DR",
    keywords: ["KIRANA", "BLINKIT", "ZEPTO", "INSTAMART", "GROCERY", "SUPERMARKET"],
    confidence: 0.85,
  },
  // Transport
  {
    category: "transport",
    type: "DR",
    keywords: ["AUTO", "RIKSHAW", "UBER", "OLA", "METRO", "RAPIDO", "BUS"],
    confidence: 0.85,
  },
  // Friend transfers
  {
    category: "friend_transfer",
    type: "CR",
    keywords: ["SPLIT", "ANANYA", "ROOMIE", "FRIEND", "CONTRIBUTION"],
    confidence: 0.75,
  },
  {
    category: "friend_transfer",
    type: "DR",
    keywords: ["SPLIT", "ANANYA", "ROOMIE", "FRIEND", "CONTRIBUTION"],
    confidence: 0.75,
  },
];
