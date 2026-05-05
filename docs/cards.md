# Lovelace cards reference

The Dectyr RX-5 integration ships with two custom Lovelace cards.
Both auto-register when the integration starts.

## dectyr-surveillance-card

A rich list of all detected drones with telemetry, statistics
tiles, and scanner status.

### Card configuration

```yaml
type: custom:dectyr-surveillance-card
```

That's it — no configuration options. The card auto-discovers all
drones and scanners via the integration's `dectyr_rx5` device class.

### Layout

The card displays, top-down:

1. **Header**: integration logo, "Dectyr Surveillance" title, live
   counter ("X live · Y total"), and a "Hide inactive" toggle.
2. **Stat tiles**: 3 tiles showing the count of scanners, live
   drones, and total tracked drones.
3. **Scanner row**: compact list of scanners with status dot
   (green/gray), name, temperature, and battery percentage.
4. **Drone list**:
   - Live drones first, with rich telemetry cards (manufacturer,
     model, drone ID, altitude, speed, heading, operator info, EU
     classification, distance-to-scanner badge).
   - Offline drones below, in compact cards showing last-seen time.

### Distance-to-scanner badge color

The colored badge in the top-right corner of each live drone card
shows the distance to the nearest detecting scanner:

| Distance        | Color  | Meaning                         |
| --------------- | ------ | ------------------------------- |
| ≤ 250 m         | Red    | Close — priority surveillance   |
| 250 m – 500 m   | Orange | Intermediate range              |
| > 500 m         | Green  | Distant — passive surveillance  |
| Unknown         | Gray   | No distance available           |

## dectyr-map-card

A live Leaflet map showing all DECTYR entities in real time.

### Card configuration

```yaml
type: custom:dectyr-map-card
title: Surveillance — Live      # optional, default "Live Map"
aspect_ratio: '1:1'              # optional, e.g. '16:9', '1:1', '3:1'
height: 400                      # optional, height in pixels (overrides aspect_ratio)
```

All options are optional; with no configuration the card uses
sensible defaults (height 400 px, default title "Live Map").

#### Configuration options

| Option         | Type            | Default      | Description                                                |
| -------------- | --------------- | ------------ | ---------------------------------------------------------- |
| `title`        | string          | `Live Map`   | Card title shown in the header.                            |
| `aspect_ratio` | string \| number | (none)      | E.g. `'16:9'`, `'1:1'`, `'3:1'`, or `1.5`. Sets card height proportional to width. |
| `height`       | number          | `400`        | Height in pixels. Overrides `aspect_ratio` if both set.    |

### What's on the map

- **Home zone circle**: 100 m radius around your Home Assistant
  configured location.
- **Scanner markers** (radar parabolic icon, 36 px):
  - Green: scanner online
  - Gray: scanner offline
- **Drone markers** (airplane icon, 32 px, oriented by heading):
  - Live drones with GPS position from the Remote ID broadcast.
  - Click for popup: manufacturer, model, drone ID, altitude,
    speed, RSSI.
- **Operator markers** (orange pilot silhouette, 28 px):
  - Position of the controller as broadcast by Remote ID.
  - Click for popup: drone being controlled, operator ID.
- **Trail polylines**:
  - Last 30 minutes of drone trajectories, up to 30 points each.
  - Color matches the drone marker.

### Interactions

- Click any marker to open its popup.
- Pan/zoom with mouse, touch, or the +/− controls.
- Markers update in real time as new MQTT messages arrive
  (typically every 1–2 seconds for live drones).

### Sizing the card

Three independent levers, in order of priority:

1. **`height`** (pixels): hard fixed height, ignores card width.
2. **`aspect_ratio`**: card height = card width / ratio. The card
   adapts to its container width.
3. **`grid_options.rows`** (HA-side, in Sections-style views): one
   row ≈ 50 px. E.g. `rows: 8` ≈ 400 px tall.

If you want a tall, square card on a 4-column layout:

```yaml
type: custom:dectyr-map-card
aspect_ratio: '1:1'
grid_options:
  columns: 4
  rows: 8
```

If you want a wide cinematic banner:

```yaml
type: custom:dectyr-map-card
aspect_ratio: '21:9'
grid_options:
  columns: 12
  rows: 4
```

## Recommended dashboard

A 1/3 list + 2/3 map layout works well on desktop:

```yaml
type: sections
max_columns: 12
sections:
  - type: grid
    cards:
      - type: custom:dectyr-surveillance-card
        grid_options:
          columns: 4
          rows: 8
      - type: custom:dectyr-map-card
        title: Surveillance — Live
        aspect_ratio: '1:1'
        grid_options:
          columns: 8
          rows: 8
```

For mobile, stack vertically and use full-width cards:

```yaml
type: sections
max_columns: 4
sections:
  - type: grid
    cards:
      - type: custom:dectyr-surveillance-card
      - type: custom:dectyr-map-card
        aspect_ratio: '4:3'
```

## Troubleshooting

### The map shows a circle but no drone or scanner markers

- Check that drones are being detected (live count in the
  surveillance card > 0).
- Drones must have a valid GPS position from their Remote ID
  broadcast. Drones without a position fix won't appear.
- Scanners without GPS (`gps_enabled: false`) don't have a
  device_tracker position. They are not displayed on the map by
  default. To work around this, configure scanner positions
  manually (planned in a future release).

### Tiles fail to load with HTTP 429

- OpenStreetMap rate-limits to ~2 tiles/second per IP. If you have
  the card open in many tabs or with rapid map re-instantiation,
  you may briefly hit the limit.
- Wait 1–2 minutes; tiles will reload normally.

### The "live map" component (legacy) appears broken

The previous embedded map widget (`<dectyr-live-map>` inside the
surveillance card) is no longer used since v1.1.0. The new
`dectyr-map-card` replaces it. Make sure your dashboard YAML
references `custom:dectyr-map-card` and not the legacy widget.
