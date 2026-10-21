import { describe, it, expect, beforeEach } from "vitest";
import { db } from "../lib/db";

describe("SQLite Database Integration", () => {
  beforeEach(() => {
    db.exec(`
      DELETE FROM quizzes;
      DELETE FROM interviews;
      DELETE FROM coach_sessions;
      DELETE FROM jd_analyses;
      DELETE FROM practice_dates;
    `);
  });

  it("inserts and retrieves a quiz attempt", () => {
    const attempt = {
      id: "quiz-test-1",
      timestamp: "2026-10-20T10:00:00Z",
      section: "git",
      sectionLabel: "Git Version Control",
      difficulty: "beginner",
      totalQuestions: 5,
      score: 4,
      durationSeconds: 120,
      topicAccuracy: { Git: { correct: 4, total: 5 } },
      questions: [],
    };

    const stmt = db.prepare(`
      INSERT OR REPLACE INTO quizzes (id, timestamp, section, section_label, difficulty, total_questions, score, duration_seconds, data)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      attempt.id,
      attempt.timestamp,
      attempt.section,
      attempt.sectionLabel,
      attempt.difficulty,
      attempt.totalQuestions,
      attempt.score,
      attempt.durationSeconds,
      JSON.stringify(attempt)
    );

    const select = db.prepare("SELECT * FROM quizzes WHERE id = ?");
    const row = select.get(attempt.id) as { id: string; data: string; score: number };

    expect(row).toBeDefined();
    expect(row.id).toBe("quiz-test-1");
    expect(row.score).toBe(4);
    const parsed = JSON.parse(row.data);
    expect(parsed.sectionLabel).toBe("Git Version Control");
  });

  it("inserts and tracks practice dates across multiple days", () => {
    const dates = ["2026-10-19", "2026-10-20", "2026-10-21"];
    const stmt = db.prepare("INSERT OR IGNORE INTO practice_dates (date) VALUES (?)");

    dates.forEach((d) => stmt.run(d));

    const select = db.prepare("SELECT date FROM practice_dates ORDER BY date ASC");
    const rows = select.all() as { date: string }[];

    expect(rows.length).toBe(3);
    expect(rows.map((r) => r.date)).toEqual(dates);
  });
});
