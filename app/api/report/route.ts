import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createReportToken, revokeReportToken, PRIVACY_AUDIT_LOG } from "@/lib/report/store";

const CreateReportSchema = z.object({
  studentName: z.string().default("Priya"),
  billsPaidOnTimeCount: z.number(),
  savingsRatePercent: z.number().nullable(),
  maxCreditCostRupees: z.number(),
  periodText: z.string(),
});

const RevokeReportSchema = z.object({
  token: z.string(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = CreateReportSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "INVALID_INPUT", message: parsed.error.message } },
        { status: 400 }
      );
    }

    const report = createReportToken({
      studentName: parsed.data.studentName,
      billsPaidOnTimeCount: parsed.data.billsPaidOnTimeCount,
      savingsRatePercent: parsed.data.savingsRatePercent,
      maxCreditCostRupees: parsed.data.maxCreditCostRupees,
      periodText: parsed.data.periodText,
      lastUpdated: new Date().toISOString(),
    });

    return NextResponse.json({ report, auditLogs: PRIVACY_AUDIT_LOG });
  } catch (err: any) {
    return NextResponse.json(
      { error: { code: "SERVER_ERROR", message: err.message || "Failed to create share token" } },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = RevokeReportSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "INVALID_INPUT", message: parsed.error.message } },
        { status: 400 }
      );
    }

    const revoked = revokeReportToken(parsed.data.token);
    if (!revoked) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Token not found or already revoked" } },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, auditLogs: PRIVACY_AUDIT_LOG });
  } catch (err: any) {
    return NextResponse.json(
      { error: { code: "SERVER_ERROR", message: err.message || "Failed to revoke token" } },
      { status: 500 }
    );
  }
}
