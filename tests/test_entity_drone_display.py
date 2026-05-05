"""Tests for drone device registry display strings."""

from __future__ import annotations

from types import SimpleNamespace

import pytest

from custom_components.dectyr_rx5.const import UaType
from custom_components.dectyr_rx5.entity import (
    drone_device_name,
    drone_registry_model,
    drone_registry_serial,
    friendly_ua_type_label,
)


class _FakeHassConfig:
    def __init__(self, language: str) -> None:
        self.language = language


class _FakeHass:
    def __init__(self, language: str) -> None:
        self.config = _FakeHassConfig(language)


def test_drone_device_name_uses_brand_and_serial_when_no_model() -> None:
    drone = SimpleNamespace(
        drone_id="1588e040465db000451",
        model="",
        manufacturer="Parrot",
        payload_drone_id="1588E040465DB000451",
        identification=None,
    )
    assert drone_device_name(drone) == "Parrot 1588E040465DB000451"


def test_drone_device_name_prefixes_brand_before_model() -> None:
    drone = SimpleNamespace(
        drone_id="x",
        model="Matrice 4T",
        manufacturer="DJI",
        identification=None,
    )
    assert drone_device_name(drone) == "DJI Matrice 4T"


def test_drone_device_name_skips_duplicate_brand_prefix() -> None:
    drone = SimpleNamespace(
        drone_id="x",
        model="DJI Matrice 4T",
        manufacturer="DJI",
        identification=None,
    )
    assert drone_device_name(drone) == "DJI Matrice 4T"


@pytest.mark.parametrize(
    ("lang", "needle"),
    [
        ("fr", "Hélicoptère"),
        ("en", "Helicopter"),
        ("fr-FR", "Hélicoptère"),
    ],
)
def test_friendly_ua_type_respects_ha_language(lang: str, needle: str) -> None:
    hass = _FakeHass(lang)
    out = friendly_ua_type_label(hass, UaType.HELICOPTER_OR_MULTIROTOR)
    assert out is not None
    assert needle in out


def test_drone_registry_model_puts_aircraft_type_before_product() -> None:
    hass = _FakeHass("fr")
    drone = SimpleNamespace(
        drone_id="abc123",
        payload_drone_id="1581F7K3BROADCAST",
        ua_type=UaType.HELICOPTER_OR_MULTIROTOR,
        model="Matrice 4T",
    )
    assert drone_registry_model(hass, drone, "abc123") == "Hélicoptère / Multirotor · Matrice 4T"


def test_drone_registry_model_product_only_when_no_ua_type() -> None:
    hass = _FakeHass("fr")
    drone = SimpleNamespace(
        drone_id="x",
        model="Anafi",
        ua_type=None,
    )
    assert drone_registry_model(hass, drone, "x") == "Anafi"


def test_drone_registry_model_falls_back_to_ua_type_without_product() -> None:
    hass = _FakeHass("fr")
    drone = SimpleNamespace(
        drone_id="topicidlower",
        payload_drone_id=None,
        ua_type=UaType.AEROPLANE,
        model="",
    )
    assert drone_registry_model(hass, drone, "topicidlower") == "Avion"


def test_drone_registry_model_unknown_without_product_or_ua() -> None:
    hass = _FakeHass("fr")
    drone = SimpleNamespace(
        drone_id="x",
        model="",
        ua_type=None,
    )
    assert drone_registry_model(hass, drone, "x") == "Unknown"


def test_drone_registry_serial_prefers_payload_id() -> None:
    drone = SimpleNamespace(
        drone_id="lowerid",
        payload_drone_id="UPPERIDFROMBROADCAST",
    )
    assert drone_registry_serial(drone, "lowerid") == "UPPERIDFROMBROADCAST"


def test_drone_registry_serial_falls_back_to_topic_id() -> None:
    drone = SimpleNamespace(drone_id="only", payload_drone_id=None)
    assert drone_registry_serial(drone, "only") == "only"
