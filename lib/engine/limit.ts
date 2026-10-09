import {
  LimitAssessment,
  IncomeAssessment,
  StatementCoverage,
  LineBacktestSummary,
  MonthBacktestResult,
  ParsedTransaction,
} from "./types";
import { POLICY } from "@/config/policy";

/**
 * Calculate the three caps, binding cap, and Day-1 backtest across candidate lines.
 */
export function calculateLimitAndBacktest(
  income: IncomeAssessment,
  coverage: StatementCoverage,
  allTransactions: ParsedTransaction[]
): LimitAssessment {
  const candidateLines = [50000, 150000, 300000]; // Rs 500, Rs 1,500, Rs 3,000 in paise

  // 1. Check history months
  if (coverage.monthsCount < POLICY.minHistoryMonths) {
    return {
      tierCapPaise: POLICY.tiers[0],
      capacityCapPaise: Math.round(income.medianQualifyingIncomePaise * POLICY.capacityIncomeRatio),
      stressDueDateCapPaise: 0,
      bindingCap: "insufficientHistory",
      finalLimitPaise: 0,
      isEligible: false,
      reasonCode: "INSUFFICIENT_HISTORY",
      reasonText: `Statement shows only ${coverage.monthsCount} months of data. Ascend requires at least ${POLICY.minHistoryMonths} months of verified cash flow.`,
      backtests: [],
    };
  }

  // 2. Compute lowPoint across months
  const monthlyLowPoints = income.months.map((m) => m.lowestPreIncomeBalancePaise);
  const minLowPoint = monthlyLowPoints.length > 0 ? Math.min(...monthlyLowPoints) : 0;

  // 3. Compute Three Caps
  const tierCap = POLICY.tiers[0]; // Rs 500 starter tier = 50,000 paise
  const capacityCap = Math.round(income.medianQualifyingIncomePaise * POLICY.capacityIncomeRatio);
  const stressDueDateCap = Math.max(0, minLowPoint - POLICY.bufferPaise);

  // Determine binding cap
  const caps = [
    { name: "tierCap" as const, val: tierCap },
    { name: "capacityCap" as const, val: capacityCap },
    { name: "stressDueDateCap" as const, val: stressDueDateCap },
  ];
  caps.sort((a, b) => a.val - b.val);
  const binding = caps[0];
  const finalLimit = binding.val;

  // Plain-language explanation
  let reasonCode: LimitAssessment["reasonCode"] = "ELIGIBLE";
  let reasonText = "";

  if (finalLimit === 0) {
    if (stressDueDateCap === 0) {
      reasonCode = "LOW_BALANCE_BUFFER";
      reasonText = `In your lowest week, your account balance dipped below the Rs ${POLICY.bufferPaise / 100} safety buffer. We keep your limit at Rs 0 so you never risk overdraft or missed payments.`;
    } else {
      reasonCode = "VOLATILE_CASHFLOW";
      reasonText = "Cash flow volatility exceeds the safe starter threshold. Build 3 consistent monthly inflows to unlock starter credit.";
    }
  } else {
    reasonCode = "ELIGIBLE";
    if (binding.name === "tierCap") {
      reasonText = `You qualify for a higher capacity limit, but all members start at the starter tier of Rs ${tierCap / 100} to build an immaculate credit foundation.`;
    } else if (binding.name === "capacityCap") {
      reasonText = `Limit is set to 20% of your verified median monthly inflow (Rs ${Math.round(income.medianQualifyingIncomePaise / 100)}).`;
    } else {
      reasonText = `Limit is calibrated against your lowest pre-allowance balance of Rs ${Math.round(minLowPoint / 100)} minus the safety buffer.`;
    }
  }

  // 4. Backtest candidate lines across historical months
  const backtests: LineBacktestSummary[] = candidateLines.map((lineAmt) => {
    let normalPassed = 0;
    let stressPassed = 0;
    const details: MonthBacktestResult[] = [];

    income.months.forEach((m) => {
      // Normal case: check balance on or around due date in this month
      // Due date = m.monthKey + pad(income.dueDate)
      const dueDay = income.dueDate;
      const monthTxs = allTransactions.filter((t) => t.date.startsWith(m.monthKey));
      
      // Find transaction on or closest after due date
      const afterDueTxs = monthTxs.filter((t) => parseInt(t.date.substring(8, 10), 10) >= dueDay);
      const balanceOnDue = afterDueTxs.length > 0 ? afterDueTxs[0].balance_paise : (monthTxs[monthTxs.length - 1]?.balance_paise || 0);

      // Normal covered if balance on due date >= lineAmt + bufferPaise
      const normalCovered = balanceOnDue >= (lineAmt + POLICY.bufferPaise);
      if (normalCovered) normalPassed++;

      // Stress case: allowance delayed by stress.incomeDelayDays,
      // so due-date balance falls back to that month's lowPoint.
      // Covered if month's lowPoint >= lineAmt + bufferPaise
      const stressCovered = m.lowestPreIncomeBalancePaise >= (lineAmt + POLICY.bufferPaise);
      if (stressCovered) stressPassed++;

      details.push({
        monthKey: m.monthKey,
        normalCovered,
        normalBalanceOnDue: balanceOnDue,
        stressCovered,
        stressLowPoint: m.lowestPreIncomeBalancePaise,
      });
    });

    return {
      lineAmountPaise: lineAmt,
      normalMonthsPassed: normalPassed,
      stressMonthsPassed: stressPassed,
      totalMonths: income.months.length,
      details,
    };
  });

  return {
    tierCapPaise: tierCap,
    capacityCapPaise: capacityCap,
    stressDueDateCapPaise: stressDueDateCap,
    bindingCap: binding.name,
    finalLimitPaise: finalLimit,
    isEligible: finalLimit > 0,
    reasonCode,
    reasonText,
    backtests,
  };
}
