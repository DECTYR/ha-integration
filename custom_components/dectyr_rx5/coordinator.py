"""In-memory scanner/drone registry with MQTT-driven updates and persistence."""

from __future__ import annotations

import asyncio
import json
import logging
import uuid
from dataclasses import dataclass, replace
from datetime import datetime, timedelta
from typing import TYPE_CHECKING, Any

from homeassistant.components import mqtt
from homeassistant.components.mqtt import DOMAIN as MQTT_DOMAIN
from homeassistant.config_entries import ConfigEntryState
from homeassistant.core import HomeAssistantError
from homeassistant.helpers import device_registry as dr
from homeassistant.helpers import issue_registry as ir
from homeassistant.helpers.dispatcher import async_dispatcher_send
from homeassistant.helpers.event import async_track_time_interval
from homeassistant.helpers.storage import Store
from homeassistant.util import dt as dt_util

from .const import (
    CONF_COMMAND_TIMEOUT,
    CONF_DRONE_INACTIVITY_TIMEOUT,
    CONF_DRONE_PURGE_AFTER,
    CONF_ENABLE_UNKNOWN_SCANNER_WARNING,
    CONF_SCANNER_OFFLINE_TIMEOUT,
    DOMAIN,
    EVENT_DRONE_DETECTED,
    EVENT_DRONE_LOST,
    EVENT_DRONE_PURGED,
    EVENT_LOGS_RECEIVED,
    EVENT_SCANNER_ALERT,
    EVENT_SCANNER_ERROR,
    SIGNAL_DRONE_REMOVED,
    SIGNAL_NEW_DRONE,
    SIGNAL_NEW_SCANNER,
    STORAGE_VERSION,
    AlertLevel,
    CommandResponseStatus,
    ScannerCommandAction,
    drone_entity_removed_signal,
    drone_update_signal,
    scanner_update_signal,
    topic_publish_command,
)
from .models import (
    Alert,
    CommandResponse,
    Drone,
    Scanner,
    ScannerConnectionStatus,
    ScannerErrorMessage,
    _freeze_mapping_float,
    primary_distance_to_scanner,
)
from .services_helpers import (
    command_response_to_dict,
    command_timeout_seconds,
    parse_command_action,
)

if TYPE_CHECKING:
    from homeassistant.config_entries import ConfigEntry
    from homeassistant.core import HomeAssistant

_LOGGER = logging.getLogger(__name__)


@dataclass(slots=True)
class _PendingCommand:
    """In-flight MQTT command waiting for commands/response."""

    future: asyncio.Future[CommandResponse]
    action: ScannerCommandAction


def _scanner_placeholder(scanner_id: str) -> Scanner:
    """Minimal scanner row restored before MQTT retain arrives."""
    now = dt_util.utcnow()
    return Scanner(
        scanner_id=scanner_id,
        status=ScannerConnectionStatus.OFFLINE,
        timestamp=now,
        available=False,
        last_seen=None,
        received_at=None,
    )


def _freeze_rssi(mapping: dict[str, int]) -> tuple[tuple[str, int], ...]:
    return tuple(sorted(mapping.items(), key=lambda x: x[0]))


