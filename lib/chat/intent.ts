import { ChatContext } from "./types";

// Deterministic investment advice regex filter (retained from original for 100% test compatibility)
export const INVESTMENT_ADVICE_REGEX =
  /\b(buy|sell|invest\s+in|stock|crypto|bitcoin|mutual\s+fund\s+pick|which\s+is\s+best\s+to\s+invest|share\s+market|multibagger|trading\s+tip|nifty|sensex)\b/i;

export function checkInvestmentAdviceIntent(query: string): boolean {
  return INVESTMENT_ADVICE_REGEX.test(query);
}

export function isHinglishQuery(query: string): boolean {
  const hinglishWords = [
    /\bmera\b/i,
    /\bmeri\b/i,
    /\bmere\b/i,
    /\bkya\b/i,
    /\bkab\b/i,
    /\bkaise\b/i,
    /\bkahan\b/i,
    /\bkitna\b/i,
    /\bkitni\b/i,
    /\bhai\b/i,
    /\bhain\b/i,
    /\bhota\b/i,
    /\bhoti\b/i,
    /\bbatao\b/i,
    /\bpaisa\b/i,
    /\bpaise\b/i,
    /\bkharcha\b/i,
    /\bkharch\b/i,
    /\bkarna\b/i,
    /\bdena\b/i,
    /\baaya\b/i,
    /\baaye\b/i,
    /\bzyada\b/i,
    /\bkam\b/i,
    /\bchahiye\b/i,
  ];
  return hinglishWords.some((rx) => rx.test(query));
}

export function isSensitiveCredentialsQuery(query: string): boolean {
  const q = query.toLowerCase();
  // Asking what to do with OTP or expressing someone asked for OTP
  if (
    /someone\s+(called|asked|asking|sent|calling).*(otp|pin|password|cvv)/i.test(q) ||
    /otp\s*(manga|pucha|mang\s*raha|bataun|du\s*kya)/i.test(q) ||
    /asking\s+for\s+my\s+otp/i.test(q) ||
    /should\s+i\s+(give|share|tell).*(otp|pin|password)/i.test(q)
  ) {
    return true;
  }
  // Containing actual credentials
  if (
    /\b(my\s+)?(otp|pin|password|cvv)\s*(is|hai|:)?\s*\d{4,8}\b/i.test(q) ||
    /\b\d{4}\s*\d{4}\s*\d{4}\s*\d{4}\b/.test(q) || // 16 digit card
    /\b\d{4}\s*\d{4}\s*\d{4}\b/.test(q) // 12 digit Aadhaar
  ) {
    return true;
  }
  return false;
}

export function isOutOfScopeQuery(query: string): boolean {
  const q = query.toLowerCase();
  // Cricket, jokes, weather, general movies, coding
  const outOfScopePatterns = [
    /\b(joke|funny|laugh)\b/i,
    /\b(cricket|ipl|kohli|dhoni|rohit|football|messi|ronaldo)\b/i,
    /\b(weather|temperature|rain|barish)\b/i,
    /\b(python|javascript|typescript|c\+\+|java|react|html|css|sql|write\s+code|debug\s+code)\b/i,
    /\b(recipe|biryani|pizza|cook|food\s+recipe)\b/i,
    /\b(movie|cinema|actor|actress|song|lyrics)\b/i,
    /\b(politics|election|modi|rahul|minister|vote)\b/i,
  ];
  return outOfScopePatterns.some((rx) => rx.test(q));
}

export type DetectedIntent =
  | "INVESTMENT_ADVICE_REFUSAL"
  | "HIGH_DEBT_REFUSAL"
  | "SENSITIVE_CREDENTIALS_ALERT"
  | "OUT_OF_SCOPE"
  | "HEALTH_SCORE_CALCULATION"
  | "CREDIT_LIMIT_AND_DUE_DATE"
  | "CREDIT_LIMIT_ONLY"
  | "DUE_DATE_ONLY"
  | "TOP_SPENDING_CATEGORY"
  | "UPLOAD_STATEMENT_GUIDE"
  | "RESET_PRIYA_STATEMENT"
  | "JUDGE_LENS_EXPLANATION"
  | "DEMO_STUDENT_BANNER_EXPLANATION"
  | "PAGE_OVERVIEW_GUIDE"
  | "WHERE_TO_FIND_FEATURE"
  | "DRAW_COST_EXPLANATION"
  | "SLIP_LADDER_LATE_FEES"
  | "BUREAU_REPORTING_EXPLANATION"
  | "NET_CASH_FLOW_METRICS"
  | "CASH_FLOW_CONSISTENCY"
  | "SIP_CONCEPT"
  | "SIP_RISK_FOLLOWUP"
  | "CREDIT_SCORE_CONCEPT"
  | "EMERGENCY_FUND_CONCEPT"
  | "COMPOUNDING_CONCEPT"
  | "DIVERSIFICATION_CONCEPT"
  | "UPI_PIN_SAFETY"
  | "FAKE_KYC_SMS"
  | "UNAUTHORIZED_DEBIT"
  | "RBI_OMBUDSMAN"
  | "BANK_COMPLAINT_PROCESS"
  | "SEBI_SCORES"
  | "EMI_CONCEPT"
  | "MUTUAL_FUNDS_CONCEPT"
  | "PPF_CONCEPT"
  | "DEPOSIT_INSURANCE"
  | "GENERAL_HELP";

