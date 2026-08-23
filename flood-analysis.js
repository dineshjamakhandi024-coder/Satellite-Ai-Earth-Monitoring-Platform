// ============================================================
// SATELLITE AI - FLOOD ANALYSIS JAVASCRIPT
// ============================================================

"use strict";

const API_URL = (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") ? "http://127.0.0.1:8000" : "https://satellite-ai-backend.onrender.com";
let beforeFloodFile = null;
let afterFloodFile = null;
let currentFloodReportId = null;

// Clock
function updateClock() {
    const clockEl = document.getElementById("utcClock");
    if (clockEl) {
        const now = new Date();
        clockEl.textContent = "UTC " + now.toUTCString().split(" ")[4];
    }
}
setInterval(updateClock, 1000);
updateClock();

// Elements
const beforeInput = document.getElementById("beforeFloodInput");
const afterInput = document.getElementById("afterFloodInput");
const beforePreview = document.getElementById("beforeFloodPreview");
const afterPreview = document.getElementById("afterFloodPreview");
const beforeName = document.getElementById("beforeFloodName");
const afterName = document.getElementById("afterFloodName");
const analyzeBtn = document.getElementById("analyzeFloodBtn");
const scannerBox = document.getElementById("scannerBox");
const scannerStatus = document.getElementById("scannerStatus");
const resultsSection = document.getElementById("floodResultsSection");
const downloadPdfBtn = document.getElementById("downloadFloodPdfBtn");

// Result fields
const resCoverage = document.getElementById("resFloodCoverage");
const resDepth = document.getElementById("resFloodDepth");
const resRainfall = document.getElementById("resRainfall");
const resBuildings = document.getElementById("resBuildings");
const resPopulation = document.getElementById("resPopulation");
const resSeverity = document.getElementById("resSeverity");
const compBefore = document.getElementById("compBefore");
const compAfter = document.getElementById("compAfter");
const compMap = document.getElementById("compMap");

// File handlers
beforeInput.addEventListener("change", function () {
    if (this.files && this.files[0]) {
        beforeFloodFile = this.files[0];
        beforePreview.src = URL.createObjectURL(beforeFloodFile);
        beforeName.textContent = beforeFloodFile.name;
    }
});

afterInput.addEventListener("change", function () {
    if (this.files && this.files[0]) {
        afterFloodFile = this.files[0];
        afterPreview.src = URL.createObjectURL(afterFloodFile);
        afterName.textContent = afterFloodFile.name;
    }
});

// Preset sample loader
async function loadFloodPreset(beforeSrc, afterSrc, name) {
    try {
        beforePreview.src = beforeSrc;
        afterPreview.src = afterSrc;
        beforeName.textContent = beforeSrc;
        afterName.textContent = afterSrc;

        const [bRes, aRes] = await Promise.all([fetch(beforeSrc), fetch(afterSrc)]);
        const [bBlob, aBlob] = await Promise.all([bRes.blob(), aRes.blob()]);

        beforeFloodFile = new File([bBlob], beforeSrc, { type: "image/jpeg" });
        afterFloodFile = new File([aBlob], afterSrc, { type: "image/jpeg" });
    } catch (e) {
        console.warn("Flood preset fetch fallback:", e);
    }
}

// Auto load default sample
window.addEventListener("DOMContentLoaded", () => {
    loadFloodPreset("images/flood1.jpg", "images/flood2.jpg", "Default Flood Pair");
});

// Execute Flood Analysis
analyzeBtn.addEventListener("click", async function () {
    if (!beforeFloodFile || !afterFloodFile) {
        try {
            const [bRes, aRes] = await Promise.all([fetch(beforePreview.src), fetch(afterPreview.src)]);
            const [bBlob, aBlob] = await Promise.all([bRes.blob(), aRes.blob()]);
            beforeFloodFile = new File([bBlob], "before_flood.jpg", { type: "image/jpeg" });
            afterFloodFile = new File([aBlob], "after_flood.jpg", { type: "image/jpeg" });
        } catch (e) {
            alert("Please select both pre-flood and post-flood satellite images.");
            return;
        }
    }

    analyzeBtn.disabled = true;
    analyzeBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Analyzing Flood Disaster...';
    scannerBox.style.display = "block";
    scannerStatus.textContent = "Multi-spectral radar telemetry analyzing water inundation...";

    const formData = new FormData();
    formData.append("before_image", beforeFloodFile);
    formData.append("after_image", afterFloodFile);

    try {
        const res = await fetch(`${API_URL}/flood-analysis`, {
            method: "POST",
            body: formData
        });

        const data = await res.json();

        if (res.ok && data.success) {
            const rep = data.report;
            currentFloodReportId = rep.id;

            resCoverage.textContent = `${Number(rep.flood_coverage).toFixed(1)}%`;
            resDepth.textContent = `${Number(rep.flood_depth).toFixed(1)} m`;
            resRainfall.textContent = `${rep.rainfall_mm} mm`;
            resBuildings.textContent = Number(rep.buildings_damaged).toLocaleString();
            resPopulation.textContent = Number(rep.population_affected).toLocaleString();
            resSeverity.textContent = rep.severity_level || "Critical";

            compBefore.src = `${API_URL}/uploads/${rep.before_image}`;
            compAfter.src = `${API_URL}/uploads/${rep.after_image}`;
            compMap.src = `${API_URL}/uploads/${rep.change_map}`;

            // Update severity bars
            const floodPct = Math.min(100, Math.round(rep.flood_coverage * 1.8));
            document.getElementById("barFloodLevel").style.width = `${floodPct}%`;
            document.getElementById("valFloodLevel").textContent = `${floodPct}%`;

            const damagePct = Math.min(100, Math.round(rep.flood_coverage * 1.4));
            document.getElementById("barDamage").style.width = `${damagePct}%`;
            document.getElementById("valDamage").textContent = `${damagePct}%`;

            scannerBox.style.display = "none";
            resultsSection.style.display = "block";
            resultsSection.scrollIntoView({ behavior: "smooth" });
        } else {
            throw new Error(data.detail || data.message || "Flood analysis failed.");
        }
    } catch (err) {
        console.error("Flood analysis error:", err);
        alert("Flood Analysis could not be completed:\n\n" + err.message);
        scannerBox.style.display = "none";
    } finally {
        analyzeBtn.disabled = false;
        analyzeBtn.innerHTML = '<i class="fa-solid fa-satellite-dish"></i> Analyze Flood Damage';
    }
});

// Download Flood PDF Report
downloadPdfBtn.addEventListener("click", function () {
    if (!currentFloodReportId) {
        alert("Please analyze a flood scenario first.");
        return;
    }
    window.open(`${API_URL}/flood-analysis/report/${currentFloodReportId}`, "_blank");
});
