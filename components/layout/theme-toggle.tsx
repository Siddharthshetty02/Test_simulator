"use client";

import React, { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ThemeToggle({ className }: { className?: string }) {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const updateFromDoc = () => {
      const isDark = document.documentElement.classList.contains("dark");
      setTheme(isDark ? "dark" : "light");
    };

    updateFromDoc();

    const handleThemeChange = () => updateFromDoc();
    window.addEventListener("theme-change", handleThemeChange);
    window.addEventListener("storage", handleThemeChange);

    return () => {
      window.removeEventListener("theme-change", handleThemeChange);
      window.removeEventListener("storage", handleThemeChange);
    };
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);

    if (nextTheme === "dark") {
      document.documentElement.classList.add("dark");
      localStorage.setItem("ds_hub_theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("ds_hub_theme", "light");
    }

    window.dispatchEvent(new Event("theme-change"));
  };

  if (!mounted) {
    return (
      <div className="w-9 h-9 rounded-lg" />
    );
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
      aria-label="Toggle theme"
      className={`relative group h-9 w-9 rounded-xl transition-all duration-300 hover:scale-105 active:scale-95 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white cursor-pointer ${
        className || ""
      }`}
    >
      <span className="transition-transform duration-300 group-hover:rotate-12">
        {theme === "light" ? (
          <Moon className="w-4 h-4 text-slate-700 transition-colors" />
        ) : (
          <Sun className="w-4 h-4 text-amber-400 transition-colors" />
        )}
      </span>
    </Button>
  );
}
