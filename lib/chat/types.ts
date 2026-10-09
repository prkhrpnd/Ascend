export interface ChatContext {
  limitPaise?: number;
  availablePaise?: number;
  outstandingPaise?: number;
  dueDay?: number;
  medianIncomePaise?: number;
  cleanCycles?: number;
  historyStrength?: number;
  netCashFlowPaise?: number;
  totalInflowPaise?: number;
  totalOutflowPaise?: number;
  savingsRatePercent?: number;
  topCategory?: {
    label: string;
    amountPaise: number;
    percent: number;
  };
  financialHealthScore?: {
    score: number | null;
    rating: string;
    subScores: {
      cashFlowSurplus: number;
      fixedObligationRatio: number;
      periodConsistency: number;
      spendingDiscipline: number;
    };
    reasons?: string[];
    actionableSuggestion?: string;
  };
  positiveMonthsCount?: number;
  totalMonthsCount?: number;
  activeFileName?: string;
  studentName?: string;
  cycleNumber?: number;
  primaryIncomeDay?: number;
  history?: Array<{
    sender: "user" | "ascend";
    text: string;
  }>;
}

export interface ChatResponse {
  answer: string;
  refused: boolean;
  refusalReason?: string;
  source: "prefilter" | "ai" | "template";
  suggestedChips?: string[];
}
