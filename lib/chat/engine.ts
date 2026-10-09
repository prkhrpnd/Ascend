import { ChatContext, ChatResponse } from "./types";
import {
  detectIntent,
  isHinglishQuery,
  checkInvestmentAdviceIntent,
  DetectedIntent,
} from "./intent";
import {
  APP_PAGES_KNOWLEDGE,
  HEALTH_SCORE_RULES,
  STARTER_CREDIT_TERMS,
} from "./knowledge";
import { formatPaise } from "@/lib/utils";

// Global metric for counting refusals (tested in engine.test.ts)
export let TOTAL_REFUSALS_COUNT = 0;

export { checkInvestmentAdviceIntent };

export function handleChatQuery(query: string, context: ChatContext = {}): ChatResponse {
  const cleanQ = query.trim();
  const intent = detectIntent(cleanQ, context);
  const isHinglish = isHinglishQuery(cleanQ);

  // Helper values derived from context
  const limitRupees = context.limitPaise ? Math.round(context.limitPaise / 100) : 500;
  const availableRupees = context.availablePaise !== undefined ? Math.round(context.availablePaise / 100) : limitRupees;
  const outstandingRupees = context.outstandingPaise !== undefined ? Math.round(context.outstandingPaise / 100) : 0;
  const dueDay = context.dueDay || 3;
  const primaryIncomeDay = context.primaryIncomeDay || 1;
  const healthScore = context.financialHealthScore?.score ?? 100;
  const healthRating = context.financialHealthScore?.rating ?? "Excellent";

  // 1. Deterministic Investment Advice Pre-filter Refusal
  if (intent === "INVESTMENT_ADVICE_REFUSAL") {
    TOTAL_REFUSALS_COUNT++;
    return {
      answer:
        "Ascend does not provide investment tips, stock selections, cryptocurrency recommendations, or specific financial product advice. Our focus is responsible cash-flow management and starter credit building.\n\nEducation, not investment advice.",
      refused: true,
      refusalReason: "INVESTMENT_ADVICE_ATTEMPT",
      source: "prefilter",
      suggestedChips: ["What is a SIP?", "How is my score calculated?"],
    };
  }

  // 2. High Debt Solicitation Refusal
  if (intent === "HIGH_DEBT_REFUSAL") {
    TOTAL_REFUSALS_COUNT++;
    return {
      answer:
        "Ascend never recommends taking more debt than your verified income supports. Borrowing only what your pre-income cash buffer can clear keeps your credit record clean.\n\nEducation, not investment advice.",
      refused: true,
      refusalReason: "HIGH_DEBT_SOLICITATION",
      source: "prefilter",
      suggestedChips: ["What is my credit limit?", "When is my repayment due?"],
    };
  }

  // 3. Sensitive Credentials / OTP Alarm
  if (intent === "SENSITIVE_CREDENTIALS_ALERT") {
    const text = isHinglish
      ? "Kripya apna OTP, UPI PIN, CVV ya password kisi ke sath bhi share NA karein! Bank officials, customer care ya police kabhi bhi aapse confidential OTP nahi mangte.\n\nAgar aapko fraud ka shak hai:\n1. Turant call disconnect karein.\n2. Apne official banking app me apna card ya UPI block karein.\n3. National Cybercrime Helpline 1930 par call karein ya cybercrime.gov.in par report karein.\n\nMore in the Learn section."
      : "DO NOT share your OTP, UPI PIN, CVV, or passwords with anyone! Legitimate bank employees, customer service representatives, and law enforcement will NEVER ask for your OTP under any circumstances.\n\nIf you suspect an attempted scam:\n1. Disconnect the call immediately.\n2. Block your debit card or UPI access inside your official banking app.\n3. Report the incident immediately to the national cybercrime helpline at 1930 or visit cybercrime.gov.in.\n\nMore in the Learn section.";

    return {
      answer: text,
      refused: false,
      source: "template",
      suggestedChips: ["What is UPI PIN safety?", "How to file a bank complaint?"],
    };
  }

  // 4. Out of Scope Handling
  if (intent === "OUT_OF_SCOPE") {
    return {
      answer:
        "I focus specifically on helping you navigate the Ascend app and learning foundational personal finance concepts. I can't assist with cricket jokes or unrelated topics, but I'd be glad to help you explore:\n\n• How your Financial Health Score is calculated\n• Understanding your cash flow, starter credit line, or repayment due dates",
      refused: false,
      source: "template",
      suggestedChips: ["How is my score calculated?", "What is my credit limit?"],
    };
  }

  // 5. Financial Health Score Calculation
  if (intent === "HEALTH_SCORE_CALCULATION") {
    const scorePrefix = context.financialHealthScore?.score !== undefined
      ? `Your current verified Financial Health Score is ${healthScore}/100 (${healthRating}). `
      : "Your Financial Health Score is evaluated out of 100 based on 4 transparent, deterministic pillars: ";

    const answer = isHinglish
      ? `${scorePrefix}Yeh score 4 components par compute hota hai:\n\n1. Cash Flow Surplus (Up to 35 pts): Mahine ke end me bacha hua net surplus aur savings rate (≥20% savings par full 35 pts).\n2. Fixed Obligation Ratio (Up to 25 pts): Rent aur regular bills ka total inflow se anupaat (≤40% par full 25 pts).\n3. Period Consistency (Up to 25 pts): Kitne mahino me positive cash flow raha.\n4. Spending Discipline (Up to 15 pts): Untraceable cash withdrawals ka low rehna (<10% par full 15 pts).\n\nRatings: Excellent (80+), Good (65-79), Fair (50-64), Needs Attention (<50).`
      : `${scorePrefix}It is calculated deterministically using the following 4 code-verified pillars:\n\n1. Cash Flow Surplus (Up to 35 points): Evaluates net operating surplus and savings retention. Retaining ≥20% of inflows awards the full 35 points; ≥10% awards 28 points; positive surplus awards 20 points; break-even awards 14 points; mild deficit (<15%) awards 8 points; and high deficit awards 0 points.\n\n2. Fixed Obligation Ratio (Up to 25 points): Checks recurring fixed commitments (hostel rent, utilities) relative to inflows. If fixed commitments consume ≤40% of income, full 25 points; ≤60% awards 18 points; ≤80% awards 10 points; and >80% awards 4 points.\n\n3. Period Consistency (Up to 25 points): Calculated as (months with positive cash flow / total statement months) × 25 points.\n\n4. Spending Discipline (Up to 15 points): Rewards digital traceability. Cash withdrawals <10% of total debits earn 15 points; <25% earn 10 points; and ≥25% earn 5 points.\n\nRatings: Excellent (80-100), Good (65-79), Fair (50-64), Needs Attention (<50).`;

    return {
      answer,
      refused: false,
      source: "template",
      suggestedChips: ["What is my credit limit?", "Which category did I spend the most on?"],
    };
  }

  // 6. Credit Limit and Due Date combined
  if (intent === "CREDIT_LIMIT_AND_DUE_DATE") {
    const answer = isHinglish
      ? `Aapki verified credit limit ₹${limitRupees} hai. Aapka repayment har mahine ki ${dueDay}rd tarikh ko due hota hai (aapki allowance Day ${primaryIncomeDay} ko aane ke +2 din baad). Cycle 1 poori tarah se interest-free hai aur AutoPay ke zariye automatically clear hota hai.\n\nEducation, not investment advice.`
      : `Your verified credit limit is ₹${limitRupees}, determined by your cash-flow Day-1 backtest and safety buffer. Your repayment is scheduled on Day ${dueDay} of the month (calibrated exactly +2 days after your main recurring income lands on Day ${primaryIncomeDay}). Cycle 1 is interest-free and AutoPay clears this automatically.\n\nEducation, not investment advice.`;

    return {
      answer,
      refused: false,
      source: "template",
      suggestedChips: ["What happens if I draw ₹300?", "How is my score calculated?"],
    };
  }

  // 7. Due Date Only
  if (intent === "DUE_DATE_ONLY") {
    const answer = isHinglish
      ? `Aapka starter credit line repayment har mahine ki ${dueDay}rd tarikh ko due hota hai (aapki monthly allowance aane ke 2 din baad). Cycle 1 poori tarah se interest-free hai. AutoPay ke zariye yeh repayment automatically process ho jata hai.\n\nEducation, not investment advice.`
      : `Your payment is scheduled 2 days after your main recurring income lands (around Day ${dueDay} of the month). AutoPay clears this automatically on your due date, protecting your credit history.\n\nEducation, not investment advice.`;

    return {
      answer,
      refused: false,
      source: "template",
      suggestedChips: ["What is my credit limit?", "What happens if I draw ₹300?"],
    };
  }

  // 8. Credit Limit Only
  if (intent === "CREDIT_LIMIT_ONLY") {
    const answer = isHinglish
      ? `Aapki verified starter credit limit ₹${limitRupees} hai. Yeh limit aapke bank statement cash flow aur pre-income safety buffer ke adhar par decide hui hai.\n\nEducation, not investment advice.`
      : `Your verified credit limit is ₹${limitRupees}. This was deterministically calibrated by your Day-1 cash flow backtest to ensure repayments fit comfortably within your income buffer.\n\nEducation, not investment advice.`;

    return {
      answer,
      refused: false,
      source: "template",
      suggestedChips: ["When is my repayment due?", "What happens if I draw ₹300?"],
    };
  }

  // 9. Top Spending Category
  if (intent === "TOP_SPENDING_CATEGORY") {
    if (context.topCategory && context.topCategory.label) {
      const topAmt = formatPaise(context.topCategory.amountPaise);
      const answer = isHinglish
        ? `Aapka sabse bada kharcha '${context.topCategory.label}' category me hua hai, jo kul debits ka ${context.topCategory.percent}% (${topAmt}) hai. Aap Spending Analysis page par iska pura breakdown dekh sakte hain.`
        : `You spent the most on '${context.topCategory.label}', which accounts for ${context.topCategory.percent}% of your total statement debits (${topAmt}). You can explore the full breakdown on the Spending Analysis page.`;

      return {
        answer,
        refused: false,
        source: "template",
        suggestedChips: ["What is my net cash flow?", "View Expense Categories"],
      };
    }

    return {
      answer:
        "In the active benchmark statement (Priya Sharma), 'Hostel & Rent' represents the highest outflow at 58% of all statement debits (₹14,500 total). You can check your own category totals on the Spending Analysis page.",
      refused: false,
      source: "template",
      suggestedChips: ["What is my net cash flow?", "View Expense Categories"],
    };
  }

  // 10. Upload / Switch Bank Statement Guide
  if (intent === "UPLOAD_STATEMENT_GUIDE") {
    const answer = isHinglish
      ? `Dusra bank statement upload karne ke liye:\n1. Top navigation bar me 'Bank Statements' page (/statements) par jayein.\n2. Apna 6-month bank statement CSV file (max 2 MB) upload box me drag & drop karein ya browse karein.\n3. File preview me pehle 5 transactions check karein aur 'Confirm & Ingest Statement' par click karein.\n\nAap jab chahein 'Reset to Priya Statement' par click karke default benchmark data bhi wapas la sakte hain.`
      : `To upload or switch to a different bank statement:\n\n1. Navigate to the 'Bank Statements' page (/statements) using the top navigation bar.\n2. Drag and drop any 6-month bank statement CSV file (up to 2 MB) into the uploader card.\n3. Review the column mapping and first 5 sample transactions in the preview card, then click 'Confirm & Ingest Statement'.\n\nAscend verifies balance continuity across SBI, HDFC, ICICI, Axis, Kotak, and other standard formats. You can also click 'Reset to Priya Statement' anytime to reload the benchmark student file.`;

    return {
      answer,
      refused: false,
      source: "template",
      suggestedChips: ["How is my score calculated?", "What is my credit limit?"],
    };
  }

  // 11. Reset to Priya Statement
  if (intent === "RESET_PRIYA_STATEMENT") {
    return {
      answer:
        "'Reset to Priya Statement' reloads the pre-configured 6-month benchmark statement of Priya Sharma, a final-year engineering student at JECRC. It populates realistic Indian student cash flows (monthly family allowance, hostel rent, mess fees, food delivery, and UPI transactions) so you can test all underwriting, cash flow, and simulator features instantly.",
      refused: false,
      source: "template",
      suggestedChips: ["How is my score calculated?", "What is my credit limit?"],
    };
  }

  // 12. Judge Lens Explanation
  if (intent === "JUDGE_LENS_EXPLANATION") {
    const answer = isHinglish
      ? `Judge Lens ek regulatory compliance aur architectural defense overlay hai (screen ke bottom-left floating badge par click karke khulta hai). Yeh vishesh roop se evaluators aur competition judges ke liye banaya gaya hai taaki har screen ke regulatory constraints aur defense notes ko inspect kiya ja sake.`
      : `Judge Lens is an evaluator and compliance inspection overlay (accessed via the floating badge at the bottom-left of the screen). Built specifically for hackathon and fintech competition judges, it highlights the hard regulatory constraints, architectural decisions, and verification checklists relevant to whichever screen you are currently viewing.`;

    return {
      answer,
      refused: false,
      source: "template",
      suggestedChips: ["What is the Starter Credit Line?", "How is my score calculated?"],
    };
  }

  // 13. Synthetic Demo Student Banner & Prototype Explanation
  if (intent === "DEMO_STUDENT_BANNER_EXPLANATION") {
    return {
      answer:
        "The 'Synthetic Demo Student: Priya Sharma' top banner indicates that the application is operating with a pre-configured synthetic profile. This allows evaluators and students to safely test all cash flow analytics and credit simulations without uploading sensitive personal documents. 'Prototype' confirms that Ascend is an educational fintech technology prototype demonstrating responsible underwriting, not an active RBI-licensed bank taking public deposits.",
      refused: false,
      source: "template",
      suggestedChips: ["What does Judge Lens do?", "How do I upload a statement?"],
    };
  }

  // 14. Where to Find Feature
  if (intent === "WHERE_TO_FIND_FEATURE") {
    const qLower = cleanQ.toLowerCase();
    for (const [key, page] of Object.entries(APP_PAGES_KNOWLEDGE)) {
      if (qLower.includes(key) || qLower.includes(page.navLabel.toLowerCase())) {
        return {
          answer: `You can find the ${page.title} on the '${page.navLabel}' page (${page.path}). ${page.howToFind}`,
          refused: false,
          source: "template",
          suggestedChips: ["Overview", "Bank Statements"],
        };
      }
    }

    return {
      answer:
        "You can find all features via the top navigation bar: 'Overview' (/), 'Bank Statements' (/statements), 'Spending Analysis' (/spending), 'Expense Categories' (/categories), 'Cash Flow' (/cashflow), 'Learn' (/learn), and 'Starter Credit Line' (/line, /assess, /simulator, /score).",
      refused: false,
      source: "template",
      suggestedChips: ["Overview", "Bank Statements"],
    };
  }

  // 15. Page Overview Guide
  if (intent === "PAGE_OVERVIEW_GUIDE") {
    const qLower = cleanQ.toLowerCase();
    for (const [key, page] of Object.entries(APP_PAGES_KNOWLEDGE)) {
      if (qLower.includes(key) || qLower.includes(page.navLabel.toLowerCase())) {
        return {
          answer: `**${page.title}** (${page.path}):\n\n${page.summary}\n\nTo view it: ${page.howToFind}`,
          refused: false,
          source: "template",
          suggestedChips: ["How is my score calculated?", "What is my credit limit?"],
        };
      }
    }

    return {
      answer:
        "Ascend includes dedicated pages for: Overview (health score & snapshot), Bank Statements (CSV upload & verification), Spending Analysis (donut and bar charts), Expense Categories (18 categories & transparent rules), Cash Flow (allowance rhythm), Learn (flashcards), and Starter Credit Line (revolving line & backtest simulator).",
      refused: false,
      source: "template",
      suggestedChips: ["Overview", "Bank Statements"],
    };
  }

  // 16. Draw Cost / Borrowing Explanation
  if (intent === "DRAW_COST_EXPLANATION") {
    return {
      answer:
        "If you draw ₹300 in your first cycle, you repay exactly ₹300 on your due date with zero interest. If drawn in subsequent cycles, interest is 1.5% per 30-day cycle (~₹4.50, rounded to ₹5). If you pay late, the partner charges a flat ₹50 fee with zero compounding penalty interest. Ascend earns ₹0 from late fees.\n\nEducation, not investment advice.",
      refused: false,
      source: "template",
      suggestedChips: ["When is my repayment due?", "What is my credit limit?"],
    };
  }

  // 17. Slip Ladder & Late Fees
  if (intent === "SLIP_LADDER_LATE_FEES") {
    return {
      answer:
        "If your allowance arrives late, Ascend offers a structured slip ladder instead of predatory collection. You can Shift your Due Date by +7 days, or Split the balance into 2 smaller installments. If a payment is missed, the partner charges a flat ₹50 fee with no compounding penalty interest, and Ascend never contacts friends, parents, or colleges.\n\nEducation, not investment advice.",
      refused: false,
      source: "template",
      suggestedChips: ["When is my repayment due?", "What is my credit limit?"],
    };
  }

  // 18. Bureau Reporting Explanation
  if (intent === "BUREAU_REPORTING_EXPLANATION") {
    return {
      answer:
        "Ascend reports each on-time AutoPay cycle to licensed credit bureaus. After 6 clean cycles and 1 passed stress cycle with utilization under 50%, your profile becomes 'Bureau-ready', helping you unlock mainstream credit cards, tenancy lease approvals, and two-wheeler finance.\n\nEducation, not investment advice.",
      refused: false,
      source: "template",
      suggestedChips: ["How is my score calculated?", "What is my credit limit?"],
    };
  }

  // 19. Net Cash Flow Metrics
  if (intent === "NET_CASH_FLOW_METRICS") {
    if (context.netCashFlowPaise !== undefined) {
      const netStr = formatPaise(context.netCashFlowPaise);
      const sign = context.netCashFlowPaise >= 0 ? "+" : "";
      return {
        answer: `Your verified net cash flow across this statement period is ${sign}${netStr} (savings retention rate: ${context.savingsRatePercent || 0}%). Inflows totaled ${context.totalInflowPaise ? formatPaise(context.totalInflowPaise) : "₹0"} against ${context.totalOutflowPaise ? formatPaise(context.totalOutflowPaise) : "₹0"} in debits.`,
        refused: false,
        source: "template",
        suggestedChips: ["Which category did I spend the most on?", "How is my score calculated?"],
      };
    }

    return {
      answer:
        "In the active Priya demo statement, net cash flow is positive at +₹2,100 across 6 months (8% savings rate). Total credits were ₹1,68,000 and total outflows were ₹1,65,900.",
      refused: false,
      source: "template",
      suggestedChips: ["Which category did I spend the most on?", "How is my score calculated?"],
    };
  }

  // 20. Multi-month Cash Flow Consistency
  if (intent === "CASH_FLOW_CONSISTENCY") {
    const posMonths = context.positiveMonthsCount || 5;
    const totMonths = context.totalMonthsCount || 6;
    return {
      answer: `You maintained positive cash flow in ${posMonths} of your ${totMonths} analyzed statement months. This contributes directly to the Period Consistency pillar of your Financial Health Score.`,
      refused: false,
      source: "template",
      suggestedChips: ["How is my score calculated?", "What is my credit limit?"],
    };
  }

  // 21. SIP Concept
  if (intent === "SIP_CONCEPT") {
    return {
      answer:
        "A Systematic Investment Plan (SIP) allows you to invest a fixed sum into a mutual fund scheme at regular intervals (such as monthly). This automates investing discipline and averages out purchase costs over market cycles through rupee cost averaging. Students can begin investing with small amounts from allowances without needing to time day-to-day market movements. More in the Learn section.\n\nEducation, not investment advice.",
      refused: false,
      source: "template",
      suggestedChips: ["Is a SIP risky?", "What is compounding?"],
    };
  }

  // 22. SIP Risk Follow-up (Multi-turn)
  if (intent === "SIP_RISK_FOLLOWUP") {
    return {
      answer:
        "A SIP is an investment method, not a guaranteed return product. Because it invests into mutual funds, it carries market risk depending on the underlying assets: equity funds fluctuate with share prices, while debt funds focus on lower-volatility bonds. Investing regularly through a SIP reduces timing risk, but your capital is not completely risk-free. More in the Learn section.\n\nEducation, not investment advice.",
      refused: false,
      source: "template",
      suggestedChips: ["What is compounding?", "What is an emergency fund?"],
    };
  }

  // 23. Credit Score Concept
  if (intent === "CREDIT_SCORE_CONCEPT") {
    return {
      answer:
        "A credit score is a 3-digit number (typically ranging from 300 to 900) calculated by licensed credit bureaus based on your repayment track record. A higher score reflects consistent, timely repayment of borrowing obligations. Under RBI regulations, every citizen is entitled to one free full credit report per year from each licensed credit bureau. More in the Learn section.",
      refused: false,
      source: "template",
      suggestedChips: ["How is my score calculated?", "What is my credit limit?"],
    };
  }

  // 24. Emergency Fund Concept
  if (intent === "EMERGENCY_FUND_CONCEPT") {
    return {
      answer:
        "An emergency fund is money kept strictly in liquid, easily accessible forms (such as a savings account or liquid mutual fund) to cover unexpected urgent costs like medical emergencies or sudden income disruptions. Advisors typically recommend keeping 3 to 6 months of basic living expenses. Having this buffer prevents you from relying on high-cost loans during crises. More in the Learn section.",
      refused: false,
      source: "template",
      suggestedChips: ["What is compounding?", "What is a SIP?"],
    };
  }

  // 25. Compounding Concept
  if (intent === "COMPOUNDING_CONCEPT") {
    return {
      answer:
        "Compounding occurs when your investment returns begin generating their own returns over time. The longer money stays invested, the steeper the exponential growth curve becomes, making time more impactful than the starting capital amount. Starting early as a student gives compounding decades to work in your favor. More in the Learn section.\n\nEducation, not investment advice.",
      refused: false,
      source: "template",
      suggestedChips: ["What is a SIP?", "What is an emergency fund?"],
    };
  }

  // 26. Diversification Concept
  if (intent === "DIVERSIFICATION_CONCEPT") {
    return {
      answer:
        "Diversification means spreading your investment money across different assets, companies, and sectors rather than betting on a single stock or crypto asset. If one company struggles, gains from other investments cushion your overall portfolio from steep losses, preserving your financial stability. More in the Learn section.\n\nEducation, not investment advice.",
      refused: false,
      source: "template",
      suggestedChips: ["What is a SIP?", "What is compounding?"],
    };
  }

  // 27. UPI PIN Safety
  if (intent === "UPI_PIN_SAFETY") {
    return {
      answer:
        "You NEVER need to enter your UPI PIN to receive money or collect cashbacks. Entering your UPI PIN is solely required when authorizing money to leave your bank account. If anyone asks you to scan a QR code or enter your PIN to receive money, it is an attempted fraud. More in the Learn section.",
      refused: false,
      source: "template",
      suggestedChips: ["How to report UPI fraud?", "What is KYC?"],
    };
  }

  // 28. Fake KYC SMS
  if (intent === "FAKE_KYC_SMS") {
    return {
      answer:
        "Never click links sent via SMS or messaging apps claiming urgent account suspension for pending KYC. Regulated banks never ask you to update KYC via third-party web forms or APK file downloads. Always verify directly through your official banking app or home branch. More in the Learn section.",
      refused: false,
      source: "template",
      suggestedChips: ["How to file a bank complaint?", "What is UPI PIN safety?"],
    };
  }

  // 29. Unauthorized Debit
  if (intent === "UNAUTHORIZED_DEBIT") {
    return {
      answer:
        "If you notice an unauthorized bank debit, immediately block your payment card or UPI access through your bank's mobile app. Next, inform your bank without delay to claim zero liability protection under RBI rules, and register the incident on the national cybercrime portal or helpline 1930 within the golden hour. More in the Learn section.",
      refused: false,
      source: "template",
      suggestedChips: ["How to file a bank complaint?", "What is the RBI Ombudsman?"],
    };
  }

  // 30. RBI Ombudsman
  if (intent === "RBI_OMBUDSMAN") {
    return {
      answer:
        "The Reserve Bank Integrated Ombudsman Scheme (RB-IOS) is a cost-free, impartial grievance redressal mechanism for bank and NBFC customers. If a regulated entity rejects your valid complaint or fails to respond within 30 days, you can escalate the matter directly on the RBI Complaint Management System (cms.rbi.org.in). More in the Learn section.",
      refused: false,
      source: "template",
      suggestedChips: ["How to file a bank complaint?", "What is SEBI SCORES?"],
    };
  }

  // 31. Bank Complaint Process
  if (intent === "BANK_COMPLAINT_PROCESS") {
    return {
      answer:
        "To file a formal bank complaint, first register your issue with the bank's branch or customer care and obtain an official ticket number. If it is unresolved after 30 days or you receive an unsatisfactory response, lodge an appeal on RBI's Complaint Management System (CMS) with your ticket details for regulatory escalation. More in the Learn section.",
      refused: false,
      source: "template",
      suggestedChips: ["What is the RBI Ombudsman?", "What is zero liability protection?"],
    };
  }

  // 32. SEBI SCORES
  if (intent === "SEBI_SCORES") {
    return {
      answer:
        "SCORES (SEBI Complaints Redress System) is a centralized online grievance portal run by SEBI. If an investor faces an unresolved dispute with a listed company, mutual fund house, or registered stockbroker, they can lodge an escalation directly with SEBI for tracking and binding resolution. More in the Learn section.",
      refused: false,
      source: "template",
      suggestedChips: ["What is the RBI Ombudsman?", "What is a SIP?"],
    };
  }

  // 33. EMI Concept
  if (intent === "EMI_CONCEPT") {
    return {
      answer:
        "An Equated Monthly Instalment (EMI) consists of two parts: principal repayment and interest charges. In the initial months, a higher share covers interest, while the principal balance reduces gradually. Zero-cost EMIs often bundle processing charges or discount give-backs, so check the total checkout cost. More in the Learn section.\n\nEducation, not investment advice.",
      refused: false,
      source: "template",
      suggestedChips: ["What is my credit limit?", "When is my repayment due?"],
    };
  }

  // 34. Mutual Funds Concept
  if (intent === "MUTUAL_FUNDS_CONCEPT") {
    return {
      answer:
        "Mutual funds pool money from multiple investors to invest in a diversified portfolio. Equity funds invest in company shares for long-term growth and carry market volatility, while debt funds invest in bonds and securities for stability and regular interest generation. Choose based on your time horizon and risk tolerance. More in the Learn section.\n\nEducation, not investment advice.",
      refused: false,
      source: "template",
      suggestedChips: ["What is a SIP?", "What is compounding?"],
    };
  }

  // 35. PPF Concept
  if (intent === "PPF_CONCEPT") {
    return {
      answer:
        "The Public Provident Fund (PPF) is a government-backed long-term savings scheme featuring sovereign safety, tax exemptions, and compound interest. Accounts have a 15-year tenure with partial withdrawal options after specified years, making it an ideal bedrock for risk-free capital preservation. More in the Learn section.",
      refused: false,
      source: "template",
      suggestedChips: ["What is an emergency fund?", "What is compounding?"],
    };
  }

  // 36. Deposit Insurance (DICGC)
  if (intent === "DEPOSIT_INSURANCE") {
    return {
      answer:
        "Under the Deposit Insurance and Credit Guarantee Corporation (DICGC), an RBI subsidiary, each depositor is insured up to a maximum of ₹5 lakh across principal and interest per insured commercial or cooperative bank in the rare event of bank liquidation. More in the Learn section.",
      refused: false,
      source: "template",
      suggestedChips: ["What is an emergency fund?", "How to file a bank complaint?"],
    };
  }

  // Default General Help
  return {
    answer:
      "I can explain financial terms, answer questions about your verified cash flow, explain how your Financial Health Score is computed, or guide you through your Ascend starter credit terms.\n\nEducation, not investment advice.",
    refused: false,
    source: "template",
    suggestedChips: [
      "How is my score calculated?",
      "What is my credit limit?",
      "When is my repayment due?",
      "What is a SIP?",
    ],
  };
}
