"""Scanner number entities (UPS SoC max)."""

from __future__ import annotations

from typing import TYPE_CHECKING

from homeassistant.components.number import NumberEntity, NumberEntityDescription, NumberMode
from homeassistant.const import EntityCategory
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.dispatcher import async_dispatcher_connect
from homeassistant.helpers.entity_platform import AddEntitiesCallback

from .const import DOMAIN, SIGNAL_NEW_SCANNER, SIGNAL_SCANNER_REMOVED, ScannerCommandAction
from .entity import DectyrScannerEntity

if TYPE_CHECKING:
    from homeassistant.config_entries import ConfigEntry

    from .coordinator import DectyrCoordinator

UPS_SOC_DESC = NumberEntityDescription(
    key="ups_soc_max",
    translation_key="ups_soc_max",
    entity_category=EntityCategory.CONFIG,
    native_min_value=50,
    native_max_value=100,
    native_step=5,
    mode=NumberMode.SLIDER,
)


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    """Set up number entities for each scanner."""
    coordinator: DectyrCoordinator = hass.data[DOMAIN][entry.entry_id]["coordinator"]
    seen: set[str] = set()

    @callback
    def _async_add_scanner(scanner_id: str) -> None:
        if scanner_id in seen:
            return
        seen.add(scanner_id)
        async_add_entities([DectyrUpsSocMaxNumber(coordinator, scanner_id)])

    for scanner in coordinator.get_all_scanners():
        _async_add_scanner(scanner.scanner_id)

    entry.async_on_unload(async_dispatcher_connect(hass, SIGNAL_NEW_SCANNER, _async_add_scanner))

    @callback
    def _async_scanner_removed(sid: str) -> None:
        seen.discard(sid)

    entry.async_on_unload(
        async_dispatcher_connect(hass, SIGNAL_SCANNER_REMOVED, _async_scanner_removed)
    )


class DectyrUpsSocMaxNumber(DectyrScannerEntity, NumberEntity):
    """UPS maximum charge level."""

    def __init__(self, coordinator: DectyrCoordinator, scanner_id: str) -> None:
        """Initialize."""
        super().__init__(coordinator, scanner_id, UPS_SOC_DESC)

    @property
    def native_value(self) -> float | None:
        """Current soc_max from scanner battery payload."""
        scanner = self.coordinator.get_scanner(self._scanner_id)
        if not scanner or not scanner.battery or scanner.battery.soc_max is None:
            return None
        return float(scanner.battery.soc_max)

    async def async_set_native_value(self, value: float) -> None:
        """Publish set_ups_soc_max command."""
        await self.coordinator.async_send_command(
            self._scanner_id,
            ScannerCommandAction.SET_UPS_SOC_MAX.value,
            {"soc_max": int(round(value))},
        )
