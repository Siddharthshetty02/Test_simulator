# Test Simulator — DS Intern Prep Hub 🚀
### Data Science Internship Test & Interview Simulator (Tailored for Grid Dynamics)

A production-quality, AI-powered web application designed to help final-year engineering and CS students prepare for the **Grid Dynamics data science internship assessments, online tests, and technical interviews**.

> **Educational Disclaimer**: *This hub contains original practice materials, questions, and curriculum frameworks designed to help candidates prepare for data science assessments. It is not affiliated with, endorsed by, or claiming to contain actual confidential questions from Grid Dynamics.*

---

## 🌟 Key Features

1. **Mock Interviewer (Streaming Chat)**
   - Company fixed to **Grid Dynamics**.
   - Select assessment round (*Online Test Prep*, *HR / Fit Screening*, *Technical Interview*).
   - Multi-select topics (*Python, pandas & NumPy, SQL, statistics, machine learning, Git, OOP & engineering, candidate's projects*).
   - Difficulty level toggle (*Beginner*, *Intermediate*).
   - **One question at a time**: after each response, the AI provides:
     - 🎯 **Score out of 10**
     - 👍 **What was good**
     - 🔍 **What was missing**
     - 💡 **Model answer (max 5 lines)**
     - ➡️ **Next question**
   - Live server-sent events (SSE) streaming with stop generation, message copy, and markdown code formatting.

2. **Quiz & Assessment Simulator**
   - Tests based on the reported 5 test sections:
     - **English & Verbal Ability**
     - **Git Version Control**
     - **General Data Science** (EDA, statistics, feature engineering)
     - **Data Science Fundamentals** (Supervised/Unsupervised ML, metrics)
     - **Engineering & OOP** (Python OOP, data structures, complexity)
     - **Full Mock Test**: 25 questions across all 5 sections with a 30-minute countdown timer!
   - Interactive timed player with **Question Palette** (Answered, Current, Marked for Review, Unanswered).
   - Comprehensive results screen with **per-topic accuracy bars** and detailed question explanations.
   - History automatically tracked in `localStorage`.

3. **Job Description (JD) Analyzer**
   - Paste the Grid Dynamics internship posting (or click *"Insert Sample Grid Dynamics JD"*).
   - AI extracts:
     - Role overview & title
     - **Required Skills** vs. **Nice-to-Haves** (badges)
     - **Prioritized Revision Topics** table with why they matter and estimated prep hours
     - **7-Day Structured Study Plan** with day-by-day tasks
     - **10 High-Probability Interview Questions** with topic tags.

4. **STAR Answer Coach**
   - Input an interview question and your draft answer.
   - AI returns:
     - **Verdict** (one-line readiness score)
     - **Strengths**
     - **Gaps & missing metrics**
     - **STAR Check Table** (Situation, Task, Action, Result)
     - **Improved Answer** (tight rewrite under 120 words with **zero hallucinated facts** that the candidate did not mention).

5. **Analytics Dashboard**
   - Total tests completed and overall average accuracy percentage.
   - **Topic Mastery & Weak-Area Chart** powered by Recharts (highlights topics below 70%).
   - **Practice Streak** counter with a 28-day activity heatmap.
   - Recent session activity log across all tests and interviews.

6. **Settings & Themes**
   - Seamless **Light & Dark Mode** toggle with WCAG AA contrast.
   - Clear all local sessions and privacy data anytime.

---

## 🛠 Tech Stack

- **Framework**: Next.js 16 (App Router) with TypeScript
- **Styling**: Tailwind CSS, custom design tokens (Navy `#0A234B`, Royal Blue `#2563EB`), Inter font
- **Icons & UI**: Lucide React, accessible custom UI components
- **Forms & Validation**: Zod, React Hook Form
- **Data Visualization**: Recharts
- **Content Rendering**: React Markdown
- **Testing**: Vitest (11/11 passing tests for schemas and JSON parsers)
- **AI Backend**: OpenRouter API (OpenAI-compatible server-side route handlers with rate limiting, prompt injection defense, and JSON repair)

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js 20 or later
- npm or pnpm
- An [OpenRouter](https://openrouter.ai/) account and API key.

### 2. Installation
```bash
# Clone or navigate to the repository
cd test_simulator_GD

# Install dependencies
npm install --legacy-peer-deps
```

### 3. Environment Setup
Create a `.env.local` file in the project root:
```env
# OpenRouter API Key
OPENROUTER_API_KEY=sk-or-v1-your-key-here

# Selected model from openrouter.ai/models
# Recommended free or cost-effective models:
# - meta-llama/llama-3.3-70b-instruct:free
# - mistralai/mistral-7b-instruct:free
# - deepseek/deepseek-chat
OPENROUTER_MODEL=meta-llama/llama-3.3-70b-instruct:free

# Site URL
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

> **Security Note**: Never commit `.env.local` or prefix secret keys with `NEXT_PUBLIC_`. All AI communications occur strictly server-side in `app/api/*`.

### 4. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Run Unit Tests
```bash
npm test
# Or: npx vitest run
```

---

## 🌐 Deploying to Vercel

1. Push your repository to GitHub.
2. In [Vercel Dashboard](https://vercel.com/), click **Add New Project** and select your repository.
3. In **Project Settings > Environment Variables**, add:
   - `OPENROUTER_API_KEY`: Your OpenRouter secret key
   - `OPENROUTER_MODEL`: e.g. `meta-llama/llama-3.3-70b-instruct:free`
   - `NEXT_PUBLIC_SITE_URL`: Your production Vercel URL (e.g. `https://your-app.vercel.app`)
4. Click **Deploy**. Next.js App Router and serverless route handlers will be auto-configured.

---

## 🔒 Security & Guardrails

- **Delimited Prompt Injection Guard**: Candidate responses are enclosed in `---BEGIN CANDIDATE INPUT---` delimiters with explicit system instructions to ignore internal override attempts.
- **In-Memory Rate Limiting**: 20 requests per minute per IP to protect against abuse.
- **Server-Side Exclusivity**: Zero AI calls are made from the client browser.
- **Zod Schema & JSON Repair**: Every structured output is validated through Zod schemas. If malformed JSON is returned by free models, the route handler retries once with a strict repair instruction before serving.
