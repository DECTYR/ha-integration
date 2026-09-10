/**
 * Lovelace extra_module_url entry.
 * Registers host tags immediately so Companion does not show
 * "Custom element doesn't exist", then loads the Lit implementations.
 */
const HOST_TAGS = ["dectyr-surveillance-card", "dectyr-map-card"];

function implTag(hostTag) {
  return `${hostTag}-impl`;
}

function defineHosts() {
  for (const tag of HOST_TAGS) {
    if (customElements.get(tag)) {
      continue;
    }
    customElements.define(
      tag,
      class DectyrCardHost extends HTMLElement {
        setConfig(config) {
          this._config = config;
          if (this._card && this._card.setConfig) {
            this._card.setConfig(config);
            return;
          }
          this._dectyrMount();
        }
        set hass(hass) {
          this._hass = hass;
          if (this._card) {
            this._card.hass = hass;
          }
        }
        get hass() {
          return this._hass;
        }
        set preview(value) {
          this._preview = value;
          if (this._card) {
            this._card.preview = value;
          }
        }
        set layout(value) {
          this._layout = value;
          if (this._card) {
            this._card.layout = value;
          }
        }
        set editMode(value) {
          this._editMode = value;
          if (this._card) {
            this._card.editMode = value;
          }
        }
        getCardSize() {
          return this._card && this._card.getCardSize ? this._card.getCardSize() : 4;
        }
        getGridOptions() {
          return this._card && this._card.getGridOptions ? this._card.getGridOptions() : {};
        }
        connectedCallback() {
          this.style.display = "block";
          this.style.width = "100%";
          this._dectyrMount();
        }
        _dectyrMount() {
          const impl = implTag(this.localName);
          if (this._card || !this._config || !customElements.get(impl)) {
            return;
          }
          const card = document.createElement(impl);
          try {
            if (card.setConfig) {
              card.setConfig(this._config);
            }
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
      },
    );
  }
}

function mountAllHosts() {
  const visit = (node) => {
    for (const tag of HOST_TAGS) {
      node.querySelectorAll(tag).forEach((el) => {
        if (el._dectyrMount) {
          el._dectyrMount();
        }
      });
    }
    node.querySelectorAll("*").forEach((el) => {
      if (el.shadowRoot) {
        visit(el.shadowRoot);
      }
    });
  };
  visit(document);
}

defineHosts();

const bundleUrl = new URL("./dectyr-surveillance-card.js?v=1.1.4", import.meta.url);
bundleUrl.searchParams.set("r", String(Date.now()));

import(bundleUrl.href)
  .then(() => {
    mountAllHosts();
  })
  .catch((err) => {
    console.error("[dectyr-boot] failed to load card bundle", err);
  });
