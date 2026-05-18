
Output style: no preamble, no postamble, no meta-commentary, no tool announcements.
Execute the task. Show the code. Move on. Explain only when explicitly asked.

---

# LedgerLens

Finance judgment simulator. Junior analysts review AI-generated finance work (variance analyses, reconciliations, forecasts), identify mistakes the AI made, and get scored on their judgment quality. Target users are finance students and early-career analysts building critical thinking skills against overconfident LLM output.

## User Flow

`Dashboard` → pick active case → `Case Review` (read AI analysis, select action, write reasoning) → submit → `Evaluation` (scorecards + expert feedback + audio) → `Profile` (skill tracking, Over-Trust Index, history)

Nav screens: `dashboard`, `case`, `eval`, `profile`, `settings`

---

## Tech Stack

**`apps/web`** — Next.js 15 App Router, TypeScript strict, Tailwind CSS
- Server components by default; `"use client"` only for interactivity
- Typed fetch client at `lib/api.ts` — never raw fetch in components

**`apps/api`** — FastAPI, SQLAlchemy, SQLite dev / Postgres prod
- All routes in `app/routes/`, business logic in `app/services/`
- Prompts are versioned `.md` files in `app/prompts/`, never hardcoded

**AI**
- Scoring: `claude-sonnet-4-6` via Anthropic SDK (`app/services/llm.py`)
- Cheap classification (difficulty, domain tagging): `claude-haiku-4-5-20251001`
- All LLM calls proxied through `apps/api` — never client-side

**Types** — `packages/types/*.schema.json` is source of truth; generate TS + Python from schemas

---

## Design Language

Mockup reference lives in `mockup/`. Port screens with the `ui-component` skill.

### Colors (CSS vars, defined in `styles.css`)
```
--bg:          #13131B   page background
--bg-2:        #0D0D15   inset/table backgrounds
--card:        #1B1B23   default card
--card-2:      #1F1F27   nested card
--card-3:      #292932   hover states, seg backgrounds
--border:      #464554
--border-dim:  #34343D
--text:        #E4E1ED
--text-dim:    #C7C4D7
--text-mute:   #8a879b
--indigo:      #C0C1FF   primary accent
--green:       #4EDEA3   positive/pass
--rose:        #FFB4AB   negative/fail/danger
--amber:       #FFB783   warning/partial
```

Soft variants: `rgba(192,193,255,0.10)` indigo-soft, `rgba(16,185,129,0.10)` green-soft, `rgba(147,0,10,0.20)` rose-soft, `rgba(217,119,33,0.18)` amber-soft.

### Typography
| Role | Font | Usage |
|---|---|---|
| `--display` | Hanken Grotesk 700/800 | Page `<h1>`, card `<h3>`, score values |
| `--body` | Geist 400/500 | Body prose, labels, nav |
| `--mono` | JetBrains Mono 400/500 | Data values, `.cap` labels, chips, buttons, table numerics |

`.cap` pattern: `font-family: var(--mono); font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; color: var(--text-dim)`

### Spacing & Shell
- Page padding: `32px`; content max-width: `1280px`
- Section gap: `24px`; intra-card gap: `16–20px`
- Sidenav: `72px` wide, sticky, icon-only with active left-border indicator
- Topbar: `64px` tall, sticky, z-index 5

### Component Patterns

**Card** — `border-radius: 12px`, `background: var(--card)`, `border: 1px solid var(--border)`
Structure: `.card-head` (16px 20px padding, bottom border) + `.card-body` (20px padding)

**AI card** — border `1px solid rgba(192,193,255,0.35)`, gradient top `rgba(192,193,255,0.04)`. Mistakes highlighted with `<mark>` styled rose-underline.

**Chip** — `height: 24px`, `border-radius: 6px`, JetBrains Mono 12px, variants: default / `.indigo` / `.green` / `.rose` / `.amber`. Large: `.lg` (28px).

**Button** — `height: 36px`, `border-radius: 8px`, JetBrains Mono 13px. Variants: `.primary` (indigo fill), `.success`, `.danger`, `.warn`, `.ghost`. Large: `.lg` (44px).

**Score card** — tone classes `pass` / `fail` / `partial` / `neutral` drive color (green/rose/amber/indigo). Decorative `.bg-blur` circle top-right.

**Segmented control** (`.seg`) — `border-radius: 8px`, 3px internal padding, active tab gets `var(--card)` bg + inset border.

**Action bar** (Case Review) — flex row of tonal buttons: Approve (success), Reject (danger), Escalate (warn), Ask Evidence, Flag Assumption.

**Skill bar** — 3-column grid: name 200px, bar flex-1 (indigo gradient fill), pct 56px right-aligned mono.

**Gauge** — SVG ring, `stroke-dashoffset` for fill, center value in Hanken Grotesk 800 40px. Thresholds: indigo < 50%, amber 50–70%, rose > 70%.

---

## Naming Conventions

- **Components**: PascalCase (`ScoreCard`, `AICard`, `ActionBar`)
- **Files in `app/`**: kebab-case (`case-review/page.tsx`, `evaluation/[id]/page.tsx`)
- **Python**: snake_case everywhere (`score_review`, `case_gen`)
- **JSON Schema**: source of truth in `packages/types/`; field names snake_case

---

## Don'ts

- No LLM calls client-side — always proxy through `apps/api`
- No inline styles in new components — Tailwind only; add tokens to `globals.css` if needed
- No `any` in TypeScript — use generated types from `packages/types/`
- No scoring logic outside `apps/api/app/services/scoring.py`
- No prompt strings hardcoded in Python — use versioned `.md` files in `app/prompts/`
