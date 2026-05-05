# Dectyr RX-5 for Home Assistant — passive UAV Remote ID detection

[![HACS Validate / hassfest](https://github.com/alexandre0thomas/ha-dectyr/actions/workflows/validate.yml/badge.svg)](https://github.com/alexandre0thomas/ha-dectyr/actions/workflows/validate.yml)
[![Tests](https://github.com/alexandre0thomas/ha-dectyr/actions/workflows/test.yml/badge.svg)](https://github.com/alexandre0thomas/ha-dectyr/actions/workflows/test.yml)
[![GitHub release](https://img.shields.io/github/v/release/alexandre0thomas/ha-dectyr?sort=semver)](https://github.com/alexandre0thomas/ha-dectyr/releases)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

The **[DECTYR RX-5](https://dectyr.com/en/products/rx-5)** is a **passive RF**
field scanner for **UAV detection**, **UAS Remote ID**, and **broadcast drone
telemetry**—it listens for **Wi‑Fi Beacon / NaN** and **Bluetooth** (legacy and
long range) without transmitting on those bands. It suits **airspace awareness**,
site security, and **Remote ID** compliance in **France**, the **EU**, the
**USA**, **Japan**, and **Singapore**. **Manufacturer specifications** include **up to
~5 km** line‑of‑sight range, **IP67** ingress protection, **4G and Ethernet**
backhaul, and about **5 hours** of onboard **UPS** for resilient outdoor
installs.

This repository is the **Home Assistant** custom integration for the RX‑5: your
MQTT broker feeds native **devices** and **sensors** for each scanner and
**unmanned aerial vehicle** tracking, with **live maps**, **multi‑scanner** fusion,
**operator** metadata when broadcast, **geofencing** via Home Assistant **zones**,
and automations for **UAV** incursions on your own stack.

## Features

- MQTT auto-discovery for all your Dectyr detectors
- Each detected drone is created automatically as a Home Assistant **device**
- Native **map** card with scanners and drones in real time
- Full telemetry: position, altitude, speed, heading, RSSI, operator
- Scanner health: temperatures, UPS battery, GNSS, LTE, MQTT
- Remote scanner control from the UI: reboot, firmware updates, log retrieval
- Native geofencing: use Home Assistant **zones** to drive automations
- Multi-scanner: automatic merge when several detectors see the same drone
- Three ready-to-import **automation blueprints** (zone entry, critical alert,
  signal loss)

## Requirements

### Home Assistant

- **2024.1** or newer (Core + Supervisor or Container; any supported install type).

### MQTT broker

The integration is **MQTT-only**. You need a working **MQTT broker** that both
Home Assistant and every **DECTYR RX-5** scanner can reach (same logical broker,
not necessarily the same LAN).

Typical setups:

| Item | What to decide |
| --- | --- |
| **Software** | [Eclipse Mosquitto](https://mosquitto.org/) (add-on on Home Assistant OS, Docker, or package on a NAS/VM), **EMQX**, **HiveMQ**, a **managed cloud** broker, etc. |
| **Host & port** | e.g. `mqtt.home.local` and **1883** (plain) or **8883** (**TLS**). |
| **Authentication** | Create a **username/password** for clients; avoid anonymous access on exposed brokers. |
| **Access control** | Allow the RX-5 and Home Assistant to **connect**, **subscribe**, and **publish** on the topic tree you use (see prefix below). |
| **TLS / certificates** | If you use TLS, install the **same CA** (or public chain) on the scanner and ensure HA’s MQTT integration uses **TLS** with matching **verify** options. |

The RX-5 must be configured in its own UI or documentation to use **this broker**
(host, port, TLS, credentials). Home Assistant must use the **same broker** via
its MQTT integration—otherwise it will never see scanner or drone messages.

### Home Assistant MQTT integration (mandatory)

1. In Home Assistant go to **Settings → Devices & services → + Add integration**.
2. Choose **MQTT**.
3. Enter your broker **Broker** (hostname or IP), **Port**, and if required
   **Username**, **Password**, and **TLS** options (CA, client cert, etc.).
4. Save and confirm the integration shows **Connected** (check **Settings →
   Devices & services → MQTT → Configure** or the integration card).

The **Dectyr RX-5** integration **refuses to start** until at least one MQTT
config entry is **loaded** (you would see an abort reason such as **MQTT
required** if you skip this step).

### MQTT topic prefix (must match the scanners)

When you add the Dectyr integration you enter the **MQTT prefix** (factory-style
default **`dronedetector`**). It must **exactly** match the root prefix configured
on each RX-5 so that topics line up, for example:

- `{prefix}/{scanner_id}/status` — scanner online / health
- `{prefix}/{scanner_id}/drones/{drone_id}/data` — drone telemetry
- `{prefix}/{scanner_id}/errors` — scanner errors
- `{prefix}/{scanner_id}/commands` (+ `…/response`) — remote commands

Allowed characters in the prefix: letters, digits, **`_`**, **`/`**, and **`-`**
(no spaces). Multi-segment prefixes such as `org/site1` are supported.

If the prefix is wrong, Home Assistant will stay **empty of Dectyr devices**
even though MQTT works for other clients.

### Optional: integration options (after setup)

Under **Settings → Devices & services → Dectyr RX-5 → Configure**, you can tune
(all values are seconds unless noted):

| Option | Default (seconds) | Role |
| --- | ---: | --- |
| **Drone inactivity timeout** | `300` | How long without drone telemetry before a drone is marked unavailable. |
| **Drone purge after** | `86400` | How long before a stale drone is removed from the registry. |
| **Scanner offline timeout** | `60` | How long without scanner status before treating the scanner as offline. |
| **Command timeout** | `30` | Max wait for MQTT command responses (reboot, logs, etc.). |
| **Unknown scanner warning** | on | Issue registry warning if a scanner publishes before you have a retained **status** for it. |

### What you still configure on the hardware

RX-5 **Wi‑Fi / 4G / Ethernet**, **MQTT broker URL**, **TLS**, **credentials**, and
the **same topic prefix** as in Home Assistant are all set on the device (or via
vendor tooling)—see **Dectyr** product documentation for the exact menus.

## Installation

### Via HACS (recommended)

1. HACS &rarr; **Integrations** &rarr; **&vellip;** menu &rarr; **Custom repositories**
2. URL: `https://github.com/alexandre0thomas/ha-dectyr`
3. Category: **Integration**
4. Click **Add**
5. Find **Dectyr RX-5** in HACS and install
6. Restart Home Assistant
7. **Settings &rarr; Devices & services &rarr; + Add integration** &rarr; **Dectyr RX-5**
   (only after the **MQTT** integration is connected).
8. Enter the MQTT **prefix** (default `dronedetector`). It must **match** the
   prefix configured on each RX-5 (see **Requirements**).

### Manual installation

1. Copy `custom_components/dectyr_rx5/` into `<config>/custom_components/`
2. Restart Home Assistant, then follow steps 7+ above.

## Scanner configuration

On each RX-5, point **MQTT** to the **same broker** as Home Assistant and use the
**same prefix** as in **Requirements** above. For field menus, certificates, and
cellular backhaul, follow **Dectyr** device documentation or vendor support.

## Lovelace cards

### Dectyr Surveillance card (`dectyr-surveillance-card`)

The integration ships a **custom Lovelace card** bundled as
`frontend/dist/dectyr-surveillance-card.js`. After you add the **Dectyr RX-5**
integration and **reload the UI** (or restart Home Assistant), the module is
registered automatically so dashboards can use:

```yaml
type: custom:dectyr-surveillance-card
```

If you still see **Custom element not found**, confirm the file exists under
`custom_components/dectyr_rx5/frontend/dist/` in your config (HACS / git copies
must include it). As a fallback, add a **Dashboard resource**: **Settings →
Dashboards → ⋮ → Resources → + Add resource** → URL
`/dectyr_rx5_static/dectyr-surveillance-card.js`, type **JavaScript module**, then
**Reload** the dashboard.

Developers can rebuild the bundle with `npm ci && npm run build` inside
`custom_components/dectyr_rx5/frontend`.

### Map card (scanners and drones)

Replace **entities** with your own (from the **Device tracker** list for Dectyr
devices):

```yaml
type: map
entities:
  - entity: device_tracker.dectyr_rx5_scanner_example_scanner_position
  - entity: device_tracker.dectyr_rx5_drone_example_drone_position
  - entity: device_tracker.dectyr_rx5_drone_example_operator_position
hours_to_show: 4
auto_fit: true
```

### Scanner alerts (Markdown)

Example **Markdown** card using the last alert **entity**:

```yaml
type: markdown
title: Dectyr alerts
content: |
  **Last message:** {{ states('sensor.dectyr_rx5_scanner_example_last_alert_message') }}
  **Active alerts:** {{ states('sensor.dectyr_rx5_scanner_example_alerts_count') }}
```

### Detected drones (summary card)

```yaml
type: entities
title: Detected drones
entities:
  - entity: sensor.dectyr_rx5_drone_example_flight_status
  - entity: sensor.dectyr_rx5_drone_example_altitude_msl
  - entity: sensor.dectyr_rx5_drone_example_rssi
```

## Services

### `dectyr_rx5.send_command`

Publishes an MQTT command to the scanner and waits for the response.

```yaml
service: dectyr_rx5.send_command
data:
  device_id: abc123def4567890abcdef4567890ab
  action: reboot
  params: {}
response_variable: cmd_result
```

### `dectyr_rx5.clear_drone`

Removes a drone from the integration registry and the device registry.

```yaml
service: dectyr_rx5.clear_drone
data:
  device_id: drone_device_id_here
```

### `dectyr_rx5.export_drones`

Returns the list of known drones (**service response**).

```yaml
service: dectyr_rx5.export_drones
data:
  include_inactive: false
response_variable: drones_export
```

## Events

| Event | Short description |
| --- | --- |
| `dectyr_rx5_drone_detected` | New drone (includes `latitude`, `longitude`, `manufacturer`, `model`, `payload`) |
| `dectyr_rx5_drone_lost` | Drone inactive (telemetry timeout) |
| `dectyr_rx5_drone_purged` | Drone removed after extended inactivity |
| `dectyr_rx5_scanner_alert` | Scanner critical alert |
| `dectyr_rx5_scanner_error` | Error payload on the errors topic |
| `dectyr_rx5_logs_received` | Logs returned by `get_logs` |

Example **trigger**:

```yaml
trigger:
  - platform: event
    event_type: dectyr_rx5_drone_detected
```

## Blueprints

Files live under `custom_components/dectyr_rx5/blueprints/automation/dectyr_rx5/`:

- [`notify_drone_in_zone.yaml`](https://github.com/alexandre0thomas/ha-dectyr/blob/main/custom_components/dectyr_rx5/blueprints/automation/dectyr_rx5/notify_drone_in_zone.yaml) &mdash; notify when a drone enters a zone
- [`notify_scanner_critical_alert.yaml`](https://github.com/alexandre0thomas/ha-dectyr/blob/main/custom_components/dectyr_rx5/blueprints/automation/dectyr_rx5/notify_scanner_critical_alert.yaml) &mdash; scanner critical alert
- [`notify_drone_lost.yaml`](https://github.com/alexandre0thomas/ha-dectyr/blob/main/custom_components/dectyr_rx5/blueprints/automation/dectyr_rx5/notify_drone_lost.yaml) &mdash; drone signal loss

In Home Assistant: **Settings &rarr; Automations & scenes &rarr; Blueprints &rarr;
Import blueprint**, then paste the raw GitHub URL of the YAML you want.

## Troubleshooting

- No drones appear &rarr; verify MQTT (**Settings &rarr; Devices & services &rarr;
  MQTT &rarr; Configure**), then listen on `dronedetector/#` or your custom prefix.
- A drone disappears too quickly &rarr; increase `drone_inactivity_timeout` in the
  integration **options**.
- Verbose logging in `configuration.yaml`:

```yaml
logger:
  logs:
    custom_components.dectyr_rx5: debug
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

MIT &mdash; see [LICENSE](LICENSE).
