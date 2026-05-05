/** Rich scanner row for the surveillance card (F2+). */
export interface DectyrScanner {
  scanner_id: string;
  device_id: string;
  name: string;
  status_entity?: string;
  is_online: boolean;
  cpu_temp?: number;
  battery?: number;
  gnss_fix?: string;
  alerts?: string[];
  /** GNSS position when `scanner_position` tracker has coordinates. */
  latitude?: number | null;
  longitude?: number | null;
}

/** Aggregated drone view built from HA device + entity states. */
export interface DectyrDrone {
  drone_id: string;
  device_id: string;
  /** Device registry title (matches HA device page). */
  display_name: string;
  manufacturer: string | null;
  model: string | null;
  is_live: boolean;
  latitude: number | null;
  longitude: number | null;
  altitude_msl: number | null;
  altitude_agl: number | null;
  speed_horizontal: number | null;
  speed_vertical: number | null;
  direction: number | null;
  rssi: number | null;
  operator_id: string | null;
  operator_country: string | null;
  operator_latitude: number | null;
  operator_longitude: number | null;
  category_eu: string | null;
  class_eu: string | null;
  signal_type: string | null;
  broadcast_protocol: string | null;
  multi_source: boolean;
  distance_to_scanner: number | null;
  last_seen: Date | null;
}
