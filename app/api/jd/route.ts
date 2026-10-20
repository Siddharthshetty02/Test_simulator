import { NextRequest, NextResponse } from "next/server";
import { JDRequestSchema, JDResponseSchema, JDResponse } from "@/lib/schemas";
import { checkRateLimit } from "@/lib/rate-limit";
import { buildJDAnalyzerSystemPrompt, wrapCandidateInput } from "@/lib/prompts";
import { chat, stripCodeFences } from "@/lib/openrouter";


function tryParseJDJson(raw: string): { success: boolean; data?: JDResponse; error?: string } {
  try {
    const cleaned = stripCodeFences(raw);
    const parsed = JSON.parse(cleaned);
    const validated = JDResponseSchema.safeParse(parsed);
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
        { error: "Too many requests. Please wait a moment." },
        {
          status: 429,
          headers: { "Retry-After": String(rate.reset - Math.floor(Date.now() / 1000)) },
        }
      );
    }

    const rawBody = await req.json();
    const parseResult = JDRequestSchema.safeParse(rawBody);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Invalid job description", details: parseResult.error.flatten() },
        { status: 400 }
      );
    }

    const { jobDescription } = parseResult.data;
    const systemPrompt = buildJDAnalyzerSystemPrompt();

    const messages = [
      { role: "system" as const, content: systemPrompt },
      {
        role: "user" as const,
        content: `Analyze the following job description:\n${wrapCandidateInput(jobDescription)}`,
      },
    ];

    // First attempt
    const firstCall = await chat({
      messages,
      stream: false,
      maxTokens: 2500,
      temperature: 0.4,
    });

    const firstParse = tryParseJDJson(firstCall.text || "");
    if (firstParse.success && firstParse.data) {
      return NextResponse.json(firstParse.data);
    }

    // Repair retry
    const repairMessages = [
      ...messages,
      { role: "assistant" as const, content: firstCall.text || "" },
      {
        role: "user" as const,
        content:
          "The output failed strict JSON validation. Return ONLY valid JSON matching the exact schema (role, required_skills, nice_to_have, priority_topics, study_plan_7_days, likely_questions) without any markdown formatting or commentary.",
      },
    ];

    const retryCall = await chat({
      messages: repairMessages,
      stream: false,
      maxTokens: 2500,
      temperature: 0.2,
    });

    const retryParse = tryParseJDJson(retryCall.text || "");
    if (retryParse.success && retryParse.data) {
      return NextResponse.json(retryParse.data);
    }

    return NextResponse.json(
      {
        error:
          "Unable to parse JD analysis from the model. Please ensure the JD text is descriptive and try again.",
      },
      { status: 502 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
