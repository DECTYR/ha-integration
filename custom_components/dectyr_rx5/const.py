"""Constants and enums for the Dectyr RX-5 MQTT integration (schema v1.29)."""

from __future__ import annotations

import re
from enum import StrEnum

DOMAIN = "dectyr_rx5"
MANUFACTURER = "Dectyr"
MODEL = "RX-5"

STORAGE_VERSION = 1

CONF_MQTT_PREFIX = "mqtt_prefix"
CONF_DRONE_INACTIVITY_TIMEOUT = "drone_inactivity_timeout"
CONF_DRONE_PURGE_AFTER = "drone_purge_after"
CONF_SCANNER_OFFLINE_TIMEOUT = "scanner_offline_timeout"
CONF_ENABLE_UNKNOWN_SCANNER_WARNING = "enable_unknown_scanner_warning"
CONF_COMMAND_TIMEOUT = "command_timeout"

DEFAULT_MQTT_PREFIX = "dronedetector"
DEFAULT_DRONE_INACTIVITY_TIMEOUT = 300
DEFAULT_DRONE_PURGE_AFTER = 86400
DEFAULT_SCANNER_OFFLINE_TIMEOUT = 60
DEFAULT_ENABLE_UNKNOWN_SCANNER_WARNING = True
DEFAULT_COMMAND_TIMEOUT = 30
SET_MQTT_BROKER_COMMAND_TIMEOUT = 420

MQTT_PREFIX_RE = re.compile(r"^[a-zA-Z0-9_/-]+$")

FIX_QUALITY_MAP: dict[int, str] = {
    0: "invalid",
    1: "gnss",
    2: "dgps",
}


def map_fix_quality(raw: int | None) -> str | None:
    """Map GNSS fix_quality integer from payload to ENUM sensor state."""
    if raw is None:
        return None
    return FIX_QUALITY_MAP.get(raw)


def slugify_enum(value: str | None) -> str | None:
    """Convert raw enum / protocol string to a HA-compliant translation key."""
    if value is None:
        return None
    return value.lower().replace("-", "_").replace(":", "_")


SIGNAL_NEW_SCANNER = f"{DOMAIN}_new_scanner"
SIGNAL_NEW_DRONE = f"{DOMAIN}_new_drone"
SIGNAL_SCANNER_UPDATE = f"{DOMAIN}_scanner_update"
SIGNAL_DRONE_UPDATE = f"{DOMAIN}_drone_update"
SIGNAL_SCANNER_REMOVED = f"{DOMAIN}_scanner_removed"
SIGNAL_DRONE_REMOVED = f"{DOMAIN}_drone_removed"


def scanner_update_signal(scanner_id: str) -> str:
    """Dispatcher signal when one scanner's state changes."""
    return f"{SIGNAL_SCANNER_UPDATE}_{scanner_id}"


def drone_update_signal(drone_id: str) -> str:
    """Dispatcher signal when one drone's state changes."""
    return f"{SIGNAL_DRONE_UPDATE}_{drone_id}"


def drone_entity_removed_signal(drone_id: str) -> str:
    """Dispatcher signal for drone entity removal when purged from the registry."""
    return f"{DOMAIN}_drone_entity_removed_{drone_id}"


EVENT_DRONE_DETECTED = "dectyr_rx5_drone_detected"
EVENT_DRONE_LOST = "dectyr_rx5_drone_lost"
EVENT_DRONE_PURGED = "dectyr_rx5_drone_purged"
EVENT_SCANNER_ALERT = "dectyr_rx5_scanner_alert"
EVENT_SCANNER_ERROR = "dectyr_rx5_scanner_error"
EVENT_LOGS_RECEIVED = "dectyr_rx5_logs_received"


class ScannerConnectionStatus(StrEnum):
    """scanner_status.status."""

    ONLINE = "online"
    OFFLINE = "offline"
    ERROR = "error"
    RESTARTING = "restarting"


class ScannerOfflineReason(StrEnum):
    """scanner_status.reason when offline."""

    SHUTDOWN = "shutdown"
    CONNECTION_LOST = "connection_lost"
    CRASH = "crash"
    WATCHDOG = "watchdog"


class ConnectionType(StrEnum):
    """scanner_status.connection_type."""

    ETHERNET = "ethernet"
    FOUR_G = "4g"
    WIFI = "wifi"
    UNKNOWN = "unknown"


