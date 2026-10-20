"use client";

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { BrainCircuit, AlertTriangle, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface TopicStat {
  topic: string;
  accuracy: number;
  total: number;
  correct: number;
}

interface WeakTopicsChartProps {
  topicStats: TopicStat[];
}

export function WeakTopicsChart({ topicStats }: WeakTopicsChartProps) {
  if (!topicStats.length) {
    return (
      <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4">
        <h3 className="font-semibold text-base text-slate-900 dark:text-white flex items-center gap-2">
          <BrainCircuit className="w-5 h-5 text-[#2563EB]" />
          Topic Mastery Analytics
        </h3>
        <div className="py-12 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl space-y-2">
          <p className="text-xs text-slate-500">
            No quiz data recorded yet. Complete a test or mock exam to visualize your performance by topic.
          </p>
          <Link href="/quiz">
            <Button variant="outline" size="sm" className="mt-2 text-xs">
              Start a Diagnostic Quiz
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Sort by lowest accuracy first to highlight weak topics
  const sorted = [...topicStats].sort((a, b) => a.accuracy - b.accuracy);
  const weakTopics = sorted.filter((t) => t.accuracy < 70);

  return (
    <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="font-semibold text-base text-slate-900 dark:text-white flex items-center gap-2">
            <BrainCircuit className="w-5 h-5 text-[#2563EB]" />
            Topic Mastery & Weak Areas
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Aggregated accuracy across all your practice test questions
          </p>
        </div>
        {weakTopics.length > 0 && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-[11px] text-amber-700 dark:text-amber-300 font-semibold w-fit">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            <span>{weakTopics.length} topics below 70% benchmark</span>
          </div>
        )}
      </div>

      {/* Chart */}
      <div className="h-64 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={sorted}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <XAxis type="number" domain={[0, 100]} unit="%" tick={{ fontSize: 11 }} />
            <YAxis
              type="category"
              dataKey="topic"
              tick={{ fontSize: 11 }}
              width={120}
              tickFormatter={(val: string) => (val.length > 18 ? `${val.slice(0, 16)}…` : val)}
            />
            <Tooltip
              formatter={(value: any, name: any, item: any) => [
                `${value}% (${item.payload.correct}/${item.payload.total} correct)`,
                "Accuracy",
              ]}
              contentStyle={{
                backgroundColor: "rgba(15, 23, 42, 0.9)",
                borderColor: "#334155",
                borderRadius: "8px",
                color: "#fff",
                fontSize: "12px",
              }}
            />
            <Bar dataKey="accuracy" radius={[0, 6, 6, 0]}>
              {sorted.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={
                    entry.accuracy >= 75
                      ? "#16A34A" // emerald
                      : entry.accuracy >= 60
                      ? "#2563EB" // blue
                      : "#E11D48" // red
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Recommended Focus Area Advice */}
      {weakTopics.length > 0 && (
        <div className="p-3.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 text-xs space-y-1.5">
          <span className="font-semibold text-slate-800 dark:text-slate-200">
            Recommended Revision Focus:
          </span>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {weakTopics.map((t, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-200 text-[11px] font-medium"
              >
                {t.topic} ({t.accuracy}%)
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
