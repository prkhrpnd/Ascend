import { NextRequest, NextResponse } from "next/server";
import { getReportCardByToken } from "@/lib/report/store";

export async function GET(req: NextRequest, { params }: { params: { token: string } }) {
  try {
    const token = params.token;
    const report = getReportCardByToken(token);

    if (!report) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Report card not found or access has been revoked." } },
        { status: 404 }
      );
    }

    return NextResponse.json({ report });
  } catch (err: any) {
    return NextResponse.json(
      { error: { code: "SERVER_ERROR", message: err.message || "Failed to retrieve report card" } },
      { status: 500 }
    );
  }
}
