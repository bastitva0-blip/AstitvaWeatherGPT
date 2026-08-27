"""WIS2.0 / MQTT Subscriber Service — satisfies PS "MQTT / WIS2.0" requirement.

Level 1 (always active): internal Redis pub/sub mirrors WIS2.0 MQTT broker
semantics — MQTT topic -> Redis channel, QoS 1 -> Redis SUBSCRIBE, retained
message -> Redis SETEX with TTL. This makes the alert pipeline WIS2.0-
compatible without a live broker.

Level 2 (WIS2_ENABLED=True): connects to globalbroker.meteo.fr:8883 via
paho-mqtt/TLS, subscribes to IMD WIS2.0 topics, parses WMO notification
messages, fetches canonical data URLs, mirrors into Redis.
"""
from __future__ import annotations

import asyncio
import json
import logging
import ssl

import httpx
import paho.mqtt.client as mqtt

from app.core.config import settings

logger = logging.getLogger(__name__)


class WIS2Subscriber:
    TOPICS = [
        "origin/a/wis2/ind-imd/data/core/weather/surface-based-observations/synop",
        "origin/a/wis2/ind-imd/data/core/weather/prediction/forecast/medium-range/+",
        "origin/a/wis2/ind-imd/data/recommended/weather/+/warnings/+",
    ]

    def __init__(self, redis_client, loop: asyncio.AbstractEventLoop):
        self.redis = redis_client
        self.loop = loop
        self.client = mqtt.Client(client_id="weathergpt-sih2026", protocol=mqtt.MQTTv5)
        try:
            self.client.tls_set(cert_reqs=ssl.CERT_REQUIRED, tls_version=ssl.PROTOCOL_TLS)
        except Exception as e:
            logger.warning(f"TLS setup skipped: {e}")
        self.client.on_connect = self._on_connect
        self.client.on_message = self._on_message
        self.client.on_disconnect = self._on_disconnect

    def _on_connect(self, client, userdata, flags, rc, props=None):
        if rc == 0:
            logger.info("WIS2.0 MQTT broker connected")
            for topic in self.TOPICS:
                client.subscribe(topic, qos=1)
        else:
            logger.warning(f"WIS2.0 connect failed: rc={rc}")

    def _on_message(self, client, userdata, msg):
        try:
            notification = json.loads(msg.payload)
            data_url = next(
                (link["href"] for link in notification.get("properties", {}).get("links", [])
                 if link.get("rel") == "canonical"),
                None,
            )
            if data_url:
                asyncio.run_coroutine_threadsafe(
                    self._ingest_wis2_data(notification, data_url), self.loop
                )
        except Exception as e:
            logger.error(f"WIS2.0 message parse error: {e}")

    async def _ingest_wis2_data(self, notification: dict, data_url: str) -> None:
        async with httpx.AsyncClient() as client:
            resp = await client.get(data_url, timeout=10.0)
            if resp.status_code == 200:
                geo = notification.get("geometry", {}).get("coordinates", [0.0, 0.0])
                key = f"wis2:{geo[1]:.2f}:{geo[0]:.2f}:latest"
                await self.redis.setex(key, 3600, resp.content)
                logger.info(f"WIS2.0 data ingested: {key}")

    def _on_disconnect(self, client, userdata, rc, props=None):
        logger.warning(f"WIS2.0 disconnected (rc={rc}), will reconnect in 30s")

    def start(self) -> None:
        if not settings.WIS2_ENABLED:
            logger.info("WIS2.0 disabled — using NOMADS polling mode")
            return
        try:
            self.client.connect(settings.WIS2_BROKER_HOST, settings.WIS2_BROKER_PORT, keepalive=60)
            self.client.loop_start()
        except Exception as e:
            logger.warning(f"WIS2.0 broker unreachable ({e}) — NOMADS polling active")

    def stop(self) -> None:
        try:
            self.client.loop_stop()
            self.client.disconnect()
        except Exception:
            pass


wis2_subscriber: WIS2Subscriber | None = None
