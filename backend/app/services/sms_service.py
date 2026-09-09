"""Twilio SMS + WhatsApp inbound/outbound gateway.

Twilio is in requirements.txt (commented). Uncomment twilio==9.1.0 and set
TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER env vars to activate.

For testing: use the free Twilio Sandbox — no approval needed.
  SMS:       +1 415 599 2671  (Twilio trial number)
  WhatsApp:  whatsapp:+14155238886  (shared sandbox)

Both channels feed into the same NLP pipeline — same 8 steps, same LLM,
same citations. detail_level is forced to "short" to fit SMS character limits.
"""
from __future__ import annotations
import logging
from app.core.config import settings

logger = logging.getLogger(__name__)

def _get_client():
    try:
        from twilio.rest import Client
        return Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
    except ImportError:
        logger.warning("twilio package not installed — SMS/WhatsApp disabled")
        return None
    except Exception as e:
        logger.warning(f"Twilio client init failed: {e}")
        return None


def send_sms(to: str, body: str) -> bool:
    """Send SMS. `to` is E.164 format, e.g. '+919876543210'."""
    client = _get_client()
    if not client or not settings.TWILIO_PHONE_NUMBER:
        return False
    try:
        msg = client.messages.create(
            to=to,
            from_=settings.TWILIO_PHONE_NUMBER,
            body=body[:1600],          # Twilio max, ~10 SMS segments
        )
        logger.info(f"SMS sent to {to}: sid={msg.sid}")
        return True
    except Exception as e:
        logger.error(f"SMS send failed: {e}")
        return False


def send_whatsapp(to: str, body: str) -> bool:
    """Send WhatsApp. `to` is E.164; function adds whatsapp: prefix."""
    client = _get_client()
    if not client or not settings.TWILIO_WHATSAPP_NUMBER:
        return False
    try:
        wa_to   = f"whatsapp:{to}" if not to.startswith("whatsapp:") else to
        wa_from = settings.TWILIO_WHATSAPP_NUMBER
        msg = client.messages.create(to=wa_to, from_=wa_from, body=body[:1600])
        logger.info(f"WhatsApp sent to {to}: sid={msg.sid}")
        return True
    except Exception as e:
        logger.error(f"WhatsApp send failed: {e}")
        return False


def trim_for_sms(answer: str, citations: list, max_chars: int = 300) -> str:
    """Trim a full LLM answer to SMS-friendly length and append top citation."""
    trimmed = answer[:max_chars].rsplit(" ", 1)[0]   # clean word boundary
    if len(answer) > max_chars:
        trimmed += "…"
    if citations:
        src = citations[0].get("source", "")
        if src:
            trimmed += f"\nSrc: {src}"
    return trimmed
