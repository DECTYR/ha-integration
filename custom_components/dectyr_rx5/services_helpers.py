"""Validation and timeouts for MQTT command/response flow."""

from __future__ import annotations

from dataclasses import asdict
from typing import Any

from homeassistant.core import HomeAssistantError

from .const import DOMAIN, SET_MQTT_BROKER_COMMAND_TIMEOUT, ScannerCommandAction
from .models import CommandResponse


def parse_command_action(action: str) -> ScannerCommandAction:
    """Return enum member or raise HomeAssistantError."""
    try:
        return ScannerCommandAction(action)
    except ValueError as err:
        allowed = ", ".join(sorted(a.value for a in ScannerCommandAction))
        raise HomeAssistantError(
            translation_domain=DOMAIN,
            translation_key="invalid_action",
            translation_placeholders={"action": action, "allowed": allowed},
        ) from err


def command_timeout_seconds(
    action: ScannerCommandAction,
    override: float | None,
    *,
    default_timeout: int,
) -> float:
    """Effective asyncio timeout for a command (seconds)."""
    if override is not None:
        return float(override)
    if action is ScannerCommandAction.SET_MQTT_BROKER:
        return float(SET_MQTT_BROKER_COMMAND_TIMEOUT)
    return float(default_timeout)


def command_response_to_dict(resp: CommandResponse) -> dict[str, Any]:
    """Serialize CommandResponse for service return value."""
    out: dict[str, Any] = {
        "request_id": resp.request_id,
        "scanner_id": resp.scanner_id,
        "action": resp.action,
        "status": resp.status.value,
        "message": resp.message,
        "timestamp": resp.timestamp.isoformat(),
    }
    if resp.data is not None:
        raw = asdict(resp.data)
        out["data"] = {k: v for k, v in raw.items() if v is not None}
    return out
