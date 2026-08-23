// ============================================================
// SATELLITE AI - GLOBAL MONITORING JAVASCRIPT
// ============================================================

"use strict";

const GLOBAL_API_URL = (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") ? "http://127.0.0.1:8000" : "https://satellite-ai-backend.onrender.com";

// Clock
function updateClock() {
    const clockEl = document.getElementById("globalClock");
    if (clockEl) {
        const now = new Date();
        clockEl.textContent = "UTC " + now.toUTCString().split(" ")[4];
    }
}
setInterval(updateClock, 1000);
updateClock();

// Elements
const dispSatellites = document.getElementById("dispSatellites");
const dispCountries = document.getElementById("dispCountries");
const dispForest = document.getElementById("dispForest");
const dispUrban = document.getElementById("dispUrban");
const dispWater = document.getElementById("dispWater");
const dispGlobalTemp = document.getElementById("dispGlobalTemp");
const dispFocus = document.getElementById("dispFocus");
const dispLastScan = document.getElementById("dispLastScan");

// Progress bars
const barForest = document.getElementById("barProgForest");
const valForest = document.getElementById("valProgForest");
const barFlood = document.getElementById("barProgFlood");
const valFlood = document.getElementById("valProgFlood");
const barUrban = document.getElementById("barProgUrban");
const valUrban = document.getElementById("valProgUrban");
const barClimate = document.getElementById("barProgClimate");
const valClimate = document.getElementById("valProgClimate");
const barDisaster = document.getElementById("barProgDisaster");
const valDisaster = document.getElementById("valProgDisaster");

async function loadGlobalMonitoring() {
    try {
        const res = await fetch(`${GLOBAL_API_URL}/global-monitoring`);
        const data = await res.json();

        if (res.ok && data.success) {
            dispSatellites.textContent = data.active_satellites ?? 18;
            dispCountries.textContent = data.countries_covered ?? 195;
            dispForest.textContent = `${data.forest_coverage ?? 82.4}%`;
            dispUrban.textContent = `${data.urban_expansion ?? 12.8}%`;
            dispWater.textContent = `${data.water_bodies ?? 71.0}%`;
            dispGlobalTemp.textContent = `${data.global_temperature ?? 29.2}°C`;
            dispFocus.textContent = data.current_focus ?? "Asia-Pacific & Amazon Basin";
            dispLastScan.textContent = data.last_scan ?? "Live Telemetry";

            if (data.monitoring) {
                const m = data.monitoring;
                if (barForest) { barForest.style.width = `${m.forest}%`; valForest.textContent = `${m.forest}%`; }
                if (barFlood) { barFlood.style.width = `${m.flood}%`; valFlood.textContent = `${m.flood}%`; }
                if (barUrban) { barUrban.style.width = `${m.urban}%`; valUrban.textContent = `${m.urban}%`; }
                if (barClimate) { barClimate.style.width = `${m.climate}%`; valClimate.textContent = `${m.climate}%`; }
                if (barDisaster) { barDisaster.style.width = `${m.disaster}%`; valDisaster.textContent = `${m.disaster}%`; }
            }
        }
    } catch (e) {
        console.warn("Global monitoring fetch fallback:", e);
    }
}

window.addEventListener("DOMContentLoaded", () => {
    loadGlobalMonitoring();
    setInterval(loadGlobalMonitoring, 8000);
});