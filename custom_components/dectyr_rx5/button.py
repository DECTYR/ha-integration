"""Scanner command buttons."""

from __future__ import annotations

import logging
from dataclasses import dataclass
from typing import TYPE_CHECKING, Any

from homeassistant.components.button import (
    ButtonDeviceClass,
    ButtonEntity,
    ButtonEntityDescription,
)
from homeassistant.const import EntityCategory
from homeassistant.core import HomeAssistant, callback
from homeassistant.exceptions import HomeAssistantError
from homeassistant.helpers.dispatcher import async_dispatcher_connect
from homeassistant.helpers.entity_platform import AddEntitiesCallback

from .const import DOMAIN, SIGNAL_NEW_SCANNER, SIGNAL_SCANNER_REMOVED, ScannerCommandAction
from .entity import DectyrScannerEntity

if TYPE_CHECKING:
    from homeassistant.config_entries import ConfigEntry

    from .coordinator import DectyrCoordinator

_LOGGER = logging.getLogger(__name__)


@dataclass(frozen=True, kw_only=True)
class DectyrScannerButtonDescription(ButtonEntityDescription):
    """Scanner button tied to an MQTT command."""

    action: ScannerCommandAction
    params: dict[str, Any] | None = None
    suppress_command_errors: bool = False


SCANNER_BUTTONS: tuple[DectyrScannerButtonDescription, ...] = (
    DectyrScannerButtonDescription(
        key="reboot",
        translation_key="scanner_reboot",
        device_class=ButtonDeviceClass.RESTART,
        entity_category=EntityCategory.CONFIG,
        action=ScannerCommandAction.REBOOT,
    ),
    DectyrScannerButtonDescription(
        key="firmware_check_update",
        translation_key="firmware_check_update",
        entity_category=EntityCategory.CONFIG,
        action=ScannerCommandAction.FIRMWARE_UPGRADE,
    ),
    DectyrScannerButtonDescription(
        key="firmware_refresh",
        translation_key="firmware_refresh",
        entity_category=EntityCategory.CONFIG,
        action=ScannerCommandAction.FIRMWARE_REFRESH,
    ),
    DectyrScannerButtonDescription(
        key="get_scanner_logs",
        translation_key="get_scanner_logs",
        entity_category=EntityCategory.DIAGNOSTIC,
        action=ScannerCommandAction.GET_LOGS,
        params={"type": "scanner", "lines": 200},
        suppress_command_errors=True,
    ),
    DectyrScannerButtonDescription(
        key="get_system_logs",
        translation_key="get_system_logs",
        entity_category=EntityCategory.DIAGNOSTIC,
        action=ScannerCommandAction.GET_LOGS,
        params={"type": "system", "lines": 200},
        suppress_command_errors=True,
    ),
    DectyrScannerButtonDescription(
        key="get_error_logs",
        translation_key="get_error_logs",
        entity_category=EntityCategory.DIAGNOSTIC,
        action=ScannerCommandAction.GET_LOGS,
        params={"type": "errors", "lines": 200},
        suppress_command_errors=True,
    ),
    DectyrScannerButtonDescription(
        key="get_web_logs",
        translation_key="get_web_logs",
        entity_category=EntityCategory.DIAGNOSTIC,
        action=ScannerCommandAction.GET_LOGS,
        params={"type": "web", "lines": 200},
        suppress_command_errors=True,
    ),
)


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    """Set up buttons for each scanner."""
    coordinator: DectyrCoordinator = hass.data[DOMAIN][entry.entry_id]["coordinator"]
    seen: set[str] = set()

    @callback
    def _async_add_scanner(scanner_id: str) -> None:
        if scanner_id in seen:
            return
        seen.add(scanner_id)
        async_add_entities(
            [DectyrScannerButton(coordinator, scanner_id, desc) for desc in SCANNER_BUTTONS]
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


class DectyrScannerButton(DectyrScannerEntity, ButtonEntity):
    """MQTT command button for a scanner."""

    entity_description: DectyrScannerButtonDescription

    def __init__(
        self,
        coordinator: DectyrCoordinator,
        scanner_id: str,
        description: DectyrScannerButtonDescription,
    ) -> None:
        """Initialize."""
        super().__init__(coordinator, scanner_id, description)

    async def async_press(self) -> None:
        """Publish command and wait for response."""
        desc = self.entity_description
        try:
            await self.coordinator.async_send_command(
                self._scanner_id,
                desc.action.value,
                dict(desc.params) if desc.params else {},
            )
        except HomeAssistantError as err:
            if desc.suppress_command_errors:
                _LOGGER.warning("%s: %s", self.entity_id, err)
                return
            raise
