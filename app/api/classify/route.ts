import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { classifyAllTransactions } from "@/lib/engine/classify";
import { ParsedTransaction } from "@/lib/engine/types";

const ClassifySchema = z.object({
  transactions: z.array(
    z.object({
      id: z.string(),
      date: z.string(),
      narration: z.string(),
      amount_paise: z.number(),
      type: z.enum(["CR", "DR"]),
      balance_paise: z.number(),
      category: z.string().optional(),
      source: z.string().optional(),
      confidence: z.number().optional(),
    })
  ),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = ClassifySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "INVALID_INPUT", message: parsed.error.message } },
        { status: 400 }
      );
    }

    const initial = parsed.data.transactions as ParsedTransaction[];
    const classified = classifyAllTransactions(initial);

    return NextResponse.json({ transactions: classified });
  } catch (err: any) {
    return NextResponse.json(
      { error: { code: "SERVER_ERROR", message: err.message || "Classification failed" } },
      { status: 500 }
    );
  }
}
