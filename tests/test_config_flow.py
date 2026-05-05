"""Config flow tests."""

from __future__ import annotations

from unittest.mock import AsyncMock

from homeassistant.config_entries import SOURCE_USER
from homeassistant.data_entry_flow import FlowResultType

from custom_components.dectyr_rx5.const import CONF_MQTT_PREFIX, DOMAIN


async def test_config_flow_aborts_without_mqtt(hass, monkeypatch) -> None:
    monkeypatch.setattr(
        "custom_components.dectyr_rx5.config_flow._mqtt_loaded",
        lambda _h: False,
    )
    result = await hass.config_entries.flow.async_init(DOMAIN, context={"source": SOURCE_USER})
    assert result["type"] == FlowResultType.ABORT
    assert result["reason"] == "mqtt_required"


async def test_config_flow_invalid_prefix(hass, monkeypatch, mqtt_mock) -> None:
    monkeypatch.setattr(
        "custom_components.dectyr_rx5.config_flow.DectyrRx5ConfigFlow._async_probe_prefix",
        AsyncMock(return_value=set()),
    )

    result = await hass.config_entries.flow.async_init(DOMAIN, context={"source": SOURCE_USER})
    assert result["type"] == FlowResultType.FORM

    result = await hass.config_entries.flow.async_configure(
        result["flow_id"],
        {CONF_MQTT_PREFIX: "bad#topic"},
    )
    assert result["type"] == FlowResultType.FORM
    assert result["errors"]["base"] == "invalid_prefix"


async def test_config_flow_multisegment_prefix(hass, monkeypatch, mqtt_mock) -> None:
    monkeypatch.setattr(
        "custom_components.dectyr_rx5.config_flow.DectyrRx5ConfigFlow._async_probe_prefix",
        AsyncMock(return_value=set()),
    )

    result = await hass.config_entries.flow.async_init(DOMAIN, context={"source": SOURCE_USER})
    result = await hass.config_entries.flow.async_configure(
        result["flow_id"],
        {CONF_MQTT_PREFIX: "home/security/drones"},
    )
    assert result["type"] == FlowResultType.CREATE_ENTRY
    assert result["data"][CONF_MQTT_PREFIX] == "home/security/drones"


async def test_config_flow_discovery_step(hass, monkeypatch, mqtt_mock) -> None:
    monkeypatch.setattr(
        "custom_components.dectyr_rx5.config_flow.DectyrRx5ConfigFlow._async_probe_prefix",
        AsyncMock(return_value={"217d1a7e7e3ec86a"}),
    )

    result = await hass.config_entries.flow.async_init(DOMAIN, context={"source": SOURCE_USER})
    result = await hass.config_entries.flow.async_configure(
        result["flow_id"],
        {CONF_MQTT_PREFIX: "dronedetector"},
    )
    assert result["type"] == FlowResultType.FORM
    assert result["step_id"] == "discovery"

    result = await hass.config_entries.flow.async_configure(result["flow_id"], user_input={})
    assert result["type"] == FlowResultType.CREATE_ENTRY
