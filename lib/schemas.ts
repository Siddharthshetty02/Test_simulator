import { z } from "zod";

// --- Mock Interviewer ---
export const InterviewRequestSchema = z.object({
  round: z.enum(["online_test", "hr_screening", "technical_interview"]),
  topics: z.array(z.string()).min(1, "Select at least one focus topic"),
  difficulty: z.enum(["beginner", "intermediate"]),
  projects: z.string().max(6000, "Project summary must be under 6000 characters").optional(),
  messages: z.array(
    z.object({
      role: z.enum(["user", "assistant", "system"]),
      content: z.string().max(6000, "Message is too long"),
    })
  ),
});

export type InterviewRequest = z.infer<typeof InterviewRequestSchema>;

// --- Quiz Generator ---
export const QuizRequestSchema = z.object({
  section: z.enum([
    "english",
    "git",
    "general_ds",
    "ds_fundamentals",
    "engineering",
    "full_mock",
  ]),
  difficulty: z.enum(["beginner", "intermediate"]),
  count: z.number().int().min(5).max(25),
  timerEnabled: z.boolean().default(true),
});

export type QuizRequest = z.infer<typeof QuizRequestSchema>;

export const QuizQuestionSchema = z.object({
  id: z.number(),
  topic: z.string(),
  question: z.string().min(5),
  options: z.array(z.string()).length(4, "Each question must have exactly 4 options"),
  answerIndex: z.number().int().min(0).max(3),
  explanation: z.string().min(5),
});

export const QuizResponseSchema = z.object({
  questions: z.array(QuizQuestionSchema).min(1),
});

export type QuizQuestion = z.infer<typeof QuizQuestionSchema>;
export type QuizResponse = z.infer<typeof QuizResponseSchema>;

// --- JD Analyzer ---
export const JDRequestSchema = z.object({
  jobDescription: z
    .string()
    .min(30, "Please paste a realistic job description (at least 30 characters)")
    .max(6000, "Job description exceeds 6000 characters limit"),
});

export type JDRequest = z.infer<typeof JDRequestSchema>;

export const JDResponseSchema = z.object({
  role: z.string(),
  required_skills: z.array(z.string()),
  nice_to_have: z.array(z.string()),
  priority_topics: z.array(
    z.object({
      topic: z.string(),
      why: z.string(),
      hours: z.number(),
    })
  ),
  study_plan_7_days: z.array(
    z.object({
      day: z.number(),
      focus: z.string(),
      tasks: z.array(z.string()),
    })
  ),
  likely_questions: z.array(
    z.object({
      question: z.string(),
      topic: z.string(),
    })
  ),
});

export type JDResponse = z.infer<typeof JDResponseSchema>;

// --- Answer Coach ---
export const CoachRequestSchema = z.object({
  question: z
    .string()
    .min(5, "Please enter the interview question")
    .max(6000, "Question is too long"),
  answer: z
    .string()
    .min(10, "Please provide your answer to be reviewed")
    .max(6000, "Answer is too long"),
});

export type CoachRequest = z.infer<typeof CoachRequestSchema>;
