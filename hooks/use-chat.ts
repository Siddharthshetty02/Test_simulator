"use client";

import { useState, useRef, useCallback } from "react";
import { cleanModelOutput } from "@/lib/utils";

export interface ChatMessageItem {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
}

interface UseChatOptions {
  apiEndpoint: string;
  initialMessages?: ChatMessageItem[];
  extraBody?: Record<string, unknown>;
  onFinish?: (finalMessages: ChatMessageItem[]) => void;
}

export function useChat({
  apiEndpoint,
  initialMessages = [],
  extraBody = {},
  onFinish,
}: UseChatOptions) {
  const [messages, setMessages] = useState<ChatMessageItem[]>(initialMessages);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const stopGeneration = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsLoading(false);
    }
  }, []);

  const sendMessage = useCallback(
    async (userText: string, updatedExtra?: Record<string, unknown>) => {
      if (!userText.trim() || isLoading) return;

      setError(null);
      setIsLoading(true);

      const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      const userMessage: ChatMessageItem = {
        id: `user-${Date.now()}`,
        role: "user",
        content: userText.trim(),
        timestamp: now,
      };

      const updatedHistory = [...messages, userMessage];
      setMessages(updatedHistory);

      const assistantId = `assistant-${Date.now()}`;
      const assistantPlaceholder: ChatMessageItem = {
        id: assistantId,
        role: "assistant",
        content: "",
        timestamp: now,
      };

      setMessages([...updatedHistory, assistantPlaceholder]);

      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        const payload = {
          ...(updatedExtra || extraBody),
          messages: updatedHistory.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        };

        const res = await fetch(apiEndpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          signal: controller.signal,
        });

        if (!res.ok) {
          let errText = "Failed to communicate with AI interviewer.";
          try {
            const errJson = await res.json();
            errText = errJson.error || errText;
          } catch {
            // fallback
          }
          throw new Error(errText);
        }

        if (!res.body) {
          throw new Error("No response stream received.");
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let accumulatedText = "";
        let lineBuffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          lineBuffer += decoder.decode(value, { stream: true });
          const lines = lineBuffer.split("\n");
          lineBuffer = lines.pop() ?? ""; // keep incomplete line for next iteration

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith(":")) continue;

            if (trimmed.startsWith("data: ")) {
              const dataStr = trimmed.slice(6).trim();
              if (dataStr === "[DONE]") continue;

              try {
                const parsed = JSON.parse(dataStr);
                const delta =
                  parsed.choices?.[0]?.delta?.content ??
                  parsed.choices?.[0]?.text ??
                  "";
                if (typeof delta === "string" && delta.length > 0) {
                  accumulatedText += delta;
                }
              } catch {
                // Ignore incomplete or non-JSON data lines
              }
            }
          }

          const sanitized = cleanModelOutput(accumulatedText);
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantId ? { ...msg, content: sanitized } : msg
            )
          );
        }

        // Process any remainder in lineBuffer
        if (lineBuffer.trim().startsWith("data: ")) {
          const dataStr = lineBuffer.trim().slice(6).trim();
          if (dataStr !== "[DONE]") {
            try {
              const parsed = JSON.parse(dataStr);
              const delta =
                parsed.choices?.[0]?.delta?.content ??
                parsed.choices?.[0]?.text ??
                "";
              if (typeof delta === "string" && delta.length > 0) {
                accumulatedText += delta;
              }
            } catch {
              // ignore
            }
          }
        }

        const finalSanitized = cleanModelOutput(accumulatedText);
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantId ? { ...msg, content: finalSanitized } : msg
          )
        );

        const finalMessages = [
          ...updatedHistory,
          { ...assistantPlaceholder, content: finalSanitized },
        ];
        onFinish?.(finalMessages);
      } catch (err: unknown) {
        if (err instanceof Error && err.name === "AbortError") {
          // Handled manually
        } else {
          const msg = err instanceof Error ? err.message : "An unexpected error occurred.";
          setError(msg);
          // Remove empty assistant placeholder on immediate error
          setMessages((prev) => prev.filter((m) => m.id !== assistantId || m.content.length > 0));
        }
      } finally {
        setIsLoading(false);
        abortControllerRef.current = null;
      }
    },
    [apiEndpoint, extraBody, isLoading, messages, onFinish]
  );

  return {
    messages,
    setMessages,
    isLoading,
    error,
    sendMessage,
    stopGeneration,
  };
}
