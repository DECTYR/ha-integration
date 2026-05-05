"""MQTT subscriber wiring tests."""

from __future__ import annotations

import json
from types import SimpleNamespace

import pytest
from homeassistant.components import mqtt
from homeassistant.helpers.dispatcher import async_dispatcher_connect
from pytest_homeassistant_custom_component.common import MockConfigEntry

from custom_components.dectyr_rx5.const import (
    DOMAIN,
    SIGNAL_NEW_DRONE,
    SIGNAL_NEW_SCANNER,
    drone_update_signal,
    scanner_update_signal,
)
from custom_components.dectyr_rx5.coordinator import DectyrCoordinator
from custom_components.dectyr_rx5.mqtt_client import MQTTSubscriber


@pytest.fixture
async def mqtt_stub(hass, mqtt_mock, monkeypatch):
    """Capture MQTT subscription registrations."""

    async def _subscribe(hass, topic, msg_callback, qos=0):
        _subscribe.handlers.append((topic, msg_callback))

        def _unsub():
            pass

        return _unsub

    _subscribe.handlers = []
    monkeypatch.setattr(mqtt, "async_subscribe", _subscribe)
    return _subscribe


async def test_subscribe_wildcards_multi_segment(hass, mqtt_stub) -> None:
    entry = MockConfigEntry(
        domain=DOMAIN,
        title="t",
        data={"mqtt_prefix": "home/security/drones"},
    )
    entry.add_to_hass(hass)

    coordinator = DectyrCoordinator(hass, entry)
    await coordinator.async_setup()

    sub = MQTTSubscriber(hass, coordinator, "home/security/drones")
    await sub.async_setup()

    topics = {t for t, _ in mqtt_stub.handlers}
    assert "home/security/drones/+/status" in topics
    assert "home/security/drones/+/errors" in topics
    assert "home/security/drones/+/drones/+/data" in topics
    assert "home/security/drones/+/commands/response" in topics

    await sub.async_unload()
    await coordinator.async_shutdown()


async def test_scanner_status_dispatches_signals(hass, mqtt_stub, example_payload, example_topic):
    entry = MockConfigEntry(domain=DOMAIN, title="t", data={"mqtt_prefix": "dronedetector"})
    entry.add_to_hass(hass)

    coordinator = DectyrCoordinator(hass, entry)
    await coordinator.async_setup()
    sub = MQTTSubscriber(hass, coordinator, "dronedetector")
    await sub.async_setup()

    handler_by_topic = dict(mqtt_stub.handlers)

    status_payload = example_payload("scanner_status_online")
    scanner_id = status_payload["scanner_id"]
    drone_payload = example_payload("drone_data_complete")
    drone_topic = example_topic("drone_data_complete")
    drone_id = drone_topic.split("/")[3]

    events: dict[str, int] = {
        SIGNAL_NEW_SCANNER: 0,
        scanner_update_signal(scanner_id): 0,
        SIGNAL_NEW_DRONE: 0,
        drone_update_signal(drone_id): 0,
    }

    def _count(signal: str):
        def _cb(*_args, **_kwargs):
            events[signal] += 1

        return _cb

    cancel_new_scanner = async_dispatcher_connect(
        hass,
        SIGNAL_NEW_SCANNER,
        _count(SIGNAL_NEW_SCANNER),
    )
    cancel_scan_update = async_dispatcher_connect(
        hass,
        scanner_update_signal(scanner_id),
        _count(scanner_update_signal(scanner_id)),
    )
    cancel_new_drone = async_dispatcher_connect(
        hass,
        SIGNAL_NEW_DRONE,
        _count(SIGNAL_NEW_DRONE),
    )
    cancel_drone_update = async_dispatcher_connect(
        hass,
        drone_update_signal(drone_id),
        _count(drone_update_signal(drone_id)),
    )

    status_topic = example_topic("scanner_status_online")
    await handler_by_topic["dronedetector/+/status"](
        SimpleNamespace(topic=status_topic, payload=json.dumps(status_payload).encode("utf-8"))
    )
    await hass.async_block_till_done()

    await handler_by_topic["dronedetector/+/drones/+/data"](
        SimpleNamespace(topic=drone_topic, payload=json.dumps(drone_payload).encode("utf-8"))
    )
    await hass.async_block_till_done()

    assert events[SIGNAL_NEW_SCANNER] == 1
    assert events[scanner_update_signal(scanner_id)] == 1
    assert events[SIGNAL_NEW_DRONE] == 1
    assert events[drone_update_signal(drone_id)] == 1

    cancel_new_scanner()
    cancel_scan_update()
    cancel_new_drone()
    cancel_drone_update()

    await sub.async_unload()
    await coordinator.async_shutdown()
