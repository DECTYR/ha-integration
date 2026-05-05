"""Bus event behaviour."""

from __future__ import annotations

from pytest_homeassistant_custom_component.common import MockConfigEntry

from custom_components.dectyr_rx5.const import (
    DOMAIN,
    EVENT_DRONE_DETECTED,
    EVENT_DRONE_PURGED,
    EVENT_SCANNER_ALERT,
)


async def test_drone_detected_event_on_new_drone(
    hass, mqtt_mock, example_payload, example_topic
) -> None:
    entry = MockConfigEntry(domain=DOMAIN, title="t", data={"mqtt_prefix": "dronedetector"})
    entry.add_to_hass(hass)
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    coord = hass.data[DOMAIN][entry.entry_id]["coordinator"]
    await coord.async_handle_scanner_status(
        example_topic("scanner_status_online"),
        example_payload("scanner_status_online"),
    )
    events: list = []

    def capture(ev):
        events.append(ev)

    hass.bus.async_listen_once(EVENT_DRONE_DETECTED, capture)
    await coord.async_handle_drone_data(
        example_topic("drone_data_complete"),
        example_payload("drone_data_complete"),
    )
    await hass.async_block_till_done()
    assert len(events) == 1
    assert "latitude" in events[0].data


async def test_drone_purged_event(hass, mqtt_mock, example_payload, example_topic) -> None:
    entry = MockConfigEntry(domain=DOMAIN, title="t", data={"mqtt_prefix": "dronedetector"})
    entry.add_to_hass(hass)
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    coord = hass.data[DOMAIN][entry.entry_id]["coordinator"]
    await coord.async_handle_scanner_status(
        example_topic("scanner_status_online"),
        example_payload("scanner_status_online"),
    )
    await coord.async_handle_drone_data(
        example_topic("drone_data_complete"),
        example_payload("drone_data_complete"),
    )
    drone_id = example_topic("drone_data_complete").split("/")[3]
    events: list = []

    def capture(ev):
        events.append(ev)

    hass.bus.async_listen_once(EVENT_DRONE_PURGED, capture)
    await coord.async_purge_drone(drone_id)
    await hass.async_block_till_done()
    assert len(events) == 1
    assert events[0].data["drone_id"] == drone_id


async def test_critical_scanner_alert_fires_once_per_unique(
    hass, mqtt_mock, example_payload, example_topic
) -> None:
    """Repeated status with the same critical alert does not fire again; new alert does."""
    from copy import deepcopy

    entry = MockConfigEntry(domain=DOMAIN, title="t", data={"mqtt_prefix": "dronedetector"})
    entry.add_to_hass(hass)
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    coord = hass.data[DOMAIN][entry.entry_id]["coordinator"]
    topic = example_topic("scanner_status_online")
    payload = deepcopy(example_payload("scanner_status_online"))
    payload["alerts"] = [
        {"level": "critical", "source": "battery", "message": "Test critical once"},
    ]
    fired: list = []
    hass.bus.async_listen(EVENT_SCANNER_ALERT, lambda ev: fired.append(ev))
    await coord.async_handle_scanner_status(topic, payload)
    await hass.async_block_till_done()
    assert len(fired) == 1
    payload["timestamp"] = "2026-05-03T12:00:01.000Z"
    await coord.async_handle_scanner_status(topic, payload)
    await hass.async_block_till_done()
    assert len(fired) == 1
    payload["alerts"] = [
        {"level": "critical", "source": "battery", "message": "Test critical once"},
        {"level": "critical", "source": "disk", "message": "New critical"},
    ]
    payload["timestamp"] = "2026-05-03T12:00:02.000Z"
    await coord.async_handle_scanner_status(topic, payload)
    await hass.async_block_till_done()
    assert len(fired) == 2
