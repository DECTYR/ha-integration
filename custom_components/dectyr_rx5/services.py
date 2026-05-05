"""Integration services (send_command, clear_drone, export_drones)."""

from __future__ import annotations

import logging
from typing import Any

import voluptuous as vol
from homeassistant.core import HomeAssistant, ServiceCall, SupportsResponse
from homeassistant.exceptions import HomeAssistantError
from homeassistant.helpers import config_validation as cv
from homeassistant.helpers import device_registry as dr

from .const import DOMAIN
from .coordinator import DectyrCoordinator

_LOGGER = logging.getLogger(__name__)

_SVC_META_KEY = "_dectyr_rx5_service_meta"

SEND_COMMAND_SCHEMA = vol.Schema(
    {
        vol.Required("device_id"): cv.string,
        vol.Required("action"): cv.string,
        vol.Optional("params", default={}): dict,
        vol.Optional("timeout"): vol.Coerce(float),
    }
)

CLEAR_DRONE_SCHEMA = vol.Schema(
    {
        vol.Required("device_id"): cv.string,
    }
)

EXPORT_DRONES_SCHEMA = vol.Schema(
    {
        vol.Optional("include_inactive", default=False): cv.boolean,
    }
)


def _iter_coordinators(hass: HomeAssistant) -> list[DectyrCoordinator]:
    root = hass.data.get(DOMAIN)
    if not isinstance(root, dict):
        return []
    out: list[DectyrCoordinator] = []
    for _eid, bucket in root.items():
        if not isinstance(bucket, dict):
            continue
        coord = bucket.get("coordinator")
        if isinstance(coord, DectyrCoordinator):
            out.append(coord)
    return out


def _scanner_id_from_device(hass: HomeAssistant, device_id: str) -> str | None:
    reg = dr.async_get(hass)
    dev = reg.async_get(device_id)
    if dev is None:
        return None
    for domain, ident in dev.identifiers:
        if domain != DOMAIN:
            continue
        if ident.startswith("drone:"):
            continue
        return ident
    return None


def _drone_id_from_device(hass: HomeAssistant, device_id: str) -> str | None:
    reg = dr.async_get(hass)
    dev = reg.async_get(device_id)
    if dev is None:
        return None
    for domain, ident in dev.identifiers:
        if domain == DOMAIN and ident.startswith("drone:"):
            return ident.removeprefix("drone:")
    return None


def _coordinator_for_scanner(hass: HomeAssistant, scanner_id: str) -> DectyrCoordinator | None:
    for coord in _iter_coordinators(hass):
        if scanner_id in coord.scanners():
            return coord
    return None


def _coordinator_for_drone(hass: HomeAssistant, drone_id: str) -> DectyrCoordinator | None:
    for coord in _iter_coordinators(hass):
        if drone_id in coord.drones():
            return coord
    return None


async def async_setup_services(hass: HomeAssistant) -> None:
    """Register domain services."""

    async def handle_send_command(call: ServiceCall) -> dict[str, Any]:
        data = SEND_COMMAND_SCHEMA(dict(call.data))
        scanner_id = _scanner_id_from_device(hass, data["device_id"])
        if scanner_id is None:
            raise HomeAssistantError(
                translation_domain=DOMAIN,
                translation_key="scanner_not_found",
            )
        coord = _coordinator_for_scanner(hass, scanner_id)
        if coord is None:
            raise HomeAssistantError(
                translation_domain=DOMAIN,
                translation_key="no_coordinator_scanner",
            )
        return await coord.async_send_command(
            scanner_id,
            data["action"],
            data["params"],
            timeout=data.get("timeout"),
        )

    async def handle_clear_drone(call: ServiceCall) -> None:
        data = CLEAR_DRONE_SCHEMA(dict(call.data))
        drone_id = _drone_id_from_device(hass, data["device_id"])
        if drone_id is None:
            raise HomeAssistantError(
                translation_domain=DOMAIN,
                translation_key="drone_not_found",
            )
        coord = _coordinator_for_drone(hass, drone_id)
        if coord is None:
            raise HomeAssistantError(
                translation_domain=DOMAIN,
                translation_key="no_coordinator_drone",
            )
        await coord.async_purge_drone(drone_id)

    async def handle_export_drones(call: ServiceCall) -> dict[str, Any]:
        data = EXPORT_DRONES_SCHEMA(dict(call.data))
        drones_out: list[dict[str, Any]] = []
        for coord in _iter_coordinators(hass):
            for did, drone in coord.drones().items():
                if not data["include_inactive"] and not drone.available:
                    continue
                drones_out.append(
                    {
                        "drone_id": did,
                        "available": drone.available,
                        "model": drone.model,
                        "manufacturer": drone.manufacturer,
                    }
                )
        return {"drones": drones_out}

    hass.services.async_register(
        DOMAIN,
        "send_command",
        handle_send_command,
        schema=SEND_COMMAND_SCHEMA,
        supports_response=SupportsResponse.ONLY,
    )
    hass.services.async_register(
        DOMAIN,
        "clear_drone",
        handle_clear_drone,
        schema=CLEAR_DRONE_SCHEMA,
    )
    hass.services.async_register(
        DOMAIN,
        "export_drones",
        handle_export_drones,
        schema=EXPORT_DRONES_SCHEMA,
        supports_response=SupportsResponse.ONLY,
    )


async def async_unload_services(hass: HomeAssistant) -> None:
    """Unregister domain services."""
    for name in ("send_command", "clear_drone", "export_drones"):
        hass.services.async_remove(DOMAIN, name)


async def async_ensure_services(hass: HomeAssistant) -> None:
    """Register services when the first config entry is loaded."""
    meta = hass.data.setdefault(_SVC_META_KEY, {"refs": 0})
    meta["refs"] = meta.get("refs", 0) + 1
    if meta["refs"] == 1:
        await async_setup_services(hass)


async def async_release_services(hass: HomeAssistant) -> None:
    """Unregister services after the last config entry is unloaded."""
    meta = hass.data.get(_SVC_META_KEY)
    if not isinstance(meta, dict):
        return
    meta["refs"] = meta.get("refs", 1) - 1
    if meta["refs"] <= 0:
        await async_unload_services(hass)
        hass.data.pop(_SVC_META_KEY, None)
