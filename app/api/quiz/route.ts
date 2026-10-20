import { NextRequest, NextResponse } from "next/server";
import { QuizRequestSchema, QuizQuestion } from "@/lib/schemas";
import { checkRateLimit } from "@/lib/rate-limit";
import { buildQuizSystemPrompt } from "@/lib/prompts";
import { chat } from "@/lib/openrouter";
import { extractJson } from "@/lib/utils";

const SECTION_TOPIC_MAP: Record<string, string> = {
  english: "English & Verbal Ability (Technical comprehension, vocabulary, grammar for engineers)",
  git: "Git Version Control (branching, merge vs rebase, cherry-pick, conflict resolution)",
  general_ds: "General Data Science (EDA, statistics, metrics, feature engineering, data cleaning)",
  ds_fundamentals: "Data Science Fundamentals (Supervised & Unsupervised ML, bias-variance, regularisation)",
  engineering: "Engineering & OOP (Python data structures, OOP principles, time/space complexity, clean code)",
  full_mock: "Full Mock Assessment (balanced across English, Git, General DS, DS Fundamentals, and Engineering)",
};

function normalizeQuestions(rawList: unknown[]): QuizQuestion[] {
  return rawList
    .filter((item): item is Record<string, unknown> => typeof item === "object" && item !== null)
    .map((item, idx) => {
      let answerIdx = 0;
      const rawAns = item.answerIndex ?? item.correctIndex ?? item.answer ?? item.correct_answer;
      if (typeof rawAns === "number") {
        answerIdx = Math.max(0, Math.min(3, Math.round(rawAns)));
      } else if (typeof rawAns === "string") {
        const trimmed = rawAns.trim().toUpperCase();
        if (trimmed === "A" || trimmed.startsWith("OPTION A") || trimmed === "0") answerIdx = 0;
        else if (trimmed === "B" || trimmed.startsWith("OPTION B") || trimmed === "1") answerIdx = 1;
        else if (trimmed === "C" || trimmed.startsWith("OPTION C") || trimmed === "2") answerIdx = 2;
        else if (trimmed === "D" || trimmed.startsWith("OPTION D") || trimmed === "3") answerIdx = 3;
        else {
          const parsed = parseInt(trimmed, 10);
          if (!isNaN(parsed) && parsed >= 0 && parsed <= 3) answerIdx = parsed;
        }
      }

      let options: string[] = [];
      if (Array.isArray(item.options)) {
        options = item.options.map((opt) => String(opt ?? "").trim()).filter(Boolean);
      } else if (item.options && typeof item.options === "object") {
        options = Object.values(item.options as Record<string, unknown>).map((opt) =>
          String(opt ?? "").trim()
        );
      }

      // Guarantee exactly 4 options
      while (options.length < 4) {
        options.push(`Option ${options.length + 1}`);
      }
      if (options.length > 4) {
        options = options.slice(0, 4);
      }

      const FULL_MOCK_SECTIONS = [
        "English & Verbal Ability",
        "Git & Version Control",
        "General Data Science",
        "DS Fundamentals",
        "Engineering & OOP",
      ];

      const topicName = isFullMock
        ? FULL_MOCK_SECTIONS[Math.floor(idx / 5)] || String(item.topic || "Data Science").trim()
        : String(item.topic || "Data Science").trim();

      return {
        id: typeof item.id === "number" ? item.id : idx + 1,
        topic: topicName,
        question: String(item.question || `Practice question ${idx + 1}`).trim(),
        options,
        answerIndex: answerIdx,
        explanation: String(item.explanation || "Correct option selected based on standard data science principles.").trim(),
      };
    });
}

function tryParseQuizJson(raw: string, isFullMock = false): { success: boolean; data?: { questions: QuizQuestion[] }; error?: string } {
  try {
    const parsed = extractJson(raw);
    let rawQuestions: unknown[] = [];

    if (Array.isArray(parsed)) {
      rawQuestions = parsed;
    } else if (parsed && typeof parsed === "object") {
      const obj = parsed as Record<string, unknown>;
      if (Array.isArray(obj.questions)) rawQuestions = obj.questions;
      else if (Array.isArray(obj.data)) rawQuestions = obj.data;
      else if (Array.isArray(obj.quiz)) rawQuestions = obj.quiz;
      else if (Array.isArray(obj.items)) rawQuestions = obj.items;
    }

    if (!rawQuestions || !rawQuestions.length) {
      return { success: false, error: "No question array found in response" };
    }

    const normalized = normalizeQuestions(rawQuestions, isFullMock);
    if (!normalized.length) {
      return { success: false, error: "Questions could not be parsed into valid items" };
    }

    return { success: true, data: { questions: normalized } };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}

export async function POST(req: NextRequest) {
  try {
    const rate = checkRateLimit(req);
    if (!rate.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please wait a minute." },
        {
          status: 429,
          headers: { "Retry-After": String(rate.reset - Math.floor(Date.now() / 1000)) },
        }
      );
    }

    const rawBody = await req.json();
    const parseResult = QuizRequestSchema.safeParse(rawBody);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Invalid quiz parameters", details: parseResult.error.flatten() },
        { status: 400 }
      );
    }

    const { section, difficulty, count } = parseResult.data;
    const topicDescription = SECTION_TOPIC_MAP[section] || section;

    const systemPrompt = buildQuizSystemPrompt({
      topic: topicDescription,
      difficulty,
      count,
    });

    const messages = [
      { role: "system" as const, content: systemPrompt },
      {
        role: "user" as const,
        content: `Generate ${count} questions now for topic: ${topicDescription} at ${difficulty} level. Return raw JSON only matching the schema.`,
      },
    ];

    // Allocate sufficient tokens: 25 questions require ~4000-4800 tokens to avoid truncation
    const maxTokens = count === 25 ? 4800 : Math.min(3800, count * 170 + 600);

    // First attempt
    const firstCall = await chat({
      messages,
      stream: false,
      maxTokens,
      temperature: 0.4,
    });

    const isFullMock = section === "full_mock";
    const firstParse = tryParseQuizJson(firstCall.text || "", isFullMock);
    if (firstParse.success && firstParse.data) {
      return NextResponse.json(firstParse.data);
    }

    // Single retry with repair instruction
    const repairMessages = [
      ...messages,
      { role: "assistant" as const, content: firstCall.text || "" },
      {
        role: "user" as const,
        content:
          "The previous response was not strictly valid JSON conforming to the requested schema. Return ONLY valid JSON with no markdown tags or commentary.",
      },
    ];

    const retryCall = await chat({
      messages: repairMessages,
      stream: false,
      maxTokens,
      temperature: 0.2,
    });

    const retryParse = tryParseQuizJson(retryCall.text || "", isFullMock);
    if (retryParse.success && retryParse.data) {
      return NextResponse.json(retryParse.data);
    }

    return NextResponse.json(
      {
        error:
          "The AI model returned an unparseable response format. Please try again with a slightly different question count or lower difficulty.",
      },
      { status: 502 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

