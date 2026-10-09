import { describe, it, expect, beforeEach } from "vitest";
import { generatePriyaTransactions, transactionsToCSV } from "@/data/seed/priya";
import { generateVolatileTransactions, generateThinTransactions } from "@/data/seed/volatile";
import { parseStatementCSV } from "@/lib/engine/parse";
import { classifyAllTransactions } from "@/lib/engine/classify";
import { detectRecurringItems } from "@/lib/engine/recurrence";
import { applyFilters } from "@/lib/engine/filters";
import { assessIncome } from "@/lib/engine/income";
import { calculateLimitAndBacktest } from "@/lib/engine/limit";
import { calculateCostCard } from "@/lib/engine/cost";
import { advanceCycle, checkGraduation } from "@/lib/engine/cycle";
import { handleChatQuery, checkInvestmentAdviceIntent } from "@/lib/ai/chat";
import { createReportToken, revokeReportToken, getReportCardByToken } from "@/lib/report/store";
import { POLICY, updatePolicy, resetPolicy } from "@/config/policy";
import { UserCreditState } from "@/lib/engine/types";

describe("Ascend Engine Test Suite (Section 13 Acceptance Criteria)", () => {
  beforeEach(() => {
    resetPolicy();
  });

  // Test 1: Priya seed produces the same ledger on every run
  it("Test 1: Priya seed produces identical deterministic ledger on every run", () => {
    const run1 = generatePriyaTransactions();
    const run2 = generatePriyaTransactions();

    expect(run1.length).toBe(run2.length);
    expect(run1.length).toBeGreaterThan(0);
    expect(run1).toEqual(run2);

    const csv1 = transactionsToCSV(run1);
    const csv2 = transactionsToCSV(run2);
    expect(csv1).toBe(csv2);
  });

  // Test 2: Rent is detected as a monthly recurring payment of Rs 3,000 with at least 5 occurrences
  it("Test 2: Rent is detected as a monthly recurring payment of Rs 3,000 with at least 5 occurrences", () => {
    const raw = generatePriyaTransactions();
    const csv = transactionsToCSV(raw);
    const parsed = parseStatementCSV(csv);
    const classified = classifyAllTransactions(parsed.transactions);
    const recurring = detectRecurringItems(classified);

    const rentItem = recurring.find((r) => r.isRent || r.normalizedPayee.includes("HOSTEL"));
    expect(rentItem).toBeDefined();
    expect(rentItem!.amount_paise).toBe(300000); // Rs 3,000
    expect(rentItem!.occurrences).toBeGreaterThanOrEqual(5);
  });

  // Test 3: Exactly one round-trip pair is flagged and excluded from qualifying income
  it("Test 3: Exactly one round-trip pair is flagged and excluded from qualifying income", () => {
    const raw = generatePriyaTransactions();
    const csv = transactionsToCSV(raw);
    const parsed = parseStatementCSV(csv);
    const classified = classifyAllTransactions(parsed.transactions);
    const filtered = applyFilters(classified);

    expect(filtered.roundTripPairs.length).toBe(1);
    const pair = filtered.roundTripPairs[0];
    expect(pair.amountPaise).toBe(200000); // Rs 2,000 with friend Ananya S

    const recurring = detectRecurringItems(filtered.transactions);
    const income = assessIncome(filtered.transactions, recurring);

    // Verify round-trip is netted out of qualifying income
    const month3 = income.months.find((m) => m.monthKey === "2026-06");
    expect(month3).toBeDefined();
    expect(month3!.roundTripPaise).toBe(200000);
    // Inflow from Ananya should not be part of qualifying income
    expect(month3!.qualifyingIncomePaise).toBeLessThan(month3!.totalInflowPaise);
  });

  // Test 4: The loan-app inflow is excluded from qualifying income and flagged
  it("Test 4: The loan-app inflow is excluded from qualifying income and flagged", () => {
    const raw = generatePriyaTransactions();
    const csv = transactionsToCSV(raw);
    const parsed = parseStatementCSV(csv);
    const classified = classifyAllTransactions(parsed.transactions);
    const filtered = applyFilters(classified);

    expect(filtered.loanAppTransactions.length).toBeGreaterThanOrEqual(1);
    const loanInflow = filtered.loanAppTransactions.find((t) => t.type === "CR");
    expect(loanInflow).toBeDefined();
    expect(loanInflow!.narration).toContain("KREDITBEE");
    expect(loanInflow!.isLoanApp).toBe(true);

    const recurring = detectRecurringItems(filtered.transactions);
    const income = assessIncome(filtered.transactions, recurring);
    const month5 = income.months.find((m) => m.monthKey === "2026-08");
    expect(month5).toBeDefined();
    expect(month5!.loanAppPaise).toBe(300000); // Rs 3,000 loan app disbursal
  });

  // Test 5: Median qualifying monthly inflow is between Rs 5,500 and Rs 7,500; capacity cap is 20% of it
  it("Test 5: Median qualifying monthly inflow is between Rs 5,500 and Rs 7,500; capacity cap is 20% of it", () => {
    const raw = generatePriyaTransactions();
    const csv = transactionsToCSV(raw);
    const parsed = parseStatementCSV(csv);
    const classified = classifyAllTransactions(parsed.transactions);
    const filtered = applyFilters(classified);
    const recurring = detectRecurringItems(filtered.transactions);
    const income = assessIncome(filtered.transactions, recurring);

    const medianPaise = income.medianQualifyingIncomePaise;
    expect(medianPaise).toBeGreaterThanOrEqual(550000); // Rs 5,500
    expect(medianPaise).toBeLessThanOrEqual(750000); // Rs 7,500

    const limitResult = calculateLimitAndBacktest(income, parsed.coverage!, filtered.transactions);
    const expectedCapacityCap = Math.round(medianPaise * 0.2);
    expect(limitResult.capacityCapPaise).toBe(expectedCapacityCap);
  });

  // Test 6: Priya limit equals Rs 50,000 paise (Rs 500) with tier cap binding; all three caps returned
  it("Test 6: Priya limit equals Rs 50,000 paise (Rs 500) with tier cap binding; all three caps returned", () => {
    const raw = generatePriyaTransactions();
    const csv = transactionsToCSV(raw);
    const parsed = parseStatementCSV(csv);
    const classified = classifyAllTransactions(parsed.transactions);
    const filtered = applyFilters(classified);
    const recurring = detectRecurringItems(filtered.transactions);
    const income = assessIncome(filtered.transactions, recurring);
    const limitResult = calculateLimitAndBacktest(income, parsed.coverage!, filtered.transactions);

    expect(limitResult.tierCapPaise).toBe(50000);
    expect(limitResult.capacityCapPaise).toBeGreaterThan(50000);
    expect(limitResult.stressDueDateCapPaise).toBeGreaterThan(50000);

    expect(limitResult.bindingCap).toBe("tierCap");
    expect(limitResult.finalLimitPaise).toBe(50000); // Rs 500
    expect(limitResult.isEligible).toBe(true);
  });

  // Test 7: Backtest: Rs 500 covered in stress for every month; Rs 1,500 not covered in stress
  it("Test 7: Backtest: Rs 500 covered in stress for every month; Rs 1,500 not covered in stress", () => {
    const raw = generatePriyaTransactions();
    const csv = transactionsToCSV(raw);
    const parsed = parseStatementCSV(csv);
    const classified = classifyAllTransactions(parsed.transactions);
    const filtered = applyFilters(classified);
    const recurring = detectRecurringItems(filtered.transactions);
    const income = assessIncome(filtered.transactions, recurring);
    const limitResult = calculateLimitAndBacktest(income, parsed.coverage!, filtered.transactions);

    const backtest500 = limitResult.backtests.find((b) => b.lineAmountPaise === 50000);
    const backtest1500 = limitResult.backtests.find((b) => b.lineAmountPaise === 150000);

    expect(backtest500).toBeDefined();
    expect(backtest1500).toBeDefined();

    // Rs 500 covered in stress for all 6 months
    expect(backtest500!.stressMonthsPassed).toBe(6);
    expect(backtest500!.normalMonthsPassed).toBe(6);

    // Rs 1,500 covered normally but NOT in stress
    expect(backtest1500!.normalMonthsPassed).toBe(6);
    expect(backtest1500!.stressMonthsPassed).toBeLessThan(6);
  });

  // Test 8: Volatile profile returns limit 0 with a readable reason
  it("Test 8: Volatile profile returns limit 0 with a readable reason", () => {
    const raw = generateVolatileTransactions();
    const csv = transactionsToCSV(raw);
    const parsed = parseStatementCSV(csv);
    const classified = classifyAllTransactions(parsed.transactions);
    const filtered = applyFilters(classified);
    const recurring = detectRecurringItems(filtered.transactions);
    const income = assessIncome(filtered.transactions, recurring);
    const limitResult = calculateLimitAndBacktest(income, parsed.coverage!, filtered.transactions);

    expect(limitResult.finalLimitPaise).toBe(0);
    expect(limitResult.isEligible).toBe(false);
    expect(limitResult.reasonText).toBeDefined();
    expect(limitResult.reasonText.length).toBeGreaterThan(15);
  });

  // Test 9: Thin profile (2 months) returns INSUFFICIENT_HISTORY
  it("Test 9: Thin profile (2 months) returns INSUFFICIENT_HISTORY", () => {
    const raw = generateThinTransactions();
    const csv = transactionsToCSV(raw);
    const parsed = parseStatementCSV(csv);
    const classified = classifyAllTransactions(parsed.transactions);
    const filtered = applyFilters(classified);
    const recurring = detectRecurringItems(filtered.transactions);
    const income = assessIncome(filtered.transactions, recurring);
    const limitResult = calculateLimitAndBacktest(income, parsed.coverage!, filtered.transactions);

    expect(limitResult.finalLimitPaise).toBe(0);
    expect(limitResult.reasonCode).toBe("INSUFFICIENT_HISTORY");
    expect(limitResult.bindingCap).toBe("insufficientHistory");
  });

  // Test 10: Cost Card: cycle 1 interest is Rs 0 when configured; later cycles compute half-up rounding correctly; no penalty interest is ever produced; Ascend late-fee share is always 0
  it("Test 10: Cost Card verifies cycle 1 interest Rs 0, cycle 2 half-up rounding, zero penalty interest, zero Ascend late fee share", () => {
    // Cycle 1: Rs 500 draw
    const cardCycle1 = calculateCostCard(50000, 1, 3);
    expect(cardCycle1.onTimeInterestPaise).toBe(0);
    expect(cardCycle1.isFirstCycleInterestFree).toBe(true);
    expect(cardCycle1.onTimeTotalPaise).toBe(50000);
    expect(cardCycle1.ascendLateFeeSharePaise).toBe(0);
    expect(cardCycle1.penaltyInterestPaise).toBe(0);

    // Cycle 2: Rs 500 draw, 150 bps (1.5%) => 50000 * 0.015 = 750 paise (Rs 7.50)
    const cardCycle2 = calculateCostCard(50000, 2, 3);
    expect(cardCycle2.onTimeInterestPaise).toBe(750);
    expect(cardCycle2.onTimeTotalPaise).toBe(50750);
    expect(cardCycle2.lateFeePaise).toBe(5000); // flat Rs 50
    expect(cardCycle2.ascendLateFeeSharePaise).toBe(0);
    expect(cardCycle2.penaltyInterestPaise).toBe(0);
  });

  // Test 11: Six clean cycles with one passed stress cycle yields GRADUATED; fewer does not
  it("Test 11: Six clean cycles with one passed stress cycle yields GRADUATED; fewer does not", () => {
    let mockState: UserCreditState = {
      state: "ACTIVE",
      currentTierIndex: 0,
      limitPaise: 50000,
      selfSetCapPaise: 50000,
      outstandingPaise: 20000,
      availablePaise: 30000,
      cycleNumber: 0,
      cleanCycles: 0,
      consecutiveCleanCycles: 0,
      stressCyclesPassed: 0,
      missedCycles: 0,
      historyStrength: 10,
      cycleHistory: [],
      drawCountToday: 1,
      autoPayActive: true,
      slipScenarioActive: false,
    };

    // Advance 5 normal cycles
    for (let i = 0; i < 5; i++) {
      mockState.outstandingPaise = 20000;
      const res = advanceCycle(mockState, { slipScenario: false });
      mockState = res.nextState;
    }
    expect(mockState.cleanCycles).toBe(5);
    expect(checkGraduation(mockState)).toBe(false);
    expect(mockState.state).not.toBe("GRADUATED");

    // Advance 6th cycle with stress cycle passed
    mockState.outstandingPaise = 20000;
    const res6 = advanceCycle(mockState, {
      slipScenario: true,
      slipAction: "REPAY_ON_TIME",
    });
    mockState = res6.nextState;

    expect(mockState.cleanCycles).toBe(6);
    expect(mockState.stressCyclesPassed).toBe(1);
    expect(checkGraduation(mockState)).toBe(true);
    expect(mockState.state).toBe("GRADUATED");
  });

  // Test 12: Chat pre-filter refuses "which stock should I buy" without calling the model
  it("Test 12: Chat pre-filter refuses 'which stock should I buy' without calling the model", () => {
    expect(checkInvestmentAdviceIntent("which stock should I buy")).toBe(true);
    expect(checkInvestmentAdviceIntent("suggest best mutual fund pick")).toBe(true);
    expect(checkInvestmentAdviceIntent("should I invest in crypto")).toBe(true);

    const chatResponse = handleChatQuery("which stock should I buy");
    expect(chatResponse.refused).toBe(true);
    expect(chatResponse.source).toBe("prefilter");
    expect(chatResponse.answer).toContain("Education, not investment advice.");
  });

  // Test 13: A revoked Report Card token returns 404
  it("Test 13: A revoked Report Card token returns 404 (null)", () => {
    const report = createReportToken({
      studentName: "Priya",
      billsPaidOnTimeCount: 6,
      savingsRatePercent: 18,
      maxCreditCostRupees: 8,
      periodText: "Apr 2026 to Sep 2026",
      lastUpdated: new Date().toISOString(),
    });

    expect(report.token).toBeDefined();
    // Retrieve before revoke
    const retrieved = getReportCardByToken(report.token);
    expect(retrieved).not.toBeNull();
    expect(retrieved?.billsPaidOnTimeCount).toBe(6);

    // Revoke
    const revoked = revokeReportToken(report.token);
    expect(revoked).toBe(true);

    // Retrieve after revoke should return null (maps to 404 in API)
    const afterRevoke = getReportCardByToken(report.token);
    expect(afterRevoke).toBeNull();
  });

  // Test 14: Changing dueDateOffsetDays in config changes the due date everywhere without code edits
  it("Test 14: Changing dueDateOffsetDays in config changes the due date everywhere without code edits", () => {
    const raw = generatePriyaTransactions();
    const csv = transactionsToCSV(raw);
    const parsed = parseStatementCSV(csv);
    const classified = classifyAllTransactions(parsed.transactions);
    const recurring = detectRecurringItems(classified);

    // Default: offset is 2 days -> primary day 1 + 2 = 3
    const initialIncome = assessIncome(classified, recurring);
    expect(initialIncome.dueDate).toBe(1 + 2); // 3

    // Update config to 5 days
    updatePolicy({ dueDateOffsetDays: 5 }, "Test due date offset change");
    const updatedIncome = assessIncome(classified, recurring);
    expect(updatedIncome.dueDate).toBe(1 + 5); // 6
  });
});
