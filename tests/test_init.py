"""Tests for dectyr_rx5."""

from __future__ import annotations

from homeassistant.config_entries import ConfigEntryState
from homeassistant.core import HomeAssistant
from pytest_homeassistant_custom_component.common import MockConfigEntry

from custom_components.dectyr_rx5.const import DOMAIN


async def test_setup_unload(hass: HomeAssistant, mqtt_mock) -> None:
    """Test entry setup and unload."""
    entry = MockConfigEntry(
        domain=DOMAIN,
        title="Dectyr RX-5",
        data={"mqtt_prefix": "dronedetector"},
    )
    entry.add_to_hass(hass)

    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    assert entry.state is ConfigEntryState.LOADED

    assert await hass.config_entries.async_remove(entry.entry_id)
    await hass.async_block_till_done()
    assert entry.state is ConfigEntryState.NOT_LOADED
