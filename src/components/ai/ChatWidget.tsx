"use client";

import * as React from "react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { MessageCircle, X, Send, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import type { GeminiChatMessage } from "@/lib/ai/chat";

interface ChatWidgetProps {
  orgName: string;
  isPro: boolean;
  aiCreditsBalance: number;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  actionUsed?: string;
  creditsCost?: number;
}

const SUGGESTED_PROMPTS = [
  "What jobs are currently open?",
  "Help me write a job description",
  "How do I move a candidate to the next stage?",
  "What's the best way to reject a candidate?",
];

export function ChatWidget({ orgName: _orgName, isPro: _isPro, aiCreditsBalance }: ChatWidgetProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [geminiHistory, setGeminiHistory] = React.useState<GeminiChatMessage[]>([]);
  const [input, setInput] = React.useState("");
  const [isStreaming, setIsStreaming] = React.useState(false);
  const [streamingText, setStreamingText] = React.useState("");
  const [creditsRemaining, setCreditsRemaining] = React.useState<number>(aiCreditsBalance);
  const [error, setError] = React.useState<string | null>(null);

  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  // Auto-scroll on new messages / streaming
  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingText]);

  // Focus textarea when panel opens
  React.useEffect(() => {
    if (isOpen) {
      setTimeout(() => textareaRef.current?.focus(), 100);
    }
  }, [isOpen]);

  async function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed || isStreaming) return;

    setError(null);
    setInput("");

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: trimmed,
    };

    const newGeminiHistory: GeminiChatMessage[] = [
      ...geminiHistory,
      { role: "user", parts: [{ text: trimmed }] },
    ];

    setMessages((prev) => [...prev, userMessage]);
    setIsStreaming(true);
    setStreamingText("");

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed, history: geminiHistory }),
      });

      if (!res.ok) {
        const data = await res.json();
        if (res.status === 402) {
          setError(data.message ?? "Out of AI credits.");
        } else {
          setError("Something went wrong. Please try again.");
        }
        setIsStreaming(false);
        return;
      }

      const reader = res.body?.getReader();
      if (!reader) {
        setError("Failed to read response stream.");
        setIsStreaming(false);
        return;
      }

      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const parsed = JSON.parse(line.slice(6));

            if (parsed.text) {
              accumulated += parsed.text;
              setStreamingText(accumulated);
            }

            if (parsed.done) {
              if (typeof parsed.creditsRemaining === "number") {
                setCreditsRemaining(parsed.creditsRemaining);
              }
              const assistantMessage: Message = {
                id: crypto.randomUUID(),
                role: "assistant",
                content: accumulated,
                actionUsed: parsed.actionUsed,
                creditsCost: parsed.creditsCost,
              };
              setMessages((prev) => [...prev, assistantMessage]);
              setGeminiHistory([
                ...newGeminiHistory,
                { role: "model", parts: [{ text: accumulated }] },
              ]);
              setStreamingText("");
              setIsStreaming(false);
            }

            if (parsed.error) {
              setError("Generation failed. Please try again.");
              setIsStreaming(false);
            }
          } catch {
            // skip malformed lines
          }
        }
      }
    } catch {
      setError("Connection error. Please try again.");
      setIsStreaming(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  }

  function handleClose() {
    setIsOpen(false);
  }

  return (
    <>
      {/* Floating button — bottom-right, above FeedbackSystem vertical tab */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2.5 rounded-full shadow-lg transition-all hover:scale-105 active:scale-95"
        >
          <Sparkles className="h-4 w-4" />
          <span className="text-sm font-semibold">Ask Kite</span>
        </button>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
          onClick={handleClose}
        />
      )}

      {/* Chat panel — slides in from right */}
      <div
        className={cn(
          "fixed top-0 right-0 h-screen w-full sm:w-[420px] z-50 bg-white dark:bg-gray-900 shadow-2xl flex flex-col transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b dark:border-gray-700 flex items-center justify-between shrink-0 bg-teal-600 dark:bg-teal-700">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-white" />
            <span className="text-lg font-bold text-white">Kite</span>
            <span className="text-xs text-teal-100 font-medium">AI Assistant</span>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg hover:bg-teal-700 dark:hover:bg-teal-600 text-white/80 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Empty state with suggested prompts */}
          {messages.length === 0 && !isStreaming && (
            <div className="space-y-4">
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center pt-4">
                Hi! I&apos;m Kite, your hiring assistant. Ask me anything.
              </p>
              <div className="grid grid-cols-1 gap-2">
                {SUGGESTED_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => sendMessage(prompt)}
                    className="text-left text-sm px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-teal-400 dark:hover:border-teal-500 hover:bg-teal-50 dark:hover:bg-teal-900/20 text-gray-700 dark:text-gray-300 transition-colors"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Message history */}
          {messages.map((msg) => (
            <React.Fragment key={msg.id}>
              <div
                className={cn(
                  "flex",
                  msg.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                {msg.role === "assistant" && (
                  <div className="h-6 w-6 rounded-full bg-teal-100 dark:bg-teal-900 flex items-center justify-center mr-2 mt-0.5 shrink-0">
                    <Sparkles className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
                  </div>
                )}
                <div
                  className={cn(
                    "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm",
                    msg.role === "user"
                      ? "bg-teal-600 text-white rounded-br-sm"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-bl-sm"
                  )}
                >
                  {msg.role === "assistant" ? (
                    <div className="prose prose-sm dark:prose-invert max-w-none prose-p:my-1 prose-ul:my-1 prose-li:my-0.5 prose-headings:my-1">
                      <ReactMarkdown
                        components={{
                          a: ({ href, children }) => {
                            if (href?.startsWith("/")) {
                              return (
                                <Link
                                  href={href}
                                  onClick={handleClose}
                                  className="text-teal-600 dark:text-teal-400 underline hover:no-underline"
                                >
                                  {children}
                                </Link>
                              );
                            }
                            return (
                              <a
                                href={href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-teal-600 dark:text-teal-400 underline hover:no-underline"
                              >
                                {children}
                              </a>
                            );
                          },
                        }}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <span>{msg.content}</span>
                  )}
                </div>
              </div>
              {msg.role === "assistant" && msg.creditsCost && msg.creditsCost > 0 && (
                <div className="flex justify-start pl-8 -mt-2">
                  <span className="inline-flex items-center gap-1 text-xs text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/30 border border-teal-200 dark:border-teal-800 rounded-full px-2 py-0.5">
                    <Sparkles className="h-3 w-3" />
                    {msg.creditsCost} credits used
                  </span>
                </div>
              )}
            </React.Fragment>
          ))}

          {/* Streaming response */}
          {isStreaming && (
            <div className="flex justify-start">
              <div className="h-6 w-6 rounded-full bg-teal-100 dark:bg-teal-900 flex items-center justify-center mr-2 mt-0.5 shrink-0">
                <Sparkles className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
              </div>
              <div className="max-w-[85%] rounded-2xl rounded-bl-sm bg-gray-100 dark:bg-gray-800 px-4 py-2.5 text-sm text-gray-900 dark:text-gray-100">
                {streamingText ? (
                  <div className="prose prose-sm dark:prose-invert max-w-none prose-p:my-1 prose-ul:my-1 prose-li:my-0.5">
                    <ReactMarkdown
                      components={{
                        a: ({ href, children }) =>
                          href?.startsWith("/") ? (
                            <Link href={href} onClick={handleClose} className="text-teal-600 dark:text-teal-400 underline">
                              {children}
                            </Link>
                          ) : (
                            <a href={href} target="_blank" rel="noopener noreferrer" className="text-teal-600 dark:text-teal-400 underline">
                              {children}
                            </a>
                          ),
                      }}
                    >
                      {streamingText}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <span className="flex gap-1 items-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-bounce [animation-delay:0ms]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-bounce [animation-delay:150ms]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-bounce [animation-delay:300ms]" />
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-4 py-3 text-sm text-red-700 dark:text-red-400">
              {error.includes("[") ? (
                <ReactMarkdown
                  components={{
                    a: ({ href, children }) =>
                      href?.startsWith("/") ? (
                        <Link href={href} onClick={handleClose} className="underline font-medium">
                          {children}
                        </Link>
                      ) : (
                        <a href={href} target="_blank" rel="noopener noreferrer" className="underline font-medium">
                          {children}
                        </a>
                      ),
                  }}
                >
                  {error}
                </ReactMarkdown>
              ) : (
                error
              )}
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <div className="shrink-0 border-t dark:border-gray-700 p-4 space-y-2">
          <div className="flex gap-2 items-end">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything about hiring..."
              rows={1}
              disabled={isStreaming}
              className="flex-1 resize-none rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-2.5 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent disabled:opacity-50 min-h-[42px] max-h-[120px] overflow-y-auto"
              style={{ height: "auto" }}
              onInput={(e) => {
                const el = e.currentTarget;
                el.style.height = "auto";
                el.style.height = Math.min(el.scrollHeight, 120) + "px";
              }}
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || isStreaming}
              className="h-[42px] w-[42px] shrink-0 flex items-center justify-center rounded-xl bg-teal-600 hover:bg-teal-700 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {isStreaming ? (
                <MessageCircle className="h-4 w-4 animate-pulse" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </button>
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Q&amp;A is free · Actions cost credits · {creditsRemaining} remaining
          </p>
        </div>
      </div>
    </>
  );
}
