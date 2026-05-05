"""Typed MQTT payload models (schema v1.29)."""

from __future__ import annotations

import logging
import math
from dataclasses import dataclass
from datetime import UTC, datetime
from typing import Any, TypeVar

from .const import (
    AlertLevel,
    AlertSource,
    BroadcastProtocol,
    CategoryEU,
    ChargingDisabledReason,
    ClassEU,
    CommandBrokerScope,
    CommandResponseStatus,
    ConnectionType,
    DroneStatus,
    FirmwareBootSlot,
    FirmwareSlotState,
    GetLogsType,
    IdType,
    OperatorClassificationType,
    OperatorLocationType,
    ScannerCommandAction,
    ScannerConnectionStatus,
    ScannerErrorType,
    ScannerOfflineReason,
    SignalType,
    UaType,
    WifiBand,
    WifiInterfaceStatus,
    WifiRole,
)

_LOGGER = logging.getLogger(__name__)

E = TypeVar("E", bound=str)


def _parse_iso_timestamp(value: Any) -> datetime | None:
    if value is None or not isinstance(value, str):
        return None
    try:
        normalized = value.replace("Z", "+00:00")
        dt = datetime.fromisoformat(normalized)
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=UTC)
        return dt
    except (OSError, TypeError, ValueError):
        return None


def _parse_enum_member(enum_cls: type[E], value: Any) -> E | None:
    if value is None or not isinstance(value, str):
        return None
    try:
        return enum_cls(value)
    except ValueError:
        return None


ODID_IDTYPE_MAP: dict[str, str] = {
    "0": "ODID_IDTYPE_NONE",
    "1": "ODID_IDTYPE_SERIAL_NUMBER",
    "2": "ODID_IDTYPE_CAA_REGISTRATION_ID",
    "3": "ODID_IDTYPE_UTM_ASSIGNED_UUID",
    "4": "ODID_IDTYPE_SPECIFIC_SESSION_ID",
}

ODID_UATYPE_MAP: dict[str, str] = {
    "0": "ODID_UATYPE_NONE",
    "1": "ODID_UATYPE_AEROPLANE",
    "2": "ODID_UATYPE_HELICOPTER_OR_MULTIROTOR",
    "3": "ODID_UATYPE_GYROPLANE",
    "4": "ODID_UATYPE_HYBRID_LIFT",
    "5": "ODID_UATYPE_ORNITHOPTER",
    "6": "ODID_UATYPE_GLIDER",
    "7": "ODID_UATYPE_KITE",
    "8": "ODID_UATYPE_FREE_BALLOON",
    "9": "ODID_UATYPE_CAPTIVE_BALLOON",
    "10": "ODID_UATYPE_AIRSHIP",
    "11": "ODID_UATYPE_FREE_FALL_PARACHUTE",
    "12": "ODID_UATYPE_ROCKET",
    "13": "ODID_UATYPE_TETHERED_POWERED_AIRCRAFT",
    "14": "ODID_UATYPE_GROUND_OBSTACLE",
    "15": "ODID_UATYPE_OTHER",
}

ODID_INVALID_ALTITUDE = -1000.0
ODID_INVALID_DIRECTION = 361.0
ODID_INVALID_SPEED_HORIZ = 255.0


def _normalize_odid_idtype(value: Any) -> str | None:
    """Map numeric ODID id_type to symbolic string; passthrough if already symbolic."""
    if value is None:
        return None
    s = str(value)
    return ODID_IDTYPE_MAP.get(s, s)


def _normalize_odid_uatype(value: Any) -> str | None:
    """Map numeric ODID ua_type to symbolic string; passthrough if already symbolic."""
    if value is None:
        return None
    s = str(value)
    return ODID_UATYPE_MAP.get(s, s)


def _filter_odid_sentinel(value: Any, sentinel: float) -> float | None:
    """Return None if value is the ODID sentinel meaning unknown / invalid."""
    if value is None:
        return None
    try:
        f = float(value)
    except (TypeError, ValueError):
        return None
    return None if f == sentinel else f


def _coerce_broadcast_protocol_labels(raw: Any) -> tuple[str, ...] | None:
    """Labels from broadcast_protocols[]: enum value if known, else raw string."""
    if not isinstance(raw, list):
        return None
    out: list[str] = []
    for item in raw:
        e = _parse_enum_member(BroadcastProtocol, item)
        if e is not None:
            out.append(e.value)
        elif isinstance(item, str):
            out.append(item)
    return tuple(out) if out else None


def _coerce_signal_type_labels(raw: Any) -> tuple[str, ...] | None:
    """Labels from signal_types[]: enum value if known, else raw string."""
    if not isinstance(raw, list):
        return None
    out: list[str] = []
    for item in raw:
        e = _parse_enum_member(SignalType, item)
        if e is not None:
            out.append(e.value)
        elif isinstance(item, str):
            out.append(item)
    return tuple(out) if out else None


def _truncate_payload_repr(payload: dict[str, Any], limit: int = 200) -> str:
    text = repr(payload)
    if len(text) <= limit:
        return text
    return f"{text[:limit]}..."


