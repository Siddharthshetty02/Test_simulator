import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString: string): string {
  try {
    const d = new Date(dateString);
    return d.toLocaleDateString("en-IN", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateString;
  }
}

export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}m ${secs.toString().padStart(2, "0")}s`;
}

/**
 * Strips raw backend SSE chunk/token metadata that might accidentally leak
 * into the assistant response stream (e.g. from network packet cuts or provider chunk leaks).
 */
export function cleanModelOutput(raw: string): string {
  if (!raw) return "";

  let cleaned = raw;

  // 1. If an SSE chunk JSON was accidentally embedded inline, extract its delta content if present
  cleaned = cleaned.replace(
    /\{"id"\s*:\s*"[^"]*"[\s\S]*?"choices"\s*:\s*\[\s*\{[\s\S]*?"delta"\s*:\s*\{[\s\S]*?"content"\s*:\s*"([^"\\]*(?:\\.[^"\\]*)*)"[\s\S]*?\}\s*\]\s*\}/g,
    (_, content) => {
      try {
        return JSON.parse(`"${content}"`);
      } catch {
        return content;
      }
    }
  );

  // 2. Remove any remaining raw chunk metadata JSON (even with nested objects)
  cleaned = cleaned.replace(
    /\{"id"\s*:\s*"[^"]*"[\s\S]*?"object"\s*:\s*"chat\.completion\.chunk"[\s\S]*?\}\s*:?/g,
    ""
  );
  cleaned = cleaned.replace(/\{"id"\s*:\s*"gen-[^"]*"[\s\S]*?\}(?:\s*:)?/g, "");

  // 3. Remove raw SSE protocol lines that might have leaked into string
  cleaned = cleaned.replace(/^data:\s*\[DONE\]\s*$/gim, "");
  cleaned = cleaned.replace(/^data:\s*\{.*$/gim, "");
  cleaned = cleaned.replace(/^:.*$/gim, "");

  // 4. Format joined interview evaluation items into clean, readable bullet points
  cleaned = formatPointwiseResponse(cleaned);

  return cleaned.trim();
}

/**
 * Ensures evaluation feedback (Score, What was good, What was missing, Model answer, Next Question)
 * always follows a crisp, readable point-wise bullet structure with clean spacing.
 */
export function formatPointwiseResponse(raw: string): string {
  if (!raw) return "";

  let formatted = raw;

  // Check if evaluation headers are present
  const hasEvaluationSections =
    /(?:What was good|What was missing|Model answer|Next Question):/i.test(formatted);

  if (hasEvaluationSections) {
    formatted = formatted
      .replace(/(?:^|\n|\s)(?:-|\*)?\s*(?:\*\*)?Score(?:\*\*)?:\s*(\(?\d+\s*\/\s*\d+\)?)/gi, "\n\n- **Score**: $1")
      .replace(/(?:^|\n|\s)(?:-|\*)?\s*(?:\*\*)?What was good(?:\*\*)?:\s*/gi, "\n\n- **What was good**: ")
      .replace(/(?:^|\n|\s)(?:-|\*)?\s*(?:\*\*)?What was missing(?:\*\*)?:\s*/gi, "\n\n- **What was missing**: ")
      .replace(/(?:^|\n|\s)(?:-|\*)?\s*(?:\*\*)?Model answer(?:\*\*)?:\s*/gi, "\n\n- **Model answer**: ")
      .replace(/(?:^|\n|\s)(?:-|\*)?\s*(?:\*\*)?Next Question(?:\*\*)?:\s*/gi, "\n\n- **Next Question**: ");
  }

  return formatted;
}


/**
 * Robustly extracts and parses JSON from LLM output, handling markdown code fences,
 * leading/trailing conversational text, and object or array envelopes.
 */
export function extractJson(raw: string): unknown {
  if (!raw || typeof raw !== "string") {
    throw new Error("Empty or invalid input for JSON extraction");
  }

  let text = raw.trim();

  // Strip markdown code fences if present
  if (text.startsWith("```")) {
    text = text.replace(/^```[a-zA-Z]*\n?/, "").replace(/\n?```$/, "").trim();
  }

  // First direct JSON.parse attempt
  try {
    return JSON.parse(text);
  } catch {
    // Attempt to locate outer JSON bounds { ... } or [ ... ]
    const firstBrace = text.indexOf("{");
    const lastBrace = text.lastIndexOf("}");
    const firstBracket = text.indexOf("[");
    const lastBracket = text.lastIndexOf("]");

    // Try object boundaries first if they appear earlier
    if (
      firstBrace !== -1 &&
      lastBrace !== -1 &&
      (firstBracket === -1 || firstBrace < firstBracket)
    ) {
      try {
        return JSON.parse(text.substring(firstBrace, lastBrace + 1));
      } catch {
        // Fall through to array check
      }
    }

    // Try array boundaries
    if (firstBracket !== -1 && lastBracket !== -1) {
      try {
        return JSON.parse(text.substring(firstBracket, lastBracket + 1));
      } catch {
        // Fall through
      }
    }

    // Last-ditch object check if brackets appeared first but failed
    if (firstBrace !== -1 && lastBrace !== -1) {
      try {
        return JSON.parse(text.substring(firstBrace, lastBrace + 1));
      } catch {
        // Fall through
      }
    }

    throw new Error("Could not extract valid JSON from LLM response.");
  }
}
