import { describe, it, expect } from "vitest";
import {
  InterviewRequestSchema,
  QuizRequestSchema,
  QuizResponseSchema,
  JDRequestSchema,
  JDResponseSchema,
  CoachRequestSchema,
} from "@/lib/schemas";

describe("Validation Schemas", () => {
  it("validates valid InterviewRequest", () => {
    const valid = {
      round: "technical_interview",
      topics: ["Python", "Machine Learning"],
      difficulty: "beginner",
      projects: "Customer churn prediction",
      messages: [{ role: "user", content: "Hi" }],
    };
    const res = InterviewRequestSchema.safeParse(valid);
    expect(res.success).toBe(true);
  });

  it("fails InterviewRequest with no topics", () => {
    const invalid = {
      round: "technical_interview",
      topics: [],
      difficulty: "beginner",
      messages: [],
    };
    const res = InterviewRequestSchema.safeParse(invalid);
    expect(res.success).toBe(false);
  });

  it("validates valid QuizRequest", () => {
    const valid = {
      section: "full_mock",
      difficulty: "intermediate",
      count: 25,
      timerEnabled: true,
    };
    const res = QuizRequestSchema.safeParse(valid);
    expect(res.success).toBe(true);
  });

  it("validates strictly shaped QuizResponseSchema", () => {
    const valid = {
      questions: [
        {
          id: 1,
          topic: "Python",
          question: "What is the time complexity of dictionary lookup on average in Python?",
          options: ["O(1)", "O(n)", "O(log n)", "O(n^2)"],
          answerIndex: 0,
          explanation: "Hash table lookups take average O(1) time.",
        },
      ],
    };
    const res = QuizResponseSchema.safeParse(valid);
    expect(res.success).toBe(true);
  });

  it("fails QuizResponseSchema when question options are not exactly 4", () => {
    const invalid = {
      questions: [
        {
          id: 1,
          topic: "Python",
          question: "Invalid options count question?",
          options: ["Option 1", "Option 2"],
          answerIndex: 0,
          explanation: "Only 2 options provided.",
        },
      ],
    };
    const res = QuizResponseSchema.safeParse(invalid);
    expect(res.success).toBe(false);
  });

  it("validates valid JDRequestSchema and rejects too short input", () => {
    expect(JDRequestSchema.safeParse({ jobDescription: "Too short" }).success).toBe(false);
    expect(
      JDRequestSchema.safeParse({
        jobDescription:
          "We are hiring a Data Science Intern with Python, SQL, and machine learning skills for Grid Dynamics.",
      }).success
    ).toBe(true);
  });

  it("validates CoachRequestSchema", () => {
    const valid = {
      question: "What is your experience with pandas?",
      answer: "I used pandas to clean 100k records and perform groupby aggregations.",
    };
    expect(CoachRequestSchema.safeParse(valid).success).toBe(true);
  });
});
