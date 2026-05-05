# Automation examples

This document summarizes the **three blueprints** shipped with the integration
and provides **manual automation** examples you can paste into YAML or the UI editor.

## Shipped blueprints

After installation, import them from **Settings → Automations & scenes → Blueprints**.

### Dectyr — Notify when a drone is detected in a zone

**File:** `notify_drone_in_zone.yaml`

Fires on `dectyr_rx5_drone_detected` and notifies only if the drone coordinates
fall inside a selected Home Assistant **zone** (restricted perimeter, garden, etc.).

### Dectyr — Notify on drone signal loss

**File:** `notify_drone_lost.yaml`

Triggers on `dectyr_rx5_drone_lost` when a drone disappears after the integration’s
inactivity timeout. Message includes last seen time and scanners involved.

### Dectyr — Notify on scanner critical alert

**File:** `notify_scanner_critical_alert.yaml`

Triggers on `dectyr_rx5_scanner_alert` when a scanner reports a **critical** alert
(temperature, battery, MQTT, etc.).

## Manual automation examples

### Example 1: Alert when drone is too close

Notify when any live drone distance sensor crosses below **250 m**.

```yaml
alias: "Drone close-range alert"
description: Alert when ANY drone is detected within 250m of a scanner
trigger:
  - platform: event
    event_type: state_changed
condition:
  - condition: template
    value_template: >
      {{ trigger.event.data.entity_id is defined
         and trigger.event.data.new_state is not none
         and trigger.event.data.new_state.attributes.translation_key
            == 'drone_distance_to_scanner'
         and trigger.event.data.new_state.state not in ['unknown', 'unavailable']
         and trigger.event.data.new_state.state | float(999999) < 250
         and (trigger.event.data.old_state is none
              or trigger.event.data.old_state.state in ['unknown', 'unavailable']
              or trigger.event.data.old_state.state | float(999999) >= 250) }}
action:
  - service: notify.mobile_app_alex_phone
    data:
      title: ⚠️ Drone close-range
      message: >
        {{ state_attr(trigger.event.data.entity_id, 'friendly_name') }}
        is now {{ trigger.event.data.new_state.state }}m from scanner
      data:
        priority: high
mode: parallel
max: 50
```

**Option with color tiers (250 m / 500 m):**

```yaml
alias: "Drone proximity alert (3 thresholds)"
description: Alert at 250m (critical), 500m (warning), 1000m (info)
trigger:
  - platform: event
    event_type: state_changed
condition:
  - condition: template
    value_template: >
      {{ trigger.event.data.entity_id is defined
         and trigger.event.data.new_state is not none
         and trigger.event.data.new_state.attributes.translation_key
            == 'drone_distance_to_scanner'
         and trigger.event.data.new_state.state not in ['unknown', 'unavailable'] }}
action:
  - variables:
      drone_name: "{{ state_attr(trigger.event.data.entity_id, 'friendly_name') }}"
      distance: "{{ trigger.event.data.new_state.state | float(999999) }}"
      old_distance: >
        {% if trigger.event.data.old_state is none
              or trigger.event.data.old_state.state in ['unknown', 'unavailable'] %}
          999999
        {% else %}
          {{ trigger.event.data.old_state.state | float(999999) }}
        {% endif %}
  - choose:
      - conditions:
          - "{{ distance | float < 250 and old_distance | float >= 250 }}"
        sequence:
          - service: notify.mobile_app_alex_phone
            data:
              title: 🔴 Drone CRITIQUE
              message: "{{ drone_name }}: {{ distance | int }}m"
              data:
                priority: high
                ttl: 0
      - conditions:
          - "{{ distance | float < 500 and old_distance | float >= 500 }}"
        sequence:
          - service: notify.mobile_app_alex_phone
            data:
              title: 🟠 Drone proche
              message: "{{ drone_name }}: {{ distance | int }}m"
mode: parallel
max: 50
```

### Example 2: Log new drone detections to a file

