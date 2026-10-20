"use client";

import React from "react";
import { QuizQuestion } from "@/lib/schemas";
import { QuestionPalette } from "./question-palette";
import { TimerDisplay } from "./timer-display";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Flag, ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuizPlayerProps {
  questions: QuizQuestion[];
  currentIndex: number;
  userAnswers: Record<number, number>;
  markedForReview: Set<number>;
  timeLeft: number;
  timerEnabled: boolean;
  sectionTitle: string;
  onSelectIndex: (idx: number) => void;
  onSelectAnswer: (qIdx: number, optIdx: number) => void;
  onToggleReview: (qIdx: number) => void;
  onSubmit: () => void;
}

export function QuizPlayer({
  questions,
  currentIndex,
  userAnswers,
  markedForReview,
  timeLeft,
  timerEnabled,
  sectionTitle,
  onSelectIndex,
  onSelectAnswer,
  onToggleReview,
  onSubmit,
}: QuizPlayerProps) {
  const currentQ = questions[currentIndex];
  if (!currentQ) return null;

  const total = questions.length;
  const isMarked = markedForReview.has(currentIndex);
  const selectedOption = userAnswers[currentIndex];
  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex < total - 1;

  const answeredCount = Object.keys(userAnswers).length;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
      {/* Main Question Column */}
      <div className="lg:col-span-3 space-y-4">
        {/* Top bar with progress and timer */}
        <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <div className="flex items-center gap-2">
            <Badge variant="secondary">
              Question {currentIndex + 1} of {total}
            </Badge>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {currentQ.topic || sectionTitle}
            </span>
          </div>
          {timerEnabled && <TimerDisplay secondsLeft={timeLeft} />}
        </div>

        {/* Question Card */}
        <div className="p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-6">
          <div className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white leading-relaxed">
            {currentQ.question}
          </div>

          {/* Options */}
          <div className="space-y-3">
            {currentQ.options.map((opt, optIdx) => {
              const isSelected = selectedOption === optIdx;
              const optionLetter = String.fromCharCode(65 + optIdx); // A, B, C, D

              return (
                <button
                  key={optIdx}
                  type="button"
                  onClick={() => onSelectAnswer(currentIndex, optIdx)}
                  className={cn(
                    "w-full text-left p-4 rounded-xl border transition-all flex items-start gap-3.5 cursor-pointer",
                    isSelected
                      ? "border-[#2563EB] bg-blue-50/80 dark:bg-blue-950/50 ring-2 ring-[#2563EB]/40 dark:border-blue-500"
                      : "border-slate-200 dark:border-slate-800 bg-transparent hover:border-blue-500 dark:hover:border-blue-400"
                  )}
                >
                  <span
                    className={cn(
                      "w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 transition-colors",
                      isSelected
                        ? "bg-[#2563EB] text-white"
                        : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                    )}
                  >
                    {optionLetter}
                  </span>
                  <span className="text-sm text-slate-800 dark:text-slate-200 leading-normal pt-0.5">
                    {opt}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Controls: Mark for review & Navigation */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onToggleReview(currentIndex)}
              className={cn(
                "text-xs font-medium",
                isMarked
                  ? "bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-700"
                  : ""
              )}
            >
              <Flag className={cn("w-3.5 h-3.5 mr-1.5", isMarked && "fill-current")} />
              {isMarked ? "Marked for Review" : "Mark for Review"}
            </Button>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={!hasPrevious}
                onClick={() => onSelectIndex(currentIndex - 1)}
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Previous
              </Button>

              {hasNext ? (
                <Button
                  type="button"
                  variant="default"
                  size="sm"
                  onClick={() => onSelectIndex(currentIndex + 1)}
                >
                  Next
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={onSubmit}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  <CheckCircle2 className="w-4 h-4 mr-1" />
                  Submit Test
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar: Question Palette & Submit Action */}
      <div className="space-y-4">
        <QuestionPalette
          total={total}
          currentIndex={currentIndex}
          userAnswers={userAnswers}
          markedForReview={markedForReview}
          onSelect={onSelectIndex}
        />

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Progress: <strong>{answeredCount}</strong> of <strong>{total}</strong> completed
          </div>
          <Button
            type="button"
            variant="primary"
            size="lg"
            onClick={onSubmit}
            className="w-full text-sm font-semibold"
          >
            Submit All Answers ({answeredCount}/{total})
          </Button>
        </div>
      </div>
    </div>
  );
}
