"""Sensor entity descriptions for scanners and drones."""

from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime
from typing import Any, Callable

from homeassistant.components.sensor import (
    SensorDeviceClass,
    SensorEntityDescription,
    SensorStateClass,
)
from homeassistant.const import (
    PERCENTAGE,
    SIGNAL_STRENGTH_DECIBELS_MILLIWATT,
    UnitOfElectricPotential,
    UnitOfInformation,
    UnitOfLength,
    UnitOfSpeed,
    UnitOfTemperature,
    UnitOfTime,
)
from homeassistant.helpers.entity import EntityCategory
from homeassistant.helpers.typing import StateType

from .const import (
    AlertLevel,
    BroadcastProtocol,
    CategoryEU,
    ClassEU,
    ConnectionType,
    DroneStatus,
    IdType,
    ScannerConnectionStatus,
    SignalType,
    UaType,
    map_fix_quality,
    slugify_enum,
)
from .models import Drone, Scanner

SCANNER_STATUS_OPTIONS: tuple[str, ...] = tuple(s.value for s in ScannerConnectionStatus)
CONNECTION_TYPE_OPTIONS: tuple[str, ...] = tuple(s.value for s in ConnectionType)
DRONE_FLIGHT_OPTIONS: tuple[str, ...] = tuple(slugify_enum(s.value) for s in DroneStatus)
ID_TYPE_OPTIONS: tuple[str, ...] = tuple(slugify_enum(s.value) for s in IdType)
UA_TYPE_OPTIONS: tuple[str, ...] = tuple(slugify_enum(s.value) for s in UaType)
BROADCAST_PROTOCOL_OPTIONS: tuple[str, ...] = tuple(
    slugify_enum(s.value) for s in BroadcastProtocol
)
SIGNAL_TYPE_OPTIONS: tuple[str, ...] = tuple(slugify_enum(s.value) for s in SignalType)
CATEGORY_EU_OPTIONS: tuple[str, ...] = tuple(slugify_enum(s.value) for s in CategoryEU)
CLASS_EU_OPTIONS: tuple[str, ...] = tuple(slugify_enum(s.value) for s in ClassEU)
FIX_QUALITY_OPTIONS: tuple[str, ...] = ("invalid", "gnss", "dgps")


def _scanner_online(s: Scanner) -> bool:
    return s.status == ScannerConnectionStatus.ONLINE


def _alerts_list(scanner: Scanner) -> list[dict[str, str]]:
    return [
        {"level": a.level.value, "source": a.source.value, "message": a.message}
        for a in (scanner.alerts or ())
    ]


def _last_alert_message(scanner: Scanner) -> str | None:
    alerts = scanner.alerts or ()
    if not alerts:
        return None
    critical = [a for a in alerts if a.level == AlertLevel.CRITICAL]
    if critical:
        return critical[0].message
    return alerts[0].message


def _gnss_constellation_attrs(scanner: Scanner) -> dict[str, Any]:
    gnss = scanner.gnss
    if not gnss or not gnss.constellations:
        return {}
    c = gnss.constellations
    detail: dict[str, Any] = {}
    for name in ("gps", "glonass", "galileo", "beidou"):
        block = getattr(c, name, None)
        if block is None:
            continue
        detail[name] = {"used": block.used, "view": block.view}
    return {"constellations": detail} if detail else {}


def _detected_by_attrs(drone: Drone) -> dict[str, Any]:
    scanners = sorted(drone.detected_scanners or frozenset())
    rssi_map = dict(drone.rssi_by_scanner or ())
    best_sid: str | None = None
    best_val: int | None = None
    if rssi_map:
        best_sid = max(rssi_map, key=lambda k: rssi_map[k])
        best_val = rssi_map[best_sid]
    return {"scanners": scanners, "best_rssi_scanner": best_sid, "best_rssi": best_val}


def _distance_to_scanner_attrs(drone: Drone) -> dict[str, Any]:
    dmap = dict(drone.distance_by_scanner or ())
    if not dmap:
        return {}
    return {"distance_by_scanner": dmap}


def _drone_broadcast_protocol_attrs(drone: Drone) -> dict[str, Any]:
    labels = drone.broadcast_protocols
    if not labels:
        return {}
    return {"broadcast_protocols": list(labels)}


def _drone_signal_type_attrs(drone: Drone) -> dict[str, Any]:
    labels = drone.signal_types
    if not labels:
        return {}
    return {"signal_types": list(labels)}