class FirmwareBootSlot(StrEnum):
    """firmware.booted_slot."""

    A = "A"
    B = "B"
    UNKNOWN = "unknown"


class FirmwareSlotState(StrEnum):
    """firmware.slot_*.state."""

    GOOD = "good"
    BAD = "bad"
    UNKNOWN = "unknown"


class AlertLevel(StrEnum):
    """Alert level in scanner_status.alerts[]."""

    WARNING = "warning"
    CRITICAL = "critical"


class AlertSource(StrEnum):
    """Alert source in scanner_status.alerts[]."""

    CPU_TEMP = "cpu_temp"
    THROTTLE = "throttle"
    MEMORY = "memory"
    DISK = "disk"
    SCANNER = "scanner"
    SCANNER_MEMORY = "scanner_memory"
    MODEM_4G = "modem_4g"
    GPS = "gps"
    WIFI = "wifi"
    ESP32 = "esp32"
    ESP32_FIRMWARE = "esp32_firmware"
    UPS = "ups"
    ENCLOSURE_TEMP = "enclosure_temp"
    BATTERY = "battery"
    BATTERY_LOW = "battery_low"
    BATTERY_THERMAL = "battery_thermal"
    BATTERY_SHUTDOWN = "battery_shutdown"
    SD_CARD = "sd_card"
    MQTT_PRIMARY = "mqtt_primary"
    MQTT_SECONDARY = "mqtt_secondary"
    MQTT_ALL = "mqtt_all"


class WifiBand(StrEnum):
    """wifi_interfaces[].band."""

    BAND_24 = "2.4GHz"
    BAND_5 = "5GHz"
    BLE = "BLE"
    DASH = "-"


class WifiRole(StrEnum):
    """wifi_interfaces[].role."""

    SEARCHER = "searcher"
    TRACKER = "tracker"
    HYBRID = "hybrid"
    SCANNER = "scanner"
    DASH = "-"


class WifiInterfaceStatus(StrEnum):
    """wifi_interfaces[].status."""

    OK = "ok"
    ERROR = "error"
    NO_FIRMWARE = "no_firmware"


class ScannerErrorType(StrEnum):
    """scanner_errors.error_type."""

    CRASH = "crash"
    WARNING = "warning"
    HARDWARE = "hardware"
    NETWORK = "network"
    WATCHDOG = "watchdog"
    CONFIG = "config"


class ScannerCommandAction(StrEnum):
    """scanner_commands.action."""

    REBOOT = "reboot"
    GPS_ENABLE = "gps_enable"
    GPS_DISABLE = "gps_disable"
    SET_MQTT_BROKER = "set_mqtt_broker"
    GET_LOGS = "get_logs"
    FIRMWARE_REFRESH = "firmware_refresh"
    FIRMWARE_UPGRADE = "firmware_upgrade"
    FIRMWARE_AUTO_UPDATE = "firmware_auto_update"
    SET_UPS_SOC_MAX = "set_ups_soc_max"


class CommandBrokerScope(StrEnum):
    """params.broker for mqtt/gps commands."""

    PRIMARY = "primary"
    SECONDARY = "secondary"
    BOTH = "both"


class CommandResponseStatus(StrEnum):
    """scanner_commands_response.status."""

    SUCCESS = "success"
    ERROR = "error"
    COMPLETED = "completed"


class GetLogsType(StrEnum):
    """get_logs params.type."""

    SCANNER = "scanner"
    ERRORS = "errors"
    WEB = "web"
    SYSTEM = "system"


class ChargingDisabledReason(StrEnum):
    """battery.charging_disabled_reason."""

    THERMAL = "thermal"
    SOC_MAX = "soc_max"


class BroadcastProtocol(StrEnum):
    """broadcast_protocol."""

    WIFI_BEACON = "WiFi-Beacon"
    WIFI_NAN = "WiFi-NaN"
    BLE_LEGACY = "BLE-Legacy"
    BLE_5_ADV_EXT_IND = "BLE-5-ADV_EXT_IND"
    BLE_5_CODED_PHY = "BLE-5-Coded-PHY"


