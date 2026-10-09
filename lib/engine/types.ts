export type TransactionType = "CR" | "DR";

export type LegacyCategory =
  | "allowance_dependent"
  | "earned_income"
  | "rent_hostel"
  | "utilities"
  | "phone_subscription"
  | "food_delivery"
  | "groceries"
  | "transport"
  | "loan_app_inflow"
  | "loan_app_repayment"
  | "friend_transfer"
  | "unknown";

export type Category =
  | LegacyCategory
  | "housing_rent"
  | "utilities_bills"
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
  | "uncategorized"
  | string;

export type ClassificationSource = "rule" | "ai" | "user";

export interface ParsedTransaction {
  id: string;
  date: string; // YYYY-MM-DD
  narration: string;
  amount_paise: number;
  type: TransactionType;
  balance_paise: number;
  category: Category;
  source: ClassificationSource;
  confidence: number;
  ruleUsed?: string;
  confidenceLevel?: "high" | "needs_review" | "uncategorized";
  isUserOverride?: boolean;
  isRoundTrip?: boolean;
  roundTripPairId?: string;
  isLoanApp?: boolean;
  referenceId?: string;
  sourceCategory?: string;
  paymentMethod?: string;
  currency?: string;
  time?: string;
  valueDate?: string;
  note?: string;
}

export type CoverageConfidence = "limited" | "ok" | "good";

export interface StatementCoverage {
  startDate: string;
  endDate: string;
  monthsCount: number;
  totalTransactions: number;
  confidence: CoverageConfidence;
}

export interface RecurringItem {
  id: string;
  payeeKey: string;
  normalizedPayee: string;
  rawNarration: string;
  amount_paise: number;
  dayOfMonth: number;
  occurrences: number;
  confidence: number;
  isRent: boolean;
  userConfirmedRent?: boolean;
  nextExpectedDate: string;
  type: TransactionType;
}

export interface MonthlyIncomeBreakdown {
  monthKey: string; // YYYY-MM
  earnedIncomePaise: number;
  dependentAllowancePaise: number;
  loanAppPaise: number;
  roundTripPaise: number;
  qualifyingIncomePaise: number;
  totalInflowPaise: number;
  totalOutflowPaise: number;
  lowestPreIncomeBalancePaise: number;
}

export interface IncomeAssessment {
  months: MonthlyIncomeBreakdown[];
  medianQualifyingIncomePaise: number;
  primaryIncomeDay: number;
  dueDate: number;
  largestRecurringPayee: string;
}

export interface MonthBacktestResult {
  monthKey: string;
  normalCovered: boolean;
  normalBalanceOnDue: number;
  stressCovered: boolean;
  stressLowPoint: number;
}

export interface LineBacktestSummary {
  lineAmountPaise: number;
  normalMonthsPassed: number;
  stressMonthsPassed: number;
  totalMonths: number;
  details: MonthBacktestResult[];
}

export interface LimitAssessment {
  tierCapPaise: number;
  capacityCapPaise: number;
  stressDueDateCapPaise: number;
  bindingCap: "tierCap" | "capacityCap" | "stressDueDateCap" | "insufficientHistory";
  finalLimitPaise: number;
  isEligible: boolean;
  reasonCode: "ELIGIBLE" | "INSUFFICIENT_HISTORY" | "LOW_BALANCE_BUFFER" | "VOLATILE_CASHFLOW";
  reasonText: string;
  backtests: LineBacktestSummary[];
}

export interface CostCardDetails {
  drawAmountPaise: number;
  cycleNumber: number;
  dueDateFormatted: string;
  onTimeInterestPaise: number;
  isFirstCycleInterestFree: boolean;
  onTimeTotalPaise: number;
  lateFeePaise: number;
  lateFeeTotalPaise: number;
  ascendLateFeeSharePaise: number; // Always 0
  penaltyInterestPaise: number; // Always 0
  annualRateExplanation: string;
  partnerDisclaimer: string;
  bureauNotice: string;
}

export interface SimulationDay {
  dayIndex: number;
  dateStr: string;
  safeBalancePaise: number;
  stressBalancePaise: number;
  isDueDate: boolean;
  isBufferBreached: boolean;
  events?: string[];
  safeInflowPaise?: number;
  stressInflowPaise?: number;
  safeOutflowPaise?: number;
  stressOutflowPaise?: number;
}

export interface SimulationResult {
  days: SimulationDay[];
  safeEndingBalancePaise: number;
  stressEndingBalancePaise: number;
  bufferPaise: number;
  stressBreachedBuffer: boolean;
  saferChoices?: {
    smallerDrawPaise: number;
    delayDays: number;
    explanation: string;
  };
  startingBalancePaise: number;
  startDateStr: string;
  minSafeBalancePaise: number;
  minSafeDateStr: string;
  minStressBalancePaise: number;
  minStressDateStr: string;
  preRepayment1SafePaise: number;
  postRepayment1SafePaise: number;
  preRepayment1StressPaise: number;
  postRepayment1StressPaise: number;
  preRepayment2SafePaise: number;
  postRepayment2SafePaise: number;
  preRepayment2StressPaise: number;
  postRepayment2StressPaise: number;
  daysBelowBufferSafe: number;
  daysBelowBufferStress: number;
  daysBelowZeroSafe: number;
  daysBelowZeroStress: number;
  firstBufferBreachDateStr: string | null;
  dueDay1Index: number | null;
  dueDay2Index: number | null;
}

export type LifecycleState =
  | "ELIGIBILITY"
  | "CONSENT"
  | "LINKED"
  | "ASSESSED"
  | "OFFERED"
  | "ACTIVE"
  | "CYCLE_DUE"
  | "REPAID"
  | "SLIPPING"
  | "PAUSED"
  | "FROZEN"
  | "GRADUATED";

export interface CycleHistoryEntry {
  cycleNumber: number;
  limitPaise: number;
  drawnPaise: number;
  repaidPaise: number;
  onTime: boolean;
  stressCycle: boolean;
  lateFeeAppliedPaise: number;
  utilisationPercent: number;
  timestamp: string;
}

export interface UserCreditState {
  state: LifecycleState;
  currentTierIndex: number;
  limitPaise: number;
  selfSetCapPaise: number;
  outstandingPaise: number;
  availablePaise: number;
  cycleNumber: number;
  cleanCycles: number;
  consecutiveCleanCycles: number;
  stressCyclesPassed: number;
  missedCycles: number;
  historyStrength: number;
  cycleHistory: CycleHistoryEntry[];
  lastDrawTimestamp?: number;
  drawCountToday: number;
  autoPayActive: boolean;
  slipScenarioActive: boolean;
  slipLadderStep?: "EARLY_WARNING" | "REMINDER" | "SHIFT_OFFERED" | "SPLIT_OFFERED" | "MISSED";
  dueDateShiftUsed?: boolean;
}
