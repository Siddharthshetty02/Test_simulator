import { jsPDF } from "jspdf";
import type { QuizAttempt, JDAnalysisSession, CoachSession } from "@/lib/storage";

// Clean brand palette
const BRAND = {
  primary: [10, 35, 75], // #0A234B
  accent: [37, 99, 235], // #2563EB
  textDark: [15, 23, 42], // #0F172A
  textMuted: [100, 116, 139], // #64748B
  bgLight: [248, 250, 252], // #F8FAFC
  border: [226, 232, 240], // #E2E8F0
  green: [22, 101, 52], // #166534
  red: [153, 27, 27], // #991B1B
};

function initDoc(title: string, subtitle: string): { doc: jsPDF; startY: number } {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();

  // Top header banner
  doc.setFillColor(BRAND.primary[0], BRAND.primary[1], BRAND.primary[2]);
  doc.rect(0, 0, pageWidth, 28, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text(title, 14, 13);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(219, 234, 254);
  doc.text(subtitle, 14, 21);

  const dateStr = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
  doc.setFontSize(8);
  doc.text(`Generated: ${dateStr}`, pageWidth - 14, 21, { align: "right" });

  return { doc, startY: 36 };
}

function checkPageBreak(doc: jsPDF, currentY: number, neededSpace = 20): number {
  const pageHeight = doc.internal.pageSize.getHeight();
  if (currentY + neededSpace > pageHeight - 15) {
    doc.addPage();
    return 20;
  }
  return currentY;
}

/**
 * 1. Export 7-Day Study Plan PDF
 */
export function exportStudyPlanPDF(data: {
  role: string;
  studyPlan: Array<{ day: number; focus: string; tasks: string[] }>;
  priorityTopics?: Array<{ topic: string; why: string; hours: number }>;
  requiredSkills?: string[];
}) {
  const { doc, startY } = initDoc(
    "Grid Dynamics DS Intern — 7-Day Study Plan",
    `Tailored Revision Curriculum for: ${data.role || "Data Science Intern"}`
  );

  let y = startY;
  const pageWidth = doc.internal.pageSize.getWidth();
  const contentWidth = pageWidth - 28;

  // Overview box
  if (data.requiredSkills && data.requiredSkills.length > 0) {
    doc.setFillColor(BRAND.bgLight[0], BRAND.bgLight[1], BRAND.bgLight[2]);
    doc.roundedRect(14, y, contentWidth, 18, 2, 2, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(BRAND.primary[0], BRAND.primary[1], BRAND.primary[2]);
    doc.text("Target Core Competencies:", 18, y + 6);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(BRAND.textDark[0], BRAND.textDark[1], BRAND.textDark[2]);
    const skillsText = doc.splitTextToSize(data.requiredSkills.join("  •  "), contentWidth - 8);
    doc.text(skillsText, 18, y + 12);

    y += 24;
  }

  // Priority Topics Table
  if (data.priorityTopics && data.priorityTopics.length > 0) {
    y = checkPageBreak(doc, y, 35);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(BRAND.primary[0], BRAND.primary[1], BRAND.primary[2]);
    doc.text("Prioritized High-Yield Topics", 14, y);
    y += 6;

    data.priorityTopics.slice(0, 5).forEach((pt) => {
      y = checkPageBreak(doc, y, 12);
      doc.setFillColor(241, 245, 249);
      doc.rect(14, y, contentWidth, 8, "F");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(BRAND.accent[0], BRAND.accent[1], BRAND.accent[2]);
      doc.text(pt.topic, 17, y + 5.5);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(BRAND.textMuted[0], BRAND.textMuted[1], BRAND.textMuted[2]);
      doc.text(`~${pt.hours} hrs`, pageWidth - 17, y + 5.5, { align: "right" });

      y += 10;
    });

    y += 4;
  }

  // 7-Day Day-by-Day Plan
  y = checkPageBreak(doc, y, 30);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(BRAND.primary[0], BRAND.primary[1], BRAND.primary[2]);
  doc.text("Day-by-Day Execution Schedule", 14, y);
  y += 7;

  data.studyPlan.forEach((sp) => {
    y = checkPageBreak(doc, y, 25);

    // Day Header Pill
    doc.setFillColor(BRAND.primary[0], BRAND.primary[1], BRAND.primary[2]);
    doc.roundedRect(14, y, 18, 6, 1.5, 1.5, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    doc.text(`Day ${sp.day}`, 23, y + 4.2, { align: "center" });

    // Focus Title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(BRAND.textDark[0], BRAND.textDark[1], BRAND.textDark[2]);
    doc.text(sp.focus, 36, y + 4.5);

    y += 8;

    // Tasks bullets
    sp.tasks.forEach((task) => {
      y = checkPageBreak(doc, y, 8);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(BRAND.textDark[0], BRAND.textDark[1], BRAND.textDark[2]);
      const lines = doc.splitTextToSize(`•  ${task}`, contentWidth - 10);
      doc.text(lines, 20, y);
      y += lines.length * 4.2;
    });

    y += 3;
  });

  doc.save(`GridDynamics_7Day_StudyPlan_${Date.now()}.pdf`);
}

/**
 * 2. Export STAR Answer Analysis PDF
 */
export function exportSTARAnswerPDF(data: {
  question: string;
  userAnswer: string;
  feedback: string;
  verdict?: string;
}) {
  const { doc, startY } = initDoc(
    "Grid Dynamics Interview — STAR Coaching Report",
    "Behavioral & Technical Response Evaluation"
  );

  let y = startY;
  const pageWidth = doc.internal.pageSize.getWidth();
  const contentWidth = pageWidth - 28;

  // Question Box
  doc.setFillColor(BRAND.bgLight[0], BRAND.bgLight[1], BRAND.bgLight[2]);
  const qLines = doc.splitTextToSize(data.question, contentWidth - 8);
  const qBoxHeight = Math.max(14, qLines.length * 4.5 + 8);
  doc.roundedRect(14, y, contentWidth, qBoxHeight, 2, 2, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(BRAND.accent[0], BRAND.accent[1], BRAND.accent[2]);
  doc.text("Interview Question:", 18, y + 5);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(BRAND.textDark[0], BRAND.textDark[1], BRAND.textDark[2]);
  doc.text(qLines, 18, y + 10);

  y += qBoxHeight + 6;

  // Candidate Draft
  y = checkPageBreak(doc, y, 25);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(BRAND.primary[0], BRAND.primary[1], BRAND.primary[2]);
  doc.text("Your Draft Answer:", 14, y);
  y += 5;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(BRAND.textDark[0], BRAND.textDark[1], BRAND.textDark[2]);
  const draftLines = doc.splitTextToSize(data.userAnswer, contentWidth);
  doc.text(draftLines, 14, y);
  y += draftLines.length * 4 + 6;

  // Verdict Pill
  if (data.verdict) {
    y = checkPageBreak(doc, y, 16);
    doc.setFillColor(239, 246, 255);
    doc.roundedRect(14, y, contentWidth, 10, 1.5, 1.5, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(BRAND.accent[0], BRAND.accent[1], BRAND.accent[2]);
    doc.text(`AI Coach Verdict: ${data.verdict}`, 18, y + 6.5);
    y += 15;
  }

  // Structured Feedback / STAR Evaluation
  y = checkPageBreak(doc, y, 25);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(BRAND.primary[0], BRAND.primary[1], BRAND.primary[2]);
  doc.text("STAR Evaluation & Improvement Blueprint:", 14, y);
  y += 6;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(BRAND.textDark[0], BRAND.textDark[1], BRAND.textDark[2]);

  // Clean markdown-ish formatting for feedback lines
  const cleanFeedback = data.feedback
    .replace(/###/g, "")
    .replace(/\*\*/g, "")
    .replace(/##/g, "");

  const fbLines = doc.splitTextToSize(cleanFeedback, contentWidth);
  fbLines.forEach((line: string) => {
    y = checkPageBreak(doc, y, 5);
    doc.text(line, 14, y);
    y += 4.2;
  });

  doc.save(`GridDynamics_STAR_Coach_${Date.now()}.pdf`);
}

/**
 * 3. Export Quiz Scorecard & Test Review PDF
 */
export function exportQuizScorecardPDF(attempt: QuizAttempt) {
  const { doc, startY } = initDoc(
    "Grid Dynamics Assessment Simulator — Scorecard",
    `Test Report: ${attempt.sectionLabel || "Technical Assessment"} (${attempt.difficulty || "standard"})`
  );

  let y = startY;
  const pageWidth = doc.internal.pageSize.getWidth();
  const contentWidth = pageWidth - 28;

  const scorePct = Math.round((attempt.score / (attempt.totalQuestions || 1)) * 100);
  const isPassed = scorePct >= 70;

  // Metric Summary Banner
  doc.setFillColor(isPassed ? 240 : 254, isPassed ? 253 : 242, isPassed ? 244 : 242);
  doc.roundedRect(14, y, contentWidth, 22, 2, 2, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(isPassed ? BRAND.green[0] : BRAND.red[0], isPassed ? BRAND.green[1] : BRAND.red[1], isPassed ? BRAND.green[2] : BRAND.red[2]);
  doc.text(`${scorePct}%`, 22, y + 11);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(BRAND.textDark[0], BRAND.textDark[1], BRAND.textDark[2]);
  doc.text(`${attempt.score} of ${attempt.totalQuestions} questions correct`, 48, y + 9);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(BRAND.textMuted[0], BRAND.textMuted[1], BRAND.textMuted[2]);
  const durationMin = Math.round((attempt.durationSeconds || 0) / 60);
  doc.text(`Duration: ~${durationMin} min | Result: ${isPassed ? "Pass / Ready" : "Needs Review"}`, 48, y + 15);

  y += 28;

  // Topic Accuracy Table
  if (attempt.topicAccuracy && Object.keys(attempt.topicAccuracy).length > 0) {
    y = checkPageBreak(doc, y, 30);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(BRAND.primary[0], BRAND.primary[1], BRAND.primary[2]);
    doc.text("Topic Accuracy Breakdown", 14, y);
    y += 6;

    Object.entries(attempt.topicAccuracy).forEach(([topic, s]) => {
      y = checkPageBreak(doc, y, 8);
      const acc = Math.round((s.correct / (s.total || 1)) * 100);

      doc.setFillColor(248, 250, 252);
      doc.rect(14, y, contentWidth, 7, "F");

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(BRAND.textDark[0], BRAND.textDark[1], BRAND.textDark[2]);
      doc.text(topic, 17, y + 4.8);

      doc.setFont("helvetica", "bold");
      doc.setTextColor(acc >= 70 ? BRAND.green[0] : BRAND.red[0], acc >= 70 ? BRAND.green[1] : BRAND.red[1], acc >= 70 ? BRAND.green[2] : BRAND.red[2]);
      doc.text(`${s.correct}/${s.total} (${acc}%)`, pageWidth - 17, y + 4.8, { align: "right" });

      y += 8.5;
    });

    y += 5;
  }

  // Question-by-Question Review
  if (attempt.questions && attempt.questions.length > 0) {
    y = checkPageBreak(doc, y, 20);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(BRAND.primary[0], BRAND.primary[1], BRAND.primary[2]);
    doc.text("Question-by-Question Diagnostic Review", 14, y);
    y += 7;

    attempt.questions.forEach((q, i) => {
      const isCorrect = q.userSelected === q.answerIndex;
      y = checkPageBreak(doc, y, 28);

      // Question header
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(isCorrect ? BRAND.green[0] : BRAND.red[0], isCorrect ? BRAND.green[1] : BRAND.red[1], isCorrect ? BRAND.green[2] : BRAND.red[2]);
      doc.text(`Q${i + 1}. [${isCorrect ? "CORRECT" : "INCORRECT"}] - ${q.topic || "Technical"}`, 14, y);
      y += 4.5;

      // Question stem
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(BRAND.textDark[0], BRAND.textDark[1], BRAND.textDark[2]);
      const stemLines = doc.splitTextToSize(q.question, contentWidth);
      doc.text(stemLines, 14, y);
      y += stemLines.length * 3.8 + 1.5;

      // Correct & Selected answers
      const correctText = q.options[q.answerIndex] || `Option ${q.answerIndex + 1}`;
      const userText =
        q.userSelected !== undefined
          ? q.options[q.userSelected] || `Option ${q.userSelected + 1}`
          : "Unanswered";

      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(BRAND.textMuted[0], BRAND.textMuted[1], BRAND.textMuted[2]);
      doc.text(`Your Answer: ${userText}  |  Correct Answer: ${correctText}`, 14, y);
      y += 4.5;

      // Explanation
      if (q.explanation) {
        doc.setFont("helvetica", "italic");
        doc.setFontSize(7.5);
        doc.setTextColor(100, 116, 139);
        const expLines = doc.splitTextToSize(`Explanation: ${q.explanation}`, contentWidth);
        doc.text(expLines, 14, y);
        y += expLines.length * 3.6;
      }

      y += 4;
    });
  }

  doc.save(`GridDynamics_Quiz_Scorecard_${attempt.section}_${Date.now()}.pdf`);
}
