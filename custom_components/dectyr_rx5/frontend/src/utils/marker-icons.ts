import airplaneSvgRaw from "virtual:airplane-svg";

import type { DectyrDrone } from "../types";
import type { LeafletLib } from "./leaflet-loader";

/** Prepared once: strip XML decl, display size for Leaflet divIcon (viewBox preserved). */
let preparedDroneAirplaneSvg: string | null = null;

function getPreparedDroneAirplaneSvg(): string {
  if (preparedDroneAirplaneSvg != null) {
    return preparedDroneAirplaneSvg;
  }
  let s = airplaneSvgRaw.replace(/^\s*<\?xml[^>]*>\s*/i, "");
  s = s.replace(/\swidth="[^"]*"/, ' width="38"');
  s = s.replace(/\sheight="[^"]*"/, ' height="38"');
  if (!/\saria-hidden=/.test(s)) {
    s = s.replace(/<svg\b/, '<svg aria-hidden="true"');
  }
  preparedDroneAirplaneSvg = s;
  return s;
}

/** Avion vue dessus depuis `assets/airplane.svg` ; rotation = cap (nez vers le haut de l’écran à 0°). */
function droneAirplaneHtml(directionDeg: number | null): string {
  const rot =
    directionDeg != null && Number.isFinite(directionDeg) ? directionDeg : 0;
  const svg = getPreparedDroneAirplaneSvg();
  return `<div style="width:44px;height:44px;display:flex;align-items:center;justify-content:center;transform:rotate(${rot}deg);transform-origin:center center;">${svg}</div>`;
}

/** Radar dish-style marker for RX-5 scanners (map-card). */
export function scannerRadarIconHtml(online: boolean): string {
  const disk = online ? "#4caf50" : "#9e9e9e";
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32" aria-hidden="true">
    <circle cx="16" cy="16" r="14" fill="${disk}" opacity="0.95" stroke="white" stroke-width="2"/>
    <path d="M 16 16 L 16 5 A 11 11 0 0 1 26 12 Z" fill="white" opacity="0.38"/>
    <circle cx="16" cy="16" r="10" fill="none" stroke="white" stroke-width="1" opacity="0.65"/>
    <circle cx="16" cy="16" r="6" fill="none" stroke="white" stroke-width="0.85" opacity="0.55"/>
    <line x1="16" y1="3" x2="16" y2="29" stroke="white" stroke-width="0.55" opacity="0.35"/>
    <line x1="3" y1="16" x2="29" y2="16" stroke="white" stroke-width="0.55" opacity="0.35"/>
    <circle cx="16" cy="16" r="1.8" fill="white"/>
  </svg>`;
}

function operatorSvg(color: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
    <circle cx="12" cy="12" r="10" fill="${color}" opacity="0.95"/>
    <circle cx="12" cy="9" r="3" fill="white"/>
    <path d="M5 21 a7 7 0 0 1 14 0 z" fill="white"/>
  </svg>`;
}

export function droneIcon(L: LeafletLib, drone: DectyrDrone, highlighted: boolean): unknown {
  const divIcon = L.divIcon as (o: Record<string, unknown>) => unknown;
  const cls = [
    "dectyr-map-icon",
    "dectyr-drone-marker",
    drone.is_live ? "dectyr-drone-live" : "dectyr-drone-offline",
    highlighted ? "dectyr-drone-highlight" : "",
  ]
    .filter(Boolean)
    .join(" ");
  return divIcon({
    html: droneAirplaneHtml(drone.direction),
    className: cls,
    iconSize: [44, 44],
    iconAnchor: [22, 22],
  });
}

export function scannerIcon(L: LeafletLib, online: boolean): unknown {
  const divIcon = L.divIcon as (o: Record<string, unknown>) => unknown;
  return divIcon({
    html: scannerRadarIconHtml(online),
    className: "dectyr-map-icon dectyr-scanner-marker",
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
}

export function operatorIcon(L: LeafletLib): unknown {
  const divIcon = L.divIcon as (o: Record<string, unknown>) => unknown;
  return divIcon({
    html: operatorSvg("#2196f3"),
    className: "dectyr-map-icon dectyr-operator-marker",
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
}
