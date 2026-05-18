import pytest
import pytest_asyncio
from unittest.mock import patch, AsyncMock
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
from sqlalchemy.pool import StaticPool

from app.main import app
from app.db.session import Base, get_session
from app.models.case import Case
from app.models.review import Review
from app.models.score import Score


# ── Fixtures ──────────────────────────────────────────────────────────────────

@pytest_asyncio.fixture
async def db_engine():
    engine = create_async_engine(
        "sqlite+aiosqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield engine
    await engine.dispose()


@pytest_asyncio.fixture
async def client(db_engine):
    factory = async_sessionmaker(db_engine, expire_on_commit=False)

    async def override_get_session():
        async with factory() as s:
            yield s

    app.dependency_overrides[get_session] = override_get_session

    from app.core.security import get_current_user
    from app.models.user import User
    app.dependency_overrides[get_current_user] = lambda: User(id="test_user", email="test@test.com")

    with patch("app.main.seed_if_empty", new_callable=AsyncMock), \
         patch("app.main.engine", new=db_engine):
        async with AsyncClient(
            transport=ASGITransport(app=app), base_url="http://test"
        ) as ac:
            yield ac

    app.dependency_overrides.clear()


async def _insert_case(db_engine, **overrides) -> Case:
    defaults = dict(
        id="001_test",
        title="Marketing Variance",
        category="Variance Analysis",
        difficulty="easy",
        dataset=[{"account": "Revenue", "budget": 100, "actual": 90, "variance": -10}],
        ai_narrative="AI analysis here.",
        ai_recommendation="approve",
        hidden_truth={
            "correctDecision": ["flag_assumption"],
            "correctIssueSummary": "One-off treated as recurring.",
            "expertFeedback": "An expert would catch this.",
            "evidenceToRequest": ["GL export"],
            "aiFailureMode": "one_off_as_recurring",
        },
    )
    defaults.update(overrides)
    factory = async_sessionmaker(db_engine, expire_on_commit=False)
    async with factory() as s:
        case = Case(**defaults)
        s.add(case)
        await s.commit()
    return case


# ── Cases ─────────────────────────────────────────────────────────────────────

async def test_list_cases_empty(client):
    resp = await client.get("/cases")
    assert resp.status_code == 200
    assert resp.json() == []


async def test_list_cases_returns_cases(client, db_engine):
    await _insert_case(db_engine)
    resp = await client.get("/cases")
    assert resp.status_code == 200
    data = resp.json()
    assert len(data) == 1
    assert data[0]["id"] == "001_test"
    assert "hidden_truth" not in data[0]
    assert "ai_narrative" not in data[0]   # list view is slim


async def test_list_cases_filter_difficulty(client, db_engine):
    await _insert_case(db_engine, id="001_easy", difficulty="easy")
    await _insert_case(db_engine, id="002_hard", difficulty="hard")
    resp = await client.get("/cases?difficulty=hard")
    assert resp.status_code == 200
    ids = [c["id"] for c in resp.json()]
    assert ids == ["002_hard"]


async def test_get_case_not_found(client):
    resp = await client.get("/cases/999_missing")
    assert resp.status_code == 404


async def test_get_case_strips_hidden_truth(client, db_engine):
    await _insert_case(db_engine)
    resp = await client.get("/cases/001_test")
    assert resp.status_code == 200
    body = resp.json()
    assert "hidden_truth" not in body
    assert body["title"] == "Marketing Variance"
    assert body["dataset"][0]["account"] == "Revenue"


# ── Reviews ───────────────────────────────────────────────────────────────────

async def test_post_review_success(client, db_engine):
    await _insert_case(db_engine)

    with patch("app.routes.reviews.score_review", new_callable=AsyncMock) as mock_score:
        resp = await client.post("/reviews", json={
            "case_id": "001_test",
            "action": "flag_assumption",
            "reasoning": "The conference sponsorship is one-time, not recurring.",
            "time_spent_seconds": 300,
        })

    assert resp.status_code == 201
    body = resp.json()
    assert "review_id" in body
    mock_score.assert_awaited_once_with(body["review_id"])


async def test_post_review_invalid_action(client, db_engine):
    await _insert_case(db_engine)
    resp = await client.post("/reviews", json={
        "case_id": "001_test",
        "action": "not_a_valid_action",
        "reasoning": "Test.",
        "time_spent_seconds": 60,
    })
    assert resp.status_code == 422


async def test_post_review_unknown_case(client):
    resp = await client.post("/reviews", json={
        "case_id": "999_missing",
        "action": "approve",
        "reasoning": "Test.",
        "time_spent_seconds": 60,
    })
    assert resp.status_code == 404


# ── Scores ────────────────────────────────────────────────────────────────────

async def test_get_score_pending(client, db_engine):
    await _insert_case(db_engine)
    with patch("app.routes.reviews.score_review", new_callable=AsyncMock):
        post = await client.post("/reviews", json={
            "case_id": "001_test",
            "action": "flag_assumption",
            "reasoning": "Test.",
            "time_spent_seconds": 60,
        })
    review_id = post.json()["review_id"]

    resp = await client.get(f"/reviews/{review_id}/score")
    assert resp.status_code == 200
    assert resp.json() == {"status": "pending"}


async def test_get_score_ready(client, db_engine):
    factory = async_sessionmaker(db_engine, expire_on_commit=False)
    await _insert_case(db_engine)

    # Create review directly
    async with factory() as s:
        from app.models.user import User
        existing_user = await s.get(User, "test_user")
        if not existing_user:
            s.add(User(id="test_user", email="test@test.com", hashed_password="pw"))

        review = Review(
            case_id="001_test", user_id="test_user", action="approve",
            reasoning="Direct insert.", time_spent_seconds=120,
        )
        s.add(review)
        await s.commit()
        await s.refresh(review)
        review_id = review.id

    # Insert a score directly
    async with factory() as s:
        import uuid
        s.add(Score(
            id=str(uuid.uuid4()),
            review_id=review_id,
            criteria=[
                {"name": "caught_main_issue", "score": 9, "tone": "pass", "rationale": "Good."},
                {"name": "over_trusted_ai", "score": 8, "tone": "pass", "rationale": "Good."},
                {"name": "escalated_appropriately", "score": 10, "tone": "pass", "rationale": "Exact match."},
                {"name": "explanation_quality", "score": 7, "tone": "partial", "rationale": "OK."},
            ],
            total=85.0,
            feedback_summary="Good work.",
            expert_would_do="Expert paragraph.",
            over_trust_delta=0.5,
        ))
        await s.commit()

    resp = await client.get(f"/reviews/{review_id}/score")
    assert resp.status_code == 200
    body = resp.json()
    assert body["total"] == 85.0
    assert len(body["criteria"]) == 4
    assert "status" not in body
