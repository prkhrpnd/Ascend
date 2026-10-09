import { StatementAnalytics } from "./categories";
import { StatementCoverage } from "./types";
import { formatPaise } from "@/lib/utils";

export type HealthScoreRating = "Excellent" | "Good" | "Fair" | "Needs Attention" | "Insufficient Data";

export interface FinancialHealthScoreResult {
  score: number | null;
  rating: HealthScoreRating;
  isAvailable: boolean;
  reasons: string[];
  actionableSuggestion: string;
  subScores: {
    cashFlowSurplus: number;
    fixedObligationRatio: number;
    periodConsistency: number;
    spendingDiscipline: number;
  };
  disclaimer: string;
}

/**
 * Transparent, deterministic calculation of a Financial Health Score out of 100
 * derived from actual statement cash-flow and spending data.
 */
export function calculateFinancialHealthScore(
  analytics: StatementAnalytics | null,
  coverage: StatementCoverage | null
): FinancialHealthScoreResult {
  const disclaimer =
    "Informational financial health score based on cash-flow discipline, not an official credit bureau score.";

  if (!analytics || analytics.totalTransactions === 0) {
    return {
      score: null,
      rating: "Insufficient Data",
      isAvailable: false,
      reasons: ["No statement transactions have been analyzed yet."],
      actionableSuggestion: "Upload a bank statement CSV to compute your financial health score.",
      subScores: {
        cashFlowSurplus: 0,
        fixedObligationRatio: 0,
        periodConsistency: 0,
        spendingDiscipline: 0,
      },
      disclaimer,
    };
  }

  // 1. Cash Flow & Savings Discipline (Up to 35 points)
  let cashFlowScore = 0;
  let cashFlowReason = "";
  if (analytics.netCashFlowPaise > 0) {
    if (analytics.savingsRatePercent >= 20) {
      cashFlowScore = 35;
      cashFlowReason = `Strong savings discipline: retained ${analytics.savingsRatePercent}% of incoming funds.`;
    } else if (analytics.savingsRatePercent >= 10) {
      cashFlowScore = 28;
      cashFlowReason = `Positive cash flow surplus of ${formatPaise(analytics.netCashFlowPaise)} (${analytics.savingsRatePercent}% savings rate).`;
    } else {
      cashFlowScore = 20;
      cashFlowReason = `Modest operating surplus of ${formatPaise(analytics.netCashFlowPaise)} over this statement.`;
    }
  } else if (analytics.netCashFlowPaise === 0) {
    cashFlowScore = 14;
    cashFlowReason = "Operating at break-even: total outflows match incoming funds.";
  } else {
    const deficitRatio =
      analytics.totalInflowPaise > 0
        ? Math.abs(analytics.netCashFlowPaise) / analytics.totalInflowPaise
        : 1;
    if (deficitRatio < 0.15) {
      cashFlowScore = 8;
      cashFlowReason = `Mild cash deficit: outflows exceeded inflows by ${formatPaise(Math.abs(analytics.netCashFlowPaise))}.`;
    } else {
      cashFlowScore = 0;
      cashFlowReason = `High cash deficit: outflows exceeded inflows by ${formatPaise(Math.abs(analytics.netCashFlowPaise))}.`;
    }
  }

  // 2. Fixed Obligations to Inflow Ratio (Up to 25 points)
  let fixedScore = 0;
  let fixedReason = "";
  const fixedRatio =
    analytics.totalInflowPaise > 0
      ? analytics.recurringExpenseTotalPaise / analytics.totalInflowPaise
      : 1;
  const fixedPercent = Math.round(fixedRatio * 100);

  if (fixedRatio <= 0.4) {
    fixedScore = 25;
    fixedReason = `Fixed commitments (rent, utilities) consume ${fixedPercent}% of inflows, within safe bounds.`;
  } else if (fixedRatio <= 0.6) {
    fixedScore = 18;
    fixedReason = `Fixed obligations account for ${fixedPercent}% of inflows, manageable with timely allowance.`;
  } else if (fixedRatio <= 0.8) {
    fixedScore = 10;
    fixedReason = `High fixed commitments at ${fixedPercent}% of income, leaving narrow discretionary room.`;
  } else {
    fixedScore = 4;
    fixedReason = `Heavy fixed obligations at ${fixedPercent}% of inflows create potential cash stress.`;
  }

  // 3. Period Cash Flow Consistency (Up to 25 points)
  let consistencyScore = 0;
  let consistencyReason = "";
  const months = analytics.monthlyBreakdown || [];

  if (months.length >= 2) {
    const positiveMonths = months.filter((m) => m.netPaise >= 0).length;
    consistencyScore = Math.round((positiveMonths / months.length) * 25);
    consistencyReason = `${positiveMonths} of ${months.length} statement months maintained positive cash flow.`;
  } else if (months.length === 1) {
    if (analytics.netCashFlowPaise >= 0) {
      consistencyScore = 18;
      consistencyReason = "Single month analyzed shows positive net operating balance.";
    } else {
      consistencyScore = 8;
      consistencyReason = "Single month analyzed shows negative cash flow.";
    }
  } else {
    consistencyScore = 12;
    consistencyReason = "Limited multi-month history available for trend analysis.";
  }

  // 4. Discretionary Spending Discipline (Up to 15 points)
  let disciplineScore = 0;
  const cashWithdrawals = analytics.categoryTotals?.cash_withdrawals?.amountPaise || 0;
  const cashRatio =
    analytics.totalOutflowPaise > 0 ? cashWithdrawals / analytics.totalOutflowPaise : 0;
  const cashPercent = Math.round(cashRatio * 100);

  if (cashRatio < 0.1) {
    disciplineScore = 15;
  } else if (cashRatio < 0.25) {
    disciplineScore = 10;
  } else {
    disciplineScore = 5;
  }

  // Calculate Total Score
  const totalScore = Math.min(
    100,
    Math.max(0, cashFlowScore + fixedScore + consistencyScore + disciplineScore)
  );

  let rating: HealthScoreRating = "Needs Attention";
  if (totalScore >= 80) {
    rating = "Excellent";
  } else if (totalScore >= 65) {
    rating = "Good";
  } else if (totalScore >= 50) {
    rating = "Fair";
  }

  // Actionable suggestion
  let actionableSuggestion = "";
  if (analytics.netCashFlowPaise < 0) {
    actionableSuggestion = `Trim discretionary outflows in ${analytics.topCategory?.label || "top categories"} to eliminate your monthly operating deficit.`;
  } else if (fixedRatio > 0.5) {
    actionableSuggestion = "Align recurring bill and hostel due dates with your main family allowance date to protect your ₹300 safety buffer.";
  } else if (analytics.savingsRatePercent < 15) {
    actionableSuggestion = "Aim to retain at least 15% of incoming allowance each month to establish an emergency campus liquidity reserve.";
  } else {
    actionableSuggestion = "Maintain current spending discipline to qualify for starter credit line limit progression.";
  }

  const reasons = [cashFlowReason, fixedReason, consistencyReason].filter(Boolean);

  return {
    score: totalScore,
    rating,
    isAvailable: true,
    reasons,
    actionableSuggestion,
    subScores: {
      cashFlowSurplus: cashFlowScore,
      fixedObligationRatio: fixedScore,
      periodConsistency: consistencyScore,
      spendingDiscipline: disciplineScore,
    },
    disclaimer,
  };
}
