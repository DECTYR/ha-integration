import { LitElement, html, css, type CSSResult, type TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import type { PropertyValues } from "lit";
import { ref, createRef, type Ref } from "lit/directives/ref.js";
import { styleMap } from "lit/directives/style-map.js";
import type { HomeAssistant, LovelaceCardConfig } from "custom-card-helpers";

import type { DectyrDrone } from "./types";
import { loadLeaflet, type LeafletLib } from "./utils/leaflet-loader";
import { findDectyrDrones, findDectyrScanners } from "./utils/ha-helpers";
import { droneIcon, scannerRadarIconHtml } from "./utils/marker-icons";

interface DectyrMapCardConfig extends LovelaceCardConfig {
  type: string;
  title?: string;
  /** e.g. `"16:9"`, `"1:1"`, `"2:1"`, or decimal width/height ratio */
  aspect_ratio?: string | number;
  /** Fixed height in pixels (overrides aspect_ratio) */
  height?: number;
}

/** Narrow handle for map instance methods we call (Leaflet is loaded from CDN). */
interface LeafletMapHandle {
  remove: () => void;
  invalidateSize: (options?: { pan?: boolean }) => void;
  setView: (latlng: [number, number], zoom?: number) => void;
}

type HomeCircleLayer = { remove: () => void };

const TRAIL_LINE_COLOR = "#1565c0";

function operatorIconHtml(): string {
  const orange = "#ff9800";
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="28" height="28">
    <circle cx="16" cy="16" r="13" fill="${orange}" opacity="0.95" stroke="white" stroke-width="2"/>
    <circle cx="16" cy="11" r="3.5" fill="white"/>
    <path d="M 10 24 L 10 17 Q 10 14 13 14 L 19 14 Q 22 14 22 17 L 22 24"
          fill="white"/>
    <rect x="13" y="18" width="6" height="2" fill="${orange}" rx="0.5"/>
  </svg>`;
}

interface ScannerMarker {
  remove: () => void;
  getLatLng: () => { lat: number; lng: number };
  setLatLng: (ll: [number, number]) => void;
  setIcon: (icon: unknown) => void;
  bindPopup: (html: string) => unknown;
}

type ScannerMarkerLeaflet = ScannerMarker & {
  addTo: (m: LeafletMapHandle) => ScannerMarkerLeaflet;
};

type TrailPolyline = {
  remove: () => void;
  setLatLngs: (latlngs: [number, number][]) => void;
  setStyle: (style: { color?: string; weight?: number; opacity?: number }) => void;
  addTo: (m: LeafletMapHandle) => TrailPolyline;
};

const LEAFLET_CSS_URL = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";

let _leafletStyleSheet: CSSStyleSheet | null = null;
let _leafletCssPromise: Promise<CSSStyleSheet> | null = null;

async function loadLeafletStyleSheet(): Promise<CSSStyleSheet> {
  if (_leafletStyleSheet) {
    return _leafletStyleSheet;
  }
  if (_leafletCssPromise) {
    return _leafletCssPromise;
  }

  _leafletCssPromise = (async () => {
    const response = await fetch(LEAFLET_CSS_URL);
    if (!response.ok) {
      throw new Error(`Leaflet CSS fetch failed: ${response.status}`);
    }
    const cssText = await response.text();
    const sheet = new CSSStyleSheet();
    sheet.replaceSync(cssText);
    _leafletStyleSheet = sheet;
    return sheet;
  })();

  return _leafletCssPromise;
}

@customElement("dectyr-map-card")
export class DectyrMapCard extends LitElement {
  @property({ attribute: false }) public hass?: HomeAssistant;

  @state() private config?: DectyrMapCardConfig;

  private readonly _mapContainerRef: Ref<HTMLDivElement> = createRef();

  private _map: LeafletMapHandle | null = null;

  private _homeCircle: HomeCircleLayer | null = null;

  private _L: LeafletLib | null = null;

  private readonly _scannerMarkers = new Map<string, ScannerMarkerLeaflet>();

  private readonly _droneMarkers = new Map<string, ScannerMarkerLeaflet>();

  private readonly _operatorMarkers = new Map<string, ScannerMarkerLeaflet>();

  private readonly _trailPoints = new Map<string, Array<{ lat: number; lng: number; ts: number }>>();

  private readonly _trailLines = new Map<string, TrailPolyline>();

  private static readonly TRAIL_MAX_POINTS = 30;

  private static readonly TRAIL_MAX_AGE_MS = 30 * 60 * 1000;

  private _scannerMarkerStylesInstalled = false;

  private _initLock = false;

  /** Set true while an init attempt is in flight; stays true after successful map until `_destroyMap`. */
  private _initStarted = false;

  /** True after `disconnectedCallback`; blocks async completion from touching DOM / Leaflet. */
  private _disconnected = false;

  private _invalidateSizeTimer?: ReturnType<typeof window.setTimeout>;

  /** Avoid repeated setView/invalidateSize when `hass` reference churns with same lat/lon. */
  private _lastAppliedCenterKey = "";

  private _centerKey(lat: number, lon: number): string {
    return `${lat.toFixed(5)},${lon.toFixed(5)}`;
  }

  public setConfig(config: DectyrMapCardConfig): void {
    if (!config) {
      throw new Error("Invalid configuration");
    }
    this.config = config;
  }

  public getCardSize(): number {
    const c = this.config;
    if (c && typeof c.height === "number" && c.height > 0 && isFinite(c.height)) {
      return Math.max(2, Math.round(c.height / 50));
    }
    if (c?.aspect_ratio != null) {
      const ratio = this._parseAspectRatio(c.aspect_ratio);
      if (ratio != null) {
        if (ratio >= 2.5) {
          return 4;
        }
        if (ratio >= 1.5) {
          return 6;
        }
        return 8;
      }
    }
    return 6;
  }

  private _parseAspectRatio(input: string | number): number | null {
    if (typeof input === "number" && isFinite(input) && input > 0) {
      return input;
    }
    if (typeof input !== "string") {
      return null;
    }
    const trimmed = input.trim();
    const match = trimmed.match(/^(\d+(?:\.\d+)?)\s*:\s*(\d+(?:\.\d+)?)$/);
    if (match) {
      const w = parseFloat(match[1]);
      const h = parseFloat(match[2]);
      if (h > 0 && isFinite(w)) {
        return w / h;
      }
    }
    const num = parseFloat(trimmed);
    if (isFinite(num) && num > 0) {
      return num;
    }
    return null;
  }

  private _mapShellStyles(): Record<string, string> {
    const c = this.config;
    if (!c) {
      return { height: "400px", minHeight: "200px" };
    }
    if (typeof c.height === "number" && c.height > 0 && isFinite(c.height)) {
      return { height: `${c.height}px`, minHeight: "200px" };
    }
    const ratio = c.aspect_ratio != null ? this._parseAspectRatio(c.aspect_ratio) : null;
    if (ratio != null) {
      return { aspectRatio: `${ratio}`, height: "auto", minHeight: "200px" };
    }
    return { height: "400px", minHeight: "200px" };
  }

  /** Shadow DOM default — no createRenderRoot override. */

  connectedCallback(): void {
    super.connectedCallback();
    this._disconnected = false;
  }

  protected async firstUpdated(changed: PropertyValues<this>): Promise<void> {
    super.firstUpdated(changed);

    if (this._disconnected) {
      console.info("[dectyr-map-card] firstUpdated skipped (already disconnected)");
      return;
    }

    const root = this.shadowRoot;
    if (root) {
      try {
        const leafletSheet = await loadLeafletStyleSheet();
        if (this._disconnected) {
          return;
        }
        if (!root.adoptedStyleSheets.includes(leafletSheet)) {
          root.adoptedStyleSheets = [...root.adoptedStyleSheets, leafletSheet];
        }
      } catch (e) {
        console.error("[dectyr-map-card] Failed to load Leaflet CSS:", e);
      }
    }

    if (!this._disconnected) {
      await this._initMap();
    }
  }

  protected updated(changed: PropertyValues<this>): void {
    super.updated(changed);
    if (this._disconnected) {
      return;
    }

    const cfgChanged = (changed as PropertyValues<{ config?: DectyrMapCardConfig }>).has(
      "config",
    );
    if (cfgChanged && this._map) {
      window.setTimeout(() => {
        if (!this._disconnected && this._map) {
          this._map.invalidateSize({ pan: false });
        }
      }, 100);
    }

    if (this._mapContainerRef.value && !this._map && !this._initLock && !this._initStarted) {
      void this._initMap();
    }

    if (changed.has("hass") && this._map && this.hass) {
      this._updateTrails();
      this._updateScannerMarkers();
      this._updateDroneMarkers();
      this._updateOperatorMarkers();
    }

    if (!this._map || !changed.has("hass") || !this.hass?.config) {
      return;
    }
    const lat = this.hass.config.latitude;
    const lon = this.hass.config.longitude;
    if (typeof lat !== "number" || typeof lon !== "number") {
      return;
    }
    const key = this._centerKey(lat, lon);
    if (key === this._lastAppliedCenterKey) {
      return;
    }
    this._lastAppliedCenterKey = key;
    this._map.setView([lat, lon], 15);
    requestAnimationFrame(() => {
      if (this._disconnected || !this._map) {
        return;
      }
      this._map.invalidateSize({ pan: false });
    });
  }

  disconnectedCallback(): void {
    console.info("[dectyr-map-card] disconnectedCallback — cleanup");
    this._disconnected = true;
    this._destroyMap();
    super.disconnectedCallback();
  }

  private async _initMap(): Promise<void> {
    if (this._initLock || this._initStarted) {
      console.info("[dectyr-map-card] Init already in progress or completed");
      return;
    }
    if (this._disconnected) {
      console.info("[dectyr-map-card] Skipping init (disconnected)");
      return;
    }
    if (!this.isConnected) {
      console.info("[dectyr-map-card] Skipping init (not connected)");
      return;
    }

    this._initLock = true;
    this._initStarted = true;

    try {
      const L = await loadLeaflet();

      if (this._disconnected || !this.isConnected) {
        console.info("[dectyr-map-card] Aborted init after Leaflet load (detached)");
        return;
      }

      const container = this._mapContainerRef.value;

      if (!container) {
        console.warn("[dectyr-map-card] Container ref not available");
        return;
      }

      console.info("[dectyr-map-card] Container dimensions:", {
        width: container.offsetWidth,
        height: container.offsetHeight,
      });

      let center: [number, number] = [48.8566, 2.3522];
      const lat = this.hass?.config?.latitude;
      const lon = this.hass?.config?.longitude;
      if (typeof lat === "number" && typeof lon === "number") {
        center = [lat, lon];
      }

      console.info("[dectyr-map-card] Initializing map at", center);

      const mapFactory = L.map as (
        el: HTMLElement,
        opts?: Record<string, unknown>,
      ) => LeafletMapHandle;
      const tileLayerFactory = L.tileLayer as (
        url: string,
        opts?: Record<string, unknown>,
      ) => { addTo: (m: LeafletMapHandle) => unknown };

      this._map = mapFactory(container, {
        center,
        zoom: 15,
        zoomControl: true,
      });
      this._L = L;

      tileLayerFactory("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap",
        maxZoom: 19,
      }).addTo(this._map);

      const cfgLat = this.hass?.config?.latitude;
      const cfgLon = this.hass?.config?.longitude;
      if (typeof cfgLat === "number" && typeof cfgLon === "number") {
        const homeLatLng: [number, number] = [cfgLat, cfgLon];
        const circleFactory = L.circle as (
          ll: [number, number],
          opts?: Record<string, unknown>,
        ) => {
          addTo: (m: LeafletMapHandle) => {
            bindPopup: (html: string) => HomeCircleLayer;
          };
        };
        this._homeCircle = circleFactory(homeLatLng, {
          radius: 100,
          color: "var(--primary-color, #03a9f4)",
          fillColor: "var(--primary-color, #03a9f4)",
          fillOpacity: 0.1,
          weight: 2,
          opacity: 0.6,
        })
          .addTo(this._map)
          .bindPopup("Home");
        console.info("[dectyr-map-card] Home circle added");
      }

      this._lastAppliedCenterKey = this._centerKey(center[0], center[1]);

      this._invalidateSizeTimer = window.setTimeout(() => {
        this._invalidateSizeTimer = undefined;
        if (!this._disconnected && this._map) {
          this._map.invalidateSize({ pan: false });
        }
      }, 100);

      console.info("[dectyr-map-card] Map initialized successfully");

      this._ensureDivIconMarkerStyles();
      this._updateTrails();
      this._updateScannerMarkers();
      this._updateDroneMarkers();
      this._updateOperatorMarkers();
    } catch (e) {
      console.error("[dectyr-map-card] Init failed:", e);
    } finally {
      this._initLock = false;
      if (!this._map) {
        this._initStarted = false;
      }
    }
  }

  private _ensureDivIconMarkerStyles(): void {
    const root = this.shadowRoot;
    if (!root || this._scannerMarkerStylesInstalled) {
      return;
    }
    const id = "dectyr-map-card-divicon-styles";
    if (root.querySelector(`#${id}`)) {
      this._scannerMarkerStylesInstalled = true;
      return;
    }
    const el = document.createElement("style");
    el.id = id;
    el.textContent = `
      .leaflet-div-icon.dectyr-scanner-marker,
      .leaflet-div-icon.dectyr-drone-marker,
      .leaflet-div-icon.dectyr-operator-marker {
        border: none !important;
        background: transparent !important;
      }
    `;
    root.appendChild(el);
    this._scannerMarkerStylesInstalled = true;
  }

  private _makeScannerDivIcon(online: boolean): unknown {
    const L = this._L;
    if (!L) {
      return undefined;
    }
    const divIconFactory = L.divIcon as (opts: Record<string, unknown>) => unknown;
    return divIconFactory({
      html: scannerRadarIconHtml(online),
      className: `dectyr-scanner-marker ${online ? "online" : "offline"}`,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
      popupAnchor: [0, -16],
    });
  }

  private _makeOperatorDivIcon(): unknown {
    const L = this._L;
    if (!L) {
      return undefined;
    }
    const divIconFactory = L.divIcon as (opts: Record<string, unknown>) => unknown;
    return divIconFactory({
      html: operatorIconHtml(),
      className: "dectyr-operator-marker",
      iconSize: [28, 28],
      iconAnchor: [14, 14],
      popupAnchor: [0, -14],
    });
  }

  private _popupEscape(s: string): string {
    return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
  }

  private _updateScannerMarkers(): void {
    const map = this._map;
    const L = this._L;
    if (!map || !L || !this.hass || this._disconnected) {
      return;
    }

    const scanners = findDectyrScanners(this.hass).filter((s) => {
      const { latitude: la, longitude: lo } = s;
      return typeof la === "number" && Number.isFinite(la) && typeof lo === "number" && Number.isFinite(lo);
    });

    const seen = new Set<string>();

    const markerFactory = L.marker as (
      ll: [number, number],
      opts?: Record<string, unknown>,
    ) => ScannerMarkerLeaflet;

    for (const scanner of scanners) {
      const lat = scanner.latitude as number;
      const lon = scanner.longitude as number;
      seen.add(scanner.device_id);
      const existing = this._scannerMarkers.get(scanner.device_id);
      const ll: [number, number] = [lat, lon];

      if (existing) {
        const cur = existing.getLatLng();
        if (cur.lat !== lat || cur.lng !== lon) {
          existing.setLatLng(ll);
        }
        const icon = this._makeScannerDivIcon(scanner.is_online);
        if (icon !== undefined) {
          existing.setIcon(icon);
        }
        const shortId =
          scanner.scanner_id.length > 8 ? scanner.scanner_id.slice(-8) : scanner.scanner_id;
        const status = scanner.is_online ? "Online" : "Offline";
        const escName = this._popupEscape(scanner.name);
        existing.bindPopup(`<strong>${escName}</strong><br>
        ID: <code>${this._popupEscape(shortId)}</code><br>
        Status: <span style="color:${scanner.is_online ? "#4caf50" : "#9e9e9e"}">${status}</span>`);
      } else {
        const icon = this._makeScannerDivIcon(scanner.is_online);
        if (icon === undefined) {
          continue;
        }
        const marker = markerFactory(ll, { icon }).addTo(map);
        const shortId =
          scanner.scanner_id.length > 8 ? scanner.scanner_id.slice(-8) : scanner.scanner_id;
        const status = scanner.is_online ? "Online" : "Offline";
        const escName = this._popupEscape(scanner.name);
        marker.bindPopup(`<strong>${escName}</strong><br>
        ID: <code>${this._popupEscape(shortId)}</code><br>
        Status: <span style="color:${scanner.is_online ? "#4caf50" : "#9e9e9e"}">${status}</span>`);
        this._scannerMarkers.set(scanner.device_id, marker);
        console.info(`[dectyr-map-card] Scanner marker added: ${scanner.name}`);
      }
    }

    for (const [deviceId, marker] of this._scannerMarkers.entries()) {
      if (!seen.has(deviceId)) {
        try {
          marker.remove();
        } catch {
          /* ignore */
        }
        this._scannerMarkers.delete(deviceId);
        console.info(`[dectyr-map-card] Scanner marker removed: ${deviceId}`);
      }
    }
  }

  private _liveDronesWithPosition(): DectyrDrone[] {
    if (!this.hass) {
      return [];
    }
    return findDectyrDrones(this.hass).filter(
      (d) =>
        d.is_live &&
        d.latitude != null &&
        d.longitude != null &&
        Number.isFinite(d.latitude) &&
        Number.isFinite(d.longitude),
    );
  }

  private _fmtNum(n: number | null | undefined, suffix = "", digits = 1): string {
    if (n == null || !Number.isFinite(n)) {
      return "—";
    }
    return `${n.toFixed(digits)}${suffix}`;
  }

  private _fmtLastSeen(d: DectyrDrone): string {
    if (!d.last_seen) {
      return "—";
    }
    try {
      return d.last_seen.toLocaleString();
    } catch {
      return "—";
    }
  }

  private _buildDronePopupHtml(d: DectyrDrone): string {
    const e = this._popupEscape;
    return [
      `<strong>${e(d.display_name)}</strong>`,
      `<code>${e(d.drone_id)}</code>`,
      `Alt MSL / AGL: ${this._fmtNum(d.altitude_msl, " m")} / ${this._fmtNum(d.altitude_agl, " m")}`,
      `Speed H/V: ${this._fmtNum(d.speed_horizontal, " m/s")} / ${this._fmtNum(d.speed_vertical, " m/s")}`,
      `Heading: ${this._fmtNum(d.direction, "°", 0)}`,
      `EU cat. / class: ${e(d.category_eu ?? "—")} / ${e(d.class_eu ?? "—")}`,
      `Dist. to scanner: ${this._fmtNum(d.distance_to_scanner, " m")}`,
      `Signal: ${e(d.signal_type ?? "—")} · Multi-src: ${d.multi_source ? "yes" : "no"}`,
      `Operator ID: ${e(d.operator_id ?? "—")}`,
      `Last seen: ${e(this._fmtLastSeen(d))}`,
    ].join("<br>");
  }

  private _updateDroneMarkers(): void {
    const map = this._map;
    const L = this._L;
    if (!map || !L || !this.hass || this._disconnected) {
      return;
    }

    const drones = this._liveDronesWithPosition();
    const seen = new Set<string>();
    const markerFactory = L.marker as (
      ll: [number, number],
      opts?: Record<string, unknown>,
    ) => ScannerMarkerLeaflet;

    for (const d of drones) {
      seen.add(d.drone_id);
      const ll: [number, number] = [d.latitude as number, d.longitude as number];
      const popup = this._buildDronePopupHtml(d);
      let m = this._droneMarkers.get(d.drone_id);
      if (!m) {
        m = markerFactory(ll, {
          icon: droneIcon(L, d, false),
        })
          .addTo(map)
          .bindPopup(popup) as ScannerMarkerLeaflet;
        this._droneMarkers.set(d.drone_id, m);
        console.info(`[dectyr-map-card] Drone marker added: ${d.display_name}`);
      } else {
        m.setLatLng(ll);
        m.setIcon(droneIcon(L, d, false));
        m.bindPopup(popup);
      }
    }

    for (const [id, m] of this._droneMarkers.entries()) {
      if (!seen.has(id)) {
        try {
          m.remove();
        } catch {
          /* ignore */
        }
        this._droneMarkers.delete(id);
        console.info(`[dectyr-map-card] Drone marker removed: ${id}`);
      }
    }
  }

  private _buildOperatorPopup(op: { drone_name: string; operator_id: string | null }): string {
    const opIdLine = op.operator_id
      ? `Operator ID: <code>${this._popupEscape(op.operator_id)}</code>`
      : "Operator ID: unknown";
    return `<strong>Pilot</strong><br>
      Controlling: ${this._popupEscape(op.drone_name)}<br>
      ${opIdLine}`;
  }

  private _updateOperatorMarkers(): void {
    const map = this._map;
    const L = this._L;
    if (!map || !L || !this.hass || this._disconnected) {
      return;
    }

    const operators: Array<{
      device_id: string;
      drone_name: string;
      drone_id: string;
      operator_id: string | null;
      latitude: number;
      longitude: number;
    }> = [];

    for (const d of findDectyrDrones(this.hass)) {
      if (!d.is_live) {
        continue;
      }
      const lat = d.operator_latitude;
      const lon = d.operator_longitude;
      if (lat == null || lon == null || !Number.isFinite(lat) || !Number.isFinite(lon)) {
        continue;
      }
      operators.push({
        device_id: d.device_id,
        drone_name: d.display_name,
        drone_id: d.drone_id,
        operator_id: d.operator_id,
        latitude: lat,
        longitude: lon,
      });
    }

    const seen = new Set<string>();
    const markerFactory = L.marker as (
      ll: [number, number],
      opts?: Record<string, unknown>,
    ) => ScannerMarkerLeaflet;

    for (const op of operators) {
      seen.add(op.device_id);
      const ll: [number, number] = [op.latitude, op.longitude];
      const popup = this._buildOperatorPopup(op);
      const existing = this._operatorMarkers.get(op.device_id);
      if (existing) {
        const cur = existing.getLatLng();
        if (cur.lat !== op.latitude || cur.lng !== op.longitude) {
          existing.setLatLng(ll);
        }
        const icon = this._makeOperatorDivIcon();
        if (icon !== undefined) {
          existing.setIcon(icon);
        }
        existing.bindPopup(popup);
      } else {
        const icon = this._makeOperatorDivIcon();
        if (icon === undefined) {
          continue;
        }
        const marker = markerFactory(ll, { icon }).addTo(map).bindPopup(popup) as ScannerMarkerLeaflet;
        this._operatorMarkers.set(op.device_id, marker);
        console.info(`[dectyr-map-card] Operator marker added for: ${op.drone_name}`);
      }
    }

    for (const [deviceId, marker] of this._operatorMarkers.entries()) {
      if (!seen.has(deviceId)) {
        try {
          marker.remove();
        } catch {
          /* ignore */
        }
        this._operatorMarkers.delete(deviceId);
      }
    }
  }

  private _updateTrails(): void {
    const map = this._map;
    const L = this._L;
    if (!map || !L || this._disconnected) {
      return;
    }

    const now = Date.now();
    const drones = this._liveDronesWithPosition();
    const seen = new Set<string>();

    const polylineFactory = L.polyline as (
      latlngs: [number, number][],
      opts?: Record<string, unknown>,
    ) => TrailPolyline;

    for (const drone of drones) {
      seen.add(drone.drone_id);
      let points = this._trailPoints.get(drone.drone_id);
      if (!points) {
        points = [];
        this._trailPoints.set(drone.drone_id, points);
      }

      const lat = drone.latitude as number;
      const lon = drone.longitude as number;
      const last = points[points.length - 1];
      if (!last || last.lat !== lat || last.lng !== lon) {
        points.push({ lat, lng: lon, ts: now });
      }

      const cutoff = now - DectyrMapCard.TRAIL_MAX_AGE_MS;
      while (points.length > 0 && points[0].ts < cutoff) {
        points.shift();
      }
      while (points.length > DectyrMapCard.TRAIL_MAX_POINTS) {
        points.shift();
      }

      const existingLine = this._trailLines.get(drone.drone_id);
      const color = TRAIL_LINE_COLOR;

      if (points.length >= 2) {
        const latlngs: [number, number][] = points.map((p) => [p.lat, p.lng]);
        if (existingLine) {
          existingLine.setLatLngs(latlngs);
          existingLine.setStyle({ color, weight: 3, opacity: 0.6 });
        } else {
          const line = polylineFactory(latlngs, {
            color,
            weight: 3,
            opacity: 0.6,
          }).addTo(map);
          this._trailLines.set(drone.drone_id, line);
        }
      } else if (existingLine) {
        try {
          existingLine.remove();
        } catch {
          /* ignore */
        }
        this._trailLines.delete(drone.drone_id);
      }
    }

    for (const droneId of [...this._trailLines.keys()]) {
      if (!seen.has(droneId)) {
        const line = this._trailLines.get(droneId);
        try {
          line?.remove();
        } catch {
          /* ignore */
        }
        this._trailLines.delete(droneId);
        this._trailPoints.delete(droneId);
      }
    }
  }

  private _destroyMap(): void {
    if (this._invalidateSizeTimer !== undefined) {
      window.clearTimeout(this._invalidateSizeTimer);
      this._invalidateSizeTimer = undefined;
    }
    for (const marker of this._operatorMarkers.values()) {
      try {
        marker.remove();
      } catch {
        /* ignore */
      }
    }
    this._operatorMarkers.clear();
    for (const line of this._trailLines.values()) {
      try {
        line.remove();
      } catch {
        /* ignore */
      }
    }
    this._trailLines.clear();
    this._trailPoints.clear();
    for (const marker of this._droneMarkers.values()) {
      try {
        marker.remove();
      } catch {
        /* ignore */
      }
    }
    this._droneMarkers.clear();
    for (const marker of this._scannerMarkers.values()) {
      try {
        marker.remove();
      } catch {
        /* ignore */
      }
    }
    this._scannerMarkers.clear();
    if (this._homeCircle) {
      try {
        this._homeCircle.remove();
      } catch (e) {
        console.warn("[dectyr-map-card] Home circle cleanup error:", e);
      }
      this._homeCircle = null;
    }
    if (this._map) {
      console.info("[dectyr-map-card] Destroying map");
      try {
        this._map.remove();
      } catch (e) {
        console.warn("[dectyr-map-card] Cleanup error:", e);
      }
      this._map = null;
    }
    this._L = null;
    this._initStarted = false;
    this._initLock = false;
    this._lastAppliedCenterKey = "";
  }

  protected render(): TemplateResult {
    if (!this.config) {
      return html``;
    }

    return html`
      <ha-card>
        <div class="card-header">
          <ha-icon icon="mdi:map"></ha-icon>
          <span>${this.config.title ?? "Live Map"}</span>
        </div>
        <div class="map-shell" style=${styleMap(this._mapShellStyles())}>
          <div class="map-container" ${ref(this._mapContainerRef)}></div>
        </div>
      </ha-card>
    `;
  }

  static get styles(): CSSResult {
    return css`
      :host {
        display: block;
      }
      ha-card {
        overflow: hidden;
      }
      .card-header {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 16px;
        font-weight: 500;
        font-size: 1.1em;
        border-bottom: 1px solid var(--divider-color);
      }
      .card-header ha-icon {
        color: var(--primary-color);
      }
      .map-shell {
        position: relative;
        width: 100%;
      }
      .map-container {
        position: relative;
        width: 100%;
        height: 100%;
        border-radius: 8px;
        overflow: hidden;
        contain: layout size;
      }
    `;
  }
}

window.customCards = window.customCards || [];
window.customCards.push({
  type: "dectyr-map-card",
  name: "Dectyr Map (debug)",
  description: "Minimal map card for debugging Leaflet integration",
  preview: false,
  documentationURL: "https://github.com/alexandre0thomas/ha-dectyr",
});

console.info(
  "%c DECTYR-MAP-CARD %c v0.7.0 (resizable) ",
  "color: white; background: #00569b; font-weight: 700;",
  "color: #00569b; background: white; font-weight: 700;",
);

declare global {
  interface HTMLElementTagNameMap {
    "dectyr-map-card": DectyrMapCard;
  }
}
