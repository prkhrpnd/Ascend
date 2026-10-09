import { UserCreditState, CycleHistoryEntry } from "./types";
import { POLICY } from "@/config/policy";

/**
 * Calculate History Strength (altimeter score out of 100).
 * Illustrative. Not a bureau score.
 */
export function calculateHistoryStrength(
  cleanCycles: number,
  stressPassed: number,
  avgUtilisation: number
): number {
  const utilisationBonus = avgUtilisation < 0.5 ? 10 : 0;
  const raw = cleanCycles * 12 + stressPassed * 14 + utilisationBonus;
  return Math.min(100, Math.max(0, raw));
}

/**
 * Check if the member qualifies for Bureau-ready graduation.
 * Test 11: 6 clean cycles with 1 passed stress cycle and avg utilisation <= 50% yields GRADUATED.
 */
export function checkGraduation(state: UserCreditState): boolean {
  const avgUtil =
    state.cycleHistory.length > 0
      ? state.cycleHistory.reduce((sum, c) => sum + c.utilisationPercent, 0) / (state.cycleHistory.length * 100)
      : 0;

  return (
    state.cleanCycles >= POLICY.bureauReady.cleanCycles &&
    state.stressCyclesPassed >= POLICY.bureauReady.stressCyclesPassed &&
    avgUtil <= POLICY.bureauReady.maxUtilisation
  );
}

/**
 * Advance one credit cycle given current user credit state and slip scenario toggle.
 */
export function advanceCycle(
  prevState: UserCreditState,
  options: {
    slipScenario: boolean;
    slipAction?: "SHIFT_DUE_DATE" | "SPLIT_INSTALLMENTS" | "REPAY_ON_TIME" | "MISS_PAYMENT";
  }
): {
  nextState: UserCreditState;
  events: string[];
  momentCard?: {
    title: string;
    body: string;
    takeaway: string;
  };
} {
  const state: UserCreditState = JSON.parse(JSON.stringify(prevState));
  const events: string[] = [];
  const cycleNum = state.cycleNumber + 1;
  state.cycleNumber = cycleNum;

  const drawn = state.outstandingPaise;
  const limit = state.limitPaise;
  const util = limit > 0 ? (drawn / limit) * 100 : 0;

  // 1. Slip scenario handling
  if (options.slipScenario && options.slipAction === "MISS_PAYMENT") {
    // User intentionally missed repayment after ladder
    state.missedCycles += 1;
    state.consecutiveCleanCycles = 0;
    const lateFee = POLICY.pricing.lateFeePaise;
    state.outstandingPaise += lateFee;

    if (state.missedCycles >= 2) {
      state.state = "FROZEN";
      events.push("Limit frozen after 2 consecutive missed cycles. No calls to contacts or family.");
    } else {
      state.state = "PAUSED";
      events.push("Draws paused. Flat ₹50 late fee applied. Ascend earns ₹0 from late fees.");
    }

    state.cycleHistory.push({
      cycleNumber: cycleNum,
      limitPaise: limit,
      drawnPaise: drawn,
      repaidPaise: 0,
      onTime: false,
      stressCycle: true,
      lateFeeAppliedPaise: lateFee,
      utilisationPercent: util,
      timestamp: new Date().toISOString(),
    });

    state.historyStrength = calculateHistoryStrength(
      state.cleanCycles,
      state.stressCyclesPassed,
      util / 100
    );

    return {
      nextState: state,
      events,
      momentCard: {
        title: "Missed Repayment Consequence",
        body: `Your repayment of ₹${Math.round(drawn / 100)} was missed. A one-time flat late fee of ₹50 was applied by the partner. Draws are temporarily paused until cleared.`,
        takeaway: "Ascend earns ₹0 from late fees. Clean repayment restarts your credit momentum.",
      },
    };
  }

  // 2. Normal On-time repayment or resolved stress cycle
  const isStressResolved = options.slipScenario && (options.slipAction === "REPAY_ON_TIME" || options.slipAction === "SHIFT_DUE_DATE" || options.slipAction === "SPLIT_INSTALLMENTS");

  state.cleanCycles += 1;
  state.consecutiveCleanCycles += 1;
  if (isStressResolved) {
    state.stressCyclesPassed += 1;
    events.push("Stress cycle passed! Successfully navigated cash flow squeeze.");
  } else {
    events.push("AutoPay executed successfully. Repayment reported as clean.");
  }

  state.outstandingPaise = 0;
  state.availablePaise = state.selfSetCapPaise;
  state.drawCountToday = 0;

  state.cycleHistory.push({
    cycleNumber: cycleNum,
    limitPaise: limit,
    drawnPaise: drawn,
    repaidPaise: drawn,
    onTime: true,
    stressCycle: !!options.slipScenario,
    lateFeeAppliedPaise: 0,
    utilisationPercent: util,
    timestamp: new Date().toISOString(),
  });

  const avgUtil =
    state.cycleHistory.reduce((sum, c) => sum + c.utilisationPercent, 0) / (state.cycleHistory.length * 100);

  state.historyStrength = calculateHistoryStrength(
    state.cleanCycles,
    state.stressCyclesPassed,
    avgUtil
  );

  // Check graduation
  if (checkGraduation(state)) {
    state.state = "GRADUATED";
    events.push("Congratulations! You are now Bureau-ready with 6 clean cycles and a passed stress cycle.");
  } else {
    state.state = "ACTIVE";
  }

  return {
    nextState: state,
    events,
    momentCard: {
      title: "Cycle Paid On Time",
      body: `You successfully cleared cycle #${cycleNum} (₹${Math.round(drawn / 100)}). AutoPay reported this positive repayment record to the credit bureau.`,
      takeaway: "On-time repayments build verified credit history for two-wheelers and flat leases.",
    },
  };
}
