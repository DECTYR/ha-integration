"""Diagnostics redaction tests."""

from __future__ import annotations

from custom_components.dectyr_rx5.diagnostics import (
    redact_coordinate,
    redact_mac,
    redact_public_ips,
)


def test_redact_public_ip() -> None:
    assert "135.1.2.3" not in redact_public_ips("broker 135.1.2.3 end")
    assert "10.0.0.1" in redact_public_ips("local 10.0.0.1 ok")


def test_redact_mac() -> None:
    assert redact_mac("D8:3A:DD:AB:12:34") == "D8:3A:DD:**:**:**"


def test_redact_coordinate() -> None:
    assert redact_coordinate(43.563569) == 43.56
