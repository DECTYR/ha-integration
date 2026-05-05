"""The Dectyr RX-5 integration."""

from __future__ import annotations

from homeassistant.config_entries import ConfigEntry
from homeassistant.const import Platform
from homeassistant.core import HomeAssistant

from .const import DOMAIN
from .coordinator import DectyrCoordinator
from .mqtt_client import MQTTSubscriber
from .services import async_ensure_services, async_release_services

PLATFORMS: list[Platform] = [
    Platform.SENSOR,
    Platform.BINARY_SENSOR,
    Platform.DEVICE_TRACKER,
    Platform.BUTTON,
    Platform.SWITCH,
    Platform.NUMBER,
]


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Set up Dectyr RX-5 from a config entry."""
    from .frontend import async_register_frontend

    await async_register_frontend(hass)

    coordinator = DectyrCoordinator(hass, entry)
    await coordinator.async_setup()

    subscriber = MQTTSubscriber(hass, coordinator, entry.data["mqtt_prefix"])
    await subscriber.async_setup()

    hass.data.setdefault(DOMAIN, {})
    hass.data[DOMAIN][entry.entry_id] = {
        "coordinator": coordinator,
        "mqtt": subscriber,
    }

    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)
    await async_ensure_services(hass)
    entry.async_on_unload(entry.add_update_listener(_async_update_listener))
    return True


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Unload a config entry."""
    unload_ok = await hass.config_entries.async_unload_platforms(entry, PLATFORMS)
    if unload_ok:
        data = hass.data[DOMAIN].pop(entry.entry_id)
        await data["coordinator"].async_clear_entry_repair_issues()
        await data["mqtt"].async_unload()
        await data["coordinator"].async_shutdown()
        if not hass.data[DOMAIN]:
            hass.data.pop(DOMAIN)
            from homeassistant.helpers import issue_registry as ir

            ir.async_delete_issue(hass, DOMAIN, "mqtt_required")
        await async_release_services(hass)
    return unload_ok


async def _async_update_listener(hass: HomeAssistant, entry: ConfigEntry) -> None:
    """Reload when options change."""
    await hass.config_entries.async_reload(entry.entry_id)
