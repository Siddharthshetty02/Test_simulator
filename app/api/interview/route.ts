import { NextRequest, NextResponse } from "next/server";
import { InterviewRequestSchema } from "@/lib/schemas";
import { checkRateLimit } from "@/lib/rate-limit";
import { buildInterviewSystemPrompt, wrapCandidateInput } from "@/lib/prompts";
import { chat, ChatMessage } from "@/lib/openrouter";


export async function POST(req: NextRequest) {
  try {
    const rate = checkRateLimit(req);
    if (!rate.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please wait before asking again." },
        {
          status: 429,
          headers: { "Retry-After": String(rate.reset - Math.floor(Date.now() / 1000)) },
        }
      );
    }

    const rawBody = await req.json();
    const parseResult = InterviewRequestSchema.safeParse(rawBody);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Invalid interview request", details: parseResult.error.flatten() },
        { status: 400 }
      );
    }

    const { round, topics, difficulty, projects, messages } = parseResult.data;

    const systemPrompt = buildInterviewSystemPrompt({
      round,
      topics,
      difficulty,
      projects,
    });

    // Protect user messages with delimiter
    const formattedMessages: ChatMessage[] = [
      { role: "system", content: systemPrompt },
      ...messages.map((m) => ({
        role: m.role,
        content: m.role === "user" ? wrapCandidateInput(m.content) : m.content,
      })),
    ];

    const { stream } = await chat({
      messages: formattedMessages,
      stream: true,
      maxTokens: 1000,
      temperature: 0.6,
    });

    if (!stream) {
      return NextResponse.json({ error: "Failed to establish stream" }, { status: 500 });
    }

    // Pass the stream through to client
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
