import { describe, it, expect } from "vitest";
import { parseStatementCSV, getStatementCSVTemplate, generatePriyaStatementCSV } from "@/lib/engine/parse";
import {
  categorizeTransaction,
  calculateStatementAnalytics,
  CATEGORIES,
  CanonicalCategoryId,
} from "@/lib/engine/categories";

describe("Bank Statement Analytics Experience Tests", () => {
  // Test 1: Statement Parsing with 18 Categories and Directional Integrity
  it("Test 1: Parses CSV and categorizes transactions into valid categories with direction check", () => {
    const csvContent = [
      "Date,Narration,Debit,Credit,Balance",
      "2026-04-01,UPI/RAJESH VERMA/ALLOWANCE,,6000.00,7150.00",
      "2026-04-05,UPI/HOSTEL MESS ACCT/RENT,3000.00,,4150.00",
      "2026-04-09,UPI/JIO PREPAID/9829012345,239.00,,3911.00",
      "2026-04-12,UPI/SWIGGY/ORDER_4821,210.00,,3701.00",
      "2026-04-15,UPI/LOCAL KIRANA/GROCERY,180.00,,3521.00",
      "2026-04-18,UPI/ROHIT SHARMA/COACHING,,520.00,4041.00",
    ].join("\n");

    const result = parseStatementCSV(csvContent, undefined, "test_statement.csv");
    expect(result.success).toBe(true);
    expect(result.transactions.length).toBe(6);

    // Verify allowance is Income and Salary (CR)
    const allowanceTx = result.transactions[0];
    expect(allowanceTx.type).toBe("CR");
    expect(allowanceTx.category).toBe("income_salary");
    expect(CATEGORIES[allowanceTx.category as CanonicalCategoryId].isCredit).toBe(true);

    // Verify rent is Housing and Rent (DR)
    const rentTx = result.transactions[1];
    expect(rentTx.type).toBe("DR");
    expect(rentTx.category).toBe("housing_rent");

    // Verify Swiggy is Food and Dining (DR)
    const foodTx = result.transactions[3];
    expect(foodTx.type).toBe("DR");
    expect(foodTx.category).toBe("food_dining");
  });

  // Test 2: Credits are strictly NEVER categorized as expenses
  it("Test 2: Credits are strictly never categorized as expenses", () => {
    // Even if narration contains food or rent keyword, CR must map to credit categories
    const res1 = categorizeTransaction("REFUND FROM SWIGGY FOOD", "CR");
    expect(CATEGORIES[res1.category].isCredit).toBe(true);
    expect(CATEGORIES[res1.category].isExpense).toBe(false);

    const res2 = categorizeTransaction("RENT SECURITY DEPOSIT RETURN", "CR");
    expect(CATEGORIES[res2.category].isExpense).toBe(false);

    const res3 = categorizeTransaction("UNKNOWN CREDIT TRANSFER", "CR");
    expect(CATEGORIES[res3.category].isExpense).toBe(false);
  });

  // Test 3: Investments and Transfers Between Own Accounts are segregated from Consumer Spending
  it("Test 3: Segregates investments and self-transfers from ordinary consumer spending", () => {
    const csvContent = [
      "Date,Narration,Debit,Credit,Balance",
      "2026-04-01,UPI/ALLOWANCE,,10000.00,15000.00",
      "2026-04-05,UPI/HOSTEL RENT,3000.00,,12000.00",
      "2026-04-10,UPI/ZERODHA BROKING/SIP,2000.00,,10000.00", // Investment
      "2026-04-15,UPI/SELF TRANSFER TO SAVINGS,1500.00,,8500.00", // Own account transfer
      "2026-04-20,UPI/SWIGGY/FOOD,500.00,,8000.00",
    ].join("\n");

    const parsed = parseStatementCSV(csvContent);
    expect(parsed.success).toBe(true);

    const analytics = calculateStatementAnalytics(parsed.transactions);

    // Total Outflow = 3000 + 2000 + 1500 + 500 = 7000 (700,000 paise)
    expect(analytics.totalOutflowPaise).toBe(700000);

    // Consumer Spending should exclude Zerodha (2000) and Self Transfer (1500)
    // Consumer Spending = 3000 + 500 = 3500 (350,000 paise)
    expect(analytics.consumerSpendingPaise).toBe(350000);
    expect(analytics.consumerSpendingPaise).toBeLessThan(analytics.totalOutflowPaise);
  });

  // Test 4: Dynamic Metrics Calculation
  it("Test 4: Correctly calculates Net Cash Flow, Savings Rate, and Average Daily Spend", () => {
    const csvContent = [
      "Date,Narration,Debit,Credit,Balance",
      "2026-04-01,UPI/ALLOWANCE,,10000.00,10000.00",
      "2026-04-10,UPI/HOSTEL RENT,4000.00,,6000.00",
      "2026-04-20,UPI/FOOD AND DINING,2000.00,,4000.00",
    ].join("\n");

    const parsed = parseStatementCSV(csvContent);
    const analytics = calculateStatementAnalytics(parsed.transactions);

    expect(analytics.totalInflowPaise).toBe(1000000); // Rs 10,000
    expect(analytics.totalOutflowPaise).toBe(600000); // Rs 6,000
    expect(analytics.netCashFlowPaise).toBe(400000); // Rs 4,000 net
    expect(analytics.savingsRatePercent).toBe(40); // 40% savings rate
    expect(analytics.averageDailySpendPaise).toBeGreaterThan(0);
  });

  // Test 5: Single Column Signed Amount Statements
  it("Test 5: Parses single-column signed statements (+ for credit, - for debit)", () => {
    const csvContent = [
      "Date,Narration,Amount,Balance",
      "2026-04-01,UPI/PARENT ALLOWANCE,6000.00,7500.00",
      "2026-04-05,UPI/HOSTEL RENT,-3000.00,4500.00",
      "2026-04-12,UPI/SWIGGY,-250.00,4250.00",
    ].join("\n");

    const result = parseStatementCSV(csvContent);
    expect(result.success).toBe(true);
    expect(result.transactions.length).toBe(3);

    expect(result.transactions[0].type).toBe("CR");
    expect(result.transactions[0].amount_paise).toBe(600000);

    expect(result.transactions[1].type).toBe("DR");
    expect(result.transactions[1].amount_paise).toBe(300000);

    expect(result.transactions[2].type).toBe("DR");
    expect(result.transactions[2].amount_paise).toBe(25000);
  });

  // Test 6: Manual Category Override and Dynamic Recalculation
  it("Test 6: Allows manual category override and immediately recalculates totals", () => {
    const csvContent = [
      "Date,Narration,Debit,Credit,Balance",
      "2026-04-01,UPI/ALLOWANCE,,6000.00,6000.00",
      "2026-04-05,UPI/MISC UNKNOWN PAYMENT,1000.00,,5000.00",
    ].join("\n");

    const parsed = parseStatementCSV(csvContent);
    const initialAnalytics = calculateStatementAnalytics(parsed.transactions);

    // Initial state: MISC is uncategorized
    expect(initialAnalytics.categoryTotals.uncategorized.amountPaise).toBe(100000);
    expect(initialAnalytics.categoryTotals.education.amountPaise).toBe(0);

    // User overrides the transaction to "education"
    const updatedTxs = parsed.transactions.map((t) => {
      if (t.narration.includes("MISC")) {
        return {
          ...t,
          category: "education" as CanonicalCategoryId,
          isUserOverride: true,
          source: "user" as const,
        };
      }
      return t;
    });

    const updatedAnalytics = calculateStatementAnalytics(updatedTxs);
    expect(updatedAnalytics.categoryTotals.uncategorized.amountPaise).toBe(0);
    expect(updatedAnalytics.categoryTotals.education.amountPaise).toBe(100000);
    expect(updatedAnalytics.categoryTotals.education.percentOfOutflows).toBe(100);
  });
});
