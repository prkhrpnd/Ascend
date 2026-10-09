import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { advanceCycle } from "@/lib/engine/cycle";
import { UserCreditState } from "@/lib/engine/types";

const CycleSchema = z.object({
  state: z.any(),
  slipScenario: z.boolean(),
  slipAction: z.enum(["SHIFT_DUE_DATE", "SPLIT_INSTALLMENTS", "REPAY_ON_TIME", "MISS_PAYMENT"]).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = CycleSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "INVALID_INPUT", message: parsed.error.message } },
        { status: 400 }
      );
    }

    const prevState = parsed.data.state as UserCreditState;
    const result = advanceCycle(prevState, {
      slipScenario: parsed.data.slipScenario,
      slipAction: parsed.data.slipAction,
    });

    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json(
      { error: { code: "SERVER_ERROR", message: err.message || "Failed to advance cycle" } },
      { status: 500 }
    );
  }
}
