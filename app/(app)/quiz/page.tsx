"use client";

import React, { useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DifficultySelect } from "@/components/shared/difficulty-select";
import { QuizPlayer } from "@/components/quiz/quiz-player";
import { QuizResults } from "@/components/quiz/quiz-results";
import { QuizHistoryList } from "@/components/quiz/quiz-history-list";
import { useQuiz } from "@/hooks/use-quiz";
import { QuizAttempt } from "@/lib/storage";
import {
  QUIZ_SECTIONS,
  DEFAULT_QUIZ_COUNTS,
  TARGET_COMPANY,
} from "@/lib/constants";
import {
  BrainCircuit,
  Clock,
  Sparkles,
  AlertCircle,
  History,
  Play,
  RotateCcw,
} from "lucide-react";

export default function QuizPage() {
  const [activeTab, setActiveTab] = useState<"take" | "history">("take");
  const [section, setSection] = useState<string>("full_mock");
  const [difficulty, setDifficulty] = useState<"beginner" | "intermediate">("beginner");
  const [questionCount, setQuestionCount] = useState<number>(10);
  const [timerEnabled, setTimerEnabled] = useState<boolean>(true);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [genError, setGenError] = useState<string | null>(null);
  const [reviewAttempt, setReviewAttempt] = useState<QuizAttempt | null>(null);

  const {
    status,
    questions,
    currentIndex,
    setCurrentIndex,
    userAnswers,
    markedForReview,
    timeLeft,
    sectionMetadata,
    startQuiz,
    selectAnswer,
    toggleMarkForReview,
    finishQuiz,
    resetQuiz,
  } = useQuiz();

  const isFullMock = section === "full_mock";
  const selectedSectionObj = QUIZ_SECTIONS.find((s) => s.id === section) || QUIZ_SECTIONS[0];

  const handleStartGeneration = async () => {
    setIsGenerating(true);
    setGenError(null);

    const actualCount = isFullMock ? 25 : questionCount;
    // 30 mins for full mock, otherwise 1.5 mins per question
    const durationSeconds = isFullMock ? 1800 : actualCount * 90;

    try {
      const res = await fetch("/api/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          section,
          difficulty,
          count: actualCount,
          timerEnabled,
        }),
      });

      if (!res.ok) {
        let msg = "Failed to generate quiz. Please try again.";
        try {
          const errData = await res.json();
          msg = errData.error || msg;
        } catch {
          // fallback
        }
        throw new Error(msg);
      }

      const data = await res.json();
      if (!data.questions || !data.questions.length) {
        throw new Error("No questions were generated. Please try again.");
      }

      startQuiz(data.questions, durationSeconds, timerEnabled, {
        section,
        sectionLabel: selectedSectionObj.label,
        difficulty,
      });
      setReviewAttempt(null);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "An error occurred";
      setGenError(message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleReviewPastAttempt = (attempt: QuizAttempt) => {
    setReviewAttempt(attempt);
  };

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                Quiz & Assessment Simulator
              </h1>
              <Badge variant="accent">{TARGET_COMPANY} Format</Badge>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Practice test MCQs covering the 5 reported sections: English, Git, General DS, Fundamentals, and Engineering.
            </p>
          </div>

          {status === "idle" && !reviewAttempt && (
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-medium border border-slate-200/60 dark:border-slate-700/60">
              <button
                onClick={() => setActiveTab("take")}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-all duration-200 cursor-pointer ${
                  activeTab === "take"
                    ? "bg-white dark:bg-slate-900 shadow-xs text-slate-900 dark:text-white font-semibold"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-slate-700/60 hover:scale-105 active:scale-95"
                }`}
              >
                <Play className="w-3.5 h-3.5" />
                New Quiz
              </button>
              <button
                onClick={() => setActiveTab("history")}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-all duration-200 cursor-pointer ${
                  activeTab === "history"
                    ? "bg-white dark:bg-slate-900 shadow-xs text-slate-900 dark:text-white font-semibold"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-slate-700/60 hover:scale-105 active:scale-95"
                }`}
              >
                <History className="w-3.5 h-3.5" />
                History
              </button>
            </div>
          )}
        </div>

        {/* View 1: Reviewing an attempt from history */}
        {reviewAttempt && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setReviewAttempt(null)}
              >
                ← Back to Tests
              </Button>
            </div>
            <QuizResults
              attempt={reviewAttempt}
              onRetake={() => {
                setReviewAttempt(null);
                setActiveTab("take");
              }}
            />
          </div>
        )}

        {/* View 2: Active Test in Progress */}
        {!reviewAttempt && status === "active" && (
          <QuizPlayer
            questions={questions}
            currentIndex={currentIndex}
            userAnswers={userAnswers}
            markedForReview={markedForReview}
            timeLeft={timeLeft}
            timerEnabled={timerEnabled}
            sectionTitle={sectionMetadata.sectionLabel}
            onSelectIndex={setCurrentIndex}
            onSelectAnswer={selectAnswer}
            onToggleReview={toggleMarkForReview}
            onSubmit={() => {
              if (
                confirm(
                  `Ready to submit? You have answered ${
                    Object.keys(userAnswers).length
                  } of ${questions.length} questions.`
                )
              ) {
                const finished = finishQuiz();
                setReviewAttempt(finished);
              }
            }}
          />
        )}

        {/* View 3: Quiz Results right after finishing */}
        {!reviewAttempt && status === "results" && (
          <div className="text-center py-6">
            <p className="text-sm text-slate-500 mb-4">Quiz successfully submitted!</p>
            <Button onClick={resetQuiz} variant="primary">
              <RotateCcw className="w-4 h-4 mr-1.5" />
              Take Another Quiz
            </Button>
          </div>
        )}

        {/* View 4: Setup & Configuration Form */}
        {!reviewAttempt && status === "idle" && activeTab === "take" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Section selection */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[#0A234B] text-white text-xs flex items-center justify-center font-bold dark:bg-blue-600">
                      1
                    </span>
                    Select Assessment Section
                  </CardTitle>
                  <CardDescription>
                    Choose a single drill topic or simulate the comprehensive 5-section test.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {QUIZ_SECTIONS.map((sec) => {
                    const isSelected = section === sec.id;
                    const isMock = sec.id === "full_mock";
                    return (
                      <button
                        key={sec.id}
                        type="button"
                        onClick={() => setSection(sec.id)}
                        className={`w-full text-left p-4 rounded-xl border transition-all duration-200 flex items-start justify-between gap-4 cursor-pointer hover:border-blue-500 dark:hover:border-blue-400 ${
                          isSelected
                            ? "border-[#2563EB] bg-blue-50/70 dark:bg-blue-950/40 ring-1 ring-[#2563EB]"
                            : "border-slate-200 dark:border-slate-800 bg-transparent"
                        }`}
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm text-slate-900 dark:text-white">
                              {sec.label}
                            </span>
                            {isMock && (
                              <Badge variant="accent" className="text-[10px]">
                                Recommended
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            {sec.desc}
                          </p>
                        </div>
                        <span
                          className={`w-4 h-4 rounded-full border shrink-0 mt-0.5 flex items-center justify-center transition-colors ${
                            isSelected
                              ? "border-[#2563EB] bg-[#2563EB]"
                              : "border-slate-300 dark:border-slate-600"
                          }`}
                        >
                          {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </span>
                      </button>
                    );
                  })}
                </CardContent>
              </Card>

              {/* Error Alert */}
              {genError && (
                <div className="p-4 rounded-xl border border-red-200 bg-red-50 dark:bg-red-950/40 dark:border-red-900/60 text-red-800 dark:text-red-200 text-sm flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 shrink-0 text-red-600 mt-0.5" />
                  <div>
                    <p className="font-semibold">Unable to Generate Quiz</p>
                    <p className="text-xs text-red-700 dark:text-red-300 mt-0.5">{genError}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Test Settings Sidebar */}
            <div className="space-y-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Difficulty Level</CardTitle>
                </CardHeader>
                <CardContent>
                  <DifficultySelect value={difficulty} onChange={setDifficulty} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Test Parameters</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Number of questions */}
                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2 block">
                      Number of Questions
                    </label>
                    {isFullMock ? (
                      <div className="p-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs text-slate-700 dark:text-slate-300 font-medium">
                        Fixed to <strong>25 questions</strong> (5 per reported section)
                      </div>
                    ) : (
                      <div className="grid grid-cols-4 gap-2">
                        {DEFAULT_QUIZ_COUNTS.map((cnt) => (
                          <button
                            key={cnt}
                            type="button"
                            onClick={() => setQuestionCount(cnt)}
                            className={`py-2 text-xs font-semibold rounded-lg border transition-all duration-200 cursor-pointer ${
                              questionCount === cnt
                                ? "bg-[#0A234B] text-white border-[#0A234B] dark:bg-blue-600 dark:border-blue-600 shadow-xs"
                                : "bg-transparent text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-400"
                            }`}
                          >
                            {cnt} Qs
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Timer switch */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                    <div>
                      <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-blue-600" />
                        Timed Examination
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {isFullMock ? "30 minutes total" : "90 seconds per question"}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setTimerEnabled(!timerEnabled)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                        timerEnabled ? "bg-[#2563EB]" : "bg-slate-300 dark:bg-slate-700"
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          timerEnabled ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>

                  <div className="pt-2">
                    <Button
                      onClick={handleStartGeneration}
                      isLoading={isGenerating}
                      variant="primary"
                      size="lg"
                      className="w-full font-semibold shadow-md"
                    >
                      <Sparkles className="w-4 h-4 mr-2" />
                      Generate & Start Test
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* View 5: History List Tab */}
        {!reviewAttempt && status === "idle" && activeTab === "history" && (
          <QuizHistoryList onReviewAttempt={handleReviewPastAttempt} />
        )}
      </div>
    </AppShell>
  );
}
