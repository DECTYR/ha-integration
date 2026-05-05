import { LitElement, html, css, type CSSResult, type TemplateResult } from "lit";
import { customElement, property } from "lit/decorators.js";
import { repeat } from "lit/directives/repeat.js";

import type { DectyrDrone } from "../types";
import "./drone-card";

/** Live drones first, then stable lexicographic id (avoids reordering on RSSI ticks). */
function sortDrones(a: DectyrDrone, b: DectyrDrone): number {
  if (a.is_live !== b.is_live) {
    return a.is_live ? -1 : 1;
  }
  return a.drone_id.localeCompare(b.drone_id, undefined, { sensitivity: "base", numeric: true });
}

@customElement("dectyr-drone-list")
export class DectyrDroneList extends LitElement {
  @property({ type: Array }) drones: DectyrDrone[] = [];

  @property({ attribute: false }) newDroneIds: Set<string> = new Set();

  protected render(): TemplateResult {
    const sorted = [...this.drones].sort(sortDrones);
    return html`
      <div class="list">
        ${repeat(
          sorted,
          (d) => d.drone_id,
          (d) => html`
            <dectyr-drone-card
              .drone=${d}
              .isNew=${this.newDroneIds.has(d.drone_id)}
            ></dectyr-drone-card>
          `,
        )}
      </div>
    `;
  }

  static get styles(): CSSResult {
    return css`
      :host {
        display: block;
      }
      .list {
        margin-top: 4px;
      }
    `;
  }
}
