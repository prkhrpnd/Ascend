export interface Flashcard {
  id: string;
  category: LearnCategory;
  question: string;
  explanation: string;
  whyItMatters: string;
  sourceName: string;
  sourceUrl: string;
}

export type LearnCategory =
  | "Banking & Digital Safety"
  | "Credit & Loans"
  | "Investing Basics"
  | "Investor Protection"
  | "Savings, Insurance & Retirement"
  | "Rights & Grievance";

export const LEARN_CATEGORIES: LearnCategory[] = [
  "Banking & Digital Safety",
  "Credit & Loans",
  "Investing Basics",
  "Investor Protection",
  "Savings, Insurance & Retirement",
  "Rights & Grievance",
];

export const FLASHCARDS: Flashcard[] = [
  // 1. Banking & Digital Safety (5 cards)
  {
    id: "bank-1",
    category: "Banking & Digital Safety",
    question: "Do you ever need to enter your UPI PIN to receive money?",
    explanation:
      "No. Entering your UPI PIN is solely required when authorizing money to leave your account. Receiving a UPI payment or cashback never requires entering a PIN, scanning a QR code, or clicking an approval prompt.",
    whyItMatters:
      "Fraudsters often send collect requests disguised as prize rewards or buyer payments. Remembering that PIN is only for sending stops this fraud instantly.",
    sourceName: "NPCI UPI Safety Awareness",
    sourceUrl: "https://www.npci.org.in",
  },
  {
    id: "bank-2",
    category: "Banking & Digital Safety",
    question: "What should you do if an SMS warns that your account is blocked for KYC?",
    explanation:
      "Never click links sent via SMS or messaging apps claiming urgent KYC suspension. Regulated banks never ask you to update KYC via third-party web forms or APK file downloads. Always verify directly through your official banking app or bank branch.",
    whyItMatters:
      "Fake KYC messages are the most common phishing attack targeted at students. Downloading malicious APK files grants remote access to your device.",
    sourceName: "RBI Kehta Hai Public Awareness",
    sourceUrl: "https://rbi.org.in",
  },
  {
    id: "bank-3",
    category: "Banking & Digital Safety",
    question: "Will a real bank official or customer care agent ever ask for your OTP?",
    explanation:
      "Never. A One-Time Password (OTP) is a secret authorization factor meant only for you. Legitimate bank employees, helpline agents, and payment providers have no operational reason to ask for your OTP, CVV, or passwords.",
    whyItMatters:
      "Social engineering callers pretend to be fraud prevention officers helping you cancel a suspicious charge, then ask for the OTP to complete the theft.",
    sourceName: "RBI Kehta Hai Public Awareness",
    sourceUrl: "https://rbi.org.in",
  },
  {
    id: "bank-4",
    category: "Banking & Digital Safety",
    question: "What immediate action should you take if you notice an unauthorized bank debit?",
    explanation:
      "Block your payment card or UPI access immediately through your banking app, inform your bank without delay, and register the incident on the national cybercrime portal or helpline 1930 within the golden hour.",
    whyItMatters:
      "Reporting unauthorized electronic transactions immediately dramatically minimizes your personal liability under official RBI customer protection rules.",
    sourceName: "RBI Customer Protection Framework",
    sourceUrl: "https://rbi.org.in",
  },
  {
    id: "bank-5",
    category: "Banking & Digital Safety",
    question: "Why should you avoid accessing banking apps on public Wi-Fi networks?",
    explanation:
      "Unsecured public Wi-Fi networks in cafes, transit hubs, and hostels can expose your traffic to packet interception and man-in-the-middle exploits. Always use your personal cellular data connection or a verified private network for financial tasks.",
    whyItMatters:
      "College students regularly use open campus networks. Using cellular data for transactions ensures encrypted, point-to-point communication with bank servers.",
    sourceName: "RBI Cyber Security Guidelines",
    sourceUrl: "https://rbi.org.in",
  },

  // 2. Credit & Loans (5 cards)
  {
    id: "credit-1",
    category: "Credit & Loans",
    question: "What is a credit score and why is it important for students?",
    explanation:
      "A credit score is a 3-digit number (typically ranging from 300 to 900) calculated by licensed credit bureaus based on your repayment track record. A higher score reflects consistent, timely repayment of borrowing obligations.",
    whyItMatters:
      "Future milestones like education loans, vehicle financing, and credit cards depend on your credit score. Missing payments early damages your borrowing terms for years.",
    sourceName: "RBI Financial Literacy Guide",
    sourceUrl: "https://rbi.org.in",
  },
  {
    id: "credit-2",
    category: "Credit & Loans",
    question: "Are you entitled to review your credit report for free every year?",
    explanation:
      "Yes. Under RBI regulations, every licensed credit information bureau in India is mandated to provide individuals with one free full credit report per calendar year upon verification of identity.",
    whyItMatters:
      "Checking your free annual report helps you catch reporting errors, clerical discrepancies, or identity theft accounts before applying for crucial student credit.",
    sourceName: "RBI Credit Information Guidelines",
    sourceUrl: "https://rbi.org.in",
  },
  {
    id: "credit-3",
    category: "Credit & Loans",
    question: "How do Equated Monthly Instalments (EMIs) work over the loan term?",
    explanation:
      "An EMI consists of two parts: principal repayment and interest charge. In the initial months, a higher share of each EMI goes toward paying interest, while the principal balance reduces gradually over time.",
    whyItMatters:
      "Understanding that zero-cost EMIs often bundle processing charges or discount give-backs helps you evaluate the true overall cost of gadgets and campus purchases.",
    sourceName: "RBI Financial Education",
    sourceUrl: "https://rbi.org.in",
  },
  {
    id: "credit-4",
    category: "Credit & Loans",
    question: "What are the major dangers of unregulated instant loan apps?",
    explanation:
      "Illegal lending apps operate without RBI licenses, charge exorbitant hidden interest, and misuse mobile permissions to harvest contact lists and photo galleries for extortion. RBI regulations strictly prohibit lenders from accessing mobile contacts.",
    whyItMatters:
      "Desperate students seeking quick cash are primary targets of predatory loan apps. Never grant gallery or contact access to any borrowing application.",
    sourceName: "RBI Digital Lending Guidelines",
    sourceUrl: "https://rbi.org.in",
  },
  {
    id: "credit-5",
    category: "Credit & Loans",
    question: "How can you verify whether a digital loan provider is legally authorized?",
    explanation:
      "All legitimate lending apps in India must partner with an RBI-registered commercial bank or Non-Banking Financial Company (NBFC). The lender must disclose their registered partner prominently, which you can cross-check on RBI's official registered entity list.",
    whyItMatters:
      "Taking 2 minutes to check RBI's website confirms whether a lender follows fair recovery practices, legally capped charges, and formal grievance mechanisms.",
    sourceName: "RBI Public Awareness",
    sourceUrl: "https://rbi.org.in",
  },

  // 3. Investing Basics (5 cards)
  {
    id: "invest-1",
    category: "Investing Basics",
    question: "What is a Systematic Investment Plan (SIP) and how does it work?",
    explanation:
      "A Systematic Investment Plan allows you to invest a fixed sum into a mutual fund scheme at regular intervals (such as monthly). This automates investing discipline and averages out purchase costs over market cycles through rupee cost averaging.",
    whyItMatters:
      "Students can begin investing with small amounts from allowances, building long-term habits without needing to guess or time day-to-day market movements.",
    sourceName: "SEBI Saa₹thi Investor Education",
    sourceUrl: "https://investor.sebi.gov.in",
  },
  {
    id: "invest-2",
    category: "Investing Basics",
    question: "What is diversification in personal investing?",
    explanation:
      "Diversification means spreading your investment money across different assets, companies, and sectors rather than betting on a single stock. If one company struggles, gains from other investments cushion your overall portfolio from steep losses.",
    whyItMatters:
      "Putting all savings into a single trending stock or crypto asset exposes students to total capital loss. Diversification preserves financial stability.",
    sourceName: "SEBI Investor Awareness",
    sourceUrl: "https://investor.sebi.gov.in",
  },
  {
    id: "invest-3",
    category: "Investing Basics",
    question: "How does the power of compounding reward early investors?",
    explanation:
      "Compounding occurs when your investment returns begin generating their own returns over time. The longer money stays invested, the steeper the exponential growth curve becomes, making time more impactful than the initial capital amount.",
    whyItMatters:
      "A student who starts investing small sums at age 20 often builds far greater wealth than someone who begins investing larger sums a decade later.",
    sourceName: "SEBI Investor Education",
    sourceUrl: "https://investor.sebi.gov.in",
  },
  {
    id: "invest-4",
    category: "Investing Basics",
    question: "What is the relationship between risk and return in regulated financial markets?",
    explanation:
      "Risk and potential return move together. Higher potential earnings inevitably entail higher potential volatility and downside risk. There is no legitimate financial instrument that offers high returns with zero risk.",
    whyItMatters:
      "Whenever someone promises risk-free high profits or double-your-money schemes, it is almost certainly fraudulent. Regulators emphasize evaluating risk tolerance first.",
    sourceName: "SEBI Investor Education",
    sourceUrl: "https://investor.sebi.gov.in",
  },
  {
    id: "invest-5",
    category: "Investing Basics",
    question: "What is the difference between equity and debt mutual funds?",
    explanation:
      "Equity funds invest primarily in shares of listed companies for capital growth and carry market volatility. Debt funds invest in fixed-income securities like government bonds and treasury bills, focusing on stability and regular interest generation.",
    whyItMatters:
      "Knowing the distinction helps students align short-term goals (college fees in 6 months = debt/liquid) with long-term goals (wealth building = diversified equity).",
    sourceName: "SEBI Saa₹thi Investor Education",
    sourceUrl: "https://investor.sebi.gov.in",
  },

  // 4. Investor Protection (5 cards)
  {
    id: "protect-1",
    category: "Investor Protection",
    question: "How can you verify if a financial advisor is legally registered?",
    explanation:
      "Legitimate investment advisors, research analysts, and stockbrokers must hold a valid registration certificate issued by SEBI. You can search the intermediary's registration number directly on SEBI's official portal under Recognized Intermediaries.",
    whyItMatters:
      "Many social media accounts sell unauthorized stock tips without qualifications. Verifying SEBI registration ensures accountability and legal protection.",
    sourceName: "SEBI Investor Education",
    sourceUrl: "https://www.sebi.gov.in",
  },
  {
    id: "protect-2",
    category: "Investor Protection",
    question: "Why are guaranteed stock market return claims an immediate red flag?",
    explanation:
      "Market securities fluctuate based on economic and corporate performance. SEBI regulations strictly prohibit intermediaries from promising guaranteed returns on equity investments. Any entity promising guaranteed profits operates outside the law.",
    whyItMatters:
      "Ponzi operators target young adults by showing fabricated profit screenshots and promising daily fixed gains. Rejecting guaranteed return pitches avoids scams.",
    sourceName: "SEBI Investor Warning",
    sourceUrl: "https://www.sebi.gov.in",
  },
  {
    id: "protect-3",
    category: "Investor Protection",
    question: "What cautions should students exercise regarding financial influencers (finfluencers)?",
    explanation:
      "Financial influencers often receive undisclosed sponsorships or commissions from unregulated platforms. SEBI guidelines require clear conflict-of-interest disclosures and restrict unregistered individuals from offering personalized financial advice.",
    whyItMatters:
      "Viral trading clips frequently promote risky derivative speculation without explaining that the vast majority of retail options traders lose capital.",
    sourceName: "SEBI Public Awareness",
    sourceUrl: "https://investor.sebi.gov.in",
  },
  {
    id: "protect-4",
    category: "Investor Protection",
    question: "What is SEBI SCORES and when should an investor use it?",
    explanation:
      "SCORES (SEBI Complaints Redress System) is a centralized online grievance portal. If an investor faces an unresolved dispute with a listed company, mutual fund house, or registered broker, they can lodge a complaint directly with SEBI for tracking and escalation.",
    whyItMatters:
      "Knowing how to escalate unresolved mutual fund or brokerage issues empowers student investors with formal regulatory protection.",
    sourceName: "SEBI SCORES Portal",
    sourceUrl: "https://scores.sebi.gov.in",
  },
  {
    id: "protect-5",
    category: "Investor Protection",
    question: "How can you protect your demat and trading account from unauthorized access?",
    explanation:
      "Enable mandatory two-factor authentication (2FA) with biometric or authenticator app verification. Additionally, verify transaction confirmation SMS and emails received directly from depositors (NSDL / CDSL) rather than relying solely on broker messages.",
    whyItMatters:
      "Direct depository alerts ensure you know immediately if any security transfer or pledge activity occurs in your demat account.",
    sourceName: "SEBI Investor Awareness",
    sourceUrl: "https://investor.sebi.gov.in",
  },

  // 5. Savings, Insurance & Retirement (5 cards)
  {
    id: "save-1",
    category: "Savings, Insurance & Retirement",
    question: "What is an emergency fund and how much should you keep?",
    explanation:
      "An emergency fund is money kept strictly in liquid, easily accessible forms (such as a savings account or liquid mutual fund) to cover unexpected urgent costs like medical emergencies or sudden income disruptions, typically covering 3 to 6 months of expenses.",
    whyItMatters:
      "Having an emergency buffer prevents students and graduates from resorting to high-cost credit cards or predatory loans when urgent expenses arise.",
    sourceName: "RBI Financial Literacy Guide",
    sourceUrl: "https://rbi.org.in",
  },
  {
    id: "save-2",
    category: "Savings, Insurance & Retirement",
    question: "What is the key difference between term insurance and endowment insurance?",
    explanation:
      "Term insurance provides pure financial protection: if the insured passes away during the policy period, the nominee receives the sum assured; there is no maturity payout. Endowment policies mix insurance with low-yield savings, charging much higher premiums for lower coverage.",
    whyItMatters:
      "Insurance is for protection, not investment. Buying pure term coverage for dependents while investing the remaining savings separately provides far superior value.",
    sourceName: "IRDAI Consumer Education",
    sourceUrl: "https://irdai.gov.in",
  },
  {
    id: "save-3",
    category: "Savings, Insurance & Retirement",
    question: "Why is individual health insurance essential even for young, healthy students?",
    explanation:
      "Health insurance pays for hospitalization and critical medical procedures, protecting your savings from runaway medical inflation. Buying young ensures low premiums and fulfills mandatory waiting periods for pre-existing ailments before illnesses develop.",
    whyItMatters:
      "A single unexpected hospital stay can wipe out a family's educational savings. Health insurance keeps personal finance plans from getting derailed.",
    sourceName: "IRDAI Consumer Awareness",
    sourceUrl: "https://irdai.gov.in",
  },
  {
    id: "save-4",
    category: "Savings, Insurance & Retirement",
    question: "How does the Public Provident Fund (PPF) provide risk-free long-term savings?",
    explanation:
      "PPF is a government-backed savings scheme featuring sovereign safety, tax benefits, and compound interest. Accounts have a 15-year tenure with partial withdrawal options after specified years, making it an ideal bedrock for capital preservation.",
    whyItMatters:
      "PPF instills long-term savings discipline. Opening an account early allows young adults to build tax-efficient, risk-free compounding capital.",
    sourceName: "RBI / Ministry of Finance Portal",
    sourceUrl: "https://rbi.org.in",
  },
  {
    id: "save-5",
    category: "Savings, Insurance & Retirement",
    question: "How much of your bank deposit is insured by the government in India?",
    explanation:
      "Under the Deposit Insurance and Credit Guarantee Corporation (DICGC), an RBI subsidiary, each depositor is insured up to a maximum of ₹5 lakh across principal and interest per insured commercial and cooperative bank in case of bank liquidation.",
    whyItMatters:
      "Understanding deposit insurance reassures students that money kept in authorized scheduled banks enjoys robust statutory protection.",
    sourceName: "DICGC / RBI Public Awareness",
    sourceUrl: "https://www.dicgc.org.in",
  },

  // 6. Rights & Grievance (5 cards)
  {
    id: "rights-1",
    category: "Rights & Grievance",
    question: "What is the Reserve Bank Integrated Ombudsman Scheme (RB-IOS)?",
    explanation:
      "The RBI Integrated Ombudsman Scheme is a cost-free, impartial grievance redressal mechanism for bank and NBFC customers. If a regulated entity rejects your valid complaint or fails to respond within 30 days, you can escalate the matter directly to the Ombudsman.",
    whyItMatters:
      "You are never at the mercy of unresponsive bank branches. The Ombudsman holds regulated institutions accountable with legally binding compensation directives.",
    sourceName: "RBI Ombudsman Scheme",
    sourceUrl: "https://cms.rbi.org.in",
  },
  {
    id: "rights-2",
    category: "Rights & Grievance",
    question: "What are the proper steps to file a formal complaint against a bank?",
    explanation:
      "First, register your complaint with the bank's branch or customer care and obtain a ticket number. If unresolved after 30 days or if you receive an unsatisfactory response, lodge an appeal on RBI's Complaint Management System (CMS) with your ticket details.",
    whyItMatters:
      "Following the formal sequence ensures your grievance is documented with an official audit trail that regulators can evaluate.",
    sourceName: "RBI Complaint Management System",
    sourceUrl: "https://cms.rbi.org.in",
  },
  {
    id: "rights-3",
    category: "Rights & Grievance",
    question: "What is Know Your Customer (KYC) and what are your rights during the process?",
    explanation:
      "KYC is a statutory identity verification process mandated by the RBI to prevent money laundering and identity theft. Regulated institutions only accept officially valid documents (like Aadhaar, PAN, Passport, Voter ID) through secure, authorized channels.",
    whyItMatters:
      "Never share identity documents over messaging apps or unverified websites. Legitimate banks provide secure in-app or in-person verification options.",
    sourceName: "RBI Master Direction on KYC",
    sourceUrl: "https://rbi.org.in",
  },
  {
    id: "rights-4",
    category: "Rights & Grievance",
    question: "Why is designating a nominee in all bank accounts and investments crucial?",
    explanation:
      "A nominee is the designated custodian authorized to receive your bank funds and securities in the event of your death. Registering a clear nominee avoids complex legal succession certificates and delays for your family members.",
    whyItMatters:
      "Students often skip the nominee field when opening bank or demat accounts online. Adding a parent or guardian ensures frictionless family access during crises.",
    sourceName: "RBI / SEBI Investor Awareness",
    sourceUrl: "https://rbi.org.in",
  },
  {
    id: "rights-5",
    category: "Rights & Grievance",
    question: "What is zero liability protection in unauthorized electronic transactions?",
    explanation:
      "Under RBI guidelines, if an unauthorized transaction occurs through third-party breach without your negligence, you face zero financial liability provided you notify your bank within 3 working days of receiving the transaction alert.",
    whyItMatters:
      "Always keep your mobile number updated with your bank so you receive instant debit SMS alerts and can report fraud inside the zero liability window.",
    sourceName: "RBI Customer Protection Framework",
    sourceUrl: "https://rbi.org.in",
  },
];
