"""Binary sensor platform tests."""

from __future__ import annotations

import copy

from homeassistant.helpers import entity_registry as er
from pytest_homeassistant_custom_component.common import MockConfigEntry

from custom_components.dectyr_rx5.const import DOMAIN


async def test_scanner_binary_sensors(hass, mqtt_mock, example_payload, example_topic) -> None:
    """Key scanner binary sensors reflect payload."""
    entry = MockConfigEntry(domain=DOMAIN, title="t", data={"mqtt_prefix": "dronedetector"})
    entry.add_to_hass(hass)
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()

    coordinator = hass.data[DOMAIN][entry.entry_id]["coordinator"]
    topic = example_topic("scanner_status_online")
    payload = copy.deepcopy(example_payload("scanner_status_online"))
    payload["battery"] = {"ac_power": True, "charging": False, "soc": 95.0}
    scanner_id = payload["scanner_id"]

    await coordinator.async_handle_scanner_status(topic, payload)
    await hass.async_block_till_done()

    reg = er.async_get(hass)

    eid_online = reg.async_get_entity_id("binary_sensor", DOMAIN, f"{scanner_id}_online")
    assert hass.states.get(eid_online).state == "on"

    eid_gnss = reg.async_get_entity_id("binary_sensor", DOMAIN, f"{scanner_id}_gnss_has_fix")
    assert hass.states.get(eid_gnss).state == "on"

    eid_ac = reg.async_get_entity_id("binary_sensor", DOMAIN, f"{scanner_id}_ac_power")
    assert hass.states.get(eid_ac).state == "on"

    eid_crit = reg.async_get_entity_id("binary_sensor", DOMAIN, f"{scanner_id}_has_critical_alert")
    assert hass.states.get(eid_crit).state == "off"


async def test_scanner_binary_critical_alert(
    hass, mqtt_mock, example_payload, example_topic
) -> None:
    """Critical alert binary turns on when a critical alert is present."""
    entry = MockConfigEntry(domain=DOMAIN, title="t", data={"mqtt_prefix": "dronedetector"})
    entry.add_to_hass(hass)
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()

    coordinator = hass.data[DOMAIN][entry.entry_id]["coordinator"]
    topic = example_topic("scanner_status_online")
    payload = copy.deepcopy(example_payload("scanner_status_online"))
    scanner_id = payload["scanner_id"]
    payload["alerts"] = [
        {"level": "critical", "source": "wifi", "message": "No Wi-Fi interface detected"},
    ]

    await coordinator.async_handle_scanner_status(topic, payload)
    await hass.async_block_till_done()

    reg = er.async_get(hass)
    eid_crit = reg.async_get_entity_id("binary_sensor", DOMAIN, f"{scanner_id}_has_critical_alert")
    assert hass.states.get(eid_crit).state == "on"
