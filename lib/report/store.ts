export interface ReportCardData {
  token: string;
  studentName: string;
  billsPaidOnTimeCount: number;
  savingsRatePercent: number | null;
  maxCreditCostRupees: number;
  periodText: string;
  lastUpdated: string;
  expiresAt: string;
  isRevoked: boolean;
}

export interface PrivacyEvent {
  id: string;
  action: "SHARE_GENERATED" | "SHARE_REVOKED" | "CONSENT_UPDATED" | "DATA_DELETED";
  details: string;
  timestamp: string;
}

// In-memory server store for tokens and privacy log
export const REPORT_CARD_TOKENS = new Map<string, ReportCardData>();
export const PRIVACY_AUDIT_LOG: PrivacyEvent[] = [];

export function createReportToken(data: Omit<ReportCardData, "token" | "expiresAt" | "isRevoked">): ReportCardData {
  const token = "rep_" + Math.random().toString(36).substring(2, 10);
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(); // 30 days
  const entry: ReportCardData = {
    ...data,
    token,
    expiresAt,
    isRevoked: false,
  };

  REPORT_CARD_TOKENS.set(token, entry);

  PRIVACY_AUDIT_LOG.unshift({
    id: "log_" + Math.random().toString(36).substring(2, 7),
    action: "SHARE_GENERATED",
    details: `Generated shareable parent report card token ${token.substring(0, 8)}... (totals-only)`,
    timestamp: new Date().toISOString(),
  });

  return entry;
}

export function revokeReportToken(token: string): boolean {
  const entry = REPORT_CARD_TOKENS.get(token);
  if (!entry) return false;

  entry.isRevoked = true;
  REPORT_CARD_TOKENS.delete(token); // completely remove so viewer returns 404

  PRIVACY_AUDIT_LOG.unshift({
    id: "log_" + Math.random().toString(36).substring(2, 7),
    action: "SHARE_REVOKED",
    details: `Revoked parent report card token ${token.substring(0, 8)}... Immediately invalidates access.`,
    timestamp: new Date().toISOString(),
  });

  return true;
}

export function getReportCardByToken(token: string): ReportCardData | null {
  const entry = REPORT_CARD_TOKENS.get(token);
  if (!entry || entry.isRevoked) {
    return null;
  }
  // Check 30-day expiry
  if (new Date(entry.expiresAt).getTime() < Date.now()) {
    REPORT_CARD_TOKENS.delete(token);
    return null;
  }
  return entry;
}
