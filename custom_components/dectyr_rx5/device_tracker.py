"""Device tracker platform (scanner GNSS + drone + optional operator)."""

from __future__ import annotations

from typing import TYPE_CHECKING, Any

from homeassistant.components.device_tracker import TrackerEntity
from homeassistant.components.device_tracker.const import SourceType
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.device_registry import DeviceInfo
from homeassistant.helpers.dispatcher import async_dispatcher_connect
from homeassistant.helpers.entity import EntityDescription
from homeassistant.helpers.entity_platform import AddEntitiesCallback

from .const import (
    DOMAIN,
    SIGNAL_DRONE_REMOVED,
    SIGNAL_NEW_DRONE,
    SIGNAL_NEW_SCANNER,
    SIGNAL_SCANNER_REMOVED,
    drone_update_signal,
)
from .entity import (
    DectyrDroneEntity,
    DectyrScannerEntity,
    drone_device_name,
    drone_manufacturer,
    drone_registry_model,
    drone_registry_serial,
)

if TYPE_CHECKING:
    from homeassistant.config_entries import ConfigEntry

from .coordinator import DectyrCoordinator
from .models import Drone

SCANNER_TRACKER_DESC = EntityDescription(
    key="scanner_position",
    translation_key="scanner_position",
)
DRONE_TRACKER_DESC = EntityDescription(
    key="drone_position",
    translation_key="drone_position",
)
OPERATOR_TRACKER_DESC = EntityDescription(
    key="operator_position",
    translation_key="operator_position",
)


def _operator_has_coords(drone: Drone) -> bool:
    op = drone.operator
    if not op:
        return False
    return op.latitude is not None and op.longitude is not None


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    """Set up device trackers."""
    coordinator: DectyrCoordinator = hass.data[DOMAIN][entry.entry_id]["coordinator"]
    seen_scanners: set[str] = set()
    seen_drones: set[str] = set()
    operator_added: set[str] = set()

    @callback
    def _async_add_scanner(scanner_id: str) -> None:
        if scanner_id in seen_scanners:
            return
        seen_scanners.add(scanner_id)
        async_add_entities([DectyrScannerDeviceTracker(coordinator, scanner_id)])

    @callback
    def _async_add_drone(drone_id: str) -> None:
        if drone_id in seen_drones:
            return
        seen_drones.add(drone_id)
        async_add_entities([DectyrDroneDeviceTracker(coordinator, drone_id)])

        @callback
        def _maybe_operator(_: Any = None) -> None:
            if drone_id in operator_added:
                return
            drone = coordinator.get_drone(drone_id)
            if not drone or not _operator_has_coords(drone):
                return
            operator_added.add(drone_id)
            async_add_entities([DectyrDroneOperatorTracker(coordinator, drone_id)])

        entry.async_on_unload(
            async_dispatcher_connect(
                hass,
                drone_update_signal(drone_id),
                _maybe_operator,
            )
        )
        _maybe_operator()

    for scanner in coordinator.get_all_scanners():
        _async_add_scanner(scanner.scanner_id)

    for drone in coordinator.get_all_drones():
        _async_add_drone(drone.drone_id)

    entry.async_on_unload(async_dispatcher_connect(hass, SIGNAL_NEW_SCANNER, _async_add_scanner))
    entry.async_on_unload(async_dispatcher_connect(hass, SIGNAL_NEW_DRONE, _async_add_drone))

    @callback
    def _async_drone_removed(drone_id: str) -> None:
        seen_drones.discard(drone_id)
        operator_added.discard(drone_id)

    @callback
    def _async_scanner_removed(scanner_id: str) -> None:
        seen_scanners.discard(scanner_id)

    entry.async_on_unload(
        async_dispatcher_connect(hass, SIGNAL_DRONE_REMOVED, _async_drone_removed)
    )
    entry.async_on_unload(
        async_dispatcher_connect(hass, SIGNAL_SCANNER_REMOVED, _async_scanner_removed)
    )


