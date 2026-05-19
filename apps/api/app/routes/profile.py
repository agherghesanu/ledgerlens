from __future__ import annotations

import math
from datetime import datetime, UTC, timedelta
from typing import Any

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_session
from app.models.case import Case
from app.models.review import Review
from app.models.score import Score

router = APIRouter(prefix="/profile", tags=["profile"])

# ── Response schemas ──────────────────────────────────────────────────────────


class ProgressPoint(BaseModel):
    """One weekly data point for the accuracy chart."""
    week: str           # e.g. "Sep 1"
    accuracy: float     # mean Score.total * 10 for that week (0–100 scale)


class ProfileStats(BaseModel):
    cases_reviewed: int
    accuracy: float | None      # None → no scored reviews yet
    accuracy_delta: float | None  # vs. prior 30-day window; None if < 2 windows
    streak_days: int
    progress: list[ProgressPoint]  # last 9 weekly buckets


class RecentReview(BaseModel):
    review_id: str
    case_id: str
    case_title: str
    submitted_at: str           # ISO datetime
    score_total: float | None   # None if scoring still pending
    tone: str                   # "green" / "amber" / "rose" based on score_total


# ── Profile aggregate schemas ─────────────────────────────────────────────────


class SkillBar(BaseModel):
    """One bar in the skill breakdown."""
    name: str      # e.g. "Revenue Recognition"
    pct: float     # 0–100 (mean total*10 for this category)


class PatternItem(BaseModel):
    direction: str   # "strength" or "weakness"
    criterion: str   # human-readable criterion name
    user_mean: float  # user's last-10 mean for this criterion (0–10)
    global_mean: float
    z_score: float   # signed: positive = strength


class HistoryRow(BaseModel):
    review_id: str
    case_id: str
    date: str        # YYYY-MM-DD
    title: str
    score: float     # 0–100
    time_spent: str  # formatted e.g. "12m" or "1h 10m"
    tone: str        # "green" / "amber" / "rose"


class ProfileAggregate(BaseModel):
    """Full profile data — single GET /profile response."""
    # Stats strip
    cases_reviewed: int
    accuracy: float | None
    streak_days: int

    # Skill bars (per category)
    skills: list[SkillBar]

    # Over-trust index (0–100, lower = healthier)
    over_trust_index: float | None

    # Patterns (criteria flagged as strengths or weaknesses)
    patterns: list[PatternItem]

    # Recommended focus — weakest skill by category pct
    focus_category: str | None

    # Full history (all scored reviews, newest first)
    history: list[HistoryRow]

    # Peer percentile — % of other users the current user outperforms (0–100)
    peer_percentile: float | None


# ── Pure aggregator helpers (importable for testing) ──────────────────────────

CRITERION_LABELS: dict[str, str] = {
    "caught_main_issue":       "Catching the Main Issue",
    "over_trusted_ai":         "AI Skepticism",
    "escalated_appropriately": "Escalation Judgment",
    "explanation_quality":     "Explanation Quality",
}

# Criteria where lower score = problem (OTA is inverted for OTI, but raw score
# is still used for the pattern detector the same way as other criteria)
ALL_CRITERIA = list(CRITERION_LABELS.keys())


def compute_over_trust_index(ota_scores: list[float]) -> float | None:
    """
    OTI = mean(10 - OTA) across last 20 reviews, scaled to 0–100.
    ota_scores: list of OTA criterion scores (0–10 each), newest first.
    A low OTI (e.g. 20%) means the user is well-calibrated (rarely over-trusts).
    A high OTI (e.g. 80%) means the user frequently over-trusts the AI.
    """
    if not ota_scores:
        return None
    last20 = ota_scores[:20]
    raw_mean = sum(10.0 - s for s in last20) / len(last20)
    return round(raw_mean * 10.0, 1)  # scale 0–10 → 0–100


def compute_patterns(
    user_criterion_means: dict[str, float],  # criterion → mean score (0–10) last 10
    global_criterion_means: dict[str, float],  # criterion → global mean (0–10)
    global_criterion_stdevs: dict[str, float],  # criterion → global stdev (0–10)
    threshold: float = 1.5,
) -> list[PatternItem]:
    """
    A pattern is a criterion where |z| >= threshold (1.5σ from global mean).
    Positive z = strength, negative z = weakness.
    Only criteria with global stdev > 0 are considered.
    """
    patterns: list[PatternItem] = []
    for name in ALL_CRITERIA:
        user_mean = user_criterion_means.get(name)
        global_mean = global_criterion_means.get(name)
        stdev = global_criterion_stdevs.get(name)
        if user_mean is None or global_mean is None or not stdev or stdev < 0.01:
            continue
        z = (user_mean - global_mean) / stdev
        if abs(z) >= threshold:
            patterns.append(
                PatternItem(
                    direction="strength" if z > 0 else "weakness",
                    criterion=CRITERION_LABELS.get(name, name),
                    user_mean=round(user_mean, 2),
                    global_mean=round(global_mean, 2),
                    z_score=round(z, 2),
                )
            )
    # Sort: biggest strength first, then biggest weakness
    return sorted(patterns, key=lambda p: -abs(p.z_score))


