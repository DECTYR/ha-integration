# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.3.2] - 2026-05-04

### Added
- WebSocket-based real-time updates for the Lovelace card. Subscribes
  to entity changes via `subscribe_entities` for sub-second updates with
  lower CPU footprint than polling.
- Rich drone cards with telemetry, operator info, EU classification
  (category and class), color-coded RSSI badge, and country flag.
- "Hide inactive" toggle in the card header to focus on currently
  broadcasting drones.
- Pulse animation when a new drone is detected (~2 seconds).
- Click on a drone card now fires a `dectyr-drone-clicked` event
  bubbling up the DOM (preparation for the upcoming live map view).
- Compact scanner status row at the top of the card with online state,
  CPU temperature, and UPS battery level.
- Two new coordinator tests covering the retain handling fix.

### Changed
- Card header now displays the official DECTYR logo (white circle with
  brand icon) instead of a generic radar icon.
- Drone cards are sorted live-first then alphabetically by Remote ID,
  giving a stable visual order that no longer flickers with RSSI ticks.
- Offline drone cards no longer display "unavailable" in operator,
  country, and EU classification fields. They show a single
  "Last seen X minutes ago" line for cleaner visuals.
- Telemetry line omits absent values (e.g. when direction is filtered
  as ODID sentinel 361, it disappears instead of showing "—").
- Card detects scanners and drones via `hass.devices` and `hass.entities`
  lookups based on the integration platform, not entity_id pattern
  matching.

### Fixed
- Critical: retained MQTT messages on broker reconnect no longer mark
  drones as "live". The coordinator now uses `min(payload_timestamp,
  utcnow())` for retained messages and skips retains older than the
  cached drone state. This fixes the pre-existing behavior where every
  HA restart would show all drones as live for 5 minutes regardless of
  whether they were actually broadcasting.
- Drone availability is now derived from `received_at` age compared to
  the inactivity timeout, not a flag forced to True at every merge.
- Multi-scanner drone fusion now uses `max(received_at)` so the most
  recent scanner observation drives the active state, not arbitrary
  merge order.

## [0.3.1] - 2026-05-04

### Fixed
- Release zip is now ~250 KB instead of 26 MB. Previous release zip
  inadvertently included `frontend/node_modules/` (TypeScript compiler,
  Rollup binaries, etc.) which made HACS installation download 100x more
  data than necessary.
- Build artifacts (TypeScript sources, npm metadata, Python caches) are
  excluded from the release zip; only the compiled JavaScript bundle
  ships with the integration.

## [0.3.0] - 2026-05-04

### Added
- **Custom Lovelace card** "Dectyr Surveillance" embedded in the integration.
  Auto-discovery of scanners and drones, no Lovelace configuration required.
  Add to your dashboard with `type: custom:dectyr-surveillance-card`.
- Multi-scanner distance tracking: each drone exposes per-scanner distances
  as sensor attributes for triangulation visualization.
- Friendly ODID aircraft type display in drone device titles
  (e.g. "Helicopter or multirotor" instead of raw enum value).
- Frontend bundle automatically built and shipped via the HACS release zip.

### Changed
- Drone device titles now include manufacturer prefix when available
  (e.g. "DJI Matrice 4T" instead of just "Matrice 4T").
- Drone subtitle line now shows the Remote ID serial when product model
  is available, avoiding duplicate model name display.
- Manufacturer is shown as the device title when product model is unknown,
  improving identification for non-standard broadcasts.

### Fixed
- HA frontend module loading: card registration now happens during
  `async_setup_entry` so the custom element is always available after
  integration setup.
- Frontend bundle is now versioned in Git so HACS-installed copies of the
  integration include the compiled card immediately.
- ODID enum surface improvements: type d'aéronef and Basic ID are now
  shown in user-friendly form instead of raw symbolic values.

### Tested
- Validated against real DECTYR RX-5 hardware with DJI Matrice 4T,
  Matrice 400, and Parrot ANAFI UKR live broadcasts.

## [0.2.10] - 2026-05-04

### Changed

- Device registry **Modèle** now always lists the friendly aircraft category
  **before** the product model when both are known (e.g.
  **Hélicoptère / Multirotor · Matrice 4T**). If `ua_type` is missing, only the
  product name is shown.

## [0.2.9] - 2026-05-04

### Fixed

