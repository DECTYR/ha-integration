"""Base entity classes for Dectyr RX-5."""

from __future__ import annotations

from typing import TYPE_CHECKING, Any

from homeassistant.core import HomeAssistant
from homeassistant.helpers.device_registry import CONNECTION_NETWORK_MAC, DeviceInfo
from homeassistant.helpers.dispatcher import async_dispatcher_connect
from homeassistant.helpers.entity import Entity, EntityDescription

from .const import (
    DOMAIN,
    MANUFACTURER,
    MODEL,
    UaType,
    drone_entity_removed_signal,
    drone_update_signal,
    scanner_update_signal,
)

if TYPE_CHECKING:
    from .coordinator import DectyrCoordinator

_UA_TYPE_LABEL_FR: dict[str, str] = {
    "ODID_UATYPE_NONE": "Non déclaré",
    "ODID_UATYPE_AEROPLANE": "Avion",
    "ODID_UATYPE_HELICOPTER_OR_MULTIROTOR": "Hélicoptère / Multirotor",
    "ODID_UATYPE_GYROPLANE": "Autogyre",
    "ODID_UATYPE_HYBRID_LIFT": "Aéronef à portance hybride",
    "ODID_UATYPE_ORNITHOPTER": "Ornithoptère",
    "ODID_UATYPE_GLIDER": "Planeur",
    "ODID_UATYPE_KITE": "Cerf-volant",
    "ODID_UATYPE_FREE_BALLOON": "Ballon libre",
    "ODID_UATYPE_CAPTIVE_BALLOON": "Ballon captif",
    "ODID_UATYPE_AIRSHIP": "Dirigeable",
    "ODID_UATYPE_FREE_FALL_PARACHUTE": "Parachute en chute libre",
    "ODID_UATYPE_ROCKET": "Fusée",
    "ODID_UATYPE_TETHERED_POWERED_AIRCRAFT": "Aéronef motorisé captif",
    "ODID_UATYPE_GROUND_OBSTACLE": "Obstacle au sol",
    "ODID_UATYPE_OTHER": "Autre",
}

_UA_TYPE_LABEL_EN: dict[str, str] = {
    "ODID_UATYPE_NONE": "Undeclared",
    "ODID_UATYPE_AEROPLANE": "Aeroplane",
    "ODID_UATYPE_HELICOPTER_OR_MULTIROTOR": "Helicopter / Multirotor",
    "ODID_UATYPE_GYROPLANE": "Gyroplane",
    "ODID_UATYPE_HYBRID_LIFT": "Hybrid lift",
    "ODID_UATYPE_ORNITHOPTER": "Ornithopter",
    "ODID_UATYPE_GLIDER": "Glider",
    "ODID_UATYPE_KITE": "Kite",
    "ODID_UATYPE_FREE_BALLOON": "Free balloon",
    "ODID_UATYPE_CAPTIVE_BALLOON": "Captive balloon",
    "ODID_UATYPE_AIRSHIP": "Airship",
    "ODID_UATYPE_FREE_FALL_PARACHUTE": "Free-fall parachute",
    "ODID_UATYPE_ROCKET": "Rocket",
    "ODID_UATYPE_TETHERED_POWERED_AIRCRAFT": "Tethered powered aircraft",
    "ODID_UATYPE_GROUND_OBSTACLE": "Ground obstacle",
    "ODID_UATYPE_OTHER": "Other",
}


def friendly_ua_type_label(hass: HomeAssistant | None, ua: UaType | None) -> str | None:
    """Human-readable aircraft category from ASTM F3411 ua_type (FR if HA UI is French)."""
    if ua is None:
        return None
    lang = "en"
    if hass is not None:
        raw = getattr(hass.config, "language", None) or ""
        lang = (raw.split("-", maxsplit=1)[0] or "en").lower()
    table = _UA_TYPE_LABEL_FR if lang == "fr" else _UA_TYPE_LABEL_EN
    raw_val = ua.value
    if raw_val in table:
        return table[raw_val]
    if raw_val.startswith("ODID_UATYPE_"):
        return raw_val.removeprefix("ODID_UATYPE_").replace("_", " ").title()
    return raw_val


def drone_registry_model(hass: HomeAssistant | None, drone: Any | None, drone_id: str) -> str:
    """Device registry `model`: aircraft type first, then product name when known.

    Format is ``{type} · {modèle}`` when both ua_type and product model exist.
    Basic ID stays in ``serial_number`` only.
    """
    if not drone:
        return f"Drone {drone_id[-10:]}"
    ua_label = friendly_ua_type_label(hass, drone.ua_type)
    product = (drone.model or "").strip()
    if ua_label and product:
        return f"{ua_label} · {product}"
    if ua_label:
        return ua_label
    if product:
        return product
    return "Unknown"


