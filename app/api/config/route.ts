import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { POLICY, CONFIG_LOGS, LAST_UPDATE_REASON, updatePolicy, resetPolicy } from "@/config/policy";

const UpdateConfigSchema = z.object({
  updates: z.record(z.any()),
  reason: z.string().min(3),
});

export async function GET() {
  return NextResponse.json({
    policy: POLICY,
    logs: CONFIG_LOGS,
    lastUpdateReason: LAST_UPDATE_REASON,
  });
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = UpdateConfigSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "INVALID_INPUT", message: parsed.error.message } },
        { status: 400 }
      );
    }

    const updated = updatePolicy(parsed.data.updates, parsed.data.reason);

    return NextResponse.json({
      policy: updated,
      logs: CONFIG_LOGS,
      lastUpdateReason: LAST_UPDATE_REASON,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: { code: "SERVER_ERROR", message: err.message || "Failed to update policy config" } },
      { status: 500 }
    );
  }
}
