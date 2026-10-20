import React from "react";

export function TypingIndicator() {
  return (
    <div className="flex items-center gap-1.5 px-3 py-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 w-fit shadow-xs">
      <span className="w-2 h-2 rounded-full bg-[#2563EB] animate-bounce [animation-delay:-0.3s]" />
      <span className="w-2 h-2 rounded-full bg-[#2563EB] animate-bounce [animation-delay:-0.15s]" />
      <span className="w-2 h-2 rounded-full bg-[#2563EB] animate-bounce" />
      <span className="text-xs text-slate-500 dark:text-slate-400 ml-1.5 font-medium">
        Evaluating response...
      </span>
    </div>
  );
}
