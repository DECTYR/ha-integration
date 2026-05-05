"""Diagnostics download (redacted)."""

from __future__ import annotations

import math
import re
from dataclasses import asdict
from typing import Any

from homeassistant.components.diagnostics import async_redact_data
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers import device_registry as dr

from .const import DOMAIN
from .coordinator import DectyrCoordinator

TO_REDACT_CONFIG = ("mqtt_prefix",)

_IPV4_RE = re.compile(
    r"\b(?P<ip>(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})\b"
)


def _is_private_ipv4(octets: tuple[int, ...]) -> bool:
    if len(octets) != 4:
        return False
    a, b, *_ = octets
    if a == 10:
        return True
    if a == 127:
        return True
    if a == 192 and b == 168:
        return True
    if a == 172 and 16 <= b <= 31:
        return True
    if a == 169 and b == 254:
        return True
    return False


def redact_public_ips(text: str) -> str:
    """Replace public IPv4 addresses with a placeholder."""

    def repl(m: re.Match[str]) -> str:
        ip = m.group("ip")
        parts = tuple(int(x) for x in ip.split("."))
        if _is_private_ipv4(parts):
            return ip
        return "**REDACTED**"

    return _IPV4_RE.sub(repl, text)


def redact_mac(mac: str) -> str:
    """Keep OUI, mask NIC."""
    p = mac.upper().split(":")
    if len(p) != 6:
        return "**REDACTED**"
    return ":".join(p[:3] + ["**", "**", "**"])


def redact_coordinate(value: float | None) -> float | None:
    """Round to ~1 km precision."""
    if value is None or not math.isfinite(value):
        return None
    return round(value, 2)


def _redact_scanner_dict(data: dict[str, Any]) -> dict[str, Any]:
    """Return a shallow-redacted scanner snapshot."""
    out = dict(data)
    if isinstance(out.get("ip_address"), str):
        out["ip_address"] = redact_public_ips(out["ip_address"])
    if isinstance(out.get("mac_address"), str):
        out["mac_address"] = redact_mac(out["mac_address"])
    gnss = out.get("gnss")
    if isinstance(gnss, dict):
        g = dict(gnss)
        if "latitude" in g:
            g["latitude"] = redact_coordinate(
                float(g["latitude"]) if isinstance(g["latitude"], int | float) else None
            )
        if "longitude" in g:
            g["longitude"] = redact_coordinate(
                float(g["longitude"]) if isinstance(g["longitude"], int | float) else None
            )
        out["gnss"] = g
    lte = out.get("lte")
    if isinstance(lte, dict):
        lte_dict = dict(lte)
        for k in ("imei", "iccid", "ip_address"):
            if k in lte_dict and lte_dict[k]:
                lte_dict[k] = "**REDACTED**"
        out["lte"] = lte_dict
    return out


async def async_get_config_entry_diagnostics(
    hass: HomeAssistant, entry: ConfigEntry
) -> dict[str, Any]:
    """Diagnostics for one config entry."""
    bucket = hass.data.get(DOMAIN, {}).get(entry.entry_id)
    if not isinstance(bucket, dict):
        return {"error": "entry not loaded"}
    coordinator: DectyrCoordinator = bucket["coordinator"]
    scanners = []
    for s in coordinator.get_all_scanners():
        scanners.append(_redact_scanner_dict(asdict(s)))
    drones = coordinator.get_all_drones()
    sample = []
    for d in drones[:10]:
        sample.append(
            {
                "drone_id": d.drone_id,
                "available": d.available,
                "latitude": redact_coordinate(d.latitude),
                "longitude": redact_coordinate(d.longitude),
            }
        )
    return {
        "entry": async_redact_data(
            {"title": entry.title, "data": dict(entry.data), "options": dict(entry.options)},
            TO_REDACT_CONFIG,
        ),
        "scanner_count": len(scanners),
        "scanners": scanners,
        "drone_count": len(drones),
        "drones_sample": sample,
    }


async def async_get_device_diagnostics(
    hass: HomeAssistant, entry: ConfigEntry, device: dr.DeviceEntry
) -> dict[str, Any]:
    """Diagnostics for a scanner or drone device."""
    bucket = hass.data.get(DOMAIN, {}).get(entry.entry_id)
    if not isinstance(bucket, dict):
        return {"error": "entry not loaded"}
    coordinator: DectyrCoordinator = bucket["coordinator"]
    for domain, ident in device.identifiers:
        if domain != DOMAIN:
            continue
        if ident.startswith("drone:"):
            did = ident.removeprefix("drone:")
            drone = coordinator.get_drone(did)
            if not drone:
                return {"drone_id": did, "error": "unknown drone"}
            snap = asdict(drone)
            snap["latitude"] = redact_coordinate(drone.latitude)
            snap["longitude"] = redact_coordinate(drone.longitude)
            return {"type": "drone", "drone": snap}
        sid = ident
        scanner = coordinator.get_scanner(sid)
        if not scanner:
            return {"scanner_id": sid, "error": "unknown scanner"}
        return {"type": "scanner", "scanner": _redact_scanner_dict(asdict(scanner))}
    return {"error": "not a Dectyr device"}
