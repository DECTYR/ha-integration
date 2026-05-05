"""Service tests."""

from __future__ import annotations

import json
from unittest.mock import patch

import pytest
from homeassistant.core import HomeAssistantError
from homeassistant.helpers import device_registry as dr
from pytest_homeassistant_custom_component.common import MockConfigEntry

from custom_components.dectyr_rx5 import coordinator as coord_module
from custom_components.dectyr_rx5.const import DOMAIN


async def test_send_command_service_success(
    hass, mqtt_mock, example_payload, example_topic
) -> None:
    entry = MockConfigEntry(domain=DOMAIN, title="t", data={"mqtt_prefix": "dronedetector"})
    entry.add_to_hass(hass)
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    coord = hass.data[DOMAIN][entry.entry_id]["coordinator"]
    topic = example_topic("scanner_status_online")
    sid = example_payload("scanner_status_online")["scanner_id"]
    await coord.async_handle_scanner_status(topic, example_payload("scanner_status_online"))
    await hass.async_block_till_done()
    dev = dr.async_get(hass).async_get_device(identifiers={(DOMAIN, sid)})
    assert dev is not None

    async def fake_publish(h, t, payload, qos, retain, **kwargs):
        data = json.loads(payload)
        rid = data["request_id"]
        await coord.async_handle_command_response(
            f"dronedetector/{sid}/commands/response",
            {
                "request_id": rid,
                "scanner_id": sid,
                "action": "reboot",
                "status": "success",
                "message": "OK",
                "timestamp": "2026-05-03T12:00:00+00:00",
            },
        )

    with patch.object(coord_module.mqtt, "async_publish", side_effect=fake_publish):
        result = await hass.services.async_call(
            DOMAIN,
            "send_command",
            {
                "device_id": dev.id,
                "action": "reboot",
                "params": {},
            },
            blocking=True,
            return_response=True,
        )
    assert result["status"] == "success"


async def test_send_command_timeout(hass, mqtt_mock, example_payload, example_topic) -> None:
    entry = MockConfigEntry(domain=DOMAIN, title="t", data={"mqtt_prefix": "dronedetector"})
    entry.add_to_hass(hass)
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    coord = hass.data[DOMAIN][entry.entry_id]["coordinator"]
    sid = example_payload("scanner_status_online")["scanner_id"]
    await coord.async_handle_scanner_status(
        example_topic("scanner_status_online"),
        example_payload("scanner_status_online"),
    )
    await hass.async_block_till_done()
    dev = dr.async_get(hass).async_get_device(identifiers={(DOMAIN, sid)})
    assert dev is not None

    async def noop_publish(*_a, **_k):
        return None

    with patch.object(coord_module.mqtt, "async_publish", side_effect=noop_publish):
        with pytest.raises(HomeAssistantError):
            await hass.services.async_call(
                DOMAIN,
                "send_command",
                {
                    "device_id": dev.id,
                    "action": "reboot",
                    "params": {},
                    "timeout": 0.01,
                },
                blocking=True,
                return_response=True,
            )


async def test_set_mqtt_broker_waits_for_completed(
    hass, mqtt_mock, example_payload, example_topic
) -> None:
    entry = MockConfigEntry(domain=DOMAIN, title="t", data={"mqtt_prefix": "dronedetector"})
    entry.add_to_hass(hass)
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    coord = hass.data[DOMAIN][entry.entry_id]["coordinator"]
    sid = example_payload("scanner_status_online")["scanner_id"]
    await coord.async_handle_scanner_status(
        example_topic("scanner_status_online"),
        example_payload("scanner_status_online"),
    )
    await hass.async_block_till_done()
    dev = dr.async_get(hass).async_get_device(identifiers={(DOMAIN, sid)})
    assert dev is not None

    async def fake_publish(h, t, payload, qos, retain, **kwargs):
        data = json.loads(payload)
        rid = data["request_id"]
        await coord.async_handle_command_response(
            f"dronedetector/{sid}/commands/response",
            {
                "request_id": rid,
                "scanner_id": sid,
                "action": "set_mqtt_broker",
                "status": "success",
                "message": "switching",
                "timestamp": "2026-05-03T12:00:00+00:00",
            },
        )
        await coord.async_handle_command_response(
            f"dronedetector/{sid}/commands/response",
            {
                "request_id": rid,
                "scanner_id": sid,
                "action": "set_mqtt_broker",
                "status": "completed",
                "message": "done",
                "timestamp": "2026-05-03T12:00:01+00:00",
            },
        )

    with patch.object(coord_module.mqtt, "async_publish", side_effect=fake_publish):
        result = await hass.services.async_call(
            DOMAIN,
            "send_command",
            {
                "device_id": dev.id,
                "action": "set_mqtt_broker",
                "params": {"host": "broker.example.com"},
            },
            blocking=True,
            return_response=True,
        )
    assert result["status"] == "completed"


async def test_clear_drone_service(hass, mqtt_mock, example_payload, example_topic) -> None:
    entry = MockConfigEntry(domain=DOMAIN, title="t", data={"mqtt_prefix": "dronedetector"})
    entry.add_to_hass(hass)
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    coord = hass.data[DOMAIN][entry.entry_id]["coordinator"]
    await coord.async_handle_scanner_status(
        example_topic("scanner_status_online"),
        example_payload("scanner_status_online"),
    )
    topic_d = example_topic("drone_data_complete")
    await coord.async_handle_drone_data(topic_d, example_payload("drone_data_complete"))
    await hass.async_block_till_done()
    drone_id = topic_d.split("/")[3]
    dev = dr.async_get(hass).async_get_device(identifiers={(DOMAIN, f"drone:{drone_id}")})
    assert dev is not None
    await hass.services.async_call(
        DOMAIN,
        "clear_drone",
        {"device_id": dev.id},
        blocking=True,
    )
    assert coord.get_drone(drone_id) is None


async def test_export_drones(hass, mqtt_mock, example_payload, example_topic) -> None:
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
    await hass.async_block_till_done()
    out = await hass.services.async_call(
        DOMAIN,
        "export_drones",
        {"include_inactive": True},
        blocking=True,
        return_response=True,
    )
    assert len(out["drones"]) >= 1
