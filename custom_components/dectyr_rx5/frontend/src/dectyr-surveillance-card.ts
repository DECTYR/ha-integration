import { LitElement, html, css, type CSSResult, type TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import type { HomeAssistant, LovelaceCardConfig } from "custom-card-helpers";
import type { PropertyValues } from "lit";

import "./dectyr-map-card";
import type { DectyrDrone } from "./types";
import { DECTYR_BRAND_ICON, DECTYR_LOGO_PNG, DECTYR_LOGO_SVG } from "./const";
import "./components/drone-list";
import "./components/stat-tile";
import { dectyrCardTheme } from "./styles/theme";
import {
  applyEntityWsEvent,
  collectDectyrEntityIds,
  type EntityWsEvent,
} from "./utils/entity-ws";
import { findDectyrDrones, findDectyrScanners } from "./utils/ha-helpers";

interface DectyrCardConfig extends LovelaceCardConfig {
  type: string;
  title?: string;
}

type HassEntity = HomeAssistant["states"][string];

type HassConnection = {
  subscribeMessage(
    callback: (message: Record<string, unknown>) => void,
    command: Record<string, unknown>,
  ): Promise<() => void | Promise<void>>;
};

declare global {
  interface Window {
    customCards?: Array<{
      type: string;
      name: string;
      description: string;
      preview: boolean;
      documentationURL?: string;
    }>;
  }
}

@customElement("dectyr-surveillance-card")
export class DectyrSurveillanceCard extends LitElement {
  @property({ attribute: false }) public hass?: HomeAssistant;

  @state() private config?: DectyrCardConfig;

  @state() private _hideInactive = false;

  @state() private _newDroneIds: Set<string> = new Set();

  @state() private _headerLogoUrl: string = DECTYR_BRAND_ICON;

  private _previousDroneIds: Set<string> | null = null;

  private readonly _newDroneClearTimers = new Map<string, number>();

  private _entityOverlay: Record<string, HassEntity> = {};

  private _unsubEntities: (() => void | Promise<void>) | undefined;

  private _subscribedIdsKey = "";

  private _subscriptionGeneration = 0;

  public setConfig(config: DectyrCardConfig): void {
    if (!config) {
      throw new Error("Invalid configuration");
    }
    this.config = config;
  }

  public getCardSize(): number {
    return 14;
  }

  disconnectedCallback(): void {
    void this._disconnectEntitySubscription();
    for (const h of this._newDroneClearTimers.values()) {
      window.clearTimeout(h);
    }
    this._newDroneClearTimers.clear();
    super.disconnectedCallback();
  }

  protected willUpdate(changed: PropertyValues<this>): void {
    super.willUpdate(changed);
    if (changed.has("hass") && this.hass) {
      const drones = findDectyrDrones(this.hass, (id) => this._getMergedState(id));
      this._detectNewDrones(drones);
    }
  }

  protected updated(changed: PropertyValues<this>): void {
    super.updated(changed);
    if (changed.has("hass") && this.hass?.connected) {
      void this._syncEntitySubscription();
    }
  }

  private _getMergedState(entityId: string): HassEntity | undefined {
    return this._entityOverlay[entityId] ?? this.hass?.states[entityId];
  }

  private async _disconnectEntitySubscription(): Promise<void> {
    if (this._unsubEntities) {
      try {
        await this._unsubEntities();
      } catch {
        /* ignore */
      }
      this._unsubEntities = undefined;
    }
    this._entityOverlay = {};
  }

  private async _syncEntitySubscription(): Promise<void> {
    if (!this.hass?.connected) {
      return;
    }
    const myGen = ++this._subscriptionGeneration;
    const ids = collectDectyrEntityIds(this.hass);
    const key = [...ids].sort().join("\n");
    if (key === this._subscribedIdsKey && this._unsubEntities) {
      return;
    }
    await this._disconnectEntitySubscription();
    if (myGen !== this._subscriptionGeneration) {
      return;
    }
    this._subscribedIdsKey = key;
    if (ids.length === 0) {
      return;
    }
    try {
      const conn = this.hass.connection as unknown as HassConnection;
      this._unsubEntities = await conn.subscribeMessage(
        (message) => {
          if (message.type === "event" && message.event && typeof message.event === "object") {
            applyEntityWsEvent(this._entityOverlay, message.event as EntityWsEvent);
            this.requestUpdate();
          }
        },
        { type: "subscribe_entities", entity_ids: ids },
      );
    } catch (err) {
      console.warn("Dectyr Surveillance: subscribe_entities failed", err);
      this._subscribedIdsKey = "";
    }
  }

  private _detectNewDrones(drones: DectyrDrone[]): void {
    const current = new Set(drones.map((d) => d.drone_id));
    if (this._previousDroneIds === null) {
      this._previousDroneIds = current;
      return;
    }
    let changed = false;
    for (const id of current) {
      if (!this._previousDroneIds.has(id)) {
        this._newDroneIds = new Set(this._newDroneIds).add(id);
        changed = true;
        const prev = this._newDroneClearTimers.get(id);
        if (prev !== undefined) {
          window.clearTimeout(prev);
        }
        const handle = window.setTimeout(() => {
          const next = new Set(this._newDroneIds);
          next.delete(id);
          this._newDroneIds = next;
          this._newDroneClearTimers.delete(id);
          this.requestUpdate();
        }, 2000);
        this._newDroneClearTimers.set(id, handle);
      }
    }
    this._previousDroneIds = current;
    if (changed) {
      this.requestUpdate();
    }
  }

  private _onHideInactive(ev: Event): void {
    const t = ev.target as { checked?: boolean };
    this._hideInactive = Boolean(t.checked);
  }

  private _onHeaderLogoError(): void {
    if (this._headerLogoUrl === DECTYR_BRAND_ICON) {
      this._headerLogoUrl = DECTYR_LOGO_PNG;
    } else if (this._headerLogoUrl === DECTYR_LOGO_PNG) {
      this._headerLogoUrl = DECTYR_LOGO_SVG;
    }
  }

  protected render(): TemplateResult {
    if (!this.hass || !this.config) {
      return html`<ha-card><div class="card-content">Loading…</div></ha-card>`;
    }

    const get = (id: string) => this._getMergedState(id);
    const scanners = findDectyrScanners(this.hass, get);
    const allDrones = findDectyrDrones(this.hass, get);
    const liveCount = allDrones.filter((d) => d.is_live).length;
    const visibleDrones = this._hideInactive ? allDrones.filter((d) => d.is_live) : allDrones;

    return html`
      <ha-card>
        <div class="header">
          <div class="brand-wrap">
            <img
              class="brand-logo"
              src=${this._headerLogoUrl}
              alt="DECTYR"
              loading="lazy"
              decoding="async"
              @error=${this._onHeaderLogoError}
            />
          </div>
          <span class="title">${this.config.title ?? "Dectyr Surveillance"}</span>
          <span class="counter">${liveCount} live · ${allDrones.length} total</span>
          <ha-switch .checked=${this._hideInactive} @change=${this._onHideInactive}></ha-switch>
          <span class="switch-label">Hide inactive</span>
        </div>
        <div class="card-content">
          <div class="stats">
            <dectyr-stat-tile .value=${scanners.length} .label=${`scanner${scanners.length === 1 ? "" : "s"}`}>
            </dectyr-stat-tile>
            <dectyr-stat-tile .value=${liveCount} .label=${`drone${liveCount === 1 ? "" : "s"} live`}>
            </dectyr-stat-tile>
            <dectyr-stat-tile .value=${allDrones.length} .label=${"total tracked"}></dectyr-stat-tile>
          </div>
          ${scanners.length
            ? html`
                <div class="scanners-block">
                  <div class="section-title">Scanners</div>
                  <div class="scanner-list">
                    ${scanners.map(
                      (s) => html`
                        <div class="scanner-row">
                          <span class="dot ${s.is_online ? "on" : ""}"></span>
                          <span class="sname">${s.name}</span>
                          ${s.cpu_temp != null
                            ? html`<span class="meta">${s.cpu_temp.toFixed(0)}°C</span>`
                            : ""}
                          ${s.battery != null
                            ? html`<span class="meta">${s.battery.toFixed(0)}%</span>`
                            : ""}
                        </div>
                      `,
                    )}
                  </div>
                </div>
              `
            : ""}
          <div class="section-title">Drones</div>
          ${allDrones.length > 0
            ? html`
                <dectyr-drone-list
                  .drones=${visibleDrones}
                  .newDroneIds=${this._newDroneIds}
                ></dectyr-drone-list>
              `
            : html`<div class="empty">No drones detected yet.</div>`}
        </div>
      </ha-card>
    `;
  }

  static get styles(): CSSResult[] {
    return [
      dectyrCardTheme,
      css`
        :host {
          display: block;
        }
        .header {
          padding: 14px 16px;
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 10px 12px;
          border-bottom: 1px solid var(--divider-color);
        }
        .brand-wrap {
          flex-shrink: 0;
          display: flex;
          align-items: center;
        }
        .brand-logo {
          width: 32px;
          height: 32px;
          object-fit: contain;
          display: block;
        }
        .title {
          font-size: 1.1em;
          font-weight: 500;
          flex: 1;
          min-width: 0;
        }
        .counter {
          font-size: 0.88em;
          color: var(--secondary-text-color);
          white-space: nowrap;
        }
        ha-switch {
          margin-left: auto;
        }
        .switch-label {
          font-size: 0.85em;
          color: var(--secondary-text-color);
        }
        .card-content {
          padding: 16px;
        }
        .stats {
          display: flex;
          gap: 12px;
          margin-bottom: 16px;
        }
        .section-title {
          font-weight: 600;
          margin: 12px 0 8px;
          color: var(--secondary-text-color);
        }
        .section-title:first-of-type {
          margin-top: 0;
        }
        .scanner-list {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .scanner-row {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 10px;
          border-radius: var(--dectyr-radius);
          background: var(--secondary-background-color);
          font-size: 0.92em;
        }
        .dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: var(--disabled-color, #9e9e9e);
          flex-shrink: 0;
        }
        .dot.on {
          background: var(--success-color, #4caf50);
        }
        .sname {
          flex: 1;
          min-width: 0;
          font-weight: 500;
        }
        .meta {
          font-size: 0.85em;
          color: var(--secondary-text-color);
        }
        .empty {
          padding: 24px;
          text-align: center;
          color: var(--secondary-text-color);
        }
      `,
    ];
  }
}

window.customCards = window.customCards || [];
window.customCards.push({
  type: "dectyr-surveillance-card",
  name: "Dectyr Surveillance",
  description: "Live drone surveillance dashboard for Dectyr RX-5 detectors",
  preview: false,
  documentationURL: "https://github.com/alexandre0thomas/ha-dectyr",
});

console.info(
  "%c DECTYR-SURVEILLANCE-CARD %c F3 ",
  "color: white; background: #00569b; font-weight: 700;",
  "color: #00569b; background: white; font-weight: 700;",
);
