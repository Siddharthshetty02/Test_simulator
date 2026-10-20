export interface QuizAttempt {
  id: string;
  timestamp: string;
  section: string;
  sectionLabel: string;
  difficulty: string;
  totalQuestions: number;
  score: number;
  durationSeconds: number;
  topicAccuracy: Record<string, { correct: number; total: number }>;
  questions: Array<{
    id: number;
    topic: string;
    question: string;
    options: string[];
    answerIndex: number;
    explanation: string;
    userSelected?: number;
  }>;
}

export interface InterviewSession {
  id: string;
  timestamp: string;
  round: string;
  topics: string[];
  difficulty: string;
  projectSummary?: string;
  messages: Array<{
    role: "user" | "assistant";
    content: string;
    timestamp?: string;
  }>;
  totalExchanges: number;
}

export interface CoachSession {
  id: string;
  timestamp: string;
  question: string;
  userAnswer: string;
  feedback: string;
  verdict?: string;
}

export interface JDAnalysisSession {
  id: string;
  timestamp: string;
  role: string;
  requiredSkills: string[];
  niceToHave: string[];
  priorityTopics: Array<{ topic: string; why: string; hours: number }>;
  studyPlan7Days: Array<{ day: number; focus: string; tasks: string[] }>;
  likelyQuestions: Array<{ question: string; topic: string }>;
}

const STORAGE_KEYS = {
  QUIZ_HISTORY: "ds_hub_quiz_history",
  INTERVIEW_SESSIONS: "ds_hub_interview_sessions",
  COACH_SESSIONS: "ds_hub_coach_sessions",
  JD_ANALYSES: "ds_hub_jd_analyses",
  PRACTICE_DATES: "ds_hub_practice_dates",
  THEME: "ds_hub_theme",
} as const;

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function recordActivityToday(): void {
  if (!isBrowser()) return;
  try {
    const today = new Date().toISOString().split("T")[0];
    const raw = localStorage.getItem(STORAGE_KEYS.PRACTICE_DATES);
    const dates: string[] = raw ? JSON.parse(raw) : [];
    if (!dates.includes(today)) {
      dates.push(today);
      localStorage.setItem(STORAGE_KEYS.PRACTICE_DATES, JSON.stringify(dates));
    }
  } catch (e) {
    console.warn("Failed to record activity date", e);
  }
}

export const storage = {
  // Quizzes
  getQuizHistory(): QuizAttempt[] {
    if (!isBrowser()) return [];
    try {
      const data = localStorage.getItem(STORAGE_KEYS.QUIZ_HISTORY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },
  saveQuizAttempt(attempt: QuizAttempt): void {
    if (!isBrowser()) return;
    try {
      const current = storage.getQuizHistory();
      const updated = [attempt, ...current].slice(0, 50); // keep last 50
      localStorage.setItem(STORAGE_KEYS.QUIZ_HISTORY, JSON.stringify(updated));
      recordActivityToday();
    } catch (e) {
      console.warn("Failed to save quiz attempt", e);
    }
  },

  // Interviews
  getInterviewSessions(): InterviewSession[] {
    if (!isBrowser()) return [];
    try {
      const data = localStorage.getItem(STORAGE_KEYS.INTERVIEW_SESSIONS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },
  saveInterviewSession(session: InterviewSession): void {
    if (!isBrowser()) return;
    try {
      const current = storage.getInterviewSessions();
      const existingIdx = current.findIndex((s) => s.id === session.id);
      let updated: InterviewSession[];
      if (existingIdx >= 0) {
        updated = [...current];
        updated[existingIdx] = session;
      } else {
        updated = [session, ...current].slice(0, 30);
      }
      localStorage.setItem(STORAGE_KEYS.INTERVIEW_SESSIONS, JSON.stringify(updated));
      recordActivityToday();
    } catch (e) {
      console.warn("Failed to save interview session", e);
    }
  },

  // Answer Coach
  getCoachSessions(): CoachSession[] {
    if (!isBrowser()) return [];
    try {
      const data = localStorage.getItem(STORAGE_KEYS.COACH_SESSIONS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },
  saveCoachSession(session: CoachSession): void {
    if (!isBrowser()) return;
    try {
      const current = storage.getCoachSessions();
      const updated = [session, ...current].slice(0, 30);
      localStorage.setItem(STORAGE_KEYS.COACH_SESSIONS, JSON.stringify(updated));
      recordActivityToday();
    } catch (e) {
      console.warn("Failed to save coach session", e);
    }
  },

  // JD Analysis
  getJDAnalyses(): JDAnalysisSession[] {
    if (!isBrowser()) return [];
    try {
      const data = localStorage.getItem(STORAGE_KEYS.JD_ANALYSES);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },
  saveJDAnalysis(analysis: JDAnalysisSession): void {
    if (!isBrowser()) return;
    try {
      const current = storage.getJDAnalyses();
      const updated = [analysis, ...current].slice(0, 20);
      localStorage.setItem(STORAGE_KEYS.JD_ANALYSES, JSON.stringify(updated));
      recordActivityToday();
    } catch (e) {
      console.warn("Failed to save JD analysis", e);
    }
  },

  // Practice Dates & Streak calculation
  getPracticeDates(): string[] {
    if (!isBrowser()) return [];
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PRACTICE_DATES);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },
  calculateStreak(): { currentStreak: number; totalDays: number } {
    const dates = storage.getPracticeDates().sort();
    if (!dates.length) return { currentStreak: 0, totalDays: 0 };

    const dateSet = new Set(dates);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let streak = 0;
    const checkDate = new Date(today);

    // Check if practiced today or yesterday to continue streak
    const dateStrToday = checkDate.toISOString().split("T")[0];
    if (!dateSet.has(dateStrToday)) {
      checkDate.setDate(checkDate.getDate() - 1);
    }

    while (true) {
      const str = checkDate.toISOString().split("T")[0];
      if (dateSet.has(str)) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    return { currentStreak: streak, totalDays: dateSet.size };
  },

  // Clear all
  clearAll(): void {
    if (!isBrowser()) return;
    Object.values(STORAGE_KEYS).forEach((k) => localStorage.removeItem(k));
  },
};
