import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { handleChatQuery, TOTAL_REFUSALS_COUNT } from "@/lib/ai/chat";

const ChatSchema = z.object({
  query: z.string().min(1),
  context: z
    .object({
      limitPaise: z.number().optional(),
      availablePaise: z.number().optional(),
      outstandingPaise: z.number().optional(),
      dueDay: z.number().optional(),
      medianIncomePaise: z.number().optional(),
      cleanCycles: z.number().optional(),
      historyStrength: z.number().optional(),
      netCashFlowPaise: z.number().optional(),
      totalInflowPaise: z.number().optional(),
      totalOutflowPaise: z.number().optional(),
      savingsRatePercent: z.number().optional(),
      topCategory: z
        .object({
          label: z.string(),
          amountPaise: z.number(),
          percent: z.number(),
        })
        .optional(),
      financialHealthScore: z
        .object({
          score: z.number().nullable(),
          rating: z.string(),
          subScores: z.object({
            cashFlowSurplus: z.number(),
            fixedObligationRatio: z.number(),
            periodConsistency: z.number(),
            spendingDiscipline: z.number(),
          }),
          reasons: z.array(z.string()).optional(),
          actionableSuggestion: z.string().optional(),
        })
        .optional(),
      positiveMonthsCount: z.number().optional(),
      totalMonthsCount: z.number().optional(),
      activeFileName: z.string().optional(),
      studentName: z.string().optional(),
      cycleNumber: z.number().optional(),
      primaryIncomeDay: z.number().optional(),
      history: z
        .array(
          z.object({
            sender: z.enum(["user", "ascend"]),
            text: z.string(),
          })
        )
        .optional(),
    })
    .optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = ChatSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "INVALID_INPUT", message: parsed.error.message } },
        { status: 400 }
      );
    }

    const response = handleChatQuery(parsed.data.query, parsed.data.context);

    return NextResponse.json({
      ...response,
      totalRefusalsLogged: TOTAL_REFUSALS_COUNT,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: { code: "SERVER_ERROR", message: err.message || "Chat query failed" } },
      { status: 500 }
    );
  }
}
