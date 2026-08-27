from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.auth import verify_api_key
from app.models.database import AlertSubscription, User, get_db
from app.models.schemas import AlertSubscribeRequest
from app.services import alert_service

router = APIRouter()


@router.post("/api/alert/subscribe")
async def alert_subscribe(body: AlertSubscribeRequest, api_key: str = Depends(verify_api_key),
                           db: AsyncSession = Depends(get_db)):
    user = (await db.execute(select(User).where(User.apiKey == body.user_api_key))).scalar_one_or_none()
    if user is None:
        user = User(apiKey=body.user_api_key)
        db.add(user)
        await db.flush()

    sub = AlertSubscription(
        userId=user.id, location=body.location,
        thresholdType=body.threshold_type, thresholdValue=body.threshold_value,
    )
    db.add(sub)
    await db.commit()
    return {"id": sub.id, "status": "subscribed"}


@router.post("/api/admin/test-alert")
async def test_alert(session_id: str, alert_type: str, api_key: str = Depends(verify_api_key)):
    await alert_service.publish_alert(
        session_id=session_id, alert_type=alert_type, location="test-location",
        message=f"Test {alert_type} alert", severity="advisory",
    )
    return {"status": "published"}