def format_time_spent(seconds: int) -> str:
    """Format seconds as '12m' or '1h 10m'."""
    if seconds < 3600:
        return f"{seconds // 60}m"
    h = seconds // 3600
    m = (seconds % 3600) // 60
    return f"{h}h {m}m" if m else f"{h}h"


def _tone(score: float | None) -> str:
    if score is None:
        return "amber"
    if score >= 75:
        return "green"
    if score >= 55:
        return "amber"
    return "rose"


def _streak(submitted_dates: list[datetime]) -> int:
    """Count consecutive calendar-days ending today (or yesterday)."""
    if not submitted_dates:
        return 0
    today = datetime.now(UTC).date()
    dates = sorted({d.date() for d in submitted_dates}, reverse=True)
    if dates[0] < today - timedelta(days=1):
        return 0
    streak = 0
    expected = today if dates[0] == today else dates[0]
    for d in dates:
        if d == expected:
            streak += 1
            expected -= timedelta(days=1)
        else:
            break
    return streak


# ── Routes ────────────────────────────────────────────────────────────────────

from app.core.security import get_current_user
from app.models.user import User

@router.get("/stats", response_model=ProfileStats)
async def get_stats(
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    # Total reviewed
    cases_reviewed: int = await session.scalar(
        select(func.count()).select_from(Review).where(Review.user_id == current_user.id)
    ) or 0

    # All scored reviews (for accuracy + progress)
    rows = (
        await session.execute(
            select(Review.submitted_at, Score.total)
            .join(Score, Score.review_id == Review.id)
            .where(Review.user_id == current_user.id)
            .order_by(Review.submitted_at)
        )
    ).all()

    # All review submitted_at (for streak — includes unscored)
    all_dates_result = await session.execute(select(Review.submitted_at).where(Review.user_id == current_user.id))
    all_dates: list[datetime] = [r[0] for r in all_dates_result.all()]

    # Accuracy (overall mean, scaled to 0–100)
    scores = [r.total for r in rows]
    accuracy: float | None = (sum(scores) / len(scores)) if scores else None

    # Accuracy delta
    now = datetime.now(UTC).replace(tzinfo=None)
    cutoff_recent = now - timedelta(days=30)
    cutoff_prior = now - timedelta(days=60)
    recent_scores = [r.total for r in rows if r.submitted_at >= cutoff_recent]
    prior_scores = [r.total for r in rows if cutoff_prior <= r.submitted_at < cutoff_recent]
    if recent_scores and prior_scores:
        accuracy_delta: float | None = (
            sum(recent_scores) / len(recent_scores)
            - sum(prior_scores) / len(prior_scores)
        )
    else:
        accuracy_delta = None

    # Streak
    streak_days = _streak(all_dates)

    # Weekly progress
    def week_monday(dt: datetime) -> datetime:
        d = dt.date()
        return datetime.combine(d - timedelta(days=d.weekday()), datetime.min.time())

    week_buckets: dict[datetime, list[float]] = {}
    for r in rows:
        w = week_monday(r.submitted_at)
        week_buckets.setdefault(w, []).append(r.total)

    this_monday = week_monday(now)
    progress: list[ProgressPoint] = []
    for i in range(8, -1, -1):
        w = this_monday - timedelta(weeks=i)
        bucket = week_buckets.get(w)
        if bucket:
            acc = sum(bucket) / len(bucket)
        elif progress:
            acc = progress[-1].accuracy
        else:
            acc = 0.0
        progress.append(ProgressPoint(week=f"{w.strftime('%b')} {w.day}", accuracy=round(acc, 1)))

    return ProfileStats(
        cases_reviewed=cases_reviewed,
        accuracy=round(accuracy, 1) if accuracy is not None else None,
        accuracy_delta=round(accuracy_delta, 1) if accuracy_delta is not None else None,
        streak_days=streak_days,
        progress=progress,
    )


@router.get("/recent", response_model=list[RecentReview])
async def get_recent(
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """Last 3 reviews that have been scored, with case title and score total."""
    result = await session.execute(
        select(Review, Score, Case)
        .join(Score, Score.review_id == Review.id)
        .join(Case, Case.id == Review.case_id)
        .where(Review.user_id == current_user.id)
        .order_by(Review.submitted_at.desc())
        .limit(3)
    )
    rows = result.all()
    return [
        RecentReview(
            review_id=review.id,
            case_id=review.case_id,
            case_title=case.title,
            submitted_at=review.submitted_at.isoformat(),
            score_total=round(score.total, 1),
            tone=_tone(score.total),
        )
        for review, score, case in rows
    ]


@router.get("", response_model=ProfileAggregate)
async def get_profile(
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """
    Full profile aggregate for the profile page.
    Includes: stats strip, skill bars, over-trust index,
    strength/weakness patterns, recommended focus, history table.
    """
    # ── 1. Basic stats ───────────────────────────────────────────────────────
    cases_reviewed: int = await session.scalar(
        select(func.count()).select_from(Review).where(Review.user_id == current_user.id)
    ) or 0

    all_dates_result = await session.execute(select(Review.submitted_at).where(Review.user_id == current_user.id))
    all_dates = [r[0] for r in all_dates_result.all()]
    streak_days = _streak(all_dates)

    # ── 2. All scored reviews joined to cases ─────────────────────────────────
    result = await session.execute(
        select(Review, Score, Case)
        .join(Score, Score.review_id == Review.id)
        .join(Case, Case.id == Review.case_id)
        .where(Review.user_id == current_user.id)
        .order_by(Review.submitted_at.desc())
    )
    all_rows = result.all()  # list of (Review, Score, Case), newest first

    # Overall accuracy
    all_totals = [s.total for _, s, _ in all_rows]
    accuracy: float | None = round(sum(all_totals) / len(all_totals), 1) if all_totals else None

    # ── 3. Skill bars — mean accuracy per case category ───────────────────────
    category_buckets: dict[str, list[float]] = {}
    for _, score, case in all_rows:
        category_buckets.setdefault(case.category, []).append(score.total)

    skills: list[SkillBar] = sorted(
        [
            SkillBar(name=cat, pct=round(sum(vs) / len(vs), 1))
            for cat, vs in category_buckets.items()
        ],
        key=lambda s: -s.pct,
    )

    # ── 4. Over-trust index ───────────────────────────────────────────────────
    # Pull OTA scores newest-first from last 20 scored reviews
    ota_scores: list[float] = []
    for _, score, _ in all_rows[:20]:
        criteria: list[dict[str, Any]] = score.criteria  # JSON list
        for c in criteria:
            if c["name"] == "over_trusted_ai":
                ota_scores.append(float(c["score"]))
                break
    over_trust_index = compute_over_trust_index(ota_scores)

    # ── 5. Strength / weakness patterns + peer percentile ────────────────────
    # User's last-10 criterion means
    user_criterion_scores: dict[str, list[float]] = {k: [] for k in ALL_CRITERIA}
    for _, score, _ in all_rows[:10]:
        for c in score.criteria:
            name = c["name"]
            if name in user_criterion_scores:
                user_criterion_scores[name].append(float(c["score"]))

    user_criterion_means: dict[str, float] = {
        k: sum(vs) / len(vs)
        for k, vs in user_criterion_scores.items()
        if vs
    }

    # Global query — all users' scores (no user_id filter)
    global_result = await session.execute(
        select(Review.user_id, Score.total, Score.criteria)
        .join(Score, Score.review_id == Review.id)
    )
    global_rows = global_result.all()

    # Global criterion means/stdevs across all users
    global_criterion_scores: dict[str, list[float]] = {k: [] for k in ALL_CRITERIA}
    for _, _, criteria in global_rows:
        for c in criteria:
            name = c["name"]
            if name in global_criterion_scores:
                global_criterion_scores[name].append(float(c["score"]))

    global_criterion_means: dict[str, float] = {}
    global_criterion_stdevs: dict[str, float] = {}
    for name, vs in global_criterion_scores.items():
        if not vs:
            continue
        mean = sum(vs) / len(vs)
        global_criterion_means[name] = mean
        variance = sum((v - mean) ** 2 for v in vs) / len(vs)
        global_criterion_stdevs[name] = math.sqrt(variance)

    patterns = compute_patterns(
        user_criterion_means,
        global_criterion_means,
        global_criterion_stdevs,
    )

    # Peer percentile — rank current user against all other users by mean accuracy
    peer_percentile: float | None = None
    if accuracy is not None:
        other_user_totals: dict[str, list[float]] = {}
        for uid, total, _ in global_rows:
            if uid != current_user.id:
                other_user_totals.setdefault(uid, []).append(total)
        if other_user_totals:
            other_means = [sum(vs) / len(vs) for vs in other_user_totals.values()]
            count_below = sum(1 for m in other_means if m < accuracy)
            peer_percentile = round(count_below / len(other_means) * 100, 1)

    # ── 6. Recommended focus — weakest skill category ─────────────────────────
    focus_category: str | None = None
    if skills:
        focus_category = min(skills, key=lambda s: s.pct).name

    # ── 7. Full history table ─────────────────────────────────────────────────
    history: list[HistoryRow] = [
        HistoryRow(
            review_id=review.id,
            case_id=review.case_id,
            date=review.submitted_at.strftime("%Y-%m-%d"),
            title=case.title,
            score=round(score.total, 1),
            time_spent=format_time_spent(review.time_spent_seconds),
            tone=_tone(score.total),
        )
        for review, score, case in all_rows
    ]

    return ProfileAggregate(
        cases_reviewed=cases_reviewed,
        accuracy=accuracy,
        streak_days=streak_days,
        skills=skills,
        over_trust_index=over_trust_index,
        patterns=patterns,
        focus_category=focus_category,
        history=history,
        peer_percentile=peer_percentile,
    )
