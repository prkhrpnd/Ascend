import { ParsedTransaction, IncomeAssessment, MonthlyIncomeBreakdown, RecurringItem } from "./types";
import { POLICY } from "@/config/policy";

/**
 * Calculate monthly breakdown and qualifying income.
 */
export function assessIncome(
  transactions: ParsedTransaction[],
  recurringItems: RecurringItem[]
): IncomeAssessment {
  // Group by YYYY-MM
  const monthMap: Record<string, ParsedTransaction[]> = {};

  transactions.forEach((tx) => {
    const m = tx.date.substring(0, 7);
    if (!monthMap[m]) monthMap[m] = [];
    monthMap[m].push(tx);
  });

  const monthKeys = Object.keys(monthMap).sort();

  // Find primary income recurring item (largest recurring inflow)
  const recurringInflows = recurringItems.filter((r) => r.type === "CR");
  recurringInflows.sort((a, b) => b.amount_paise - a.amount_paise);
  const primaryRecurring = recurringInflows[0] || null;

  const primaryIncomeDay = primaryRecurring ? primaryRecurring.dayOfMonth : 1;
  const dueDate = primaryIncomeDay + POLICY.dueDateOffsetDays;

  const months: MonthlyIncomeBreakdown[] = [];

  monthKeys.forEach((mKey) => {
    const txsInMonth = monthMap[mKey];

    let earned = 0;
    let dependent = 0;
    let loanApp = 0;
    let roundTrip = 0;
    let totalInflow = 0;
    let totalOutflow = 0;

    txsInMonth.forEach((tx) => {
      if (tx.type === "CR") {
        totalInflow += tx.amount_paise;
        if (tx.isRoundTrip) {
          roundTrip += tx.amount_paise;
        } else if (tx.isLoanApp || tx.category === "loan_app_inflow") {
          loanApp += tx.amount_paise;
        } else if (tx.category === "earned_income") {
          earned += tx.amount_paise;
        } else if (tx.category === "allowance_dependent") {
          dependent += tx.amount_paise;
        } else {
          // Other unclassified inflows count as earned or general
          earned += tx.amount_paise;
        }
      } else {
        totalOutflow += tx.amount_paise;
      }
    });

    // Qualifying income: earned * 1.0 + dependent * dependentIncomeWeight
    const qualifying = Math.round(earned * 1.0 + dependent * POLICY.dependentIncomeWeight);

    // Compute lowest balance seen in the 7 days before the primary income day
    // Days in window: if primaryIncomeDay is 1, 7 days before is previous month end (days 24 to end)
    // or days (primaryIncomeDay - 7) to (primaryIncomeDay - 1)
    let preIncomeBalances: number[] = [];

    txsInMonth.forEach((tx) => {
      const d = parseInt(tx.date.substring(8, 10), 10);
      let inWindow = false;
      if (primaryIncomeDay === 1) {
        // days 24 to 31
        inWindow = d >= 24;
      } else {
        const startDay = Math.max(1, primaryIncomeDay - 7);
        inWindow = d >= startDay && d < primaryIncomeDay;
      }

      if (inWindow) {
        preIncomeBalances.push(tx.balance_paise);
      }
    });

    const lowestPre =
      preIncomeBalances.length > 0
        ? Math.min(...preIncomeBalances)
        : txsInMonth.reduce((min, t) => Math.min(min, t.balance_paise), txsInMonth[0]?.balance_paise || 0);

    months.push({
      monthKey: mKey,
      earnedIncomePaise: earned,
      dependentAllowancePaise: dependent,
      loanAppPaise: loanApp,
      roundTripPaise: roundTrip,
      qualifyingIncomePaise: qualifying,
      totalInflowPaise: totalInflow,
      totalOutflowPaise: totalOutflow,
      lowestPreIncomeBalancePaise: lowestPre,
    });
  });

  // Calculate median qualifying income across months
  const qualifyingList = months.map((m) => m.qualifyingIncomePaise).sort((a, b) => a - b);
  const mid = Math.floor(qualifyingList.length / 2);
  const medianQualifying =
    qualifyingList.length % 2 !== 0
      ? qualifyingList[mid]
      : Math.round((qualifyingList[mid - 1] + qualifyingList[mid]) / 2);

  return {
    months,
    medianQualifyingIncomePaise: medianQualifying || 0,
    primaryIncomeDay,
    dueDate,
    largestRecurringPayee: primaryRecurring ? primaryRecurring.normalizedPayee : "DIRECT ALLOWANCE",
  };
}
