"""Serve the dectyr_rx5 Lovelace card static bundle."""

from __future__ import annotations

import logging
from pathlib import Path

from aiohttp import web
from homeassistant.components.frontend import DATA_EXTRA_MODULE_URL, add_extra_js_url
from homeassistant.components.http import StaticPathConfig
from homeassistant.core import HomeAssistant
from homeassistant.helpers.http import KEY_ALLOW_CONFIGURED_CORS
from homeassistant.setup import async_setup_component

from .const import DOMAIN

_LOGGER = logging.getLogger(__name__)

_FRONTEND_FLAG = f"{DOMAIN}_lovelace_frontend_registered"

URL_BASE = "/dectyr_rx5_static"
CARD_FILENAME = "dectyr-surveillance-card.js"


async def _serve_bundle_no_store(request: web.Request) -> web.StreamResponse:
    """Serve the dist bundle with Cache-Control: no-store for WebView clients.

    Android WebView can fail ETag revalidation (ERR_CACHE_MISS), breaking custom
    Lovelace cards after app restarts. Skipping cache for this small bundle avoids it.
    """
    bundle_path = Path(__file__).parent / "frontend" / "dist" / CARD_FILENAME

    if not bundle_path.is_file():
        raise web.HTTPNotFound() from None

    return web.FileResponse(
        path=str(bundle_path),
        headers={
            "Cache-Control": "no-store, no-cache, must-revalidate",
            "Pragma": "no-cache",
            "Expires": "0",
            "Content-Type": "text/javascript; charset=utf-8",
        },
    )


async def async_register_frontend(hass: HomeAssistant) -> None:
    """Register static path and preload the Lovelace card module (once per HA process)."""
    if hass.data.get(_FRONTEND_FLAG):
        return

    integration_path = Path(__file__).parent
    frontend_dist = integration_path / "frontend" / "dist"
    card_path = frontend_dist / CARD_FILENAME

    if not card_path.is_file():
        _LOGGER.warning(
            "Lovelace card bundle not found at %s. "
            "Run `npm run build` in custom_components/dectyr_rx5/frontend to generate it.",
            card_path,
        )
        return

    if "http" not in hass.config.components:
        await async_setup_component(hass, "http", {})

    allow_cors = hass.http.app[KEY_ALLOW_CONFIGURED_CORS]
    bundle_route = f"{URL_BASE}/{CARD_FILENAME}"
    allow_cors(hass.http.app.router.add_get(bundle_route, _serve_bundle_no_store))

    dist_assets: list[StaticPathConfig] = []
    for name in ("dectyr-logo.svg", "dectyr-logo.png"):
        asset_path = frontend_dist / name
        if asset_path.is_file():
            dist_assets.append(
                StaticPathConfig(
                    f"{URL_BASE}/{name}",
                    str(asset_path),
                    cache_headers=True,
                )
            )

    await hass.http.async_register_static_paths(
        [
            *dist_assets,
            StaticPathConfig(
                f"{URL_BASE}/brand",
                str(integration_path / "brand"),
                cache_headers=True,
            ),
        ],
    )

    if DATA_EXTRA_MODULE_URL in hass.data:
        add_extra_js_url(hass, bundle_route)
    else:
        _LOGGER.debug(
            "Frontend module loader not ready; card is served at %s but not auto-injected. "
            "Add it under Settings → Dashboards → Resources if needed.",
            bundle_route,
        )
    hass.data[_FRONTEND_FLAG] = True
    _LOGGER.info("Registered Dectyr Surveillance Lovelace card (%s)", CARD_FILENAME)
