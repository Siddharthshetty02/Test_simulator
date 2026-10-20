"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { QuizQuestion } from "@/lib/schemas";
import { storage, QuizAttempt } from "@/lib/storage";

export type QuizStatus = "idle" | "loading" | "active" | "results";

interface UseQuizOptions {
  onAutoSubmit?: () => void;
}

export function useQuiz(options?: UseQuizOptions) {
  const [status, setStatus] = useState<QuizStatus>("idle");
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [markedForReview, setMarkedForReview] = useState<Set<number>>(new Set());
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [totalDuration, setTotalDuration] = useState<number>(0);
  const [timerEnabled, setTimerEnabled] = useState<boolean>(true);
  const [latestAttempt, setLatestAttempt] = useState<QuizAttempt | null>(null);
  const [sectionMetadata, setSectionMetadata] = useState<{
    section: string;
    sectionLabel: string;
    difficulty: string;
  }>({ section: "ds_fundamentals", sectionLabel: "DS Fundamentals", difficulty: "beginner" });

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Countdown timer
  useEffect(() => {
    if (status === "active" && timerEnabled && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [status, timerEnabled, timeLeft]);

  // Handle auto-submit when timer expires
  useEffect(() => {
    if (status === "active" && timerEnabled && timeLeft === 0 && questions.length > 0) {
      finishQuiz();
    }
  }, [timeLeft, status, timerEnabled, questions.length]);

  const startQuiz = (
    loadedQuestions: QuizQuestion[],
    durationSeconds: number,
    hasTimer: boolean,
    meta: { section: string; sectionLabel: string; difficulty: string }
  ) => {
    setQuestions(loadedQuestions);
    setCurrentIndex(0);
    setUserAnswers({});
    setMarkedForReview(new Set());
    setTimeLeft(durationSeconds);
    setTotalDuration(durationSeconds);
    setTimerEnabled(hasTimer);
    setSectionMetadata(meta);
    setLatestAttempt(null);
    setStatus("active");
  };

  const selectAnswer = (questionIndex: number, optionIndex: number) => {
    setUserAnswers((prev) => ({
      ...prev,
      [questionIndex]: optionIndex,
    }));
  };

  const toggleMarkForReview = (questionIndex: number) => {
    setMarkedForReview((prev) => {
      const next = new Set(prev);
      if (next.has(questionIndex)) {
        next.delete(questionIndex);
      } else {
        next.add(questionIndex);
      }
      return next;
    });
  };

  const finishQuiz = useCallback((): QuizAttempt => {
    if (timerRef.current) clearInterval(timerRef.current);

    // Calculate accuracy
    let score = 0;
    const topicAccuracy: Record<string, { correct: number; total: number }> = {};

    questions.forEach((q, idx) => {
      const selected = userAnswers[idx];
      const isCorrect = selected === q.answerIndex;
      if (isCorrect) score += 1;

      const topicKey = q.topic || sectionMetadata.sectionLabel;
      if (!topicAccuracy[topicKey]) {
        topicAccuracy[topicKey] = { correct: 0, total: 0 };
      }
      topicAccuracy[topicKey].total += 1;
      if (isCorrect) {
        topicAccuracy[topicKey].correct += 1;
      }
    });

    const durationTaken = timerEnabled ? Math.max(0, totalDuration - timeLeft) : 0;

    const attempt: QuizAttempt = {
      id: `quiz-${Date.now()}`,
      timestamp: new Date().toISOString(),
      section: sectionMetadata.section,
      sectionLabel: sectionMetadata.sectionLabel,
      difficulty: sectionMetadata.difficulty,
      totalQuestions: questions.length,
      score,
      durationSeconds: durationTaken,
      topicAccuracy,
      questions: questions.map((q, idx) => ({
        ...q,
        userSelected: userAnswers[idx],
      })),
    };

    storage.saveQuizAttempt(attempt);
    setLatestAttempt(attempt);
    setStatus("results");
    return attempt;
  }, [questions, userAnswers, sectionMetadata, timerEnabled, totalDuration, timeLeft]);

  const resetQuiz = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setStatus("idle");
    setLatestAttempt(null);
    setQuestions([]);
    setUserAnswers({});
    setMarkedForReview(new Set());
    setTimeLeft(0);
  };

  return {
    status,
    setStatus,
    questions,
    currentIndex,
    setCurrentIndex,
    userAnswers,
    markedForReview,
    timeLeft,
    totalDuration,
    timerEnabled,
    sectionMetadata,
    latestAttempt,
    startQuiz,
    selectAnswer,
    toggleMarkForReview,
    finishQuiz,
    resetQuiz,
  };
}
