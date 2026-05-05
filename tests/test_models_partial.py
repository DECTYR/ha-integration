"""Robustness tests for model parsing."""

from __future__ import annotations

from custom_components.dectyr_rx5.const import FIX_QUALITY_MAP, map_fix_quality
from custom_components.dectyr_rx5.models import Drone, Scanner


def test_fix_quality_map() -> None:
    assert FIX_QUALITY_MAP[0] == "invalid"
    assert FIX_QUALITY_MAP[1] == "gnss"
    assert FIX_QUALITY_MAP[2] == "dgps"
    assert map_fix_quality(99) is None
    assert map_fix_quality(None) is None


def test_scanner_missing_required(example_payload) -> None:
    payload = dict(example_payload("scanner_status_online"))
    del payload["status"]
    parsed = Scanner.from_status_payload(
        payload,
        topic_scanner_id="217d1a7e7e3ec86a",
        topic="dronedetector/217d1a7e7e3ec86a/status",
    )
    assert parsed is None


def test_drone_missing_required(example_payload) -> None:
    payload = dict(example_payload("drone_data_complete"))
    del payload["rssi"]
    drone = Drone.from_drone_payload(
        payload,
        topic_drone_id="1581f5fhb228q00201um",
        topic_scanner_id="217d1a7e7e3ec86a",
        topic=("dronedetector/217d1a7e7e3ec86a/drones/1581f5fhb228q00201um/data"),
    )
    assert drone is None


def test_drone_invalid_enums_fallback(example_payload) -> None:
    payload = dict(example_payload("drone_data_complete"))
    payload["broadcast_protocol"] = "not-a-real-protocol"
    drone = Drone.from_drone_payload(
        payload,
        topic_drone_id="1581f5fhb228q00201um",
        topic_scanner_id="217d1a7e7e3ec86a",
        topic=("dronedetector/217d1a7e7e3ec86a/drones/1581f5fhb228q00201um/data"),
    )
    assert drone is None