@dataclass(slots=True, frozen=True)
class Alert:
    """scanner_status.alerts item."""

    level: AlertLevel
    source: AlertSource
    message: str

    @staticmethod
    def from_dict(data: dict[str, Any]) -> Alert | None:
        level = _parse_enum_member(AlertLevel, data.get("level"))
        source = _parse_enum_member(AlertSource, data.get("source"))
        message = data.get("message")
        if level is None or source is None or not isinstance(message, str):
            return None
        return Alert(level=level, source=source, message=message)


@dataclass(slots=True, frozen=True)
class ConstellationSatDetail:
    """constellationStats.* entry."""

    used: int | None = None
    view: int | None = None

    @staticmethod
    def from_dict(data: Any) -> ConstellationSatDetail | None:
        if not isinstance(data, dict):
            return None
        used = data.get("used")
        view = data.get("view")
        u = int(used) if isinstance(used, int | float) and not isinstance(used, bool) else None
        v = int(view) if isinstance(view, int | float) and not isinstance(view, bool) else None
        return ConstellationSatDetail(used=u, view=v)


@dataclass(slots=True, frozen=True)
class ConstellationStats:
    """gnss.constellations / scanner_position.constellations."""

    gps: ConstellationSatDetail | None = None
    glonass: ConstellationSatDetail | None = None
    galileo: ConstellationSatDetail | None = None
    beidou: ConstellationSatDetail | None = None

    @staticmethod
    def from_dict(data: Any) -> ConstellationStats | None:
        if not isinstance(data, dict):
            return None
        return ConstellationStats(
            gps=ConstellationSatDetail.from_dict(data.get("gps")),
            glonass=ConstellationSatDetail.from_dict(data.get("glonass")),
            galileo=ConstellationSatDetail.from_dict(data.get("galileo")),
            beidou=ConstellationSatDetail.from_dict(data.get("beidou")),
        )


@dataclass(slots=True, frozen=True)
class FirmwareSlotInfo:
    """firmware.slot_a / slot_b."""

    version: str | None = None
    state: FirmwareSlotState | None = None
    device: str | None = None

    @staticmethod
    def from_dict(data: Any) -> FirmwareSlotInfo | None:
        if not isinstance(data, dict):
            return None
        version = data.get("version")
        device = data.get("device")
        state = _parse_enum_member(FirmwareSlotState, data.get("state"))
        return FirmwareSlotInfo(
            version=version if isinstance(version, str) else None,
            state=state,
            device=device if isinstance(device, str) else None,
        )


@dataclass(slots=True, frozen=True)
class FirmwareUpdateProgress:
    """firmware.update_progress."""

    active: bool | None = None
    finished: bool | None = None
    percent: int | None = None
    message: str | None = None

    @staticmethod
    def from_dict(data: Any) -> FirmwareUpdateProgress | None:
        if not isinstance(data, dict):
            return None
        pct = data.get("percent")
        percent = int(pct) if isinstance(pct, int | float) and not isinstance(pct, bool) else None
        msg = data.get("message")
        return FirmwareUpdateProgress(
            active=data.get("active") if isinstance(data.get("active"), bool) else None,
            finished=data.get("finished") if isinstance(data.get("finished"), bool) else None,
            percent=percent,
            message=msg if isinstance(msg, str) else None,
        )


@dataclass(slots=True, frozen=True)
class FirmwareData:
    """scanner_status.firmware."""

    version: str | None = None
    booted_slot: FirmwareBootSlot | None = None
    slot_a: FirmwareSlotInfo | None = None
    slot_b: FirmwareSlotInfo | None = None
    update_progress: FirmwareUpdateProgress | None = None
    auto_update: bool | None = None
    update_available: bool | None = None
    update_version: str | None = None
    update_server_connected: bool | None = None

    @staticmethod
    def from_dict(data: Any) -> FirmwareData | None:
        if not isinstance(data, dict):
            return None
        uv = data.get("update_version")
        ver = data.get("version")
        return FirmwareData(
            version=ver if isinstance(ver, str) else None,
            booted_slot=_parse_enum_member(FirmwareBootSlot, data.get("booted_slot")),
            slot_a=FirmwareSlotInfo.from_dict(data.get("slot_a")),
            slot_b=FirmwareSlotInfo.from_dict(data.get("slot_b")),
            update_progress=FirmwareUpdateProgress.from_dict(data.get("update_progress")),
            auto_update=data.get("auto_update")
            if isinstance(data.get("auto_update"), bool)
            else None,
            update_available=data.get("update_available")
            if isinstance(data.get("update_available"), bool)
            else None,
            update_version=uv if isinstance(uv, str) else None,
            update_server_connected=data.get("update_server_connected")
            if isinstance(data.get("update_server_connected"), bool)
            else None,
        )


@dataclass(slots=True, frozen=True)
class Temperatures:
    """scanner_status.temperatures."""

    cpu: float | None = None
    pmic: float | None = None
    rp1: float | None = None
    enclosure: float | None = None

    @staticmethod
    def from_dict(data: Any) -> Temperatures | None:
        if not isinstance(data, dict):
            return None

        def num(key: str) -> float | None:
            v = data.get(key)
            if v is None:
                return None
            if isinstance(v, bool | int | float):
                if isinstance(v, bool):
                    return None
                return float(v)
            return None

        return Temperatures(
            cpu=num("cpu"),
            pmic=num("pmic"),
            rp1=num("rp1"),
            enclosure=num("enclosure"),
        )


