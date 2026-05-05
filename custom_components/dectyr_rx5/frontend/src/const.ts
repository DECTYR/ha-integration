/** Must match `custom_components.dectyr_rx5.const.DOMAIN`. */
export const DOMAIN = "dectyr_rx5";

/** Same base as `frontend.py` `URL_BASE` — Lovelace static mount for the card bundle + brand assets. */
export const DECTYR_STATIC_BASE = "/dectyr_rx5_static";

/** Served from `custom_components/dectyr_rx5/brand/` via `frontend.py`. */
export const DECTYR_BRAND_ICON = `${DECTYR_STATIC_BASE}/brand/icon.png`;

/** Official mark when `logo.png` / `icon.png` is copied to dist at build time (see Rollup plugin). */
export const DECTYR_LOGO_PNG = `${DECTYR_STATIC_BASE}/dectyr-logo.png`;

/** Vector fallback shipped under `frontend/branding/` (always copied to dist). */
export const DECTYR_LOGO_SVG = `${DECTYR_STATIC_BASE}/dectyr-logo.svg`;
