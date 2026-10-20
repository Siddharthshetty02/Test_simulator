"use client";

import React from "react";
import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { BottomTabs } from "./bottom-tabs";
import { DisclaimerBanner } from "@/components/shared/disclaimer-banner";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50 dark:bg-[#0B0F19] text-slate-900 dark:text-slate-100 transition-colors duration-200">
      <DisclaimerBanner />
      <div className="flex-1 flex w-full">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <Header />
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-6xl w-full mx-auto pb-24 md:pb-8">
            {children}
          </main>
        </div>
      </div>
      <BottomTabs />
    </div>
  );
}
