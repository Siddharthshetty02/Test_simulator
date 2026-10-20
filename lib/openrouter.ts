import { APP_NAME } from "./constants";

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ChatOptions {
  messages: ChatMessage[];
  stream?: boolean;
  maxTokens?: number;
  temperature?: number;
}

const OPENROUTER_ENDPOINT = "https://openrouter.ai/api/v1/chat/completions";
const DEFAULT_TIMEOUT_MS = 30000;

export function stripCodeFences(raw: string): string {
  let cleaned = raw.trim();
  // Strip ```json ... ``` or ``` ... ```
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```[a-zA-Z]*\n?/, "").replace(/\n?```$/, "");
  }
  return cleaned.trim();
}

/**
 * Maps HTTP status codes to friendly user error descriptions
 */
export function mapApiError(status: number, details?: string): string {
  switch (status) {
    case 401:
      return "Authentication error: Invalid or missing OPENROUTER_API_KEY in .env.local.";
    case 402:
      return "Credit error: Your OpenRouter account has insufficient credits or free quota exceeded.";
    case 429:
      return "Rate limit exceeded: OpenRouter is busy. Please wait a moment and try again.";
    case 500:
    case 502:
    case 503:
    case 504:
      return "AI Provider temporarily unavailable. Please try again shortly.";
    default:
      return details || `OpenRouter API error (status ${status}).`;
  }
}

async function executeFetch(
  body: Record<string, unknown>,
  signal: AbortSignal
): Promise<Response> {
  const apiKey = process.env.OPENROUTER_API_KEY || "";
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  return fetch(OPENROUTER_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
      "HTTP-Referer": siteUrl,
      "X-Title": APP_NAME,
    },
    body: JSON.stringify(body),
    signal,
  });
}

/**
 * Centralized OpenRouter API caller with:
 * - 30s timeout
 * - 1 retry with exponential backoff on 429 and 5xx
 * - Server-Sent Events streaming support
 */
export async function chat(options: ChatOptions): Promise<{
  text?: string;
  stream?: ReadableStream<Uint8Array>;
}> {
  const model = process.env.OPENROUTER_MODEL || "meta-llama/llama-3.3-70b-instruct:free";
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey || apiKey === "your_openrouter_api_key_here" || apiKey === "your_key_here") {
    throw new Error(
      "OPENROUTER_API_KEY is not configured in .env.local. Please set a valid OpenRouter API key."
    );
  }

  const payload: Record<string, unknown> = {
    model,
    messages: options.messages,
    stream: options.stream ?? false,
    max_tokens: options.maxTokens ?? 1500,
    temperature: options.temperature ?? 0.7,
  };

  const attemptRequest = async (isRetry = false): Promise<Response> => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

    try {
      const res = await executeFetch(payload, controller.signal);
      clearTimeout(timer);

      if (!res.ok) {
        // Retry once on 429 or 5xx if this is the first attempt
        if (!isRetry && (res.status === 429 || res.status >= 500)) {
          await new Promise((resolve) => setTimeout(resolve, 2000));
          return attemptRequest(true);
        }

        let errMessage = "";
        try {
          const errJson = await res.json();
          errMessage = errJson?.error?.message || "";
        } catch {
          // ignore json parse error on error response
        }
        throw new Error(mapApiError(res.status, errMessage));
      }

      return res;
    } catch (err: unknown) {
      clearTimeout(timer);
      if (err instanceof Error && err.name === "AbortError") {
        throw new Error("Request to OpenRouter timed out after 30 seconds. Please try again.");
      }
      throw err;
    }
  };

  const response = await attemptRequest();

  if (options.stream) {
    if (!response.body) {
      throw new Error("No response body received from OpenRouter stream.");
    }
    return { stream: response.body };
  }

  const data = await response.json();
  const textContent = data.choices?.[0]?.message?.content || "";
  return { text: textContent };
}
