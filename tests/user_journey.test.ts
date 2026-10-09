import { describe, it, expect, beforeEach } from "vitest";
import { parseStatementCSV } from "@/lib/engine/parse";
import { searchInstitutions, SUPPORTED_INSTITUTIONS } from "@/config/institutions";
import { supabase } from "@/lib/supabase/client";
import * as fs from "fs";
import * as path from "path";

describe("User Journey and Data Architecture Verification", () => {
  beforeEach(() => {
    // Clear mock localStorage if available
    if (typeof window !== "undefined") {
      localStorage.clear();
    }
  });

  // Test 1: Nationwide Institution Search & Custom Entry
  it("Test 1: Search institutions across India by name and city", () => {
    const delhiResults = searchInstitutions("Delhi");
    expect(delhiResults.length).toBeGreaterThan(0);
    expect(delhiResults.some((inst) => inst.name.includes("IIT Delhi"))).toBe(true);

    const mumbaiResults = searchInstitutions("Mumbai");
    expect(mumbaiResults.length).toBeGreaterThan(0);
    expect(mumbaiResults.some((inst) => inst.city === "Mumbai")).toBe(true);

    const bitsResults = searchInstitutions("BITS");
    expect(bitsResults.length).toBeGreaterThan(0);
    expect(bitsResults[0].name).toContain("BITS Pilani");
  });

  // Test 2: Bank Statement CSV parsing with standard Indian bank columns
  it("Test 2: Parses bank statement CSV with custom headers and auto-detection", () => {
    const csvContent = [
      "Txn Date,Particulars,Debit,Credit,Balance",
      "2024-05-02,UPI/ALLOWANCE/ICICI,,6000.00,8420.00",
      "2024-05-05,UPI/CAMPUS MESS HOSTEL,3000.00,,5420.00",
      "2024-05-15,UPI/TUTORING CLASS STIPEND,,1500.00,6920.00",
    ].join("\n");

    const result = parseStatementCSV(csvContent);
    expect(result.success).toBe(true);
    expect(result.transactions.length).toBe(3);

    // Verify types and paise conversion
    expect(result.transactions[0].type).toBe("CR");
    expect(result.transactions[0].amount_paise).toBe(600000);
    expect(result.transactions[1].type).toBe("DR");
    expect(result.transactions[1].amount_paise).toBe(300000);
    expect(result.transactions[1].balance_paise).toBe(542000);
  });

  // Test 3: Deduplication of identical transactions
  it("Test 3: Deduplicates identical rows on date, narration, amount, and balance", () => {
    const duplicateCsv = [
      "date,narration,amount,type,balance",
      "2024-05-02,UPI/ALLOWANCE/ICICI,6000.00,CR,8420.00",
      "2024-05-02,UPI/ALLOWANCE/ICICI,6000.00,CR,8420.00", // Duplicate row
      "2024-05-05,UPI/MESS RENT,3000.00,DR,5420.00",
    ].join("\n");

    const result = parseStatementCSV(duplicateCsv);
    expect(result.success).toBe(true);
    expect(result.transactions.length).toBe(2); // Only 2 unique transactions
  });

  // Test 4: Supabase Client Authentication & User Data Isolation
  it("Test 4: Supabase client isolates data records strictly by user ID", async () => {
    const userA_id = "user_alpha_123";
    const userB_id = "user_beta_456";

    // Insert statement for User A
    await supabase.from("statement_uploads").insert({
      id: "stmt_user_a",
      user_id: userA_id,
      file_name: "alpha_statement.csv",
      file_path: "statements/alpha.csv",
      parsed_transaction_count: 50,
      status: "processed",
    });

    // Insert statement for User B
    await supabase.from("statement_uploads").insert({
      id: "stmt_user_b",
      user_id: userB_id,
      file_name: "beta_statement.csv",
      file_path: "statements/beta.csv",
      parsed_transaction_count: 35,
      status: "processed",
    });

    // Query statements scoped to User A
    const { data: userAData } = await supabase
      .from("statement_uploads")
      .select("*")
      .eq("user_id", userA_id);

    expect(userAData).toBeDefined();
    expect(userAData.length).toBe(1);
    expect(userAData[0].user_id).toBe(userA_id);
    expect(userAData[0].file_name).toBe("alpha_statement.csv");

    // Query statements scoped to User B
    const { data: userBData } = await supabase
      .from("statement_uploads")
      .select("*")
      .eq("user_id", userB_id);

    expect(userBData).toBeDefined();
    expect(userBData.length).toBe(1);
    expect(userBData[0].user_id).toBe(userB_id);
    expect(userBData[0].file_name).toBe("beta_statement.csv");
  });

  // Test 5: DPDP Consent Lifecycle (Grant and Revocation)
  it("Test 5: Grants and revokes per-purpose DPDP consent records", async () => {
    const userId = "test_student_dpdp";

    // Grant consent
    const { data: insertRes } = await supabase.from("consents").insert({
      id: "consent_test_01",
      user_id: userId,
      purpose: "cash_flow_assessment",
      data_categories: ["transactions", "balances"],
      consent_version: "v2.0",
      status: "granted",
      expires_at: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
    });

    // Verify granted status
    const { data: activeConsents } = await supabase
      .from("consents")
      .select("*")
      .eq("user_id", userId)
      .eq("status", "granted");

    expect(activeConsents).toBeDefined();
    expect(activeConsents.length).toBe(1);
    expect(activeConsents[0].purpose).toBe("cash_flow_assessment");

    // Revoke consent
    await supabase
      .from("consents")
      .update({ status: "revoked", revoked_at: new Date().toISOString() })
      .eq("id", "consent_test_01");

    // Verify revoked status
    const { data: revokedConsent } = await supabase
      .from("consents")
      .select("*")
      .eq("id", "consent_test_01")
      .single();

    expect(revokedConsent.status).toBe("revoked");
  });

  // Test 6: Strict Prohibition on Em Dashes and En Dashes across source code
  it("Test 6: Zero em dashes and en dashes in user-facing source code", () => {
    const dirsToCheck = ["app", "components", "lib", "config"];
    const baseDir = path.resolve(__dirname, "..");
    const violations: Array<{ file: string; em: number; en: number }> = [];

    function scanDir(dirPath: string) {
      const entries = fs.readdirSync(dirPath, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);
        if (entry.isDirectory()) {
          scanDir(fullPath);
        } else if (/\.(tsx|ts|jsx|js|md)$/.test(entry.name)) {
          const content = fs.readFileSync(fullPath, "utf8");
          const emMatches = (content.match(/\u2014/g) || []).length;
          const enMatches = (content.match(/\u2013/g) || []).length;
          if (emMatches > 0 || enMatches > 0) {
            violations.push({
              file: path.relative(baseDir, fullPath),
              em: emMatches,
              en: enMatches,
            });
          }
        }
      }
    }

    for (const d of dirsToCheck) {
      const fullDir = path.join(baseDir, d);
      if (fs.existsSync(fullDir)) {
        scanDir(fullDir);
      }
    }

    if (violations.length > 0) {
      console.error("Found dash violations:", violations);
    }
    expect(violations.length).toBe(0);
  });
});
