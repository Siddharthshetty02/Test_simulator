import React from "react";
import { cn } from "@/lib/utils";
import { Flag, Check } from "lucide-react";

interface QuestionPaletteProps {
  total: number;
  currentIndex: number;
  userAnswers: Record<number, number>;
  markedForReview: Set<number>;
  onSelect: (index: number) => void;
  className?: string;
}

export function QuestionPalette({
  total,
  currentIndex,
  userAnswers,
  markedForReview,
  onSelect,
  className,
}: QuestionPaletteProps) {
  return (
    <div className={cn("p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4", className)}>
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Question Palette
        </h4>
        <span className="text-xs text-slate-500 font-medium">
          {Object.keys(userAnswers).length}/{total} Answered
        </span>
      </div>

      {/* Grid of question buttons */}
      <div className="grid grid-cols-5 gap-2 max-h-60 overflow-y-auto p-1">
        {Array.from({ length: total }, (_, i) => {
          const isAnswered = userAnswers[i] !== undefined;
          const isMarked = markedForReview.has(i);
          const isCurrent = currentIndex === i;

          return (
            <button
              key={i}
              type="button"
              onClick={() => onSelect(i)}
              className={cn(
                "relative h-9 rounded-lg text-xs font-semibold flex items-center justify-center transition-all duration-150 cursor-pointer border hover:scale-105 active:scale-95",
                isCurrent && "ring-2 ring-[#2563EB] ring-offset-1 z-10",
                isAnswered
                  ? "bg-emerald-600 text-white border-emerald-600 dark:bg-emerald-600 hover:bg-emerald-500 shadow-xs"
                  : "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 hover:border-slate-300"
              )}
            >
              <span>{i + 1}</span>
              {isMarked && (
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-xs">
                  <Flag className="w-2 h-2 fill-current" />
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-2 text-[11px] text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-md bg-emerald-600" />
          <span>Answered</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-md bg-slate-200 dark:bg-slate-700" />
          <span>Unanswered</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-md border-2 border-[#2563EB]" />
          <span>Current</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-amber-500" />
          <span>Review Marked</span>
        </div>
      </div>
    </div>
  );
}
