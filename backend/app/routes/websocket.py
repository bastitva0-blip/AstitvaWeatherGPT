from __future__ import annotations

import json

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from app.core.cache import get_redis
from app.services.alert_service import alert_channel

router = APIRouter()


@router.websocket("/ws/alerts/{session_id}")
async def websocket_alerts(websocket: WebSocket, session_id: str):
    await websocket.accept()
    redis = get_redis()
    pubsub = redis.pubsub()
    await pubsub.subscribe(alert_channel(session_id))
    try:
        async for message in pubsub.listen():
            if message["type"] != "message":
                continue
            data = message["data"]
            payload = data.decode() if isinstance(data, bytes) else data
            await websocket.send_text(payload)
    except WebSocketDisconnect:
        pass
    finally:
        await pubsub.unsubscribe(alert_channel(session_id))
        await pubsub.close()
