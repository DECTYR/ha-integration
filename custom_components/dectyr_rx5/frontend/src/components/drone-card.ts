import { LitElement, html, css, type CSSResult, type TemplateResult } from "lit";
import { customElement, property } from "lit/decorators.js";

import { dectyrCardTheme } from "../styles/theme";
import { distanceBadgeStyles, rssiBadgeStyles } from "../styles/badges";
import type { DectyrDrone } from "../types";
import {
  distanceClass,
  formatAltitude,
  formatDistanceCompact,
  formatHeading,
  formatOfflineAgo,
  formatRelativeTime,
  formatSpeed,
  humanizeSlug,
} from "../utils/format";
import { countryFlag } from "../utils/flags";

@customElement("dectyr-drone-card")
export class DectyrDroneCard extends LitElement {
  @property({ type: Object }) drone!: DectyrDrone;

  @property({ type: Boolean, reflect: true }) isNew = false;

  @property({ type: Boolean }) compact = false;

  protected render(): TemplateResult {
    const live = this.drone.is_live;
    const isNewClass = this.isNew ? " is-new" : "";
    return html`
      <div
        class="drone-card ${live ? "live" : "offline"}${isNewClass}"
        @click=${this._onClick}
        role="button"
        tabindex="0"
        @keydown=${this._onKeydown}
      >
        <div class="header">
          <ha-icon
            icon=${live ? "mdi:quadcopter" : this._iconForManufacturer()}
            class="drone-icon"
          ></ha-icon>
          <div class="title-block">
            <div class="title">${this.drone.display_name}</div>
            <div class="subtitle">${this.drone.drone_id}</div>
          </div>
          ${live ? this._renderDistanceBadge() : this._renderOfflineBadge()}
        </div>
        ${live ? this._renderTelemetryLine() : ""}
        ${this._renderOperatorLine()}
      </div>
    `;
  }

  private _onKeydown(ev: KeyboardEvent): void {
    if (ev.key === "Enter" || ev.key === " ") {
      ev.preventDefault();
      this._onClick();
    }
  }

