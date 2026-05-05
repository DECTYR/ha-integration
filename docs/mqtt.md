# MQTT reference

Topics and JSON shapes consumed by the **Dectyr RX-5** Home Assistant integration.
Useful for debugging, third-party subscribers, or verifying scanner behaviour.

Default topic prefix: **`dronedetector`** (configurable per integration entry).

## Topics used by this integration

The integration subscribes only to the patterns below (`const.py` / `mqtt_client.py`):

| Pattern | Direction | Purpose |
| --- | --- | --- |
| `{prefix}/+/status` | Scanner → HA | Full scanner status (telemetry, GNSS, LTE, battery, firmware, alerts) |
| `{prefix}/+/errors` | Scanner → HA | Scanner error / offline payloads |
| `{prefix}/+/drones/+/data` | Scanner → HA | Remote ID drone observation (one topic per `drone_id`) |
| `{prefix}/+/commands/response` | Scanner → HA | Acknowledgement / result for commands |

Commands are **published** by HA to:

| Topic | Direction |
| --- | --- |
| `{prefix}/{scanner_id}/commands` | HA → Scanner |

> Scanners or vendor tools may expose **additional** MQTT topics (e.g. diagnostics).
> Those are **not** wired into this integration unless listed above.

### Topic parsing rules

- **Scanner ID** is the segment between `{prefix}` and the message kind, e.g.
  `dronedetector/<scanner_id>/status`.
- **Drone ID** is the fourth segment in `dronedetector/<scanner_id>/drones/<drone_id>/data`.

## Status payload (`…/status`)

Published periodically (typ. ~30 s). Example structure (**anonymized** placeholders):

```json
{
  "scanner_id": "a1b2c3d4e5f67890",
  "status": "online",
  "timestamp": "2026-05-05T12:01:43.055Z",
  "uptime_seconds": 15194,
  "connection_type": "ethernet",
  "ip_address": "192.0.2.10",
  "mac_address": "AA:BB:CC:DD:EE:01",
  "mqtt_latency_ms": 23.3,
  "temperatures": {
    "cpu": 48.0,
    "pmic": 44.7,
    "rp1": 52.0,
    "enclosure": 21.8
  },
  "system": {
    "cpu_percent": 8.5,
    "memory_used_mb": 1054,
    "memory_total_mb": 2011,
    "mqtt_broker": "mqtt.example.com:8883",
    "mqtt_connected": true,
    "mqtt_tls": true,
    "mqtt_tls_verified": true,
    "mqtt_last_seen": "2026-05-05T07:48:28Z",
    "mqtt_secondary_broker": "192.0.2.20:1883",
    "mqtt_secondary_connected": true,
    "mqtt_secondary_tls": false,
    "mqtt_secondary_tls_verified": true,
    "mqtt_secondary_last_seen": "2026-05-05T07:48:28Z",
    "mqtt_secondary_error": null
  },
  "wifi_interfaces": [],
  "lte": {
    "available": true,
    "force_off": false,
    "imei": "350000000000000",
    "connected": false,
    "iccid": "89000000000000000000",
    "signal_percent": null,
    "operator": null,
    "technology": null
  },
  "gps_enabled": true,
  "gnss": {
    "available": true,
    "enabled": true,
    "has_fix": true,
    "hdop": 1.0,
    "satellites": 12,
    "satellites_in_view": 25,
    "latitude": 43.56349,
    "longitude": 7.13623,
    "altitude": 44.3,
    "speed": 0.0,
    "heading": 125.3,
    "fix_quality": 1,
    "gps_utc": "2026-05-05T12:01:43Z",
    "updated_at": "2026-05-05T12:01:44Z"
  },
  "battery": {
    "available": true,
    "voltage": 4.024,
    "soc": 79.8,
    "ac_power": true,
    "charging": false,
    "no_battery": false,
    "soc_max": 80,
    "charging_disabled_reason": "soc_max"
  },
  "firmware": {
    "version": "1.2.0",
    "auto_update": false,
    "update_available": false,
    "update_version": "",
    "update_server_connected": true
  },
  "watchdog_network": true,
  "alerts": []
}
```

Shape derived from a live scanner capture; IDs and addresses are placeholders.

## Drone payload (`…/drones/<drone_id>/data`)

Each message carries one observation. Minimal **illustrative** JSON (fields vary by Remote ID profile):

```json
{
  "scanner_id": "a1b2c3d4e5f67890",
  "timestamp": "2026-05-05T08:42:13Z",
  "mac": "AA:BB:CC:DD:EE:FF",
  "drone_id": "1581f7k3c251ce54a155",
  "broadcast_protocol": "WiFi-Beacon",
  "signal_type": "RemoteID-EU",
  "rssi": -32,
  "complete": true,
  "multi_source": false,
  "channel": 6,
  "latitude": 43.5641,
  "longitude": 7.1365,
  "altitude_msl": 67,
  "height_agl": 45,
  "speed_horizontal": 14.8,
  "speed_vertical": 0.5,
  "direction": 172,
  "flight_status": "ODID_STATUS_AIRBORNE",
  "distance_to_scanner": 1100,
  "operator_id": "OPxxxxxxxx",
  "operator_country": "FRA",
  "self_id": "Example mission ID",
  "manufacturer": "DJI",
  "model": "Example model"
}
```

Required fields for parsing (`Drone.from_drone_payload`) include at least:
`scanner_id`, `timestamp`, `mac`, `broadcast_protocol`, `signal_type`, `rssi` (int),
and `complete` (bool). Optional fields populate sensors and trackers when present.

## Command topic (`…/commands`)

HA publishes:

```json
{
  "request_id": "550e8400-e29b-41d4-a716-446655440000",
  "action": "reboot",
  "params": null
}
```

Common `action` values: `reboot`, `gps_enable`, `gps_disable`, `get_logs`,
`firmware_refresh`, `firmware_upgrade`, `firmware_auto_update`, `set_ups_soc_max`,
`set_mqtt_broker`. Use the **`dectyr_rx5.send_command`** service or entity buttons —
do not craft payloads manually unless you mirror `ScannerCommand` in `models.py`.

## Command response (`…/commands/response`)

```json
{
  "request_id": "550e8400-e29b-41d4-a716-446655440000",
  "scanner_id": "a1b2c3d4e5f67890",
  "action": "reboot",
  "status": "success",
  "message": "Reboot scheduled",
  "timestamp": "2026-05-05T08:42:13Z",
  "data": null
}
```

`status` uses `success`, `error`, or `completed` (`CommandResponseStatus`).
Log downloads may include a `data` object with `type`, `lines`, `content`.

## Discovery & deduplication

1. First payload on `{prefix}/+/status` for a new `scanner_id` creates the scanner device.
2. First `{prefix}/+/drones/+/data` for a new `drone_id` creates the drone device and fires
   `dectyr_rx5_drone_detected`.
3. Multiple scanners observing the same drone are **merged** in the coordinator:
   per-scanner RSSI and distances are kept in attributes; the main
   `drone_distance_to_scanner` state follows the **strongest RSSI** source
   (`primary_distance_to_scanner`).

## Debugging

```bash
# All traffic for one scanner
mosquitto_sub -h <broker> -p 1883 \
  -t "dronedetector/<scanner_id>/#" -v

# Pretty-print one status message
mosquitto_sub -h <broker> -p 1883 \
  -t "dronedetector/+/status" -C 1 | python3 -m json.tool
```

Implementation entry points: `custom_components/dectyr_rx5/coordinator.py`,
`custom_components/dectyr_rx5/mqtt_client.py`, `custom_components/dectyr_rx5/models.py`.
