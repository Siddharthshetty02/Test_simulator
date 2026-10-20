"use client";

import React, { useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { storage } from "@/lib/storage";
import { TARGET_COMPANY, APP_NAME, DISCLAIMER_TEXT } from "@/lib/constants";
import {
  Settings,
  ShieldCheck,
  Trash2,
  CheckCircle,
  HelpCircle,
  Code2,
} from "lucide-react";

export default function SettingsPage() {
  const [cleared, setCleared] = useState(false);

  const handleClearData = () => {
    if (
      confirm(
        "Are you sure you want to delete all local history, quiz scores, interview logs, and streaks? This cannot be undone."
      )
    ) {
      storage.clearAll();
      setCleared(true);
      setTimeout(() => setCleared(false), 3000);
    }
  };

  return (
    <AppShell>
      <div className="space-y-6 max-w-3xl">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Settings & Preferences
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Manage your local preparation data, visual theme, and read application guidelines.
          </p>
        </div>

        {/* Appearance Card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center justify-between">
              <span>Appearance</span>
              <ThemeToggle />
            </CardTitle>
            <CardDescription>
              Toggle between Light and Dark interface themes for comfortable study sessions.
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Local Storage & Privacy */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-red-500" />
              Reset Local Storage
            </CardTitle>
            <CardDescription>
              All quiz attempts, simulated interview conversations, and streaks are stored strictly on your local browser device. No remote database is used in v1.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {cleared && (
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>All local preparation data successfully erased.</span>
              </div>
            )}
            <Button
              variant="destructive"
              size="sm"
              onClick={handleClearData}
              className="text-xs"
            >
              Clear All Local Data & Sessions
            </Button>
          </CardContent>
        </Card>

        {/* Educational Disclaimer */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#2563EB]" />
              Authenticity & Educational Disclaimer
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            <p>{DISCLAIMER_TEXT}</p>
            <p className="pt-2">
              The topics (English, Git, General Data Science, DS Fundamentals, Engineering) represent publicly shared interview frameworks and syllabus expectations commonly assessed during Indian college graduate hiring.
            </p>
          </CardContent>
        </Card>

        {/* Version info */}
        <div className="text-center text-xs text-slate-400 pt-4">
          <p>
            {APP_NAME} v1.0.0 · Built with Next.js 16, TypeScript & OpenRouter AI
          </p>
        </div>
      </div>
    </AppShell>
  );
}
