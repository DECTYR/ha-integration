"""Serve the dectyr_rx5 Lovelace card static bundle."""

from __future__ import annotations

import logging
from pathlib import Path

from homeassistant.components.frontend import DATA_EXTRA_MODULE_URL, add_extra_js_url
from homeassistant.components.http import StaticPathConfig
from homeassistant.core import HomeAssistant
from homeassistant.setup import async_setup_component

from .const import DOMAIN

_LOGGER = logging.getLogger(__name__)

_FRONTEND_FLAG = f"{DOMAIN}_lovelace_frontend_registered"

URL_BASE = "/dectyr_rx5_static"
CARD_FILENAME = "dectyr-surveillance-card.js"


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

    await hass.http.async_register_static_paths(
        [
            StaticPathConfig(
                URL_BASE,
                str(frontend_dist),
                cache_headers=False,
            ),
            StaticPathConfig(
                f"{URL_BASE}/brand",
                str(integration_path / "brand"),
                cache_headers=True,
            ),
        ],
    )

    if DATA_EXTRA_MODULE_URL in hass.data:
        add_extra_js_url(hass, f"{URL_BASE}/{CARD_FILENAME}")
    else:
        _LOGGER.debug(
            "Frontend module loader not ready; card is served at %s/%s but not auto-injected. "
            "Add it under Settings → Dashboards → Resources if needed.",
            URL_BASE,
            CARD_FILENAME,
        )
    hass.data[_FRONTEND_FLAG] = True
    _LOGGER.info("Registered Dectyr Surveillance Lovelace card (%s)", CARD_FILENAME)
