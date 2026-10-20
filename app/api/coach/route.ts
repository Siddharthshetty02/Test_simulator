import { NextRequest, NextResponse } from "next/server";
import { CoachRequestSchema } from "@/lib/schemas";
import { checkRateLimit } from "@/lib/rate-limit";
import { buildCoachSystemPrompt, wrapCandidateInput } from "@/lib/prompts";
import { chat } from "@/lib/openrouter";


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
    const parseResult = CoachRequestSchema.safeParse(rawBody);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Invalid coach request", details: parseResult.error.flatten() },
        { status: 400 }
      );
    }

    const { question, answer } = parseResult.data;
    const systemPrompt = buildCoachSystemPrompt();

    const messages = [
      { role: "system" as const, content: systemPrompt },
      {
        role: "user" as const,
        content: `INTERVIEW QUESTION:\n${wrapCandidateInput(question)}\n\nCANDIDATE'S ANSWER:\n${wrapCandidateInput(answer)}`,
      },
    ];

    const { stream } = await chat({
      messages,
      stream: true,
      maxTokens: 1000,
      temperature: 0.3, // Lower temperature for objective, non-hallucinatory coaching
    });

    if (!stream) {
      return NextResponse.json({ error: "Failed to initialize feedback stream" }, { status: 500 });
    }

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