class DectyrCoordinator:
    """Registry for scanners/drones: MQTT callbacks, timeouts, Store persistence."""

    def __init__(self, hass: HomeAssistant, entry: ConfigEntry) -> None:
        """Initialize coordinator."""
        self.hass = hass
        self.entry = entry
        self._prefix: str = entry.data["mqtt_prefix"]
        self._store = Store(hass, STORAGE_VERSION, f"{DOMAIN}.{entry.entry_id}")

        self._scanners: dict[str, Scanner] = {}
        self._drones: dict[str, Drone] = {}

        self._scanners_seen_online: set[str] = set()
        self._known_critical_alerts: dict[str, set[tuple[str, str]]] = {}
        self._unknown_scanner_issue_scanners: set[str] = set()

        self._cancel_interval = None
        self._background_tasks: set[asyncio.Task[Any]] = set()
        self._pending_commands: dict[str, _PendingCommand] = {}

    def _long_offline_issue_id(self, scanner_id: str) -> str:
        return f"scanner_long_offline_{self.entry.entry_id}_{scanner_id}"

    def _unknown_scanner_issue_id(self, scanner_id: str) -> str:
        return f"unknown_scanner_{self.entry.entry_id}_{scanner_id}"

    @property
    def mqtt_prefix(self) -> str:
        """Configured MQTT prefix."""
        return self._prefix

    def get_scanner(self, scanner_id: str) -> Scanner | None:
        """Return scanner state if known."""
        return self._scanners.get(scanner_id)

    def get_drone(self, drone_id: str) -> Drone | None:
        """Return drone state if known."""
        return self._drones.get(drone_id)

    def scanners(self) -> dict[str, Scanner]:
        """Scanner mapping copy."""
        return dict(self._scanners)

    def drones(self) -> dict[str, Drone]:
        """Drone mapping copy."""
        return dict(self._drones)

    def get_all_scanners(self) -> list[Scanner]:
        """All known scanners (for platform restore)."""
        return list(self._scanners.values())

    def get_all_drones(self) -> list[Drone]:
        """All known drones (for platform restore)."""
        return list(self._drones.values())

    def option_drone_inactivity_timeout(self) -> int:
        """Seconds before a drone becomes unavailable."""
        return int(self.entry.options.get(CONF_DRONE_INACTIVITY_TIMEOUT, 300))

    def option_drone_purge_after(self) -> int:
        """Seconds without telemetry before drone registry purge."""
        return int(self.entry.options.get(CONF_DRONE_PURGE_AFTER, 86400))

    def option_scanner_offline_timeout(self) -> int:
        """Seconds without scanner status before unavailable."""
        return int(self.entry.options.get(CONF_SCANNER_OFFLINE_TIMEOUT, 60))

    def option_enable_unknown_scanner_warning(self) -> bool:
        """Whether to warn on telemetry before scanner seen online."""
        return bool(self.entry.options.get(CONF_ENABLE_UNKNOWN_SCANNER_WARNING, True))

    async def async_setup(self) -> None:
        """Load Store, restore placeholders, start housekeeping."""
        await self._async_load_store()
        self._cancel_interval = async_track_time_interval(
            self.hass,
            self._async_housekeeping,
            timedelta(seconds=10),
        )

    def option_command_timeout(self) -> int:
        """Default command timeout (seconds) for MQTT request/response."""
        return int(self.entry.options.get(CONF_COMMAND_TIMEOUT, 30))

    async def async_shutdown(self) -> None:
        """Persist and stop interval."""
        for pending in list(self._pending_commands.values()):
            if not pending.future.done():
                pending.future.cancel()
        self._pending_commands.clear()
        if self._cancel_interval is not None:
            self._cancel_interval()
            self._cancel_interval = None
        await self._async_save_store()

    def async_register_background_task(self, task: asyncio.Task[Any]) -> None:
        """Track tasks for lifecycle consistency."""

        def _done(t: asyncio.Task[Any]) -> None:
            self._background_tasks.discard(t)
            try:
                t.result()
            except (asyncio.CancelledError, Exception):  # noqa: BLE001
                pass

        self._background_tasks.add(task)
        task.add_done_callback(_done)

    async def _async_load_store(self) -> None:
        """Restore ids + drone last_seen."""
        raw = await self._store.async_load()
        if not isinstance(raw, dict):
            return

        scanners_raw = raw.get("scanners")
        if isinstance(scanners_raw, list):
            for sid in scanners_raw:
                if isinstance(sid, str) and sid not in self._scanners:
                    self._scanners[sid] = _scanner_placeholder(sid)

        drones_raw = raw.get("drones")
        now = dt_util.utcnow()
        purge_delta = timedelta(seconds=self.option_drone_purge_after())

        if isinstance(drones_raw, list):
            for row in drones_raw:
                if not isinstance(row, dict):
                    continue
                did = row.get("id")
                ls_raw = row.get("last_seen")
                if not isinstance(did, str) or not isinstance(ls_raw, str):
                    continue
                last_seen = dt_util.parse_datetime(ls_raw)
                if last_seen is None:
                    continue
                last_seen_utc = dt_util.as_utc(last_seen)
                if now - last_seen_utc > purge_delta:
                    continue
                if did not in self._drones:
                    self._drones[did] = Drone.restore_placeholder(
                        drone_id=did,
                        last_seen=last_seen_utc,
                    )

    async def _async_save_store(self) -> None:
        """Persist scanner ids and drone last_seen."""
        drones_out: list[dict[str, str]] = []
        for did, drone in self._drones.items():
            last = drone.last_seen or drone.timestamp
            drones_out.append(
                {
                    "id": did,
                    "last_seen": dt_util.as_local(last).isoformat(),
                }
            )

        await self._store.async_save(
            {
                "version": STORAGE_VERSION,
                "scanners": sorted(self._scanners.keys()),
                "drones": drones_out,
            }
        )

    async def _async_housekeeping(self, _: datetime | None = None) -> None:
        """Apply scanner offline, drone inactive, and purge rules."""
        now = dt_util.utcnow()

        for sid, scanner in list(self._scanners.items()):
            last = scanner.received_at
            if last is None:
                continue
            age = (now - last).total_seconds()
            if age > self.option_scanner_offline_timeout() and scanner.available:
                self._scanners[sid] = replace(scanner, available=False)
                async_dispatcher_send(self.hass, scanner_update_signal(sid))

        for did, drone in list(self._drones.items()):
            last_rx = drone.received_at
            if last_rx is None:
                continue
            age = (now - last_rx).total_seconds()

            if age > self.option_drone_purge_after():
                await self._async_purge_drone(did)
                continue

            if age > self.option_drone_inactivity_timeout() and drone.available:
                self._drones[did] = replace(drone, available=False)
                async_dispatcher_send(self.hass, drone_update_signal(did))
                telemetry_last = drone.last_seen or drone.timestamp
                self.hass.bus.async_fire(
                    EVENT_DRONE_LOST,
                    {
                        "drone_id": did,
                        "last_seen": telemetry_last.isoformat(),
                        "detected_by": sorted(drone.detected_scanners or frozenset()),
                    },
                )

        await self._async_save_store()
        self._sync_repair_issues(now)

    def _sync_repair_issues(self, now: datetime) -> None:
        """Create/delete repair issues (MQTT, long-offline scanners, unknown scanners)."""
        if not self.option_enable_unknown_scanner_warning():
            for sid in list(self._unknown_scanner_issue_scanners):
                ir.async_delete_issue(self.hass, DOMAIN, self._unknown_scanner_issue_id(sid))
            self._unknown_scanner_issue_scanners.clear()

        mqtt_ok = any(
            e.state is ConfigEntryState.LOADED
            for e in self.hass.config_entries.async_entries(MQTT_DOMAIN)
        )
        if mqtt_ok:
            ir.async_delete_issue(self.hass, DOMAIN, "mqtt_required")
        else:
            ir.async_create_issue(
                hass=self.hass,
                domain=DOMAIN,
                issue_id="mqtt_required",
                is_fixable=True,
                is_persistent=True,
                severity=ir.IssueSeverity.ERROR,
                translation_key="mqtt_required",
            )

        for sid, scanner in self._scanners.items():
            issue_id = self._long_offline_issue_id(sid)
            last = scanner.received_at
            if last is None or scanner.available:
                ir.async_delete_issue(self.hass, DOMAIN, issue_id)
                continue
            if (now - last).total_seconds() > 86400:
                ir.async_create_issue(
                    hass=self.hass,
                    domain=DOMAIN,
                    issue_id=issue_id,
                    is_fixable=False,
                    is_persistent=True,
                    severity=ir.IssueSeverity.WARNING,
                    translation_key="scanner_long_offline",
                    translation_placeholders={"scanner_id": sid},
                )
            else:
                ir.async_delete_issue(self.hass, DOMAIN, issue_id)

    async def async_clear_entry_repair_issues(self) -> None:
        """Remove repair issues tied to this config entry (unload)."""
        for sid in self._scanners:
            ir.async_delete_issue(self.hass, DOMAIN, self._long_offline_issue_id(sid))
        for sid in self._unknown_scanner_issue_scanners:
            ir.async_delete_issue(self.hass, DOMAIN, self._unknown_scanner_issue_id(sid))
        self._unknown_scanner_issue_scanners.clear()

    async def _async_purge_drone(self, drone_id: str) -> None:
        """Remove drone from registry, device registry, and storage."""
        self._drones.pop(drone_id, None)
        async_dispatcher_send(self.hass, drone_entity_removed_signal(drone_id))
        async_dispatcher_send(self.hass, SIGNAL_DRONE_REMOVED, drone_id)

        reg = dr.async_get(self.hass)
        device = reg.async_get_device(identifiers={(DOMAIN, f"drone:{drone_id}")})
        if device is not None:
            reg.async_remove_device(device.id)

        self.hass.bus.async_fire(
            EVENT_DRONE_PURGED,
            {"drone_id": drone_id},
        )

    async def async_purge_drone(self, drone_id: str) -> None:
        """Remove a drone from the registry (service / automation API)."""
        await self._async_purge_drone(drone_id)
        await self._async_save_store()

    def _warn_unknown_scanner(self, scanner_id: str) -> None:
        issue_id = self._unknown_scanner_issue_id(scanner_id)
        if not self.option_enable_unknown_scanner_warning():
            if scanner_id in self._unknown_scanner_issue_scanners:
                ir.async_delete_issue(self.hass, DOMAIN, issue_id)
                self._unknown_scanner_issue_scanners.discard(scanner_id)
            return
        if scanner_id in self._scanners_seen_online:
            if scanner_id in self._unknown_scanner_issue_scanners:
                ir.async_delete_issue(self.hass, DOMAIN, issue_id)
                self._unknown_scanner_issue_scanners.discard(scanner_id)
            return
        _LOGGER.warning(
            "Telemetry from scanner %s before first online status message",
            scanner_id,
        )
        if scanner_id in self._unknown_scanner_issue_scanners:
            return
        self._unknown_scanner_issue_scanners.add(scanner_id)
        ir.async_create_issue(
            hass=self.hass,
            domain=DOMAIN,
            issue_id=issue_id,
            is_fixable=False,
            is_persistent=True,
            severity=ir.IssueSeverity.WARNING,
            translation_key="unknown_scanner_publishing",
            translation_placeholders={"scanner_id": scanner_id},
        )

    def _merge_drone(self, old: Drone | None, new: Drone) -> Drone:
        merged_rx = self._merge_drone_received_at(old, new)
        avail = self._drone_receive_still_fresh(merged_rx)

        if old is None:
            return replace(
                new,
                available=avail,
                last_seen=new.timestamp,
                received_at=merged_rx,
                distance_to_scanner=primary_distance_to_scanner(
                    new.rssi_by_scanner, new.distance_by_scanner
                ),
            )

        scanners = frozenset(old.detected_scanners or frozenset()) | frozenset(
            new.detected_scanners or frozenset()
        )
        rssi_dict = dict(old.rssi_by_scanner or ())
        rssi_dict.update(dict(new.rssi_by_scanner or ()))
        merged_rssi = _freeze_rssi(rssi_dict)
        dist_dict = dict(old.distance_by_scanner or ())
        if new.distance_by_scanner:
            dist_dict.update(dict(new.distance_by_scanner))
        merged_dist = _freeze_mapping_float(dist_dict) if dist_dict else None
        return replace(
            new,
            detected_scanners=scanners,
            rssi_by_scanner=merged_rssi,
            distance_by_scanner=merged_dist,
            distance_to_scanner=primary_distance_to_scanner(merged_rssi, merged_dist),
            available=avail,
            last_seen=new.timestamp,
            received_at=merged_rx,
        )

    def _merge_drone_received_at(self, old: Drone | None, new: Drone) -> datetime | None:
        """Keep the newest MQTT activity marker when merging multi-scanner telemetry."""
        nr = new.received_at
        if old is None or old.received_at is None:
            return nr
        if nr is None:
            return old.received_at
        return max(dt_util.as_utc(old.received_at), dt_util.as_utc(nr))

    def _drone_receive_still_fresh(self, received_at: datetime | None) -> bool:
        """True while the last MQTT-derived activity is within the inactivity window."""
        if received_at is None:
            return False
        now = dt_util.utcnow()
        age = (now - dt_util.as_utc(received_at)).total_seconds()
        return age <= float(self.option_drone_inactivity_timeout())

    def _drone_received_at_from_mqtt(self, parsed: Drone, *, mqtt_retained: bool) -> datetime:
        """Wall clock for live frames; payload time for broker retains (no fake 'just now')."""
        now = dt_util.utcnow()
        if not mqtt_retained:
            return now
        ts = dt_util.as_utc(parsed.timestamp)
        return min(ts, now)

    def _fire_new_critical_alerts(self, scanner_id: str, alerts: tuple[Alert, ...] | None) -> None:
        if not alerts:
            return
        known = self._known_critical_alerts.setdefault(scanner_id, set())
        for alert in alerts:
            if alert.level != AlertLevel.CRITICAL:
                continue
            key = (alert.source.value, alert.message)
            if key in known:
                continue
            known.add(key)
            self.hass.bus.async_fire(
                EVENT_SCANNER_ALERT,
                {
                    "scanner_id": scanner_id,
                    "source": alert.source.value,
                    "message": alert.message,
                    "level": alert.level.value,
                },
            )

    async def async_handle_scanner_status(self, topic: str, payload: dict[str, Any]) -> None:
        """Apply scanner status retain/heartbeat."""
        from .mqtt_client import parse_scanner_status_topic

        scanner_id = parse_scanner_status_topic(topic, self._prefix)
        if scanner_id is None:
            _LOGGER.warning("Unexpected scanner status topic: %s", topic)
            return

        parsed = Scanner.from_status_payload(
            payload,
            topic_scanner_id=scanner_id,
            topic=topic,
        )
        if parsed is None:
            return

        available = parsed.status == ScannerConnectionStatus.ONLINE
        updated = replace(
            parsed,
            available=available,
            last_seen=parsed.timestamp,
            received_at=dt_util.utcnow(),
        )

        if available:
            self._scanners_seen_online.add(scanner_id)
            uid = self._unknown_scanner_issue_id(scanner_id)
            ir.async_delete_issue(self.hass, DOMAIN, uid)
            self._unknown_scanner_issue_scanners.discard(scanner_id)

        previous = self._scanners.get(scanner_id)
        is_new_scanner = previous is None or previous.last_seen is None

        self._scanners[scanner_id] = updated

        if is_new_scanner:
            async_dispatcher_send(self.hass, SIGNAL_NEW_SCANNER, scanner_id)

        async_dispatcher_send(self.hass, scanner_update_signal(scanner_id))
        self._fire_new_critical_alerts(scanner_id, updated.alerts)
        await self._async_save_store()

    async def async_handle_scanner_error(self, topic: str, payload: dict[str, Any]) -> None:
        """Handle scanner errors topic."""
        from .mqtt_client import parse_scanner_errors_topic

        scanner_id = parse_scanner_errors_topic(topic, self._prefix)
        if scanner_id is None:
            _LOGGER.warning("Unexpected scanner errors topic: %s", topic)
            return

        self._warn_unknown_scanner(scanner_id)

        parsed = ScannerErrorMessage.from_payload(
            payload,
            topic_scanner_id=scanner_id,
            topic=topic,
        )
        if parsed is None:
            return

        self.hass.bus.async_fire(
            EVENT_SCANNER_ERROR,
            {
                "scanner_id": parsed.scanner_id,
                "error_type": parsed.error_type.value,
                "error_message": parsed.error_message,
            },
        )

    async def async_handle_drone_data(
        self,
        topic: str,
        payload: dict[str, Any],
        *,
        mqtt_retained: bool = False,
    ) -> None:
        """Merge drone telemetry."""
        from .mqtt_client import parse_drone_data_topic

        parsed_topic = parse_drone_data_topic(topic, self._prefix)
        if parsed_topic is None:
            _LOGGER.warning("Unexpected drone data topic: %s", topic)
            return

        scanner_id, drone_id = parsed_topic
        self._warn_unknown_scanner(scanner_id)

        parsed = Drone.from_drone_payload(
            payload,
            topic_drone_id=drone_id,
            topic_scanner_id=scanner_id,
            topic=topic,
        )
        if parsed is None:
            return

        old = self._drones.get(drone_id)
        if mqtt_retained and old is not None and old.timestamp >= parsed.timestamp:
            return

        rx_at = self._drone_received_at_from_mqtt(parsed, mqtt_retained=mqtt_retained)
        parsed_rx = replace(parsed, received_at=rx_at)
        merged = self._merge_drone(old, parsed_rx)
        is_new = old is None

        self._drones[drone_id] = merged

        if is_new:
            async_dispatcher_send(self.hass, SIGNAL_NEW_DRONE, drone_id)
            self.hass.bus.async_fire(
                EVENT_DRONE_DETECTED,
                {
                    "drone_id": drone_id,
                    "scanner_id": scanner_id,
                    "latitude": merged.latitude,
                    "longitude": merged.longitude,
                    "manufacturer": merged.manufacturer,
                    "model": merged.model,
                    "payload": payload,
                },
            )

        async_dispatcher_send(self.hass, drone_update_signal(drone_id))
        await self._async_save_store()

    def _resolve_command_response(self, parsed: CommandResponse) -> None:
        """Match MQTT command response to a pending asyncio future."""
        rid = parsed.request_id
        pending = self._pending_commands.get(rid)
        if pending is None:
            return

        action = pending.action
        fut = pending.future

        if parsed.status is CommandResponseStatus.ERROR:
            self._pending_commands.pop(rid, None)
            if not fut.done():
                fut.set_exception(
                    HomeAssistantError(
                        translation_domain=DOMAIN,
                        translation_key="command_failed",
                        translation_placeholders={"message": parsed.message or ""},
                    )
                )
            return

        if action is ScannerCommandAction.SET_MQTT_BROKER:
            if parsed.status is CommandResponseStatus.SUCCESS:
                return
            if parsed.status is CommandResponseStatus.COMPLETED:
                self._pending_commands.pop(rid, None)
                if not fut.done():
                    fut.set_result(parsed)
                return
            return

        if parsed.status in (CommandResponseStatus.SUCCESS, CommandResponseStatus.COMPLETED):
            self._pending_commands.pop(rid, None)
            if not fut.done():
                self._maybe_fire_logs_received(pending.action, parsed)
                fut.set_result(parsed)

    def _maybe_fire_logs_received(
        self, action: ScannerCommandAction, parsed: CommandResponse
    ) -> None:
        if action is not ScannerCommandAction.GET_LOGS:
            return
        if not parsed.data or not parsed.data.content:
            return
        self.hass.bus.async_fire(
            EVENT_LOGS_RECEIVED,
            {
                "scanner_id": parsed.scanner_id,
                "request_id": parsed.request_id,
                "log_type": parsed.data.log_type,
                "lines": parsed.data.lines,
                "content": parsed.data.content,
            },
        )

    async def async_send_command(
        self,
        scanner_id: str,
        action: str,
        params: dict[str, Any] | None,
        *,
        timeout: float | None = None,
    ) -> dict[str, Any]:
        """Publish a command on MQTT and wait for the matching response."""
        action_enum = parse_command_action(action)
        request_id = str(uuid.uuid4())
        loop = self.hass.loop
        fut: asyncio.Future[CommandResponse] = loop.create_future()
        self._pending_commands[request_id] = _PendingCommand(future=fut, action=action_enum)
        eff_timeout = command_timeout_seconds(
            action_enum,
            timeout,
            default_timeout=self.option_command_timeout(),
        )
        topic = topic_publish_command(self._prefix, scanner_id)
        payload_obj: dict[str, Any] = {
            "request_id": request_id,
            "action": action_enum.value,
            "params": params if params else {},
        }
        payload = json.dumps(payload_obj)
        try:
            await mqtt.async_publish(
                self.hass,
                topic,
                payload,
                qos=1,
                retain=False,
            )
            result = await asyncio.wait_for(fut, timeout=eff_timeout)
        except TimeoutError as err:
            self._pending_commands.pop(request_id, None)
            raise HomeAssistantError(
                translation_domain=DOMAIN,
                translation_key="command_timeout",
                translation_placeholders={
                    "action": action_enum.value,
                    "timeout": str(int(eff_timeout)),
                },
            ) from err
        except asyncio.CancelledError:
            self._pending_commands.pop(request_id, None)
            raise
        except HomeAssistantError:
            self._pending_commands.pop(request_id, None)
            raise

        return command_response_to_dict(result)

    async def async_handle_command_response(self, topic: str, payload: dict[str, Any]) -> None:
        """Receive command responses (correlation handled in Phase 3)."""
        from .mqtt_client import parse_command_response_topic

        scanner_id = parse_command_response_topic(topic, self._prefix)
        if scanner_id is None:
            _LOGGER.warning("Unexpected command response topic: %s", topic)
            return

        parsed = CommandResponse.from_payload(
            payload,
            topic_scanner_id=scanner_id,
            topic=topic,
        )
        if parsed is None:
            return

        _LOGGER.debug(
            "Command response request_id=%s action=%s status=%s",
            parsed.request_id,
            parsed.action,
            parsed.status.value,
        )
        self._resolve_command_response(parsed)
