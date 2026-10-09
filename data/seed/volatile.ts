import { createPRNG, RawTransaction, SYNTHETIC_DISCLAIMER, generatePriyaTransactions } from "./priya";

export { generatePriyaTransactions };

/**
 * Volatile profile (Aarav-like, irregular freelance credits, pre-income balance dips below Rs 300).
 * Expected result: recommended limit Rs 0 with reasons.
 */
export function generateVolatileTransactions(): RawTransaction[] {
  const rand = createPRNG(101);
  const transactions: RawTransaction[] = [];
  let balance = 22000; // Rs 220 opening balance (under Rs 300 buffer)

  const months = [
    { year: 2026, month: 4, days: 30 },
    { year: 2026, month: 5, days: 31 },
    { year: 2026, month: 6, days: 30 },
    { year: 2026, month: 7, days: 31 },
    { year: 2026, month: 8, days: 31 },
    { year: 2026, month: 9, days: 30 },
  ];

  months.forEach((m) => {
    const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
    const monthStr = `${m.year}-${pad(m.month)}`;

    interface Action {
      day: number;
      narration: string;
      amount_paise: number;
      type: "CR" | "DR";
    }
    const actions: Action[] = [];

    // Irregular freelance gigs landing on day 10 and 18
    actions.push({
      day: 10,
      narration: "UPI/FREELANCE_DESIGN_CLIENT/GIG",
      amount_paise: 250000, // Rs 2,500
      type: "CR",
    });

    actions.push({
      day: 18,
      narration: "UPI/ILLUSTRATION_COMMISSION/ONLINE",
      amount_paise: 180000, // Rs 1,800
      type: "CR",
    });

    // Substantial business & living spend early and mid month
    actions.push({
      day: 11,
      narration: "UPI/CREATIVE_SUITE/SUB",
      amount_paise: 120000,
      type: "DR",
    });

    actions.push({
      day: 15,
      narration: "UPI/COWORKING_SPACE/DAYPASS",
      amount_paise: 80000,
      type: "DR",
    });

    actions.push({
      day: 20,
      narration: "UPI/HARDWARE_STORE/PARTS",
      amount_paise: 160000,
      type: "DR",
    });

    // In the last 7 days of the month (days 24-29), large expenses drain balance to Rs 180 - 240 (under Rs 300)
    // We add an expense on day 27 to leave balance under Rs 250
    // We will compute exact amount when applying actions
    actions.sort((a, b) => a.day - b.day);

    actions.forEach((act) => {
      if (act.type === "CR") {
        balance += act.amount_paise;
      } else {
        balance -= act.amount_paise;
      }
      transactions.push({
        date: `${monthStr}-${pad(act.day)}`,
        narration: act.narration,
        amount_paise: act.amount_paise,
        type: act.type,
        balance_paise: balance,
      });
    });

    // Add a day 27 expense leaving balance at Rs 200 (20,000 paise)
    const targetPreIncomeBal = Math.round((180 + Math.floor(rand() * 50)) * 100); // Rs 180 to Rs 230
    if (balance > targetPreIncomeBal) {
      const lateExpense = balance - targetPreIncomeBal;
      balance = targetPreIncomeBal;
      transactions.push({
        date: `${monthStr}-27`,
        narration: "UPI/PRINT_SHOP/PORTFOLIO_PRINTS",
        amount_paise: lateExpense,
        type: "DR",
        balance_paise: balance,
      });
    }
  });

  return transactions;
}

/**
 * Thin profile: only 2 months of history.
 */
export function generateThinTransactions(): RawTransaction[] {
  const priyaAll = generatePriyaTransactions();
  // Filter only first 2 months (April and May 2026)
  return priyaAll.filter((t) => t.date.startsWith("2026-04") || t.date.startsWith("2026-05"));
}