@dataclass(slots=True, frozen=True)
class SystemInfo:
    """scanner_status.system."""

    cpu_percent: float | None = None
    memory_used_mb: int | None = None
    memory_total_mb: int | None = None
    mqtt_broker: str | None = None
    mqtt_connected: bool | None = None
    mqtt_tls: bool | None = None
    mqtt_tls_verified: bool | None = None
    mqtt_error: str | None = None
    mqtt_last_seen: datetime | None = None
    mqtt_secondary_broker: str | None = None
    mqtt_secondary_connected: bool | None = None
    mqtt_secondary_tls: bool | None = None
    mqtt_secondary_tls_verified: bool | None = None
    mqtt_secondary_error: str | None = None
    mqtt_secondary_last_seen: datetime | None = None

    @staticmethod
    def from_dict(data: Any) -> SystemInfo | None:
        if not isinstance(data, dict):
            return None

        def opt_int(key: str) -> int | None:
            v = data.get(key)
            if isinstance(v, bool) or v is None:
                return None
            if isinstance(v, int):
                return v
            if isinstance(v, float) and math.isfinite(v):
                return int(v)
            return None

        def opt_str(key: str) -> str | None:
            v = data.get(key)
            return v if isinstance(v, str) else None

        def opt_bool(key: str) -> bool | None:
            v = data.get(key)
            return v if isinstance(v, bool) else None

        cpu_raw = data.get("cpu_percent")
        cpu_percent = (
            float(cpu_raw)
            if isinstance(cpu_raw, int | float) and not isinstance(cpu_raw, bool)
            else None
        )

        return SystemInfo(
            cpu_percent=cpu_percent,
            memory_used_mb=opt_int("memory_used_mb"),
            memory_total_mb=opt_int("memory_total_mb"),
            mqtt_broker=opt_str("mqtt_broker"),
            mqtt_connected=opt_bool("mqtt_connected"),
            mqtt_tls=opt_bool("mqtt_tls"),
            mqtt_tls_verified=opt_bool("mqtt_tls_verified"),
            mqtt_error=opt_str("mqtt_error"),
            mqtt_last_seen=_parse_iso_timestamp(data.get("mqtt_last_seen")),
            mqtt_secondary_broker=opt_str("mqtt_secondary_broker"),
            mqtt_secondary_connected=opt_bool("mqtt_secondary_connected"),
            mqtt_secondary_tls=opt_bool("mqtt_secondary_tls"),
            mqtt_secondary_tls_verified=opt_bool("mqtt_secondary_tls_verified"),
            mqtt_secondary_error=opt_str("mqtt_secondary_error"),
            mqtt_secondary_last_seen=_parse_iso_timestamp(data.get("mqtt_secondary_last_seen")),
        )


@dataclass(slots=True, frozen=True)
class WifiInterface:
    """scanner_status.wifi_interfaces item."""

    interface: str | None = None
    mac: str | None = None
    channels: tuple[int, ...] | None = None
    band: WifiBand | None = None
    role: WifiRole | None = None
    mode: str | None = None
    channel: int | None = None
    status: WifiInterfaceStatus | None = None

    @staticmethod
    def from_dict(data: Any) -> WifiInterface | None:
        if not isinstance(data, dict):
            return None
        chans = data.get("channels")
        channels: tuple[int, ...] | None = None
        if isinstance(chans, list):
            parsed: list[int] = []
            for c in chans:
                if isinstance(c, int):
                    parsed.append(c)
            channels = tuple(parsed)
        chan = data.get("channel")
        channel = int(chan) if isinstance(chan, int) else None
        iface = data.get("interface")
        mac = data.get("mac")
        mode = data.get("mode")
        return WifiInterface(
            interface=iface if isinstance(iface, str) else None,
            mac=mac if isinstance(mac, str) else None,
            channels=channels,
            band=_parse_enum_member(WifiBand, data.get("band")),
            role=_parse_enum_member(WifiRole, data.get("role")),
            mode=mode if isinstance(mode, str) else None,
            channel=channel,
            status=_parse_enum_member(WifiInterfaceStatus, data.get("status")),
        )


@dataclass(slots=True, frozen=True)
class LteInfo:
    """scanner_status.lte."""

    force_off: bool | None = None
    available: bool | None = None
    connected: bool | None = None
    operator: str | None = None
    technology: str | None = None
    signal_percent: int | None = None
    ip_address: str | None = None
    imei: str | None = None
    iccid: str | None = None

    @staticmethod
    def from_dict(data: Any) -> LteInfo | None:
        if not isinstance(data, dict):
            return None
        sig = data.get("signal_percent")
        signal_percent = int(sig) if isinstance(sig, int) else None

        def opt_str(key: str) -> str | None:
            v = data.get(key)
            return v if isinstance(v, str) else None

        def opt_bool(key: str) -> bool | None:
            v = data.get(key)
            return v if isinstance(v, bool) else None

        return LteInfo(
            force_off=opt_bool("force_off"),
            available=opt_bool("available"),
            connected=opt_bool("connected"),
            operator=opt_str("operator"),
            technology=opt_str("technology"),
            signal_percent=signal_percent,
            ip_address=opt_str("ip_address"),
            imei=opt_str("imei"),
            iccid=opt_str("iccid"),
        )


