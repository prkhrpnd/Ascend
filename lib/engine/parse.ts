import Papa from "papaparse";
import { ParsedTransaction, StatementCoverage, CoverageConfidence, TransactionType } from "./types";
import { categorizeTransaction, CanonicalCategoryId } from "./categories";
import { generatePriyaTransactions, transactionsToCSV } from "@/data/seed/priya";

export interface ColumnMapping {
  date?: string;
  narration?: string;
  amount?: string;
  amount_paise?: string;
  debit?: string;
  credit?: string;
  type?: string;
  balance?: string;
  balance_paise?: string;
  reference_id?: string;
  category?: string;
  currency?: string;
}

export interface SkippedRowDetail {
  rowNumber: number;
  reason: string;
  rawDate?: string;
  rawNarration?: string;
}

export interface ParseStats {
  fileName: string;
  totalRawRows: number;
  validTransactions: number;
  skippedRows: number;
  duplicateRows: number;
  skippedRowDetails?: SkippedRowDetail[];
  startDate: string;
  endDate: string;
  totalDays: number;
  startingBalancePaise: number;
  firstTransactionClosingBalancePaise?: number;
  endingBalancePaise: number;
  hasBalances: boolean;
  continuityDiscrepancies: number;
  currencyDetected: string;
  warnings?: string[];
}

export interface ParseResult {
  success: boolean;
  transactions: ParsedTransaction[];
  coverage: StatementCoverage | null;
  stats?: ParseStats;
  error?: {
    code: string;
    message: string;
  };
}

/**
 * Normalizes a column header string by removing symbols, whitespace, and converting to lowercase.
 */
function normalizeHeader(key: string): string {
  return key.trim().toLowerCase().replace(/[^a-z0-9]/g, "");
}

/**
 * Matches a row key against a list of candidate aliases, with both exact and suffix-tolerant checks.
 */
function findMatchingKey(rowKeys: string[], candidates: string[]): string | undefined {
  const normalizedCandidateSet = new Set(candidates.map(normalizeHeader));

  // 1. Direct normalized match
  for (const k of rowKeys) {
    if (normalizedCandidateSet.has(normalizeHeader(k))) {
      return k;
    }
  }

  // 2. Suffix-stripped normalized match (e.g. "debit_inr", "debit_rs" -> "debit")
  for (const k of rowKeys) {
    const stripped = normalizeHeader(k).replace(/(inr|rs|rupees)$/, "");
    if (stripped && normalizedCandidateSet.has(stripped)) {
      return k;
    }
  }

  return undefined;
}

/**
 * Parses numeric amounts into clean numbers, handling currencies, commas, and negative values.
 */
function parseNumericAmount(val: string | number | undefined | null): number | null {
  if (val === undefined || val === null) return null;
  const str = String(val).trim();
  if (str === "" || str === "-" || str === "N/A" || str === "null" || str === "nil") return null;

  const isNegative = str.startsWith("-") || (str.startsWith("(") && str.endsWith(")"));
  const clean = str.replace(/[^0-9.]/g, "");
  if (!clean) return null;

  const num = parseFloat(clean);
  if (isNaN(num)) return null;

  return isNegative ? -num : num;
}

/**
 * Normalizes and validates dates into standard YYYY-MM-DD format.
 */
