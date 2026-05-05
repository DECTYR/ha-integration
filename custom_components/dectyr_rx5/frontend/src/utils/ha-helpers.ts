import type { HomeAssistant } from "custom-card-helpers";

import { DOMAIN } from "../const";
import type { DectyrDrone, DectyrScanner } from "../types";

/** Home Assistant core location (same as Map card default). */
export function findHomeZone(hass: HomeAssistant): {
  latitude: number;
  longitude: number;
} | null {
  const lat = hass.config?.latitude;
  const lng = hass.config?.longitude;
  if (typeof lat === "number" && Number.isFinite(lat) && typeof lng === "number" && Number.isFinite(lng)) {
    return { latitude: lat, longitude: lng };
  }
  const homeState = hass.states["zone.home"];
  const la = homeState?.attributes?.latitude;
  const lo = homeState?.attributes?.longitude;
  if (typeof la === "number" && Number.isFinite(la) && typeof lo === "number" && Number.isFinite(lo)) {
    return { latitude: la, longitude: lo };
  }
  return null;
}

type HassEntity = HomeAssistant["states"][string];

export interface HassEntityRegDisplay {
  platform?: string;
  translation_key?: string | null;
  device_id?: string | null;
}

export interface HassDeviceRegDisplay {
  id: string;
  name?: string | null;
  name_by_user?: string | null;
  manufacturer?: string | null;
  model?: string | null;
  identifiers?: [string, string][];
}

export type HassWithReg = HomeAssistant & {
  entities?: Record<string, HassEntityRegDisplay>;
  devices?: Record<string, HassDeviceRegDisplay>;
};

export type GetEntityState = (entityId: string) => HassEntity | undefined;

function defaultGetState(hass: HomeAssistant): GetEntityState {
  return (entityId: string) => hass.states[entityId];
}

function parseNum(state: string | undefined): number | null {
  if (state === undefined || state === "unknown" || state === "unavailable" || state === "") {
    return null;
  }
  const n = Number(state);
  return Number.isFinite(n) ? n : null;
}

function parseBoolOn(state: string | undefined): boolean {
  return state === "on";
}

function parseLastSeen(state: string | undefined): Date | null {
  if (!state || state === "unknown" || state === "unavailable") {
    return null;
  }
  const d = new Date(state);
  return Number.isNaN(d.getTime()) ? null : d;
}