def _fix_quality_attrs(scanner: Scanner) -> dict[str, Any]:
    raw = scanner.gnss.fix_quality if scanner.gnss else None
    return {"raw_value": raw}


def _last_seen_dt(drone: Drone) -> datetime | None:
    return drone.last_seen or drone.timestamp


@dataclass(frozen=True, kw_only=True)
class DectyrScannerSensorDescription(SensorEntityDescription):
    """Scanner sensor metadata + value extractor."""

    value_fn: Callable[[Scanner], StateType | datetime]
    attr_fn: Callable[[Scanner], dict[str, Any]] | None = None
    available_fn: Callable[[Scanner], bool] | None = None
    requires_online: bool = True


@dataclass(frozen=True, kw_only=True)
class DectyrDroneSensorDescription(SensorEntityDescription):
    """Drone sensor metadata + value extractor."""

    value_fn: Callable[[Drone], StateType | datetime]
    attr_fn: Callable[[Drone], dict[str, Any]] | None = None
    available_fn: Callable[[Drone], bool] | None = None


def _avail_always_scanner(_: Scanner) -> bool:
    return True


def _avail_always_drone(_: Drone) -> bool:
    return True


SCANNER_SENSORS: tuple[DectyrScannerSensorDescription, ...] = (
    DectyrScannerSensorDescription(
        key="status",
        translation_key="scanner_status",
        device_class=SensorDeviceClass.ENUM,
        options=list(SCANNER_STATUS_OPTIONS),
        value_fn=lambda s: s.status.value,
        requires_online=False,
        available_fn=_avail_always_scanner,
    ),
    DectyrScannerSensorDescription(
        key="uptime_seconds",
        translation_key="scanner_uptime",
        device_class=SensorDeviceClass.DURATION,
        native_unit_of_measurement=UnitOfTime.SECONDS,
        state_class=SensorStateClass.TOTAL_INCREASING,
        value_fn=lambda s: s.uptime_seconds,
    ),
    DectyrScannerSensorDescription(
        key="connection_type",
        translation_key="scanner_connection_type",
        device_class=SensorDeviceClass.ENUM,
        options=list(CONNECTION_TYPE_OPTIONS),
        value_fn=lambda s: s.connection_type.value if s.connection_type else None,
    ),
    DectyrScannerSensorDescription(
        key="mqtt_latency_ms",
        translation_key="scanner_mqtt_latency",
        native_unit_of_measurement="ms",
        state_class=SensorStateClass.MEASUREMENT,
        suggested_display_precision=1,
        value_fn=lambda s: s.mqtt_latency_ms,
    ),
    DectyrScannerSensorDescription(
        key="cpu_percent",
        translation_key="scanner_cpu_percent",
        native_unit_of_measurement=PERCENTAGE,
        state_class=SensorStateClass.MEASUREMENT,
        value_fn=lambda s: s.system.cpu_percent if s.system else None,
    ),
    DectyrScannerSensorDescription(
        key="memory_used_mb",
        translation_key="scanner_memory_used",
        native_unit_of_measurement=UnitOfInformation.MEGABYTES,
        state_class=SensorStateClass.MEASUREMENT,
        value_fn=lambda s: s.system.memory_used_mb if s.system else None,
    ),
    DectyrScannerSensorDescription(
        key="memory_total_mb",
        translation_key="scanner_memory_total",
        entity_category=EntityCategory.DIAGNOSTIC,
        native_unit_of_measurement=UnitOfInformation.MEGABYTES,
        state_class=SensorStateClass.MEASUREMENT,
        value_fn=lambda s: s.system.memory_total_mb if s.system else None,
    ),
    DectyrScannerSensorDescription(
        key="cpu_temperature",
        translation_key="scanner_cpu_temperature",
        device_class=SensorDeviceClass.TEMPERATURE,
        native_unit_of_measurement=UnitOfTemperature.CELSIUS,
        state_class=SensorStateClass.MEASUREMENT,
        suggested_display_precision=1,
        value_fn=lambda s: s.temperatures.cpu if s.temperatures else None,
    ),
    DectyrScannerSensorDescription(
        key="pmic_temperature",
        translation_key="scanner_pmic_temperature",
        entity_category=EntityCategory.DIAGNOSTIC,
        device_class=SensorDeviceClass.TEMPERATURE,
        native_unit_of_measurement=UnitOfTemperature.CELSIUS,
        state_class=SensorStateClass.MEASUREMENT,
        suggested_display_precision=1,
        value_fn=lambda s: s.temperatures.pmic if s.temperatures else None,
    ),
    DectyrScannerSensorDescription(
        key="rp1_temperature",
        translation_key="scanner_rp1_temperature",
        entity_category=EntityCategory.DIAGNOSTIC,
        device_class=SensorDeviceClass.TEMPERATURE,
        native_unit_of_measurement=UnitOfTemperature.CELSIUS,
        state_class=SensorStateClass.MEASUREMENT,
        suggested_display_precision=1,
        value_fn=lambda s: s.temperatures.rp1 if s.temperatures else None,
    ),
    DectyrScannerSensorDescription(
        key="enclosure_temperature",
        translation_key="scanner_enclosure_temperature",
        device_class=SensorDeviceClass.TEMPERATURE,
        native_unit_of_measurement=UnitOfTemperature.CELSIUS,
        state_class=SensorStateClass.MEASUREMENT,
        suggested_display_precision=1,
        value_fn=lambda s: s.temperatures.enclosure if s.temperatures else None,
    ),
    DectyrScannerSensorDescription(
        key="lte_signal_percent",
        translation_key="scanner_lte_signal",
        native_unit_of_measurement=PERCENTAGE,
        state_class=SensorStateClass.MEASUREMENT,
        value_fn=lambda s: s.lte.signal_percent if s.lte else None,
    ),
    DectyrScannerSensorDescription(
        key="lte_operator",
        translation_key="scanner_lte_operator",
        value_fn=lambda s: s.lte.operator if s.lte else None,
    ),
    DectyrScannerSensorDescription(
        key="lte_technology",
        translation_key="scanner_lte_technology",
        value_fn=lambda s: s.lte.technology if s.lte else None,
    ),
    DectyrScannerSensorDescription(
        key="lte_imei",
        translation_key="scanner_lte_imei",
        entity_category=EntityCategory.DIAGNOSTIC,
        value_fn=lambda s: s.lte.imei if s.lte else None,
    ),
    DectyrScannerSensorDescription(
        key="lte_iccid",
        translation_key="scanner_lte_iccid",
        entity_category=EntityCategory.DIAGNOSTIC,
        value_fn=lambda s: s.lte.iccid if s.lte else None,
    ),
    DectyrScannerSensorDescription(
        key="gnss_satellites",
        translation_key="scanner_gnss_satellites",
        entity_category=EntityCategory.DIAGNOSTIC,
        state_class=SensorStateClass.MEASUREMENT,
        value_fn=lambda s: s.gnss.satellites if s.gnss else None,
        attr_fn=_gnss_constellation_attrs,
    ),
    DectyrScannerSensorDescription(
        key="gnss_satellites_in_view",
        translation_key="scanner_gnss_satellites_in_view",
        entity_category=EntityCategory.DIAGNOSTIC,
        state_class=SensorStateClass.MEASUREMENT,
        value_fn=lambda s: s.gnss.satellites_in_view if s.gnss else None,
    ),
    DectyrScannerSensorDescription(
        key="gnss_hdop",
        translation_key="scanner_gnss_hdop",
        entity_category=EntityCategory.DIAGNOSTIC,
        state_class=SensorStateClass.MEASUREMENT,
        suggested_display_precision=2,
        value_fn=lambda s: s.gnss.hdop if s.gnss else None,
    ),
    DectyrScannerSensorDescription(
        key="gnss_fix_quality",
        translation_key="scanner_gnss_fix_quality",
        entity_category=EntityCategory.DIAGNOSTIC,
        device_class=SensorDeviceClass.ENUM,
        options=list(FIX_QUALITY_OPTIONS),
        value_fn=lambda s: map_fix_quality(s.gnss.fix_quality if s.gnss else None),
        attr_fn=_fix_quality_attrs,
    ),
    DectyrScannerSensorDescription(
        key="battery_voltage",
        translation_key="scanner_battery_voltage",
        entity_category=EntityCategory.DIAGNOSTIC,
        device_class=SensorDeviceClass.VOLTAGE,
        native_unit_of_measurement=UnitOfElectricPotential.VOLT,
        state_class=SensorStateClass.MEASUREMENT,
        suggested_display_precision=3,
        value_fn=lambda s: s.battery.voltage if s.battery else None,
    ),
    DectyrScannerSensorDescription(
        key="battery_soc",
        translation_key="scanner_battery_soc",
        device_class=SensorDeviceClass.BATTERY,
        native_unit_of_measurement=PERCENTAGE,
        state_class=SensorStateClass.MEASUREMENT,
        value_fn=lambda s: s.battery.soc if s.battery else None,
    ),
    DectyrScannerSensorDescription(
        key="firmware_version",
        translation_key="scanner_firmware_version",
        entity_category=EntityCategory.DIAGNOSTIC,
        value_fn=lambda s: s.firmware.version if s.firmware else None,
    ),
    DectyrScannerSensorDescription(
        key="firmware_update_version",
        translation_key="scanner_firmware_update_version",
        entity_category=EntityCategory.DIAGNOSTIC,
        value_fn=lambda s: s.firmware.update_version if s.firmware else None,
        available_fn=lambda s: bool(s.firmware and s.firmware.update_version),
    ),
    DectyrScannerSensorDescription(
        key="restart_count",
        translation_key="scanner_restart_count",
        entity_category=EntityCategory.DIAGNOSTIC,
        state_class=SensorStateClass.TOTAL_INCREASING,
        value_fn=lambda s: s.restart_count,
    ),
    DectyrScannerSensorDescription(
        key="mqtt_secondary_error",
        translation_key="scanner_mqtt_secondary_error",
        entity_category=EntityCategory.DIAGNOSTIC,
        value_fn=lambda s: s.system.mqtt_secondary_error if s.system else None,
    ),
    DectyrScannerSensorDescription(
        key="alerts_count",
        translation_key="scanner_alerts_count",
        state_class=SensorStateClass.MEASUREMENT,
        value_fn=lambda s: len(s.alerts or ()),
        attr_fn=lambda s: {"alerts": _alerts_list(s)},
        requires_online=False,
        available_fn=_avail_always_scanner,
    ),
    DectyrScannerSensorDescription(
        key="last_alert_message",
        translation_key="scanner_last_alert_message",
        value_fn=_last_alert_message,
        requires_online=False,
        available_fn=_avail_always_scanner,
    ),
)

