export interface TrailPoint {
  lat: number;
  lng: number;
  timestamp: Date;
}

const DEFAULT_MAX_POINTS = 30;

/** In-memory trail cache (cleared on full page reload). */
export class TrailStore {
  private readonly _trails = new Map<string, TrailPoint[]>();
  private _maxAgeMs = 30 * 60 * 1000;
  private _maxPoints = DEFAULT_MAX_POINTS;

  setMaxAgeMinutes(minutes: number): void {
    this._maxAgeMs = Math.max(1, minutes) * 60 * 1000;
  }

  setMaxPoints(n: number): void {
    this._maxPoints = Math.max(2, Math.min(200, n));
  }

  add(droneId: string, lat: number, lng: number, timestamp: Date = new Date()): void {
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      return;
    }
    let trail = this._trails.get(droneId);
    if (!trail) {
      trail = [];
      this._trails.set(droneId, trail);
    }
    const last = trail[trail.length - 1];
    if (last && last.lat === lat && last.lng === lng) {
      return;
    }
    trail.push({ lat, lng, timestamp });

    const cutoff = Date.now() - this._maxAgeMs;
    while (trail.length > 0 && trail[0].timestamp.getTime() < cutoff) {
      trail.shift();
    }
    while (trail.length > this._maxPoints) {
      trail.shift();
    }
  }

  get(droneId: string): TrailPoint[] {
    return this._trails.get(droneId) ?? [];
  }

  getLatLngs(droneId: string): [number, number][] {
    return this.get(droneId).map((p) => [p.lat, p.lng]);
  }
}
