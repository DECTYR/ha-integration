"""Sensor platform tests."""

from __future__ import annotations

from datetime import datetime, timedelta, timezone
from unittest.mock import patch

from homeassistant.const import STATE_UNAVAILABLE
from homeassistant.helpers import entity_registry as er
from pytest_homeassistant_custom_component.common import MockConfigEntry

from custom_components.dectyr_rx5.const import (
    CONF_DRONE_INACTIVITY_TIMEOUT,
    CONF_DRONE_PURGE_AFTER,
    DOMAIN,
)


async def test_scanner_sensors_from_status(hass, mqtt_mock, example_payload, example_topic) -> None:
    """Scanner status creates sensors with expected values."""
    entry = MockConfigEntry(domain=DOMAIN, title="t", data={"mqtt_prefix": "dronedetector"})
    entry.add_to_hass(hass)
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()

    coordinator = hass.data[DOMAIN][entry.entry_id]["coordinator"]
    topic = example_topic("scanner_status_online")
    payload = example_payload("scanner_status_online")
    scanner_id = payload["scanner_id"]

    await coordinator.async_handle_scanner_status(topic, payload)
    await hass.async_block_till_done()

    reg = er.async_get(hass)
    uid_cpu = f"{scanner_id}_cpu_temperature"
    eid_cpu = reg.async_get_entity_id("sensor", DOMAIN, uid_cpu)
    assert eid_cpu is not None
    assert float(hass.states.get(eid_cpu).state) == 56.0

    uid_status = f"{scanner_id}_status"
    eid_status = reg.async_get_entity_id("sensor", DOMAIN, uid_status)
    assert hass.states.get(eid_status).state == "online"

    uid_fq = f"{scanner_id}_gnss_fix_quality"
    eid_fq = reg.async_get_entity_id("sensor", DOMAIN, uid_fq)
    assert hass.states.get(eid_fq).state == "gnss"
    assert hass.states.get(eid_fq).attributes.get("raw_value") == 1


async def test_drone_sensors_from_data(hass, mqtt_mock, example_payload, example_topic) -> None:
    """Drone data creates drone sensors."""
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
    eid_fs = reg.async_get_entity_id("sensor", DOMAIN, f"{drone_id}_flight_status")
    assert hass.states.get(eid_fs).state == "odid_status_airborne"


async def test_scanner_sensor_unavailable_when_offline(
    hass, mqtt_mock, example_payload, example_topic
) -> None:
    """Operational scanner sensors go unavailable when status is offline."""
    entry = MockConfigEntry(domain=DOMAIN, title="t", data={"mqtt_prefix": "dronedetector"})
    entry.add_to_hass(hass)
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()

    coordinator = hass.data[DOMAIN][entry.entry_id]["coordinator"]
    topic_on = example_topic("scanner_status_online")
    payload_on = example_payload("scanner_status_online")
    scanner_id = payload_on["scanner_id"]

    await coordinator.async_handle_scanner_status(topic_on, payload_on)
    await hass.async_block_till_done()

    reg = er.async_get(hass)
    uid_cpu = f"{scanner_id}_cpu_temperature"
    eid_cpu = reg.async_get_entity_id("sensor", DOMAIN, uid_cpu)
    assert hass.states.get(eid_cpu).state != STATE_UNAVAILABLE

    topic_off = example_topic("scanner_status_offline_graceful")
    payload_off = example_payload("scanner_status_offline_graceful")
    await coordinator.async_handle_scanner_status(topic_off, payload_off)
    await hass.async_block_till_done()

    assert hass.states.get(eid_cpu).state == STATE_UNAVAILABLE


async def test_sensor_seen_cleared_on_remove(
    hass,
    mqtt_mock,
    example_payload,
    example_topic,
) -> None:
    """Broadcast drone_removed clears platform seen set so the same drone can be re-added."""
    entry = MockConfigEntry(
        domain=DOMAIN,
        title="t",
        data={"mqtt_prefix": "dronedetector"},
        options={
            CONF_DRONE_PURGE_AFTER: 60,
            CONF_DRONE_INACTIVITY_TIMEOUT: 99999,
        },
    )
    entry.add_to_hass(hass)
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()

    coordinator = hass.data[DOMAIN][entry.entry_id]["coordinator"]
    topic = example_topic("drone_data_complete")
    drone_id = topic.split("/")[3]
    payload = example_payload("drone_data_complete")
    t0 = datetime(2026, 5, 1, 12, 0, 0, tzinfo=timezone.utc)

    with patch(
        "custom_components.dectyr_rx5.coordinator.dt_util.utcnow",
        return_value=t0,
    ):
        await coordinator.async_handle_drone_data(topic, payload)
    await hass.async_block_till_done()

    reg = er.async_get(hass)
    uid = f"{drone_id}_flight_status"
    assert reg.async_get_entity_id("sensor", DOMAIN, uid) is not None

    with patch(
        "custom_components.dectyr_rx5.coordinator.dt_util.utcnow",
        return_value=t0 + timedelta(seconds=120),
    ):
        await coordinator._async_housekeeping(None)
    await hass.async_block_till_done()

    with patch(
        "custom_components.dectyr_rx5.coordinator.dt_util.utcnow",
        return_value=t0 + timedelta(seconds=130),
    ):
        await coordinator.async_handle_drone_data(topic, payload)
    await hass.async_block_till_done()

    assert reg.async_get_entity_id("sensor", DOMAIN, uid) is not None
