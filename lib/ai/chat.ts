export interface ChatContext {
  limitPaise?: number;
  availablePaise?: number;
  outstandingPaise?: number;
  dueDay?: number;
  medianIncomePaise?: number;
  cleanCycles?: number;
  historyStrength?: number;
}

export interface ChatResponse {
  answer: string;
  refused: boolean;
  refusalReason?: string;
  source: "prefilter" | "ai" | "template";
}

// Global metric for counting refusals
export let TOTAL_REFUSALS_COUNT = 0;

// Deterministic investment advice regex filter
const INVESTMENT_ADVICE_REGEX = /\b(buy|sell|invest\s+in|stock|crypto|bitcoin|mutual\s+fund\s+pick|which\s+is\s+best\s+to\s+invest|share\s+market|multibagger|trading\s+tip|nifty|sensex)\b/i;

export function checkInvestmentAdviceIntent(query: string): boolean {
  return INVESTMENT_ADVICE_REGEX.test(query);
}

export function handleChatQuery(query: string, context: ChatContext = {}): ChatResponse {
  const cleanQ = query.trim();

  // 1. Deterministic Pre-filter
  if (checkInvestmentAdviceIntent(cleanQ)) {
    TOTAL_REFUSALS_COUNT++;
    return {
      answer:
        "Ascend does not provide investment tips, stock selections, cryptocurrency recommendations, or specific financial product advice. Our focus is responsible cash-flow management and starter credit building.\n\nEducation, not investment advice.",
      refused: true,
      refusalReason: "INVESTMENT_ADVICE_ATTEMPT",
      source: "prefilter",
    };
  }

  // 2. High loan recommendation refusal
  if (/should\s+i\s+take\s+(a\s+)?(bigger|larger|more)\s+loan/i.test(cleanQ)) {
    TOTAL_REFUSALS_COUNT++;
    return {
      answer:
        "Ascend never recommends taking more debt than your verified income supports. Borrowing only what your pre-income cash buffer can clear keeps your credit record clean.\n\nEducation, not investment advice.",
      refused: true,
      refusalReason: "HIGH_DEBT_SOLICITATION",
      source: "prefilter",
    };
  }

  // 3. Fallback / Template answers based on engine values
  const qLower = cleanQ.toLowerCase();

  if (qLower.includes("limit") || qLower.includes("how much can i borrow")) {
    const lim = context.limitPaise ? Math.round(context.limitPaise / 100) : 500;
    return {
      answer: `Your verified credit limit is ₹${lim}. This was determined by your cash-flow Day-1 backtest and safety buffer.\n\nEducation, not investment advice.`,
      refused: false,
      source: "template",
    };
  }

  if (qLower.includes("due date") || qLower.includes("when to repay") || qLower.includes("due")) {
    const due = context.dueDay || 3;
    return {
      answer: `Your payment is scheduled 2 days after your main recurring income lands (around the ${due}rd of the month). AutoPay clears this automatically.\n\nEducation, not investment advice.`,
      refused: false,
      source: "template",
    };
  }

  if (qLower.includes("cost") || qLower.includes("interest") || qLower.includes("fee")) {
    return {
      answer:
        "Cycle 1 is interest-free. After cycle 1, interest is 1.5% per 30-day cycle (about 18% a year before compounding). If you pay late, the partner charges a flat ₹50 fee, with no compounding penalty interest. Ascend earns ₹0 from late fees.\n\nEducation, not investment advice.",
      refused: false,
      source: "template",
    };
  }

  if (qLower.includes("draw 300") || qLower.includes("draw ₹300") || qLower.includes("draw 300 rupees")) {
    return {
      answer:
        "If you draw ₹300 in your first cycle, you repay exactly ₹300 on your due date with zero interest. If drawn in later cycles, the 1.5% monthly charge is ₹4.50 (rounded to ₹5).\n\nEducation, not investment advice.",
      refused: false,
      source: "template",
    };
  }

  if (qLower.includes("score") || qLower.includes("bureau") || qLower.includes("history")) {
    return {
      answer:
        "Ascend reports each on-time AutoPay cycle to the credit bureau. After 6 clean cycles and 1 passed stress cycle, your file becomes 'Bureau-ready', unlocking mainstream credit cards and two-wheeler finance.\n\nEducation, not investment advice.",
      refused: false,
      source: "template",
    };
  }

  return {
    answer:
      "I can explain financial terms, answer questions about your verified cash flow, or calculate the exact cost of a potential draw from your Ascend line.\n\nEducation, not investment advice.",
    refused: false,
    source: "template",
  };
}
