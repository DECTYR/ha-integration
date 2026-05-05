"""Repairs flows for Dectyr RX-5 (MQTT setup, acknowledgements)."""

from __future__ import annotations

import voluptuous as vol
from homeassistant import data_entry_flow
from homeassistant.components.mqtt import DOMAIN as MQTT_DOMAIN
from homeassistant.components.repairs import ConfirmRepairFlow, RepairsFlow
from homeassistant.config_entries import ConfigEntryState
from homeassistant.core import HomeAssistant


def mqtt_integration_loaded(hass: HomeAssistant) -> bool:
    """True when at least one MQTT config entry is loaded."""
    return any(
        e.state is ConfigEntryState.LOADED for e in hass.config_entries.async_entries(MQTT_DOMAIN)
    )


class DectyrMqttRequiredRepairFlow(RepairsFlow):
    """Confirm step: user configures MQTT, then submits to verify."""

    async def async_step_init(
        self, user_input: dict[str, str] | None = None
    ) -> data_entry_flow.FlowResult:
        """Forward to confirm."""
        return await self.async_step_confirm(user_input)

    async def async_step_confirm(
        self, user_input: dict[str, str] | None = None
    ) -> data_entry_flow.FlowResult:
        """Dismiss repair when MQTT is loaded; otherwise abort without deleting."""
        if user_input is not None:
            if mqtt_integration_loaded(self.hass):
                return self.async_create_entry(title="", data={})
            return self.async_abort(reason="still_required")
        return self.async_show_form(step_id="confirm", data_schema=vol.Schema({}))


async def async_create_fix_flow(
    hass: HomeAssistant,
    issue_id: str,
    data: dict[str, str | int | float | None] | None,
) -> RepairsFlow:
    """Return a repair flow for fixable issues."""
    if issue_id == "mqtt_required":
        return DectyrMqttRequiredRepairFlow()
    return ConfirmRepairFlow()
