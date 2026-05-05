/** Leaflet global from HA map cards or CDN fallback (no npm bundle). */
export type LeafletLib = Record<string, unknown>;

let leafletLoaded = false;
let leafletLoadPromise: Promise<LeafletLib> | null = null;

const LEAFLET_JS = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
const LEAFLET_CSS = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";

function appendCssOnce(href: string): void {
  const id = `dectyr-leaflet-css-${href.replace(/[^a-z0-9]+/gi, "-")}`;
  if (document.getElementById(id)) {
    return;
  }
  const link = document.createElement("link");
  link.id = id;
  link.rel = "stylesheet";
  link.href = href;
  document.head.appendChild(link);
}

export async function loadLeaflet(): Promise<LeafletLib> {
  const w = window as unknown as { L?: LeafletLib };
  if (leafletLoaded && w.L) {
    return w.L;
  }
  if (leafletLoadPromise) {
    return leafletLoadPromise;
  }

  leafletLoadPromise = new Promise<LeafletLib>((resolve, reject) => {
    if (w.L) {
      leafletLoaded = true;
      resolve(w.L);
      return;
    }

    appendCssOnce(LEAFLET_CSS);

    const script = document.createElement("script");
    script.src = LEAFLET_JS;
    script.async = true;
    script.dataset.dectyrLeaflet = "1";
    script.onload = () => {
      const L = (window as unknown as { L?: LeafletLib }).L;
      if (!L) {
        reject(new Error("Leaflet script loaded but window.L is missing"));
        return;
      }
      leafletLoaded = true;
      resolve(L);
    };
    script.onerror = () => reject(new Error("Failed to load Leaflet from CDN"));
    document.head.appendChild(script);
  });

  return leafletLoadPromise;
}
