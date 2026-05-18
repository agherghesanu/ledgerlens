import os
import stripe
from fastapi import APIRouter, Request, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.db.session import get_session
from app.models.user import User
from app.core.security import get_current_user

router = APIRouter(prefix="/stripe", tags=["stripe"])

stripe.api_key = os.getenv("STRIPE_SECRET_KEY", "sk_test_mock")
webhook_secret = os.getenv("STRIPE_WEBHOOK_SECRET", "whsec_mock")

APP_URL = os.getenv("APP_URL", "http://localhost:3000")

PLAN_PRICES = {
    "pro":   os.getenv("STRIPE_PRO_PRICE_ID",   "price_pro_mock"),
    "teams": os.getenv("STRIPE_TEAMS_PRICE_ID", "price_teams_mock"),
}

PLAN_AMOUNTS = {
    "pro":   1500,   # $15/mo
    "teams": 19900,  # $199/mo
}

class CheckoutRequest(BaseModel):
    tier: str = "pro"  # "pro" | "teams"

@router.post("/create-checkout-session")
async def create_checkout_session(
    body: CheckoutRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_session),
):
    tier = body.tier if body.tier in PLAN_PRICES else "pro"

    # Dev mode: no real Stripe key configured — simulate upgrade locally
    if stripe.api_key == "sk_test_mock":
        stmt = select(User).where(User.id == current_user.id)
        result = await db.execute(stmt)
        user = result.scalar_one_or_none()
        if user:
            user.subscription_status = tier
            db.add(user)
            await db.commit()
        return {"checkout_url": f"{APP_URL}/settings?success=true&tier={tier}"}

    price_id = PLAN_PRICES[tier]
    amount = PLAN_AMOUNTS[tier]

    try:
        line_item = (
            {"price": price_id, "quantity": 1}
            if not price_id.endswith("_mock")
            else {
                "price_data": {
                    "currency": "usd",
                    "product_data": {"name": f"LedgerLens {tier.capitalize()}"},
                    "unit_amount": amount,
                    "recurring": {"interval": "month"},
                },
                "quantity": 1,
            }
        )
        session = stripe.checkout.Session.create(
            payment_method_types=["card"],
            line_items=[line_item],
            mode="subscription",
            success_url=f"{APP_URL}/settings?success=true&tier={tier}",
            cancel_url=f"{APP_URL}/settings?canceled=true",
            client_reference_id=current_user.id,
            customer_email=current_user.email,
            metadata={"tier": tier},
        )
        return {"checkout_url": session.url}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/webhook")
async def stripe_webhook(request: Request, db: AsyncSession = Depends(get_session)):
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")

    try:
        event = stripe.Webhook.construct_event(payload, sig_header, webhook_secret)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid payload")
    except stripe.error.SignatureVerificationError:
        raise HTTPException(status_code=400, detail="Invalid signature")

    if event["type"] == "checkout.session.completed":
        session = event["data"]["object"]
        user_id = session.get("client_reference_id")
        customer_id = session.get("customer")
        tier = session.get("metadata", {}).get("tier", "pro")

        if user_id:
            stmt = select(User).where(User.id == user_id)
            result = await db.execute(stmt)
            user = result.scalar_one_or_none()
            if user:
                user.subscription_status = tier  # 'pro' or 'teams'
                user.stripe_customer_id = customer_id
                db.add(user)
                await db.commit()

    elif event["type"] == "customer.subscription.deleted":
        subscription = event["data"]["object"]
        customer_id = subscription.get("customer")
        if customer_id:
            stmt = select(User).where(User.stripe_customer_id == customer_id)
            result = await db.execute(stmt)
            user = result.scalar_one_or_none()
            if user:
                user.subscription_status = "free"
                db.add(user)
                await db.commit()

    return {"status": "success"}
