/** Companion WebView often paints Lovelace before this module defines the cards. */

import { defineDectyrHosts, implTag, mountAllDectyrHosts } from "./dectyr-host";
import { queryDeep } from "./dom-deep";

export { queryDeep } from "./dom-deep";

export type HuiCardEl = HTMLElement & {
  config?: { type?: string };
  _config?: { type?: string };
  load?: () => void;
};

export const DECTYR_CARD_TYPES = new Set([
  "custom:dectyr-surveillance-card",
  "custom:dectyr-map-card",
]);

const lastLoadAt = new WeakMap<Element, number>();

const WATCH_FLAG = "__dectyrRebuildWatch";

declare global {
  interface Window {
    __dectyrRebuildWatch?: boolean;
  }
}

export function cardType(el: HuiCardEl): string | undefined {
  return el.config?.type ?? el._config?.type;
}

export function closestHuiCard(el: Element | null): HuiCardEl | null {
  let cur: Element | null = el;
  while (cur) {
    if (cur.localName === "hui-card") {
      return cur as HuiCardEl;
    }
    cur = cur.parentElement;
  }
  return null;
}

export function fireLlRebuild(target: EventTarget): void {
  const ev = new Event("ll-rebuild", { bubbles: true, composed: true });
  (ev as Event & { detail: Record<string, never> }).detail = {};
  target.dispatchEvent(ev);
}

export function collectHuiCardsToRebuild(root: ParentNode = document): HuiCardEl[] {
  const cards = queryDeep("hui-card", root) as HuiCardEl[];
  const errorCards = queryDeep("hui-error-card", root);
  const toLoad = new Set<HuiCardEl>();

  for (const el of cards) {
    const type = cardType(el);
    if (!type || !DECTYR_CARD_TYPES.has(type)) {
      continue;
    }
    if (el.querySelector("hui-error-card")) {
      toLoad.add(el);
    }
  }

  for (const err of errorCards) {
    const parent = closestHuiCard(err);
    const type = parent ? cardType(parent) : undefined;
    if (parent && type && DECTYR_CARD_TYPES.has(type)) {
      toLoad.add(parent);
      continue;
    }
    const text = (err.textContent ?? "").toLowerCase();
    if (text.includes("dectyr")) {
      if (parent) {
        toLoad.add(parent);
      }
    }
  }

  return [...toLoad];
}

export type RebuildScan = {
  lightHuiCard: number;
  deepHuiCard: number;
  deepError: number;
  dectyrDefined: string;
  dectyrMounted: number;
  types: string[];
  toLoad: number;
};

export function scanDectyrLovelace(root: ParentNode = document): RebuildScan {
  const cards = queryDeep("hui-card", root) as HuiCardEl[];
  const types = cards.map((c) => cardType(c) ?? "?").filter((t) => t.startsWith("custom:dectyr"));
  return {
    lightHuiCard: root.querySelectorAll("hui-card").length,
    deepHuiCard: cards.length,
    deepError: queryDeep("hui-error-card", root).length,
    dectyrDefined: `host=${customElements.get("dectyr-surveillance-card") ? 1 : 0}${customElements.get("dectyr-map-card") ? 1 : 0} impl=${customElements.get(implTag("dectyr-surveillance-card")) ? 1 : 0}${customElements.get(implTag("dectyr-map-card")) ? 1 : 0}`,
    dectyrMounted: queryDeep("dectyr-surveillance-card-impl,dectyr-map-card-impl", root).length,
    types,
    toLoad: collectHuiCardsToRebuild(root).length,
  };
}

function hostTagForCard(el: HuiCardEl): string | undefined {
  const type = cardType(el);
  if (!type?.startsWith("custom:")) {
    return undefined;
  }
  return type.slice("custom:".length);
}

export function rebuildDectyrErrorCards(root: ParentNode = document): number {
  if (typeof document === "undefined") {
    return 0;
  }
  const now = Date.now();
  const toLoad = collectHuiCardsToRebuild(root);
  const errorCards = queryDeep("hui-error-card", root);

  let loaded = 0;
  for (const el of toLoad) {
    const prev = lastLoadAt.get(el) ?? 0;
    if (now - prev < 1200) {
      continue;
    }
    const hostTag = hostTagForCard(el);
    if (!hostTag || !customElements.get(hostTag)) {
      continue;
    }
    lastLoadAt.set(el, now);
    loaded += 1;
    try {
      el.load?.();
    } catch (err) {
      console.warn("[dectyr] hui-card.load() failed", err);
    }
    const innerError = el.querySelector("hui-error-card");
    if (innerError) {
      fireLlRebuild(innerError);
    }
  }

  for (const err of errorCards) {
    if (closestHuiCard(err)) {
      continue;
    }
    const text = (err.textContent ?? "").toLowerCase();
    if (text.includes("dectyr")) {
      fireLlRebuild(err);
    }
  }

  mountAllDectyrHosts(root);
  return loaded;
}

function observeShadowTree(onMutate: () => void): void {
  const observed = new WeakSet<Node>();

  const observe = (root: Node): void => {
    if (observed.has(root)) {
      return;
    }
    observed.add(root);
    const obs = new MutationObserver((mutations) => {
      onMutate();
      for (const m of mutations) {
        m.addedNodes.forEach((n) => {
          if (n instanceof Element) {
            if (n.shadowRoot) {
              observe(n.shadowRoot);
            }
            n.querySelectorAll("*").forEach((el) => {
              if (el.shadowRoot) {
                observe(el.shadowRoot);
              }
            });
          }
        });
      }
    });
    obs.observe(root, { childList: true, subtree: true });
  };

  observe(document);

  const origAttach = Element.prototype.attachShadow;
  Element.prototype.attachShadow = function attachShadowPatched(
    this: Element,
    init: ShadowRootInit,
  ): ShadowRoot {
    const root = origAttach.call(this, init);
    observe(root);
    return root;
  };

  document.querySelectorAll("*").forEach((el) => {
    if (el.shadowRoot) {
      observe(el.shadowRoot);
    }
  });
}

export function watchAndRebuildDectyrCards(): void {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return;
  }
  if (window[WATCH_FLAG]) {
    return;
  }
  window[WATCH_FLAG] = true;
  defineDectyrHosts();

  let debounce: number | undefined;
  const scheduleSoon = (): void => {
    if (debounce !== undefined) {
      window.clearTimeout(debounce);
    }
    debounce = window.setTimeout(() => {
      debounce = undefined;
      rebuildDectyrErrorCards();
    }, 80);
  };

  const burst = (): void => {
    const delays = [0, 50, 150, 300, 600, 1000, 2000, 4000, 8000];
    for (const ms of delays) {
      window.setTimeout(rebuildDectyrErrorCards, ms);
    }
  };

  burst();
  window.addEventListener("load", burst);
  window.addEventListener("pageshow", burst);
  window.addEventListener("location-changed", burst);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
      burst();
    }
  });

  void customElements.whenDefined("dectyr-surveillance-card").then(burst);
  void customElements.whenDefined("dectyr-map-card").then(burst);
  void customElements.whenDefined("dectyr-surveillance-card-impl").then(burst);
  void customElements.whenDefined("dectyr-map-card-impl").then(burst);
  void customElements.whenDefined("hui-card").then(burst);
  void customElements.whenDefined("home-assistant").then(burst);

  observeShadowTree(scheduleSoon);
}
