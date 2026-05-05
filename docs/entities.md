# Entities reference

The Dectyr RX-5 integration exposes **77 logical entities** (translation keys)
across scanners and drones. Scanner devices receive the scanner-side entities;
each detected drone gets its own device with the drone-side keys.

Values are parsed from MQTT payloads documented in [mqtt.md](mqtt.md).
Units match Home Assistant entity definitions in `sensor_definitions.py` and
`binary_sensor_definitions.py`.

## Table of contents

- [Scanner entities](#scanner-entities)
  - [Status & connectivity](#status--connectivity)
  - [Hardware monitoring](#hardware-monitoring)
  - [GNSS & position](#gnss--position)
  - [Cellular (LTE)](#cellular-lte)
  - [Battery & power](#battery--power)
  - [Firmware](#firmware)
  - [Alerts](#alerts)
  - [Buttons](#buttons)
  - [Switches](#switches)
  - [Number](#number)
- [Drone entities](#drone-entities)
  - [Position & motion](#position--motion)
  - [Identification](#identification)
  - [Operator](#operator)
  - [Detection metadata](#detection-metadata)

---

## Scanner entities

Scanners appear when a JSON payload arrives on `{prefix}/{scanner_id}/status`.

### Status & connectivity

| Key | Type | Unit | MQTT / source | Example |
| --- | --- | --- | --- | --- |
| `scanner_online` | binary_sensor | — | `status` (`online` / `offline`) | on |
| `scanner_status` | sensor | — | `status` (enum) | `online` |
| `scanner_uptime` | sensor | s | `uptime_seconds` | `15194` |
| `scanner_connection_type` | sensor | — | `connection_type` | `ethernet` |
| `scanner_mqtt_primary_connected` | binary_sensor | — | `system.mqtt_connected` | on |
| `scanner_mqtt_secondary_connected` | binary_sensor | — | `system.mqtt_secondary_connected` | on |
| `scanner_mqtt_secondary_error` | sensor | — | `system.mqtt_secondary_error` | *(string or empty)* |
| `scanner_mqtt_latency` | sensor | ms | `mqtt_latency_ms` | `23.3` |

### Hardware monitoring

| Key | Type | Unit | MQTT / source | Example |
| --- | --- | --- | --- | --- |
| `scanner_cpu_percent` | sensor | % | `system.cpu_percent` | `8.5` |
| `scanner_cpu_temperature` | sensor | °C | `temperatures.cpu` | `48.0` |
| `scanner_pmic_temperature` | sensor | °C | `temperatures.pmic` | `44.7` |
| `scanner_rp1_temperature` | sensor | °C | `temperatures.rp1` | `52.0` |
| `scanner_enclosure_temperature` | sensor | °C | `temperatures.enclosure` | `21.8` |
| `scanner_memory_used` | sensor | MB | `system.memory_used_mb` | `1054` |
| `scanner_memory_total` | sensor | MB | `system.memory_total_mb` | `2011` |
| `scanner_restart_count` | sensor | — | `restart_count` | `3` |

### GNSS & position

| Key | Type | Unit | MQTT / source | Example |
| --- | --- | --- | --- | --- |
| `scanner_gnss_has_fix` | binary_sensor | — | `gnss.has_fix` | on |
| `scanner_gnss_satellites` | sensor | — | `gnss.satellites` | `12` |
| `scanner_gnss_satellites_in_view` | sensor | — | `gnss.satellites_in_view` | `25` |
| `scanner_gnss_hdop` | sensor | — | `gnss.hdop` | `1.0` |
| `scanner_gnss_fix_quality` | sensor | — | `gnss.fix_quality` (mapped to enum) | `gnss` |
| `scanner_position` | device_tracker | — | `gnss.latitude`, `gnss.longitude` | *(lat/lon state)* |

> If GNSS is disabled (`gps_enabled: false` or `gnss.enabled: false`), fix and
> position entities reflect unavailable / placeholder values.

### Cellular (LTE)

| Key | Type | Unit | MQTT / source | Example |
| --- | --- | --- | --- | --- |
| `scanner_lte_connected` | binary_sensor | — | `lte.connected` | off |
| `scanner_lte_signal` | sensor | % | `lte.signal_percent` | `72` |
| `scanner_lte_operator` | sensor | — | `lte.operator` | `Orange` |
| `scanner_lte_technology` | sensor | — | `lte.technology` | `4G` |
| `scanner_lte_imei` | sensor | — | `lte.imei` | `35XXXXXXXXXXXX` |
| `scanner_lte_iccid` | sensor | — | `lte.iccid` | `89XXXXXXXXXXXXXX` |

### Battery & power

| Key | Type | Unit | MQTT / source | Example |
| --- | --- | --- | --- | --- |
| `scanner_ac_power` | binary_sensor | — | `battery.ac_power` | on |
| `scanner_charging` | binary_sensor | — | `battery.charging` | off |
| `scanner_battery_voltage` | sensor | V | `battery.voltage` | `4.024` |
| `scanner_battery_soc` | sensor | % | `battery.soc` | `79.8` |

### Firmware

| Key | Type | Unit | MQTT / source | Example |
| --- | --- | --- | --- | --- |
| `scanner_firmware_version` | sensor | — | `firmware.version` | `1.2.0` |
| `scanner_firmware_update_version` | sensor | — | `firmware.update_version` | *(empty if none)* |
| `scanner_firmware_update_available` | binary_sensor | — | `firmware.update_available` | off |

### Alerts

| Key | Type | Unit | MQTT / source | Example |
| --- | --- | --- | --- | --- |
| `scanner_alerts_count` | sensor | — | length of `alerts[]` | `0` |
| `scanner_last_alert_message` | sensor | — | derived from `alerts[]` | *(first/critical text)* |
| `scanner_has_critical_alert` | binary_sensor | — | `alerts[].level` | off |
| `scanner_has_warning_alert` | binary_sensor | — | `alerts[].level` | off |
| `scanner_watchdog_network_active` | binary_sensor | — | `watchdog_network` | on |

### Buttons

| Key | Action (MQTT command) |
| --- | --- |
| `scanner_reboot` | `reboot` |
| `firmware_check_update` | `firmware_upgrade` |
| `firmware_refresh` | `firmware_refresh` |
| `get_scanner_logs` | `get_logs` + `params.type: scanner` |
| `get_system_logs` | `get_logs` + `params.type: system` |
| `get_error_logs` | `get_logs` + `params.type: errors` |
| `get_web_logs` | `get_logs` + `params.type: web` |

### Switches

| Key | State source | Command |
| --- | --- | --- |
| `gnss_publish` | `gnss.enabled` or `gps_enabled` | `gps_enable` / `gps_disable` (+ broker scope) |
| `firmware_auto_update` | `firmware.auto_update` | `firmware_auto_update` + `{enabled: bool}` |

### Number

| Key | Unit | State source | Command |
| --- | --- | --- | --- |
| `ups_soc_max` | % | `battery.soc_max` | `set_ups_soc_max` + `{soc_max: int}` |

---

## Drone entities

Drone entities are created from `{prefix}/{scanner_id}/drones/{drone_id}/data`
payloads. After multi-scanner fusion, attributes may aggregate several scanners
(`detected_by_count`, `distance_by_scanner`, etc.).

### Position & motion

| Key | Type | Unit | MQTT field | Example |
| --- | --- | --- | --- | --- |
| `drone_position` | device_tracker | — | `latitude`, `longitude` | `not_home` |
| `drone_altitude_msl` | sensor | m | `altitude_msl` | `67.0` |
| `drone_altitude_agl` | sensor | m | `height_agl` | `45.0` |
| `drone_speed_horizontal` | sensor | m/s | `speed_horizontal` | `14.8` |
| `drone_speed_vertical` | sensor | m/s | `speed_vertical` | `0.5` |
| `drone_direction` | sensor | ° | `direction` | `172` |
| `drone_airborne` | binary_sensor | — | `flight_status` | on |
| `drone_emergency` | binary_sensor | — | `flight_status` | off |
| `drone_flight_status` | sensor | — | `flight_status` (enum) | `ODID_STATUS_AIRBORNE` |

### Identification

| Key | Type | Unit | MQTT field | Example |
| --- | --- | --- | --- | --- |
| `drone_id` | sensor | — | topic segment / `drone_id` | `1581f7k3c251ce54a155` |
| `drone_id_type` | sensor | — | `id_type` | `serial_number` |
| `drone_signal_type` | sensor | — | `signal_type` | `RemoteID-EU` |
| `drone_broadcast_protocol` | sensor | — | `broadcast_protocol` | `WiFi-Beacon` |
| `drone_channel` | sensor | — | `channel` | `6` |
| `drone_ua_type` | sensor | — | `ua_type` | `aircraft` |
| `drone_category_eu` | sensor | — | `operator.category_eu` | `open` |
| `drone_class_eu` | sensor | — | `operator.class_eu` | `C1` |
| `drone_self_id` | sensor | — | `self_id` | `Mission text` |
| `mac_address` | sensor | — | `mac` | `AA:BB:CC:DD:EE:FF` |

### Operator

| Key | Type | Unit | MQTT field | Example |
| --- | --- | --- | --- | --- |
| `operator_position` | device_tracker | — | `operator.latitude`, `operator.longitude` *(nested)* | — |
| `drone_operator_id` | sensor | — | `operator_id` | `FRA6m1wprcfzsb2n` |
| `drone_operator_country` | sensor | — | `operator_country` | `FRA` |

### Detection metadata

| Key | Type | Unit | MQTT / source | Example |
| --- | --- | --- | --- | --- |
| `drone_rssi` | sensor | dBm | `rssi` | `-32` |
| `drone_distance_to_scanner` | sensor | m | `distance_to_scanner` *(per-message; fused in coordinator)* | `1100` |
| `drone_last_seen` | sensor | — | `timestamp` / internal `received_at` | ISO datetime |
| `drone_detected_by_count` | sensor | — | count of `detected_scanners` | `2` |
| `drone_multi_source` | binary_sensor | — | `multi_source` | on |

---

## Notes

- All entities use `translation_key` and ship with **English** and **French**
  strings (`translations/en.json`, `translations/fr.json`).
- Browse devices under **Settings → Devices & services → Dectyr RX-5**.
- New drones appear on first MQTT `data` message and persist in the integration
  store across restarts.