@dataclass(slots=True, frozen=True)
class GnssData:
    """scanner_status.gnss."""

    available: bool | None = None
    enabled: bool | None = None
    has_fix: bool | None = None
    latitude: float | None = None
    longitude: float | None = None
    altitude: float | None = None
    speed: float | None = None
    heading: float | None = None
    fix_quality: int | None = None
    gps_utc: datetime | None = None
    satellites: int | None = None
    satellites_in_view: int | None = None
    hdop: float | None = None
    constellations: ConstellationStats | None = None
    updated_at: datetime | None = None

    @staticmethod
    def from_dict(data: Any) -> GnssData | None:
        if not isinstance(data, dict):
            return None

        def opt_int(key: str) -> int | None:
            v = data.get(key)
            if isinstance(v, bool) or v is None:
                return None
            if isinstance(v, int):
                return v
            if isinstance(v, float) and math.isfinite(v):
                return int(v)
            return None

        def opt_float(key: str) -> float | None:
            v = data.get(key)
            if isinstance(v, bool) or v is None:
                return None
            if isinstance(v, int | float) and math.isfinite(float(v)):
                return float(v)
            return None

        fq = data.get("fix_quality")
        fix_quality = int(fq) if isinstance(fq, int) else None

        return GnssData(
            available=data.get("available") if isinstance(data.get("available"), bool) else None,
            enabled=data.get("enabled") if isinstance(data.get("enabled"), bool) else None,
            has_fix=data.get("has_fix") if isinstance(data.get("has_fix"), bool) else None,
            latitude=opt_float("latitude"),
            longitude=opt_float("longitude"),
            altitude=opt_float("altitude"),
            speed=opt_float("speed"),
            heading=opt_float("heading"),
            fix_quality=fix_quality,
            gps_utc=_parse_iso_timestamp(data.get("gps_utc")),
            satellites=opt_int("satellites"),
            satellites_in_view=opt_int("satellites_in_view"),
            hdop=opt_float("hdop"),
            constellations=ConstellationStats.from_dict(data.get("constellations")),
            updated_at=_parse_iso_timestamp(data.get("updated_at")),
        )


@dataclass(slots=True, frozen=True)
class BatteryData:
    """scanner_status.battery."""

    available: bool | None = None
    voltage: float | None = None
    soc: float | None = None
    ac_power: bool | None = None
    charging: bool | None = None
    soc_max: int | None = None
    no_battery: bool | None = None
    charging_disabled_reason: ChargingDisabledReason | None = None

    @staticmethod
    def from_dict(data: Any) -> BatteryData | None:
        if not isinstance(data, dict):
            return None
        sm = data.get("soc_max")
        soc_max = int(sm) if isinstance(sm, int) else None
        cdr = data.get("charging_disabled_reason")
        charging_disabled_reason = None
        if cdr is None:
            charging_disabled_reason = None
        elif isinstance(cdr, str):
            charging_disabled_reason = _parse_enum_member(ChargingDisabledReason, cdr)

        def opt_float(key: str) -> float | None:
            v = data.get(key)
            if isinstance(v, bool) or v is None:
                return None
            if isinstance(v, int | float) and math.isfinite(float(v)):
                return float(v)
            return None

        return BatteryData(
            available=data.get("available") if isinstance(data.get("available"), bool) else None,
            voltage=opt_float("voltage"),
            soc=opt_float("soc"),
            ac_power=data.get("ac_power") if isinstance(data.get("ac_power"), bool) else None,
            charging=data.get("charging") if isinstance(data.get("charging"), bool) else None,
            soc_max=soc_max,
            no_battery=data.get("no_battery") if isinstance(data.get("no_battery"), bool) else None,
            charging_disabled_reason=charging_disabled_reason,
        )


