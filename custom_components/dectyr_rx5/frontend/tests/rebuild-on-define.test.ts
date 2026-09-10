import { beforeEach, describe, expect, it } from "vitest";

import {
  cardType,
  closestHuiCard,
  collectHuiCardsToRebuild,
  DECTYR_CARD_TYPES,
  queryDeep,
  rebuildDectyrErrorCards,
  scanDectyrLovelace,
  type HuiCardEl,
} from "../src/utils/rebuild-on-define";
import { defineDectyrHosts } from "../src/utils/dectyr-host";

beforeEach(() => {
  document.body.replaceChildren();
});

function nestShadow(host: Element): ShadowRoot {
  return host.attachShadow({ mode: "open" });
}

function makeHuiCard(type: string, withError: boolean): HuiCardEl {
  const card = document.createElement("hui-card") as HuiCardEl;
  card.config = { type };
  card.load = () => {
    card.dataset.loaded = String(Number(card.dataset.loaded ?? "0") + 1);
    card.querySelector("hui-error-card")?.remove();
  };
  if (withError) {
    const err = document.createElement("hui-error-card");
    err.textContent = `Custom element doesn't exist: ${type.replace("custom:", "")}`;
    card.appendChild(err);
  }
  return card;
}

describe("queryDeep", () => {
  it("finds hui-card inside nested open shadow roots (HA chrome)", () => {
    const ha = document.createElement("home-assistant");
    document.body.append(ha);
    const main = document.createElement("home-assistant-main");
    nestShadow(ha).append(main);
    const root = document.createElement("hui-root");
    nestShadow(main).append(root);
    const view = document.createElement("hui-view");
    nestShadow(root).append(view);
    const card = makeHuiCard("custom:dectyr-map-card", true);
    view.append(card);

    expect(document.querySelectorAll("hui-card")).toHaveLength(0);
    expect(queryDeep("hui-card")).toEqual([card]);
    expect(queryDeep("hui-error-card")).toHaveLength(1);
  });
});

describe("collectHuiCardsToRebuild", () => {
  it("selects only Dectyr cards that still host hui-error-card", () => {
    const keep = makeHuiCard("custom:dectyr-surveillance-card", true);
    const healthy = makeHuiCard("custom:dectyr-map-card", false);
    const other = makeHuiCard("custom:mushroom-title-card", true);
    document.body.append(keep, healthy, other);

    expect(collectHuiCardsToRebuild()).toEqual([keep]);
  });

  it("finds Dectyr types via closestHuiCard from a nested error card", () => {
    expect(DECTYR_CARD_TYPES.has("custom:dectyr-map-card")).toBe(true);
    const card = makeHuiCard("custom:dectyr-map-card", true);
    document.body.append(card);
    const err = card.querySelector("hui-error-card");
    expect(closestHuiCard(err)).toBe(card);
    expect(cardType(card)).toBe("custom:dectyr-map-card");
  });
});

describe("rebuildDectyrErrorCards", () => {
  it("does not call load() while the host tag is missing", () => {
    const host = document.createElement("home-assistant");
    document.body.append(host);
    const card = makeHuiCard("custom:dectyr-surveillance-card", true);
    nestShadow(host).append(card);

    const n = rebuildDectyrErrorCards();
    expect(n).toBe(0);
    expect(card.dataset.loaded).toBeUndefined();
    expect(card.querySelector("hui-error-card")).not.toBeNull();
  });

  it("calls load() on the wrapper so the real card can replace the error", () => {
    defineDectyrHosts();
    const host = document.createElement("home-assistant");
    document.body.append(host);
    const card = makeHuiCard("custom:dectyr-surveillance-card", true);
    nestShadow(host).append(card);

    const n = rebuildDectyrErrorCards();
    expect(n).toBe(1);
    expect(card.dataset.loaded).toBe("1");
    expect(card.querySelector("hui-error-card")).toBeNull();
  });

  it("reports light vs deep counts on the scan", () => {
    const host = document.createElement("home-assistant");
    document.body.append(host);
    nestShadow(host).append(makeHuiCard("custom:dectyr-map-card", true));

    const scan = scanDectyrLovelace();
    expect(scan.lightHuiCard).toBe(0);
    expect(scan.deepHuiCard).toBe(1);
    expect(scan.deepError).toBe(1);
    expect(scan.toLoad).toBe(1);
  });
});