export function detectIntent(query: string, context: ChatContext = {}): DetectedIntent {
  const q = query.trim().toLowerCase();

  // 1. High Debt Solicitation Pre-filter
  if (/should\s+i\s+take\s+(a\s+)?(bigger|larger|more)\s+loan/i.test(q)) {
    return "HIGH_DEBT_REFUSAL";
  }

  // 2. Investment Advice Pre-filter
  if (checkInvestmentAdviceIntent(query)) {
    return "INVESTMENT_ADVICE_REFUSAL";
  }

  // 3. Sensitive Credentials / OTP Alarm
  if (isSensitiveCredentialsQuery(query)) {
    return "SENSITIVE_CREDENTIALS_ALERT";
  }

  // 4. Out of Scope Check
  if (isOutOfScopeQuery(query)) {
    return "OUT_OF_SCOPE";
  }

  // 5. Multi-turn Follow-up Resolution via History
  const history = context.history || [];
  const lastUserMsg = [...history].reverse().find((m) => m.sender === "user")?.text.toLowerCase() || "";
  const lastBotMsg = [...history].reverse().find((m) => m.sender === "ascend")?.text.toLowerCase() || "";

  if (
    /is\s+(it|this)\s+(risky|safe)/i.test(q) ||
    /kitna\s+(risk|khatra)\s+hai/i.test(q) ||
    /risk\s+kya\s+hai/i.test(q)
  ) {
    if (lastUserMsg.includes("sip") || lastBotMsg.includes("systematic investment plan") || lastBotMsg.includes("sip")) {
      return "SIP_RISK_FOLLOWUP";
    }
  }

  // 6. Financial Health Score Calculation
  if (
    /(how|kaise).*score.*(calculated|determine|formula|compute|nikala|bana)/i.test(q) ||
    /score.*(breakdown|pillars|components|calculation|weights)/i.test(q) ||
    /financial\s+health\s+score\s+(kya\s+hai|kaise)/i.test(q) ||
    q === "how is my score calculated?" ||
    q === "how is my score calculated" ||
    q === "how is my financial health score calculated?" ||
    q === "how is my financial health score calculated"
  ) {
    return "HEALTH_SCORE_CALCULATION";
  }

  // 7. Credit Limit and Due Date combined
  if (
    (q.includes("limit") && (q.includes("due") || q.includes("repay"))) ||
    q.includes("limit and when is repayment due") ||
    q.includes("limit aur due date")
  ) {
    return "CREDIT_LIMIT_AND_DUE_DATE";
  }

  // 8. Due Date Only
  if (
    /(when|kab).*(repayment|payment|due|bhar.*hai|pay.*hai)/i.test(q) ||
    q.includes("due date") ||
    q.includes("repayment due") ||
    q.includes("kab pay karna hai") ||
    q.includes("mera repayment kab due hai") ||
    q.includes("when to repay")
  ) {
    return "DUE_DATE_ONLY";
  }

  // 9. Credit Limit Only
  if (
    /(what|kitni|kitna).*(credit\s*limit|limit|borrow)/i.test(q) ||
    q.includes("my credit limit") ||
    q.includes("credit limit kya hai") ||
    q.includes("how much can i borrow")
  ) {
    return "CREDIT_LIMIT_ONLY";
  }

  // 10. Top Spending Category
  if (
    /(which|kahan|kisme|sabse\s*zyada).*category.*(spend|spent|kharch|outflow)/i.test(q) ||
    /spent\s+the\s+most/i.test(q) ||
    /highest\s+(expense|spending|outflow)/i.test(q) ||
    /top\s+(spending\s+)?category/i.test(q) ||
    q.includes("sabse zyada kharcha") ||
    q.includes("kahan pe kharcha zyada hua")
  ) {
    return "TOP_SPENDING_CATEGORY";
  }

  // 11. Upload / Switch Bank Statement
  if (
    /(how|kaise).*upload.*statement/i.test(q) ||
    /upload.*(different|new|another|bank)\s*statement/i.test(q) ||
    /statement.*(kaise\s*upload|change|switch)/i.test(q) ||
    q.includes("upload statement") ||
    q.includes("upload a statement") ||
    q.includes("upload a different bank statement")
  ) {
    return "UPLOAD_STATEMENT_GUIDE";
  }

  // 12. Reset to Priya Statement
  if (/reset\s+to\s+priya/i.test(q) || /who\s+is\s+priya/i.test(q) || /priya\s+(sharma|statement|demo)/i.test(q)) {
    return "RESET_PRIYA_STATEMENT";
  }

  // 13. Judge Lens
  if (
    /judge\s*lens/i.test(q) ||
    q.includes("what does judge lens do") ||
    q.includes("judge lens kya hai")
  ) {
    return "JUDGE_LENS_EXPLANATION";
  }

  // 14. Synthetic Demo Student & Prototype Banner
  if (
    /synthetic\s+demo\s+student/i.test(q) ||
    /what\s+does\s+prototype\s+mean/i.test(q) ||
    /demo\s+student\s+banner/i.test(q)
  ) {
    return "DEMO_STUDENT_BANNER_EXPLANATION";
  }

  // 15. Where to find X / Navigation
  if (
    /where\s+(do\s+i\s+find|is|can\s+i\s+see)/i.test(q) ||
    /kahan\s+(milega|hai|dekh\s*sakte)/i.test(q)
  ) {
    return "WHERE_TO_FIND_FEATURE";
  }

  // 16. What does [Page] do / Page Overview
  if (
    /what\s+does.*(page|overview|cashflow|spending|simulator|assess|learn).*do/i.test(q) ||
    /explain.*(page|overview|cashflow|spending|categories)/i.test(q)
  ) {
    return "PAGE_OVERVIEW_GUIDE";
  }

  // 17. Draw Cost / Interest
  if (
    /draw\s*(300|500|₹300|₹500|\d+)/i.test(q) ||
    /what\s+happens\s+if\s+i\s+draw/i.test(q) ||
    /cost.*(draw|borrow|credit)/i.test(q)
  ) {
    return "DRAW_COST_EXPLANATION";
  }

  // 18. Slip Ladder / Late Fees / Missed Repayment
  if (
    /late\s*fee/i.test(q) ||
    /miss(ed)?\s*(repayment|payment|due)/i.test(q) ||
    /slip\s*ladder/i.test(q) ||
    /what\s+if\s+i\s+pay\s+late/i.test(q)
  ) {
    return "SLIP_LADDER_LATE_FEES";
  }

  // 19. Bureau Reporting
  if (/bureau/i.test(q) || /cibil/i.test(q) || /experian/i.test(q) || /report.*credit\s*score/i.test(q)) {
    return "BUREAU_REPORTING_EXPLANATION";
  }

  // 20. Net Cash Flow & Savings
  if (/net\s*cash\s*flow/i.test(q) || /how\s*much.*(save|saved|surplus|deficit)/i.test(q)) {
    return "NET_CASH_FLOW_METRICS";
  }

  // 21. Multi-month Consistency
  if (/months.*(positive|surplus|consistency)/i.test(q)) {
    return "CASH_FLOW_CONSISTENCY";
  }

  // 22. Specific Personal Finance Literacy Concepts
  if (/what\s+is\s+(a\s+)?sip/i.test(q) || q.includes("systematic investment plan") || q.includes("sip kya hai")) {
    return "SIP_CONCEPT";
  }

  if (/what\s+is\s+(a\s+)?credit\s*score/i.test(q) || q.includes("credit score kya hai")) {
    return "CREDIT_SCORE_CONCEPT";
  }

  if (/emergency\s*fund/i.test(q)) {
    return "EMERGENCY_FUND_CONCEPT";
  }

  if (/compounding/i.test(q)) {
    return "COMPOUNDING_CONCEPT";
  }

  if (/diversification/i.test(q) || /diversif/i.test(q)) {
    return "DIVERSIFICATION_CONCEPT";
  }

  if (/upi\s*pin/i.test(q) || /pin.*(receive|receive\s*money|cashback)/i.test(q)) {
    return "UPI_PIN_SAFETY";
  }

  if (/kyc/i.test(q) && (q.includes("sms") || q.includes("blocked") || q.includes("fake"))) {
    return "FAKE_KYC_SMS";
  }

  if (/unauthorized\s*(debit|transaction|withdrawal)/i.test(q) || /cybercrime/i.test(q) || /1930/i.test(q)) {
    return "UNAUTHORIZED_DEBIT";
  }

  if (/ombudsman/i.test(q) || /rb-ios/i.test(q)) {
    return "RBI_OMBUDSMAN";
  }

  if (/complaint/i.test(q) && (q.includes("bank") || q.includes("cms"))) {
    return "BANK_COMPLAINT_PROCESS";
  }

  if (/sebi\s*scores/i.test(q) || /scores\s*portal/i.test(q)) {
    return "SEBI_SCORES";
  }

  if (/emi/i.test(q) || /no\s*cost\s*emi/i.test(q)) {
    return "EMI_CONCEPT";
  }

  if (/mutual\s*fund/i.test(q) || /equity\s*vs\s*debt/i.test(q)) {
    return "MUTUAL_FUNDS_CONCEPT";
  }

  if (/ppf/i.test(q) || /public\s*provident\s*fund/i.test(q)) {
    return "PPF_CONCEPT";
  }

  if (/deposit\s*insurance/i.test(q) || /dicgc/i.test(q) || /bank\s*safe/i.test(q)) {
    return "DEPOSIT_INSURANCE";
  }

  return "GENERAL_HELP";
}
