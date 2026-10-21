import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import type { QuizAttempt, InterviewSession, CoachSession, JDAnalysisSession } from "@/lib/storage";

interface DBRow {
  id: string;
  data: string;
  timestamp: string;
}

export async function GET() {
  try {
    // 1. Quizzes
    const quizStmt = db.prepare("SELECT data FROM quizzes ORDER BY datetime(timestamp) DESC LIMIT 100");
    const quizRows = quizStmt.all() as unknown as DBRow[];
    const quizzes: QuizAttempt[] = quizRows.map((r) => JSON.parse(r.data));

    // 2. Interviews
    const interviewStmt = db.prepare("SELECT data FROM interviews ORDER BY datetime(timestamp) DESC LIMIT 50");
    const interviewRows = interviewStmt.all() as unknown as DBRow[];
    const interviews: InterviewSession[] = interviewRows.map((r) => JSON.parse(r.data));

    // 3. Coach Sessions
    const coachStmt = db.prepare("SELECT data FROM coach_sessions ORDER BY datetime(timestamp) DESC LIMIT 50");
    const coachRows = coachStmt.all() as unknown as DBRow[];
    const coachSessions: CoachSession[] = coachRows.map((r) => JSON.parse(r.data));

    // 4. JD Analyses
    const jdStmt = db.prepare("SELECT data FROM jd_analyses ORDER BY datetime(timestamp) DESC LIMIT 30");
    const jdRows = jdStmt.all() as unknown as DBRow[];
    const jdAnalyses: JDAnalysisSession[] = jdRows.map((r) => JSON.parse(r.data));

    // 5. Practice Dates
    const datesStmt = db.prepare("SELECT date FROM practice_dates ORDER BY date ASC");
    const dateRows = datesStmt.all() as unknown as { date: string }[];
    const practiceDates: string[] = dateRows.map((r) => r.date);

    return NextResponse.json({
      success: true,
      quizzes,
      interviews,
      coachSessions,
      jdAnalyses,
      practiceDates,
    });
  } catch (error) {
    console.error("Failed to read history from SQLite:", error);
    return NextResponse.json(
      { success: false, error: "Failed to retrieve history" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { type, data, syncData } = body;

    const recordDate = (ts?: string) => {
      try {
        const dateStr = (ts ? new Date(ts) : new Date()).toISOString().split("T")[0];
        const stmt = db.prepare("INSERT OR IGNORE INTO practice_dates (date) VALUES (?)");
        stmt.run(dateStr);
      } catch (e) {
        console.warn("Could not record practice date", e);
      }
    };

    if (type === "quiz" && data) {
      const q = data as QuizAttempt;
      const stmt = db.prepare(`
        INSERT OR REPLACE INTO quizzes (id, timestamp, section, section_label, difficulty, total_questions, score, duration_seconds, data)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      stmt.run(
        q.id,
        q.timestamp,
        q.section || "",
        q.sectionLabel || "",
        q.difficulty || "",
        q.totalQuestions || 0,
        q.score || 0,
        q.durationSeconds || 0,
        JSON.stringify(q)
      );
      recordDate(q.timestamp);
      return NextResponse.json({ success: true, id: q.id });
    }

    if (type === "interview" && data) {
      const i = data as InterviewSession;
      const stmt = db.prepare(`
        INSERT OR REPLACE INTO interviews (id, timestamp, round, difficulty, data)
        VALUES (?, ?, ?, ?, ?)
      `);
      stmt.run(i.id, i.timestamp, i.round || "", i.difficulty || "", JSON.stringify(i));
      recordDate(i.timestamp);
      return NextResponse.json({ success: true, id: i.id });
    }

    if (type === "coach" && data) {
      const c = data as CoachSession;
      const stmt = db.prepare(`
        INSERT OR REPLACE INTO coach_sessions (id, timestamp, question, data)
        VALUES (?, ?, ?, ?)
      `);
      stmt.run(c.id, c.timestamp, c.question || "", JSON.stringify(c));
      recordDate(c.timestamp);
      return NextResponse.json({ success: true, id: c.id });
    }

    if (type === "jd" && data) {
      const j = data as JDAnalysisSession;
      const stmt = db.prepare(`
        INSERT OR REPLACE INTO jd_analyses (id, timestamp, role, data)
        VALUES (?, ?, ?, ?)
      `);
      stmt.run(j.id, j.timestamp, j.role || "", JSON.stringify(j));
      recordDate(j.timestamp);
      return NextResponse.json({ success: true, id: j.id });
    }

    // Bulk sync from client (e.g. migrating local storage into SQLite)
    if (type === "sync" && syncData) {
      if (Array.isArray(syncData.quizzes)) {
        const stmt = db.prepare(`
          INSERT OR REPLACE INTO quizzes (id, timestamp, section, section_label, difficulty, total_questions, score, duration_seconds, data)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        for (const q of syncData.quizzes) {
          stmt.run(
            q.id,
            q.timestamp,
            q.section || "",
            q.sectionLabel || "",
            q.difficulty || "",
            q.totalQuestions || 0,
            q.score || 0,
            q.durationSeconds || 0,
            JSON.stringify(q)
          );
          recordDate(q.timestamp);
        }
      }

      if (Array.isArray(syncData.interviews)) {
        const stmt = db.prepare(`
          INSERT OR REPLACE INTO interviews (id, timestamp, round, difficulty, data)
          VALUES (?, ?, ?, ?, ?)
        `);
        for (const i of syncData.interviews) {
          stmt.run(i.id, i.timestamp, i.round || "", i.difficulty || "", JSON.stringify(i));
          recordDate(i.timestamp);
        }
      }

      if (Array.isArray(syncData.coaches)) {
        const stmt = db.prepare(`
          INSERT OR REPLACE INTO coach_sessions (id, timestamp, question, data)
          VALUES (?, ?, ?, ?)
        `);
        for (const c of syncData.coaches) {
          stmt.run(c.id, c.timestamp, c.question || "", JSON.stringify(c));
          recordDate(c.timestamp);
        }
      }

      if (Array.isArray(syncData.jdAnalyses)) {
        const stmt = db.prepare(`
          INSERT OR REPLACE INTO jd_analyses (id, timestamp, role, data)
          VALUES (?, ?, ?, ?)
        `);
        for (const j of syncData.jdAnalyses) {
          stmt.run(j.id, j.timestamp, j.role || "", JSON.stringify(j));
          recordDate(j.timestamp);
        }
      }

      if (Array.isArray(syncData.practiceDates)) {
        const stmt = db.prepare("INSERT OR IGNORE INTO practice_dates (date) VALUES (?)");
        for (const d of syncData.practiceDates) {
          stmt.run(d);
        }
      }

      return NextResponse.json({ success: true, message: "Synced successfully" });
    }

    return NextResponse.json({ success: false, error: "Invalid type or missing data" }, { status: 400 });
  } catch (error) {
    console.error("Failed to write to SQLite:", error);
    return NextResponse.json({ success: false, error: "Database write error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");

    if (type === "quiz") {
      db.exec("DELETE FROM quizzes");
    } else if (type === "interview") {
      db.exec("DELETE FROM interviews");
    } else if (type === "coach") {
      db.exec("DELETE FROM coach_sessions");
    } else if (type === "jd") {
      db.exec("DELETE FROM jd_analyses");
    } else {
      db.exec(`
        DELETE FROM quizzes;
        DELETE FROM interviews;
        DELETE FROM coach_sessions;
        DELETE FROM jd_analyses;
        DELETE FROM practice_dates;
      `);
    }

    return NextResponse.json({ success: true, message: "Cleared successfully" });
  } catch (error) {
    console.error("Failed to clear database:", error);
    return NextResponse.json({ success: false, error: "Database delete error" }, { status: 500 });
  }
}
