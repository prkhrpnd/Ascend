import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { applyFilters } from "@/lib/engine/filters";
import { detectRecurringItems } from "@/lib/engine/recurrence";
import { assessIncome } from "@/lib/engine/income";
import { calculateLimitAndBacktest } from "@/lib/engine/limit";
import { ParsedTransaction, StatementCoverage } from "@/lib/engine/types";

const AssessSchema = z.object({
  transactions: z.array(z.any()),
  coverage: z.object({
    startDate: z.string(),
    endDate: z.string(),
    monthsCount: z.number(),
    totalTransactions: z.number(),
    confidence: z.enum(["limited", "ok", "good"]),
  }),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = AssessSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "INVALID_INPUT", message: parsed.error.message } },
        { status: 400 }
      );
    }

    const txs = parsed.data.transactions as ParsedTransaction[];
    const coverage = parsed.data.coverage as StatementCoverage;

    // 1. Filters
    const filtered = applyFilters(txs);

    // 2. Recurrence
    const recurring = detectRecurringItems(filtered.transactions);

    // 3. Income
    const income = assessIncome(filtered.transactions, recurring);

    // 4. Limit and Backtest
    const limitAssessment = calculateLimitAndBacktest(income, coverage, filtered.transactions);

    return NextResponse.json({
      filteredTransactions: filtered.transactions,
      roundTripPairs: filtered.roundTripPairs,
      loanAppTransactions: filtered.loanAppTransactions,
      recurringItems: recurring,
      incomeAssessment: income,
      limitAssessment,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: { code: "SERVER_ERROR", message: err.message || "Assessment calculation failed" } },
      { status: 500 }
    );
  }
}
