"""Pytest configuration for dectyr_rx5 tests."""

from __future__ import annotations

import json
import sys
from pathlib import Path

import pytest
from pytest_homeassistant_custom_component.common import MockConfigEntry

from custom_components.dectyr_rx5.const import DOMAIN

# Repository root so `custom_components` is importable during tests.
_ROOT = Path(__file__).resolve().parent.parent
if str(_ROOT) not in sys.path:
    sys.path.insert(0, str(_ROOT))

pytest_plugins = "pytest_homeassistant_custom_component"


@pytest.fixture(autouse=True)
def _auto_enable_custom_integrations(enable_custom_integrations) -> None:
    """Clear custom integration cache so Home Assistant rescans `custom_components`."""


@pytest.fixture
def mqtt_schema() -> dict:
    """Load MQTT example fixtures (committed); optional local override in docs/."""
    fixtures = _ROOT / "tests" / "fixtures" / "mqtt_schema.json"
    legacy = _ROOT / "docs" / "mqtt-schema.json"
    path = fixtures if fixtures.is_file() else legacy
    return json.loads(path.read_text(encoding="utf-8"))


@pytest.fixture
def example_payload(mqtt_schema: dict):
    """Return example payloads by name from the schema."""

    def _get(name: str) -> dict:
        examples = mqtt_schema["examples"][name]
        return examples["payload"]

    return _get


@pytest.fixture
def example_topic(mqtt_schema: dict):
    """Return example topics by name from the schema."""

    def _get(name: str) -> str:
        examples = mqtt_schema["examples"][name]
        return examples["topic"]

    return _get


@pytest.fixture
async def setup_entry_with_scanner(hass, mqtt_mock, example_payload, example_topic):
    """Load config entry and ingest one online scanner from schema examples."""
    entry = MockConfigEntry(domain=DOMAIN, title="t", data={"mqtt_prefix": "dronedetector"})
    entry.add_to_hass(hass)
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    coordinator = hass.data[DOMAIN][entry.entry_id]["coordinator"]
    topic = example_topic("scanner_status_online")
    payload = example_payload("scanner_status_online")
    await coordinator.async_handle_scanner_status(topic, payload)
    await hass.async_block_till_done()
    scanner_id = payload["scanner_id"]
    return coordinator, entry, scanner_id
