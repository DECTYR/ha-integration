"""Coordinator registry, purge, and received_at behaviour."""

from __future__ import annotations

from datetime import datetime, timedelta, timezone
from unittest.mock import patch

import pytest
from pytest_homeassistant_custom_component.common import MockConfigEntry

from custom_components.dectyr_rx5.const import (
    CONF_DRONE_INACTIVITY_TIMEOUT,
    CONF_DRONE_PURGE_AFTER,
    DOMAIN,
)
from custom_components.dectyr_rx5.models import Drone


@pytest.fixture
async def coordinator_short_purge(hass, mqtt_mock):
    """Config entry with 60s purge and long inactivity so purge wins first."""
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
    return hass.data[DOMAIN][entry.entry_id]["coordinator"], entry


async def test_purge_uses_received_at_not_timestamp(
    hass, mqtt_mock, coordinator_short_purge, example_payload, example_topic
) -> None:
    """Stale payload timestamp must not cause purge; age uses MQTT receive time."""
    coordinator, _ = coordinator_short_purge
    topic = example_topic("drone_data_complete")
    drone_id = topic.split("/")[3]
    payload = dict(example_payload("drone_data_complete"))
    payload["timestamp"] = "2020-01-01T00:00:00+00:00"

    t0 = datetime(2026, 5, 1, 12, 0, 0, tzinfo=timezone.utc)
    with patch(
        "custom_components.dectyr_rx5.coordinator.dt_util.utcnow",
        return_value=t0,
    ):
        await coordinator.async_handle_drone_data(topic, payload)
    assert coordinator.get_drone(drone_id) is not None
    assert coordinator.get_drone(drone_id).received_at == t0

    with patch(
        "custom_components.dectyr_rx5.coordinator.dt_util.utcnow",
        return_value=t0 + timedelta(seconds=30),
    ):
        await coordinator._async_housekeeping(None)

    assert coordinator.get_drone(drone_id) is not None


async def test_purge_old_drone(
    hass, mqtt_mock, coordinator_short_purge, example_payload, example_topic
) -> None:
    """Drone with old received_at is purged after housekeeping."""
    coordinator, _ = coordinator_short_purge
    topic = example_topic("drone_data_complete")
    drone_id = topic.split("/")[3]
    payload = example_payload("drone_data_complete")

    t0 = datetime(2026, 5, 1, 12, 0, 0, tzinfo=timezone.utc)
    with patch(
        "custom_components.dectyr_rx5.coordinator.dt_util.utcnow",
        return_value=t0,
    ):
        await coordinator.async_handle_drone_data(topic, payload)

    with patch(
        "custom_components.dectyr_rx5.coordinator.dt_util.utcnow",
        return_value=t0 + timedelta(seconds=120),
    ):
        await coordinator._async_housekeeping(None)

    assert coordinator.get_drone(drone_id) is None


async def test_restored_drone_no_premature_purge(hass, mqtt_mock) -> None:
    """Store-restored placeholder (received_at None) is not purged by housekeeping."""
    entry = MockConfigEntry(
        domain=DOMAIN,
        title="t",
        data={"mqtt_prefix": "dronedetector"},
        options={CONF_DRONE_PURGE_AFTER: 1},
    )
    entry.add_to_hass(hass)
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    coordinator = hass.data[DOMAIN][entry.entry_id]["coordinator"]
    did = "restored_drone_1"
    coordinator._drones[did] = Drone.restore_placeholder(
        drone_id=did,
        last_seen=datetime(2010, 1, 1, tzinfo=timezone.utc),
    )
    assert coordinator.get_drone(did).received_at is None

    await coordinator._async_housekeeping(None)
    assert coordinator.get_drone(did) is not None


async def test_save_store_persists_drone_ids(
    hass, mqtt_mock, example_payload, example_topic
) -> None:
    """Persisted drones list matches coordinator registry."""
    entry = MockConfigEntry(domain=DOMAIN, title="t", data={"mqtt_prefix": "dronedetector"})
    entry.add_to_hass(hass)
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    coordinator = hass.data[DOMAIN][entry.entry_id]["coordinator"]
    topic = example_topic("drone_data_complete")
    drone_id = topic.split("/")[3]
    await coordinator.async_handle_drone_data(topic, example_payload("drone_data_complete"))
    await coordinator._async_save_store()
    raw = await coordinator._store.async_load()
    assert isinstance(raw, dict)
    drones_raw = raw.get("drones")
    assert isinstance(drones_raw, list)
    assert len(drones_raw) == 1
    assert drones_raw[0].get("id") == drone_id


async def test_drone_recreated_after_purge(
    hass,
    mqtt_mock,
    coordinator_short_purge,
    example_payload,
    example_topic,
) -> None:
    """After purge, a new MQTT message must re-create registry row (seen_* cleanup)."""
    coordinator, _ = coordinator_short_purge
    topic = example_topic("drone_data_complete")
    drone_id = topic.split("/")[3]
    payload = example_payload("drone_data_complete")
    t0 = datetime(2026, 5, 1, 12, 0, 0, tzinfo=timezone.utc)

    with patch(
        "custom_components.dectyr_rx5.coordinator.dt_util.utcnow",
        return_value=t0,
    ):
        await coordinator.async_handle_drone_data(topic, payload)

    with patch(
        "custom_components.dectyr_rx5.coordinator.dt_util.utcnow",
        return_value=t0 + timedelta(seconds=120),
    ):
        await coordinator._async_housekeeping(None)

    assert coordinator.get_drone(drone_id) is None

    with patch(
        "custom_components.dectyr_rx5.coordinator.dt_util.utcnow",
        return_value=t0 + timedelta(seconds=130),
    ):
        await coordinator.async_handle_drone_data(topic, payload)

    assert coordinator.get_drone(drone_id) is not None


