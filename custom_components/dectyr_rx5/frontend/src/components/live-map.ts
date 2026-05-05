import { LitElement, html, css, type CSSResult, type TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import type { HomeAssistant } from "custom-card-helpers";
import type { PropertyValues } from "lit";
import { createRef, ref } from "lit/directives/ref.js";

import type { DectyrDrone, DectyrScanner } from "../types";
import { loadLeaflet, type LeafletLib } from "../utils/leaflet-loader";
import { TrailStore } from "../utils/trail-store";
import { droneIcon, operatorIcon, scannerIcon } from "../utils/marker-icons";

type LeafletMarker = {
  addTo: (m: unknown) => LeafletMarker;
  remove: () => void;
  setLatLng: (ll: [number, number]) => void;
  setIcon?: (ic: unknown) => void;
  bindPopup: (html: string) => LeafletMarker;
  openPopup?: () => void;
};

/** Light DOM so global Leaflet CSS from CDN applies to the map tiles and controls. */
@customElement("dectyr-live-map")
export class DectyrLiveMap extends LitElement {
  /** Passed for parity with other card children (future context actions). */
  @property({ attribute: false }) hass?: HomeAssistant;

  @property({ attribute: false }) drones: DectyrDrone[] = [];

  @property({ attribute: false }) scanners: DectyrScanner[] = [];

  @property({ attribute: false }) homeZone?: { latitude: number; longitude: number };

  @property({ attribute: false }) highlightedDroneId?: string;

  @property({ type: Boolean }) showTrails = true;

  @property({ type: Number }) trailMinutes = 30;

  @state() private _mapLoading = true;

  private readonly _mapContainerRef = createRef<HTMLDivElement>();

  private _L?: LeafletLib;
  private _map?: Record<string, unknown>;
  private readonly _trailStore = new TrailStore();
  private readonly _droneMarkers = new Map<string, LeafletMarker>();
  private readonly _scannerMarkers = new Map<string, LeafletMarker>();
  private readonly _operatorMarkers = new Map<string, LeafletMarker>();
  private readonly _trailLines = new Map<string, { remove?: () => void; setLatLngs?: (p: [number, number][]) => void }>();
  private _homeCircle?: unknown;
  private _mapInitLock = false;

  private static readonly FALLBACK: [number, number] = [48.8566, 2.3522];

  createRenderRoot(): HTMLElement {
    return this;
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this._destroyMap();
  }

  protected willUpdate(changed: PropertyValues<this>): void {
    super.willUpdate(changed);
    if (changed.has("trailMinutes")) {
      this._trailStore.setMaxAgeMinutes(this.trailMinutes);
    }
  }

  protected updated(changed: PropertyValues<this>): void {
    super.updated(changed);
    const host = this._mapContainerRef.value;
    if (host && !this._map) {
      void this._initMap(host);
    }
    if (!this._map || !this._L) {
      return;
    }
    if (changed.has("drones")) {
      this._ingestTrails();
      this._updateDroneMarkers();
      this._updateOperatorMarkers();
      this._updateTrails();
    }
    if (changed.has("scanners")) {
      this._updateScannerMarkers();
    }
    if (changed.has("highlightedDroneId")) {
      void this._applyHighlight();
    }
    if (changed.has("showTrails")) {
      this._updateTrails();
    }
  }

  private _destroyMap(): void {
    const map = this._map as { remove?: () => void } | undefined;
    map?.remove?.();
    this._map = undefined;
    this._L = undefined;
    this._droneMarkers.clear();
    this._scannerMarkers.clear();
    this._operatorMarkers.clear();
    this._trailLines.clear();
    this._homeCircle = undefined;
    this._mapLoading = true;
    this._mapInitLock = false;
  }

  private async _initMap(host: HTMLElement): Promise<void> {
    if (this._map || this._mapInitLock) {
      return;
    }
    this._mapInitLock = true;
    try {
      const L = await loadLeaflet();
      this._L = L;
      const center: [number, number] = this.homeZone
        ? [this.homeZone.latitude, this.homeZone.longitude]
        : DectyrLiveMap.FALLBACK;
      const mapFactory = L.map as (el: HTMLElement, opts?: Record<string, unknown>) => Record<string, unknown>;
      const tileLayerFactory = L.tileLayer as (
        url: string,
        opts?: Record<string, unknown>,
      ) => { addTo: (m: unknown) => unknown };
      const circleFactory = L.circle as (
        ll: [number, number],
        opts?: Record<string, unknown>,
      ) => { addTo: (m: unknown) => { bindPopup: (h: string) => unknown } };

      this._map = mapFactory(host, {
        center,
        zoom: 15,
        zoomControl: true,
      });
      tileLayerFactory("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap",
        maxZoom: 19,
      }).addTo(this._map);

      if (this.homeZone) {
        const ll: [number, number] = [this.homeZone.latitude, this.homeZone.longitude];
        this._homeCircle = circleFactory(ll, {
          radius: 100,
          color: "var(--primary-color, #03a9f4)",
          fillOpacity: 0.12,
          weight: 2,
        })
          .addTo(this._map)
          .bindPopup("Home");
      }

      this._trailStore.setMaxAgeMinutes(this.trailMinutes);
      this._ingestTrails();
      this._updateDroneMarkers();
      this._updateScannerMarkers();
      this._updateOperatorMarkers();
      this._updateTrails();
      this._mapLoading = false;
      this.requestUpdate();

      requestAnimationFrame(() => {
        (this._map as { invalidateSize?: () => void } | undefined)?.invalidateSize?.();
      });
    } catch (e) {
      console.warn("Dectyr live map: Leaflet init failed", e);
      this._mapLoading = false;
      this.requestUpdate();
    } finally {
      this._mapInitLock = false;
    }
  }

  private _ingestTrails(): void {
    const ts = new Date();
    for (const d of this.drones) {
      if (d.latitude != null && d.longitude != null) {
        this._trailStore.add(d.drone_id, d.latitude, d.longitude, d.last_seen ?? ts);
      }
    }
  }

  private _updateDroneMarkers(): void {
    const L = this._L;
    const map = this._map;
    if (!L || !map) {
      return;
    }
    const markerFactory = L.marker as (ll: [number, number], opts?: Record<string, unknown>) => LeafletMarker;

    const seen = new Set<string>();
    const hi = this.highlightedDroneId;

    for (const d of this.drones) {
      if (d.latitude == null || d.longitude == null) {
        continue;
      }
      seen.add(d.drone_id);
      const ll: [number, number] = [d.latitude, d.longitude];
      const popup = this._dronePopupHtml(d);
      let m = this._droneMarkers.get(d.drone_id);
      if (!m) {
        m = markerFactory(ll, {
          icon: droneIcon(L, d, d.drone_id === hi),
        })
          .addTo(map)
          .bindPopup(popup);
        this._droneMarkers.set(d.drone_id, m);
      } else {
        m.setLatLng(ll);
        m.setIcon?.(droneIcon(L, d, d.drone_id === hi));
        m.bindPopup(popup);
      }
    }

    for (const [id, m] of this._droneMarkers) {
      if (!seen.has(id)) {
        m.remove();
        this._droneMarkers.delete(id);
      }
    }
  }

  private _dronePopupHtml(d: DectyrDrone): string {
    const esc = (s: string) =>
      s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
    return `<strong>${esc(d.display_name)}</strong><br/><code>${esc(d.drone_id)}</code>`;
  }

  private _updateScannerMarkers(): void {
    const L = this._L;
    const map = this._map;
    if (!L || !map) {
      return;
    }
    const markerFactory = L.marker as (ll: [number, number], opts?: Record<string, unknown>) => LeafletMarker;

    const seen = new Set<string>();
    for (const s of this.scanners) {
      if (s.latitude == null || s.longitude == null) {
        continue;
      }
      seen.add(s.scanner_id);
      const ll: [number, number] = [s.latitude, s.longitude];
      const popup = `<strong>${this._esc(s.name)}</strong><br/>Scanner · ${
        s.is_online ? "online" : "offline"
      }`;
      let m = this._scannerMarkers.get(s.scanner_id);
      if (!m) {
        m = markerFactory(ll, { icon: scannerIcon(L, s.is_online) }).addTo(map).bindPopup(popup);
        this._scannerMarkers.set(s.scanner_id, m);
      } else {
        m.setLatLng(ll);
        m.setIcon?.(scannerIcon(L, s.is_online));
        m.bindPopup(popup);
      }
    }
    for (const [id, m] of this._scannerMarkers) {
      if (!seen.has(id)) {
        m.remove();
        this._scannerMarkers.delete(id);
      }
    }
  }

  private _esc(s: string): string {
    return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
  }

  private _updateOperatorMarkers(): void {
    const L = this._L;
    const map = this._map;
    if (!L || !map) {
      return;
    }
    const markerFactory = L.marker as (ll: [number, number], opts?: Record<string, unknown>) => LeafletMarker;

    const seen = new Set<string>();
    for (const d of this.drones) {
      if (d.operator_latitude == null || d.operator_longitude == null) {
        continue;
      }
      const key = `${d.drone_id}-op`;
      seen.add(key);
      const ll: [number, number] = [d.operator_latitude, d.operator_longitude];
      const name = d.operator_id ? this._esc(d.operator_id) : "Operator";
      const popup = `<strong>${name}</strong><br/>${this._esc(d.display_name)}`;
      let m = this._operatorMarkers.get(key);
      if (!m) {
        m = markerFactory(ll, { icon: operatorIcon(L) }).addTo(map).bindPopup(popup);
        this._operatorMarkers.set(key, m);
      } else {
        m.setLatLng(ll);
        m.bindPopup(popup);
      }
    }
    for (const [id, m] of this._operatorMarkers) {
      if (!seen.has(id)) {
        m.remove();
        this._operatorMarkers.delete(id);
      }
    }
  }

  private _updateTrails(): void {
    const L = this._L;
    const map = this._map;
    if (!L || !map) {
      return;
    }
    const polylineFactory = L.polyline as (
      pts: [number, number][],
      opts?: Record<string, unknown>,
    ) => { addTo: (m: unknown) => { remove: () => void; setLatLngs?: (p: [number, number][]) => void } };

    if (!this.showTrails) {
      for (const [, line] of this._trailLines) {
        line.remove?.();
      }
      this._trailLines.clear();
      return;
    }

    const seen = new Set<string>();
    for (const d of this.drones) {
      const pts = this._trailStore.getLatLngs(d.drone_id);
      if (pts.length < 2) {
        const old = this._trailLines.get(d.drone_id);
        old?.remove?.();
        this._trailLines.delete(d.drone_id);
        continue;
      }
      seen.add(d.drone_id);
      const color = d.is_live ? "#1976d2" : "#78909c";
      const existing = this._trailLines.get(d.drone_id);
      if (existing?.setLatLngs) {
        existing.setLatLngs(pts);
      } else {
        existing?.remove?.();
        const pl = polylineFactory(pts, {
          color,
          weight: 3,
          opacity: 0.75,
          dashArray: d.is_live ? undefined : "6 4",
        }).addTo(map);
        this._trailLines.set(d.drone_id, pl);
      }
    }

    for (const [id, line] of this._trailLines) {
      if (!seen.has(id)) {
        line.remove?.();
        this._trailLines.delete(id);
      }
    }
  }

  private _applyHighlight(): void {
    const map = this._map;
    if (!map) {
      return;
    }
    this._updateDroneMarkers();
    const id = this.highlightedDroneId;
    if (!id) {
      return;
    }
    const drone = this.drones.find((d) => d.drone_id === id);
    if (!drone || drone.latitude == null || drone.longitude == null) {
      return;
    }
    const m = this._droneMarkers.get(id);
    if (!m) {
      return;
    }
    const getZoom = (map as { getZoom?: () => number }).getZoom;
    const z = Math.max(typeof getZoom === "function" ? getZoom.call(map) : 15, 16);
    (map as { setView?: (c: [number, number], zoom: number, o?: object) => unknown }).setView?.(
      [drone.latitude, drone.longitude],
      z,
      { animate: true, duration: 0.35 },
    );
    m.openPopup?.();
  }

  private _resetView(): void {
    const map = this._map as
      | {
          fitBounds?: (b: unknown, o?: object) => unknown;
          setView?: (c: [number, number], z: number) => unknown;
        }
      | undefined;
    if (!map?.fitBounds) {
      return;
    }
    const L = this._L as { latLngBounds?: (pts: unknown[]) => unknown; latLng?: (a: number, b: number) => unknown };
    if (!L.latLngBounds || !L.latLng) {
      return;
    }
    const corners: unknown[] = [];
    if (this.homeZone) {
      corners.push(L.latLng(this.homeZone.latitude, this.homeZone.longitude));
    }
    for (const d of this.drones) {
      if (d.latitude != null && d.longitude != null) {
        corners.push(L.latLng(d.latitude, d.longitude));
      }
      if (d.operator_latitude != null && d.operator_longitude != null) {
        corners.push(L.latLng(d.operator_latitude, d.operator_longitude));
      }
    }
    for (const s of this.scanners) {
      if (s.latitude != null && s.longitude != null) {
        corners.push(L.latLng(s.latitude, s.longitude));
      }
    }
    if (corners.length === 0) {
      const c = this.homeZone
        ? ([this.homeZone.latitude, this.homeZone.longitude] as [number, number])
        : DectyrLiveMap.FALLBACK;
      map.setView?.(c, 15);
      return;
    }
    if (corners.length === 1) {
      const ll = corners[0] as { lat: number; lng: number };
      map.setView?.([ll.lat, ll.lng], 15);
      return;
    }
    const bounds = L.latLngBounds(corners);
    map.fitBounds(bounds, { padding: [28, 28], maxZoom: 17 });
  }

  private _toggleTrails(): void {
    this.showTrails = !this.showTrails;
  }

  protected render(): TemplateResult {
    return html`
      <div class="dectyr-live-map-host">
        <div class="map-container" part="map-container" ${ref(this._mapContainerRef)}></div>
        <div class="map-controls">
          <button
            type="button"
            class="map-btn"
            title="Fit home and fleet"
            @click=${() => this._resetView()}
          >
            <ha-icon icon="mdi:crosshairs-gps"></ha-icon>
          </button>
          <button type="button" class="map-btn" title="Toggle trails" @click=${() => this._toggleTrails()}>
            <ha-icon
              icon=${this.showTrails ? "mdi:vector-polyline" : "mdi:vector-polyline-remove"}
            ></ha-icon>
          </button>
        </div>
        ${this._mapLoading ? html`<div class="map-loading">Loading map…</div>` : ""}
      </div>
    `;
  }

  static get styles(): CSSResult {
    return css`
      :host {
        display: block;
        position: relative;
        width: 100%;
        height: 400px;
      }
      .dectyr-live-map-host {
        position: relative;
        width: 100%;
        height: 100%;
      }
      .map-container {
        width: 100%;
        height: 100%;
        border-radius: var(--dectyr-radius, 8px);
        overflow: hidden;
        z-index: 0;
      }
      .map-controls {
        position: absolute;
        top: 10px;
        right: 10px;
        z-index: 1000;
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      .map-btn {
        background: var(--card-background-color, #fff);
        border: 1px solid var(--divider-color, #ccc);
        border-radius: 4px;
        padding: 6px;
        cursor: pointer;
        color: var(--primary-text-color, #111);
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .map-btn:hover {
        background: var(--secondary-background-color, #f0f0f0);
      }
      .map-loading {
        position: absolute;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--secondary-background-color, rgba(0, 0, 0, 0.04));
        color: var(--secondary-text-color);
        font-size: 0.9em;
        pointer-events: none;
        border-radius: var(--dectyr-radius, 8px);
      }
      :host .dectyr-drone-highlight .dectyr-map-icon {
        filter: drop-shadow(0 0 6px rgba(255, 193, 7, 0.95));
        transform: scale(1.12);
      }
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "dectyr-live-map": DectyrLiveMap;
  }
}
