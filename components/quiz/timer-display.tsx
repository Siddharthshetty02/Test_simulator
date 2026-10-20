import React from "react";
import { Clock, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface TimerDisplayProps {
  secondsLeft: number;
  className?: string;
}

export function TimerDisplay({ secondsLeft, className }: TimerDisplayProps) {
  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const isUrgent = secondsLeft > 0 && secondsLeft <= 120; // under 2 mins

  return (
    <div
      className={cn(
        "flex items-center gap-2 px-3 py-1.5 rounded-lg font-mono text-sm font-semibold border transition-colors",
        isUrgent
          ? "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/60 dark:text-red-300 dark:border-red-800 animate-pulse"
          : "bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700",
        className
      )}
    >
      {isUrgent ? (
        <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />
      ) : (
        <Clock className="w-4 h-4 text-slate-500 dark:text-slate-400" />
      )}
      <span>
        {mins.toString().padStart(2, "0")}:{secs.toString().padStart(2, "0")}
      </span>
    </div>
  );
}