def _minimal_drone_payload(scanner_id: str, rssi: int, distance: float | None = None) -> dict:
    p: dict = {
        "scanner_id": scanner_id,
        "mac": "aa:bb:cc:dd:ee:ff",
        "timestamp": "2026-05-04T10:00:00Z",
        "broadcast_protocol": "WiFi-Beacon",
        "signal_type": "RemoteID-EU",
        "rssi": rssi,
        "complete": True,
    }
    if distance is not None:
        p["distance_to_scanner"] = distance
    return p


async def test_merge_drone_preserves_distance_per_scanner(hass, mqtt_mock) -> None:
    """Alternating MQTT sources must not drop the other scanner's distance."""
    entry = MockConfigEntry(domain=DOMAIN, title="t", data={"mqtt_prefix": "dronedetector"})
    entry.add_to_hass(hass)
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    coordinator = hass.data[DOMAIN][entry.entry_id]["coordinator"]

    drone_id = "DRONE_MULTI"
    topic_a = f"dronedetector/scanner_a/drones/{drone_id}/data"
    topic_b = f"dronedetector/scanner_b/drones/{drone_id}/data"

    await coordinator.async_handle_drone_data(
        topic_a, _minimal_drone_payload("scanner_a", -80, 100.0)
    )
    d = coordinator.get_drone(drone_id)
    assert d is not None
    assert dict(d.distance_by_scanner or {}) == {"scanner_a": pytest.approx(100.0)}
    assert d.distance_to_scanner == pytest.approx(100.0)

    await coordinator.async_handle_drone_data(
        topic_b, _minimal_drone_payload("scanner_b", -50, 5.0)
    )
    d = coordinator.get_drone(drone_id)
    assert d is not None
    assert dict(d.distance_by_scanner or {}) == {
        "scanner_a": pytest.approx(100.0),
        "scanner_b": pytest.approx(5.0),
    }
    assert d.distance_to_scanner == pytest.approx(5.0)

    await coordinator.async_handle_drone_data(
        topic_a, _minimal_drone_payload("scanner_a", -40, 12.0)
    )
    d = coordinator.get_drone(drone_id)
    assert d is not None
    assert d.distance_to_scanner == pytest.approx(12.0)
    assert dict(d.distance_by_scanner or {})["scanner_b"] == pytest.approx(5.0)


async def test_retained_drone_received_at_uses_payload_not_wall_clock(
    hass, mqtt_mock, example_payload, example_topic
) -> None:
    """Broker retains must not bump activity to 'now' (fixes false-live after reconnect)."""
    entry = MockConfigEntry(domain=DOMAIN, title="t", data={"mqtt_prefix": "dronedetector"})
    entry.add_to_hass(hass)
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    coordinator = hass.data[DOMAIN][entry.entry_id]["coordinator"]

    topic = example_topic("drone_data_complete")
    drone_id = topic.split("/")[3]
    payload = dict(example_payload("drone_data_complete"))
    payload["timestamp"] = "2026-05-01T10:00:00+00:00"

    wall = datetime(2026, 5, 4, 12, 0, 0, tzinfo=timezone.utc)
    with patch(
        "custom_components.dectyr_rx5.coordinator.dt_util.utcnow",
        return_value=wall,
    ):
        await coordinator.async_handle_drone_data(topic, payload, mqtt_retained=True)

    d = coordinator.get_drone(drone_id)
    assert d is not None
    assert d.received_at == datetime(2026, 5, 1, 10, 0, 0, tzinfo=timezone.utc)


async def test_retained_skipped_when_older_than_cached_drone(
    hass, mqtt_mock, example_payload, example_topic
) -> None:
    """Stale retain must not refresh merged RSSI / activity."""
    entry = MockConfigEntry(domain=DOMAIN, title="t", data={"mqtt_prefix": "dronedetector"})
    entry.add_to_hass(hass)
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    coordinator = hass.data[DOMAIN][entry.entry_id]["coordinator"]

    topic = example_topic("drone_data_complete")
    drone_id = topic.split("/")[3]

    fresh_ts = "2026-05-04T12:00:00+00:00"
    stale_ts = "2026-05-04T11:00:00+00:00"

    t_live = datetime(2026, 5, 4, 12, 30, 0, tzinfo=timezone.utc)
    with patch(
        "custom_components.dectyr_rx5.coordinator.dt_util.utcnow",
        return_value=t_live,
    ):
        p1 = dict(example_payload("drone_data_complete"))
        p1["timestamp"] = fresh_ts
        p1["rssi"] = -40
        await coordinator.async_handle_drone_data(topic, p1, mqtt_retained=False)

    rssi_before = coordinator.get_drone(drone_id).rssi_by_scanner

    t_retain = datetime(2026, 5, 4, 12, 31, 0, tzinfo=timezone.utc)
    with patch(
        "custom_components.dectyr_rx5.coordinator.dt_util.utcnow",
        return_value=t_retain,
    ):
        p2 = dict(example_payload("drone_data_complete"))
        p2["timestamp"] = stale_ts
        p2["rssi"] = -90
        await coordinator.async_handle_drone_data(topic, p2, mqtt_retained=True)

    d = coordinator.get_drone(drone_id)
    assert d is not None
    assert d.rssi_by_scanner == rssi_before
    assert d.received_at == t_live
