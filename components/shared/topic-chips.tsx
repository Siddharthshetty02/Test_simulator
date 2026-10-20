import React from "react";
import { cn } from "@/lib/utils";
import { INTERVIEW_TOPICS } from "@/lib/constants";
import { Check } from "lucide-react";

interface TopicChipsProps {
  selectedTopics: string[];
  onChange: (topics: string[]) => void;
  options?: readonly string[];
  className?: string;
}

export function TopicChips({
  selectedTopics,
  onChange,
  options = INTERVIEW_TOPICS,
  className,
}: TopicChipsProps) {
  const toggleTopic = (topic: string) => {
    if (selectedTopics.includes(topic)) {
      // Don't allow deselecting the last topic
      if (selectedTopics.length > 1) {
        onChange(selectedTopics.filter((t) => t !== topic));
      }
    } else {
      onChange([...selectedTopics, topic]);
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex flex-wrap gap-2">
        {options.map((topic) => {
          const isSelected = selectedTopics.includes(topic);
          return (
            <button
              key={topic}
              type="button"
              onClick={() => toggleTopic(topic)}
              className={cn(
                "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 border cursor-pointer select-none hover:border-blue-500 dark:hover:border-blue-400",
                isSelected
                  ? "bg-[#0A234B] text-white border-[#0A234B] shadow-sm dark:bg-blue-600 dark:border-blue-600"
                  : "bg-transparent text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800"
              )}
            >
              {isSelected ? (
                <Check className="w-3.5 h-3.5 text-white" />
              ) : (
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-500" />
              )}
              {topic}
            </button>
          );
        })}
      </div>
      <p className="text-xs text-slate-500 dark:text-slate-400">
        Selected: {selectedTopics.length} {selectedTopics.length === 1 ? "topic" : "topics"}
      </p>
    </div>
  );
}
