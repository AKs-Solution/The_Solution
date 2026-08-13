"use client";

import { useState } from "react";
import { Bot, Send, Hash, FileCode, Sparkles } from "lucide-react";
import { CopilotResponse } from "@/server/copilot/copilot-engine";

interface MessageItem {
  id: string;
  sender: "USER" | "COPILOT";
  content: string;
  copilotData?: CopilotResponse;
  timestamp: string;
}

interface EngineeringCopilotChatProps {
  onSendQuery?: (query: string) => Promise<CopilotResponse>;
}

export function EngineeringCopilotChat({ onSendQuery }: EngineeringCopilotChatProps) {
  const [inputQuery, setInputQuery] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [messages, setMessages] = useState<MessageItem[]>([
    {
      id: "msg-welcome",
      sender: "COPILOT",
      content:
        "Hello! I am your Deterministic Engineering Copilot. Ask me anything about material choices, failure history, assumption invalidations, or certification evidence.",
      timestamp: new Date().toLocaleTimeString(),
    },
  ]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputQuery.trim() || loading) return;

    const userMsg: MessageItem = {
      id: `usr-${Date.now()}`,
      sender: "USER",
      content: inputQuery,
      timestamp: new Date().toLocaleTimeString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    const curr = inputQuery;
    setInputQuery("");
    setLoading(true);

    try {
      if (onSendQuery) {
        const resp = await onSendQuery(curr);
        const copilotMsg: MessageItem = {
          id: `cop-${Date.now()}`,
          sender: "COPILOT",
          content: resp.answer,
          copilotData: resp,
          timestamp: new Date().toLocaleTimeString(),
        };
        setMessages((prev) => [...prev, copilotMsg]);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-[600px] w-full flex-col rounded-xl border border-zinc-200 bg-white font-sans text-zinc-900 shadow-2xl">
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between border-b border-zinc-200 p-4">
        <div className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-indigo-400" />
          <h2 className="text-sm font-bold text-zinc-900">Engineering Copilot</h2>
          <span className="flex items-center gap-1 rounded border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 font-mono text-[11px] text-emerald-400">
            <Sparkles className="h-3 w-3" /> Evidence-Backed
          </span>
        </div>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex flex-col ${m.sender === "USER" ? "items-end" : "items-start"}`}
          >
            <div
              className={`max-w-[85%] space-y-3 rounded-xl p-4 text-xs leading-relaxed ${
                m.sender === "USER"
                  ? "rounded-br-none bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
                  : "rounded-bl-none border border-zinc-200 bg-zinc-100 text-zinc-900 shadow-md"
              }`}
            >
              <p>{m.content}</p>

              {m.copilotData && (
                <div className="space-y-2 border-t border-zinc-200 pt-3">
                  <div className="flex items-center justify-between font-mono text-[11px] text-zinc-500">
                    <span>Confidence: {Math.round(m.copilotData.confidenceScore * 100)}%</span>
                  </div>

                  {m.copilotData.evidenceHashes.length > 0 && (
                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-1 rounded border border-zinc-200 bg-white px-2 py-0.5 font-mono text-[10px] text-emerald-400">
                        <Hash className="h-3 w-3" /> {m.copilotData.evidenceHashes[0].slice(0, 16)}
                        ...
                      </span>
                    </div>
                  )}

                  {m.copilotData.reasoningChain.length > 0 && (
                    <div className="space-y-1 rounded-lg border border-zinc-200 bg-white p-2.5">
                      <div className="flex items-center gap-1 text-[10px] font-semibold tracking-wider text-zinc-500 uppercase">
                        <FileCode className="h-3 w-3 text-indigo-400" /> Reasoning Chain:
                      </div>
                      <ul className="space-y-0.5 font-mono text-[11px] text-zinc-700">
                        {m.copilotData.reasoningChain.map((step, idx) => (
                          <li key={idx}>{step}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
            <span className="mt-1 px-1 text-[10px] text-zinc-500">{m.timestamp}</span>
          </div>
        ))}
      </div>

      {/* Input Form */}
      <form
        onSubmit={handleSubmit}
        className="flex shrink-0 items-center gap-2 border-t border-zinc-200 p-4"
      >
        <input
          type="text"
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          placeholder="Ask Copilot about material selection, failure precedents, boundary limits..."
          className="flex-1 rounded-xl border border-zinc-200 bg-zinc-100 px-4 py-2.5 text-xs text-zinc-900 placeholder-zinc-500 transition-all focus:border-indigo-500 focus:outline-none"
        />
        <button
          type="submit"
          disabled={loading || !inputQuery.trim()}
          className="flex shrink-0 items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-600/25 transition-all hover:bg-indigo-500 disabled:opacity-50"
        >
          <Send className="h-3.5 w-3.5" /> Send
        </button>
      </form>
    </div>
  );
}