class DectyrScannerDeviceTracker(DectyrScannerEntity, TrackerEntity):
    """Scanner GNSS fix on the map."""

    _attr_source_type = SourceType.GPS
    _attr_icon = "mdi:radar"

    def __init__(self, coordinator: DectyrCoordinator, scanner_id: str) -> None:
        """Initialize."""
        super().__init__(coordinator, scanner_id, SCANNER_TRACKER_DESC)

    @property
    def latitude(self) -> float | None:
        """Latitude when fixed."""
        scanner = self.coordinator.get_scanner(self._scanner_id)
        if not scanner or not scanner.gnss or not scanner.gnss.has_fix:
            return None
        return scanner.gnss.latitude

    @property
    def longitude(self) -> float | None:
        """Longitude when fixed."""
        scanner = self.coordinator.get_scanner(self._scanner_id)
        if not scanner or not scanner.gnss or not scanner.gnss.has_fix:
            return None
        return scanner.gnss.longitude

    @property
    def location_accuracy(self) -> int:
        """No accuracy provided by payload."""
        return 0

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        """Debug GNSS quality."""
        scanner = self.coordinator.get_scanner(self._scanner_id)
        raw = scanner.gnss.fix_quality if scanner and scanner.gnss else None
        return {"gnss_fix_quality_raw": raw}

    @property
    def available(self) -> bool:
        """Hide from map when no valid fix."""
        scanner = self.coordinator.get_scanner(self._scanner_id)
        if not scanner or scanner.last_seen is None:
            return False
        gnss = scanner.gnss
        return bool(
            gnss and gnss.has_fix and gnss.latitude is not None and gnss.longitude is not None
        )


class DectyrDroneDeviceTracker(DectyrDroneEntity, TrackerEntity):
    """Drone reported position."""

    _attr_source_type = SourceType.GPS
    _attr_icon = "mdi:quadcopter"

    def __init__(self, coordinator: DectyrCoordinator, drone_id: str) -> None:
        """Initialize."""
        super().__init__(coordinator, drone_id, DRONE_TRACKER_DESC)

    @property
    def latitude(self) -> float | None:
        """Drone latitude."""
        drone = self.coordinator.get_drone(self._drone_id)
        if not drone:
            return None
        return drone.latitude

    @property
    def longitude(self) -> float | None:
        """Drone longitude."""
        drone = self.coordinator.get_drone(self._drone_id)
        if not drone:
            return None
        return drone.longitude

    @property
    def location_accuracy(self) -> int:
        """No accuracy in Remote ID payload."""
        return 0

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        """Telemetry snapshot for map card."""
        drone = self.coordinator.get_drone(self._drone_id)
        if not drone:
            return {}
        fs = drone.flight_status.value if drone.flight_status else None
        return {
            "altitude_msl": drone.altitude_msl,
            "height_agl": drone.height_agl,
            "speed_horizontal": drone.speed_horizontal,
            "speed_vertical": drone.speed_vertical,
            "direction": drone.direction,
            "flight_status": fs,
            "manufacturer": drone.manufacturer,
            "model": drone.model,
            "operator_id": drone.operator_id,
        }

    @property
    def available(self) -> bool:
        """Unavailable without coordinates."""
        drone = self.coordinator.get_drone(self._drone_id)
        if not drone or not drone.available:
            return False
        return drone.latitude is not None and drone.longitude is not None


class DectyrDroneOperatorTracker(DectyrDroneEntity, TrackerEntity):
    """Remote ID operator location (created when coordinates first appear)."""

    _attr_source_type = SourceType.GPS
    _attr_icon = "mdi:account-tie"

    def __init__(self, coordinator: DectyrCoordinator, drone_id: str) -> None:
        """Initialize."""
        super().__init__(coordinator, drone_id, OPERATOR_TRACKER_DESC)

    @property
    def latitude(self) -> float | None:
        """Operator latitude."""
        drone = self.coordinator.get_drone(self._drone_id)
        if not drone or not drone.operator:
            return None
        return drone.operator.latitude

    @property
    def longitude(self) -> float | None:
        """Operator longitude."""
        drone = self.coordinator.get_drone(self._drone_id)
        if not drone or not drone.operator:
            return None
        return drone.operator.longitude

    @property
    def location_accuracy(self) -> int:
        """No accuracy in payload."""
        return 0

    @property
    def device_info(self) -> DeviceInfo:
        """Same registry device as the drone aircraft."""
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
        """Unavailable without operator coordinates."""
        drone = self.coordinator.get_drone(self._drone_id)
        if not drone or not drone.available:
            return False
        return _operator_has_coords(drone)
