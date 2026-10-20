import * as React from "react";
import { cn } from "@/lib/utils";

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number; // 0 to 100
  color?: string;
}

export function Progress({ value, className, color = "bg-[#2563EB]", ...props }: ProgressProps) {
  const percentage = Math.min(Math.max(value || 0, 0), 100);

  return (
    <div
      className={cn(
        "relative h-2.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800",
        className
      )}
      role="progressbar"
      aria-valuenow={percentage}
      aria-valuemin={0}
      aria-valuemax={100}
      {...props}
    >
      <div
        className={cn("h-full transition-all duration-300 ease-in-out", color)}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}
