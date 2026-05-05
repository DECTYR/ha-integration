"""Config flow for Dectyr RX-5."""

from __future__ import annotations

import asyncio
from typing import Any

import voluptuous as vol
from homeassistant import config_entries
from homeassistant.components import mqtt
from homeassistant.components.mqtt import DOMAIN as MQTT_DOMAIN
from homeassistant.config_entries import ConfigEntryState
from homeassistant.core import HomeAssistant, callback

from .const import (
    CONF_COMMAND_TIMEOUT,
    CONF_DRONE_INACTIVITY_TIMEOUT,
    CONF_DRONE_PURGE_AFTER,
    CONF_ENABLE_UNKNOWN_SCANNER_WARNING,
    CONF_MQTT_PREFIX,
    CONF_SCANNER_OFFLINE_TIMEOUT,
    DEFAULT_COMMAND_TIMEOUT,
    DEFAULT_DRONE_INACTIVITY_TIMEOUT,
    DEFAULT_DRONE_PURGE_AFTER,
    DEFAULT_ENABLE_UNKNOWN_SCANNER_WARNING,
    DEFAULT_MQTT_PREFIX,
    DEFAULT_SCANNER_OFFLINE_TIMEOUT,
    DOMAIN,
    MQTT_PREFIX_RE,
    topic_subscription_status,
)
from .mqtt_client import parse_scanner_status_topic


def _mqtt_loaded(hass: HomeAssistant) -> bool:
    """Return True when the MQTT config entry is loaded."""
    return any(
        entry.state is ConfigEntryState.LOADED
        for entry in hass.config_entries.async_entries(MQTT_DOMAIN)
    )


class DectyrRx5ConfigFlow(config_entries.ConfigFlow, domain=DOMAIN):
    """Handle UI configuration."""

    VERSION = 1

    def __init__(self) -> None:
        """Initialize flow."""
        super().__init__()
        self._discovered_scanners: list[str] = []
        self._pending_prefix: str | None = None

    async def async_step_user(
        self,
        user_input: dict[str, Any] | None = None,
    ) -> config_entries.ConfigFlowResult:
        """Configure MQTT prefix."""
        if not _mqtt_loaded(self.hass):
            return self.async_abort(reason="mqtt_required")

        errors: dict[str, str] = {}
        if user_input is not None:
            prefix = user_input[CONF_MQTT_PREFIX].strip().strip("/")
            if not prefix or MQTT_PREFIX_RE.fullmatch(prefix) is None:
                errors["base"] = "invalid_prefix"
            else:
                await self.async_set_unique_id(f"{DOMAIN}_{prefix}")
                self._abort_if_unique_id_configured()

                discovered = await self._async_probe_prefix(prefix, timeout_s=5.0)
                self._discovered_scanners = sorted(discovered)
                self._pending_prefix = prefix

                if self._discovered_scanners:
                    return await self.async_step_discovery()
                return self.async_create_entry(
                    title=f"Dectyr RX-5 ({prefix})",
                    data={CONF_MQTT_PREFIX: prefix},
                )

        return self.async_show_form(
            step_id="user",
            data_schema=vol.Schema(
                {
                    vol.Required(CONF_MQTT_PREFIX, default=DEFAULT_MQTT_PREFIX): str,
                }
            ),
            errors=errors,
        )

    async def async_step_discovery(
        self,
        user_input: dict[str, Any] | None = None,
    ) -> config_entries.ConfigFlowResult:
        """Optional informational step when scanners were heard during probing."""
        if self._pending_prefix is None:
            return self.async_abort(reason="unknown")

        if user_input is not None:
            prefix = self._pending_prefix
            return self.async_create_entry(
                title=f"Dectyr RX-5 ({prefix})",
                data={CONF_MQTT_PREFIX: prefix},
            )

        scanners = ", ".join(self._discovered_scanners)
        return self.async_show_form(
            step_id="discovery",
            data_schema=vol.Schema({}),
            description_placeholders={"scanners": scanners},
        )

    async def _async_probe_prefix(self, prefix: str, *, timeout_s: float) -> set[str]:
        """Listen for `{prefix}/+/status` briefly to discover scanners (non-blocking)."""
        topic = topic_subscription_status(prefix)
        found: set[str] = set()

        async def _on_message(msg: mqtt.ReceiveMessage) -> None:
            scanner_id = parse_scanner_status_topic(msg.topic, prefix)
            if scanner_id:
                found.add(scanner_id)

        unsub = await mqtt.async_subscribe(self.hass, topic, _on_message, qos=1)
        try:
            await asyncio.sleep(timeout_s)
        finally:
            unsub()

        return found

    @staticmethod
    @callback
    def async_get_options_flow(
        config_entry: config_entries.ConfigEntry,
    ) -> DectyrRx5OptionsFlow:
        """Options flow factory."""
        return DectyrRx5OptionsFlow(config_entry)


class DectyrRx5OptionsFlow(config_entries.OptionsFlow):
    """Runtime tuning for timeouts and warnings."""

    def __init__(self, config_entry: config_entries.ConfigEntry) -> None:
        """Initialize options flow."""
        super().__init__(config_entry)

    async def async_step_init(
        self,
        user_input: dict[str, Any] | None = None,
    ) -> config_entries.ConfigFlowResult:
        """Manage options."""
        if user_input is not None:
            return self.async_create_entry(title="", data=user_input)

        opts = self.config_entry.options
        drone_inactivity = int(
            opts.get(CONF_DRONE_INACTIVITY_TIMEOUT, DEFAULT_DRONE_INACTIVITY_TIMEOUT)
        )
        drone_purge = int(opts.get(CONF_DRONE_PURGE_AFTER, DEFAULT_DRONE_PURGE_AFTER))
        scanner_offline = int(
            opts.get(CONF_SCANNER_OFFLINE_TIMEOUT, DEFAULT_SCANNER_OFFLINE_TIMEOUT)
        )
        unknown_warn = bool(
            opts.get(
                CONF_ENABLE_UNKNOWN_SCANNER_WARNING,
                DEFAULT_ENABLE_UNKNOWN_SCANNER_WARNING,
            )
        )
        command_timeout = int(opts.get(CONF_COMMAND_TIMEOUT, DEFAULT_COMMAND_TIMEOUT))

        schema = vol.Schema(
            {
                vol.Required(CONF_DRONE_INACTIVITY_TIMEOUT, default=drone_inactivity): vol.All(
                    vol.Coerce(int),
                    vol.Range(min=30, max=604800),
                ),
                vol.Required(CONF_DRONE_PURGE_AFTER, default=drone_purge): vol.All(
                    vol.Coerce(int),
                    vol.Range(min=300, max=2592000),
                ),
                vol.Required(CONF_SCANNER_OFFLINE_TIMEOUT, default=scanner_offline): vol.All(
                    vol.Coerce(int),
                    vol.Range(min=10, max=3600),
                ),
                vol.Required(
                    CONF_ENABLE_UNKNOWN_SCANNER_WARNING,
                    default=unknown_warn,
                ): bool,
                vol.Required(CONF_COMMAND_TIMEOUT, default=command_timeout): vol.All(
                    vol.Coerce(int),
                    vol.Range(min=5, max=420),
                ),
            }
        )

        return self.async_show_form(step_id="init", data_schema=schema)
