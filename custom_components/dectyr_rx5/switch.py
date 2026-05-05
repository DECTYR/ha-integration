"""Scanner switches (GNSS publish, firmware auto-update)."""

from __future__ import annotations

from typing import TYPE_CHECKING

from homeassistant.components.switch import SwitchEntity, SwitchEntityDescription
from homeassistant.const import EntityCategory
from homeassistant.core import HomeAssistant, callback
from homeassistant.exceptions import HomeAssistantError
from homeassistant.helpers.dispatcher import async_dispatcher_connect
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.restore_state import RestoreEntity

from .const import (
    DOMAIN,
    SIGNAL_NEW_SCANNER,
    SIGNAL_SCANNER_REMOVED,
    CommandBrokerScope,
    ScannerCommandAction,
)
from .entity import DectyrScannerEntity

if TYPE_CHECKING:
    from homeassistant.config_entries import ConfigEntry

    from .coordinator import DectyrCoordinator

SCANNER_SWITCHES: tuple[SwitchEntityDescription, ...] = (
    SwitchEntityDescription(
        key="gnss_publish",
        translation_key="gnss_publish",
        entity_category=EntityCategory.CONFIG,
    ),
    SwitchEntityDescription(
        key="firmware_auto_update",
        translation_key="firmware_auto_update",
        entity_category=EntityCategory.CONFIG,
    ),
)


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    """Set up switches for each scanner."""
    coordinator: DectyrCoordinator = hass.data[DOMAIN][entry.entry_id]["coordinator"]
    seen: set[str] = set()

    @callback
    def _async_add_scanner(scanner_id: str) -> None:
        if scanner_id in seen:
            return
        seen.add(scanner_id)
        async_add_entities(
            [DectyrScannerSwitch(coordinator, scanner_id, desc) for desc in SCANNER_SWITCHES]
        )

    for scanner in coordinator.get_all_scanners():
        _async_add_scanner(scanner.scanner_id)

    entry.async_on_unload(async_dispatcher_connect(hass, SIGNAL_NEW_SCANNER, _async_add_scanner))

    @callback
    def _async_scanner_removed(sid: str) -> None:
        seen.discard(sid)

    entry.async_on_unload(
        async_dispatcher_connect(hass, SIGNAL_SCANNER_REMOVED, _async_scanner_removed)
    )


class DectyrScannerSwitch(DectyrScannerEntity, SwitchEntity, RestoreEntity):
    """Switch backed by MQTT commands and scanner status."""

    def __init__(
        self,
        coordinator: DectyrCoordinator,
        scanner_id: str,
        description: SwitchEntityDescription,
    ) -> None:
        """Initialize."""
        super().__init__(coordinator, scanner_id, description)
        self._attr_is_on: bool | None = None

    async def async_added_to_hass(self) -> None:
        """Subscribe to updates and restore prior on/off from recorder."""
        await DectyrScannerEntity.async_added_to_hass(self)
        await RestoreEntity.async_added_to_hass(self)
        if (last := await self.async_get_last_state()) and last.state in ("on", "off"):
            self._attr_is_on = last.state == "on"

    @property
    def is_on(self) -> bool | None:
        """Reflect GNSS publish or firmware auto-update from status payload."""
        scanner = self.coordinator.get_scanner(self._scanner_id)
        if not scanner:
            return self._attr_is_on
        if self.entity_description.key == "gnss_publish":
            if scanner.gnss is not None and scanner.gnss.enabled is not None:
                return scanner.gnss.enabled
            if scanner.gps_enabled is not None:
                return scanner.gps_enabled
            return self._attr_is_on
        if self.entity_description.key == "firmware_auto_update":
            if scanner.firmware is not None and scanner.firmware.auto_update is not None:
                return scanner.firmware.auto_update
            return self._attr_is_on
        return None

    async def async_turn_on(self, **kwargs: object) -> None:
        """Enable feature via MQTT command."""
        if self.entity_description.key == "gnss_publish":
            await self.coordinator.async_send_command(
                self._scanner_id,
                ScannerCommandAction.GPS_ENABLE.value,
                {"broker": CommandBrokerScope.BOTH.value},
            )
        elif self.entity_description.key == "firmware_auto_update":
            await self.coordinator.async_send_command(
                self._scanner_id,
                ScannerCommandAction.FIRMWARE_AUTO_UPDATE.value,
                {"enabled": True},
            )
        else:
            raise HomeAssistantError("Unknown switch")
        self._attr_is_on = True
        self.async_write_ha_state()

    async def async_turn_off(self, **kwargs: object) -> None:
        """Disable feature via MQTT command."""
        if self.entity_description.key == "gnss_publish":
            await self.coordinator.async_send_command(
                self._scanner_id,
                ScannerCommandAction.GPS_DISABLE.value,
                {"broker": CommandBrokerScope.BOTH.value},
            )
        elif self.entity_description.key == "firmware_auto_update":
            await self.coordinator.async_send_command(
                self._scanner_id,
                ScannerCommandAction.FIRMWARE_AUTO_UPDATE.value,
                {"enabled": False},
            )
        else:
            raise HomeAssistantError("Unknown switch")
        self._attr_is_on = False
        self.async_write_ha_state()