```yaml
alias: "Log new drone detections"
description: Append CSV row when integration fires dectyr_rx5_drone_detected
trigger:
  - platform: event
    event_type: dectyr_rx5_drone_detected
action:
  - service: notify.file_drone_log
    data:
      message: >
        {{ now().isoformat() }},{{ trigger.event.data.drone_id }},
        {{ trigger.event.data.manufacturer }},{{ trigger.event.data.model }},
        {{ trigger.event.data.scanner_id }}
mode: parallel
max: 50
```

Add once in `configuration.yaml`:

```yaml
notify:
  - platform: file
    name: file_drone_log
    filename: /config/drone_detections.log
    timestamp: false
```

### Example 3: Scanner battery low alert

```yaml
alias: "Scanner battery low"
description: Daily warning when a scanner battery falls below 20%
trigger:
  - platform: time
    at: "12:00:00"
action:
  - service: notify.persistent_notification
    data:
      title: 🔋 Scanner battery low
      message: >
        {% for state in states.sensor
           if state.attributes.translation_key == 'scanner_battery_soc'
           and state.state | int(100) < 20 %}
          - {{ state.attributes.friendly_name }}: {{ state.state }}%
        {% endfor %}
mode: single
```

### Example 4: Dynamic drone list (template trigger)

```yaml
alias: "Any drone within range"
description: Notify when any drone distance sensor reports < 500m
trigger:
  - platform: template
    value_template: >
      {{ states.sensor
         | selectattr('attributes.translation_key', 'eq', 'drone_distance_to_scanner')
         | selectattr('state', 'is_number')
         | selectattr('state', 'lt', 500)
         | list | count > 0 }}
action:
  - service: notify.mobile_app_alex_phone
    data:
      title: 🚁 Drone activity
      message: >
        {% set close_drones = states.sensor
           | selectattr('attributes.translation_key', 'eq', 'drone_distance_to_scanner')
           | selectattr('state', 'is_number')
           | selectattr('state', 'lt', 500)
           | list %}
        {{ close_drones | length }} drone(s) within 500m:
        {% for d in close_drones %}
        - {{ d.attributes.friendly_name }}: {{ d.state }}m
        {% endfor %}
mode: single
```

### Example 5: Daily detection statistics

Uses **History stats** on a drone airborne binary sensor (adjust `entity_id`):

```yaml
sensor:
  - platform: history_stats
    name: Drones detected today
    entity_id: binary_sensor.matrice_4t_airborne
    state: "on"
    type: count
    start: "{{ now().replace(hour=0, minute=0, second=0).timestamp() }}"
    duration: "24:00:00"
```

### Example 6: Webhook to external system

```yaml
alias: "Forward drone detection to API"
description: POST drone events for archival
trigger:
  - platform: event
    event_type: dectyr_rx5_drone_detected
action:
  - service: rest_command.dectyr_archive
    data:
      drone_id: "{{ trigger.event.data.drone_id }}"
      timestamp: "{{ now().isoformat() }}"
      lat: "{{ trigger.event.data.latitude }}"
      lon: "{{ trigger.event.data.longitude }}"
mode: parallel
```

With `rest_command` in `configuration.yaml`:

```yaml
rest_command:
  dectyr_archive:
    url: "https://your-api.example.com/drone-events"
    method: POST
    headers:
      Authorization: Bearer YOUR_API_KEY
    payload: >
      {"drone_id":"{{ drone_id }}","timestamp":"{{ timestamp }}",
       "lat":{{ lat | default(none) }},"lon":{{ lon | default(none) }}}
```

## Tips

- Prefer **`mode: single`** for noisy numeric triggers; use **`mode: parallel`** with
  **`max:`** for rare events you must not drop.
- Add a **cooldown** or **for:** duration on triggers to reduce notification spam.
- **`numeric_state`** triggers fire on threshold **crossings**, not continuously — often ideal for distance alerts.
- For many drones, **template triggers** and **`translation_key`** filters scale better than listing every `entity_id`.
