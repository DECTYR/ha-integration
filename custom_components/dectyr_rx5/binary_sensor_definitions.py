"""Binary sensor descriptions."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Callable

from homeassistant.components.binary_sensor import (
    BinarySensorDeviceClass,
    BinarySensorEntityDescription,
)
from homeassistant.helpers.entity import EntityCategory

from .const import AlertLevel, DroneStatus, ScannerConnectionStatus
from .models import Drone, Scanner


@dataclass(frozen=True, kw_only=True)
class DectyrScannerBinarySensorDescription(BinarySensorEntityDescription):
    """Scanner binary sensor."""

    is_on_fn: Callable[[Scanner], bool | None]
    available_fn: Callable[[Scanner], bool] | None = None
    requires_online: bool = False


@dataclass(frozen=True, kw_only=True)
class DectyrDroneBinarySensorDescription(BinarySensorEntityDescription):
    """Drone binary sensor."""

    is_on_fn: Callable[[Drone], bool | None]


def _has_critical(scanner: Scanner) -> bool:
    return any(a.level == AlertLevel.CRITICAL for a in (scanner.alerts or ()))


def _has_warning(scanner: Scanner) -> bool:
    return any(a.level == AlertLevel.WARNING for a in (scanner.alerts or ()))


SCANNER_BINARY_SENSORS: tuple[DectyrScannerBinarySensorDescription, ...] = (
    DectyrScannerBinarySensorDescription(
        key="online",
        translation_key="scanner_online",
        device_class=BinarySensorDeviceClass.CONNECTIVITY,
        is_on_fn=lambda s: s.status == ScannerConnectionStatus.ONLINE,
    ),
    DectyrScannerBinarySensorDescription(
        key="mqtt_primary_connected",
        translation_key="scanner_mqtt_primary_connected",
        device_class=BinarySensorDeviceClass.CONNECTIVITY,
        is_on_fn=lambda s: s.system.mqtt_connected if s.system else None,
    ),
    DectyrScannerBinarySensorDescription(
        key="mqtt_secondary_connected",
        translation_key="scanner_mqtt_secondary_connected",
        device_class=BinarySensorDeviceClass.CONNECTIVITY,
        is_on_fn=lambda s: s.system.mqtt_secondary_connected if s.system else None,
    ),
    DectyrScannerBinarySensorDescription(
        key="gnss_has_fix",
        translation_key="scanner_gnss_has_fix",
        device_class=BinarySensorDeviceClass.CONNECTIVITY,
        is_on_fn=lambda s: bool(s.gnss and s.gnss.has_fix),
    ),
    DectyrScannerBinarySensorDescription(
        key="lte_connected",
        translation_key="scanner_lte_connected",
        device_class=BinarySensorDeviceClass.CONNECTIVITY,
        is_on_fn=lambda s: s.lte.connected if s.lte else None,
    ),
    DectyrScannerBinarySensorDescription(
        key="ac_power",
        translation_key="scanner_ac_power",
        device_class=BinarySensorDeviceClass.PLUG,
        is_on_fn=lambda s: s.battery.ac_power if s.battery else None,
    ),
    DectyrScannerBinarySensorDescription(
        key="charging",
        translation_key="scanner_charging",
        device_class=BinarySensorDeviceClass.BATTERY_CHARGING,
        is_on_fn=lambda s: s.battery.charging if s.battery else None,
    ),
    DectyrScannerBinarySensorDescription(
        key="firmware_update_available",
        translation_key="scanner_firmware_update_available",
        device_class=BinarySensorDeviceClass.UPDATE,
        is_on_fn=lambda s: s.firmware.update_available if s.firmware else None,
    ),
    DectyrScannerBinarySensorDescription(
        key="has_critical_alert",
        translation_key="scanner_has_critical_alert",
        device_class=BinarySensorDeviceClass.PROBLEM,
        is_on_fn=_has_critical,
    ),
    DectyrScannerBinarySensorDescription(
        key="has_warning_alert",
        translation_key="scanner_has_warning_alert",
        device_class=BinarySensorDeviceClass.PROBLEM,
        is_on_fn=_has_warning,
    ),
    DectyrScannerBinarySensorDescription(
        key="watchdog_network_active",
        translation_key="scanner_watchdog_network_active",
        entity_category=EntityCategory.DIAGNOSTIC,
        device_class=BinarySensorDeviceClass.RUNNING,
        is_on_fn=lambda s: s.watchdog_network,
    ),
)


def _drone_airborne(d: Drone) -> bool:
    if not d.flight_status:
        return False
    return d.flight_status in (DroneStatus.AIRBORNE, DroneStatus.EMERGENCY)


DRONE_BINARY_SENSORS: tuple[DectyrDroneBinarySensorDescription, ...] = (
    DectyrDroneBinarySensorDescription(
        key="airborne",
        translation_key="drone_airborne",
        device_class=BinarySensorDeviceClass.RUNNING,
        is_on_fn=_drone_airborne,
    ),
    DectyrDroneBinarySensorDescription(
        key="emergency",
        translation_key="drone_emergency",
        device_class=BinarySensorDeviceClass.PROBLEM,
        is_on_fn=lambda d: d.flight_status == DroneStatus.EMERGENCY if d.flight_status else False,
    ),
    DectyrDroneBinarySensorDescription(
        key="multi_source",
        translation_key="drone_multi_source",
        entity_category=EntityCategory.DIAGNOSTIC,
        device_class=BinarySensorDeviceClass.RUNNING,
        icon="mdi:multicast",
        is_on_fn=lambda d: d.multi_source,
    ),
)
