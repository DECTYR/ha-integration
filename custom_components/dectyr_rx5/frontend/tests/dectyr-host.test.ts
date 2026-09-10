import { beforeEach, describe, expect, it } from "vitest";

import {
  defineDectyrHosts,
  implTag,
  mountAllDectyrHosts,
} from "../src/utils/dectyr-host";

beforeEach(() => {
  document.body.replaceChildren();
});

describe("dectyr hosts", () => {
  it("lets Lovelace create the host before the Lit impl exists, then mounts the impl", () => {
    defineDectyrHosts();
    expect(customElements.get("dectyr-surveillance-card")).toBeTruthy();
    expect(customElements.get(implTag("dectyr-surveillance-card"))).toBeFalsy();

    const host = document.createElement("dectyr-surveillance-card") as HTMLElement & {
      setConfig: (c: Record<string, unknown>) => void;
      hass?: unknown;
    };
    host.setConfig({ type: "custom:dectyr-surveillance-card" });
    document.body.append(host);
    expect(host.childElementCount).toBe(0);

    class FakeImpl extends HTMLElement {
      config?: Record<string, unknown>;
      hass?: unknown;
      setConfig(config: Record<string, unknown>) {
        this.config = config;
      }
    }
    customElements.define(implTag("dectyr-surveillance-card"), FakeImpl);

    expect(mountAllDectyrHosts()).toBe(1);
    expect(host.childElementCount).toBe(1);
    const inner = host.firstElementChild as FakeImpl;
    expect(inner).toBeInstanceOf(FakeImpl);
    expect(inner.config?.type).toBe("custom:dectyr-surveillance-card");

    host.hass = { states: {} };
    expect(inner.hass).toEqual({ states: {} });
  });
});
