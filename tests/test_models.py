"""Parse every payload example shipped with `tests/fixtures/mqtt_schema.json`."""

from __future__ import annotations

import pytest

from custom_components.dectyr_rx5.models import (
    CommandResponse,
    Drone,
    OperatorData,
    Scanner,
    ScannerCommand,
    ScannerErrorMessage,
    _filter_odid_sentinel,
    _normalize_odid_idtype,
    _normalize_odid_uatype,
    primary_distance_to_scanner,
)
from custom_components.dectyr_rx5.mqtt_client import (
    parse_command_response_topic,
    parse_drone_data_topic,
    parse_scanner_errors_topic,
    parse_scanner_status_topic,
)


def _prefix_scanner_from_status_topic(topic: str) -> tuple[str, str]:
    parts = topic.split("/")
    return "/".join(parts[:-2]), parts[-2]


@pytest.mark.parametrize(
    "name",
    [
        "scanner_status_online",
        "scanner_status_online_with_alerts",
        "scanner_status_offline_graceful",
        "scanner_status_offline_lwt",
    ],
)
def test_scanner_status_examples(name: str, example_payload, example_topic) -> None:
    topic = example_topic(name)
    payload = example_payload(name)
    prefix, scanner_id = _prefix_scanner_from_status_topic(topic)
    assert parse_scanner_status_topic(topic, prefix) == scanner_id
    parsed = Scanner.from_status_payload(
        payload,
        topic_scanner_id=scanner_id,
        topic=topic,
    )
    assert parsed is not None
    assert parsed.scanner_id == scanner_id


def test_drone_data_complete(example_payload, example_topic) -> None:
    topic = example_topic("drone_data_complete")
    payload = example_payload("drone_data_complete")
    prefix = "dronedetector"
    parsed_topic = parse_drone_data_topic(topic, prefix)
    assert parsed_topic is not None
    scanner_id, drone_id = parsed_topic
    drone = Drone.from_drone_payload(
        payload,
        topic_drone_id=drone_id,
        topic_scanner_id=scanner_id,
        topic=topic,
    )
    assert drone is not None
    assert drone.drone_id == drone_id
    assert drone.distance_to_scanner == pytest.approx(25.3)
    assert drone.distance_by_scanner is not None
    assert dict(drone.distance_by_scanner)[scanner_id] == pytest.approx(25.3)


@pytest.mark.parametrize(
    "name",
    [
        "command_reboot",
        "command_set_mqtt_broker",
        "command_get_logs",
        "command_set_mqtt_broker_secondary",
    ],
)
def test_command_examples(name: str, example_payload) -> None:
    payload = example_payload(name)
    cmd = ScannerCommand.from_payload(payload)
    assert cmd is not None


@pytest.mark.parametrize(
    "name",
    [
        "command_get_logs_response",
        "command_response_success",
        "command_response_error",
    ],
)
def test_command_response_examples(name: str, example_payload, example_topic) -> None:
    topic = example_topic(name)
    payload = example_payload(name)
    prefix = "dronedetector"
    scanner_id = parse_command_response_topic(topic, prefix)
    assert scanner_id is not None
    rsp = CommandResponse.from_payload(
        payload,
        topic_scanner_id=scanner_id,
        topic=topic,
    )
    assert rsp is not None


def test_normalize_odid_idtype_numeric() -> None:
    assert _normalize_odid_idtype("2") == "ODID_IDTYPE_CAA_REGISTRATION_ID"


def test_normalize_odid_idtype_symbolic_passthrough() -> None:
    assert _normalize_odid_idtype("ODID_IDTYPE_SERIAL_NUMBER") == "ODID_IDTYPE_SERIAL_NUMBER"


def test_normalize_odid_idtype_unknown() -> None:
    assert _normalize_odid_idtype("99") == "99"


def test_normalize_odid_uatype_numeric() -> None:
    assert _normalize_odid_uatype("1") == "ODID_UATYPE_AEROPLANE"


