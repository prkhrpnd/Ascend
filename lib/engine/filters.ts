import { ParsedTransaction } from "./types";
import { normalizePayeeKey } from "./recurrence";
import { LOAN_APP_KEYWORDS } from "./rules";

export interface FilterResult {
  transactions: ParsedTransaction[];
  roundTripPairs: {
    inflowId: string;
    outflowId: string;
    payee: string;
    amountPaise: number;
    daysGap: number;
  }[];
  loanAppTransactions: ParsedTransaction[];
}

/**
 * Apply round-trip and loan-app filters to transactions.
 */
export function applyFilters(transactions: ParsedTransaction[]): FilterResult {
  // Clone array
  const txs = transactions.map((t) => ({ ...t }));
  const roundTripPairs: FilterResult["roundTripPairs"] = [];
  const loanAppTransactions: ParsedTransaction[] = [];

  // 1. Loan app filter
  txs.forEach((tx) => {
    const upper = tx.narration.toUpperCase();
    const isLoan = LOAN_APP_KEYWORDS.some((kw) => upper.includes(kw));
    if (isLoan) {
      tx.isLoanApp = true;
      loanAppTransactions.push(tx);
    }
  });

  // 2. Round-trip filter
  // An inflow from payee P and an outflow to the same P within 7 days where amounts are within 2%
  const inflows = txs.filter((t) => t.type === "CR");
  const outflows = txs.filter((t) => t.type === "DR");

  const pairedOutflowIds = new Set<string>();

  inflows.forEach((inf) => {
    if (inf.isRoundTrip) return;
    const infKey = normalizePayeeKey(inf.narration);
    const infDate = new Date(inf.date).getTime();

    for (const out of outflows) {
      if (out.isRoundTrip || pairedOutflowIds.has(out.id)) continue;
      const outKey = normalizePayeeKey(out.narration);

      // Check if same payee
      if (infKey && outKey && (infKey.includes(outKey) || outKey.includes(infKey) || infKey === outKey)) {
        const outDate = new Date(out.date).getTime();
        const diffDays = Math.abs(outDate - infDate) / (1000 * 60 * 60 * 24);

        if (diffDays <= 7) {
          const amtDiff = Math.abs(inf.amount_paise - out.amount_paise);
          const ratio = amtDiff / inf.amount_paise;
          if (ratio <= 0.02) {
            // Flag both
            inf.isRoundTrip = true;
            inf.roundTripPairId = out.id;
            out.isRoundTrip = true;
            out.roundTripPairId = inf.id;
            pairedOutflowIds.add(out.id);

            roundTripPairs.push({
              inflowId: inf.id,
              outflowId: out.id,
              payee: infKey,
              amountPaise: inf.amount_paise,
              daysGap: Math.round(diffDays),
            });
            break;
          }
        }
      }
    }
  });

  return {
    transactions: txs,
    roundTripPairs,
    loanAppTransactions,
  };
}
