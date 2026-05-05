"""Device tracker platform tests."""

from __future__ import annotations

import copy

import pytest
from homeassistant.helpers import entity_registry as er
from pytest_homeassistant_custom_component.common import MockConfigEntry

from custom_components.dectyr_rx5.const import DOMAIN


async def test_drone_tracker_coordinates(hass, mqtt_mock, example_payload, example_topic) -> None:
    """Drone tracker exposes lat/lng when present."""
    entry = MockConfigEntry(domain=DOMAIN, title="t", data={"mqtt_prefix": "dronedetector"})
    entry.add_to_hass(hass)
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()

    coordinator = hass.data[DOMAIN][entry.entry_id]["coordinator"]
    topic = example_topic("drone_data_complete")
    drone_id = topic.split("/")[3]
    payload = example_payload("drone_data_complete")

    await coordinator.async_handle_drone_data(topic, payload)
    await hass.async_block_till_done()

    reg = er.async_get(hass)
    eid = reg.async_get_entity_id("device_tracker", DOMAIN, f"{drone_id}_drone_position")
    state = hass.states.get(eid)
    assert state.attributes.get("latitude") == pytest.approx(43.563513)
    assert state.attributes.get("longitude") == pytest.approx(7.136084)


async def test_drone_tracker_no_coordinates(
    hass, mqtt_mock, example_payload, example_topic
) -> None:
    """Drone tracker omits coordinates when payload has no lat/lng."""
    entry = MockConfigEntry(domain=DOMAIN, title="t", data={"mqtt_prefix": "dronedetector"})
    entry.add_to_hass(hass)
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()

    coordinator = hass.data[DOMAIN][entry.entry_id]["coordinator"]
    topic = example_topic("drone_data_complete")
    drone_id = topic.split("/")[3]
    payload = copy.deepcopy(example_payload("drone_data_complete"))
    payload.pop("latitude", None)
    payload.pop("longitude", None)

    await coordinator.async_handle_drone_data(topic, payload)
    await hass.async_block_till_done()

    reg = er.async_get(hass)
    eid = reg.async_get_entity_id("device_tracker", DOMAIN, f"{drone_id}_drone_position")
    state = hass.states.get(eid)
    assert state.attributes.get("latitude") is None
    assert state.attributes.get("longitude") is None


async def test_operator_tracker_created_only_with_coords(
    hass, mqtt_mock, example_payload, example_topic
) -> None:
    """Operator tracker appears after payload includes operator lat/lng."""
    entry = MockConfigEntry(domain=DOMAIN, title="t", data={"mqtt_prefix": "dronedetector"})
    entry.add_to_hass(hass)
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()

    coordinator = hass.data[DOMAIN][entry.entry_id]["coordinator"]
    topic = example_topic("drone_data_complete")
    drone_id = topic.split("/")[3]

    payload_no_op = copy.deepcopy(example_payload("drone_data_complete"))
    payload_no_op["operator"] = {"location_type": "TAKEOFF", "classification_type": "EU"}

    await coordinator.async_handle_drone_data(topic, payload_no_op)
    await hass.async_block_till_done()

    reg = er.async_get(hass)
    uid_op = f"{drone_id}_operator_position"
    assert reg.async_get_entity_id("device_tracker", DOMAIN, uid_op) is None

    payload_full = example_payload("drone_data_complete")
    await coordinator.async_handle_drone_data(topic, payload_full)
    await hass.async_block_till_done()

    eid_op = reg.async_get_entity_id("device_tracker", DOMAIN, f"{drone_id}_operator_position")
    state = hass.states.get(eid_op)
    assert state.attributes.get("latitude") == pytest.approx(43.563512)
    assert state.attributes.get("longitude") == pytest.approx(7.136060)


async def test_scanner_tracker_no_position_without_fix(
    hass, mqtt_mock, example_payload, example_topic
) -> None:
    """Scanner tracker does not report 0,0 when GNSS has no fix."""
    entry = MockConfigEntry(domain=DOMAIN, title="t", data={"mqtt_prefix": "dronedetector"})
    entry.add_to_hass(hass)
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()

    coordinator = hass.data[DOMAIN][entry.entry_id]["coordinator"]
    topic = example_topic("scanner_status_online_with_alerts")
    payload = example_payload("scanner_status_online_with_alerts")
    scanner_id = payload["scanner_id"]

    await coordinator.async_handle_scanner_status(topic, payload)
    await hass.async_block_till_done()

    reg = er.async_get(hass)
    eid = reg.async_get_entity_id("device_tracker", DOMAIN, f"{scanner_id}_scanner_position")
    state = hass.states.get(eid)
    assert state.attributes.get("latitude") is None
    assert state.attributes.get("longitude") is None
    assert state.attributes.get("gnss_fix_quality_raw") is None
