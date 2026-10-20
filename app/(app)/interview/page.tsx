"use client";

import React, { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { TopicChips } from "@/components/shared/topic-chips";
import { DifficultySelect } from "@/components/shared/difficulty-select";
import { ChatContainer } from "@/components/chat/chat-container";
import { useChat } from "@/hooks/use-chat";
import { storage } from "@/lib/storage";
import {
  INTERVIEW_ROUNDS,
  TARGET_COMPANY,
} from "@/lib/constants";
import { Bot, Sparkles, RefreshCcw, Layers, ArrowLeft } from "lucide-react";

export default function InterviewPage() {
  const [inProgress, setInProgress] = useState(false);
  const [round, setRound] = useState<string>("technical_interview");
  const [topics, setTopics] = useState<string[]>([
    "Python",
    "pandas and NumPy",
    "Machine Learning",
    "SQL",
  ]);
  const [difficulty, setDifficulty] = useState<"beginner" | "intermediate">("beginner");
  const [projects, setProjects] = useState<string>("");
  const [sessionId, setSessionId] = useState<string>("");

  const {
    messages,
    setMessages,
    isLoading,
    error,
    sendMessage,
    stopGeneration,
  } = useChat({
    apiEndpoint: "/api/interview",
    extraBody: {
      round,
      topics,
      difficulty,
      projects: projects.trim() || undefined,
    },
    onFinish: (finalMessages) => {
      if (sessionId) {
        storage.saveInterviewSession({
          id: sessionId,
          timestamp: new Date().toISOString(),
          round,
          topics,
          difficulty,
          projectSummary: projects.trim() || undefined,
          messages: finalMessages.map((m) => ({
            role: m.role as "user" | "assistant",
            content: m.content,
            timestamp: m.timestamp,
          })),
          totalExchanges: Math.floor(finalMessages.filter((m) => m.role === "user").length),
        });
      }
    },
  });

  // Start interview and request the first warm-up question
  const handleStartInterview = async () => {
    const newSessionId = `interview-${Date.now()}`;
    setSessionId(newSessionId);
    setInProgress(true);
    setMessages([]);

    // Trigger AI to generate the first question
    await sendMessage("Hello! I am ready for the interview. Please ask your first question.", {
      round,
      topics,
      difficulty,
      projects: projects.trim() || undefined,
    });
  };

  const handleReset = () => {
    stopGeneration();
    setInProgress(false);
    setMessages([]);
    setSessionId("");
  };

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                Mock Interviewer
              </h1>
              <Badge variant="accent">Live Streaming</Badge>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Rigorous, 1-on-1 simulated interviews tailored for {TARGET_COMPANY} data science internships.
            </p>
          </div>

          {inProgress && (
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleReset}>
                <ArrowLeft className="w-3.5 h-3.5 mr-1" />
                Change Setup
              </Button>
            </div>
          )}
        </div>

        {!inProgress ? (
          /* Configuration Setup Form */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Step 1: Round Selection */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[#0A234B] text-white text-xs flex items-center justify-center font-bold dark:bg-blue-600">
                      1
                    </span>
                    Select Interview Round
                  </CardTitle>
                  <CardDescription>
                    Grid Dynamics evaluates candidates across online rounds and live conversations.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {INTERVIEW_ROUNDS.map((r) => {
                      const selected = round === r.id;
                      return (
                        <button
                          key={r.id}
                          type="button"
                          onClick={() => setRound(r.id)}
                          className={`text-left p-4 rounded-xl border transition-all duration-200 cursor-pointer hover:border-blue-500 dark:hover:border-blue-400 ${
                            selected
                              ? "border-[#2563EB] bg-blue-50/70 dark:bg-blue-950/40 ring-1 ring-[#2563EB]"
                              : "border-slate-200 dark:border-slate-800 bg-transparent"
                          }`}
                        >
                          <div className="font-semibold text-sm text-slate-900 dark:text-slate-100 mb-1">
                            {r.label}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                            {r.desc}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Step 2: Topics Selection */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[#0A234B] text-white text-xs flex items-center justify-center font-bold dark:bg-blue-600">
                      2
                    </span>
                    Focus Topics
                  </CardTitle>
                  <CardDescription>
                    Choose specific areas you want the interviewer to drill into.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <TopicChips selectedTopics={topics} onChange={setTopics} />
                </CardContent>
              </Card>

              {/* Step 3: Candidate Projects (Optional) */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[#0A234B] text-white text-xs flex items-center justify-center font-bold dark:bg-blue-600">
                      3
                    </span>
                    Your Data Science Projects (Optional)
                  </CardTitle>
                  <CardDescription>
                    Paste summaries of 1 or 2 ML/data projects on your resume. The interviewer will ask targeted deep-dive questions about them.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Textarea
                    placeholder="e.g. Built a customer churn prediction model using XGBoost and SHAP on 100k telecom records; achieved 0.86 ROC-AUC..."
                    value={projects}
                    onChange={(e) => setProjects(e.target.value.slice(0, 3000))}
                    rows={3}
                  />
                  <div className="text-right text-[11px] text-slate-400 mt-1">
                    {projects.length}/3000 characters
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar Setup Summary & Action */}
            <div className="space-y-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Difficulty Level</CardTitle>
                  <CardDescription>
                    Calibrate the technical depth and rigor of questions.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <DifficultySelect value={difficulty} onChange={setDifficulty} />
                </CardContent>
              </Card>

              <Card className="bg-[#0A234B] text-white border-none shadow-md dark:bg-slate-900 dark:border dark:border-slate-800">
                <CardHeader>
                  <CardTitle className="text-white text-base flex items-center gap-2">
                    <Bot className="w-5 h-5 text-blue-400" />
                    Interview Expectations
                  </CardTitle>
                  <CardDescription className="text-blue-200">
                    How this session operates:
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 text-xs text-blue-100">
                  <div className="flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <span>
                      The interviewer asks <strong>one question at a time</strong>, starting with a warm-up.
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <span>
                      After each reply, you get a <strong>Score (x/10)</strong>, strengths, missing nuances, a model answer, and the next question.
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <span>
                      Targeted strictly towards fundamentals: statistics, SQL, pandas, ML, and clean code.
                    </span>
                  </div>

                  <div className="pt-4">
                    <Button
                      onClick={handleStartInterview}
                      variant="primary"
                      size="lg"
                      className="w-full text-sm font-semibold shadow-md bg-[#2563EB] hover:bg-blue-500"
                    >
                      Start Mock Interview
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          /* Active Chat Interview UI */
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
              <div className="flex items-center gap-3">
                <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Bot className="w-4 h-4 text-[#2563EB]" />
                  {round === "online_test"
                    ? "Online Test Prep"
                    : round === "technical_interview"
                    ? "Technical Interview"
                    : "HR Screening"}
                </span>
                <span className="text-slate-300 dark:text-slate-700">|</span>
                <span className="capitalize text-slate-600 dark:text-slate-400 font-medium">
                  {difficulty}
                </span>
                <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">|</span>
                <span className="text-slate-500 dark:text-slate-400 hidden sm:inline">
                  Topics: {topics.slice(0, 3).join(", ")}
                  {topics.length > 3 ? ` +${topics.length - 3}` : ""}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={handleReset} className="text-xs">
                  <RefreshCcw className="w-3.5 h-3.5 mr-1" />
                  New Session
                </Button>
              </div>
            </div>

            <ChatContainer
              messages={messages}
              isLoading={isLoading}
              error={error}
              onSendMessage={sendMessage}
              onStopGeneration={stopGeneration}
              onRestart={handleReset}
              placeholder="Type your technical answer here (be thorough, mention time/space complexity or ML trade-offs where applicable)..."
            />
          </div>
        )}
      </div>
    </AppShell>
  );
}