function parseAndValidateDate(rawDateStr: string | undefined | null): string | null {
  if (!rawDateStr) return null;
  let d = rawDateStr.trim().split(" ")[0].split("T")[0];

  if (d.includes("/")) {
    const parts = d.split("/");
    if (parts.length === 3) {
      if (parts[2].length === 4) {
        // DD/MM/YYYY or MM/DD/YYYY
        d = `${parts[2]}-${parts[1].padStart(2, "0")}-${parts[0].padStart(2, "0")}`;
      } else if (parts[0].length === 4) {
        // YYYY/MM/DD
        d = `${parts[0]}-${parts[1].padStart(2, "0")}-${parts[2].padStart(2, "0")}`;
      }
    }
  } else if (d.includes("-")) {
    const parts = d.split("-");
    if (parts.length === 3) {
      if (parts[0].length <= 2 && parts[2].length === 4) {
        // DD-MM-YYYY
        d = `${parts[2]}-${parts[1].padStart(2, "0")}-${parts[0].padStart(2, "0")}`;
      } else if (parts[0].length === 4) {
        // YYYY-MM-DD
        d = `${parts[0]}-${parts[1].padStart(2, "0")}-${parts[2].padStart(2, "0")}`;
      }
    }
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) return null;
  const parsed = new Date(d);
  if (isNaN(parsed.getTime())) return null;

  return d;
}

/**
 * Standard CSV template for users to download.
 */
export function getStatementCSVTemplate(): string {
  return [
    "Date,Narration,Debit,Credit,Balance",
    "2026-04-01,UPI/RAJESH VERMA/ALLOWANCE,,6000.00,7150.00",
    "2026-04-05,UPI/HOSTEL MESS ACCT/RENT,3000.00,,4150.00",
    "2026-04-09,UPI/JIO PREPAID/9829012345,239.00,,3911.00",
    "2026-04-12,UPI/SWIGGY/ORDER_4821,210.00,,3701.00",
    "2026-04-18,UPI/ROHIT SHARMA/COACHING,,520.00,4221.00",
  ].join("\n");
}

/**
 * Generate Priya's realistic synthetic 6-month statement CSV.
 */
export function generatePriyaStatementCSV(): string {
  const txs = generatePriyaTransactions();
  return transactionsToCSV(txs);
}

/**
 * Deduplicate, parse, normalize, and categorize statement CSV rows with comprehensive alias detection.
 * Supports standard Indian bank statements including Debit_INR, Credit_INR, and Balance_INR schemas.
 */
