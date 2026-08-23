// ============================================================
// SATELLITE AI - FOREST MONITORING JAVASCRIPT
// ============================================================

"use strict";

const API_URL = "http://127.0.0.1:8000";
let beforeForestFile = null;
let afterForestFile = null;
let currentForestReportId = null;

// Clock
function updateClock() {
    const clockEl = document.getElementById("forestClock");
    if (clockEl) {
        const now = new Date();
        clockEl.textContent = "UTC " + now.toUTCString().split(" ")[4];
    }
}
setInterval(updateClock, 1000);
updateClock();

// Elements
const beforeInput = document.getElementById("beforeForestInput");
const afterInput = document.getElementById("afterForestInput");
const beforePreview = document.getElementById("beforeForestPreview");
const afterPreview = document.getElementById("afterForestPreview");
const beforeName = document.getElementById("beforeForestName");
const afterName = document.getElementById("afterForestName");
const detectBtn = document.getElementById("detectForestBtn");
const scanner = document.getElementById("forestScanner");
const scannerStatus = document.getElementById("forestScanStatus");
const resultsSection = document.getElementById("forestResultsSection");
const downloadPdfBtn = document.getElementById("downloadForestPdfBtn");

// Result elements
const resCoverage = document.getElementById("resForestCoverage");
const resLost = document.getElementById("resTreesLost");
const resPlantation = document.getElementById("resNewPlantation");
const resRisk = document.getElementById("resRiskLevel");
const resArea = document.getElementById("resAreaScanned");
const resConfidence = document.getElementById("resConfidence");
const compBefore = document.getElementById("compForestBefore");
const compAfter = document.getElementById("compForestAfter");
const compMap = document.getElementById("compForestMap");

// File handlers
beforeInput.addEventListener("change", function () {
    if (this.files && this.files[0]) {
        beforeForestFile = this.files[0];
        beforePreview.src = URL.createObjectURL(beforeForestFile);
        beforeName.textContent = beforeForestFile.name;
    }
});

afterInput.addEventListener("change", function () {
    if (this.files && this.files[0]) {
        afterForestFile = this.files[0];
        afterPreview.src = URL.createObjectURL(afterForestFile);
        afterName.textContent = afterForestFile.name;
    }
});

// Preset loader
async function loadForestPreset(beforeSrc, afterSrc, name) {
    try {
        beforePreview.src = beforeSrc;
        afterPreview.src = afterSrc;
        beforeName.textContent = beforeSrc;
        afterName.textContent = afterSrc;

        const [bRes, aRes] = await Promise.all([fetch(beforeSrc), fetch(afterSrc)]);
        const [bBlob, aBlob] = await Promise.all([bRes.blob(), aRes.blob()]);

        beforeForestFile = new File([bBlob], beforeSrc, { type: "image/png" });
        afterForestFile = new File([aBlob], afterSrc, { type: "image/png" });
    } catch (e) {
        console.warn("Forest preset fetch error:", e);
    }
}

// Auto load default
window.addEventListener("DOMContentLoaded", () => {
    loadForestPreset("images/forest.jpg", "images/forest1.png", "Default Forest Pair");
});

// Detect Forest Changes
detectBtn.addEventListener("click", async function () {
    if (!beforeForestFile || !afterForestFile) {
        try {
            const [bRes, aRes] = await Promise.all([fetch(beforePreview.src), fetch(afterPreview.src)]);
            const [bBlob, aBlob] = await Promise.all([bRes.blob(), aRes.blob()]);
            beforeForestFile = new File([bBlob], "before_forest.png", { type: "image/png" });
            afterForestFile = new File([aBlob], "after_forest.png", { type: "image/png" });
        } catch (e) {
            alert("Please select both Baseline and Current forest images.");
            return;
        }
    }

    detectBtn.disabled = true;
    detectBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Analyzing Canopy Chlorophyll & NDVI...';
    scanner.style.display = "block";
    scannerStatus.textContent = "Computing multi-spectral vegetation indices and identifying canopy loss...";

    const formData = new FormData();
    formData.append("before_image", beforeForestFile);
    formData.append("after_image", afterForestFile);

    try {
        const res = await fetch(`${API_URL}/forest-monitoring`, {
            method: "POST",
            body: formData
        });

        const data = await res.json();

        if (res.ok && data.success) {
            const rep = data.report;
            currentForestReportId = rep.id;

            resCoverage.textContent = `${Number(rep.forest_coverage).toFixed(1)}%`;
            resLost.textContent = `${Number(rep.trees_lost).toFixed(1)}%`;
            resPlantation.textContent = `${Number(rep.new_plantation).toFixed(1)}%`;
            resRisk.textContent = rep.risk_level || "Medium";
            resArea.textContent = `${rep.area_scanned_km2} km²`;
            resConfidence.textContent = `${rep.confidence}%`;

            compBefore.src = `${API_URL}/uploads/${rep.before_image}`;
            compAfter.src = `${API_URL}/uploads/${rep.after_image}`;
            compMap.src = `${API_URL}/uploads/${rep.change_map}`;

            scanner.style.display = "none";
            resultsSection.style.display = "block";
            resultsSection.scrollIntoView({ behavior: "smooth" });
        } else {
            throw new Error(data.detail || data.message || "Forest analysis failed.");
        }
    } catch (err) {
        console.error("Forest analysis error:", err);
        alert("Forest analysis error:\n\n" + err.message);
        scanner.style.display = "none";
    } finally {
        detectBtn.disabled = false;
        detectBtn.innerHTML = '<i class="fa-solid fa-satellite-dish"></i> Detect Forest Changes & Deforestation';
    }
});

// Download Forest PDF Report
downloadPdfBtn.addEventListener("click", function () {
    if (!currentForestReportId) {
        alert("Please analyze a forest scenario first.");
        return;
    }
    window.open(`${API_URL}/forest-monitoring/report/${currentForestReportId}`, "_blank");
});
