# LedgerLens

Finance judgment simulator. Junior analysts review AI-generated finance analyses, identify the mistakes the AI made, and get scored on their judgment quality.

> Built for the AI Finance Hackathon.

---

## What It Does

- AI generates finance scenarios (variance analysis, reconciliation, revenue recognition, etc.) with hidden flaws using Gemini
- Analysts read the scenario, choose an action (approve / reject / escalate), and write reasoning
- Gemini scores the submission across four criteria: caught main issue, over-trusted AI, escalated appropriately, explanation quality
- Profile tracks skill bars, Over-Trust Index, streak, and review history
- Organizations: admins create custom cases and invite team members; admin dashboard shows team performance

---

## Stack

| Layer | Tech |
|---|---|
| Frontend | Next.js 15 App Router, TypeScript, Tailwind CSS, TanStack Query v5 |
| Backend | FastAPI, SQLAlchemy async, SQLite (dev) / Postgres (prod) |
| Case generation | Google Gemini (`gemini-3.1-flash-lite`) |
| Scoring | Google Gemini (`gemini-3.1-flash-lite`) |
| Email | Gmail SMTP via Python `smtplib` |
| Payments | Stripe Checkout |

---

## Project Structure

```
ledgerlens/
├── apps/
│   ├── api/          # FastAPI backend
│   └── web/          # Next.js frontend
└── packages/
    └── types/        # JSON Schema → TypeScript + Pydantic types
```

---

## Running Locally

### Prerequisites

- Node.js 20+, pnpm
- Python 3.12+, [uv](https://docs.astral.sh/uv/)

### 1. Clone and install

```bash
git clone https://github.com/agherghesanu/ledgerlens.git
cd ledgerlens
pnpm install
```

### 2. API environment

```bash
cp apps/api/.env.example apps/api/.env
```

Edit `apps/api/.env`:

```env
DATABASE_URL=sqlite+aiosqlite:///./ledgerlens.db
GEMINI_API_KEY=your_gemini_api_key
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@gmail.com
SMTP_PASSWORD=your_gmail_app_password
FROM_EMAIL=your@gmail.com
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

Get a Gemini key at [aistudio.google.com](https://aistudio.google.com).  
Gmail: use an [App Password](https://myaccount.google.com/apppasswords), not your account password.

### 3. Start the API

```bash
cd apps/api
uv sync
uv run uvicorn app.main:app --reload
# → http://localhost:8000
# DB created automatically; seed cases inserted on first run
```

### 4. Start the web app

```bash
cd apps/web
pnpm dev
# → http://localhost:3000
```

---

## Environment Variables

### `apps/api/.env`

| Variable | Description |
|---|---|
| `DATABASE_URL` | SQLAlchemy async URL — SQLite for dev, `postgresql+asyncpg://...` for prod |
| `GEMINI_API_KEY` | Google AI Studio key — case generation and scoring |
| `SMTP_HOST` | SMTP server (`smtp.gmail.com`) |
| `SMTP_PORT` | SMTP port (587 for TLS) |
| `SMTP_USER` | SMTP login email |
| `SMTP_PASSWORD` | App password (not account password) |
| `FROM_EMAIL` | Sender address for outgoing emails |
| `STRIPE_SECRET_KEY` | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |

### `apps/web/.env.local`

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_API_URL` | API base URL (default: `http://localhost:8000`) |

---

## Features

- **Email verification** — 6-digit OTP on registration, resend support
- **Case browser** — filter by category and difficulty; generate new AI cases on demand
- **Organization cases** — org members see admin-created custom cases in case browser
- **Admin dashboard** — team performance scores, invite members
- **Rate limiting** — 100 req/min global per IP; 5/min on `/cases/generate`; 10/min on `/auth/register`
- **Over-Trust Index** — tracks how often a user blindly agrees with AI recommendations

---

## Deployment

**API → Railway / Render**

Set root directory to `apps/api`. Start command:
```
uvicorn app.main:app --host 0.0.0.0 --port $PORT
```
Add a Postgres plugin, copy the `DATABASE_URL` it provides (change `postgresql://` → `postgresql+asyncpg://`).

**Web → Vercel**

Set root directory to `apps/web`. Add one env var:
```
NEXT_PUBLIC_API_URL=https://your-api.railway.app
```
