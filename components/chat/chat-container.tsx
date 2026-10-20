"use client";

import React, { useRef, useEffect, useState } from "react";
import { MessageBubble } from "./message-bubble";
import { TypingIndicator } from "./typing-indicator";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Square, AlertCircle, RefreshCw } from "lucide-react";
import { ChatMessageItem } from "@/hooks/use-chat";

interface ChatContainerProps {
  messages: ChatMessageItem[];
  isLoading: boolean;
  error: string | null;
  onSendMessage: (text: string) => void;
  onStopGeneration: () => void;
  onRestart?: () => void;
  placeholder?: string;
  charLimit?: number;
}

export function ChatContainer({
  messages,
  isLoading,
  error,
  onSendMessage,
  onStopGeneration,
  onRestart,
  placeholder = "Type your response here (or ask for clarification)...",
  charLimit = 6000,
}: ChatContainerProps) {
  const [input, setInput] = useState("");
  const scrollEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    scrollEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;
    onSendMessage(input);
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="flex flex-col h-[650px] border border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50/30 dark:bg-slate-900/40 shadow-xs overflow-hidden">
      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {messages.map((m) => (
          <MessageBubble
            key={m.id}
            role={m.role}
            content={m.content}
            timestamp={m.timestamp}
          />
        ))}

        {isLoading && (
          <div className="py-2">
            <TypingIndicator />
          </div>
        )}

        {error && (
          <div className="p-4 rounded-xl border border-red-200 bg-red-50 dark:bg-red-950/40 dark:border-red-900/60 text-red-800 dark:text-red-200 text-sm flex items-start gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 text-red-600 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold">Notice</p>
              <p className="mt-0.5 text-xs text-red-700 dark:text-red-300">{error}</p>
            </div>
            {onRestart && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRestart}
                className="text-xs bg-white dark:bg-slate-900"
              >
                <RefreshCw className="w-3 h-3 mr-1" />
                Reset
              </Button>
            )}
          </div>
        )}

        <div ref={scrollEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-3 sm:p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <form onSubmit={handleSubmit} className="flex flex-col gap-2">
          <div className="relative">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value.slice(0, charLimit))}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              rows={3}
              className="pr-12 resize-none text-sm rounded-xl"
              disabled={isLoading}
            />
            <div className="absolute right-2.5 bottom-2.5 flex items-center gap-1.5">
              {isLoading ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={onStopGeneration}
                  className="h-8 px-2 text-xs text-red-600 border-red-200 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-950"
                  title="Stop generation"
                >
                  <Square className="w-3 h-3 mr-1 fill-current" />
                  Stop
                </Button>
              ) : (
                <Button
                  type="submit"
                  size="sm"
                  disabled={!input.trim()}
                  className="h-8 w-8 p-0 bg-[#0A234B] hover:bg-[#081b3a] dark:bg-blue-600"
                  title="Send message (Enter)"
                >
                  <Send className="w-3.5 h-3.5" />
                </Button>
              )}
            </div>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
            <span>Press Enter to send, Shift+Enter for new line</span>
            <span>
              {input.length}/{charLimit}
            </span>
          </div>
        </form>
      </div>
    </div>
  );
}
