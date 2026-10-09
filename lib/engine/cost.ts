import { CostCardDetails } from "./types";
import { POLICY } from "@/config/policy";

/**
 * Calculate Cost Card terms for a draw of amount A on cycle number N.
 */
export function calculateCostCard(drawPaise: number, cycleNumber: number, dueDayOfMonth: number): CostCardDetails {
  const isFirstCycle = cycleNumber === 1 && POLICY.pricing.firstCycleInterestFree;

  // Monthly interest bps (150 = 1.5%)
  // Round half up to nearest paise
  let onTimeInterestPaise = 0;
  if (!isFirstCycle) {
    onTimeInterestPaise = Math.round((drawPaise * POLICY.pricing.monthlyInterestBps) / 10000);
  }

  const onTimeTotalPaise = drawPaise + onTimeInterestPaise;
  const lateFeePaise = POLICY.pricing.lateFeePaise;
  const lateFeeTotalPaise = onTimeTotalPaise + lateFeePaise;

  const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
  const now = new Date();
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, dueDayOfMonth);
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const dueDateFormatted = `${dueDayOfMonth} ${monthNames[nextMonth.getMonth()]} ${nextMonth.getFullYear()}`;

  return {
    drawAmountPaise: drawPaise,
    cycleNumber,
    dueDateFormatted,
    onTimeInterestPaise,
    isFirstCycleInterestFree: isFirstCycle,
    onTimeTotalPaise,
    lateFeePaise,
    lateFeeTotalPaise,
    ascendLateFeeSharePaise: 0, // Ascend earns Rs 0 from late fees
    penaltyInterestPaise: 0, // Never compounding penalty interest
    annualRateExplanation: "1.5% a month is about 18% a year before compounding",
    partnerDisclaimer: "Loan is issued and held by LendPartner Finance (SIMULATED). Ascend is not a lender.",
    bureauNotice: "Good repayment can help your history. A missed repayment can damage it.",
  };
}
