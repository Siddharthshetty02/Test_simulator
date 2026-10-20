"use client";

import React from "react";
import { formatDate } from "@/lib/utils";
import { BrainCircuit, Bot, MessageSquareCheck, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export interface UnifiedSession {
  id: string;
  type: "quiz" | "interview" | "coach";
  title: string;
  subtitle: string;
  timestamp: string;
  scoreOrMetric?: string;
  href: string;
}

interface RecentSessionsProps {
  sessions: UnifiedSession[];
}

export function RecentSessions({ sessions }: RecentSessionsProps) {
  if (!sessions.length) {
    return (
      <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-3">
        <h3 className="font-semibold text-base text-slate-900 dark:text-white">
          Recent Activity
        </h3>
        <p className="text-xs text-slate-500 py-6 text-center">
          No practice history yet. Take your first quiz or start a mock interview!
        </p>
      </div>
    );
  }

  const getIcon = (type: UnifiedSession["type"]) => {
    switch (type) {
      case "quiz":
        return <BrainCircuit className="w-4 h-4 text-blue-600 dark:text-blue-400" />;
      case "interview":
        return <Bot className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />;
      case "coach":
        return <MessageSquareCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />;
    }
  };

  return (
    <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-base text-slate-900 dark:text-white">
          Recent Sessions
        </h3>
        <span className="text-xs text-slate-400">{sessions.length} recorded</span>
      </div>

      <div className="space-y-2.5">
        {sessions.map((item) => (
          <div
            key={item.id}
            className="p-3.5 rounded-xl border border-slate-200/60 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/50 flex items-center justify-between gap-3 hover:border-blue-500/40 dark:hover:border-slate-700 transition-all"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0">
                {getIcon(item.type)}
              </div>
              <div className="min-w-0 space-y-0.5">
                <div className="font-semibold text-xs text-slate-900 dark:text-slate-100 truncate">
                  {item.title}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                  {item.subtitle} · {formatDate(item.timestamp)}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              {item.scoreOrMetric && (
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {item.scoreOrMetric}
                </span>
              )}
              <Link href={item.href}>
                <Button variant="ghost" size="icon" className="h-7 w-7">
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
