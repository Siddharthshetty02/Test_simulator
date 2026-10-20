"use client";

import React from "react";
import Link from "next/link";
import { ThemeToggle } from "./theme-toggle";
import { TARGET_COMPANY, APP_NAME } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";

export function Header() {
  return (
    <header className="md:hidden sticky top-0 z-20 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-4 py-3 flex items-center justify-between">
      <Link href="/dashboard" className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-[#0A234B] dark:bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
          GD
        </div>
        <div>
          <span className="font-bold text-sm text-slate-900 dark:text-white">
            {APP_NAME}
          </span>
        </div>
      </Link>
      <div className="flex items-center gap-2">
        <Badge variant="accent" className="text-[10px] hidden xs:inline-flex">
          {TARGET_COMPANY}
        </Badge>
        <ThemeToggle />
      </div>
    </header>
  );
}
