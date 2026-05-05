"""MQTT subscriptions using the core MQTT integration (no separate broker client)."""

from __future__ import annotations

import json
import logging
from typing import TYPE_CHECKING, Any, Awaitable, Callable

from homeassistant.components import mqtt

from .const import (
    topic_subscription_command_response,
    topic_subscription_drone_data,
    topic_subscription_errors,
    topic_subscription_status,
)

if TYPE_CHECKING:
    from homeassistant.core import HomeAssistant

    from .coordinator import DectyrCoordinator

_LOGGER = logging.getLogger(__name__)


def parse_scanner_segment_topic(topic: str, prefix: str, suffix: str) -> str | None:
    """Parse `{prefix}/{scanner_id}/{suffix}` with multi-segment prefix support."""
    prefix_parts = prefix.split("/")
    parts = topic.split("/")
    if len(parts) != len(prefix_parts) + 2:
        return None
    if parts[-1] != suffix:
        return None
    if parts[: len(prefix_parts)] != prefix_parts:
        return None
    return parts[len(prefix_parts)]


def parse_scanner_status_topic(topic: str, prefix: str) -> str | None:
    """Return scanner_id from a status topic."""
    return parse_scanner_segment_topic(topic, prefix, "status")


def parse_scanner_errors_topic(topic: str, prefix: str) -> str | None:
    """Return scanner_id from an errors topic."""
    return parse_scanner_segment_topic(topic, prefix, "errors")


def parse_drone_data_topic(topic: str, prefix: str) -> tuple[str, str] | None:
    """Return (scanner_id, drone_id) from a drone data topic."""
    prefix_parts = prefix.split("/")
    base_len = len(prefix_parts)
    parts = topic.split("/")
    if len(parts) != base_len + 4:
        return None
    if parts[base_len + 1] != "drones" or parts[base_len + 3] != "data":
        return None
    if parts[:base_len] != prefix_parts:
        return None
    return parts[base_len], parts[base_len + 2]


def parse_command_response_topic(topic: str, prefix: str) -> str | None:
    """Return scanner_id from a command response topic."""
    prefix_parts = prefix.split("/")
    parts = topic.split("/")
    if len(parts) != len(prefix_parts) + 3:
        return None
    if parts[-2] != "commands" or parts[-1] != "response":
        return None
    if parts[: len(prefix_parts)] != prefix_parts:
        return None
    return parts[len(prefix_parts)]


def decode_json_object(msg: mqtt.ReceiveMessage) -> dict[str, Any] | None:
    """Decode MQTT payload bytes/str into a dict."""
    raw = msg.payload
    if isinstance(raw, bytes):
        raw = raw.decode("utf-8")
    if raw in {"", "None"}:
        return None
    try:
        data = json.loads(raw)
    except json.JSONDecodeError:
        _LOGGER.warning("MQTT payload is not valid JSON")
        return None
    return data if isinstance(data, dict) else None


class MQTTSubscriber:
    """Subscribe to Dectyr MQTT topics and forward payloads to the coordinator."""

    def __init__(self, hass: HomeAssistant, coordinator: DectyrCoordinator, prefix: str) -> None:
        """Initialize subscriber."""
        self.hass = hass
        self.coordinator = coordinator
        self.prefix = prefix
        self._unsub: list[Callable[[], None]] = []

    async def async_setup(self) -> None:
        """Register MQTT subscriptions."""

        async def _status(msg: mqtt.ReceiveMessage) -> None:
            await self._async_dispatch(msg, self.coordinator.async_handle_scanner_status)

        async def _errors(msg: mqtt.ReceiveMessage) -> None:
            await self._async_dispatch(msg, self.coordinator.async_handle_scanner_error)

        async def _drone(msg: mqtt.ReceiveMessage) -> None:
            topic = msg.topic
            data = decode_json_object(msg)
            if data is None:
                _LOGGER.debug("Skipping non-JSON MQTT message on %s", topic)
                return
            retained = bool(getattr(msg, "retain", False))
            await self.coordinator.async_handle_drone_data(topic, data, mqtt_retained=retained)

        async def _cmd(msg: mqtt.ReceiveMessage) -> None:
            await self._async_dispatch(msg, self.coordinator.async_handle_command_response)

        self._unsub.append(
            await mqtt.async_subscribe(
                self.hass,
                topic_subscription_status(self.prefix),
                _status,
                qos=1,
            )
        )
        self._unsub.append(
            await mqtt.async_subscribe(
                self.hass,
                topic_subscription_errors(self.prefix),
                _errors,
                qos=1,
            )
        )
        self._unsub.append(
            await mqtt.async_subscribe(
                self.hass,
                topic_subscription_drone_data(self.prefix),
                _drone,
                qos=1,
            )
        )
        self._unsub.append(
            await mqtt.async_subscribe(
                self.hass,
                topic_subscription_command_response(self.prefix),
                _cmd,
                qos=1,
            )
        )

    async def _async_dispatch(
        self,
        msg: mqtt.ReceiveMessage,
        handler: Callable[[str, dict[str, Any]], Awaitable[None]],
    ) -> None:
        topic = msg.topic
        data = decode_json_object(msg)
        if data is None:
            _LOGGER.debug("Skipping non-JSON MQTT message on %s", topic)
            return
        await handler(topic, data)

    async def async_unload(self) -> None:
        """Unsubscribe from topics."""
        for unsub in self._unsub:
            unsub()
        self._unsub.clear()