export function parseStatementCSV(
  csvContent: string,
  customMapping?: ColumnMapping,
  fileName: string = "statement.csv"
): ParseResult {
  if (!csvContent || csvContent.trim().length === 0) {
    return {
      success: false,
      transactions: [],
      coverage: null,
      error: {
        code: "EMPTY_FILE",
        message: "The uploaded CSV file is empty. Please upload a valid bank statement file.",
      },
    };
  }

  // Size limit check (2MB)
  if (new Blob([csvContent]).size > 2 * 1024 * 1024) {
    return {
      success: false,
      transactions: [],
      coverage: null,
      error: {
        code: "FILE_TOO_LARGE",
        message: "The uploaded file exceeds the 2 MB limit. Please upload a standard 6-month statement.",
      },
    };
  }

  const parsed = Papa.parse<Record<string, string>>(csvContent, {
    header: true,
    skipEmptyLines: true,
  });

  if (parsed.errors.length > 0 && parsed.data.length === 0) {
    return {
      success: false,
      transactions: [],
      coverage: null,
      error: {
        code: "MALFORMED_CSV",
        message: "Unable to parse CSV structure. Please verify column headers: Date, Narration/Description, Debit/Credit, Balance.",
      },
    };
  }

  const rawRows = parsed.data;
  if (rawRows.length === 0) {
    return {
      success: false,
      transactions: [],
      coverage: null,
      error: {
        code: "NO_DATA_ROWS",
        message: "CSV file contains no transaction rows.",
      },
    };
  }

  const rowKeys = Object.keys(rawRows[0] || {});

  // Determine key mappings with comprehensive aliases supporting INR suffixes and underscores
  const dateKey =
    customMapping?.date ||
    findMatchingKey(rowKeys, [
      "transaction_date",
      "transactiondate",
      "date",
      "txndate",
      "txn_date",
      "value_date",
      "valuedate",
      "posting_date",
      "postingdate",
      "trans_date",
    ]) ||
    "date";

  const narrationKey =
    customMapping?.narration ||
    findMatchingKey(rowKeys, [
      "description",
      "narration",
      "particulars",
      "remarks",
      "narrative",
      "details",
      "txn_desc",
      "transaction_description",
      "statement_note",
      "note",
    ]) ||
    "narration";

  const debitKey =
    customMapping?.debit ||
    findMatchingKey(rowKeys, [
      "debit_inr",
      "debitinr",
      "debit",
      "withdrawal",
      "dr",
      "debitamount",
      "debit_amount",
      "dr_amount",
      "withdrawal_amount",
      "withdrawal_inr",
      "dr_inr",
      "debit_rs",
      "debitrs",
    ]);

  const creditKey =
    customMapping?.credit ||
    findMatchingKey(rowKeys, [
      "credit_inr",
      "creditinr",
      "credit",
      "deposit",
      "cr",
      "creditamount",
      "credit_amount",
      "cr_amount",
      "deposit_amount",
      "deposit_inr",
      "cr_inr",
      "credit_rs",
      "creditrs",
    ]);

  const balanceKey =
    customMapping?.balance ||
    findMatchingKey(rowKeys, [
      "balance_inr",
      "balanceinr",
      "balance",
      "closingbalance",
      "closing_balance",
      "closing_balance_inr",
      "netbalance",
      "availablebalance",
      "runningbalance",
      "running_balance",
      "balance_rs",
    ]);

  const amountKey =
    customMapping?.amount ||
    findMatchingKey(rowKeys, [
      "amount_inr",
      "amountinr",
      "amount",
      "txnamount",
      "transactionamount",
      "netamount",
      "txn_amt",
      "amount_rs",
    ]);

  const amountPaiseKey =
    customMapping?.amount_paise ||
    findMatchingKey(rowKeys, ["amountpaise", "amount_paise"]);

  const balancePaiseKey =
    customMapping?.balance_paise ||
    findMatchingKey(rowKeys, ["balancepaise", "balance_paise"]);

  const typeKey =
    customMapping?.type ||
    findMatchingKey(rowKeys, [
      "transaction_type",
      "transactiontype",
      "type",
      "payment_mode",
      "crdr",
      "txn_type",
      "drcr",
    ]);

  const referenceKey =
    customMapping?.reference_id ||
    findMatchingKey(rowKeys, [
      "reference_id",
      "referenceid",
      "ref_id",
      "ref_no",
      "referencenumber",
      "reference",
      "utr",
      "txn_id",
      "txnid",
      "cheque_no",
      "transaction_id",
    ]);

  const categoryKey =
    customMapping?.category ||
    findMatchingKey(rowKeys, [
      "category",
      "source_category",
      "txn_category",
      "transaction_category",
    ]);

  const timeKey = findMatchingKey(rowKeys, [
    "transaction_time",
    "transactiontime",
    "time",
    "txn_time",
  ]);

  const valueDateKey = findMatchingKey(rowKeys, [
    "value_date",
    "valuedate",
  ]);

  const noteKey = findMatchingKey(rowKeys, [
    "statement_note",
    "statementnote",
    "note",
    "remarks",
  ]);

  // Currency validation and recognition
  let currencyDetected = "INR";
  const headerCombined = rowKeys.join(" ").toLowerCase();
  if (headerCombined.includes("inr") || headerCombined.includes("rs") || headerCombined.includes("rupee")) {
    currencyDetected = "INR";
  }

  const currencyKey = findMatchingKey(rowKeys, ["currency", "curr", "ccy"]);
  if (currencyKey) {
    const firstRowWithCurr = rawRows.find((r) => r[currencyKey]?.trim());
    if (firstRowWithCurr) {
      const c = firstRowWithCurr[currencyKey].trim().toUpperCase();
      if (c && c !== "INR" && c !== "RS" && c !== "₹") {
        return {
          success: false,
          transactions: [],
          coverage: null,
          error: {
            code: "UNSUPPORTED_CURRENCY",
            message: `Unsupported currency: statement appears to be in ${c}. Ascend currently accepts INR statements only.`,
          },
        };
      }
    }
  }

  const seenKeys = new Set<string>();
  const transactions: ParsedTransaction[] = [];
  const skippedRowDetails: SkippedRowDetail[] = [];
  let duplicateRows = 0;

  for (let i = 0; i < rawRows.length; i++) {
    const row = rawRows[i];
    const rowNum = i + 2; // 1-based index plus header

    // 1. Date normalization and validation
    const rawDate = (row[dateKey] || row.Date || row.txndate || row.Transaction_Date || "").trim();
    const validDate = parseAndValidateDate(rawDate);
    if (!validDate) {
      skippedRowDetails.push({
        rowNumber: rowNum,
        reason: `Invalid or missing date: "${rawDate || ""}"`,
        rawDate,
      });
      continue;
    }

    // 2. Narration normalization
    const narration = (
      row[narrationKey] ||
      row.Narration ||
      row.description ||
      row.Description ||
      row.Particulars ||
      ""
    ).trim();

    if (!narration) {
      skippedRowDetails.push({
        rowNumber: rowNum,
        reason: "Missing transaction description / narration",
        rawDate: validDate,
      });
      continue;
    }

    // 3. Amount and direction parsing
    let type: TransactionType = "DR";
    let amount_paise = 0;
    let rowSkipReason: string | null = null;

    const debitNum = debitKey && row[debitKey] !== undefined ? parseNumericAmount(row[debitKey]) : null;
    const creditNum = creditKey && row[creditKey] !== undefined ? parseNumericAmount(row[creditKey]) : null;

    const hasPositiveDebit = debitNum !== null && debitNum > 0;
    const hasPositiveCredit = creditNum !== null && creditNum > 0;

    if (hasPositiveDebit && hasPositiveCredit) {
      // Ambiguous row where both debit and credit contain nonzero amounts
      rowSkipReason = `Ambiguous direction: both debit (₹${debitNum}) and credit (₹${creditNum}) contain positive amounts.`;
    } else if (hasPositiveDebit) {
      type = "DR";
      amount_paise = Math.round(debitNum * 100);
    } else if (hasPositiveCredit) {
      type = "CR";
      amount_paise = Math.round(creditNum * 100);
    } else if (amountPaiseKey && row[amountPaiseKey]) {
      const p = parseInt(String(row[amountPaiseKey]).replace(/[^0-9-]/g, ""), 10);
      if (!isNaN(p) && p !== 0) {
        amount_paise = Math.abs(p);
        const typeRaw = (typeKey ? row[typeKey] : row.type || row.Type || "").trim().toUpperCase();
        if (typeRaw === "CR" || typeRaw === "CREDIT" || typeRaw === "C" || typeRaw === "DEPOSIT") {
          type = "CR";
        } else if (typeRaw === "DR" || typeRaw === "DEBIT" || typeRaw === "D" || typeRaw === "WITHDRAWAL") {
          type = "DR";
        } else {
          type = p > 0 ? "CR" : "DR";
        }
      } else {
        rowSkipReason = "Zero or empty amount_paise value.";
      }
    } else if (amountKey && row[amountKey] !== undefined) {
      const amtNum = parseNumericAmount(row[amountKey]);
      if (amtNum !== null && amtNum !== 0) {
        amount_paise = Math.round(Math.abs(amtNum) * 100);
        const typeRaw = (typeKey ? row[typeKey] : row.type || row.Type || "").trim().toUpperCase();
        if (typeRaw === "CR" || typeRaw === "CREDIT" || typeRaw === "C" || typeRaw === "DEPOSIT") {
          type = "CR";
        } else if (typeRaw === "DR" || typeRaw === "DEBIT" || typeRaw === "D" || typeRaw === "WITHDRAWAL") {
          type = "DR";
        } else if (amtNum < 0) {
          type = "DR";
        } else {
          type = "CR";
        }
      } else {
        rowSkipReason = "Zero or empty amount value.";
      }
    } else if (row.amount || row.Amount) {
      const cleanAmt = parseNumericAmount(row.amount || row.Amount);
      if (cleanAmt !== null && cleanAmt !== 0) {
        amount_paise = Math.round(Math.abs(cleanAmt) * 100);
        const typeRaw = (typeKey ? row[typeKey] : row.type || row.Type || "").trim().toUpperCase();
        if (typeRaw === "CR" || typeRaw === "CREDIT" || typeRaw === "C" || typeRaw === "DEPOSIT") {
          type = "CR";
        } else if (typeRaw === "DR" || typeRaw === "DEBIT" || typeRaw === "D" || typeRaw === "WITHDRAWAL") {
          type = "DR";
        } else {
          type = cleanAmt < 0 ? "DR" : "CR";
        }
      } else {
        rowSkipReason = "Zero or empty amount value.";
      }
    } else if (debitNum === 0 && creditNum === 0) {
      rowSkipReason = "Zero amount row: both debit and credit columns are zero.";
    } else {
      rowSkipReason = "Unparseable or missing amount in row.";
    }

    if (rowSkipReason || isNaN(amount_paise) || amount_paise === 0) {
      skippedRowDetails.push({
        rowNumber: rowNum,
        reason: rowSkipReason || "Zero or invalid amount value",
        rawDate: validDate,
        rawNarration: narration,
      });
      continue;
    }

    // 4. Balance parsing
    let balance_paise = 0;
    if (balancePaiseKey && row[balancePaiseKey] !== undefined) {
      const bp = parseInt(String(row[balancePaiseKey]).replace(/[^0-9-]/g, ""), 10);
      if (!isNaN(bp)) balance_paise = bp;
    } else if (balanceKey && row[balanceKey] !== undefined) {
      const balNum = parseNumericAmount(row[balanceKey]);
      if (balNum !== null) balance_paise = Math.round(balNum * 100);
    } else if (row.balance || row.Balance) {
      const balNum = parseNumericAmount(row.balance || row.Balance);
      if (balNum !== null) balance_paise = Math.round(balNum * 100);
    }

    // 5. Deduplication check on date, narration, amount, balance
    const dedupeKey = `${validDate}|${narration}|${amount_paise}|${balance_paise}`;
    if (seenKeys.has(dedupeKey)) {
      duplicateRows++;
      continue;
    }
    seenKeys.add(dedupeKey);

    // 6. Source hints and categorization
    const sourceCategory = categoryKey && row[categoryKey] ? row[categoryKey].trim() : undefined;
    const classification = categorizeTransaction(narration, type, sourceCategory);

    // 7. Extract auxiliary metadata
    const referenceId = referenceKey && row[referenceKey] ? row[referenceKey].trim() : undefined;
    const paymentMethod = typeKey && row[typeKey] ? row[typeKey].trim() : undefined;
    const valueDate = valueDateKey && row[valueDateKey] ? parseAndValidateDate(row[valueDateKey]) || undefined : undefined;
    const time = timeKey && row[timeKey] ? row[timeKey].trim() : undefined;
    const note = noteKey && row[noteKey] ? row[noteKey].trim() : undefined;

    transactions.push({
      id: `tx_${i}_${Math.random().toString(36).substring(2, 7)}`,
      date: validDate,
      narration,
      amount_paise,
      type,
      balance_paise,
      category: classification.category,
      source: "rule",
      confidence: classification.confidence,
      ruleUsed: classification.ruleUsed,
      confidenceLevel: classification.confidenceLevel,
      isUserOverride: false,
      referenceId,
      sourceCategory,
      paymentMethod,
      currency: currencyDetected,
      time,
      valueDate,
      note,
    });
  }

  if (transactions.length === 0) {
    return {
      success: false,
      transactions: [],
      coverage: null,
      error: {
        code: "NO_VALID_TRANSACTIONS",
        message:
          "No valid INR transaction records found in statement. Please verify that your CSV contains valid dates, descriptions, and INR amount columns (such as Debit_INR and Credit_INR).",
      },
    };
  }

  // Determine if raw transactions were ordered descending by date
  // (e.g. newest at top, oldest at bottom)
  const isDescendingOrder =
    transactions.length > 1 &&
    transactions[0].date > transactions[transactions.length - 1].date;

  // Stably sort chronologically (oldest date first)
  // For same date: if original statement was descending, reverse their relative order; if ascending, preserve it.
  const indexed = transactions.map((tx, idx) => ({ tx, idx }));
  indexed.sort((a, b) => {
    const cmp = a.tx.date.localeCompare(b.tx.date);
    if (cmp !== 0) return cmp;
    return isDescendingOrder ? b.idx - a.idx : a.idx - b.idx;
  });
  transactions.length = 0;
  indexed.forEach((item) => transactions.push(item.tx));

  // Compute coverage
  const startDate = transactions[0].date;
  const endDate = transactions[transactions.length - 1].date;

  const uniqueMonths = new Set(transactions.map((t) => t.date.substring(0, 7)));
  const monthsCount = uniqueMonths.size;

  let confidence: CoverageConfidence = "limited";
  if (monthsCount >= 6) {
    confidence = "good";
  } else if (monthsCount >= 3) {
    confidence = "ok";
  }

  const coverage: StatementCoverage = {
    startDate,
    endDate,
    monthsCount,
    totalTransactions: transactions.length,
    confidence,
  };

  // Compute total calendar days
  let totalDays = 30;
  if (startDate && endDate) {
    const startMs = new Date(startDate).getTime();
    const endMs = new Date(endDate).getTime();
    const diff = Math.round((endMs - startMs) / (1000 * 60 * 60 * 24));
    totalDays = Math.max(1, diff + 1);
  }

  // Check balance continuity
  const firstTx = transactions[0];
  const firstTransactionClosingBalancePaise = firstTx?.balance_paise || 0;
  let startingBalancePaise = firstTransactionClosingBalancePaise;
  if (firstTx && firstTx.balance_paise !== 0) {
    startingBalancePaise =
      firstTx.type === "CR"
        ? firstTx.balance_paise - firstTx.amount_paise
        : firstTx.balance_paise + firstTx.amount_paise;
  }
  let endingBalancePaise = transactions[transactions.length - 1]?.balance_paise || 0;
  let hasBalances = transactions.some((t) => t.balance_paise !== 0);
  let continuityDiscrepancies = 0;

  if (hasBalances) {
    for (let j = 1; j < transactions.length; j++) {
      const prev = transactions[j - 1];
      const curr = transactions[j];
      if (prev.balance_paise !== 0 && curr.balance_paise !== 0) {
        const expectedBal =
          curr.type === "CR"
            ? prev.balance_paise + curr.amount_paise
            : prev.balance_paise - curr.amount_paise;
        if (Math.abs(expectedBal - curr.balance_paise) > 100) {
          continuityDiscrepancies++;
        }
      }
    }
  }

  const warnings: string[] = [];
  if (monthsCount < 3) {
    warnings.push("Statement history is shorter than 3 months. A 6-month statement provides optimal credit calibration.");
  }
  if (continuityDiscrepancies > 0) {
    warnings.push(`Detected ${continuityDiscrepancies} running balance discontinuities in the statement.`);
  }

  const stats: ParseStats = {
    fileName,
    totalRawRows: rawRows.length,
    validTransactions: transactions.length,
    skippedRows: skippedRowDetails.length,
    duplicateRows,
    skippedRowDetails,
    startDate,
    endDate,
    totalDays,
    startingBalancePaise,
    firstTransactionClosingBalancePaise,
    endingBalancePaise,
    hasBalances,
    continuityDiscrepancies,
    currencyDetected,
    warnings,
  };

  return {
    success: true,
    transactions,
    coverage,
    stats,
  };
}
