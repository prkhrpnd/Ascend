import { FLASHCARDS } from "@/data/learn/flashcards";

export interface PageKnowledge {
  title: string;
  path: string;
  navLabel: string;
  summary: string;
  howToFind: string;
}

export const APP_PAGES_KNOWLEDGE: Record<string, PageKnowledge> = {
  overview: {
    title: "Financial Health & Account Overview",
    path: "/",
    navLabel: "Overview",
    summary:
      "A scannable dashboard showing your verified cash flow summary, deterministic Financial Health Score circular gauge (0-100), Financial Snapshot cards (total credited, total debited, net cash flow, transaction count, active statement period), and at-a-glance data-driven insights.",
    howToFind: "Click 'Overview' in the main navigation bar at the top of any page.",
  },
  statements: {
    title: "Bank Statements Management",
    path: "/statements",
    navLabel: "Bank Statements",
    summary:
      "The statement ingestion portal. Upload any 6-month Indian bank statement CSV (under 2 MB) with columns for Date, Narration, Debit, Credit, and Balance. It validates balance continuity, detects column mappings across SBI, HDFC, ICICI, Axis, Kotak, and displays an audit verification report.",
    howToFind: "Click 'Bank Statements' in the top navigation bar.",
  },
  spending: {
    title: "Spending Analysis and Expense Breakdown",
    path: "/spending",
    navLabel: "Spending Analysis",
    summary:
      "Interactive statement analytics featuring the Top Categories Share donut chart stacked vertically above the Expense Breakdown by category bar chart, monthly Inflow vs Outflow time-series graphs, and the Transaction Explorer with category search and filtering.",
    howToFind: "Click 'Spending Analysis' in the top navigation bar.",
  },
  categories: {
    title: "Expense Categories and Transparent Rules",
    path: "/categories",
    navLabel: "Expense Categories",
    summary:
      "Full taxonomy of Ascend's 18 canonical personal finance categories grouped into Essential Living, Lifestyle & Discretionary, Debt & Repayments, Investments & Transfers, Income & Credits, and Needs Review. Shows the exact keyword pattern rules and explains why self-transfers and investments are separated from living expenses.",
    howToFind: "Click 'Expense Categories' in the top navigation bar.",
  },
  cashflow: {
    title: "Student Cash Flow Engine",
    path: "/cashflow",
    navLabel: "Cash Flow",
    summary:
      "Analyzes the timing and consistency of your regular family allowances, stipends, and hostel obligations. Highlights your median qualifying monthly inflow, primary allowance arrival day, and calibrated credit line due date (+2 days after income lands).",
    howToFind: "Click 'Cash Flow' in the top navigation bar.",
  },
  learn: {
    title: "Knowledge Flashcards (Learn)",
    path: "/learn",
    navLabel: "Learn",
    summary:
      "A personal finance education library featuring 30 foundational flashcards across 6 categories (Banking & Digital Safety, Credit & Loans, Investing Basics, Investor Protection, Savings/Insurance, Rights & Grievance). Includes concept search, read timers, key takeaways, and flashcard flipping.",
    howToFind: "Click 'Learn' in the top navigation bar.",
  },
  line: {
    title: "My Starter Line Dashboard",
    path: "/line",
    navLabel: "Credit Line (₹500 Starter)",
    summary:
      "Interactive revolving credit dashboard. Displays outstanding balance, available credit, self-set cap, instant UPI draw action, 24-hour cooling-off protection, 30-day cycle advance scrubber, and the responsible slip ladder simulation (Shift Due Date, Split Installments, Repay On Time).",
    howToFind: "Click the 'Starter Credit Line' dropdown in the top nav and select 'Credit Line (₹500 Starter)'.",
  },
  assess: {
    title: "Day-1 Backtest and Three Caps",
    path: "/assess",
    navLabel: "Underwriting Assessment",
    summary:
      "Underwriting assessment evaluating the Three Caps (Tier Cap ₹500, Capacity Cap, Stress Due-Date Cap). It replays verified statement cash flow against candidate starter lines under baseline and stress conditions (7-day allowance arrival delay + 25% freelance haircut).",
    howToFind: "Click 'Credit Check' or open the 'Starter Credit Line' dropdown and select 'Underwriting Assessment'.",
  },
  offer: {
    title: "Starter Credit Offer & Key Fact Statement",
    path: "/offer",
    navLabel: "Digital Agreement & Key Fact Statement",
    summary:
      "Transparent digital credit agreement from simulated partner LendPartner Finance. Allows choosing a self-set cap (down to ₹200), reviewing a clear Cost Card receipt, and signing the mandatory credit bureau reporting acknowledgment.",
    howToFind: "Open the 'Starter Credit Line' dropdown and select 'Digital Agreement & Key Fact Statement'.",
  },
  score: {
    title: "Credit History Progress",
    path: "/score",
    navLabel: "Score & Bureau Reporting",
    summary:
      "Tracks repayment consistency on a 0-100 indicator. Shows progress toward Bureau-Ready graduation (6 clean cycles, 1 stress cycle passed, utilization under 50%), opt-in tier upgrade (unlocking higher credit lines), and classmate referral cashback.",
    howToFind: "Open the 'Starter Credit Line' dropdown and select 'Score & Bureau Reporting'.",
  },
  simulator: {
    title: "Affordability Simulator",
    path: "/simulator",
    navLabel: "Stress Backtest Simulator",
    summary:
      "60-day forward projection SVG chart testing hypothetical campus purchases (₹0 to ₹3,000) and draw amounts (₹0 to ₹500) against your ₹300 safety buffer and zero overdraft baseline under normal and stress delay scenarios.",
    howToFind: "Open the 'Starter Credit Line' dropdown and select 'Stress Backtest Simulator'.",
  },
  declarations: {
    title: "Declarations & Open Source",
    path: "/declarations",
    navLabel: "Declarations & Open Source",
    summary:
      "Public declarations, regulatory boundaries, open-source acknowledgments, and student data protection policies.",
    howToFind: "Open the 'Starter Credit Line' dropdown and select 'Declarations & Open Source'.",
  },
};