  private _onClick(): void {
    this.dispatchEvent(
      new CustomEvent("dectyr-drone-clicked", {
        detail: { drone_id: this.drone.drone_id },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private _iconForManufacturer(): string {
    const m = (this.drone.manufacturer || "").toLowerCase();
    if (m.includes("dji")) {
      return "mdi:dji";
    }
    if (m.includes("parrot")) {
      return "mdi:parrot";
    }
    return "mdi:quadcopter";
  }

  private _renderDistanceBadge(): TemplateResult {
    const cls = distanceClass(this.drone.distance_to_scanner);
    return html`
      <span class="distance-badge ${cls}">
        <ha-icon icon="mdi:map-marker-distance"></ha-icon>
        ${formatDistanceCompact(this.drone.distance_to_scanner)}
      </span>
    `;
  }

  private _renderOfflineBadge(): TemplateResult {
    return html`
      <span class="rssi-badge rssi-unknown">${formatOfflineAgo(this.drone.last_seen)}</span>
    `;
  }

  private _renderTelemetryLine(): TemplateResult {
    const parts: string[] = [];
    const alt = this.drone.altitude_agl ?? this.drone.altitude_msl;
    if (alt !== null && !Number.isNaN(alt)) {
      parts.push(formatAltitude(alt));
    }
    if (this.drone.speed_horizontal !== null && !Number.isNaN(this.drone.speed_horizontal)) {
      parts.push(formatSpeed(this.drone.speed_horizontal));
    }
    if (this.drone.direction !== null && !Number.isNaN(this.drone.direction)) {
      parts.push(formatHeading(this.drone.direction));
    }
    if (parts.length === 0) {
      return html``;
    }
    return html`
      <div class="telemetry-line">
        <ha-icon icon="mdi:trending-up" class="telemetry-icon"></ha-icon>
        <span>${parts.join(" · ")}</span>
      </div>
    `;
  }

  private _renderOperatorLine(): TemplateResult {
    if (!this.drone.is_live) {
      const ls = this.drone.last_seen;
      const lastSeenText = ls ? `Last seen ${formatRelativeTime(ls)}` : "Offline";
      return html`
        <div class="operator-line offline-line">
          <ha-icon icon="mdi:account-clock" class="op-icon"></ha-icon>
          <span>${lastSeenText}</span>
        </div>
      `;
    }
    const oid = this.drone.operator_id;
    const iso = this.drone.operator_country;
    const flag = iso ? countryFlag(iso) : "";
    return html`
      <div class="operator-line">
        <ha-icon icon="mdi:account" class="op-icon"></ha-icon>
        ${oid ? html`<span class="op">${oid}</span>` : ""}
        ${iso
          ? html`<span class="flag" title=${iso}>${flag} ${iso}</span>`
          : ""}
        ${this._renderEuClassification()}
        ${this.drone.multi_source
          ? html`<span class="hint" title="Multi-source">· multi</span>`
          : ""}
      </div>
    `;
  }

  private _renderEuClassification(): TemplateResult {
    const ceu = humanizeSlug(this.drone.category_eu);
    const cl = this.drone.class_eu;
    if (!ceu && !cl) {
      return html``;
    }
    const cls = cl
      ? cl.length > 0
        ? cl.charAt(0).toUpperCase() + cl.slice(1)
        : "—"
      : "—";
    const cat = ceu ?? "—";
    return html`<span class="eu">${cls} / ${cat}</span>`;
  }

  static get styles(): CSSResult[] {
    return [
      dectyrCardTheme,
      rssiBadgeStyles,
      distanceBadgeStyles,
      css`
        :host {
          display: block;
        }
        .drone-card {
          border-radius: var(--dectyr-radius);
          padding: 12px 14px;
          margin-bottom: 8px;
          background: var(--dectyr-row-bg);
          border: var(--dectyr-border-subtle);
          cursor: pointer;
          transition:
            opacity 0.2s ease,
            border-color 0.2s ease,
            box-shadow 0.2s ease;
        }
        .drone-card.live {
          border: var(--dectyr-live-border);
        }
        .drone-card.offline {
          border: var(--dectyr-offline-border);
          opacity: 0.55;
        }
        .drone-card.offline .rssi-badge {
          filter: grayscale(1);
        }
        .drone-card.is-new {
          animation: pulse-new 0.7s ease-out 3;
        }
        @keyframes pulse-new {
          0%,
          100% {
            box-shadow: 0 0 0 0 rgba(244, 67, 54, 0.55);
          }
          50% {
            box-shadow: 0 0 0 8px rgba(244, 67, 54, 0);
          }
        }
        .header {
          display: flex;
          align-items: flex-start;
          gap: 10px;
        }
        .drone-icon {
          --mdc-icon-size: 28px;
          color: var(--primary-color);
          flex-shrink: 0;
          margin-top: 2px;
        }
        .title-block {
          flex: 1;
          min-width: 0;
        }
        .title {
          font-weight: 600;
          font-size: 1.05em;
          line-height: 1.25;
        }
        .subtitle {
          font-size: 0.8em;
          color: var(--dectyr-muted);
          font-family: var(--code-font-family, monospace);
          word-break: break-all;
        }
        .telemetry-line {
          margin-top: 8px;
          padding-top: 8px;
          border-top: 1px solid var(--divider-color);
          font-size: 0.9em;
          color: var(--primary-text-color);
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .telemetry-icon {
          --mdc-icon-size: 18px;
          flex-shrink: 0;
          opacity: 0.85;
        }
        .operator-line {
          margin-top: 8px;
          font-size: 0.88em;
          color: var(--dectyr-muted);
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 6px;
        }
        .op-icon {
          --mdc-icon-size: 18px;
          flex-shrink: 0;
        }
        .offline-line {
          color: var(--primary-text-color);
        }
        .flag {
          font-size: 1.05em;
        }
        .eu {
          font-weight: 500;
        }
        .hint {
          font-size: 0.85em;
          opacity: 0.85;
        }
      `,
    ];
  }
}
