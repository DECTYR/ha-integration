"""Switch platform tests."""

from __future__ import annotations

from unittest.mock import AsyncMock, patch

import pytest
from pytest_homeassistant_custom_component.common import MockConfigEntry

from custom_components.dectyr_rx5.const import DOMAIN


@pytest.fixture
async def loaded_scanner(hass, mqtt_mock, example_payload, example_topic):
    entry = MockConfigEntry(domain=DOMAIN, title="t", data={"mqtt_prefix": "dronedetector"})
    entry.add_to_hass(hass)
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    coord = hass.data[DOMAIN][entry.entry_id]["coordinator"]
    topic = example_topic("scanner_status_online")
    payload = example_payload("scanner_status_online")
    await coord.async_handle_scanner_status(topic, payload)
    await hass.async_block_till_done()
    return coord, payload["scanner_id"]


async def test_gnss_switch_turn_on(hass, mqtt_mock, loaded_scanner) -> None:
    from homeassistant.helpers import entity_registry as er

    coord, scanner_id = loaded_scanner
    reg = er.async_get(hass)
    eid = reg.async_get_entity_id("switch", DOMAIN, f"{scanner_id}_gnss_publish")
    assert eid is not None
    mock_send = AsyncMock(return_value={"status": "success"})
    with patch.object(coord, "async_send_command", mock_send):
        await hass.services.async_call(
            "switch",
            "turn_on",
            {"entity_id": eid},
            blocking=True,
        )
    mock_send.assert_awaited_once()
    assert mock_send.await_args.args[1] == "gps_enable"
    assert mock_send.await_args.args[2]["broker"] == "both"


async def test_firmware_auto_update_turn_off(hass, mqtt_mock, loaded_scanner) -> None:
    from homeassistant.helpers import entity_registry as er

    coord, scanner_id = loaded_scanner
    reg = er.async_get(hass)
    eid = reg.async_get_entity_id("switch", DOMAIN, f"{scanner_id}_firmware_auto_update")
    assert eid is not None
    mock_send = AsyncMock(return_value={"status": "success"})
    with patch.object(coord, "async_send_command", mock_send):
        await hass.services.async_call(
            "switch",
            "turn_off",
            {"entity_id": eid},
            blocking=True,
        )
    assert mock_send.await_args.args[1] == "firmware_auto_update"
    assert mock_send.await_args.args[2] == {"enabled": False}
