"use client";

import React, { useState } from "react";
import { Send, Sparkles, User, Bot, CornerDownLeft, HelpCircle } from "lucide-react";

export interface ChatMessage {
  id: string;
  sender: "customer" | "assistant";
  text: string;
  timestamp: string;
  isClarification?: boolean;
  missingFields?: string[];
}

interface ConversationPanelProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  isLoading?: boolean;
  onSelectScenario?: (text: string) => void;
}

export function ConversationPanel({
  messages,
  onSendMessage,
  isLoading = false,
  onSelectScenario,
}: ConversationPanelProps) {
  const [input, setInput] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    onSendMessage(input.trim());
    setInput("");
  };

  const demoScenarios = [
    {
      title: "Scenario 1: Exact Availability",
      text: "I need 3 business class tickets from Lagos to Dubai next Saturday.",
      badge: "Available",
    },
    {
      title: "Scenario 2: Alternative Dates (D-1 / D+1)",
      text: "I need a flight from Lagos to London on 2026-09-18 in economy.",
      badge: "Alternatives",
    },
    {
      title: "Scenario 3: Incomplete Request",
      text: "I need to go to London next week.",
      badge: "Clarification",
    },
  ];

  return (
    <div className="bg-white rounded-2xl border border-storm-200/80 shadow-storm-card overflow-hidden flex flex-col h-[560px]">
      {/* Panel Header */}
      <div className="bg-storm px-5 py-3.5 flex items-center justify-between border-b border-storm-700">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-cyan text-storm flex items-center justify-center font-bold">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">
              Customer Conversation
            </h3>
            <p className="text-[11px] text-storm-200">
              Natural-Language Flight Search Assistant
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-1.5 text-[11px] font-semibold text-cyan bg-cyan/10 px-2.5 py-1 rounded-full border border-cyan/20">
          <span className="w-2 h-2 rounded-full bg-cyan animate-pulse" />
          <span>DeepSeek NLU Active</span>
        </div>
      </div>

      {/* Preset Scenario Chips (Section 27) */}
      <div className="bg-storm-50/80 px-4 py-2 border-b border-storm-100 flex items-center space-x-2 overflow-x-auto text-xs">
        <span className="text-[10px] font-bold uppercase text-storm-400 shrink-0">
          Demo Presets:
        </span>
        {demoScenarios.map((sc, i) => (
          <button
            key={i}
            onClick={() => {
              setInput(sc.text);
              if (onSelectScenario) onSelectScenario(sc.text);
            }}
            className="shrink-0 px-2.5 py-1 rounded-lg bg-white hover:bg-storm-100 text-storm-700 font-medium border border-storm-200/80 transition-colors shadow-2xs flex items-center space-x-1.5"
          >
            <span className="text-[11px] font-bold text-storm-800">{sc.title.split(":")[0]}</span>
            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-cyan/20 text-cyan-800">
              {sc.badge}
            </span>
          </button>
        ))}
      </div>

      {/* Messages Stream */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-gradient-to-b from-white to-storm-50/30">
        {messages.map((msg) => {
          const isCustomer = msg.sender === "customer";
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-2.5 ${
                isCustomer ? "flex-row-reverse" : "flex-row"
              }`}
            >
              {/* Avatar */}
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold ${
                  isCustomer
                    ? "bg-storm-700 text-white"
                    : "bg-cyan text-storm shadow-cyan-sm"
                }`}
              >
                {isCustomer ? <User className="w-3.5 h-3.5" /> : <Bot className="w-4 h-4" />}
              </div>

              {/* Message Bubble */}
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed shadow-2xs ${
                  isCustomer
                    ? "bg-storm text-white rounded-tr-xs"
                    : msg.isClarification
                    ? "bg-amber-50 text-storm-800 border border-amber-200/80 rounded-tl-xs"
                    : "bg-storm-100/70 text-storm-900 border border-storm-200/60 rounded-tl-xs"
                }`}
              >
                {msg.isClarification && (
                  <div className="flex items-center space-x-1 text-amber-700 font-bold mb-1 text-[11px]">
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>Clarification Needed (Incomplete Request)</span>
                  </div>
                )}
                <p className="whitespace-pre-wrap">{msg.text}</p>
                <span
                  className={`text-[9px] mt-1 block ${
                    isCustomer ? "text-storm-300 text-right" : "text-storm-400"
                  }`}
                >
                  {msg.timestamp}
                </span>
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-start gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-cyan text-storm flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-storm-100/70 rounded-2xl rounded-tl-xs px-4 py-3 border border-storm-200/60">
              <div className="flex items-center space-x-1.5">
                <div className="w-2 h-2 rounded-full bg-cyan-600 animate-bounce" />
                <div className="w-2 h-2 rounded-full bg-cyan-600 animate-bounce [animation-delay:0.2s]" />
                <div className="w-2 h-2 rounded-full bg-cyan-600 animate-bounce [animation-delay:0.4s]" />
                <span className="text-[11px] text-storm-500 font-medium pl-1">
                  Interpreting with DeepSeek AI...
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Form */}
      <form
        onSubmit={handleSubmit}
        className="p-3 bg-white border-t border-storm-100 flex items-center space-x-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="e.g. 'I need 2 tickets from Lagos to London next Friday'..."
          disabled={isLoading}
          className="flex-1 px-4 py-2.5 text-xs bg-storm-50/80 rounded-xl border border-storm-200 text-storm focus:bg-white focus:border-cyan focus:ring-1 focus:ring-cyan outline-none transition-all"
        />
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          aria-label="Send message"
          className="w-10 h-10 rounded-xl bg-cyan text-storm flex items-center justify-center hover:bg-cyan-500 disabled:opacity-40 transition-colors shadow-cyan-sm shrink-0"
        >
          <Send className="w-4 h-4 stroke-[2.5]" />
        </button>
      </form>
    </div>
  );
}
