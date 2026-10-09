import { describe, it, expect } from "vitest";
import { simulateAffordability, SimulatorInputs } from "@/lib/engine/simulate";
import { parseStatementCSV } from "@/lib/engine/parse";
import { calculateStatementAnalytics } from "@/lib/engine/categories";
import { assessIncome } from "@/lib/engine/income";
import { detectRecurringItems } from "@/lib/engine/recurrence";
import { classifyAllTransactions } from "@/lib/engine/classify";
import { generate120RowInrStatementCSV } from "./fixtures/inrStatement";
import { POLICY } from "@/config/policy";

describe("Affordability Simulator Suite: Data-Driven Projections", () => {
  // Test 1: Simulation derives starting balance and date accurately from latest running balance
  it("Test 1: Simulation starts deterministically from the latest transaction balance and date", () => {
    const csvContent = generate120RowInrStatementCSV();
    const parsed = parseStatementCSV(csvContent);
    expect(parsed.success).toBe(true);

    const sorted = [...parsed.transactions].sort((a, b) => (a.date || "").localeCompare(b.date || ""));
    const latestTx = sorted[sorted.length - 1];
    expect(latestTx.balance_paise).toBeGreaterThan(0);

    const analytics = calculateStatementAnalytics(sorted);
    expect(analytics.averageDailySpendPaise).toBeGreaterThan(0);

    const result = simulateAffordability({
      currentBalancePaise: latestTx.balance_paise,
      monthlyAllowancePaise: 600000,
      monthlyEarnedPaise: 150000,
      primaryIncomeDay: 1,
      dueDay: 3,
      dailyMedianSpendPaise: analytics.averageDailySpendPaise,
      drawAmountPaise: 30000,
      purchaseAmountPaise: 50000,
      purchaseDayOffset: 6,
      startDateStr: latestTx.date,
    });

    expect(result.days.length).toBe(60);
    expect(result.startingBalancePaise).toBe(latestTx.balance_paise);
    expect(result.startDateStr).toBe(latestTx.date);
    expect(result.days[0].dateStr).toBeDefined();
    // Safe and stress start from the same verified baseline
    expect(result.days[0].safeBalancePaise).toBeGreaterThan(0);
  });

  // Test 2: Unplanned campus purchase impacts projected balances on and after the configured day
  it("Test 2: Changing hypothetical campus purchase alters cash flow on and after purchase day", () => {
    const baseInputs: SimulatorInputs = {
      currentBalancePaise: 150000, // Rs 1,500
      monthlyAllowancePaise: 600000,
      monthlyEarnedPaise: 0,
      primaryIncomeDay: 1,
      dueDay: 3,
      dailyMedianSpendPaise: 20000, // Rs 200/day
      drawAmountPaise: 0,
      purchaseAmountPaise: 0,
      purchaseDayOffset: 6,
      startDateStr: "2026-05-01",
    };

    const resNoPurchase = simulateAffordability(baseInputs);

    const resWithPurchase = simulateAffordability({
      ...baseInputs,
      purchaseAmountPaise: 50000, // Rs 500 purchase on Day 6
    });

    // Before purchase day (Day 5), balances must be identical
    expect(resWithPurchase.days[4].safeBalancePaise).toBe(resNoPurchase.days[4].safeBalancePaise);
    expect(resWithPurchase.days[4].stressBalancePaise).toBe(resNoPurchase.days[4].stressBalancePaise);

    // On and after Day 6, balance reflects the Rs 500 purchase deduction
    expect(resWithPurchase.days[5].safeBalancePaise).toBe(resNoPurchase.days[5].safeBalancePaise - 50000);
    expect(resWithPurchase.days[5].stressBalancePaise).toBe(resNoPurchase.days[5].stressBalancePaise - 50000);
    expect(resWithPurchase.days[5].events).toContain("Hypothetical campus purchase (-₹500)");
  });

  // Test 3: Starter credit draw disbursed on draw day and repaid on Cycle 1 Due Date
  it("Test 3: Credit draw is treated as borrowed liquidity and deducted on Due Date 1", () => {
    const inputs: SimulatorInputs = {
      currentBalancePaise: 200000, // Rs 2,000
      monthlyAllowancePaise: 500000,
      monthlyEarnedPaise: 0,
      primaryIncomeDay: 20,
      dueDay: 22,
      dailyMedianSpendPaise: 10000, // Rs 100/day
      drawAmountPaise: 30000, // Rs 300 draw
      purchaseAmountPaise: 0,
      purchaseDayOffset: 6,
      startDateStr: "2026-05-01",
      drawDayOffset: 1,
    };

    const res = simulateAffordability(inputs);

    // Day 1: Draw disbursed (+Rs 300 minus Rs 100 daily spend)
    // Starting balance 200000 + 30000 - 10000 = 220000
    expect(res.days[0].safeBalancePaise).toBe(220000);
    expect(res.days[0].events).toContain("Starter credit draw disbursed (+₹300)");

    // Due Date 1 is recorded
    expect(res.dueDay1Index).not.toBeNull();
    expect(res.postRepayment1SafePaise).toBe(res.preRepayment1SafePaise - 30000);
    expect(res.postRepayment1StressPaise).toBe(res.preRepayment1StressPaise - 30000);
  });

  // Test 4: Stress delay scenario postpones allowance and applies variable spending
  it("Test 4: Stress scenario delays allowance by 7 days and models higher variable spend", () => {
    const inputs: SimulatorInputs = {
      currentBalancePaise: 100000, // Rs 1,000
      monthlyAllowancePaise: 600000, // Rs 6,000
      monthlyEarnedPaise: 0,
      primaryIncomeDay: 10,
      dueDay: 12,
      dailyMedianSpendPaise: 20000, // Rs 200
      drawAmountPaise: 0,
      purchaseAmountPaise: 0,
      startDateStr: "2026-05-01",
    };

    const res = simulateAffordability(inputs);

    // Day 9 corresponds to May 10 (day of month 10)
    const day10Sim = res.days.find((d) => d.dateStr === "2026-05-10")!;
    expect(day10Sim).toBeDefined();

    // On primary income day: Safe receives allowance, Stress does not
    expect(day10Sim.safeInflowPaise).toBe(600000);
    expect(day10Sim.stressInflowPaise).toBe(0);

    // 7 days later (May 17): Stress receives delayed allowance
    const day17Sim = res.days.find((d) => d.dateStr === "2026-05-17")!;
    expect(day17Sim).toBeDefined();
    expect(day17Sim.stressInflowPaise).toBe(600000);

    // Stress low point is lower than Safe low point
    expect(res.minStressBalancePaise).toBeLessThan(res.minSafeBalancePaise);
  });

  // Test 5: Buffer breach detection and safer choices recommendation
  it("Test 5: Accurately flags buffer breach when balance drops below Rs 300 and provides safer choices", () => {
    // Low starting balance: Rs 400 with Rs 150 daily spend and Rs 300 draw
    const inputs: SimulatorInputs = {
      currentBalancePaise: 40000, // Rs 400
      monthlyAllowancePaise: 500000,
      monthlyEarnedPaise: 0,
      primaryIncomeDay: 15, // Allowance delayed to day 22
      dueDay: 17,
      dailyMedianSpendPaise: 15000, // Rs 150/day
      drawAmountPaise: 30000, // Rs 300
      purchaseAmountPaise: 20000, // Rs 200 purchase
      purchaseDayOffset: 3,
      startDateStr: "2026-05-01",
    };

    const res = simulateAffordability(inputs);

    expect(res.stressBreachedBuffer).toBe(true);
    expect(res.daysBelowBufferStress).toBeGreaterThan(0);
    expect(res.firstBufferBreachDateStr).not.toBeNull();
    expect(res.saferChoices).toBeDefined();
    expect(res.saferChoices!.explanation).toContain("keeps your buffer intact");
  });

  // Test 6: Detects negative balances (overdraft risk)
  it("Test 6: Correctly tracks days below zero when outflows exceed buffer and reserves", () => {
    const inputs: SimulatorInputs = {
      currentBalancePaise: 20000, // Rs 200
      monthlyAllowancePaise: 400000,
      monthlyEarnedPaise: 0,
      primaryIncomeDay: 25,
      dueDay: 27,
      dailyMedianSpendPaise: 20000, // Rs 200/day
      drawAmountPaise: 0,
      purchaseAmountPaise: 50000, // Rs 500 purchase
      purchaseDayOffset: 2,
      startDateStr: "2026-05-01",
    };

    const res = simulateAffordability(inputs);

    expect(res.minStressBalancePaise).toBeLessThan(0);
    expect(res.daysBelowZeroStress).toBeGreaterThan(0);
  });

  // Test 7: Replacing one uploaded statement with another recomputes cleanly
  it("Test 7: Replacing statement updates starting balance and projections without stale values", () => {
    // Statement A: Starting balance Rs 5,000
    const resA = simulateAffordability({
      currentBalancePaise: 500000,
      monthlyAllowancePaise: 800000,
      monthlyEarnedPaise: 0,
      primaryIncomeDay: 1,
      dueDay: 3,
      dailyMedianSpendPaise: 15000,
      drawAmountPaise: 30000,
      purchaseAmountPaise: 50000,
      startDateStr: "2026-04-30",
    });

    // Statement B: Starting balance Rs 850
    const resB = simulateAffordability({
      currentBalancePaise: 85000,
      monthlyAllowancePaise: 400000,
      monthlyEarnedPaise: 0,
      primaryIncomeDay: 5,
      dueDay: 7,
      dailyMedianSpendPaise: 10000,
      drawAmountPaise: 30000,
      purchaseAmountPaise: 50000,
      startDateStr: "2026-05-15",
    });

    expect(resA.startingBalancePaise).toBe(500000);
    expect(resB.startingBalancePaise).toBe(85000);
    expect(resA.startDateStr).toBe("2026-04-30");
    expect(resB.startDateStr).toBe("2026-05-15");
    expect(resB.minSafeBalancePaise).toBeLessThan(resA.minSafeBalancePaise);
  });

  // Test 8: Internal transfers and loan disbursals do not inflate qualifying recurring allowance
  it("Test 8: Distinguishes non-recurring loan app inflows from parental allowance", () => {
    const rawTxs = [
      "Transaction_Date,Description,Debit_INR,Credit_INR,Balance_INR",
      "2026-04-01,UPI/RAJESH VERMA/ALLOWANCE,0.00,6000.00,7150.00",
      "2026-04-05,KREDITBEE LOAN DISBURSAL,0.00,2000.00,9150.00",
      "2026-04-10,SWIGGY FOOD ORDER,350.00,0.00,8800.00",
      "2026-05-01,UPI/RAJESH VERMA/ALLOWANCE,0.00,6000.00,14800.00",
    ].join("\n");

    const parsed = parseStatementCSV(rawTxs);
    const classified = classifyAllTransactions(parsed.transactions);
    const recurring = detectRecurringItems(classified);
    const income = assessIncome(classified, recurring);

    // Parental allowance is counted at dependentIncomeWeight (80% of 600000 = 480000)
    // while the one-off loan app inflow of Rs 2,000 is completely isolated and excluded from qualifying income
    expect(income.months[0].dependentAllowancePaise).toBe(600000);
    expect(income.months[0].loanAppPaise).toBe(200000);
    expect(income.medianQualifyingIncomePaise).toBe(480000);
  });
});