@dataclass(slots=True, frozen=True)
class Scanner:
    """Parsed `{prefix}/{scanner_id}/status` payload."""

    scanner_id: str
    status: ScannerConnectionStatus
    timestamp: datetime
    reason: ScannerOfflineReason | None = None
    restart_count: int | None = None
    uptime_seconds: int | None = None
    connection_type: ConnectionType | None = None
    ip_address: str | None = None
    mac_address: str | None = None
    mqtt_latency_ms: float | None = None
    firmware: FirmwareData | None = None
    watchdog_network: bool | None = None
    alerts: tuple[Alert, ...] | None = None
    temperatures: Temperatures | None = None
    system: SystemInfo | None = None
    wifi_interfaces: tuple[WifiInterface, ...] | None = None
    lte: LteInfo | None = None
    gnss: GnssData | None = None
    battery: BatteryData | None = None
    gps_enabled: bool | None = None
    available: bool | None = None
    last_seen: datetime | None = None
    received_at: datetime | None = None

    @staticmethod
    def from_status_payload(
        data: dict[str, Any],
        *,
        topic_scanner_id: str,
        topic: str,
    ) -> Scanner | None:
        sid = data.get("scanner_id")
        if not isinstance(sid, str):
            _LOGGER.warning(
                "Invalid scanner status (missing scanner_id): topic=%s payload=%s",
                topic,
                _truncate_payload_repr(data),
            )
            return None
        if sid != topic_scanner_id:
            _LOGGER.warning(
                "scanner_id mismatch (topic=%s payload_scanner_id=%s)",
                topic,
                sid,
            )

        status = _parse_enum_member(ScannerConnectionStatus, data.get("status"))
        ts = _parse_iso_timestamp(data.get("timestamp"))
        if status is None or ts is None:
            _LOGGER.warning(
                "Invalid scanner status (required fields): topic=%s payload=%s",
                topic,
                _truncate_payload_repr(data),
            )
            return None

        alerts_raw = data.get("alerts")
        alerts: tuple[Alert, ...] | None = None
        if isinstance(alerts_raw, list):
            parsed_alerts: list[Alert] = []
            for item in alerts_raw:
                if isinstance(item, dict):
                    a = Alert.from_dict(item)
                    if a is not None:
                        parsed_alerts.append(a)
            alerts = tuple(parsed_alerts)

        wifi_raw = data.get("wifi_interfaces")
        wifi_interfaces: tuple[WifiInterface, ...] | None = None
        if isinstance(wifi_raw, list):
            parsed_wifi: list[WifiInterface] = []
            for item in wifi_raw:
                if isinstance(item, dict):
                    w = WifiInterface.from_dict(item)
                    if w is not None:
                        parsed_wifi.append(w)
            wifi_interfaces = tuple(parsed_wifi)

        uc = data.get("uptime_seconds")
        uptime_seconds = int(uc) if isinstance(uc, int) else None

        rc = data.get("restart_count")
        restart_count = int(rc) if isinstance(rc, int) else None

        ml = data.get("mqtt_latency_ms")
        mqtt_latency_ms = (
            float(ml)
            if isinstance(ml, int | float) and not isinstance(ml, bool) and math.isfinite(float(ml))
            else None
        )

        ip_address = data.get("ip_address")
        mac_address = data.get("mac_address")

        return Scanner(
            scanner_id=sid,
            status=status,
            timestamp=ts,
            reason=_parse_enum_member(ScannerOfflineReason, data.get("reason")),
            restart_count=restart_count,
            uptime_seconds=uptime_seconds,
            connection_type=_parse_enum_member(ConnectionType, data.get("connection_type")),
            ip_address=ip_address if isinstance(ip_address, str) else None,
            mac_address=mac_address if isinstance(mac_address, str) else None,
            mqtt_latency_ms=mqtt_latency_ms,
            firmware=FirmwareData.from_dict(data.get("firmware")),
            watchdog_network=data.get("watchdog_network")
            if isinstance(data.get("watchdog_network"), bool)
            else None,
            alerts=alerts,
            temperatures=Temperatures.from_dict(data.get("temperatures")),
            system=SystemInfo.from_dict(data.get("system")),
            wifi_interfaces=wifi_interfaces,
            lte=LteInfo.from_dict(data.get("lte")),
            gnss=GnssData.from_dict(data.get("gnss")),
            battery=BatteryData.from_dict(data.get("battery")),
            gps_enabled=data.get("gps_enabled")
            if isinstance(data.get("gps_enabled"), bool)
            else None,
        )


@dataclass(slots=True, frozen=True)
class ScannerErrorMessage:
    """`{prefix}/{scanner_id}/errors` payload."""

    scanner_id: str
    status: str
    error_type: ScannerErrorType
    error_message: str
    timestamp: datetime
    details: dict[str, Any] | None = None

    @staticmethod
    def from_payload(
        data: dict[str, Any],
        *,
        topic_scanner_id: str,
        topic: str,
    ) -> ScannerErrorMessage | None:
        sid = data.get("scanner_id")
        if not isinstance(sid, str):
            _LOGGER.warning(
                "Invalid scanner errors payload (scanner_id): topic=%s payload=%s",
                topic,
                _truncate_payload_repr(data),
            )
            return None
        if sid != topic_scanner_id:
            _LOGGER.warning("scanner_id mismatch on errors topic=%s", topic)

        st = data.get("status")
        if st != "error":
            _LOGGER.warning("Invalid scanner errors status=%s topic=%s", st, topic)
            return None

        error_type = _parse_enum_member(ScannerErrorType, data.get("error_type"))
        message = data.get("error_message")
        ts = _parse_iso_timestamp(data.get("timestamp"))
        if error_type is None or not isinstance(message, str) or ts is None:
            _LOGGER.warning(
                "Invalid scanner errors (required fields): topic=%s payload=%s",
                topic,
                _truncate_payload_repr(data),
            )
            return None

        det = data.get("details")
        details = det if isinstance(det, dict) else None

        return ScannerErrorMessage(
            scanner_id=sid,
            status=st,
            error_type=error_type,
            error_message=message,
            timestamp=ts,
            details=details,
        )


@dataclass(slots=True, frozen=True)
class DroneIdentification:
    """drone_data.identification."""

    prefix: str | None = None
    manufacturer_code: str | None = None
    manufacturer_name: str | None = None
    manufacturer_country: str | None = None
    model_code: str | None = None
    model_name: str | None = None
    model_type: str | None = None

    @staticmethod
    def from_dict(data: Any) -> DroneIdentification | None:
        if not isinstance(data, dict):
            return None

        def opt_str(key: str) -> str | None:
            v = data.get(key)
            return v if isinstance(v, str) else None

        return DroneIdentification(
            prefix=opt_str("prefix"),
            manufacturer_code=opt_str("manufacturer_code"),
            manufacturer_name=opt_str("manufacturer_name"),
            manufacturer_country=opt_str("manufacturer_country"),
            model_code=opt_str("model_code"),
            model_name=opt_str("model_name"),
            model_type=opt_str("model_type"),
        )


