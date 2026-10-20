"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Bot,
  BrainCircuit,
  FileSearch,
  MessageSquareCheck,
  Settings,
  Sparkles,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";
import { ThemeToggle } from "./theme-toggle";
import { APP_NAME, TARGET_COMPANY } from "@/lib/constants";

export const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/interview", label: "Mock Interview", icon: Bot },
  { href: "/quiz", label: "Quiz Generator", icon: BrainCircuit },
  { href: "/jd", label: "JD Analyzer", icon: FileSearch },
  { href: "/coach", label: "Answer Coach", icon: MessageSquareCheck },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex flex-col w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0F172A] h-screen sticky top-0 shrink-0 z-20 transition-colors duration-200">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <Link
          href="/dashboard"
          className="flex items-center gap-2.5 group transition-transform duration-200 hover:scale-[1.02]"
        >
          <div className="w-8 h-8 rounded-lg bg-[#0A234B] dark:bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-sm group-hover:bg-[#2563EB] transition-colors">
            GD
          </div>
          <div>
            <h1 className="font-bold text-sm text-[#0A234B] dark:text-white leading-tight">
              {APP_NAME}
            </h1>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1">
              <span>For {TARGET_COMPANY}</span>
              <Sparkles className="w-3 h-3 text-amber-500 inline" />
            </p>
          </div>
        </Link>
        <ThemeToggle />
      </div>

      {/* Navigation Links (Tabs) with Rich Hover Effect */}
      <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto">
        <div className="px-3 py-2 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
          Preparation Suite
        </div>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group relative flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer select-none",
                isActive
                  ? "bg-[#0A234B] text-white shadow-sm dark:bg-blue-600 dark:text-white"
                  : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-slate-800/80 hover:translate-x-1 hover:shadow-xs active:scale-[0.98]"
              )}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={cn(
                    "w-4 h-4 shrink-0 transition-transform duration-200",
                    isActive
                      ? "text-white"
                      : "text-slate-400 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:scale-110"
                  )}
                />
                <span className="truncate">{item.label}</span>
              </div>

              {/* Hover chevron for inactive, indicator dot for active */}
              {isActive ? (
                <span className="w-1.5 h-1.5 rounded-full bg-white/90" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 text-slate-400 dark:text-slate-500" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Target Notice & Footer */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40 transition-colors">
        <div className="flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-400">
          <ShieldCheck className="w-4 h-4 text-[#2563EB] dark:text-blue-400 shrink-0 mt-0.5" />
          <p className="leading-snug">
            Curated practice simulator for Indian campus interns targeting {TARGET_COMPANY}.
          </p>
        </div>
      </div>
    </aside>
  );
}
