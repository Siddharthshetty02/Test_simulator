"use client";

import React, { useState, useEffect } from "react";
import { storage, QuizAttempt } from "@/lib/storage";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatDuration } from "@/lib/utils";
import { Award, Clock, ArrowRight, Trash2 } from "lucide-react";

interface QuizHistoryListProps {
  onReviewAttempt: (attempt: QuizAttempt) => void;
}

export function QuizHistoryList({ onReviewAttempt }: QuizHistoryListProps) {
  const [history, setHistory] = useState<QuizAttempt[]>([]);

  useEffect(() => {
    setHistory(storage.getQuizHistory());
  }, []);

  const handleClearHistory = () => {
    if (confirm("Clear your quiz history?")) {
      localStorage.removeItem("ds_hub_quiz_history");
      setHistory([]);
    }
  };

  if (!history.length) {
    return (
      <div className="text-center py-12 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
        <Award className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
          No test history yet.
        </p>
        <p className="text-xs text-slate-400 mt-1">
          Take a quiz or the Full Mock Test to track your progress over time.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
          Past Quiz Attempts ({history.length})
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClearHistory}
          className="text-xs text-slate-400 hover:text-red-600"
        >
          <Trash2 className="w-3.5 h-3.5 mr-1" />
          Clear
        </Button>
      </div>

      <div className="space-y-2.5">
        {history.map((item) => {
          const percentage = Math.round((item.score / item.totalQuestions) * 100);
          return (
            <div
              key={item.id}
              className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-slate-300 dark:hover:border-slate-700 transition-all"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm text-slate-900 dark:text-white">
                    {item.sectionLabel}
                  </span>
                  <Badge variant="secondary" className="capitalize text-[10px]">
                    {item.difficulty}
                  </Badge>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                  <span>{formatDate(item.timestamp)}</span>
                  {item.durationSeconds > 0 && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDuration(item.durationSeconds)}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-base font-bold text-slate-900 dark:text-white">
                    {item.score}/{item.totalQuestions}
                  </div>
                  <div
                    className={`text-[11px] font-semibold ${
                      percentage >= 70 ? "text-emerald-600" : "text-amber-600"
                    }`}
                  >
                    {percentage}% Accuracy
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onReviewAttempt(item)}
                  className="text-xs"
                >
                  Review
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