@dataclass(slots=True, frozen=True)
class OperatorData:
    """drone_data.operator."""

    latitude: float | None = None
    longitude: float | None = None
    altitude: float | None = None
    location_type: OperatorLocationType | None = None
    classification_type: OperatorClassificationType | None = None
    category_eu: CategoryEU | None = None
    class_eu: ClassEU | None = None

    @staticmethod
    def from_dict(data: Any) -> OperatorData | None:
        if not isinstance(data, dict):
            return None

        def opt_float(key: str) -> float | None:
            v = data.get(key)
            if isinstance(v, bool) or v is None:
                return None
            if isinstance(v, int | float) and math.isfinite(float(v)):
                return float(v)
            return None

        return OperatorData(
            latitude=opt_float("latitude"),
            longitude=opt_float("longitude"),
            altitude=_filter_odid_sentinel(opt_float("altitude"), ODID_INVALID_ALTITUDE),
            location_type=_parse_enum_member(OperatorLocationType, data.get("location_type")),
            classification_type=_parse_enum_member(
                OperatorClassificationType,
                data.get("classification_type"),
            ),
            category_eu=_parse_enum_member(CategoryEU, data.get("category_eu")),
            class_eu=_parse_enum_member(ClassEU, data.get("class_eu")),
        )


@dataclass(slots=True, frozen=True)
class ScannerPosition:
    """drone_data.scanner_position."""

    latitude: float | None = None
    longitude: float | None = None
    altitude: float | None = None
    satellites: int | None = None
    satellites_in_view: int | None = None
    hdop: float | None = None
    constellations: ConstellationStats | None = None

    @staticmethod
    def from_dict(data: Any) -> ScannerPosition | None:
        if not isinstance(data, dict):
            return None

        def opt_int(key: str) -> int | None:
            v = data.get(key)
            if isinstance(v, bool) or v is None:
                return None
            if isinstance(v, int):
                return v
            if isinstance(v, float) and math.isfinite(v):
                return int(v)
            return None

        def opt_float(key: str) -> float | None:
            v = data.get(key)
            if isinstance(v, bool) or v is None:
                return None
            if isinstance(v, int | float) and math.isfinite(float(v)):
                return float(v)
            return None

        return ScannerPosition(
            latitude=opt_float("latitude"),
            longitude=opt_float("longitude"),
            altitude=opt_float("altitude"),
            satellites=opt_int("satellites"),
            satellites_in_view=opt_int("satellites_in_view"),
            hdop=opt_float("hdop"),
            constellations=ConstellationStats.from_dict(data.get("constellations")),
        )


def _freeze_mapping_int(mapping: dict[str, int]) -> tuple[tuple[str, int], ...]:
    return tuple(sorted(mapping.items(), key=lambda x: x[0]))


def _freeze_mapping_float(mapping: dict[str, float]) -> tuple[tuple[str, float], ...]:
    return tuple(sorted(mapping.items(), key=lambda x: x[0]))


def primary_distance_to_scanner(
    rssi_by_scanner: tuple[tuple[str, int], ...] | None,
    distance_by_scanner: tuple[tuple[str, float], ...] | None,
) -> float | None:
    """Distance for the strongest-RSSI scanner; else minimum known distance."""
    dmap = dict(distance_by_scanner or ())
    if not dmap:
        return None
    rmap = dict(rssi_by_scanner or ())
    if rmap:
        best_sid = max(rmap, key=lambda k: rmap[k])
        if best_sid in dmap:
            return dmap[best_sid]
    return min(dmap.values())


