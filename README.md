# LedgerLens

**LedgerLens** trains junior finance professionals to develop real expertise by having them review, challenge, and approve AI-generated finance work, instead of doing the repetitive work themselves.

*Built for the AI Finance Hackathon.*

---

## 30-Second Demo Script for Judges

**1. Context Setting (5s):**
> "AI can do variance reports and forecasts instantly. The new bottleneck isn't *doing* the math, it's *judging* if the AI is right, incomplete, or overconfident. LedgerLens trains junior analysts how to be the ‘human in the loop.’"

**2. The Core Loop (15s):**
> *(Navigate to Dashboard → Click the Active Case: "Marketing Variance")*
> "Here, the AI has flagged a $240k variance as 'recurring quarterly spend.' A junior analyst reviews the AI's work and the source context. If they blindly approve, they fail the drill. The $240k was actually a one-off conference sponsorship misclassified by the AI. They need to catch this and escalate."
> *(Submit an approval or rejection with brief reasoning)*

**3. The Feedback & Skill Tracking (10s):**
> *(Evaluation screen loads with 4-criterion scorecard)*
> "Instantly, a senior-level LLM grades their judgment on four dimensions: Did they catch the main issue? Did they over-trust the AI? We track this over time."
> *(Navigate to Profile Page)*
> "The profile aggregates this into an 'Over-Trust Index' and flags specific strength/weakness patterns so managers know exactly what to coach."

---

## Architecture Overview

LedgerLens is built with a modern, high-performance stack prioritizing a beautiful, responsive UX and robust AI evaluation.

### Frontend (`apps/web`)
- **Next.js 15 (App Router)**: Fast, modern React framework.
- **TanStack Query**: Robust data fetching, polling, and caching.
- **Tailwind CSS**: Custom, high-fidelity design system with fluid animations and responsive layouts.
- **Architecture**: Separated into Domain clients (`DashboardClient`, `EvaluationClient`, `ProfileClient`) orchestrating pure presentational components.

### Backend (`apps/api`)
- **FastAPI**: Asynchronous Python backend.
- **SQLAlchemy + aiosqlite**: Async relational database layer for persistent audit logs, tracking, and scoring.
- **Anthropic Claude 3.5 Sonnet**: Powers the evaluation engine. Given the user's action and reasoning, Claude grades the review across four specific rubrics (Catching the Main Issue, AI Skepticism, Escalation Judgment, Explanation Quality) and synthesizes actionable feedback.

---

## Running Locally

### 1. Backend Setup
```bash
cd apps/api
python -m venv .venv
# On Windows PowerShell:
.venv\Scripts\activate
# On Mac/Linux:
# source .venv/bin/activate
pip install -e ".[dev]"
```

Create a `.env` file in `apps/api/`:
```env
ANTHROPIC_API_KEY=your_claude_key_here
```

Run the API:
```bash
uvicorn app.main:app --reload --port 8000
```

### 2. Frontend Setup
```bash
cd apps/web
npm install
npm run dev
```

The app will be available at [http://localhost:3000](http://localhost:3000).

*(Note: API keys can also be configured locally in the UI via the Settings page for client-side storage, ensuring keys are never transmitted unnecessarily.)*
