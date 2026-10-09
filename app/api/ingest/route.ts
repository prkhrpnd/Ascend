import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { parseStatementCSV } from "@/lib/engine/parse";
import { generatePriyaTransactions, transactionsToCSV } from "@/data/seed/priya";
import { generateVolatileTransactions, generateThinTransactions } from "@/data/seed/volatile";

const IngestSchema = z.object({
  profile: z.enum(["priya", "volatile", "thin"]).optional(),
  csvContent: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsedInput = IngestSchema.safeParse(body);
    if (!parsedInput.success) {
      return NextResponse.json(
        { error: { code: "INVALID_INPUT", message: parsedInput.error.message } },
        { status: 400 }
      );
    }

    let csv = "";
    if (parsedInput.data.profile === "priya") {
      csv = transactionsToCSV(generatePriyaTransactions());
    } else if (parsedInput.data.profile === "volatile") {
      csv = transactionsToCSV(generateVolatileTransactions());
    } else if (parsedInput.data.profile === "thin") {
      csv = transactionsToCSV(generateThinTransactions());
    } else if (parsedInput.data.csvContent) {
      csv = parsedInput.data.csvContent;
    } else {
      // Default to Priya
      csv = transactionsToCSV(generatePriyaTransactions());
    }

    const result = parseStatementCSV(csv);
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 422 });
    }

    return NextResponse.json({
      transactions: result.transactions,
      coverage: result.coverage,
      csvContent: csv,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: { code: "SERVER_ERROR", message: err.message || "Failed to parse statement" } },
      { status: 500 }
    );
  }
}
