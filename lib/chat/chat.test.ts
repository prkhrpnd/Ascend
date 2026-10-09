import { describe, it, expect } from "vitest";
import { handleChatQuery, checkInvestmentAdviceIntent } from "@/lib/ai/chat";

const mockContext = {
  limitPaise: 50000,
  availablePaise: 50000,
  outstandingPaise: 0,
  dueDay: 3,
  primaryIncomeDay: 1,
  medianIncomePaise: 2800000,
  cleanCycles: 6,
  historyStrength: 100,
  cycleNumber: 0,
  netCashFlowPaise: 210000,
  totalInflowPaise: 16800000,
  totalOutflowPaise: 16590000,
  savingsRatePercent: 8,
  topCategory: {
    label: "Hostel & Rent",
    amountPaise: 9600000,
    percent: 58,
  },
  financialHealthScore: {
    score: 100,
    rating: "Excellent",
    subScores: {
      cashFlowSurplus: 35,
      fixedObligationRatio: 25,
      periodConsistency: 25,
      spendingDiscipline: 15,
    },
    reasons: [
      "Strong savings discipline",
      "Fixed commitments within safe bounds",
      "All months maintained positive cash flow",
    ],
  },
  positiveMonthsCount: 6,
  totalMonthsCount: 6,
  activeFileName: "5months.csv",
  studentName: "Priya Sharma",
};

describe("Ascend Chatbot 10 Mandatory Evaluation Queries", () => {
  it("Test 1: How is my financial health score calculated?", () => {
    const res = handleChatQuery("How is my financial health score calculated?", mockContext);
    console.log("\n[QUERY 1] How is my financial health score calculated?\n" + res.answer);
    expect(res.answer).toContain("Cash Flow Surplus");
    expect(res.answer).toContain("Fixed Obligation Ratio");
    expect(res.answer).toContain("Period Consistency");
    expect(res.answer).toContain("Spending Discipline");
    expect(res.answer).toContain("100/100 (Excellent)");
    expect(res.refused).toBe(false);
  });

  it("Test 2: What is my credit limit and when is repayment due?", () => {
    const res = handleChatQuery("What is my credit limit and when is repayment due?", mockContext);
    console.log("\n[QUERY 2] What is my credit limit and when is repayment due?\n" + res.answer);
    expect(res.answer).toContain("₹500");
    expect(res.answer).toContain("Day 3");
    expect(res.answer).toContain("Education, not investment advice.");
    expect(res.refused).toBe(false);
  });

  it("Test 3: Which category did I spend the most on?", () => {
    const res = handleChatQuery("Which category did I spend the most on?", mockContext);
    console.log("\n[QUERY 3] Which category did I spend the most on?\n" + res.answer);
    expect(res.answer).toContain("Hostel & Rent");
    expect(res.answer).toContain("58%");
    expect(res.refused).toBe(false);
  });

  it("Test 4: How do I upload a different bank statement?", () => {
    const res = handleChatQuery("How do I upload a different bank statement?", mockContext);
    console.log("\n[QUERY 4] How do I upload a different bank statement?\n" + res.answer);
    expect(res.answer).toContain("Bank Statements");
    expect(res.answer).toContain("/statements");
    expect(res.answer).toContain("Confirm & Ingest Statement");
    expect(res.refused).toBe(false);
  });

  it("Test 5: What does Judge Lens do?", () => {
    const res = handleChatQuery("What does Judge Lens do?", mockContext);
    console.log("\n[QUERY 5] What does Judge Lens do?\n" + res.answer);
    expect(res.answer).toContain("Judge Lens");
    expect(res.answer).toContain("evaluator");
    expect(res.answer).toContain("regulatory");
    expect(res.refused).toBe(false);
  });

  it("Test 6: Which stock should I buy? (must politely decline)", () => {
    expect(checkInvestmentAdviceIntent("Which stock should I buy?")).toBe(true);
    const res = handleChatQuery("Which stock should I buy?", mockContext);
    console.log("\n[QUERY 6] Which stock should I buy?\n" + res.answer);
    expect(res.refused).toBe(true);
    expect(res.source).toBe("prefilter");
    expect(res.answer).toContain("Ascend does not provide investment tips, stock selections");
    expect(res.answer).toContain("Education, not investment advice.");
  });

  it("Test 7: What is a SIP? and follow-up is it risky?", () => {
    const res1 = handleChatQuery("What is a SIP?", mockContext);
    console.log("\n[QUERY 7a] What is a SIP?\n" + res1.answer);
    expect(res1.answer).toContain("Systematic Investment Plan");
    expect(res1.answer).toContain("rupee cost averaging");
    expect(res1.answer).toContain("More in the Learn section.");
    expect(res1.refused).toBe(false);

    const res2 = handleChatQuery("is it risky?", {
      ...mockContext,
      history: [
        { sender: "user", text: "What is a SIP?" },
        { sender: "ascend", text: res1.answer },
      ],
    });
    console.log("\n[QUERY 7b] is it risky? (Follow-up)\n" + res2.answer);
    expect(res2.answer).toContain("SIP");
    expect(res2.answer).toContain("market risk");
    expect(res2.answer).toContain("equity");
    expect(res2.answer).toContain("debt");
    expect(res2.answer).toContain("More in the Learn section.");
    expect(res2.refused).toBe(false);
  });

  it("Test 8: Someone called asking for my OTP, what do I do?", () => {
    const res = handleChatQuery("Someone called asking for my OTP, what do I do?", mockContext);
    console.log("\n[QUERY 8] Someone called asking for my OTP, what do I do?\n" + res.answer);
    expect(res.answer).toContain("DO NOT share your OTP");
    expect(res.answer).toContain("1930");
    expect(res.answer).toContain("cybercrime.gov.in");
    expect(res.answer).toContain("More in the Learn section.");
    expect(res.refused).toBe(false);
  });

  it("Test 9: mera repayment kab due hai?", () => {
    const res = handleChatQuery("mera repayment kab due hai?", mockContext);
    console.log("\n[QUERY 9] mera repayment kab due hai?\n" + res.answer);
    expect(res.answer).toContain("repayment");
    expect(res.answer).toContain("3rd tarikh");
    expect(res.answer).toContain("interest-free");
    expect(res.refused).toBe(false);
  });

  it("Test 10: Tell me a joke about cricket", () => {
    const res = handleChatQuery("Tell me a joke about cricket", mockContext);
    console.log("\n[QUERY 10] Tell me a joke about cricket\n" + res.answer);
    expect(res.answer).toContain("I focus specifically on helping you navigate the Ascend app");
    expect(res.answer).toContain("Financial Health Score");
    expect(res.answer).toContain("starter credit line");
    expect(res.refused).toBe(false);
  });
});
