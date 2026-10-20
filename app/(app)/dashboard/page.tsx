"use client";

import React, { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { WeakTopicsChart } from "@/components/dashboard/weak-topics-chart";
import { StreakCard } from "@/components/dashboard/streak-card";
import { RecentSessions, UnifiedSession } from "@/components/dashboard/recent-sessions";
import { storage } from "@/lib/storage";
import { TARGET_COMPANY } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
  Bot,
  BrainCircuit,
  FileSearch,
  MessageSquareCheck,
  ArrowRight,
  Sparkles,
} from "lucide-react";

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false);
  const [stats, setStats] = useState({
    quizCount: 0,
    avgScore: 0,
    interviewCount: 0,
    currentStreak: 0,
    totalDays: 0,
    practiceDates: [] as string[],
    topicStats: [] as { topic: string; accuracy: number; total: number; correct: number }[],
    recentSessions: [] as UnifiedSession[],
  });

  useEffect(() => {
    setMounted(true);
    const quizzes = storage.getQuizHistory();
    const interviews = storage.getInterviewSessions();
    const coaches = storage.getCoachSessions();
    const streak = storage.calculateStreak();
    const practiceDates = storage.getPracticeDates();

    // Average score calculation
    let avg = 0;
    if (quizzes.length > 0) {
      const totalScorePercent = quizzes.reduce(
        (acc, q) => acc + (q.score / q.totalQuestions) * 100,
        0
      );
      avg = Math.round(totalScorePercent / quizzes.length);
    }

    // Per-topic accuracy aggregation
    const topicTotals: Record<string, { correct: number; total: number }> = {};
    quizzes.forEach((attempt) => {
      Object.entries(attempt.topicAccuracy || {}).forEach(([topic, s]) => {
        if (!topicTotals[topic]) topicTotals[topic] = { correct: 0, total: 0 };
        topicTotals[topic].correct += s.correct;
        topicTotals[topic].total += s.total;
      });
    });

    const topicStats = Object.entries(topicTotals).map(([topic, s]) => ({
      topic,
      accuracy: Math.round((s.correct / s.total) * 100),
      total: s.total,
      correct: s.correct,
    }));

    // Unified recent sessions
    const unified: UnifiedSession[] = [
      ...quizzes.map((q) => ({
        id: q.id,
        type: "quiz" as const,
        title: `${q.sectionLabel} Quiz`,
        subtitle: `${q.score}/${q.totalQuestions} correct`,
        timestamp: q.timestamp,
        scoreOrMetric: `${Math.round((q.score / q.totalQuestions) * 100)}%`,
        href: "/quiz",
      })),
      ...interviews.map((i) => ({
        id: i.id,
        type: "interview" as const,
        title: `${i.round === "online_test" ? "Online Test" : i.round === "technical_interview" ? "Technical" : "HR"} Interview`,
        subtitle: `${i.totalExchanges} exchanges`,
        timestamp: i.timestamp,
        href: "/interview",
      })),
      ...coaches.map((c) => ({
        id: c.id,
        type: "coach" as const,
        title: "Answer Coaching Review",
        subtitle: c.question.slice(0, 40) + "...",
        timestamp: c.timestamp,
        href: "/coach",
      })),
    ]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 8);

    setStats({
      quizCount: quizzes.length,
      avgScore: avg,
      interviewCount: interviews.length,
      currentStreak: streak.currentStreak,
      totalDays: streak.totalDays,
      practiceDates,
      topicStats,
      recentSessions: unified,
    });
  }, []);

  if (!mounted) return null;

  return (
    <AppShell>
      <div className="space-y-8">
        {/* Welcome Hero Banner */}
        <div className="relative overflow-hidden rounded-2xl bg-[#0A234B] text-white p-6 sm:p-8 shadow-sm">
          <div className="relative z-10 max-w-2xl space-y-3">
            <Badge variant="accent" className="bg-blue-500/20 text-blue-200 border-blue-400/30">
              Campus Placement Prep 2026
            </Badge>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Grid Dynamics Data Science Intern Hub
            </h1>
            <p className="text-sm text-blue-100/90 leading-relaxed">
              Targeted simulation and preparation suite designed for final-year engineering students. Drill technical MCQs, practice live streaming interviews, and analyze job descriptions.
            </p>
            <div className="pt-2 flex flex-wrap gap-3">
              <Link href="/interview">
                <Button variant="primary" size="md" className="bg-[#2563EB] hover:bg-blue-500">
                  <Bot className="w-4 h-4 mr-1.5" />
                  Start Mock Interview
                </Button>
              </Link>
              <Link href="/quiz">
                <Button
                  variant="outline"
                  size="md"
                  className="bg-white/10 hover:bg-white/20 text-white border-white/20"
                >
                  <BrainCircuit className="w-4 h-4 mr-1.5" />
                  Full Mock Test (25 Qs)
                </Button>
              </Link>
            </div>
          </div>
          <div className="absolute -right-12 -bottom-12 w-64 h-64 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
        </div>

        {/* Stats Summary Cards */}
        <StatsCards
          quizCount={stats.quizCount}
          avgScore={stats.avgScore}
          interviewCount={stats.interviewCount}
          streakDays={stats.currentStreak}
        />

        {/* Analytics & Streak Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <WeakTopicsChart topicStats={stats.topicStats} />
          </div>
          <div className="space-y-6">
            <StreakCard
              currentStreak={stats.currentStreak}
              totalDays={stats.totalDays}
              practiceDates={stats.practiceDates}
            />

            {/* Quick Practice Actions */}
            <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-3">
              <h4 className="font-semibold text-xs text-slate-900 dark:text-white uppercase tracking-wider">
                Quick Shortcuts
              </h4>
              <div className="space-y-2">
                <Link
                  href="/jd"
                  className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-xs font-medium text-slate-800 dark:text-slate-200 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <FileSearch className="w-4 h-4 text-blue-600" />
                    Extract JD Study Plan
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                </Link>
                <Link
                  href="/coach"
                  className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-xs font-medium text-slate-800 dark:text-slate-200 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <MessageSquareCheck className="w-4 h-4 text-emerald-600" />
                    STAR Answer Coach
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Sessions List */}
        <RecentSessions sessions={stats.recentSessions} />
      </div>
    </AppShell>
  );
}