class SignalType(StrEnum):
    """signal_type."""

    REMOTEID_EU = "RemoteID-EU"
    REMOTEID_USA = "RemoteID-USA"
    INFODRONE_FR = "Infodrone-FR"
    INFODRONE_ANSI = "Infodrone-ANSI"
    OCUSYNC = "OcuSync"


class DroneStatus(StrEnum):
    """droneStatus / flight_status."""

    UNDECLARED = "ODID_STATUS_UNDECLARED"
    GROUND = "ODID_STATUS_GROUND"
    AIRBORNE = "ODID_STATUS_AIRBORNE"
    EMERGENCY = "ODID_STATUS_EMERGENCY"
    REMOTE_ID_SYSTEM_FAILURE = "ODID_STATUS_REMOTE_ID_SYSTEM_FAILURE"


class IdType(StrEnum):
    """idType."""

    NONE = "ODID_IDTYPE_NONE"
    SERIAL_NUMBER = "ODID_IDTYPE_SERIAL_NUMBER"
    CAA_REGISTRATION_ID = "ODID_IDTYPE_CAA_REGISTRATION_ID"
    UTM_ASSIGNED_UUID = "ODID_IDTYPE_UTM_ASSIGNED_UUID"
    SPECIFIC_SESSION_ID = "ODID_IDTYPE_SPECIFIC_SESSION_ID"


class UaType(StrEnum):
    """uaType."""

    NONE = "ODID_UATYPE_NONE"
    AEROPLANE = "ODID_UATYPE_AEROPLANE"
    HELICOPTER_OR_MULTIROTOR = "ODID_UATYPE_HELICOPTER_OR_MULTIROTOR"
    GYROPLANE = "ODID_UATYPE_GYROPLANE"
    HYBRID_LIFT = "ODID_UATYPE_HYBRID_LIFT"
    ORNITHOPTER = "ODID_UATYPE_ORNITHOPTER"
    GLIDER = "ODID_UATYPE_GLIDER"
    KITE = "ODID_UATYPE_KITE"
    FREE_BALLOON = "ODID_UATYPE_FREE_BALLOON"
    CAPTIVE_BALLOON = "ODID_UATYPE_CAPTIVE_BALLOON"
    AIRSHIP = "ODID_UATYPE_AIRSHIP"
    FREE_FALL_PARACHUTE = "ODID_UATYPE_FREE_FALL_PARACHUTE"
    ROCKET = "ODID_UATYPE_ROCKET"
    TETHERED_POWERED_AIRCRAFT = "ODID_UATYPE_TETHERED_POWERED_AIRCRAFT"
    GROUND_OBSTACLE = "ODID_UATYPE_GROUND_OBSTACLE"
    OTHER = "ODID_UATYPE_OTHER"


class CategoryEU(StrEnum):
    """categoryEU."""

    UNDECLARED = "UNDECLARED"
    OPEN = "OPEN"
    SPECIFIC = "SPECIFIC"
    CERTIFIED = "CERTIFIED"


class ClassEU(StrEnum):
    """classEU."""

    UNDECLARED = "UNDECLARED"
    C0 = "C0"
    C1 = "C1"
    C2 = "C2"
    C3 = "C3"
    C4 = "C4"
    C5 = "C5"
    C6 = "C6"


class OperatorLocationType(StrEnum):
    """operator.location_type."""

    TAKEOFF = "TAKEOFF"
    LIVE_GNSS = "LIVE_GNSS"
    FIXED = "FIXED"


class OperatorClassificationType(StrEnum):
    """operator.classification_type."""

    UNDECLARED = "UNDECLARED"
    EU = "EU"
    CIVILIAN = "CIVILIAN"


def topic_subscription_status(prefix: str) -> str:
    """Wildcard subscription for all scanners status."""
    return f"{prefix}/+/status"


def topic_subscription_errors(prefix: str) -> str:
    """Wildcard subscription for all scanner errors."""
    return f"{prefix}/+/errors"


def topic_subscription_drone_data(prefix: str) -> str:
    """Wildcard subscription for all drones on all scanners."""
    return f"{prefix}/+/drones/+/data"


def topic_subscription_command_response(prefix: str) -> str:
    """Wildcard subscription for command responses."""
    return f"{prefix}/+/commands/response"


def topic_publish_command(prefix: str, scanner_id: str) -> str:
    """Topic to publish a command to one scanner."""
    return f"{prefix}/{scanner_id}/commands"
