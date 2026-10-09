import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

describe("5months.csv Verification Test", () => {
  it("verifies manual calculation on 5months.csv", () => {
    const csvPath = path.join(__dirname, "fixtures", "5months.csv");
    const content = fs.readFileSync(csvPath, "utf8");
    const lines = content.trim().split("\n");
    const headers = lines[0].split(",");

    console.log("Headers:", headers);
    const rows = lines.slice(1).map((l) => l.split(","));
    expect(rows.length).toBe(250);

    let credits = 0;
    let debits = 0;

    let prevBal = 0;
    let discrepancies = 0;

    // First row
    const firstRow = rows[0];
    const firstAmt = parseInt(firstRow[2], 10);
    const firstType = firstRow[3].trim().toLowerCase();
    const firstBal = parseInt(firstRow[4], 10);

    expect(firstBal).toBe(6082677);
    expect(firstAmt).toBe(82677);
    expect(firstType).toBe("credit");

    // Opening balance calculation
    const openingBal = firstType === "credit" ? firstBal - firstAmt : firstBal + firstAmt;
    expect(openingBal).toBe(6000000); // Rs 60,000.00!

    rows.forEach((row, idx) => {
      const amt = parseInt(row[2], 10);
      const type = row[3].trim().toLowerCase();
      const bal = parseInt(row[4], 10);

      if (type === "credit") {
        credits++;
      } else if (type === "debit") {
        debits++;
      }

      if (idx === 0) {
        prevBal = bal;
      } else {
        const expected = type === "credit" ? prevBal + amt : prevBal - amt;
        if (expected !== bal) {
          discrepancies++;
          console.log(`Discrepancy at row ${idx + 2}: prev=${prevBal}, type=${type}, amt=${amt}, expected=${expected}, actual=${bal}`);
        }
        prevBal = bal;
      }
    });

    console.log("Total rows:", rows.length);
    console.log("Credits:", credits, "Debits:", debits);
    console.log("Discrepancies:", discrepancies);

    expect(rows.length).toBe(250);
    expect(debits).toBe(200);
    expect(credits).toBe(50);
    expect(discrepancies).toBe(0);
  });

  it("verifies parseStatementCSV output on 5months.csv", async () => {
    const { parseStatementCSV } = await import("../lib/engine/parse");
    const csvPath = path.join(__dirname, "fixtures", "5months.csv");
    const content = fs.readFileSync(csvPath, "utf8");

    const result = parseStatementCSV(content, undefined, "5months.csv");
    expect(result.success).toBe(true);
    expect(result.transactions.length).toBe(250);

    const crCount = result.transactions.filter((t) => t.type === "CR").length;
    const drCount = result.transactions.filter((t) => t.type === "DR").length;
    expect(crCount).toBe(50);
    expect(drCount).toBe(200);

    expect(result.stats).toBeDefined();
    if (result.stats) {
      expect(result.stats.totalRawRows).toBe(250);
      expect(result.stats.validTransactions).toBe(250);
      expect(result.stats.skippedRows).toBe(0);
      expect(result.stats.duplicateRows).toBe(0);
      expect(result.stats.startingBalancePaise).toBe(6000000); // Rs 60,000.00
      expect(result.stats.firstTransactionClosingBalancePaise).toBe(6082677); // Rs 60,826.77
      expect(result.stats.endingBalancePaise).toBe(1000000); // Rs 10,000.00
      expect(result.stats.continuityDiscrepancies).toBe(0);
      expect(result.stats.warnings?.length).toBe(0);
      expect(result.stats.startDate).toBe("2026-05-01");
      expect(result.stats.endDate).toBe("2026-09-29");
      expect(result.stats.currencyDetected).toBe("INR");
    }

    // Verify first transaction details
    const firstTx = result.transactions[0];
    expect(firstTx.date).toBe("2026-05-01");
    expect(firstTx.type).toBe("CR");
    expect(firstTx.amount_paise).toBe(82677);
    expect(firstTx.balance_paise).toBe(6082677);

    // Verify last transaction details
    const lastTx = result.transactions[result.transactions.length - 1];
    expect(lastTx.date).toBe("2026-09-29");
    expect(lastTx.type).toBe("DR");
    expect(lastTx.amount_paise).toBe(47054);
    expect(lastTx.balance_paise).toBe(1000000);
  });
});

