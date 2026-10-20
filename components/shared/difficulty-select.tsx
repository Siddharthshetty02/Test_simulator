import React from "react";
import { cn } from "@/lib/utils";
import { DIFFICULTY_LEVELS } from "@/lib/constants";
import { Sparkles, Zap } from "lucide-react";

interface DifficultySelectProps {
  value: "beginner" | "intermediate";
  onChange: (value: "beginner" | "intermediate") => void;
  className?: string;
}

export function DifficultySelect({ value, onChange, className }: DifficultySelectProps) {
  return (
    <div className={cn("grid grid-cols-2 gap-2 sm:gap-2.5", className)}>
      {DIFFICULTY_LEVELS.map((level) => {
        const isSelected = value === level.id;
        return (
          <button
            key={level.id}
            type="button"
            onClick={() => onChange(level.id as "beginner" | "intermediate")}
            className={cn(
              "flex flex-col text-left p-2.5 sm:p-3 rounded-xl border transition-all duration-200 cursor-pointer overflow-hidden hover:border-blue-500 dark:hover:border-blue-400",
              isSelected
                ? "border-[#2563EB] bg-blue-50/60 dark:bg-blue-950/40 dark:border-blue-500 shadow-xs ring-1 ring-[#2563EB]"
                : "border-slate-200 dark:border-slate-800 bg-transparent"
            )}
          >
            <div className="flex items-center justify-between gap-1.5 mb-1.5 w-full">
              <span className="font-semibold text-xs flex items-center gap-1.5 text-slate-900 dark:text-slate-100 min-w-0 flex-1">
                {level.id === "beginner" ? (
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                ) : (
                  <Zap className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                )}
                <span className="truncate">{level.label}</span>
              </span>
              <span
                className={cn(
                  "w-3.5 h-3.5 rounded-full border shrink-0 flex items-center justify-center ml-1",
                  isSelected
                    ? "border-[#2563EB] bg-[#2563EB]"
                    : "border-slate-300 dark:border-slate-600"
                )}
              >
                {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
              {level.desc}
            </p>
          </button>
        );
      })}
    </div>
  );
}
