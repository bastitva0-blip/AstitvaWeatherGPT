"""Web Push notification service.

Sends W3C Web Push (RFC 8030) notifications to subscribed users when GDACS
fires a new cyclone or flood event within their saved location radius.

Setup:
  1. Generate VAPID keys (one-time):
       python3 -c "from py_vapid import Vapid; v=Vapid(); v.generate_keys(); print(v.private_pem().decode()); print(v.public_key.public_bytes_raw().hex())"
  2. Set VAPID_PRIVATE_KEY and VAPID_PUBLIC_KEY in .env
  3. VAPID_CLAIMS_EMAIL = mailto:youremail@example.com

The cron job (run_push_alert_cron) is called every 15 minutes by APScheduler
from main.py lifespan. It:
  1. Fetches all active AlertSubscription rows
  2. Resolves each location to lat/lon
  3. Calls GDACS for nearby cyclone/flood events
  4. For new events (tracked in Redis to avoid duplicate pushes),
     fires a push to all PushSubscription endpoints
"""
from __future__ import annotations

import json
import logging
from datetime import datetime, timezone

from sqlalchemy import select

from app.core.cache import get_redis
from app.core.config import settings
from app.models.database import AlertSubscription, PushSubscription, get_session_factory
from app.services.disaster_service import get_nearby_disasters
from app.services.gis_service import resolve_location

logger = logging.getLogger(__name__)


def _send_web_push(subscription_info: dict, payload: dict) -> bool:
    """Send a single Web Push notification. Returns True on success."""
    try:
        from pywebpush import webpush, WebPushException
        webpush(
            subscription_info=subscription_info,
            data=json.dumps(payload),
            vapid_private_key=settings.VAPID_PRIVATE_KEY,
            vapid_claims={
                "sub": settings.VAPID_CLAIMS_EMAIL,
                "exp": int(datetime.now(timezone.utc).timestamp()) + 86400,
            },
        )
        return True
    except ImportError:
        logger.warning("pywebpush not installed — push notifications disabled")
        return False
    except Exception as e:
        logger.warning(f"Web push failed: {e}")
        return False


async def _get_all_push_subscriptions() -> list[dict]:
    """Fetch all registered push subscription endpoints from DB."""
    factory = get_session_factory()
    async with factory() as db:
        rows = (await db.execute(select(PushSubscription))).scalars().all()
        return [
            {
                "endpoint": r.endpoint,
                "keys": {"p256dh": r.p256dh, "auth": r.auth},
            }
            for r in rows
        ]


async def _get_active_subscriptions() -> list[AlertSubscription]:
    """Fetch all active location alert subscriptions."""
    factory = get_session_factory()
    async with factory() as db:
        rows = (await db.execute(
            select(AlertSubscription).where(AlertSubscription.active == True)  # noqa: E712
        )).scalars().all()
        return list(rows)


def _alert_cache_key(event_name: str, event_type: str, location: str) -> str:
    return f"push_sent:{event_type}:{event_name}:{location}"


async def run_push_alert_cron() -> None:
    """
    Main cron entry point — called every 15 minutes by APScheduler.

    Flow:
    1. Get all active AlertSubscriptions (user → location)
    2. For each unique location, resolve lat/lon + check GDACS
    3. For any new Orange/Red event not already pushed (Redis dedup key),
       send Web Push to ALL registered push endpoints
    4. Record sent event in Redis with 6h TTL to prevent duplicates
    """
    logger.info("[push_cron] Starting push alert check")
    redis  = get_redis()
    subs   = await _get_active_subscriptions()
    if not subs:
        logger.info("[push_cron] No active subscriptions — skipping")
        return

    push_endpoints = await _get_all_push_subscriptions()
    if not push_endpoints:
        logger.info("[push_cron] No push endpoints registered — skipping")
        return

    # Deduplicate locations to avoid redundant GDACS calls
    unique_locations: dict[str, tuple[float, float]] = {}
    for sub in subs:
        if sub.location not in unique_locations:
            loc = await resolve_location(sub.location)
            if loc:
                unique_locations[sub.location] = (loc.lat, loc.lon)

    pushed_count = 0
    for location_name, (lat, lon) in unique_locations.items():
        try:
            disasters = await get_nearby_disasters(lat, lon)
        except Exception as e:
            logger.warning(f"[push_cron] GDACS check failed for {location_name}: {e}")
            continue

        for alert in disasters.get("alerts", []):
            event_name  = alert.get("name", "Unknown")
            event_type  = alert.get("type", "??")
            alert_level = alert.get("alert_level", "Green")
            distance_km = alert.get("distance_km", 0)

            if alert_level not in ("Orange", "Red"):
                continue

            # Redis dedup — skip if we already pushed this event for this location
            cache_key = _alert_cache_key(event_name, event_type, location_name)
            already_sent = await redis.get(cache_key)
            if already_sent:
                continue

            # Build notification payload
            emoji   = "🌀" if event_type == "TC" else "🌊"
            title   = f"{emoji} {alert_level} Alert — {location_name}"
            body    = (
                f"{event_name} ({event_type}) is {int(distance_km)}km away. "
                f"Alert level: {alert_level}. Stay safe."
            )
            payload = {
                "title":   title,
                "body":    body,
                "icon":    "/icons/icon-192.png",
                "badge":   "/icons/icon-72.png",
                "tag":     cache_key,
                "data": {
                    "url":         "/app/alerts",
                    "event_type":  event_type,
                    "alert_level": alert_level,
                    "location":    location_name,
                    "distance_km": distance_km,
                },
            }

            # Push to every registered endpoint
            for endpoint_info in push_endpoints:
                success = _send_web_push(endpoint_info, payload)
                if success:
                    pushed_count += 1

            # Mark as sent — TTL 6 hours so we don't re-push the same event
            await redis.setex(cache_key, 21600, "1")
            logger.info(f"[push_cron] Pushed {event_name} alert for {location_name} to {len(push_endpoints)} endpoints")

    logger.info(f"[push_cron] Done — {pushed_count} push(es) sent")
