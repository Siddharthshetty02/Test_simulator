"use client";

import React from "react";
import { Flame, CalendarCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface StreakCardProps {
  currentStreak: number;
  totalDays: number;
  practiceDates: string[];
}

export function StreakCard({
  currentStreak,
  totalDays,
  practiceDates,
}: StreakCardProps) {
  // Generate the last 28 days (4 weeks)
  const days: { dateStr: string; dayNum: number; active: boolean }[] = [];
  const today = new Date();

  for (let i = 27; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    days.push({
      dateStr,
      dayNum: d.getDate(),
      active: practiceDates.includes(dateStr),
    });
  }

  return (
    <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-500 flex items-center justify-center">
            <Flame className="w-4 h-4 fill-current" />
          </div>
          <div>
            <h3 className="font-semibold text-sm text-slate-900 dark:text-white">
              Daily Practice Streak
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Consistency is key for intern interviews
            </p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-2xl font-black text-amber-500">
            {currentStreak}
          </span>
          <span className="text-xs text-slate-400 ml-1">days</span>
        </div>
      </div>

      {/* 28-day activity grid */}
      <div>
        <div className="text-[11px] font-semibold text-slate-400 mb-2 flex items-center justify-between">
          <span>Last 4 Weeks Activity</span>
          <span>{totalDays} active days total</span>
        </div>
        <div className="grid grid-cols-7 gap-1.5">
          {days.map((item, idx) => (
            <div
              key={idx}
              title={`${item.dateStr}: ${item.active ? "Practiced" : "No activity"}`}
              className={cn(
                "h-7 rounded-md text-[10px] font-mono flex items-center justify-center transition-all",
                item.active
                  ? "bg-amber-500 text-white font-bold shadow-xs"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
              )}
            >
              {item.dayNum}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
