import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { simulateAffordability } from "@/lib/engine/simulate";

const SimulateSchema = z.object({
  currentBalancePaise: z.number(),
  monthlyAllowancePaise: z.number(),
  monthlyEarnedPaise: z.number(),
  primaryIncomeDay: z.number(),
  dueDay: z.number(),
  dailyMedianSpendPaise: z.number(),
  drawAmountPaise: z.number(),
  purchaseAmountPaise: z.number(),
  purchaseDayOffset: z.number().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = SimulateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "INVALID_INPUT", message: parsed.error.message } },
        { status: 400 }
      );
    }

    const result = simulateAffordability(parsed.data);
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json(
      { error: { code: "SERVER_ERROR", message: err.message || "Simulation failed" } },
      { status: 500 }
    );
  }
}
