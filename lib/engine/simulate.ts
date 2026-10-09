import { SimulationDay, SimulationResult } from "./types";
import { POLICY } from "@/config/policy";

export interface SimulatorInputs {
  currentBalancePaise: number;
  monthlyAllowancePaise: number;
  monthlyEarnedPaise: number;
  primaryIncomeDay: number;
  dueDay: number;
  dailyMedianSpendPaise: number;
  drawAmountPaise: number;
  purchaseAmountPaise: number;
  purchaseDayOffset?: number; // default day 6
  startDateStr?: string; // e.g. "2026-04-12"
  drawDayOffset?: number; // default day 1
}

/**
 * Deterministically project 60 days of forward cash flow for Safe baseline
 * and Stress delay scenarios based on uploaded statement parameters.
 */
export function simulateAffordability(inputs: SimulatorInputs): SimulationResult {
  const {
    currentBalancePaise,
    monthlyAllowancePaise,
    monthlyEarnedPaise,
    primaryIncomeDay,
    dueDay,
    dailyMedianSpendPaise,
    drawAmountPaise,
    purchaseAmountPaise,
    purchaseDayOffset = 6,
    drawDayOffset = 1,
    startDateStr,
  } = inputs;

  let baseDate: Date;
  if (startDateStr && /^\d{4}-\d{2}-\d{2}$/.test(startDateStr)) {
    const [y, m, d] = startDateStr.split("-").map(Number);
    baseDate = new Date(Date.UTC(y, m - 1, d));
  } else {
    const now = new Date();
    baseDate = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
  }
  const startingDateFormatted = baseDate.toISOString().split("T")[0];

  const days: SimulationDay[] = [];
  let safeBal = currentBalancePaise;
  let stressBal = currentBalancePaise;

  const buffer = POLICY.bufferPaise;
  let stressBreachedBuffer = false;
  let firstBufferBreachDateStr: string | null = null;

  let minSafeBalancePaise = currentBalancePaise;
  let minSafeDateStr = startingDateFormatted;
  let minStressBalancePaise = currentBalancePaise;
  let minStressDateStr = startingDateFormatted;

  let preRepayment1SafePaise = 0;
  let postRepayment1SafePaise = 0;
  let preRepayment1StressPaise = 0;
  let postRepayment1StressPaise = 0;

  let preRepayment2SafePaise = 0;
  let postRepayment2SafePaise = 0;
  let preRepayment2StressPaise = 0;
  let postRepayment2StressPaise = 0;

  let daysBelowBufferSafe = 0;
  let daysBelowBufferStress = 0;
  let daysBelowZeroSafe = 0;
  let daysBelowZeroStress = 0;

  let dueDay1Index: number | null = null;
  let dueDay2Index: number | null = null;
  let repaymentCount = 0;

  // Track delayed allowance arrival days for stress scenario
  // When an allowance is due on day d, it arrives on d in safe and d + delayDays in stress
  const pendingStressAllowances: { arrivalDayIndex: number; amountPaise: number }[] = [];

  // Daily simulation for 60 consecutive days
  for (let d = 1; d <= 60; d++) {
    const simDate = new Date(baseDate.getTime() + d * 24 * 60 * 60 * 1000);
    const dateStr = simDate.toISOString().split("T")[0];
    const dayOfMonth = simDate.getUTCDate();
    const dayEvents: string[] = [];

    let safeInflow = 0;
    let stressInflow = 0;
    let safeOutflow = 0;
    let stressOutflow = 0;

    // 1. Starter Credit Draw (Borrowed funds disbursed into account)
    if (d === drawDayOffset && drawAmountPaise > 0) {
      safeBal += drawAmountPaise;
      stressBal += drawAmountPaise;
      safeInflow += drawAmountPaise;
      stressInflow += drawAmountPaise;
      dayEvents.push(`Starter credit draw disbursed (+₹${Math.round(drawAmountPaise / 100)})`);
    }

    // 2. Hypothetical Campus Purchase
    if (d === purchaseDayOffset && purchaseAmountPaise > 0) {
      safeBal -= purchaseAmountPaise;
      stressBal -= purchaseAmountPaise;
      safeOutflow += purchaseAmountPaise;
      stressOutflow += purchaseAmountPaise;
      dayEvents.push(`Hypothetical campus purchase (-₹${Math.round(purchaseAmountPaise / 100)})`);
    }

    // 3. Regular daily expenses (P50 median in safe, P90 variable spend in stress)
    const safeDaily = dailyMedianSpendPaise;
    const stressDaily = Math.round(dailyMedianSpendPaise * 1.25);
    safeBal -= safeDaily;
    stressBal -= stressDaily;
    safeOutflow += safeDaily;
    stressOutflow += stressDaily;

    // 4. Earned income (tutoring / freelancing / stipend spread weekly)
    if (d % 7 === 0 && monthlyEarnedPaise > 0) {
      const weeklySafeEarned = Math.round(monthlyEarnedPaise / 4);
      const weeklyStressEarned = Math.round((monthlyEarnedPaise / 4) * (1 - POLICY.stress.earnedIncomeHaircut));
      safeBal += weeklySafeEarned;
      stressBal += weeklyStressEarned;
      safeInflow += weeklySafeEarned;
      stressInflow += weeklyStressEarned;
      dayEvents.push(`Earned income received (+₹${Math.round(weeklySafeEarned / 100)} Safe / +₹${Math.round(weeklyStressEarned / 100)} Stress)`);
    }

    // 5. Monthly primary allowance
    if (dayOfMonth === primaryIncomeDay && monthlyAllowancePaise > 0) {
      // Safe case receives allowance on time
      safeBal += monthlyAllowancePaise;
      safeInflow += monthlyAllowancePaise;
      dayEvents.push(`Primary allowance (+₹${Math.round(monthlyAllowancePaise / 100)})`);

      // Stress case schedules allowance after delay
      const stressArrivalDay = d + POLICY.stress.incomeDelayDays;
      pendingStressAllowances.push({ arrivalDayIndex: stressArrivalDay, amountPaise: monthlyAllowancePaise });
      dayEvents.push(`Allowance delayed in Stress scenario (+${POLICY.stress.incomeDelayDays} days)`);
    }

    // Process any delayed allowances due today for stress scenario
    for (let i = pendingStressAllowances.length - 1; i >= 0; i--) {
      if (pendingStressAllowances[i].arrivalDayIndex === d) {
        const allowanceItem = pendingStressAllowances[i];
        stressBal += allowanceItem.amountPaise;
        stressInflow += allowanceItem.amountPaise;
        dayEvents.push(`Delayed allowance received in Stress (+₹${Math.round(allowanceItem.amountPaise / 100)})`);
        pendingStressAllowances.splice(i, 1);
      }
    }

    // 6. Due date repayment deduction
    const isDue = dayOfMonth === dueDay;
    if (isDue) {
      repaymentCount++;
      if (repaymentCount === 1) {
        dueDay1Index = d;
        preRepayment1SafePaise = safeBal;
        preRepayment1StressPaise = stressBal;

        // First cycle interest free as per POLICY.pricing.firstCycleInterestFree
        const repayAmt = drawAmountPaise;
        if (repayAmt > 0) {
          safeBal -= repayAmt;
          stressBal -= repayAmt;
          safeOutflow += repayAmt;
          stressOutflow += repayAmt;
          dayEvents.push(`Cycle 1 credit repayment (-₹${Math.round(repayAmt / 100)})`);
        }
        postRepayment1SafePaise = safeBal;
        postRepayment1StressPaise = stressBal;
      } else if (repaymentCount === 2) {
        dueDay2Index = d;
        preRepayment2SafePaise = safeBal;
        preRepayment2StressPaise = stressBal;
        postRepayment2SafePaise = safeBal;
        postRepayment2StressPaise = stressBal;
        dayEvents.push("Cycle 2 due date (repayment settled)");
      }
    }

    // 7. Track buffer breaches and negative balances
    if (safeBal < buffer) {
      daysBelowBufferSafe++;
    }
    if (stressBal < buffer) {
      daysBelowBufferStress++;
      if (!firstBufferBreachDateStr) {
        firstBufferBreachDateStr = dateStr;
      }
      stressBreachedBuffer = true;
    }

    if (safeBal < 0) {
      daysBelowZeroSafe++;
    }
    if (stressBal < 0) {
      daysBelowZeroStress++;
    }

    if (safeBal < minSafeBalancePaise) {
      minSafeBalancePaise = safeBal;
      minSafeDateStr = dateStr;
    }
    if (stressBal < minStressBalancePaise) {
      minStressBalancePaise = stressBal;
      minStressDateStr = dateStr;
    }

    days.push({
      dayIndex: d,
      dateStr,
      safeBalancePaise: safeBal,
      stressBalancePaise: stressBal,
      isDueDate: isDue,
      isBufferBreached: stressBal < buffer,
      events: dayEvents.length > 0 ? dayEvents : undefined,
      safeInflowPaise: safeInflow,
      stressInflowPaise: stressInflow,
      safeOutflowPaise: safeOutflow,
      stressOutflowPaise: stressOutflow,
    });
  }

  // Safer choices recommendation when stress scenario breaches the buffer
  let saferChoices: SimulationResult["saferChoices"] = undefined;
  if (stressBreachedBuffer) {
    const deficit = buffer - minStressBalancePaise;
    const saferDraw = Math.max(0, drawAmountPaise - deficit);
    saferChoices = {
      smallerDrawPaise: saferDraw,
      delayDays: 14,
      explanation: `Reducing your draw to ₹${Math.round(saferDraw / 100)} or deferring the ₹${Math.round(purchaseAmountPaise / 100)} purchase by 14 days keeps your buffer intact even with a ${POLICY.stress.incomeDelayDays}-day allowance delay.`,
    };
  }

  return {
    days,
    safeEndingBalancePaise: safeBal,
    stressEndingBalancePaise: stressBal,
    bufferPaise: buffer,
    stressBreachedBuffer,
    saferChoices,
    startingBalancePaise: currentBalancePaise,
    startDateStr: startingDateFormatted,
    minSafeBalancePaise,
    minSafeDateStr,
    minStressBalancePaise,
    minStressDateStr,
    preRepayment1SafePaise,
    postRepayment1SafePaise,
    preRepayment1StressPaise,
    postRepayment1StressPaise,
    preRepayment2SafePaise,
    postRepayment2SafePaise,
    preRepayment2StressPaise,
    postRepayment2StressPaise,
    daysBelowBufferSafe,
    daysBelowBufferStress,
    daysBelowZeroSafe,
    daysBelowZeroStress,
    firstBufferBreachDateStr,
    dueDay1Index,
    dueDay2Index,
  };
}
