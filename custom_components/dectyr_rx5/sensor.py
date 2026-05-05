"""Sensor platform."""

from __future__ import annotations

from typing import TYPE_CHECKING, Any

from homeassistant.components.sensor import SensorEntity
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.dispatcher import async_dispatcher_connect
from homeassistant.helpers.entity_platform import AddEntitiesCallback

from .const import (
    DOMAIN,
    SIGNAL_DRONE_REMOVED,
    SIGNAL_NEW_DRONE,
    SIGNAL_NEW_SCANNER,
    SIGNAL_SCANNER_REMOVED,
    ScannerConnectionStatus,
)
from .entity import DectyrDroneEntity, DectyrScannerEntity
from .sensor_definitions import (
    DRONE_SENSORS,
    SCANNER_SENSORS,
    DectyrDroneSensorDescription,
    DectyrScannerSensorDescription,
)

if TYPE_CHECKING:
    from homeassistant.config_entries import ConfigEntry

    from .coordinator import DectyrCoordinator


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    """Set up sensors from registry + discovery signals."""
    coordinator: DectyrCoordinator = hass.data[DOMAIN][entry.entry_id]["coordinator"]
    seen_scanners: set[str] = set()
    seen_drones: set[str] = set()

    @callback
    def _async_add_scanner(scanner_id: str) -> None:
        if scanner_id in seen_scanners:
            return
        seen_scanners.add(scanner_id)
        entities: list[SensorEntity] = [
            DectyrScannerSensor(coordinator, scanner_id, desc) for desc in SCANNER_SENSORS
        ]
        async_add_entities(entities)

    @callback
    def _async_add_drone(drone_id: str) -> None:
        if drone_id in seen_drones:
            return
        seen_drones.add(drone_id)
        entities = [DectyrDroneSensor(coordinator, drone_id, desc) for desc in DRONE_SENSORS]
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


class DectyrScannerSensor(DectyrScannerEntity, SensorEntity):
    """MQTT-driven scanner sensor."""

    entity_description: DectyrScannerSensorDescription

    def __init__(
        self,
        coordinator: DectyrCoordinator,
        scanner_id: str,
        description: DectyrScannerSensorDescription,
    ) -> None:
        """Initialize."""
        super().__init__(coordinator, scanner_id, description)

    @property
    def native_value(self) -> Any:
        """Sensor state."""
        scanner = self.coordinator.get_scanner(self._scanner_id)
        if not scanner:
            return None
        return self.entity_description.value_fn(scanner)

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        """Optional attributes."""
        scanner = self.coordinator.get_scanner(self._scanner_id)
        if not scanner or not self.entity_description.attr_fn:
            return {}
        return self.entity_description.attr_fn(scanner)

    @property
    def available(self) -> bool:
        """Reflect last_seen, online requirement, and description filter."""
        scanner = self.coordinator.get_scanner(self._scanner_id)
        if not scanner or scanner.last_seen is None:
            return False
        desc = self.entity_description
        if desc.requires_online and scanner.status != ScannerConnectionStatus.ONLINE:
            return False
        if desc.available_fn is None:
            return True
        return desc.available_fn(scanner)


class DectyrDroneSensor(DectyrDroneEntity, SensorEntity):
    """MQTT-driven drone sensor."""

    entity_description: DectyrDroneSensorDescription

    def __init__(
        self,
        coordinator: DectyrCoordinator,
        drone_id: str,
        description: DectyrDroneSensorDescription,
    ) -> None:
        """Initialize."""
        super().__init__(coordinator, drone_id, description)

    @property
    def native_value(self) -> Any:
        """Sensor state."""
        drone = self.coordinator.get_drone(self._drone_id)
        if not drone:
            return None
        return self.entity_description.value_fn(drone)

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        """Optional attributes."""
        drone = self.coordinator.get_drone(self._drone_id)
        if not drone or not self.entity_description.attr_fn:
            return {}
        return self.entity_description.attr_fn(drone)

    @property
    def available(self) -> bool:
        """Follow drone registry availability and optional filter."""
        drone = self.coordinator.get_drone(self._drone_id)
        if not drone or not drone.available:
            return False
        if self.entity_description.available_fn is None:
            return True
        return self.entity_description.available_fn(drone)
