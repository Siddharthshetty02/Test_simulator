"use client";

import React, { useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/shared/loading-skeleton";
import { storage, JDAnalysisSession } from "@/lib/storage";
import { JDResponse } from "@/lib/schemas";
import { TARGET_COMPANY } from "@/lib/constants";
import {
  FileSearch,
  Sparkles,
  Calendar,
  HelpCircle,
  Clock,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  BookOpen,
} from "lucide-react";

const SAMPLE_JD = `Job Title: Data Science Intern
Company: Grid Dynamics
Location: Hyderabad / Pune / Bengaluru (Hybrid)

About the Role:
We are looking for passionate Data Science Interns to join our engineering and AI delivery team. As an intern, you will collaborate with senior data scientists on real-world client projects, building predictive models, optimizing data pipelines, and implementing machine learning solutions.

Key Responsibilities:
- Conduct exploratory data analysis (EDA) and data wrangling on large structured datasets using Python, pandas, and NumPy.
- Design, train, and validate supervised machine learning models (XGBoost, LightGBM, Random Forest, Logistic Regression).
- Write efficient SQL queries for data extraction, transformations, and aggregation.
- Collaborate using Git version control and participate in agile sprints.
- Implement object-oriented programming (OOP) principles to write modular, clean, and production-ready Python code.

Requirements:
- Final-year B.Tech / M.Tech in Computer Science, Data Science, or related engineering discipline.
- Strong proficiency in Python, pandas, NumPy, and Scikit-Learn.
- Sound understanding of probability, statistics, hypothesis testing, and evaluation metrics (ROC-AUC, F1, Precision/Recall).
- Hands-on experience with SQL (joins, window functions, CTEs).
- Good understanding of Git workflows (branching, pull requests).

Nice to Have:
- Familiarity with cloud platforms (AWS, GCP) and containerization (Docker).
- Exposure to deep learning frameworks (PyTorch, TensorFlow) or LLMs.
- Personal data science projects on GitHub or Kaggle competitions.`;

export default function JDAnalyzerPage() {
  const [jdText, setJdText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<JDResponse | null>(null);

  const handleAnalyze = async () => {
    if (!jdText.trim() || jdText.length < 30) {
      setError("Please paste a realistic job description (at least 30 characters).");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/jd", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobDescription: jdText.trim() }),
      });

      if (!res.ok) {
        let errMessage = "Analysis failed. Please try again.";
        try {
          const errData = await res.json();
          errMessage = errData.error || errMessage;
        } catch {
          // fallback
        }
        throw new Error(errMessage);
      }

      const data: JDResponse = await res.json();
      setAnalysis(data);

      const session: JDAnalysisSession = {
        id: `jd-${Date.now()}`,
        timestamp: new Date().toISOString(),
        role: data.role,
        requiredSkills: data.required_skills,
        niceToHave: data.nice_to_have,
        priorityTopics: data.priority_topics,
        studyPlan7Days: data.study_plan_7_days,
        likelyQuestions: data.likely_questions,
      };
      storage.saveJDAnalysis(session);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "An error occurred";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUseSample = () => {
    setJdText(SAMPLE_JD);
    setError(null);
  };

  const handleReset = () => {
    setAnalysis(null);
    setJdText("");
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
                Job Description Analyzer
              </h1>
              <Badge variant="accent">Actionable Roadmaps</Badge>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Paste the {TARGET_COMPANY} internship posting to extract core skills, revision priorities, a 7-day study plan, and 10 interview questions.
            </p>
          </div>

          {analysis && (
            <Button variant="outline" size="sm" onClick={handleReset}>
              <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
              Analyze Another JD
            </Button>
          )}
        </div>

        {/* Input Card */}
        {!analysis && (
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <FileSearch className="w-5 h-5 text-[#2563EB]" />
                  Paste Job Description
                </CardTitle>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleUseSample}
                  className="text-xs text-[#2563EB] dark:text-blue-400"
                >
                  <Sparkles className="w-3.5 h-3.5 mr-1" />
                  Insert Sample Grid Dynamics JD
                </Button>
              </div>
              <CardDescription>
                Copy and paste the full job posting from LinkedIn, career portal, or campus placement drive.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Paste the job description here (responsibilities, required qualifications, technical stack)..."
                value={jdText}
                onChange={(e) => setJdText(e.target.value.slice(0, 6000))}
                rows={10}
                className="font-sans text-xs leading-relaxed"
                disabled={isLoading}
              />

              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Maximum 6000 characters</span>
                <span>{jdText.length}/6000</span>
              </div>

              {error && (
                <div className="p-3.5 rounded-xl border border-red-200 bg-red-50 dark:bg-red-950/40 dark:border-red-900/60 text-red-800 dark:text-red-200 text-xs flex items-center gap-2.5">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <Button
                onClick={handleAnalyze}
                isLoading={isLoading}
                disabled={!jdText.trim() || jdText.length < 30}
                variant="primary"
                size="lg"
                className="w-full font-semibold"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Analyze Job Description
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Loading Skeletons */}
        {isLoading && (
          <div className="space-y-6">
            <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4">
              <Skeleton className="h-6 w-1/4" />
              <div className="flex gap-2">
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-6 w-24 rounded-full" />
                <Skeleton className="h-6 w-28 rounded-full" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4">
                <Skeleton className="h-5 w-1/3" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </div>
              <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4">
                <Skeleton className="h-5 w-1/3" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </div>
            </div>
          </div>
        )}

        {/* Results View */}
        {analysis && (
          <div className="space-y-6">
            {/* 1. Role Overview & Skills */}
            <div className="p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Targeted Role
                </span>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                  {analysis.role}
                </h2>
              </div>

              {/* Skills Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Required Skills ({analysis.required_skills.length})
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {analysis.required_skills.map((skill, i) => (
                      <Badge key={i} variant="accent" className="text-xs py-1 px-3">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-blue-500" />
                    Nice to Have ({analysis.nice_to_have.length})
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {analysis.nice_to_have.map((skill, i) => (
                      <Badge key={i} variant="secondary" className="text-xs py-1 px-3">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Prioritized Revision Topics Table */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Clock className="w-5 h-5 text-[#2563EB]" />
                  Prioritized Revision Topics
                </CardTitle>
                <CardDescription>
                  Topics ranked by their frequency and weight in Grid Dynamics interviews, with estimated prep hours.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                        <th className="py-2.5 px-3 font-semibold">Topic</th>
                        <th className="py-2.5 px-3 font-semibold">Relevance & Why</th>
                        <th className="py-2.5 px-3 font-semibold w-28 text-right">Prep Hours</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {analysis.priority_topics.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors">
                          <td className="py-3 px-3 font-semibold text-slate-900 dark:text-slate-100">
                            {item.topic}
                          </td>
                          <td className="py-3 px-3 text-slate-600 dark:text-slate-300 leading-relaxed">
                            {item.why}
                          </td>
                          <td className="py-3 px-3 text-right font-mono font-bold text-blue-600 dark:text-blue-400">
                            ~{item.hours} hrs
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* 3. 7-Day Study Plan */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-[#2563EB]" />
                  7-Day Structured Study Plan
                </CardTitle>
                <CardDescription>
                  Day-by-day roadmap leading up to the Grid Dynamics assessment.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {analysis.study_plan_7_days.map((dayPlan) => (
                    <div
                      key={dayPlan.day}
                      className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3"
                    >
                      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-[#2563EB] dark:text-blue-400">
                          Day {dayPlan.day}
                        </span>
                        <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                      </div>
                      <div className="font-semibold text-xs text-slate-900 dark:text-slate-100">
                        {dayPlan.focus}
                      </div>
                      <ul className="space-y-1.5 text-[11px] text-slate-600 dark:text-slate-400">
                        {dayPlan.tasks.map((task, tIdx) => (
                          <li key={tIdx} className="flex items-start gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600 shrink-0 mt-1.5" />
                            <span>{task}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* 4. 10 Likely Interview Questions */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-[#2563EB]" />
                  10 Likely Interview Questions
                </CardTitle>
                <CardDescription>
                  High-probability questions tailored to this specific job description.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analysis.likely_questions.map((q, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl border border-slate-200/60 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/50 flex items-start gap-3 text-xs"
                    >
                      <span className="w-6 h-6 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center font-bold text-slate-700 dark:text-slate-200 shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <div className="space-y-1">
                        <p className="font-medium text-slate-900 dark:text-slate-100 leading-relaxed">
                          {q.question}
                        </p>
                        <Badge variant="outline" className="text-[10px]">
                          {q.topic}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </AppShell>
  );
}
