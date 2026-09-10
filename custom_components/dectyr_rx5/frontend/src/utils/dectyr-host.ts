/** Lovelace looks up `dectyr-*-card` immediately; Lit impls load later as `*-impl`. */

import { queryDeep } from "./dom-deep";

export const DECTYR_HOST_TAGS = ["dectyr-surveillance-card", "dectyr-map-card"] as const;

export type DectyrHostTag = (typeof DECTYR_HOST_TAGS)[number];

type DectyrImplEl = HTMLElement & {
  setConfig?: (config: Record<string, unknown>) => void;
  hass?: unknown;
  preview?: unknown;
  layout?: unknown;
  editMode?: unknown;
  getCardSize?: () => number;
  getGridOptions?: () => Record<string, unknown>;
};

export type DectyrCardHostEl = HTMLElement & {
  _dectyrMount?: () => void;
  setConfig?: (config: Record<string, unknown>) => void;
};

export function implTag(hostTag: string): string {
  return `${hostTag}-impl`;
}

function defineOneHost(tag: DectyrHostTag): void {
  if (customElements.get(tag)) {
    return;
  }

  class DectyrCardHost extends HTMLElement {
    _config?: Record<string, unknown>;
    _hass?: unknown;
    _preview?: unknown;
    _layout?: unknown;
    _editMode?: unknown;
    _card?: DectyrImplEl;

    constructor() {
      super();
    }

    setConfig(config: Record<string, unknown>): void {
      this._config = config;
      if (this._card?.setConfig) {
        this._card.setConfig(config);
        return;
      }
      this._dectyrMount();
    }

    set hass(hass: unknown) {
      this._hass = hass;
      if (this._card) {
        this._card.hass = hass;
      }
    }

    get hass(): unknown {
      return this._hass;
    }

    set preview(value: unknown) {
      this._preview = value;
      if (this._card) {
        this._card.preview = value;
      }
    }

    set layout(value: unknown) {
      this._layout = value;
      if (this._card) {
        this._card.layout = value;
      }
    }

    set editMode(value: unknown) {
      this._editMode = value;
      if (this._card) {
        this._card.editMode = value;
      }
    }

    getCardSize(): number {
      return this._card?.getCardSize?.() ?? 4;
    }

    getGridOptions(): Record<string, unknown> {
      return this._card?.getGridOptions?.() ?? {};
    }

    connectedCallback(): void {
      this.style.display = "block";
      this.style.width = "100%";
      this._dectyrMount();
    }

    _dectyrMount(): void {
      const impl = implTag(this.localName);
      if (this._card || !this._config || !customElements.get(impl)) {
        return;
      }
      const card = document.createElement(impl) as DectyrImplEl;
      try {
        card.setConfig?.(this._config);
      } catch (err) {
        console.error("[dectyr-host] setConfig failed", err);
        return;
      }
      if (this._hass !== undefined) {
        card.hass = this._hass;
      }
      if (this._preview !== undefined) {
        card.preview = this._preview;
      }
      if (this._layout !== undefined) {
        card.layout = this._layout;
      }
      if (this._editMode !== undefined) {
        card.editMode = this._editMode;
      }
      this.replaceChildren(card);
      this._card = card;
      this.dispatchEvent(new Event("ll-upgrade", { bubbles: true, composed: true }));
      this.dispatchEvent(new Event("card-updated", { bubbles: true, composed: true }));
    }
  }

  customElements.define(tag, DectyrCardHost);
}

export function defineDectyrHosts(): void {
  if (typeof customElements === "undefined") {
    return;
  }
  for (const tag of DECTYR_HOST_TAGS) {
    defineOneHost(tag);
  }
}

export function mountAllDectyrHosts(root: ParentNode = document): number {
  if (typeof document === "undefined") {
    return 0;
  }
  let n = 0;
  for (const tag of DECTYR_HOST_TAGS) {
    for (const node of queryDeep(tag, root)) {
      const el = node as DectyrCardHostEl;
      const before = el.childElementCount;
      el._dectyrMount?.();
      if (el.childElementCount > before) {
        n += 1;
      }
    }
  }
  return n;
}
