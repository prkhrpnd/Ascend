"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import { useApp } from "@/lib/context/AppContext";
import { MessageSquareText, X, Send, AlertTriangle, BookOpen } from "lucide-react";
import { calculateFinancialHealthScore } from "@/lib/engine/healthScore";

interface ChatMessage {
  id: string;
  sender: "user" | "ascend";
  text: string;
  refused?: boolean;
}

const DEFAULT_SAMPLE_PROMPTS = [
  "How is my score calculated?",
  "What is my credit limit?",
  "When is my repayment due?",
  "How do I upload a statement?",
  "What is a SIP?",
  "How to report UPI fraud?",
];

export function AskMoneyModal() {
  const {
    chatOpen,
    setChatOpen,
    creditState,
    income,
    analytics,
    coverage,
    activeFileName,
    profile,
  } = useApp();

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      sender: "ascend",
      text: "Namaste! I am Ask About My Money. Ask me about your verified cash flow, repayment due dates, or credit terms. I never offer investment or stock tips.\n\nEducation, not investment advice.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [prompts, setPrompts] = useState<string[]>(DEFAULT_SAMPLE_PROMPTS);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Pre-calculate real health score to supply as verified context
  const healthScore = useMemo(() => {
    return calculateFinancialHealthScore(analytics, coverage);
  }, [analytics, coverage]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (chatOpen) {
      scrollToBottom();
    }
  }, [messages, chatOpen, loading]);

  const handleSend = async (queryText?: string) => {
    const textToSend = (queryText || input).trim();
    if (!textToSend || loading) return;

    const userMsg: ChatMessage = {
      id: `u_${Date.now()}`,
      sender: "user",
      text: textToSend,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      // Build rich context from active statement and user profile
      const positiveMonthsCount = analytics?.monthlyBreakdown
        ? analytics.monthlyBreakdown.filter((m) => m.netPaise >= 0).length
        : undefined;

      const totalMonthsCount =
        coverage?.monthsCount ||
        (analytics?.monthlyBreakdown ? analytics.monthlyBreakdown.length : undefined);

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: textToSend,
          context: {
            limitPaise: creditState.limitPaise,
            availablePaise: creditState.availablePaise,
            outstandingPaise: creditState.outstandingPaise,
            dueDay: income?.dueDate || 3,
            primaryIncomeDay: income?.primaryIncomeDay || 1,
            medianIncomePaise: income?.medianQualifyingIncomePaise || 680000,
            cleanCycles: creditState.cleanCycles,
            historyStrength: creditState.historyStrength,
            cycleNumber: creditState.cycleNumber,
            netCashFlowPaise: analytics?.netCashFlowPaise,
            totalInflowPaise: analytics?.totalInflowPaise,
            totalOutflowPaise: analytics?.totalOutflowPaise,
            savingsRatePercent: analytics?.savingsRatePercent,
            topCategory: analytics?.topCategory
              ? {
                  label: analytics.topCategory.label,
                  amountPaise: analytics.topCategory.amountPaise,
                  percent: analytics.topCategory.percent,
                }
              : undefined,
            financialHealthScore: {
              score: healthScore.score,
              rating: healthScore.rating,
              subScores: healthScore.subScores,
              reasons: healthScore.reasons,
              actionableSuggestion: healthScore.actionableSuggestion,
            },
            positiveMonthsCount,
            totalMonthsCount,
            activeFileName: activeFileName || "uploaded_statement.csv",
            studentName: profile?.name || "Student",
            history: messages.slice(-6).map((m) => ({
              sender: m.sender,
              text: m.text,
            })),
          },
        }),
      });

      if (!res.ok) {
        throw new Error(`Chat API error: ${res.status}`);
      }

      const data = await res.json();
      const botMsg: ChatMessage = {
        id: `b_${Date.now()}`,
        sender: "ascend",
        text: data.answer || "I was unable to retrieve a response. Please try again.",
        refused: data.refused,
      };
      setMessages((prev) => [...prev, botMsg]);

      // Update suggestion chips with dynamic follow-up chips if returned
      if (Array.isArray(data.suggestedChips) && data.suggestedChips.length > 0) {
        setPrompts(data.suggestedChips);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `err_${Date.now()}`,
          sender: "ascend",
          text: "I ran into a temporary issue retrieving the response. Please try asking again in a moment.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Ask Pill */}
      <button
        onClick={() => setChatOpen(!chatOpen)}
        className="fixed bottom-20 right-4 md:bottom-6 md:right-6 z-40 flex items-center gap-2 px-4 py-2.5 rounded-full bg-vermilion text-paper text-xs font-semibold shadow-xl hover:bg-vermilion/90 transition-transform active:scale-95"
        title="Ask About My Money"
      >
        <MessageSquareText className="w-4 h-4 text-paper" />
        <span>Ask About My Money</span>
      </button>

      {/* Floating Drawer / Dialog */}
      {chatOpen && (
        <div className="fixed bottom-24 right-4 md:bottom-20 md:right-6 w-[92vw] max-w-sm md:w-96 bg-white dark:bg-[#1c1c1a] border border-rule rounded-[32px] shadow-2xl z-50 flex flex-col h-[520px] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="p-3.5 bg-[#f6f6f3] dark:bg-[#262622] border-b border-rule flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-pin-red" />
              <div>
                <h3 className="font-serif font-bold text-sm text-ink leading-tight">Ask About My Money</h3>
                <p className="text-[10px] text-ink-soft">Plain-language cash flow education</p>
              </div>
            </div>
            <button
              onClick={() => setChatOpen(false)}
              className="p-1 rounded-full hover:bg-rule/40 text-ink-soft cursor-pointer"
              aria-label="Close Ask About My Money"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Prompt Chips */}
          <div className="p-2.5 bg-white dark:bg-[#1c1c1a] border-b border-rule flex items-center gap-1.5 overflow-x-auto text-[11px] no-scrollbar">
            {prompts.map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(p)}
                disabled={loading}
                className={`whitespace-nowrap px-3 py-1 rounded-full border text-[10px] font-mono transition-colors cursor-pointer disabled:opacity-50 ${
                  p.toLowerCase().includes("stock")
                    ? "border-vermilion/40 text-vermilion bg-vermilion/5 hover:bg-vermilion/10"
                    : "border-rule text-ink bg-slate-100 hover:bg-slate-200"
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto p-3.5 space-y-3 text-xs">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${m.sender === "user" ? "items-end" : "items-start"}`}
              >
                <div
                  className={`max-w-[85%] p-3 rounded-2xl whitespace-pre-wrap leading-relaxed ${
                    m.sender === "user"
                      ? "bg-ink text-white font-sans"
                      : m.refused
                      ? "bg-vermilion/10 border border-vermilion/30 text-ink font-sans"
                      : "bg-slate-100 border border-rule text-ink font-sans"
                  }`}
                >
                  {m.refused && (
                    <div className="flex items-center gap-1 text-vermilion font-bold font-mono text-[10px] mb-1">
                      <AlertTriangle className="w-3 h-3" />
                      <span>Refusal Triggered: Investment Advice Filter</span>
                    </div>
                  )}
                  {m.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex items-center gap-1.5 text-ink-soft text-xs italic p-1">
                <span className="w-1.5 h-1.5 rounded-full bg-pin-red animate-bounce" />
                <span className="w-1.5 h-1.5 rounded-full bg-pin-red animate-bounce [animation-delay:0.2s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-pin-red animate-bounce [animation-delay:0.4s]" />
                <span className="font-mono text-[10px] ml-1">Consulting deterministic engine...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Bar */}
          <div className="p-3 bg-[#f6f6f3] dark:bg-[#262622] border-t border-rule flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Ask about your due date, limit, or terms..."
              className="flex-1 bg-white dark:bg-[#1c1c1a] border border-rule rounded-full px-4 py-2 text-xs text-ink placeholder:text-ink-soft/60 focus:outline-none focus:ring-2 focus:ring-blue-600"
              aria-label="Chat input"
            />
            <button
              onClick={() => handleSend()}
              disabled={loading || !input.trim()}
              className="p-2 rounded-full bg-ink text-white hover:bg-ink-soft disabled:opacity-40 transition-colors cursor-pointer"
              aria-label="Send message"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
