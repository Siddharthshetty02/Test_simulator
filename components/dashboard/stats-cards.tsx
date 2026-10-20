import React from "react";
import { BrainCircuit, Bot, Flame, Award } from "lucide-react";
import { TARGET_COMPANY } from "@/lib/constants";

interface StatsCardsProps {
  quizCount: number;
  avgScore: number;
  interviewCount: number;
  streakDays: number;
}

export function StatsCards({
  quizCount,
  avgScore,
  interviewCount,
  streakDays,
}: StatsCardsProps) {
  const stats = [
    {
      title: "Tests Completed",
      value: quizCount,
      desc: `Original ${TARGET_COMPANY} practice sets`,
      icon: BrainCircuit,
      color: "text-blue-600 bg-blue-50 dark:bg-blue-950/60 dark:text-blue-400",
    },
    {
      title: "Average Score",
      value: `${avgScore}%`,
      desc: quizCount > 0 ? "Overall assessment accuracy" : "No tests completed yet",
      icon: Award,
      color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 dark:text-emerald-400",
    },
    {
      title: "Mock Interviews",
      value: interviewCount,
      desc: "Live simulated sessions",
      icon: Bot,
      color: "text-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 dark:text-indigo-400",
    },
    {
      title: "Practice Streak",
      value: `${streakDays} ${streakDays === 1 ? "Day" : "Days"}`,
      desc: streakDays > 0 ? "Active preparation consistency" : "Start your streak today",
      icon: Flame,
      color: "text-amber-600 bg-amber-50 dark:bg-amber-950/60 dark:text-amber-400",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((item, idx) => {
        const Icon = item.icon;
        return (
          <div
            key={idx}
            className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-2 hover:border-slate-300 dark:hover:border-slate-700 transition-all"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                {item.title}
              </span>
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${item.color}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {item.value}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
              {item.desc}
            </p>
          </div>
        );
      })}
    </div>
  );
}