def test_filter_odid_invalid_altitude() -> None:
    assert _filter_odid_sentinel(-1000.0, -1000.0) is None
    assert _filter_odid_sentinel(150.0, -1000.0) == 150.0
    assert _filter_odid_sentinel(None, -1000.0) is None


def test_filter_odid_direction_sentinel() -> None:
    assert _filter_odid_sentinel(361.0, 361.0) is None
    assert _filter_odid_sentinel(180.0, 361.0) == 180.0


def test_filter_odid_speed_sentinel() -> None:
    assert _filter_odid_sentinel(255.0, 255.0) is None
    assert _filter_odid_sentinel(12.5, 255.0) == 12.5


def test_primary_distance_prefers_best_rssi_scanner() -> None:
    assert primary_distance_to_scanner(
        (("s1", -50), ("s2", -70)),
        (("s1", 100.0), ("s2", 10.0)),
    ) == pytest.approx(100.0)


def test_primary_distance_min_when_best_rssi_has_no_distance() -> None:
    assert primary_distance_to_scanner(
        (("s1", -50), ("s2", -70)),
        (("s2", 10.0),),
    ) == pytest.approx(10.0)


def test_primary_distance_none_when_no_distances() -> None:
    assert primary_distance_to_scanner((("s1", -50),), None) is None


def test_drone_payload_with_numeric_id_type() -> None:
    payload = {
        "scanner_id": "S1",
        "mac": "aa:bb:cc:dd:ee:ff",
        "timestamp": "2026-05-04T10:00:00Z",
        "broadcast_protocol": "WiFi-Beacon",
        "signal_type": "RemoteID-EU",
        "rssi": -70,
        "complete": True,
        "drone_id": "TEST",
        "id_type": "2",
        "ua_type": "1",
    }
    d = Drone.from_drone_payload(
        payload,
        topic_drone_id="TEST",
        topic_scanner_id="S1",
        topic="dronedetector/S1/drones/TEST/data",
    )
    assert d is not None
    assert d.id_type == "ODID_IDTYPE_CAA_REGISTRATION_ID"
    assert d.ua_type == "ODID_UATYPE_AEROPLANE"


def test_drone_payload_altitude_direction_speed_sentinels() -> None:
    payload = {
        "scanner_id": "S1",
        "mac": "aa:bb:cc:dd:ee:ff",
        "timestamp": "2026-05-04T10:00:00Z",
        "broadcast_protocol": "WiFi-Beacon",
        "signal_type": "RemoteID-EU",
        "rssi": -70,
        "complete": True,
        "altitude_msl": -1000.0,
        "height_agl": -1000.0,
        "direction": 361.0,
        "speed_horizontal": 255.0,
        "speed_vertical": 255.0,
    }
    d = Drone.from_drone_payload(
        payload,
        topic_drone_id="DR1",
        topic_scanner_id="S1",
        topic="dronedetector/S1/drones/DR1/data",
    )
    assert d is not None
    assert d.altitude_msl is None
    assert d.height_agl is None
    assert d.direction is None
    assert d.speed_horizontal is None
    assert d.speed_vertical is None


def test_operator_altitude_sentinel() -> None:
    payload = {"latitude": 43.5, "longitude": 7.1, "altitude": -1000.0}
    op = OperatorData.from_dict(payload)
    assert op is not None
    assert op.altitude is None


def test_scanner_errors_example(example_payload) -> None:
    example = example_payload("scanner_errors")
    topic = "dronedetector/217d1a7e7e3ec86a/errors"
    payload = example
    prefix = "dronedetector"
    scanner_id = parse_scanner_errors_topic(topic, prefix)
    assert scanner_id == "217d1a7e7e3ec86a"
    err = ScannerErrorMessage.from_payload(
        payload,
        topic_scanner_id=scanner_id,
        topic=topic,
    )
    assert err is not None
