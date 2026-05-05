/** Altitude in metres for display (whole metres). */
export function formatAltitude(meters: number | null): string {
  if (meters === null || Number.isNaN(meters)) {
    return "—";
  }
  return `${meters.toFixed(0)}m`;
}

/** Horizontal speed in m/s. */
export function formatSpeed(mps: number | null): string {
  if (mps === null || Number.isNaN(mps)) {
    return "—";
  }
  return `${mps.toFixed(1)} m/s`;
}

/** Heading in degrees. */
export function formatHeading(degrees: number | null): string {
  if (degrees === null || Number.isNaN(degrees)) {
    return "—";
  }
  return `${degrees.toFixed(0)}°`;
}

/** Slant range / distance in metres or km. */
export function formatDistance(meters: number | null): string {
  if (meters === null || Number.isNaN(meters)) {
    return "—";
  }
  if (meters < 1000) {
    return `${meters.toFixed(0)}m`;
  }
  return `${(meters / 1000).toFixed(1)}km`;
}

/** RSSI in dBm (integer display). */
export function formatRssiDbm(rssi: number | null): string {
  if (rssi === null || Number.isNaN(rssi)) {
    return "—";
  }
  return `${Math.round(rssi)}`;
}

/** Relative time in the past (English, for UI copy). */
export function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diffSec < 60) {
    return "just now";
  }
  if (diffSec < 3600) {
    const min = Math.floor(diffSec / 60);
    return `${min} minute${min !== 1 ? "s" : ""} ago`;
  }
  if (diffSec < 86400) {
    const hour = Math.floor(diffSec / 3600);
    return `${hour} hour${hour !== 1 ? "s" : ""} ago`;
  }
  const day = Math.floor(diffSec / 86400);
  return `${day} day${day !== 1 ? "s" : ""} ago`;
}

/** Relative time since last_seen for offline line. */
export function formatOfflineAgo(lastSeen: Date | null): string {
  if (!lastSeen || Number.isNaN(lastSeen.getTime())) {
    return "offline";
  }
  const sec = Math.max(0, Math.floor((Date.now() - lastSeen.getTime()) / 1000));
  if (sec < 60) {
    return `offline · ${sec}s ago`;
  }
  const min = Math.floor(sec / 60);
  if (min < 60) {
    return `offline · ${min}min ago`;
  }
  const h = Math.floor(min / 60);
  return `offline · ${h}h ago`;
}

/** Title-case words from a slug (enum state). */
export function humanizeSlug(slug: string | null): string | null {
  if (!slug) {
    return null;
  }
  return slug
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}
