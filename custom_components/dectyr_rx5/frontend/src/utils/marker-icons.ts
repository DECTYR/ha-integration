import type { DectyrDrone } from "../types";
import type { LeafletLib } from "./leaflet-loader";

/** RSSI → marker fill (aligned with card RSSI badge tiers). */
export function rssiMarkerColor(rssi: number | null): string {
  if (rssi === null || Number.isNaN(rssi)) {
    return "#9e9e9e";
  }
  if (rssi >= -60) {
    return "#4caf50";
  }
  if (rssi >= -80) {
    return "#ff9800";
  }
  return "#f44336";
}

function droneSvg(color: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32">
    <circle cx="12" cy="12" r="10" fill="${color}" opacity="0.95"/>
    <path d="M12 6 L8 10 L8 14 L12 18 L16 14 L16 10 Z" fill="white"/>
  </svg>`;
}

function scannerSvg(online: boolean): string {
  const color = online ? "#4caf50" : "#9e9e9e";
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="28" height="28">
    <circle cx="12" cy="12" r="10" fill="${color}" opacity="0.95"/>
    <path d="M12 4 L12 8 M8 8 A 6 6 0 0 1 16 8" stroke="white" stroke-width="2" fill="none"/>
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
  const color = rssiMarkerColor(drone.rssi);
  const cls = [
    "dectyr-map-icon",
    "dectyr-drone-marker",
    drone.is_live ? "dectyr-drone-live" : "dectyr-drone-offline",
    highlighted ? "dectyr-drone-highlight" : "",
  ]
    .filter(Boolean)
    .join(" ");
  return divIcon({
    html: droneSvg(color),
    className: cls,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
}

export function scannerIcon(L: LeafletLib, online: boolean): unknown {
  const divIcon = L.divIcon as (o: Record<string, unknown>) => unknown;
  return divIcon({
    html: scannerSvg(online),
    className: "dectyr-map-icon dectyr-scanner-marker",
    iconSize: [28, 28],
    iconAnchor: [14, 14],
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
