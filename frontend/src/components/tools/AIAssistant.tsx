"use client";

import React, { useState, useRef, useEffect } from "react";
import { assistantChat } from "@/lib/api/client";

interface AIAssistantProps {
  algorithm: string;
  datasetName: string;
  metrics?: Record<string, unknown>;
}

interface Message {
  role: "user" | "assistant";
  content: string;
  source?: string;
}

const QUICK_QUESTIONS = [
  "Why is the decision boundary shaped like this?",
  "Is this model overfitting or underfitting?",
  "How can I improve the accuracy?",
  "What does this metric mean?",
  "What happens if I change the hyperparameters?",
  "Which algorithm should I try next?",
];

export function AIAssistant({ algorithm, datasetName, metrics }: AIAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;

    const userMsg: Message = { role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await assistantChat({
        message: text,
        context: { algorithm, dataset: datasetName, metrics },
      });
      const assistantMsg: Message = { role: "assistant", content: res.response, source: res.source };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "Sorry, I couldn't process that. Please try again.", source: "error" }]);
    }
    setLoading(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <div className="flex flex-col h-full">
      <h3 className="text-sm font-medium text-foreground mb-3">AI Assistant</h3>

      {messages.length === 0 && (
        <div className="space-y-3 mb-4">
          <p className="text-xs text-muted-foreground">
            Ask questions about your current exploration: {algorithm} on {datasetName}
          </p>
          <div className="space-y-1">
            {QUICK_QUESTIONS.map((q) => (
              <button key={q} onClick={() => sendMessage(q)}
                className="w-full text-left px-2 py-1.5 rounded text-[10px] text-muted-foreground hover:bg-accent hover:text-foreground transition-colors">
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      <div ref={chatRef} className="flex-1 overflow-y-auto space-y-3 mb-3 min-h-0">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[85%] rounded-lg px-3 py-2 text-xs ${
              msg.role === "user"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-foreground"
            }`}>
              <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
              {msg.source && msg.source !== "error" && (
                <div className="text-[9px] opacity-50 mt-1">{msg.source === "llm" ? "AI-powered" : "Built-in"}</div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-muted rounded-lg px-3 py-2 text-xs text-muted-foreground animate-pulse">Thinking...</div>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question..."
          className="flex-1 px-3 py-2 rounded-md border border-border bg-background text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          disabled={loading}
        />
        <button type="submit" disabled={loading || !input.trim()}
          className="px-3 py-2 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 disabled:opacity-50">
          Send
        </button>
      </form>
    </div>
  );
}