function parseHaIso(iso: string | undefined): Date | null {
  if (!iso) {
    return null;
  }
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** Drop HA sentinel states so UI never prints "unavailable". */
function cleanEntityState(state: string | undefined): string | null {
  if (state === undefined) {
    return null;
  }
  const s = String(state).trim();
  if (!s || s === "unknown" || s === "unavailable") {
    return null;
  }
  return s;
}

function droneIdFromIdentifiers(pairs: [string, string][] | undefined): string | null {
  if (!pairs?.length) {
    return null;
  }
  for (const p of pairs) {
    if (p[0] === DOMAIN && typeof p[1] === "string" && p[1].startsWith("drone:")) {
      return p[1].slice("drone:".length);
    }
  }
  return null;
}

function scannerIdFromIdentifiers(pairs: [string, string][] | undefined): string | null {
  if (!pairs?.length) {
    return null;
  }
  for (const p of pairs) {
    if (
      p[0] === DOMAIN &&
      typeof p[1] === "string" &&
      p[1].length > 0 &&
      !p[1].startsWith("drone:")
    ) {
      return p[1];
    }
  }
  return null;
}

/** Build entity_id → translation_key map for one device. */
function entitiesForDevice(
  hass: HassWithReg,
  deviceId: string,
): Map<string, string | null> {
  const map = new Map<string, string | null>();
  if (!hass.entities) {
    return map;
  }
  for (const [eid, ent] of Object.entries(hass.entities)) {
    if (ent.device_id !== deviceId || ent.platform !== DOMAIN) {
      continue;
    }
    map.set(eid, ent.translation_key ?? null);
  }
  return map;
}

export function findDectyrScanners(
  hass: HomeAssistant,
  getState?: GetEntityState,
): DectyrScanner[] {
  const h = hass as HassWithReg;
  const get = getState ?? defaultGetState(hass);
  if (!h.devices) {
    return [];
  }
  const out: DectyrScanner[] = [];
  for (const dev of Object.values(h.devices)) {
    const sid = scannerIdFromIdentifiers(dev.identifiers);
    if (!sid) {
      continue;
    }
    const entMap = entitiesForDevice(h, dev.id);
    let statusEntity: string | undefined;
    let isOnline = false;
    let cpuTemp: number | undefined;
    let battery: number | undefined;
    let gnssFix: string | undefined;
    let latitude: number | null = null;
    let longitude: number | null = null;
    const alerts: string[] = [];

    for (const [eid, tk] of entMap) {
      const st = get(eid);
      if (!st) {
        continue;
      }
      if (tk === "scanner_position") {
        if (st.state !== "unavailable" && st.state !== "unknown") {
          if (st.attributes.latitude != null) {
            const n = Number(st.attributes.latitude);
            if (Number.isFinite(n)) {
              latitude = n;
            }
          }
          if (st.attributes.longitude != null) {
            const n = Number(st.attributes.longitude);
            if (Number.isFinite(n)) {
              longitude = n;
            }
          }
        }
      } else if (tk === "scanner_online") {
        statusEntity = eid;
        isOnline = parseBoolOn(st.state);
      } else if (tk === "scanner_cpu_temperature") {
        const v = parseNum(st.state);
        if (v !== null) {
          cpuTemp = v;
        }
      } else if (tk === "scanner_battery_soc") {
        const v = parseNum(st.state);
        if (v !== null) {
          battery = v;
        }
      } else if (tk === "scanner_gnss_fix_quality") {
        gnssFix = st.state !== "unknown" ? st.state : undefined;
      } else if (tk === "scanner_last_alert_message" && st.state && st.state !== "unavailable") {
        alerts.push(st.state);
      }
    }
    const name =
      (dev.name_by_user && dev.name_by_user.trim()) ||
      (dev.name && dev.name.trim()) ||
      `RX-5 (${sid.slice(-8)})`;
    out.push({
      scanner_id: sid,
      device_id: dev.id,
      name,
      status_entity: statusEntity,
      is_online: isOnline,
      cpu_temp: cpuTemp,
      battery,
      gnss_fix: gnssFix,
      alerts: alerts.length ? alerts : undefined,
      latitude,
      longitude,
    });
  }
  return out.sort((a, b) => a.name.localeCompare(b.name));
}

interface DroneEntityIds {
  tracker?: string;
  operatorTracker?: string;
  byTk: Map<string, string>;
}

function collectDroneEntities(entMap: Map<string, string | null>): DroneEntityIds {
  const byTk = new Map<string, string>();
  let tracker: string | undefined;
  let operatorTracker: string | undefined;
  for (const [eid, tk] of entMap) {
    if (!tk) {
      continue;
    }
    if (tk === "drone_position") {
      tracker = eid;
    } else if (tk === "operator_position") {
      operatorTracker = eid;
    } else {
      byTk.set(tk, eid);
    }
  }
  return { tracker, operatorTracker, byTk };
}

export function findDectyrDrones(hass: HomeAssistant, getState?: GetEntityState): DectyrDrone[] {
  const h = hass as HassWithReg;
  const get = getState ?? defaultGetState(hass);
  if (!h.devices) {
    return [];
  }
  const out: DectyrDrone[] = [];
  for (const dev of Object.values(h.devices)) {
    const droneId = droneIdFromIdentifiers(dev.identifiers);
    if (!droneId) {
      continue;
    }
    const entMap = entitiesForDevice(h, dev.id);
    const { tracker, operatorTracker, byTk } = collectDroneEntities(entMap);
    const trState = tracker ? get(tracker) : undefined;
    const isLive =
      !!trState && trState.state !== "unavailable" && trState.state !== "unknown";

    let latitude: number | null = null;
    let longitude: number | null = null;
    if (trState) {
      if (trState.attributes.latitude != null) {
        const n = Number(trState.attributes.latitude);
        if (Number.isFinite(n)) {
          latitude = n;
        }
      }
      if (trState.attributes.longitude != null) {
        const n = Number(trState.attributes.longitude);
        if (Number.isFinite(n)) {
          longitude = n;
        }
      }
    }

    const readSensor = (tk: string): string | undefined => {
      const eid = byTk.get(tk);
      if (!eid) {
        return undefined;
      }
      return get(eid)?.state;
    };

    const multiEid = byTk.get("drone_multi_source");
    const multiState = multiEid ? get(multiEid)?.state : undefined;

    let lastSeen = parseLastSeen(readSensor("drone_last_seen"));
    if (!lastSeen && trState) {
      lastSeen =
        parseHaIso(trState.last_updated) ?? parseHaIso(trState.last_changed) ?? null;
    }

    const opLatLon = operatorTracker ? get(operatorTracker) : undefined;
    let operator_latitude: number | null = null;
    let operator_longitude: number | null = null;
    if (opLatLon) {
      if (opLatLon.attributes.latitude != null) {
        const n = Number(opLatLon.attributes.latitude);
        if (Number.isFinite(n)) {
          operator_latitude = n;
        }
      }
      if (opLatLon.attributes.longitude != null) {
        const n = Number(opLatLon.attributes.longitude);
        if (Number.isFinite(n)) {
          operator_longitude = n;
        }
      }
    }

    const manufacturer =
      (dev.manufacturer && String(dev.manufacturer).trim()) ||
      (trState?.attributes.manufacturer != null
        ? String(trState.attributes.manufacturer)
        : null);
    const model =
      (dev.model && String(dev.model).trim()) ||
      (trState?.attributes.model != null ? String(trState.attributes.model) : null);

    const display_name =
      (dev.name_by_user && dev.name_by_user.trim()) ||
      (dev.name && dev.name.trim()) ||
      [manufacturer, model].filter(Boolean).join(" ") ||
      `Drone ${droneId.slice(-10)}`;

    out.push({
      drone_id: droneId,
      device_id: dev.id,
      display_name,
      manufacturer,
      model,
      is_live: isLive,
      latitude,
      longitude,
      altitude_msl: parseNum(readSensor("drone_altitude_msl")),
      altitude_agl: parseNum(readSensor("drone_altitude_agl")),
      speed_horizontal: parseNum(readSensor("drone_speed_horizontal")),
      speed_vertical: parseNum(readSensor("drone_speed_vertical")),
      direction: parseNum(readSensor("drone_direction")),
      rssi: parseNum(readSensor("drone_rssi")),
      operator_id: cleanEntityState(readSensor("drone_operator_id")),
      operator_country: cleanEntityState(readSensor("drone_operator_country")),
      operator_latitude,
      operator_longitude,
      category_eu: cleanEntityState(readSensor("drone_category_eu")),
      class_eu: cleanEntityState(readSensor("drone_class_eu")),
      signal_type: cleanEntityState(readSensor("drone_signal_type")),
      broadcast_protocol: cleanEntityState(readSensor("drone_broadcast_protocol")),
      multi_source: parseBoolOn(multiState),
      distance_to_scanner: parseNum(readSensor("drone_distance_to_scanner")),
      last_seen: lastSeen,
    });
  }
  return out;
}