@dataclass(slots=True, frozen=True)
class Drone:
    """Parsed drone telemetry for one MQTT message (merged in coordinator)."""

    drone_id: str
    source_scanner_id: str
    mac: str
    timestamp: datetime
    broadcast_protocol: BroadcastProtocol
    signal_type: SignalType
    rssi: int
    complete: bool
    payload_drone_id: str | None = None
    channel: int | None = None
    broadcast_protocols: tuple[str, ...] | None = None
    signal_types: tuple[str, ...] | None = None
    multi_source: bool = False
    source_timestamps: tuple[tuple[str, datetime], ...] | None = None
    id_type: IdType | None = None
    ua_type: UaType | None = None
    identification: DroneIdentification | None = None
    manufacturer: str | None = None
    model: str | None = None
    latitude: float | None = None
    longitude: float | None = None
    altitude_msl: float | None = None
    height_agl: float | None = None
    speed_horizontal: float | None = None
    speed_vertical: float | None = None
    direction: float | None = None
    flight_status: DroneStatus | None = None
    operator: OperatorData | None = None
    operator_id: str | None = None
    operator_country: str | None = None
    self_id: str | None = None
    scanner_position: ScannerPosition | None = None
    distance_to_scanner: float | None = None
    distance_by_scanner: tuple[tuple[str, float], ...] | None = None
    detected_scanners: frozenset[str] | None = None
    rssi_by_scanner: tuple[tuple[str, int], ...] | None = None
    available: bool | None = None
    last_seen: datetime | None = None
    received_at: datetime | None = None

    @classmethod
    def restore_placeholder(cls, drone_id: str, *, last_seen: datetime) -> Drone:
        """Minimal drone persisted across reboots until MQTT retain refreshes telemetry."""
        return cls(
            drone_id=drone_id,
            source_scanner_id="",
            mac="00:00:00:00:00:00",
            timestamp=last_seen,
            broadcast_protocol=BroadcastProtocol.WIFI_BEACON,
            signal_type=SignalType.REMOTEID_EU,
            rssi=0,
            complete=False,
            available=False,
            last_seen=last_seen,
            detected_scanners=frozenset(),
            rssi_by_scanner=(),
            distance_by_scanner=(),
            multi_source=False,
        )

    @staticmethod
    def from_drone_payload(
        data: dict[str, Any],
        *,
        topic_drone_id: str,
        topic_scanner_id: str,
        topic: str,
    ) -> Drone | None:
        sid = data.get("scanner_id")
        if not isinstance(sid, str):
            _LOGGER.warning(
                "Invalid drone data (scanner_id): topic=%s payload=%s",
                topic,
                _truncate_payload_repr(data),
            )
            return None
        if sid != topic_scanner_id:
            _LOGGER.warning("drone scanner_id mismatch topic=%s payload_scanner_id=%s", topic, sid)

        mac = data.get("mac")
        ts = _parse_iso_timestamp(data.get("timestamp"))
        bp = _parse_enum_member(BroadcastProtocol, data.get("broadcast_protocol"))
        st = _parse_enum_member(SignalType, data.get("signal_type"))
        rssi_raw = data.get("rssi")
        complete = data.get("complete")

        if (
            not isinstance(mac, str)
            or ts is None
            or bp is None
            or st is None
            or not isinstance(rssi_raw, int)
            or not isinstance(complete, bool)
        ):
            _LOGGER.warning(
                "Invalid drone data (required fields): topic=%s payload=%s",
                topic,
                _truncate_payload_repr(data),
            )
            return None

        payload_drone_id_raw = data.get("drone_id")
        payload_drone_id = payload_drone_id_raw if isinstance(payload_drone_id_raw, str) else None
        if payload_drone_id is not None and payload_drone_id != topic_drone_id:
            _LOGGER.info(
                "drone_id rotation detected topic_drone_id=%s payload_drone_id=%s",
                topic_drone_id,
                payload_drone_id,
            )

        ch = data.get("channel")
        channel = int(ch) if isinstance(ch, int) else None

        broadcast_protocols = _coerce_broadcast_protocol_labels(data.get("broadcast_protocols"))
        signal_types = _coerce_signal_type_labels(data.get("signal_types"))
        multi_source = bool(data.get("multi_source", False))

        st_map_raw = data.get("source_timestamps")
        source_timestamps: tuple[tuple[str, datetime], ...] | None = None
        if isinstance(st_map_raw, dict):
            pairs: list[tuple[str, datetime]] = []
            for k, v in st_map_raw.items():
                if isinstance(k, str):
                    dtp = _parse_iso_timestamp(v)
                    if dtp is not None:
                        pairs.append((k, dtp))
            source_timestamps = tuple(sorted(pairs, key=lambda x: x[0]))

        op_raw = data.get("operator")
        operator = OperatorData.from_dict(op_raw) if op_raw is not None else None

        alt_msl = data.get("altitude_msl")
        altitude_msl_raw = (
            float(alt_msl)
            if alt_msl is not None
            and isinstance(alt_msl, int | float)
            and not isinstance(alt_msl, bool)
            else None
        )
        altitude_msl = _filter_odid_sentinel(altitude_msl_raw, ODID_INVALID_ALTITUDE)

        h_agl = data.get("height_agl")
        height_agl_raw = (
            float(h_agl)
            if h_agl is not None and isinstance(h_agl, int | float) and not isinstance(h_agl, bool)
            else None
        )
        height_agl = _filter_odid_sentinel(height_agl_raw, ODID_INVALID_ALTITUDE)

        def opt_speed(key: str) -> float | None:
            v = data.get(key)
            if isinstance(v, bool) or v is None:
                return None
            if isinstance(v, int | float) and math.isfinite(float(v)):
                return float(v)
            return None

        def opt_heading(key: str) -> float | None:
            return opt_speed(key)

        speed_horizontal = _filter_odid_sentinel(
            opt_speed("speed_horizontal"), ODID_INVALID_SPEED_HORIZ
        )
        speed_vertical = _filter_odid_sentinel(
            opt_speed("speed_vertical"), ODID_INVALID_SPEED_HORIZ
        )
        direction = _filter_odid_sentinel(opt_heading("direction"), ODID_INVALID_DIRECTION)

        lat = data.get("latitude")
        lon = data.get("longitude")
        latitude = (
            float(lat)
            if lat is not None and isinstance(lat, int | float) and not isinstance(lat, bool)
            else None
        )
        longitude = (
            float(lon)
            if lon is not None and isinstance(lon, int | float) and not isinstance(lon, bool)
            else None
        )

        dist = data.get("distance_to_scanner")
        distance_to_scanner = (
            float(dist)
            if dist is not None and isinstance(dist, int | float) and not isinstance(dist, bool)
            else None
        )
        distance_by_scanner: tuple[tuple[str, float], ...] | None = None
        if distance_to_scanner is not None:
            distance_by_scanner = _freeze_mapping_float({topic_scanner_id: distance_to_scanner})

        man = data.get("manufacturer")
        mod = data.get("model")

        detected = frozenset({topic_scanner_id})
        rssi_map = _freeze_mapping_int({topic_scanner_id: int(rssi_raw)})

        return Drone(
            drone_id=topic_drone_id,
            source_scanner_id=topic_scanner_id,
            mac=mac,
            timestamp=ts,
            broadcast_protocol=bp,
            signal_type=st,
            rssi=int(rssi_raw),
            complete=complete,
            payload_drone_id=payload_drone_id,
            channel=channel,
            broadcast_protocols=broadcast_protocols,
            signal_types=signal_types,
            multi_source=multi_source,
            source_timestamps=source_timestamps,
            id_type=_parse_enum_member(IdType, _normalize_odid_idtype(data.get("id_type"))),
            ua_type=_parse_enum_member(UaType, _normalize_odid_uatype(data.get("ua_type"))),
            identification=DroneIdentification.from_dict(data.get("identification")),
            manufacturer=man if isinstance(man, str) else None,
            model=mod if isinstance(mod, str) else None,
            latitude=latitude,
            longitude=longitude,
            altitude_msl=altitude_msl,
            height_agl=height_agl,
            speed_horizontal=speed_horizontal,
            speed_vertical=speed_vertical,
            direction=direction,
            flight_status=_parse_enum_member(DroneStatus, data.get("flight_status")),
            operator=operator,
            operator_id=data.get("operator_id")
            if isinstance(data.get("operator_id"), str)
            else None,
            operator_country=data.get("operator_country")
            if isinstance(data.get("operator_country"), str)
            else None,
            self_id=data.get("self_id") if isinstance(data.get("self_id"), str) else None,
            scanner_position=ScannerPosition.from_dict(data.get("scanner_position")),
            distance_to_scanner=distance_to_scanner,
            distance_by_scanner=distance_by_scanner,
            detected_scanners=detected,
            rssi_by_scanner=rssi_map,
        )


