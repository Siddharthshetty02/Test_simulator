export const APP_NAME = "DS Intern Prep Hub";
export const TARGET_COMPANY = "Grid Dynamics";
export const DISCLAIMER_TEXT =
  "All practice questions, interview prompts, and tests are original educational materials created to help candidates prepare for data science internship assessments. This hub is not affiliated with, endorsed by, or disclosing actual confidential test content from Grid Dynamics.";

export const INTERVIEW_ROUNDS = [
  { id: "online_test", label: "Online Test Prep", desc: "Technical MCQs, coding & problem solving" },
  { id: "technical_interview", label: "Technical Interview", desc: "Algorithms, ML fundamentals, SQL & system concepts" },
  { id: "hr_screening", label: "HR / Fit Screening", desc: "Background, behavioral, communication & culture fit" },
] as const;

export const INTERVIEW_TOPICS = [
  "Python",
  "pandas and NumPy",
  "SQL",
  "Statistics",
  "Machine Learning",
  "Git",
  "OOP and Engineering",
  "My Projects",
] as const;

export const DIFFICULTY_LEVELS = [
  { id: "beginner", label: "Beginner", desc: "Core concepts & syntax" },
  { id: "intermediate", label: "Intermediate", desc: "Edge cases, trade-offs & practical application" },
] as const;

export const QUIZ_SECTIONS = [
  { id: "full_mock", label: "Full Mock Test (25 Qs - 30 mins)", desc: "All 5 reported sections balanced", count: 25, duration: 1800 },
  { id: "infinite_practice", label: "AI Targeted Drill (Infinite)", desc: "Fresh AI-generated questions tailored to your weakest areas", count: 10, duration: 600 },
  { id: "ds_fundamentals", label: "DS Fundamentals", desc: "Supervised/unsupervised ML, evaluation metrics, overfitting", count: 10, duration: 600 },
  { id: "general_ds", label: "General Data Science", desc: "Data cleaning, feature engineering, EDA, statistics", count: 10, duration: 600 },
  { id: "engineering", label: "Engineering & OOP", desc: "Python OOP, data structures, complexity, clean code", count: 10, duration: 600 },
  { id: "git", label: "Git & Version Control", desc: "Branching, rebase vs merge, conflicts, remotes", count: 10, duration: 600 },
  { id: "english", label: "English & Verbal Ability", desc: "Grammar, comprehension, technical communication", count: 10, duration: 600 },
] as const;

export const DEFAULT_QUIZ_COUNTS = [5, 10, 15, 20] as const;
