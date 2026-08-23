// ============================================================
// SATELLITE AI - URBAN GROWTH JAVASCRIPT
// ============================================================

"use strict";

const API_URL = "http://127.0.0.1:8000";
let beforeUrbanFile = null;
let afterUrbanFile = null;
let currentUrbanReportId = null;

// Clock
function updateClock() {
    const clockEl = document.getElementById("urbanClock");
    if (clockEl) {
        const now = new Date();
        clockEl.textContent = "UTC " + now.toUTCString().split(" ")[4];
    }
}
setInterval(updateClock, 1000);
updateClock();

// Elements
const beforeInput = document.getElementById("beforeUrbanInput");
const afterInput = document.getElementById("afterUrbanInput");
const beforePreview = document.getElementById("beforeUrbanPreview");
const afterPreview = document.getElementById("afterUrbanPreview");
const beforeName = document.getElementById("beforeUrbanName");
const afterName = document.getElementById("afterUrbanName");
const analyzeBtn = document.getElementById("analyzeUrbanBtn");
const scanner = document.getElementById("urbanScanner");
const resultsSection = document.getElementById("urbanResultsSection");
const downloadPdfBtn = document.getElementById("downloadUrbanPdfBtn");
const refreshHistoryBtn = document.getElementById("refreshUrbanHistoryBtn");
const historyBody = document.getElementById("urbanHistoryBody");

// Results fields
const resExpansion = document.getElementById("resUrbanExpansion");
const resPixels = document.getElementById("resUrbanPixels");
const resArea = document.getElementById("resUrbanArea");
const resMethod = document.getElementById("resUrbanMethod");
const compBefore = document.getElementById("compUrbanBefore");
const compAfter = document.getElementById("compUrbanAfter");
const compMap = document.getElementById("compUrbanMap");

// File handlers
beforeInput.addEventListener("change", function () {
    if (this.files && this.files[0]) {
        beforeUrbanFile = this.files[0];
        beforePreview.src = URL.createObjectURL(beforeUrbanFile);
        beforeName.textContent = beforeUrbanFile.name;
    }
});

afterInput.addEventListener("change", function () {
    if (this.files && this.files[0]) {
        afterUrbanFile = this.files[0];
        afterPreview.src = URL.createObjectURL(afterUrbanFile);
        afterName.textContent = afterUrbanFile.name;
    }
});

// Preset loader
async function loadUrbanPreset(beforeSrc, afterSrc, name) {
    try {
        beforePreview.src = beforeSrc;
        afterPreview.src = afterSrc;
        beforeName.textContent = beforeSrc;
        afterName.textContent = afterSrc;

        const [bRes, aRes] = await Promise.all([fetch(beforeSrc), fetch(afterSrc)]);
        const [bBlob, aBlob] = await Promise.all([bRes.blob(), aRes.blob()]);

        beforeUrbanFile = new File([bBlob], beforeSrc, { type: "image/png" });
        afterUrbanFile = new File([aBlob], afterSrc, { type: "image/png" });
    } catch (e) {
        console.warn("Urban preset fetch error:", e);
    }
}

// Auto load default preset
window.addEventListener("DOMContentLoaded", () => {
    loadUrbanPreset("images/urban.jpg", "images/urban1.jpg.png", "Default Urban Pair");
    loadUrbanHistory();
});

// Analyze Urban Expansion
analyzeBtn.addEventListener("click", async function () {
    if (!beforeUrbanFile || !afterUrbanFile) {
        try {
            const [bRes, aRes] = await Promise.all([fetch(beforePreview.src), fetch(afterPreview.src)]);
            const [bBlob, aBlob] = await Promise.all([bRes.blob(), aRes.blob()]);
            beforeUrbanFile = new File([bBlob], "before_urban.png", { type: "image/png" });
            afterUrbanFile = new File([aBlob], "after_urban.png", { type: "image/png" });
        } catch (e) {
            alert("Please select both Baseline and Current city images.");
            return;
        }
    }

    analyzeBtn.disabled = true;
    analyzeBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Analyzing Urban Expansion...';
    scanner.style.display = "block";

    const formData = new FormData();
    formData.append("before_image", beforeUrbanFile);
    formData.append("after_image", afterUrbanFile);

    try {
        const res = await fetch(`${API_URL}/urban-growth`, {
            method: "POST",
            body: formData
        });

        const data = await res.json();

        if (res.ok && data.success) {
            const rep = data.report;
            currentUrbanReportId = rep.id;

            resExpansion.textContent = `${Number(rep.urban_expansion).toFixed(2)}%`;
            resPixels.textContent = Number(rep.changed_pixels).toLocaleString();
            resArea.textContent = `${(rep.changed_pixels * 0.008).toFixed(1)} km²`;
            resMethod.textContent = "Texture & Multi-Band AI";

            compBefore.src = `${API_URL}/uploads/${rep.before_image}`;
            compAfter.src = `${API_URL}/uploads/${rep.after_image}`;
            compMap.src = `${API_URL}/uploads/${rep.change_map}`;

            scanner.style.display = "none";
            resultsSection.style.display = "block";
            resultsSection.scrollIntoView({ behavior: "smooth" });

            loadUrbanHistory();
        } else {
            throw new Error(data.detail || data.message || "Urban growth analysis failed.");
        }
    } catch (err) {
        console.error("Urban growth error:", err);
        alert("Urban growth analysis error:\n\n" + err.message);
        scanner.style.display = "none";
    } finally {
        analyzeBtn.disabled = false;
        analyzeBtn.innerHTML = '<i class="fa-solid fa-satellite-dish"></i> Analyze Urban Expansion';
    }
});

// Load Urban History Table
async function loadUrbanHistory() {
    if (!historyBody) return;
    try {
        const res = await fetch(`${API_URL}/urban-growth/history`);
        const data = await res.json();

        if (res.ok && data.success && data.results && data.results.length > 0) {
            historyBody.innerHTML = data.results.map(r => `
                <tr>
                    <td><strong>#${r.id}</strong></td>
                    <td class="text-blue"><strong>+${Number(r.urban_expansion).toFixed(2)}%</strong></td>
                    <td>${Number(r.changed_pixels).toLocaleString()} px</td>
                    <td>${r.created_at ? r.created_at.substring(0, 19).replace("T", " ") : "Just now"}</td>
                    <td>
                        <button class="btn-sm-download" onclick="window.open('${API_URL}/urban-growth/report/${r.id}', '_blank')">
                            <i class="fa-solid fa-download"></i> PDF
                        </button>
                    </td>
                </tr>
            `).join("");
        } else {
            historyBody.innerHTML = `<tr><td colspan="5" class="text-center text-muted">No historical records found. Run an analysis above.</td></tr>`;
        }
    } catch (e) {
        historyBody.innerHTML = `<tr><td colspan="5" class="text-center text-muted">Could not connect to history endpoint.</td></tr>`;
    }
}

refreshHistoryBtn.addEventListener("click", loadUrbanHistory);

// Download PDF
downloadPdfBtn.addEventListener("click", function () {
    if (!currentUrbanReportId) {
        alert("Please run an urban growth analysis first.");
        return;
    }
    window.open(`${API_URL}/urban-growth/report/${currentUrbanReportId}`, "_blank");
});