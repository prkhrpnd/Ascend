import { ParsedTransaction, Category } from "./types";
import { CATEGORY_RULES } from "./rules";

export function classifyTransaction(t: ParsedTransaction): ParsedTransaction {
  const upperNarration = t.narration.toUpperCase();

  for (const rule of CATEGORY_RULES) {
    if (rule.type === t.type) {
      for (const kw of rule.keywords) {
        if (upperNarration.includes(kw)) {
          return {
            ...t,
            category: rule.category,
            source: "rule",
            confidence: rule.confidence,
            isLoanApp: rule.category === "loan_app_inflow" || rule.category === "loan_app_repayment",
          };
        }
      }
    }
  }

  return {
    ...t,
    category: "unknown",
    source: "rule",
    confidence: 0,
    isLoanApp: false,
  };
}

export function classifyAllTransactions(transactions: ParsedTransaction[]): ParsedTransaction[] {
  return transactions.map((t) => classifyTransaction(t));
}
