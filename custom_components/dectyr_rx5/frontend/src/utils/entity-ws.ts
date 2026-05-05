import type { HomeAssistant } from "custom-card-helpers";

import { DOMAIN } from "../const";

/** HA compressed state keys (homeassistant.const). */
const S_STATE = "s";
const S_ATTR = "a";
const S_CTX = "c";
const S_LC = "lc";
const S_LU = "lu";
const DIFF_ADD = "+";
const DIFF_SUB = "-";
const EV_ADD = "a";
const EV_REM = "r";
const EV_CHG = "c";

type HassEntity = HomeAssistant["states"][string];

export interface CompressedEntityState {
  [S_STATE]?: string;
  [S_ATTR]?: Record<string, unknown>;
  [S_CTX]?: string | Record<string, unknown>;
  [S_LC]?: number;
  [S_LU]?: number;
}

export interface EntityChangeDiff {
  [DIFF_ADD]?: Partial<CompressedEntityState>;
  [DIFF_SUB]?: { [S_ATTR]?: string[] };
}

export type EntityWsEvent = {
  [EV_ADD]?: Record<string, CompressedEntityState>;
  [EV_REM]?: string[];
  [EV_CHG]?: Record<string, EntityChangeDiff>;
};

function decompressEntity(entityId: string, cs: CompressedEntityState): HassEntity {
  const lc = cs[S_LC] !== undefined ? new Date(cs[S_LC]! * 1000).toISOString() : undefined;
  const lu =
    cs[S_LU] !== undefined
      ? new Date(cs[S_LU]! * 1000).toISOString()
      : lc ?? new Date().toISOString();
  let context: HassEntity["context"];
  const rawC = cs[S_CTX];
  if (typeof rawC === "string") {
    context = { id: rawC, parent_id: null, user_id: null };
  } else if (rawC && typeof rawC === "object") {
    context = {
      id: (rawC as { id?: string }).id ?? "",
      parent_id: (rawC as { parent_id?: string | null }).parent_id ?? null,
      user_id: (rawC as { user_id?: string | null }).user_id ?? null,
    };
  } else {
    context = { id: "", parent_id: null, user_id: null };
  }
  return {
    entity_id: entityId,
    state: cs[S_STATE] ?? "unknown",
    attributes: { ...(cs[S_ATTR] ?? {}) },
    context,
    last_changed: lc ?? lu,
    last_updated: lu,
  };
}

/** Merge a subscribe_entities `event` payload into `store` (mutates). */
export function applyEntityWsEvent(store: Record<string, HassEntity>, ev: EntityWsEvent): void {
  if (ev[EV_ADD]) {
    for (const [eid, cs] of Object.entries(ev[EV_ADD])) {
      store[eid] = decompressEntity(eid, cs);
    }
  }
  if (ev[EV_REM]) {
    for (const eid of ev[EV_REM]) {
      delete store[eid];
    }
  }
  if (ev[EV_CHG]) {
    for (const [eid, diff] of Object.entries(ev[EV_CHG])) {
      let entity = store[eid];
      if (!entity) {
        continue;
      }
      entity = { ...entity, attributes: { ...entity.attributes } };
      const add = diff[DIFF_ADD];
      const sub = diff[DIFF_SUB];
      if (add?.[S_STATE] !== undefined) {
        entity.state = add[S_STATE]!;
      }
      if (add?.[S_LC] !== undefined) {
        const iso = new Date(add[S_LC]! * 1000).toISOString();
        entity.last_changed = iso;
        entity.last_updated = iso;
      } else if (add?.[S_LU] !== undefined) {
        entity.last_updated = new Date(add[S_LU]! * 1000).toISOString();
      }
      if (add?.[S_CTX] !== undefined) {
        const rawC = add[S_CTX];
        if (typeof rawC === "string") {
          entity.context = { ...entity.context, id: rawC };
        } else if (rawC && typeof rawC === "object") {
          entity.context = { ...entity.context, ...rawC } as HassEntity["context"];
        }
      }
      if (add?.[S_ATTR]) {
        Object.assign(entity.attributes, add[S_ATTR]);
      }
      if (sub?.[S_ATTR]) {
        for (const k of sub[S_ATTR]) {
          delete entity.attributes[k];
        }
      }
      store[eid] = entity;
    }
  }
}

/** All entity_ids belonging to our integration (registry platform). */
export function collectDectyrEntityIds(hass: HomeAssistant): string[] {
  const reg = (
    hass as HomeAssistant & {
      entities?: Record<string, { platform?: string }>;
    }
  ).entities;
  if (!reg) {
    return [];
  }
  const ids: string[] = [];
  for (const [eid, meta] of Object.entries(reg)) {
    if (meta.platform === DOMAIN) {
      ids.push(eid);
    }
  }
  return ids;
}
