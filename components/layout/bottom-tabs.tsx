"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { NAV_ITEMS } from "./sidebar";

export function BottomTabs() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 dark:bg-[#0F172A]/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-2 py-1.5 flex items-center justify-around transition-colors">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive =
          pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "group flex flex-col items-center justify-center py-1.5 px-2.5 rounded-xl text-[10px] font-medium transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer",
              isActive
                ? "text-[#2563EB] dark:text-blue-400 font-bold bg-blue-50/80 dark:bg-blue-950/60 shadow-xs"
                : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80"
            )}
          >
            <Icon
              className={cn(
                "w-5 h-5 mb-0.5 transition-transform duration-200 group-hover:-translate-y-0.5",
                isActive ? "stroke-[2.5px] scale-105" : "group-hover:text-[#2563EB] dark:group-hover:text-blue-400"
              )}
            />
            <span className="truncate max-w-[64px]">{item.label.split(" ")[0]}</span>
          </Link>
        );
      })}
    </nav>
  );
}
