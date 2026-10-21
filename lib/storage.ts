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

export interface DBHistoryPayload {
  quizzes: QuizAttempt[];
  interviews: InterviewSession[];
  coachSessions: CoachSession[];
  jdAnalyses: JDAnalysisSession[];
  practiceDates: string[];
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

// Background helper to persist to SQLite without blocking UI
async function saveToDatabase(type: string, data: unknown) {
  if (!isBrowser()) return;
  try {
    await fetch("/api/history", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, data }),
    });
  } catch (e) {
    console.warn(`[storage] Failed to save ${type} to SQLite database:`, e);
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
      const updated = [attempt, ...current].slice(0, 100);
      localStorage.setItem(STORAGE_KEYS.QUIZ_HISTORY, JSON.stringify(updated));
      recordActivityToday();
      saveToDatabase("quiz", attempt);
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
        updated = [session, ...current].slice(0, 50);
      }
      localStorage.setItem(STORAGE_KEYS.INTERVIEW_SESSIONS, JSON.stringify(updated));
      recordActivityToday();
      saveToDatabase("interview", session);
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
      const updated = [session, ...current].slice(0, 50);
      localStorage.setItem(STORAGE_KEYS.COACH_SESSIONS, JSON.stringify(updated));
      recordActivityToday();
      saveToDatabase("coach", session);
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
      const updated = [analysis, ...current].slice(0, 30);
      localStorage.setItem(STORAGE_KEYS.JD_ANALYSES, JSON.stringify(updated));
      recordActivityToday();
      saveToDatabase("jd", analysis);
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

  // Bi-directional synchronization with SQLite database
  async syncWithDB(): Promise<DBHistoryPayload | null> {
    if (!isBrowser()) return null;
    try {
      // 1. Gather any local items to ensure nothing in current browser is lost
      const localQuizzes = storage.getQuizHistory();
      const localInterviews = storage.getInterviewSessions();
      const localCoaches = storage.getCoachSessions();
      const localJD = storage.getJDAnalyses();
      const localDates = storage.getPracticeDates();

      // Send local items to SQLite if any exist
      if (
        localQuizzes.length > 0 ||
        localInterviews.length > 0 ||
        localCoaches.length > 0 ||
        localJD.length > 0
      ) {
        await fetch("/api/history", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "sync",
            syncData: {
              quizzes: localQuizzes,
              interviews: localInterviews,
              coaches: localCoaches,
              jdAnalyses: localJD,
              practiceDates: localDates,
            },
          }),
        });
      }

      // 2. Fetch full truth from SQLite database
      const res = await fetch("/api/history");
      if (!res.ok) return null;
      const json = await res.json();
      if (!json.success) return null;

      const payload: DBHistoryPayload = {
        quizzes: json.quizzes || [],
        interviews: json.interviews || [],
        coachSessions: json.coachSessions || [],
        jdAnalyses: json.jdAnalyses || [],
        practiceDates: json.practiceDates || [],
      };

      // 3. Cache the full SQLite database back into localStorage
      localStorage.setItem(STORAGE_KEYS.QUIZ_HISTORY, JSON.stringify(payload.quizzes));
      localStorage.setItem(STORAGE_KEYS.INTERVIEW_SESSIONS, JSON.stringify(payload.interviews));
      localStorage.setItem(STORAGE_KEYS.COACH_SESSIONS, JSON.stringify(payload.coachSessions));
      localStorage.setItem(STORAGE_KEYS.JD_ANALYSES, JSON.stringify(payload.jdAnalyses));
      localStorage.setItem(STORAGE_KEYS.PRACTICE_DATES, JSON.stringify(payload.practiceDates));

      return payload;
    } catch (e) {
      console.warn("[storage] Error syncing with SQLite database:", e);
      return null;
    }
  },

  // Clear all
  clearAll(): void {
    if (!isBrowser()) return;
    Object.values(STORAGE_KEYS).forEach((k) => localStorage.removeItem(k));
    fetch("/api/history", { method: "DELETE" }).catch(() => {});
  },

  clearQuizHistory(): void {
    if (!isBrowser()) return;
    localStorage.removeItem(STORAGE_KEYS.QUIZ_HISTORY);
    fetch("/api/history?type=quiz", { method: "DELETE" }).catch(() => {});
  },
};
