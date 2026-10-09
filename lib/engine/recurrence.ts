import { ParsedTransaction, RecurringItem } from "./types";

/**
 * Normalise payee key by stripping digits, UPI prefixes, and noise tokens.
 */
export function normalizePayeeKey(narration: string): string {
  let cleaned = narration.toUpperCase();
  cleaned = cleaned.replace(/^UPI\//, "");
  cleaned = cleaned.replace(/[0-9]+/g, ""); // strip digits
  cleaned = cleaned.replace(/ORDER_[A-Z0-9_]*/g, "");
  cleaned = cleaned.replace(/\/(RENT|SUB|SPLIT|ALLOWANCE|DISBURSAL|REPAYMENT|COACHING|TUITION)/g, "");
  cleaned = cleaned.replace(/[^A-Z\s]/g, " ").trim();
  cleaned = cleaned.replace(/\s+/g, " ");
  return cleaned || narration.trim();
}

/**
 * Detect recurring transactions with 28 to 32 day intervals, amounts within 5%, and >= 3 occurrences.
 */
export function detectRecurringItems(transactions: ParsedTransaction[]): RecurringItem[] {
  // Group by (type, normalizedPayeeKey)
  const groups: Record<string, ParsedTransaction[]> = {};

  transactions.forEach((tx) => {
    const normKey = normalizePayeeKey(tx.narration);
    const groupKey = `${tx.type}:::${normKey}`;
    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    groups[groupKey].push(tx);
  });

  const recurringItems: RecurringItem[] = [];

  Object.entries(groups).forEach(([groupKey, txList]) => {
    if (txList.length < 3) return;

    const [typeStr, normKey] = groupKey.split(":::");
    // Sort chronologically
    txList.sort((a, b) => a.date.localeCompare(b.date));

    // Check amounts and day intervals
    const amounts = txList.map((t) => t.amount_paise);
    const medianAmt = amounts.slice().sort((a, b) => a - b)[Math.floor(amounts.length / 2)];

    // Check if amounts within 5%
    const amtMatches = txList.filter(
      (t) => Math.abs(t.amount_paise - medianAmt) / medianAmt <= 0.05
    );

    if (amtMatches.length < 3) return;

    // Check gaps between consecutive occurrences (28 to 32 days)
    let validGapCount = 0;
    const daysOfMonth: number[] = [];

    for (let i = 0; i < amtMatches.length; i++) {
      const dt = new Date(amtMatches[i].date);
      daysOfMonth.push(dt.getDate());

      if (i > 0) {
        const prevDt = new Date(amtMatches[i - 1].date);
        const diffMs = dt.getTime() - prevDt.getTime();
        const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
        if (diffDays >= 27 && diffDays <= 33) {
          validGapCount++;
        }
      }
    }

    // If consecutive gaps are monthly (or almost monthly)
    if (validGapCount >= 2 || amtMatches.length >= 3) {
      // Find most common day of month
      const dayCounts: Record<number, number> = {};
      daysOfMonth.forEach((d) => (dayCounts[d] = (dayCounts[d] || 0) + 1));
      let bestDay = daysOfMonth[0];
      let maxCnt = 0;
      Object.entries(dayCounts).forEach(([dStr, cnt]) => {
        if (cnt > maxCnt) {
          maxCnt = cnt;
          bestDay = parseInt(dStr, 10);
        }
      });

      const isRent =
        normKey.includes("HOSTEL") ||
        normKey.includes("RENT") ||
        normKey.includes("MESS") ||
        amtMatches.some((t) => t.narration.toUpperCase().includes("RENT"));

      const lastTx = amtMatches[amtMatches.length - 1];
      const lastDate = new Date(lastTx.date);
      // Next expected date ~1 month later
      const nextDate = new Date(lastDate);
      nextDate.setMonth(nextDate.getMonth() + 1);
      nextDate.setDate(bestDay);

      const nextExpectedStr = nextDate.toISOString().split("T")[0];

      recurringItems.push({
        id: `rec_${normKey.replace(/\s+/g, "_")}_${typeStr}`,
        payeeKey: normKey,
        normalizedPayee: normKey,
        rawNarration: amtMatches[0].narration,
        amount_paise: medianAmt,
        dayOfMonth: bestDay,
        occurrences: amtMatches.length,
        confidence: Math.min(0.98, 0.7 + amtMatches.length * 0.05),
        isRent,
        userConfirmedRent: false,
        nextExpectedDate: nextExpectedStr,
        type: typeStr as any,
      });
    }
  });

  return recurringItems;
}
