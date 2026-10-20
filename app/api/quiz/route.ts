import { NextRequest, NextResponse } from "next/server";
import { QuizRequestSchema, QuizResponseSchema, QuizQuestion } from "@/lib/schemas";
import { checkRateLimit } from "@/lib/rate-limit";
import { buildQuizSystemPrompt } from "@/lib/prompts";
import { chat, stripCodeFences } from "@/lib/openrouter";


const SECTION_TOPIC_MAP: Record<string, string> = {
  english: "English & Verbal Ability (Technical comprehension, vocabulary, grammar for engineers)",
  git: "Git Version Control (branching, merge vs rebase, cherry-pick, conflict resolution)",
  general_ds: "General Data Science (EDA, statistics, metrics, feature engineering, data cleaning)",
  ds_fundamentals: "Data Science Fundamentals (Supervised & Unsupervised ML, bias-variance, regularisation)",
  engineering: "Engineering & OOP (Python data structures, OOP principles, time/space complexity, clean code)",
  full_mock: "Full Mock Assessment (balanced across English, Git, General DS, DS Fundamentals, and Engineering)",
};

function tryParseQuizJson(raw: string): { success: boolean; data?: { questions: QuizQuestion[] }; error?: string } {
  try {
    const cleaned = stripCodeFences(raw);
    const parsed = JSON.parse(cleaned);
    const validated = QuizResponseSchema.safeParse(parsed);
    if (validated.success) {
      return { success: true, data: validated.data };
    }
    return { success: false, error: validated.error.message };
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
        content: `Generate ${count} questions now for topic: ${topicDescription} at ${difficulty} level. Return raw JSON only.`,
      },
    ];

    // First attempt
    const firstCall = await chat({
      messages,
      stream: false,
      maxTokens: 2500,
      temperature: 0.5,
    });

    const firstParse = tryParseQuizJson(firstCall.text || "");
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
      maxTokens: 2500,
      temperature: 0.2,
    });

    const retryParse = tryParseQuizJson(retryCall.text || "");
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
