"use client";

import React, { useState } from "react";
import { QuizAttempt } from "@/lib/storage";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  CheckCircle,
  XCircle,
  Clock,
  RotateCcw,
  Sparkles,
  Award,
  ChevronDown,
  ChevronUp,
  FileDown,
} from "lucide-react";
import { formatDuration } from "@/lib/utils";
import { exportQuizScorecardPDF } from "@/lib/pdf-export";
import Link from "next/link";

interface QuizResultsProps {
  attempt: QuizAttempt;
  onRetake: () => void;
}

export function QuizResults({ attempt, onRetake }: QuizResultsProps) {
  const [filter, setFilter] = useState<"all" | "incorrect" | "correct">("all");
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const percentage = Math.round((attempt.score / attempt.totalQuestions) * 100);

  const getVerdict = () => {
    if (percentage >= 80)
      return {
        label: "Interview Ready",
        color: "text-emerald-600 dark:text-emerald-400",
        desc: "Outstanding grasp of Grid Dynamics internship topics. Keep practicing to maintain your edge!",
      };
    if (percentage >= 60)
      return {
        label: "Good Foundation",
        color: "text-blue-600 dark:text-blue-400",
        desc: "Solid understanding with a few knowledge gaps in edge cases or definitions.",
      };
    return {
      label: "Needs Revision",
      color: "text-amber-600 dark:text-amber-400",
      desc: "Focus on the weak topics identified below before attending the online test.",
    };
  };

  const verdict = getVerdict();

  const filteredQuestions = attempt.questions.filter((q) => {
    const isCorrect = q.userSelected === q.answerIndex;
    if (filter === "correct") return isCorrect;
    if (filter === "incorrect") return !isCorrect;
    return true;
  });

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Top Banner Result Card */}
      <div className="p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-[#0A234B]" />

        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 dark:bg-blue-950/60 mb-4 shadow-xs">
          <Award className="w-8 h-8 text-[#2563EB] dark:text-blue-400" />
        </div>

        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
          Test Completed!
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          {attempt.sectionLabel} · {attempt.difficulty} level
        </p>

        {/* Score metrics */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-8 py-4 border-y border-slate-100 dark:border-slate-800">
          <div>
            <div className="text-4xl font-extrabold text-[#0A234B] dark:text-white">
              {attempt.score}
              <span className="text-xl text-slate-400 font-normal">/{attempt.totalQuestions}</span>
            </div>
            <div className="text-xs font-semibold text-slate-500 mt-1 uppercase tracking-wider">
              Final Score ({percentage}%)
            </div>
          </div>

          <div className="hidden sm:block w-px h-12 bg-slate-200 dark:bg-slate-800" />

          <div>
            <div className={`text-2xl font-bold ${verdict.color}`}>{verdict.label}</div>
            <div className="text-xs text-slate-500 max-w-xs mt-1">{verdict.desc}</div>
          </div>

          {attempt.durationSeconds > 0 && (
            <>
              <div className="hidden sm:block w-px h-12 bg-slate-200 dark:bg-slate-800" />
              <div>
                <div className="text-2xl font-bold text-slate-800 dark:text-slate-200 flex items-center justify-center gap-1.5">
                  <Clock className="w-5 h-5 text-slate-400" />
                  {formatDuration(attempt.durationSeconds)}
                </div>
                <div className="text-xs font-semibold text-slate-500 mt-1 uppercase tracking-wider">
                  Time Taken
                </div>
              </div>
            </>
          )}
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Button onClick={onRetake} variant="primary" size="md">
            <RotateCcw className="w-4 h-4 mr-1.5" />
            Take Another Quiz
          </Button>
          <Button
            onClick={() => exportQuizScorecardPDF(attempt)}
            variant="outline"
            size="md"
            className="border-slate-300 dark:border-slate-700"
          >
            <FileDown className="w-4 h-4 mr-1.5 text-blue-600 dark:text-blue-400" />
            Export PDF Scorecard
          </Button>
          <Link href="/dashboard">
            <Button variant="outline" size="md">
              View Dashboard Analytics
            </Button>
          </Link>
        </div>
      </div>

      {/* Per-Topic Accuracy Breakdown */}
      {Object.keys(attempt.topicAccuracy).length > 0 && (
        <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4">
          <h3 className="font-semibold text-base text-slate-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#2563EB]" />
            Topic Breakdown
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Object.entries(attempt.topicAccuracy).map(([topic, stats]) => {
              const acc = Math.round((stats.correct / stats.total) * 100);
              const label = topic.toLowerCase().includes("full mock")
                ? "Full Mock Assessment"
                : topic;
              return (
                <div
                  key={topic}
                  className="p-3.5 rounded-xl border border-slate-200/60 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/50 space-y-2"
                >
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-800 dark:text-slate-200 truncate pr-2">
                      {label}
                    </span>
                    <span className={acc >= 70 ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"}>
                      {stats.correct}/{stats.total} ({acc}%)
                    </span>
                  </div>
                  <Progress
                    value={acc}
                    color={acc >= 70 ? "bg-emerald-600" : "bg-amber-500"}
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Question by Question Review */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="font-semibold text-lg text-slate-900 dark:text-white">
            Question-by-Question Review
          </h3>
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-medium border border-slate-200/60 dark:border-slate-700/60">
            <button
              onClick={() => setFilter("all")}
              className={`px-3 py-1 rounded-lg transition-all duration-200 cursor-pointer ${
                filter === "all"
                  ? "bg-white dark:bg-slate-900 shadow-xs text-slate-900 dark:text-white font-semibold"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-slate-700/60 hover:scale-105 active:scale-95"
              }`}
            >
              All ({attempt.questions.length})
            </button>
            <button
              onClick={() => setFilter("incorrect")}
              className={`px-3 py-1 rounded-lg transition-all duration-200 cursor-pointer ${
                filter === "incorrect"
                  ? "bg-white dark:bg-slate-900 shadow-xs text-red-600 dark:text-red-400 font-semibold"
                  : "text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-white/60 dark:hover:bg-slate-700/60 hover:scale-105 active:scale-95"
              }`}
            >
              Incorrect ({attempt.questions.filter((q) => q.userSelected !== q.answerIndex).length})
            </button>
            <button
              onClick={() => setFilter("correct")}
              className={`px-3 py-1 rounded-lg transition-all duration-200 cursor-pointer ${
                filter === "correct"
                  ? "bg-white dark:bg-slate-900 shadow-xs text-emerald-600 dark:text-emerald-400 font-semibold"
                  : "text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-white/60 dark:hover:bg-slate-700/60 hover:scale-105 active:scale-95"
              }`}
            >
              Correct ({attempt.questions.filter((q) => q.userSelected === q.answerIndex).length})
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {filteredQuestions.map((q, qIdx) => {
            const isCorrect = q.userSelected === q.answerIndex;
            const isSkipped = q.userSelected === undefined;
            const isExpanded = expandedIndex === qIdx;

            return (
              <div
                key={q.id || qIdx}
                className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4"
              >
                <div
                  className="flex items-start justify-between gap-4 cursor-pointer"
                  onClick={() => setExpandedIndex(isExpanded ? null : qIdx)}
                >
                  <div className="flex items-start gap-3">
                    {isCorrect ? (
                      <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <div className="text-xs text-slate-400 font-semibold mb-1">
                        Question {qIdx + 1} · {q.topic}
                      </div>
                      <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                        {q.question}
                      </div>
                    </div>
                  </div>
                  <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>

                {/* Options List */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                  {q.options.map((opt, optIdx) => {
                    const isUserChoice = q.userSelected === optIdx;
                    const isCorrectAnswer = q.answerIndex === optIdx;

                    let badgeStyle = "border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300";
                    if (isCorrectAnswer) {
                      badgeStyle = "border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 font-semibold";
                    } else if (isUserChoice && !isCorrectAnswer) {
                      badgeStyle = "border-red-500 bg-red-50/70 dark:bg-red-950/40 text-red-800 dark:text-red-200 line-through";
                    }

                    return (
                      <div
                        key={optIdx}
                        className={`p-3 rounded-lg border text-xs flex items-center justify-between ${badgeStyle}`}
                      >
                        <span>
                          <strong>{String.fromCharCode(65 + optIdx)}.</strong> {opt}
                        </span>
                        {isCorrectAnswer && (
                          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold ml-2">
                            CORRECT
                          </span>
                        )}
                        {isUserChoice && !isCorrectAnswer && (
                          <span className="text-[10px] text-red-600 dark:text-red-400 font-bold ml-2">
                            YOUR ANSWER
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Explanation */}
                <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  <strong className="text-slate-800 dark:text-slate-100 mr-1">Explanation:</strong>
                  {q.explanation}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