@dataclass(slots=True, frozen=True)
class ScannerCommand:
    """Outgoing `{prefix}/{scanner_id}/commands` payload."""

    request_id: str
    action: ScannerCommandAction
    params: dict[str, Any] | None = None

    @staticmethod
    def from_payload(data: dict[str, Any]) -> ScannerCommand | None:
        rid = data.get("request_id")
        action = _parse_enum_member(ScannerCommandAction, data.get("action"))
        if not isinstance(rid, str) or action is None:
            return None
        params_raw = data.get("params")
        params = params_raw if isinstance(params_raw, dict) else None
        return ScannerCommand(request_id=rid, action=action, params=params)


@dataclass(slots=True, frozen=True)
class CommandResponseData:
    """commands/response data object."""

    log_type: str | None = None
    lines: int | None = None
    content: str | None = None
    enabled: bool | None = None

    @staticmethod
    def from_dict(data: Any) -> CommandResponseData | None:
        if not isinstance(data, dict):
            return None
        lt = data.get("type")
        lines = data.get("lines")
        content = data.get("content")
        enabled = data.get("enabled")
        return CommandResponseData(
            log_type=lt if isinstance(lt, str) else None,
            lines=int(lines) if isinstance(lines, int) else None,
            content=content if isinstance(content, str) else None,
            enabled=enabled if isinstance(enabled, bool) else None,
        )


@dataclass(slots=True, frozen=True)
class CommandResponse:
    """`{prefix}/{scanner_id}/commands/response` payload."""

    request_id: str
    scanner_id: str
    action: str
    status: CommandResponseStatus
    message: str
    timestamp: datetime
    data: CommandResponseData | None = None

    @staticmethod
    def from_payload(
        data: dict[str, Any],
        *,
        topic_scanner_id: str,
        topic: str,
    ) -> CommandResponse | None:
        rid = data.get("request_id")
        sid = data.get("scanner_id")
        action = data.get("action")
        status = _parse_enum_member(CommandResponseStatus, data.get("status"))
        message = data.get("message")
        ts = _parse_iso_timestamp(data.get("timestamp"))

        if (
            not isinstance(rid, str)
            or not isinstance(sid, str)
            or not isinstance(action, str)
            or status is None
            or not isinstance(message, str)
            or ts is None
        ):
            _LOGGER.warning(
                "Invalid command response: topic=%s payload=%s",
                topic,
                _truncate_payload_repr(data),
            )
            return None

        if sid != topic_scanner_id:
            _LOGGER.warning("command response scanner_id mismatch topic=%s", topic)

        return CommandResponse(
            request_id=rid,
            scanner_id=sid,
            action=action,
            status=status,
            message=message,
            timestamp=ts,
            data=CommandResponseData.from_dict(data.get("data")),
        )


def parse_broker_scope(value: Any) -> CommandBrokerScope | None:
    """Parse optional broker scope from command params."""
    return _parse_enum_member(CommandBrokerScope, value)


def parse_get_logs_type(value: Any) -> GetLogsType | None:
    """Parse get_logs type."""
    return _parse_enum_member(GetLogsType, value)
