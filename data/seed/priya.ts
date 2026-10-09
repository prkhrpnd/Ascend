// Deterministic PRNG: Mulberry32
export function createPRNG(seed: number) {
  let s = seed >>> 0;
  return function () {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export interface RawTransaction {
  date: string; // YYYY-MM-DD
  narration: string;
  amount_paise: number;
  type: "CR" | "DR";
  balance_paise: number;
}

export const SYNTHETIC_DISCLAIMER = "SYNTHETIC DATA: not a real person";

/**
 * Generate 6 full months of synthetic transactions for Priya.
 * Seed is 2026.
 */
export function generatePriyaTransactions(): RawTransaction[] {
  const rand = createPRNG(2026);
  const transactions: RawTransaction[] = [];
  let balance = 115000; // Rs 1,150 opening balance

  // 6 full months: 2026-04 to 2026-09
  const months = [
    { year: 2026, month: 4, days: 30 },
    { year: 2026, month: 5, days: 31 },
    { year: 2026, month: 6, days: 30 },
    { year: 2026, month: 7, days: 31 },
    { year: 2026, month: 8, days: 31 },
    { year: 2026, month: 9, days: 30 },
  ];

  const tutorPayees = [
    "ROHIT SHARMA/COACHING",
    "POOJA GUPTA/TUITION",
    "AMIT VERMA/MATHS TUITION",
    "SNEHA JOSHI/COACHING",
    "KAVITA/SCIENCE TUITION",
  ];

  months.forEach((m, mIdx) => {
    const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
    const monthStr = `${m.year}-${pad(m.month)}`;

    interface DayAction {
      day: number;
      narration: string;
      amount_paise: number;
      type: "CR" | "DR";
    }
    const actions: DayAction[] = [];

    // 1st: Allowance Rs 6,000 (600,000 paise)
    actions.push({
      day: 1,
      narration: "UPI/RAJESH VERMA/ALLOWANCE",
      amount_paise: 600000,
      type: "CR",
    });

    // Tutoring credits:
    // Months 0-4: 4 credits of ~Rs 500
    // Month 5 (repaying loan): 5 credits of ~Rs 650 to maintain healthy cash flow
    const tutorCount = mIdx === 5 ? 5 : 4;
    const tutorDays = mIdx === 5 ? [2, 8, 14, 21, 27] : [3, 11, 18, 25];
    for (let i = 0; i < tutorCount; i++) {
      const tutorAmt = mIdx === 5 ? 65000 : Math.round((500 + Math.floor(rand() * 80)) * 100);
      const payee = tutorPayees[(mIdx + i) % tutorPayees.length];
      actions.push({
        day: tutorDays[i],
        narration: `UPI/${payee}`,
        amount_paise: tutorAmt,
        type: "CR",
      });
    }

    // 5th: Hostel and mess rent Rs 3,000 (300,000 paise)
    actions.push({
      day: 5,
      narration: "UPI/HOSTEL MESS ACCT/RENT",
      amount_paise: 300000,
      type: "DR",
    });

    // 9th: Prepaid recharge Rs 239
    actions.push({
      day: 9,
      narration: "UPI/JIO PREPAID/9829012345",
      amount_paise: 23900,
      type: "DR",
    });

    // 14th: Spotify subscription Rs 149
    actions.push({
      day: 14,
      narration: "UPI/SPOTIFY/SUB",
      amount_paise: 14900,
      type: "DR",
    });

    // 20th: Electricity share Rs 300 to Rs 520, month index 3 is 40% higher
    let elecRs = 360 + Math.floor(rand() * 80);
    if (mIdx === 3) elecRs = Math.round(elecRs * 1.4);
    actions.push({
      day: 20,
      narration: "UPI/MESS ELECTRICITY SHARE",
      amount_paise: elecRs * 100,
      type: "DR",
    });

    // Month 3 (index 2): Round-trip with friend ANANYA S
    if (mIdx === 2) {
      actions.push({
        day: 12,
        narration: "UPI/ANANYA S/SPLIT",
        amount_paise: 200000,
        type: "CR",
      });
      actions.push({
        day: 14,
        narration: "UPI/ANANYA S/SPLIT RETURN",
        amount_paise: 200000,
        type: "DR",
      });
    }

    // Month 5 (index 4): Laptop repair + Loan-app disbursal Rs 3,000
    if (mIdx === 4) {
      actions.push({
        day: 16,
        narration: "UPI/LAPTOP REPAIR/CAMPUS LAB",
        amount_paise: 300000,
        type: "DR",
      });
      actions.push({
        day: 20,
        narration: "UPI/KREDITBEE/DISBURSAL",
        amount_paise: 300000,
        type: "CR",
      });
    }

    // Repayment in month 6 (index 5) on the 4th: Rs 3,150
    if (mIdx === 5) {
      actions.push({
        day: 4,
        narration: "UPI/KREDITBEE/REPAYMENT",
        amount_paise: 315000,
        type: "DR",
      });
    }

    // Food delivery debits
    const foodDays = mIdx === 5 ? [2, 7, 13, 22] : [2, 7, 13, 17, 22, 28];
    foodDays.forEach((fd) => {
      actions.push({
        day: fd,
        narration: `UPI/SWIGGY/ORDER_${Math.floor(1000 + rand() * 9000)}`,
        amount_paise: Math.round((180 + Math.floor(rand() * 60)) * 100),
        type: "DR",
      });
    });

    // Groceries (4 debits per month)
    const grocDays = [6, 15, 21, 26];
    grocDays.forEach((gd) => {
      actions.push({
        day: gd,
        narration: "UPI/LOCAL KIRANA/JAIPUR",
        amount_paise: Math.round((150 + Math.floor(rand() * 40)) * 100),
        type: "DR",
      });
    });

    // Transport (5 debits per month)
    const transDays = [4, 10, 16, 23, 29];
    transDays.forEach((td) => {
      actions.push({
        day: td,
        narration: "UPI/AUTO RIKSHAW/JAIPUR",
        amount_paise: Math.round((40 + Math.floor(rand() * 30)) * 100),
        type: "DR",
      });
    });

    // Academic books in months 0 to 4 (scaled to keep mid-month balance healthy)
    if (mIdx < 4) {
      actions.push({
        day: 19,
        narration: "UPI/CAMPUS BOOKSTORE/TEXTBOOKS",
        amount_paise: 110000,
        type: "DR",
      });
    }

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

    // On day 30, tune end-of-month balance to stay strictly in [105,000, 125,000] paise (Rs 1,050 to Rs 1,250)
    const targetEnd = Math.round((1100 + Math.floor(rand() * 120)) * 100);
    const diff = balance - targetEnd;
    if (diff > 2000) {
      balance = targetEnd;
      transactions.push({
        date: `${monthStr}-${m.days}`,
        narration: "UPI/COMMERCE STUDY MATERIAL/XEROX",
        amount_paise: diff,
        type: "DR",
        balance_paise: balance,
      });
    } else if (diff < -2000) {
      const topUp = Math.abs(diff);
      balance = targetEnd;
      transactions.push({
        date: `${monthStr}-${m.days}`,
        narration: "UPI/POOJA GUPTA/TUITION CASHBACK",
        amount_paise: topUp,
        type: "CR",
        balance_paise: balance,
      });
    }
  });

  return transactions;
}

export function transactionsToCSV(txs: RawTransaction[]): string {
  const header = "date,narration,amount_paise,type,balance_paise\n";
  const rows = txs.map(
    (t) => `${t.date},"${t.narration.replace(/"/g, '""')}",${t.amount_paise},${t.type},${t.balance_paise}`
  );
  return header + rows.join("\n");
}