export const LEARN_CARDS_MAP = FLASHCARDS;

export const HEALTH_SCORE_RULES = {
  maxScore: 100,
  components: [
    {
      name: "Cash Flow Surplus",
      maxPoints: 35,
      description:
        "Measures monthly operating surplus and savings retention. Retaining ≥20% of incoming funds awards the full 35 points; ≥10% awards 28 points; any positive surplus awards 20 points; break-even awards 14 points; mild deficit (<15%) awards 8 points; and high deficit awards 0 points.",
    },
    {
      name: "Fixed Obligation Ratio",
      maxPoints: 25,
      description:
        "Evaluates the portion of inflows consumed by recurring fixed commitments (rent, utilities). If fixed obligations consume ≤40% of inflows, full 25 points; ≤60% awards 18 points; ≤80% awards 10 points; and >80% awards 4 points.",
    },
    {
      name: "Period Consistency",
      maxPoints: 25,
      description:
        "Evaluates multi-month cash flow stability. Calculated as (months with positive cash flow / total statement months) × 25 points.",
    },
    {
      name: "Spending Discipline",
      maxPoints: 15,
      description:
        "Encourages digital traceability. If untraceable cash withdrawals are <10% of total debits, full 15 points; <25% awards 10 points; and ≥25% awards 5 points.",
    },
  ],
  ratings: [
    { label: "Excellent", range: "80 - 100", meaning: "Strong surplus, healthy savings retention, and disciplined cash habits." },
    { label: "Good", range: "65 - 79", meaning: "Stable cash flow with manageable fixed commitments." },
    { label: "Fair", range: "50 - 64", meaning: "Operating near break-even or tight fixed obligations." },
    { label: "Needs Attention", range: "Below 50", meaning: "Outflows exceed inflows or high cash withdrawals create cash stress." },
  ],
  disclaimer:
    "Informational financial health score based on cash-flow discipline, not an official credit bureau score.",
};

export const STARTER_CREDIT_TERMS = {
  tier1Limit: 500,
  cycle1Term: "Cycle 1 is 100% interest-free (repay exactly what was drawn).",
  laterCycleInterest: "1.5% per 30-day cycle (~18% p.a. non-compounding).",
  dueDateRule: "Calibrated +2 days after your primary monthly allowance or stipend lands.",
  lateFee: "Flat ₹50 late fee charged by partner if missed; Ascend earns ₹0 from late fees or penalty interest.",
  coolingOff: "24-hour mandatory pause between consecutive draws to curb impulsive borrowing.",
  partner: "LendPartner Finance (Simulated partner NBFC). Ascend is an educational technology platform.",
};
