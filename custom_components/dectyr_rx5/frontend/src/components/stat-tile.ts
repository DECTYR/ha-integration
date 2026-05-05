import { LitElement, html, css, type CSSResult, type TemplateResult } from "lit";
import { customElement, property } from "lit/decorators.js";

@customElement("dectyr-stat-tile")
export class DectyrStatTile extends LitElement {
  @property({ type: String }) label = "";

  @property({ type: String }) value: string | number = "";

  protected render(): TemplateResult {
    return html`
      <div class="tile">
        <span class="value">${this.value}</span>
        <span class="label">${this.label}</span>
      </div>
    `;
  }

  static get styles(): CSSResult {
    return css`
      :host {
        display: block;
        flex: 1;
        min-width: 0;
      }
      .tile {
        text-align: center;
        padding: 12px;
        background: var(--secondary-background-color);
        border-radius: var(--dectyr-radius, 12px);
      }
      .value {
        display: block;
        font-size: 2em;
        font-weight: 600;
        color: var(--primary-color);
      }
      .label {
        display: block;
        font-size: 0.85em;
        color: var(--secondary-text-color);
        text-transform: uppercase;
      }
    `;
  }
}
