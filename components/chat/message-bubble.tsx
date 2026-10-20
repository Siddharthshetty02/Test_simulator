"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";
import { CopyButton } from "./copy-button";
import { Bot, User } from "lucide-react";

interface MessageBubbleProps {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp?: string;
}

export function MessageBubble({ role, content, timestamp }: MessageBubbleProps) {
  const isUser = role === "user";

  return (
    <div
      className={cn(
        "flex w-full gap-3 py-2",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      {!isUser && (
        <div className="w-8 h-8 rounded-lg bg-[#0A234B] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
          <Bot className="w-4 h-4" />
        </div>
      )}

      <div
        className={cn(
          "relative group max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 shadow-xs text-sm transition-all",
          isUser
            ? "bg-[#0A234B] text-white rounded-tr-xs dark:bg-blue-600"
            : "bg-white text-slate-800 border border-slate-200 rounded-tl-xs dark:bg-slate-900 dark:border-slate-800 dark:text-slate-100"
        )}
      >
        {!isUser && (
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <CopyButton text={content} />
          </div>
        )}

        <div className={cn("markdown-body", isUser ? "text-white" : "")}>
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>

        {timestamp && (
          <div
            className={cn(
              "text-[10px] mt-1 text-right",
              isUser ? "text-blue-200" : "text-slate-400"
            )}
          >
            {timestamp}
          </div>
        )}
      </div>

      {isUser && (
        <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
          <User className="w-4 h-4" />
        </div>
      )}
    </div>
  );
}
