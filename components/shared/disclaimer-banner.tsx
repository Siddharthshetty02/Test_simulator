import React, { useState } from "react";
import { ShieldCheck, Info, X } from "lucide-react";
import { TARGET_COMPANY, DISCLAIMER_TEXT } from "@/lib/constants";

export function DisclaimerBanner() {
  const [dismissed, setDismissed] = useState(false);
  const [expanded, setExpanded] = useState(false);

  if (dismissed) return null;

  return (
    <div className="bg-blue-50/80 dark:bg-blue-950/40 border-b border-blue-100 dark:border-blue-900/60 px-4 py-2 text-xs text-blue-900 dark:text-blue-200">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-hidden">
          <ShieldCheck className="w-4 h-4 text-[#2563EB] shrink-0" />
          <span className="font-semibold text-slate-800 dark:text-slate-200 shrink-0">
            {TARGET_COMPANY} Intern Prep:
          </span>
          <span className="truncate text-slate-600 dark:text-slate-300 hidden sm:inline">
            Original educational practice material & prompts.
          </span>
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-[#2563EB] dark:text-blue-400 hover:underline font-medium ml-1 shrink-0 cursor-pointer"
          >
            {expanded ? "Hide note" : "Learn more"}
          </button>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer p-0.5"
          aria-label="Dismiss disclaimer"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
      {expanded && (
        <div className="max-w-7xl mx-auto mt-2 pt-2 border-t border-blue-200/50 dark:border-blue-800/50 text-slate-600 dark:text-slate-300 text-xs leading-relaxed flex items-start gap-2">
          <Info className="w-4 h-4 text-[#2563EB] shrink-0 mt-0.5" />
          <p>{DISCLAIMER_TEXT}</p>
        </div>
      )}
    </div>
  );
}
