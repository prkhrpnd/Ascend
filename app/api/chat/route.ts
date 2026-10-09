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
