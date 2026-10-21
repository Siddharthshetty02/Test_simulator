"use client";

import React, { useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { CopyButton } from "@/components/chat/copy-button";
import { TypingIndicator } from "@/components/chat/typing-indicator";
import ReactMarkdown from "react-markdown";
import { storage, CoachSession } from "@/lib/storage";
import { cleanModelOutput } from "@/lib/utils";
import { TARGET_COMPANY } from "@/lib/constants";
import {
  MessageSquareCheck,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Square,
  Send,
  HelpCircle,
  FileDown,
} from "lucide-react";
import { exportSTARAnswerPDF } from "@/lib/pdf-export";

const SAMPLE_QUESTION = "Tell me about a challenging data science or machine learning project you built and how you evaluated its success.";

const SAMPLE_ANSWER = `In my college minor project, I worked on a loan default prediction system. The dataset was very imbalanced because only 5% of users defaulted. At first, the accuracy of standard logistic regression was 95%, but it was just predicting 0 for everybody which is useless. So I used SMOTE for oversampling and trained an XGBoost model. I tuned hyperparameters using GridSearchCV and focused on optimizing the F1-score and recall rather than accuracy. In the end the recall for defaulters increased to 82% and we presented it to our department professors.`;

export function CoachPage() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [abortController, setAbortController] = useState<AbortController | null>(null);

  const handleStop = () => {
    if (abortController) {
      abortController.abort();
      setAbortController(null);
      setIsStreaming(false);
    }
  };

  const handleCoach = async () => {
    if (!question.trim() || !answer.trim()) {
      setError("Please fill in both the question and your answer.");
      return;
    }

    setIsStreaming(true);
    setFeedback("");
    setError(null);

    const controller = new AbortController();
    setAbortController(controller);

    try {
      const res = await fetch("/api/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: question.trim(),
          answer: answer.trim(),
        }),
        signal: controller.signal,
      });

      if (!res.ok) {
        let errMessage = "Failed to evaluate answer.";
        try {
          const errData = await res.json();
          errMessage = errData.error || errMessage;
        } catch {
          // fallback
        }
        throw new Error(errMessage);
      }

      if (!res.body) throw new Error("No response body.");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";
      let lineBuffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        lineBuffer += decoder.decode(value, { stream: true });
        const lines = lineBuffer.split("\n");
        lineBuffer = lines.pop() ?? "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || trimmed.startsWith(":")) continue;

          if (trimmed.startsWith("data: ")) {
            const dataStr = trimmed.slice(6).trim();
            if (dataStr === "[DONE]") continue;

            try {
              const parsed = JSON.parse(dataStr);
              const delta =
                parsed.choices?.[0]?.delta?.content ||
                parsed.choices?.[0]?.text ||
                parsed.content ||
                "";
              if (typeof delta === "string" && delta.length > 0) {
                accumulated += delta;
              }
            } catch {
              // Ignore incomplete data
            }
          }
        }
        setFeedback(cleanModelOutput(accumulated));
      }

      if (lineBuffer.trim().startsWith("data: ")) {
        const dataStr = lineBuffer.trim().slice(6).trim();
        if (dataStr !== "[DONE]") {
          try {
            const parsed = JSON.parse(dataStr);
            const delta =
              parsed.choices?.[0]?.delta?.content ||
              parsed.choices?.[0]?.text ||
              "";
            if (typeof delta === "string" && delta.length > 0) {
              accumulated += delta;
            }
          } catch {
            // ignore
          }
        }
      }

      const finalFeedback = cleanModelOutput(accumulated);
      setFeedback(finalFeedback);

      // Save to storage
      const session: CoachSession = {
        id: `coach-${Date.now()}`,
        timestamp: new Date().toISOString(),
        question: question.trim(),
        userAnswer: answer.trim(),
        feedback: finalFeedback,
      };
      storage.saveCoachSession(session);
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") {
        // user aborted
      } else {
        const message = err instanceof Error ? err.message : "An error occurred";
        setError(message);
      }
    } finally {
      setIsStreaming(false);
      setAbortController(null);
    }
  };

  const handleUseSample = () => {
    setQuestion(SAMPLE_QUESTION);
    setAnswer(SAMPLE_ANSWER);
    setError(null);
  };

  const handleReset = () => {
    handleStop();
    setFeedback("");
    setQuestion("");
    setAnswer("");
    setError(null);
  };

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                Answer Coach
              </h1>
              <Badge variant="accent">Honest STAR Evaluation</Badge>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Polish project walk-throughs and behavioral questions for {TARGET_COMPANY}. Strict evaluation with no false flattery and no invented facts.
            </p>
          </div>

          {feedback && (
            <Button variant="outline" size="sm" onClick={handleReset}>
              <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
              Coach Another Answer
            </Button>
          )}
        </div>

        {/* Input Form */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-[#2563EB]" />
                  Question & Your Draft Answer
                </CardTitle>
                {!feedback && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleUseSample}
                    className="text-xs text-[#2563EB] dark:text-blue-400"
                  >
                    <Sparkles className="w-3.5 h-3.5 mr-1" />
                    Load Sample
                  </Button>
                )}
              </div>
              <CardDescription>
                Provide the question you are practicing and what you would currently say in an interview.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Question Input */}
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block">
                  Interview Question
                </label>
                <Textarea
                  placeholder="e.g. Tell me about your machine learning churn prediction project..."
                  value={question}
                  onChange={(e) => setQuestion(e.target.value.slice(0, 1000))}
                  rows={2}
                  disabled={isStreaming}
                />
              </div>

              {/* Answer Input */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Your Response / Draft
                  </label>
                  <span className="text-[11px] text-slate-400">
                    {answer.length}/6000
                  </span>
                </div>
                <Textarea
                  placeholder="Paste your draft answer here. Speak naturally, including the context, tools you used, technical challenges, and any results..."
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value.slice(0, 6000))}
                  rows={8}
                  disabled={isStreaming}
                />
              </div>

              {error && (
                <div className="p-3.5 rounded-xl border border-red-200 bg-red-50 dark:bg-red-950/40 dark:border-red-900/60 text-red-800 dark:text-red-200 text-xs flex items-center gap-2.5">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="flex items-center gap-2 pt-2">
                {isStreaming ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleStop}
                    className="w-full text-red-600 border-red-200 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-950"
                  >
                    <Square className="w-4 h-4 mr-2 fill-current" />
                    Stop Evaluation
                  </Button>
                ) : (
                  <Button
                    onClick={handleCoach}
                    disabled={!question.trim() || !answer.trim()}
                    variant="primary"
                    size="lg"
                    className="w-full font-semibold shadow-md"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Coach My Answer
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Feedback Display Column */}
          <div className="space-y-4">
            <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs min-h-[500px] flex flex-col">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
                <div className="flex items-center gap-2">
                  <MessageSquareCheck className="w-5 h-5 text-[#2563EB]" />
                  <h3 className="font-semibold text-sm text-slate-900 dark:text-white">
                    Feedback & STAR Check
                  </h3>
                </div>
                {feedback && (
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() =>
                        exportSTARAnswerPDF({
                          question,
                          userAnswer: answer,
                          feedback,
                        })
                      }
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs gap-1.5 border-slate-200 dark:border-slate-800"
                    >
                      <FileDown className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                      Export PDF
                    </Button>
                    <CopyButton text={feedback} />
                  </div>
                )}
              </div>

              {isStreaming && !feedback && (
                <div className="flex-1 flex items-center justify-center">
                  <TypingIndicator />
                </div>
              )}

              {!isStreaming && !feedback && (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-slate-400">
                  <Sparkles className="w-8 h-8 text-slate-300 dark:text-slate-700 mb-2" />
                  <p className="text-xs max-w-xs">
                    Your feedback will appear here: Verdict, Strengths, Gaps, STAR Check table, and a tight rewrite.
                  </p>
                </div>
              )}

              {feedback && (
                <div className="flex-1 overflow-y-auto space-y-4 text-xs leading-relaxed markdown-body">
                  <ReactMarkdown>{feedback}</ReactMarkdown>
                  {isStreaming && (
                    <div className="pt-2">
                      <TypingIndicator />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

export default CoachPage;
