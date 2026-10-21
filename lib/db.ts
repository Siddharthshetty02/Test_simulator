import { DatabaseSync } from "node:sqlite";
import path from "node:path";
import fs from "node:fs";

// Ensure data folder exists
const dataDir = path.join(process.cwd(), "data");
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, "simulator.sqlite");

// Global singleton to prevent multiple connections in Next.js hot reload
declare global {
  // eslint-disable-next-line no-var
  var _sqliteDb: DatabaseSync | undefined;
}

function getDatabase(): DatabaseSync {
  if (globalThis._sqliteDb) {
    return globalThis._sqliteDb;
  }

  const db = new DatabaseSync(dbPath);

  // Performance and concurrency pragmas
  db.exec("PRAGMA journal_mode = WAL;");
  db.exec("PRAGMA synchronous = NORMAL;");

  // Initialize tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS quizzes (
      id TEXT PRIMARY KEY,
      timestamp TEXT NOT NULL,
      section TEXT,
      section_label TEXT,
      difficulty TEXT,
      total_questions INTEGER,
      score INTEGER,
      duration_seconds INTEGER,
      data TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS interviews (
      id TEXT PRIMARY KEY,
      timestamp TEXT NOT NULL,
      round TEXT,
      difficulty TEXT,
      data TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS coach_sessions (
      id TEXT PRIMARY KEY,
      timestamp TEXT NOT NULL,
      question TEXT,
      data TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS jd_analyses (
      id TEXT PRIMARY KEY,
      timestamp TEXT NOT NULL,
      role TEXT,
      data TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS practice_dates (
      date TEXT PRIMARY KEY
    );
  `);

  globalThis._sqliteDb = db;
  return db;
}

export const db = getDatabase();