DRONE_SENSORS: tuple[DectyrDroneSensorDescription, ...] = (
    DectyrDroneSensorDescription(
        key="flight_status",
        translation_key="drone_flight_status",
        device_class=SensorDeviceClass.ENUM,
        options=list(DRONE_FLIGHT_OPTIONS),
        value_fn=lambda d: slugify_enum(d.flight_status.value) if d.flight_status else None,
    ),
    DectyrDroneSensorDescription(
        key="drone_id",
        translation_key="drone_id",
        icon="mdi:identifier",
        entity_category=EntityCategory.DIAGNOSTIC,
        value_fn=lambda d: d.drone_id,
    ),
    DectyrDroneSensorDescription(
        key="mac_address",
        translation_key="mac_address",
        icon="mdi:network",
        entity_category=EntityCategory.DIAGNOSTIC,
        value_fn=lambda d: d.mac or None,
    ),
    DectyrDroneSensorDescription(
        key="altitude_msl",
        translation_key="drone_altitude_msl",
        device_class=SensorDeviceClass.DISTANCE,
        native_unit_of_measurement=UnitOfLength.METERS,
        state_class=SensorStateClass.MEASUREMENT,
        suggested_display_precision=1,
        value_fn=lambda d: d.altitude_msl,
    ),
    DectyrDroneSensorDescription(
        key="altitude_agl",
        translation_key="drone_altitude_agl",
        device_class=SensorDeviceClass.DISTANCE,
        native_unit_of_measurement=UnitOfLength.METERS,
        state_class=SensorStateClass.MEASUREMENT,
        suggested_display_precision=1,
        value_fn=lambda d: d.height_agl,
    ),
    DectyrDroneSensorDescription(
        key="speed_horizontal",
        translation_key="drone_speed_horizontal",
        device_class=SensorDeviceClass.SPEED,
        native_unit_of_measurement=UnitOfSpeed.METERS_PER_SECOND,
        state_class=SensorStateClass.MEASUREMENT,
        value_fn=lambda d: d.speed_horizontal,
    ),
    DectyrDroneSensorDescription(
        key="speed_vertical",
        translation_key="drone_speed_vertical",
        device_class=SensorDeviceClass.SPEED,
        native_unit_of_measurement=UnitOfSpeed.METERS_PER_SECOND,
        state_class=SensorStateClass.MEASUREMENT,
        value_fn=lambda d: d.speed_vertical,
    ),
    DectyrDroneSensorDescription(
        key="direction",
        translation_key="drone_direction",
        icon="mdi:compass",
        native_unit_of_measurement="°",
        state_class=SensorStateClass.MEASUREMENT,
        suggested_display_precision=1,
        value_fn=lambda d: d.direction,
    ),
    DectyrDroneSensorDescription(
        key="rssi",
        translation_key="drone_rssi",
        entity_category=EntityCategory.DIAGNOSTIC,
        device_class=SensorDeviceClass.SIGNAL_STRENGTH,
        native_unit_of_measurement=SIGNAL_STRENGTH_DECIBELS_MILLIWATT,
        state_class=SensorStateClass.MEASUREMENT,
        value_fn=lambda d: d.rssi,
    ),
    DectyrDroneSensorDescription(
        key="distance_to_scanner",
        translation_key="drone_distance_to_scanner",
        device_class=SensorDeviceClass.DISTANCE,
        native_unit_of_measurement=UnitOfLength.METERS,
        state_class=SensorStateClass.MEASUREMENT,
        suggested_display_precision=1,
        value_fn=lambda d: d.distance_to_scanner,
        attr_fn=_distance_to_scanner_attrs,
    ),
    DectyrDroneSensorDescription(
        key="signal_type",
        translation_key="drone_signal_type",
        device_class=SensorDeviceClass.ENUM,
        options=list(SIGNAL_TYPE_OPTIONS),
        entity_category=EntityCategory.DIAGNOSTIC,
        value_fn=lambda d: slugify_enum(d.signal_type.value),
        attr_fn=_drone_signal_type_attrs,
    ),
    DectyrDroneSensorDescription(
        key="broadcast_protocol",
        translation_key="drone_broadcast_protocol",
        device_class=SensorDeviceClass.ENUM,
        options=list(BROADCAST_PROTOCOL_OPTIONS),
        entity_category=EntityCategory.DIAGNOSTIC,
        value_fn=lambda d: slugify_enum(d.broadcast_protocol.value),
        attr_fn=_drone_broadcast_protocol_attrs,
    ),
    DectyrDroneSensorDescription(
        key="channel",
        translation_key="drone_channel",
        entity_category=EntityCategory.DIAGNOSTIC,
        state_class=SensorStateClass.MEASUREMENT,
        value_fn=lambda d: d.channel,
    ),
    DectyrDroneSensorDescription(
        key="id_type",
        translation_key="drone_id_type",
        device_class=SensorDeviceClass.ENUM,
        options=list(ID_TYPE_OPTIONS),
        entity_category=EntityCategory.DIAGNOSTIC,
        value_fn=lambda d: slugify_enum(d.id_type.value) if d.id_type else None,
    ),
    DectyrDroneSensorDescription(
        key="ua_type",
        translation_key="drone_ua_type",
        device_class=SensorDeviceClass.ENUM,
        options=list(UA_TYPE_OPTIONS),
        entity_category=EntityCategory.DIAGNOSTIC,
        value_fn=lambda d: slugify_enum(d.ua_type.value) if d.ua_type else None,
    ),
    DectyrDroneSensorDescription(
        key="category_eu",
        translation_key="drone_category_eu",
        device_class=SensorDeviceClass.ENUM,
        options=list(CATEGORY_EU_OPTIONS),
        value_fn=lambda d: (
            slugify_enum(d.operator.category_eu.value)
            if d.operator and d.operator.category_eu
            else None
        ),
    ),
    DectyrDroneSensorDescription(
        key="class_eu",
        translation_key="drone_class_eu",
        device_class=SensorDeviceClass.ENUM,
        options=list(CLASS_EU_OPTIONS),
        value_fn=lambda d: (
            slugify_enum(d.operator.class_eu.value) if d.operator and d.operator.class_eu else None
        ),
    ),
    DectyrDroneSensorDescription(
        key="operator_id",
        translation_key="drone_operator_id",
        value_fn=lambda d: d.operator_id,
    ),
    DectyrDroneSensorDescription(
        key="operator_country",
        translation_key="drone_operator_country",
        value_fn=lambda d: d.operator_country,
    ),
    DectyrDroneSensorDescription(
        key="self_id",
        translation_key="drone_self_id",
        value_fn=lambda d: d.self_id,
    ),
    DectyrDroneSensorDescription(
        key="last_seen",
        translation_key="drone_last_seen",
        entity_category=EntityCategory.DIAGNOSTIC,
        device_class=SensorDeviceClass.TIMESTAMP,
        value_fn=_last_seen_dt,
    ),
    DectyrDroneSensorDescription(
        key="detected_by_count",
        translation_key="drone_detected_by_count",
        state_class=SensorStateClass.MEASUREMENT,
        value_fn=lambda d: len(d.detected_scanners or frozenset()),
        attr_fn=_detected_by_attrs,
    ),
)
