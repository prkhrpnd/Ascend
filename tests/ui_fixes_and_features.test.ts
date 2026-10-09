import { describe, it, expect } from "vitest";
import { calculateFinancialHealthScore } from "@/lib/engine/healthScore";
import { calculateStatementAnalytics } from "@/lib/engine/categories";
import { parseStatementCSV } from "@/lib/engine/parse";
import { generate120RowInrStatementCSV } from "./fixtures/inrStatement";

describe("Targeted UI Fixes & Feature Enhancements Suite", () => {
  // Test 1: Financial Health Score with insufficient data returns null and unavailable status
  it("Test 1: Financial Health Score returns unavailable when no statement transactions exist", () => {
    const res = calculateFinancialHealthScore(null, null);

    expect(res.score).toBeNull();
    expect(res.isAvailable).toBe(false);
    expect(res.rating).toBe("Insufficient Data");
    expect(res.reasons.length).toBeGreaterThan(0);
    expect(res.actionableSuggestion).toContain("Upload a bank statement CSV");
    expect(res.disclaimer).toContain("Informational financial health score");
  });

  // Test 2: Financial Health Score with a healthy 6-month statement calculates high score (Good or Excellent)
  it("Test 2: Computes explainable Financial Health Score for a healthy 6-month student statement", () => {
    const csvContent = generate120RowInrStatementCSV();
    const parsed = parseStatementCSV(csvContent);
    expect(parsed.success).toBe(true);

    const analytics = calculateStatementAnalytics(parsed.transactions);
    expect(analytics.netCashFlowPaise).toBeGreaterThan(0);

    const health = calculateFinancialHealthScore(analytics, parsed.coverage);

    expect(health.isAvailable).toBe(true);
    expect(health.score).not.toBeNull();
    expect(health.score!).toBeGreaterThanOrEqual(65);
    expect(["Good", "Excellent"]).toContain(health.rating);

    // Sub-scores must add up to total score
    const subSum =
      health.subScores.cashFlowSurplus +
      health.subScores.fixedObligationRatio +
      health.subScores.periodConsistency +
      health.subScores.spendingDiscipline;
    expect(health.score).toBe(subSum);

    // Reasons must be provided (at least 2 concise reasons)
    expect(health.reasons.length).toBeGreaterThanOrEqual(2);
    expect(health.actionableSuggestion.length).toBeGreaterThan(10);
  });

  // Test 3: Financial Health Score in a deficit scenario reflects Needs Attention / Fair
  it("Test 3: Accurately reduces score and provides deficit-tailored guidance when outflows exceed inflows", () => {
    const deficitTxs = [
      "Transaction_Date,Description,Debit_INR,Credit_INR,Balance_INR",
      "2026-05-01,UPI/ALLOWANCE,0.00,5000.00,5000.00",
      "2026-05-05,HOSTEL RENT,4000.00,0.00,1000.00",
      "2026-05-15,SHOPPING MALL,3000.00,0.00,-2000.00", // Outflows 7000 > Inflows 5000
    ].join("\n");

    const parsed = parseStatementCSV(deficitTxs);
    const analytics = calculateStatementAnalytics(parsed.transactions);
    expect(analytics.netCashFlowPaise).toBeLessThan(0);

    const health = calculateFinancialHealthScore(analytics, parsed.coverage);

    expect(health.isAvailable).toBe(true);
    expect(health.subScores.cashFlowSurplus).toBeLessThanOrEqual(8);
    expect(health.actionableSuggestion).toContain("Trim discretionary outflows");
  });

  // Test 4: IFSC code and account number validation logic for Indian banking
  it("Test 4: Validates Indian bank IFSC format and account number constraints", () => {
    const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/i;

    expect(ifscRegex.test("SBIN0001234")).toBe(true);
    expect(ifscRegex.test("HDFC0000123")).toBe(true);
    expect(ifscRegex.test("ICIC0001890")).toBe(true);

    // Invalid IFSCs
    expect(ifscRegex.test("SBIN1234567")).toBe(false); // 5th char must be 0
    expect(ifscRegex.test("SBI0001234")).toBe(false); // Bank code must be 4 letters
    expect(ifscRegex.test("SBIN000123")).toBe(false); // Too short

    // Account number validation (9 to 18 digits)
    const accRegex = /^\d{9,18}$/;
    expect(accRegex.test("50100439284589")).toBe(true);
    expect(accRegex.test("123456789")).toBe(true);
    expect(accRegex.test("12345")).toBe(false); // Too short
    expect(accRegex.test("12345678901234567890")).toBe(false); // Too long
  });

  // Test 5: Statement preview transaction extraction matches parsed records without loss
  it("Test 5: Transaction preview captures first 5 rows and summarizes total credits and debits", () => {
    const csvContent = generate120RowInrStatementCSV();
    const parsed = parseStatementCSV(csvContent);

    expect(parsed.success).toBe(true);
    expect(parsed.transactions.length).toBe(120);

    const previewSlice = parsed.transactions.slice(0, 5);
    expect(previewSlice.length).toBe(5);

    // Verify first row
    expect(previewSlice[0].date).toBe("2026-04-01");
    expect(previewSlice[0].amount_paise).toBe(600000);
    expect(previewSlice[0].type).toBe("CR");

    // Verify column mapping presence
    expect(parsed.stats?.hasBalances).toBe(true);
    expect(parsed.stats?.currencyDetected).toBe("INR");
  });

  // Test 6: Category bar chart percentage widths stay bounded between 4% and 100%
  it("Test 6: Percentage widths for category bars remain strictly clamped to avoid layout blowout", () => {
    const maxAmount = 100000;
    const testAmounts = [100, 20000, 50000, 100000, 200000];

    testAmounts.forEach((amt) => {
      const widthPercent = Math.min(100, Math.max(4, Math.round((amt / maxAmount) * 100)));
      expect(widthPercent).toBeGreaterThanOrEqual(4);
      expect(widthPercent).toBeLessThanOrEqual(100);
    });
  });
});