def drone_registry_serial(drone: Any | None, drone_id: str) -> str:
    """Serial / Basic ID shown in device info (payload ID when broadcast differs from topic id)."""
    if drone and drone.payload_drone_id:
        return drone.payload_drone_id
    return drone_id


def drone_device_name(drone: Any) -> str:
    """Human-readable drone device name (title in device registry)."""
    brand = drone_manufacturer(drone)
    model = (drone.model or "").strip()
    if model:
        if brand != "Unknown" and not model.lower().startswith(f"{brand.lower()} "):
            return f"{brand} {model}".strip()
        return model
    if brand != "Unknown":
        sid = drone_registry_serial(drone, drone.drone_id)
        return f"{brand} {sid}".strip()
    return f"Drone {drone.drone_id[-10:]}"


def drone_manufacturer(drone: Any) -> str:
    """Manufacturer string for drone device."""
    if drone.manufacturer:
        return drone.manufacturer
    if drone.identification and drone.identification.manufacturer_name:
        return drone.identification.manufacturer_name
    return "Unknown"


class DectyrScannerEntity(Entity):
    """Shared scanner entity behaviour."""

    _attr_has_entity_name = True
    _attr_should_poll = False
    entity_description: EntityDescription

    def __init__(
        self,
        coordinator: DectyrCoordinator,
        scanner_id: str,
        description: EntityDescription,
    ) -> None:
        """Initialize scanner entity."""
        super().__init__()
        self.coordinator = coordinator
        self._scanner_id = scanner_id
        self.entity_description = description

    @property
    def unique_id(self) -> str:
        """Stable unique id."""
        return f"{self._scanner_id}_{self.entity_description.key}"

    @property
    def device_info(self) -> DeviceInfo:
        """Device registry metadata."""
        scanner = self.coordinator.get_scanner(self._scanner_id)
        connections: set[tuple[str, str]] = set()
        if scanner and scanner.mac_address:
            connections.add((CONNECTION_NETWORK_MAC, scanner.mac_address))
        config_url: str | None = None
        if scanner and scanner.ip_address:
            config_url = f"http://{scanner.ip_address}"
        sw_version: str | None = None
        if scanner and scanner.firmware and scanner.firmware.version:
            sw_version = scanner.firmware.version
        return DeviceInfo(
            identifiers={(DOMAIN, self._scanner_id)},
            name=f"Dectyr RX-5 ({self._scanner_id[-8:]})",
            manufacturer=MANUFACTURER,
            model=MODEL,
            sw_version=sw_version,
            configuration_url=config_url,
            connections=connections,
        )

    async def async_added_to_hass(self) -> None:
        """Subscribe to targeted dispatcher updates."""
        await super().async_added_to_hass()
        self.async_on_remove(
            async_dispatcher_connect(
                self.hass,
                scanner_update_signal(self._scanner_id),
                self.async_write_ha_state,
            )
        )


class DectyrDroneEntity(Entity):
    """Shared drone entity behaviour."""

    _attr_has_entity_name = True
    _attr_should_poll = False
    entity_description: EntityDescription

    def __init__(
        self,
        coordinator: DectyrCoordinator,
        drone_id: str,
        description: EntityDescription,
    ) -> None:
        """Initialize drone entity."""
        super().__init__()
        self.coordinator = coordinator
        self._drone_id = drone_id
        self.entity_description = description

    @property
    def unique_id(self) -> str:
        """Stable unique id."""
        return f"{self._drone_id}_{self.entity_description.key}"

    @property
    def device_info(self) -> DeviceInfo:
        """Device registry metadata."""
        drone = self.coordinator.get_drone(self._drone_id)
        return DeviceInfo(
            identifiers={(DOMAIN, f"drone:{self._drone_id}")},
            name=drone_device_name(drone) if drone else f"Drone {self._drone_id[-10:]}",
            manufacturer=drone_manufacturer(drone) if drone else "Unknown",
            model=drone_registry_model(self.hass, drone, self._drone_id)
            if drone
            else f"Drone {self._drone_id[-10:]}",
            serial_number=drone_registry_serial(drone, self._drone_id),
        )

    @property
    def available(self) -> bool:
        """Follow coordinator drone availability."""
        drone = self.coordinator.get_drone(self._drone_id)
        return bool(drone and drone.available)

    async def async_added_to_hass(self) -> None:
        """Subscribe to targeted dispatcher updates."""
        await super().async_added_to_hass()
        self.async_on_remove(
            async_dispatcher_connect(
                self.hass,
                drone_update_signal(self._drone_id),
                self.async_write_ha_state,
            )
        )
        self.async_on_remove(
            async_dispatcher_connect(
                self.hass,
                drone_entity_removed_signal(self._drone_id),
                self._async_remove_self,
            )
        )

    async def _async_remove_self(self) -> None:
        """Remove entity when drone is purged."""
        await self.async_remove(force_remove=False)
