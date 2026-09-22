// <madagascar-map> — real Natural Earth geometry (world-atlas TopoJSON) rendered with d3-geo.
const DEPS = [
  { src: "https://unpkg.com/d3@7.9.0/dist/d3.min.js", integrity: "sha384-CjloA8y00+1SDAUkjs099PVfnY2KmDC2BZnws9kh8D/lX1s46w6EPhpXdqMfjK6i", check: () => window.d3 },
  { src: "https://unpkg.com/topojson-client@3.1.0/dist/topojson-client.min.js", integrity: "sha384-Ukv1p/xTma6P4/2bY5KzWBw+ydSpXmhCMtyciIQVDJ1RmOxtCYNMF1uXT9T63H67", check: () => window.topojson }
];

function load(dep) {
  if (dep.check()) return Promise.resolve();
  if (dep._p) return dep._p;
  dep._p = new Promise((res, rej) => {
    const s = document.createElement("script");
    s.src = dep.src;
    s.integrity = dep.integrity;
    s.crossOrigin = "anonymous";
    s.onload = res;
    s.onerror = rej;
    document.head.appendChild(s);
  });
  return dep._p;
}

let atlas;
async function geometry() {
  await load(DEPS[0]);
  await load(DEPS[1]);
  if (!atlas) {
    const topo = await fetch("https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/countries-110m.json").then(r => r.json());
    atlas = window.topojson.feature(topo, topo.objects.countries);
  }
  return atlas;
}

class MadagascarMap extends HTMLElement {
  async connectedCallback() {
    if (this._done) return;
    this._done = true;
    const W = +(this.getAttribute("width") || 300);
    const H = +(this.getAttribute("height") || 420);
    const lon = +(this.getAttribute("lon") || 47.3);
    const lat = +(this.getAttribute("lat") || -22.7);
    const accent = this.getAttribute("accent") || "#40916c";
    const marker = this.getAttribute("marker") || "#e76f51";
    this.style.display = "block";
    try {
      const fc = await geometry();
      const mg = fc.features.find(f => String(f.id) === "450" || (f.properties && f.properties.name === "Madagascar"));
      const proj = window.d3.geoMercator().fitExtent([[16, 16], [W - 16, H - 16]], mg);
      const path = window.d3.geoPath(proj);
      const [mx, my] = proj([lon, lat]);
      this.innerHTML =
        '<svg viewBox="0 0 ' + W + " " + H + '" width="100%" style="display:block;overflow:visible">' +
        '<path d="' + path(mg) + '" fill="rgba(64,145,108,0.14)" stroke="' + accent + '" stroke-width="1.1"></path>' +
        '<circle cx="' + mx + '" cy="' + my + '" r="26" fill="none" stroke="' + marker + '" stroke-width="1" opacity="0.45"></circle>' +
        '<circle cx="' + mx + '" cy="' + my + '" r="14" fill="none" stroke="' + marker + '" stroke-width="1" opacity="0.7"></circle>' +
        '<circle cx="' + mx + '" cy="' + my + '" r="4.5" fill="' + marker + '"></circle>' +
        '<line x1="' + (mx + 26) + '" y1="' + my + '" x2="' + (W - 6) + '" y2="' + my + '" stroke="' + marker + '" stroke-width="0.8" opacity="0.5"></line>' +
        '<text x="' + (W - 4) + '" y="' + (my - 8) + '" text-anchor="end" fill="#e9e6de" font-family="\'IBM Plex Mono\', monospace" font-size="11" letter-spacing="1.4">FAGNAKO</text>' +
        '<text x="' + (W - 4) + '" y="' + (my + 14) + '" text-anchor="end" fill="#7d8b80" font-family="\'IBM Plex Mono\', monospace" font-size="9.5" letter-spacing="1">64 PARCELLES</text>' +
        "</svg>";
    } catch (e) {
      this.innerHTML = '<div style="font-family:\'IBM Plex Mono\',monospace;font-size:11px;color:#7d8b80;padding:20px 0">carte indisponible hors-ligne</div>';
    }
  }
}
if (!customElements.get("madagascar-map")) customElements.define("madagascar-map", MadagascarMap);
