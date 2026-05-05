"""Binary sensor platform."""

from __future__ import annotations

from typing import TYPE_CHECKING

from homeassistant.components.binary_sensor import BinarySensorEntity
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.dispatcher import async_dispatcher_connect
from homeassistant.helpers.entity_platform import AddEntitiesCallback

from .binary_sensor_definitions import (
    DRONE_BINARY_SENSORS,
    SCANNER_BINARY_SENSORS,
    DectyrDroneBinarySensorDescription,
    DectyrScannerBinarySensorDescription,
)
from .const import (
    DOMAIN,
    SIGNAL_DRONE_REMOVED,
    SIGNAL_NEW_DRONE,
    SIGNAL_NEW_SCANNER,
    SIGNAL_SCANNER_REMOVED,
    ScannerConnectionStatus,
)
from .entity import DectyrDroneEntity, DectyrScannerEntity

if TYPE_CHECKING:
    from homeassistant.config_entries import ConfigEntry

    from .coordinator import DectyrCoordinator


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    """Set up binary sensors."""
    coordinator: DectyrCoordinator = hass.data[DOMAIN][entry.entry_id]["coordinator"]
    seen_scanners: set[str] = set()
    seen_drones: set[str] = set()

    @callback
    def _async_add_scanner(scanner_id: str) -> None:
        if scanner_id in seen_scanners:
            return
        seen_scanners.add(scanner_id)
        entities = [
            DectyrScannerBinarySensor(coordinator, scanner_id, desc)
            for desc in SCANNER_BINARY_SENSORS
        ]
        async_add_entities(entities)

    @callback
    def _async_add_drone(drone_id: str) -> None:
        if drone_id in seen_drones:
            return
        seen_drones.add(drone_id)
        entities = [
            DectyrDroneBinarySensor(coordinator, drone_id, desc) for desc in DRONE_BINARY_SENSORS
        ]
        async_add_entities(entities)

    for scanner in coordinator.get_all_scanners():
        _async_add_scanner(scanner.scanner_id)

    for drone in coordinator.get_all_drones():
        _async_add_drone(drone.drone_id)

    entry.async_on_unload(async_dispatcher_connect(hass, SIGNAL_NEW_SCANNER, _async_add_scanner))
    entry.async_on_unload(async_dispatcher_connect(hass, SIGNAL_NEW_DRONE, _async_add_drone))

    @callback
    def _async_drone_removed(drone_id: str) -> None:
        seen_drones.discard(drone_id)

    @callback
    def _async_scanner_removed(scanner_id: str) -> None:
        seen_scanners.discard(scanner_id)

    entry.async_on_unload(
        async_dispatcher_connect(hass, SIGNAL_DRONE_REMOVED, _async_drone_removed)
    )
    entry.async_on_unload(
        async_dispatcher_connect(hass, SIGNAL_SCANNER_REMOVED, _async_scanner_removed)
    )


class DectyrScannerBinarySensor(DectyrScannerEntity, BinarySensorEntity):
    """Scanner binary sensor."""

    entity_description: DectyrScannerBinarySensorDescription

    def __init__(
        self,
        coordinator: DectyrCoordinator,
        scanner_id: str,
        description: DectyrScannerBinarySensorDescription,
    ) -> None:
        """Initialize."""
        super().__init__(coordinator, scanner_id, description)

    @property
    def is_on(self) -> bool | None:
        """Binary state."""
        scanner = self.coordinator.get_scanner(self._scanner_id)
        if not scanner:
            return None
        return self.entity_description.is_on_fn(scanner)

    @property
    def available(self) -> bool:
        """Reflect telemetry and optional online gate."""
        scanner = self.coordinator.get_scanner(self._scanner_id)
        if not scanner or scanner.last_seen is None:
            return False
        desc = self.entity_description
        if desc.requires_online and scanner.status != ScannerConnectionStatus.ONLINE:
            return False
        if desc.available_fn is None:
            return True
        return desc.available_fn(scanner)


class DectyrDroneBinarySensor(DectyrDroneEntity, BinarySensorEntity):
    """Drone binary sensor."""

    entity_description: DectyrDroneBinarySensorDescription

    def __init__(
        self,
        coordinator: DectyrCoordinator,
        drone_id: str,
        description: DectyrDroneBinarySensorDescription,
    ) -> None:
        """Initialize."""
        super().__init__(coordinator, drone_id, description)

    @property
    def is_on(self) -> bool | None:
        """Binary state."""
        drone = self.coordinator.get_drone(self._drone_id)
        if not drone:
            return None
        return self.entity_description.is_on_fn(drone)
