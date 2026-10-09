"use client";

import React, { useState } from "react";
import { useApp } from "@/lib/context/AppContext";
import { MessageSquareText, X, Send, AlertTriangle, Sparkles, BookOpen } from "lucide-react";
import { formatPaise } from "@/lib/utils";

interface ChatMessage {
  id: string;
  sender: "user" | "ascend";
  text: string;
  refused?: boolean;
}

export function AskMoneyModal() {
  const { chatOpen, setChatOpen, creditState, income, limitAssessment } = useApp();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      sender: "ascend",
      text: "Namaste! I am Ask About My Money. Ask me about your verified cash flow, repayment due dates, or credit terms. I never offer investment or stock tips.\n\nEducation, not investment advice.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const samplePrompts = [
    "What is my credit limit?",
    "When is my repayment due?",
    "What happens if I draw ₹300?",
    "Which stock should I buy?", // Refusal demo
  ];

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || input;
    if (!textToSend.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: `u_${Date.now()}`,
      sender: "user",
      text: textToSend,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
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
            medianIncomePaise: income?.medianQualifyingIncomePaise || 680000,
            cleanCycles: creditState.cleanCycles,
            historyStrength: creditState.historyStrength,
          },
        }),
      });

      const data = await res.json();
      const botMsg: ChatMessage = {
        id: `b_${Date.now()}`,
        sender: "ascend",
        text: data.answer || "Unable to retrieve response.",
        refused: data.refused,
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `err_${Date.now()}`,
          sender: "ascend",
          text: "Service temporarily unavailable. Please try again.\n\nEducation, not investment advice.",
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
        <div className="fixed bottom-24 right-4 md:bottom-20 md:right-6 w-[92vw] max-w-sm md:w-96 bg-paper-2 border-2 border-ink rounded-lg shadow-2xl z-50 flex flex-col h-[520px] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="p-3 bg-paper border-b border-rule flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-vermilion" />
              <div>
                <h3 className="font-serif font-bold text-sm text-ink leading-tight">Ask About My Money</h3>
                <p className="text-[10px] text-ink-soft">Plain-language cash flow education</p>
              </div>
            </div>
            <button
              onClick={() => setChatOpen(false)}
              className="p-1 rounded hover:bg-rule/30 text-ink-soft"
              aria-label="Close Ask About My Money"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Prompt Chips */}
          <div className="p-2 bg-paper/50 border-b border-rule/50 flex items-center gap-1.5 overflow-x-auto text-[11px] no-scrollbar">
            {samplePrompts.map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(p)}
                disabled={loading}
                className={`whitespace-nowrap px-2 py-1 rounded-full border text-[10px] font-mono transition-colors ${
                  p.includes("stock")
                    ? "border-vermilion/40 text-vermilion bg-vermilion/5 hover:bg-vermilion/10"
                    : "border-rule text-ink bg-paper hover:bg-paper-2"
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3 text-xs">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${m.sender === "user" ? "items-end" : "items-start"}`}
              >
                <div
                  className={`max-w-[85%] p-2.5 rounded-lg whitespace-pre-wrap leading-relaxed ${
                    m.sender === "user"
                      ? "bg-ink text-paper font-sans"
                      : m.refused
                      ? "bg-vermilion/10 border border-vermilion/30 text-ink font-sans"
                      : "bg-paper border border-rule text-ink font-sans"
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
                <span className="w-1.5 h-1.5 rounded-full bg-vermilion animate-bounce" />
                <span className="w-1.5 h-1.5 rounded-full bg-vermilion animate-bounce [animation-delay:0.2s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-vermilion animate-bounce [animation-delay:0.4s]" />
                <span className="font-mono text-[10px] ml-1">Consulting deterministic engine...</span>
              </div>
            )}
          </div>

          {/* Input Bar */}
          <div className="p-2.5 bg-paper border-t border-rule flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Ask about your due date, limit, or terms..."
              className="flex-1 bg-paper-2 border border-rule rounded px-3 py-1.5 text-xs text-ink placeholder:text-ink-soft/60 focus:outline-none focus:ring-1 focus:ring-ink"
            />
            <button
              onClick={() => handleSend()}
              disabled={loading || !input.trim()}
              className="p-1.5 rounded bg-ink text-paper hover:bg-ink-soft disabled:opacity-40 transition-colors"
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
