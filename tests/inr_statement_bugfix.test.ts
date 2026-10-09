import { describe, it, expect } from "vitest";
import { parseStatementCSV } from "@/lib/engine/parse";
import { calculateStatementAnalytics, CATEGORIES, CanonicalCategoryId } from "@/lib/engine/categories";
import { generate120RowInrStatementCSV } from "./fixtures/inrStatement";

describe("Regression Test Suite: INR Bank Statement Schema Bugfix", () => {
  // Test 1: Full 120-row statement with Debit_INR, Credit_INR, Balance_INR, Reference_ID
  it("Test 1: Full 120-row statement parses all rows without rejection and with correct metadata", () => {
    const csvContent = generate120RowInrStatementCSV();
    const result = parseStatementCSV(csvContent, undefined, "inr_statement_120.csv");

    expect(result.success).toBe(true);
    expect(result.error).toBeUndefined();
    expect(result.transactions.length).toBe(120);

    // Verify stats
    expect(result.stats).toBeDefined();
    expect(result.stats!.totalRawRows).toBe(120);
    expect(result.stats!.validTransactions).toBe(120);
    expect(result.stats!.skippedRows).toBe(0);
    expect(result.stats!.duplicateRows).toBe(0);
    expect(result.stats!.currencyDetected).toBe("INR");

    // Verify first row (Credit allowance)
    const firstTx = result.transactions[0];
    expect(firstTx.date).toBe("2026-04-01");
    expect(firstTx.type).toBe("CR");
    expect(firstTx.amount_paise).toBe(600000); // Rs 6,000.00
    expect(firstTx.referenceId).toBe("REF_2026_04_01");
    expect(firstTx.sourceCategory).toBe("Income");
    expect(firstTx.paymentMethod).toBe("UPI");
    expect(firstTx.category).toBe("income_salary");

    // Verify fourth row (Debit rent)
    const rentTx = result.transactions[3];
    expect(rentTx.date).toBe("2026-04-05");
    expect(rentTx.type).toBe("DR");
    expect(rentTx.amount_paise).toBe(300000); // Rs 3,000.00
    expect(rentTx.referenceId).toBe("REF_2026_04_04");
    expect(rentTx.category).toBe("housing_rent");
  });

  // Test 2: Transaction_Date, Description, Debit_INR, Credit_INR, Balance_INR column recognition
  it("Test 2: Correctly maps specific header aliases without needing separate Currency column", () => {
    const singleRowCsv = [
      "Transaction_Date,Transaction_Time,Value_Date,Description,Transaction_Type,Category,Reference_ID,Debit_INR,Credit_INR,Balance_INR,Statement_Note",
      "2026-05-01,10:00:00,2026-05-01,UPI/RAJESH VERMA/ALLOWANCE,UPI,Income,TXN1001,0.00,6000.00,7150.00,Monthly transfer",
    ].join("\n");

    const result = parseStatementCSV(singleRowCsv);
    expect(result.success).toBe(true);
    expect(result.transactions.length).toBe(1);

    const tx = result.transactions[0];
    expect(tx.date).toBe("2026-05-01");
    expect(tx.narration).toBe("UPI/RAJESH VERMA/ALLOWANCE");
    expect(tx.type).toBe("CR");
    expect(tx.amount_paise).toBe(600000);
    expect(tx.balance_paise).toBe(715000);
    expect(tx.referenceId).toBe("TXN1001");
    expect(tx.currency).toBe("INR");
  });

  // Test 3: Zero in one of the amount columns does not invalidate the opposite nonzero column
  it("Test 3: Zero in Debit_INR does not invalidate Credit_INR, and zero in Credit_INR does not invalidate Debit_INR", () => {
    const testCsv = [
      "Transaction_Date,Description,Debit_INR,Credit_INR,Balance_INR",
      "2026-04-01,UPI/ALLOWANCE,0.00,5000.00,5000.00",
      "2026-04-05,UPI/RENT,2500.00,0.00,2500.00",
      "2026-04-08,UPI/COACHING,,1000.00,3500.00", // empty debit
      "2026-04-12,UPI/SWIGGY,200.00,,3300.00", // empty credit
    ].join("\n");

    const result = parseStatementCSV(testCsv);
    expect(result.success).toBe(true);
    expect(result.transactions.length).toBe(4);

    expect(result.transactions[0].type).toBe("CR");
    expect(result.transactions[0].amount_paise).toBe(500000);

    expect(result.transactions[1].type).toBe("DR");
    expect(result.transactions[1].amount_paise).toBe(250000);

    expect(result.transactions[2].type).toBe("CR");
    expect(result.transactions[2].amount_paise).toBe(100000);

    expect(result.transactions[3].type).toBe("DR");
    expect(result.transactions[3].amount_paise).toBe(20000);
  });

  // Test 4: Both Debit_INR and Credit_INR equal to zero or ambiguous
  it("Test 4: Handles rows with zero amounts and ambiguous directions with clear skip reasons", () => {
    const testCsv = [
      "Transaction_Date,Description,Debit_INR,Credit_INR,Balance_INR",
      "2026-04-01,UPI/ALLOWANCE,0.00,5000.00,5000.00", // Valid CR
      "2026-04-02,BANK NOTICE CHARGE ZERO,0.00,0.00,5000.00", // Zero amount row
      "2026-04-03,AMBIGUOUS REVERSAL,500.00,500.00,5000.00", // Both positive
      "invalid-date,UPI/SWIGGY,200.00,0.00,4800.00", // Invalid date
    ].join("\n");

    const result = parseStatementCSV(testCsv);
    expect(result.success).toBe(true);
    expect(result.transactions.length).toBe(1); // Only 1 valid transaction

    expect(result.stats?.skippedRows).toBe(3);
    expect(result.stats?.skippedRowDetails?.length).toBe(3);

    // Verify skip reasons
    const zeroSkip = result.stats?.skippedRowDetails?.find((d) => d.rowNumber === 3);
    expect(zeroSkip?.reason).toContain("Zero amount row");

    const ambigSkip = result.stats?.skippedRowDetails?.find((d) => d.rowNumber === 4);
    expect(ambigSkip?.reason).toContain("Ambiguous direction");

    const dateSkip = result.stats?.skippedRowDetails?.find((d) => d.rowNumber === 5);
    expect(dateSkip?.reason).toContain("Invalid or missing date");
  });

  // Test 5: Empty CSV does not generate fake analytics
  it("Test 5: Empty CSV or header-only CSV returns clear error without generating fake analytics", () => {
    const emptyResult = parseStatementCSV("");
    expect(emptyResult.success).toBe(false);
    expect(emptyResult.error?.code).toBe("EMPTY_FILE");

    const headerOnlyResult = parseStatementCSV(
      "Transaction_Date,Description,Debit_INR,Credit_INR,Balance_INR\n"
    );
    expect(headerOnlyResult.success).toBe(false);
    expect(headerOnlyResult.error?.code).toBe("NO_DATA_ROWS");
  });

  // Test 6: Dashboard totals and category totals match the normalized test transactions
  it("Test 6: Statement analytics totals match exact sums from the 120-row statement", () => {
    const csvContent = generate120RowInrStatementCSV();
    const result = parseStatementCSV(csvContent);
    expect(result.success).toBe(true);

    const analytics = calculateStatementAnalytics(result.transactions);

    // Verify inflows: 6 months of allowance (6000) + 4 tutoring credits per month (600 + 550 + 600 + 500 = 2250)
    // Monthly inflow = 8,250 * 6 = 49,500 rupees = 4,950,000 paise
    expect(analytics.totalInflowPaise).toBe(4950000);

    // Verify net cash flow is positive
    expect(analytics.netCashFlowPaise).toBeGreaterThan(0);
    expect(analytics.savingsRatePercent).toBeGreaterThan(0);

    // Verify housing_rent category total: 6 months of 3000 rent = 18,000 rupees = 1,800,000 paise
    const rentCategory = analytics.categoryTotals.housing_rent;
    expect(rentCategory.amountPaise).toBe(1800000);
    expect(rentCategory.transactionCount).toBe(6);

    // Verify food_dining category has transactions
    const foodCategory = analytics.categoryTotals.food_dining;
    expect(foodCategory.amountPaise).toBeGreaterThan(0);
    expect(foodCategory.transactionCount).toBeGreaterThan(0);
  });

  // Test 7: Legacy formats continue to pass
  it("Test 7: Standard legacy formats (Date,Narration,Amount,Type,Balance) continue to parse seamlessly", () => {
    const legacyCsv = [
      "date,narration,amount,type,balance",
      "2026-04-01,UPI/PARENT ALLOWANCE,6000.00,CR,7150.00",
      "2026-04-05,UPI/HOSTEL RENT,3000.00,DR,4150.00",
      "2026-04-09,UPI/JIO RECHARGE,239.00,DR,3911.00",
    ].join("\n");

    const result = parseStatementCSV(legacyCsv);
    expect(result.success).toBe(true);
    expect(result.transactions.length).toBe(3);
    expect(result.transactions[0].type).toBe("CR");
    expect(result.transactions[1].type).toBe("DR");
  });
});