- Drone **Modèle** in the device info panel again shows the product model from
  Remote ID (e.g. Matrice 4T). The model field no longer embeds the Basic ID;
  that value remains on **Numéro de série** only. Without a product name, the
  model falls back to the friendly aircraft category (ua_type).

## [0.2.8] - 2026-05-04

### Fixed

- Drone device titles without a product `model` in the payload now still
  prefix the manufacturer when known (e.g. **Parrot 1588E…** instead of
  **Drone 65db…** only).

## [0.2.7] - 2026-05-04

### Changed

- Drone device titles now prefix the manufacturer before the product model
  when both are known (e.g. **DJI Matrice 4T** instead of Matrice 4T alone).

## [0.2.6] - 2026-05-04

### Changed

- Drone device list subtitle now shows **aircraft type · serial / Basic ID**
  instead of repeating the product model (the title already shows the model
  name such as Matrice 4T).

## [0.2.5] - 2026-05-04

### Changed

- Drone devices in the integration device list now show a human-readable
  aircraft category (ODID `ua_type` in French or English according to the
  Home Assistant UI language) together with the product model, instead of the
  raw `ODID_UATYPE_*` string.
- Device serial / Basic ID in the registry prefers the broadcast
  `drone_id` from the MQTT payload when it differs from the topic id casing.

## [0.2.4] - 2026-05-04

### Added

- Drone ID is now exposed as the device serial number in Home Assistant's
  device info card (visible directly under "Informations Appareil").
- Two new diagnostic sensors per drone: Drone ID and MAC address.
- New diagnostic binary sensor: Multi-source detection (true when a drone
  is detected through multiple broadcast technologies simultaneously).

### Changed

- ODID enum fields (`id_type`, `ua_type`) now accept both numeric and
  symbolic values. Numeric values from real Remote ID hardware are
  automatically normalized to their symbolic form (e.g. "2" becomes
  ODID_IDTYPE_CAA_REGISTRATION_ID).
- When a drone is seen on multiple broadcast protocols or signal types,
  the full lists are exposed as attributes on the corresponding diagnostic
  sensors.

### Fixed

- ODID sentinel values for "unknown" data (altitude -1000.0, direction 361,
  horizontal/vertical speed 255.0 m/s) are now filtered out and reported as
  unavailable instead of being shown as literal numeric values in the UI.
- Real Remote ID hardware compatibility verified against DJI Matrice 4T
  and Matrice 400 broadcasts.

## [0.2.3] - 2026-05-04

### Changed

- All repository documentation switched to English: `README.md`, `info.md`,
  and all 3 automation blueprints (names, descriptions, notification titles
  and messages).

Note: The Home Assistant UI translations (`en.json` / `fr.json`) are unchanged.
French-speaking users still see the integration translated in their HA
language as before.

## [0.2.2] - 2026-05-04

### Changed

- Updated icon visual identity (DECTYR logo with white circle background) in
  `brand/` (`icon.png`, `icon@2x.png`) and root `icon.png`.

## [0.2.1] - 2026-05-03

### Added

- Local brand assets in `brand/` directory (icon and logo, 1x and 2x).
  Following Home Assistant 2026.3+ Brands Proxy API, custom integrations
  now ship their own brand images. Icons and logos appear in the HA UI
  without requiring a PR to the brands repository.

## [0.2.0] - 2026-05-02

### Added

- Auto-discovery of Dectyr RX-5 scanners via MQTT
- Auto-detection of drones with full telemetry (position, altitude, speed, RSSI, operator)
- Multi-scanner drone fusion
- Health monitoring (temperatures, UPS battery, GNSS, 4G, MQTT primary/secondary)
- Remote scanner control: reboot, firmware updates, log retrieval
- 3 services: send_command, clear_drone, export_drones
- 6 fired events for automations
- 3 blueprints (drone in zone, scanner alert, drone lost)
- French and English translations
- Diagnostics with PII redaction
- Repairs (MQTT required, long-offline scanner, unknown scanner publishing)

### Changed

- Replaced placeholder integration with full Dectyr RX-5 support

### Fixed

- (N/A — first real release)

## [0.1.0] - 2026-05-02

### Added

- Initial public scaffold: config flow, options flow, coordinator, placeholder status sensor.
- HACS metadata, GitHub Actions (hassfest, HACS validation, tests, release on tag).
