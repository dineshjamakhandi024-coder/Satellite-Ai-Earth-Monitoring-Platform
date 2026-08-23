// ============================================================
// SATELLITE AI - DISASTER ALERTS JAVASCRIPT
// ============================================================

"use strict";

const API_URL = (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") ? "http://127.0.0.1:8000" : "https://satellite-ai-backend.onrender.com";
let activeCategory = "all";
let alertsData = [];
let selectedAlertId = 1;

// Clock
function updateClock() {
    const clockEl = document.getElementById("disasterClock");
    if (clockEl) {
        const now = new Date();
        clockEl.textContent = "UTC " + now.toUTCString().split(" ")[4];
    }
}
setInterval(updateClock, 1000);
updateClock();

// Elements
const alertsContainer = document.getElementById("alertsContainer");
const refreshBtn = document.getElementById("refreshAlertsBtn");
const cntActiveAlerts = document.getElementById("cntActiveAlerts");
const alertModal = document.getElementById("alertModal");
const modalTitle = document.getElementById("modalTitle");
const modalSeverity = document.getElementById("modalSeverity");
const modalLocation = document.getElementById("modalLocation");
const modalMagnitude = document.getElementById("modalMagnitude");
const modalTime = document.getElementById("modalTime");
const modalDetails = document.getElementById("modalDetails");
const btnModalPdf = document.getElementById("btnModalPdf");

// Load Alerts from API
async function loadDisasterAlerts(cat = "all") {
    activeCategory = cat;
    try {
        const url = cat === "all" ? `${API_URL}/disaster-alerts` : `${API_URL}/disaster-alerts?category=${cat}`;
        const res = await fetch(url);
        const json = await res.json();

        if (res.ok && json.success && json.alerts) {
            alertsData = json.alerts;
            cntActiveAlerts.textContent = alertsData.length;
            renderAlertsList(alertsData);
        } else {
            renderFallbackAlerts();
        }
    } catch (e) {
        console.warn("Disaster fetch fallback:", e);
        renderFallbackAlerts();
    }
}

function renderFallbackAlerts() {
    const fallback = [
        { id: 1, title: "Earthquake Detected", category: "earthquake", location: "Tokyo, Japan", severity: "Critical", magnitude: "Magnitude 7.2", created_at: new Date().toISOString(), details: "Tectonic shift recorded along Pacific Rim. Evacuation advisory active." },
        { id: 2, title: "Flood Warning", category: "flood", location: "Kerala, India", severity: "High", magnitude: "River Level +4.2m", created_at: new Date().toISOString(), details: "Continuous heavy monsoon rain exceeding seasonal thresholds. Relief camps deployed." },
        { id: 3, title: "Forest Wildfire", category: "fire", location: "California, USA", severity: "High", magnitude: "Area 1,200 ha", created_at: new Date().toISOString(), details: "Thermal anomaly detected by infrared orbiters. Fire containment at 35%." },
        { id: 4, title: "Cyclone Category-3", category: "cyclone", location: "Bay of Bengal", severity: "Critical", magnitude: "Wind 145 km/h", created_at: new Date().toISOString(), details: "Deep atmospheric depression moving northwest. Coastal alerts issued." }
    ];
    alertsData = fallback;
    renderAlertsList(fallback);
}

function getCategoryIcon(cat) {
    switch (cat.toLowerCase()) {
        case "earthquake": return "fa-house-crack";
        case "flood": return "fa-water";
        case "fire": return "fa-fire";
        case "cyclone": return "fa-wind";
        default: return "fa-triangle-exclamation";
    }
}

function renderAlertsList(list) {
    if (!alertsContainer) return;
    if (list.length === 0) {
        alertsContainer.innerHTML = `<p class="no-alerts">No active incidents for this category.</p>`;
        return;
    }

    alertsContainer.innerHTML = list.map(a => {
        const icon = getCategoryIcon(a.category);
        const sevClass = a.severity.toLowerCase() === "critical" ? "border-critical" : "border-high";
        return `
            <div class="alert-item ${sevClass}">
                <div class="alert-icon-box">
                    <i class="fas ${icon}"></i>
                </div>
                <div class="alert-info">
                    <div class="alert-badge ${a.severity.toLowerCase()}">${a.severity.toUpperCase()}</div>
                    <h3>${a.title}</h3>
                    <p><i class="fa-solid fa-location-dot"></i> ${a.location}</p>
                    <small><i class="fa-solid fa-gauge"></i> ${a.magnitude || "Class 4"}</small>
                </div>
                <div class="alert-actions">
                    <button class="btn-view-alert" onclick="openAlertModal(${a.id})">
                        <i class="fa-solid fa-eye"></i> Details
                    </button>
                    <button class="btn-pdf-alert" onclick="downloadAlertReport(${a.id})">
                        <i class="fa-solid fa-download"></i> PDF
                    </button>
                </div>
            </div>
        `;
    }).join("");
}

// Category filter trigger
function filterDisasters(cat) {
    document.querySelectorAll(".filter-btn").forEach(btn => btn.classList.remove("active"));
    if (event && event.currentTarget) event.currentTarget.classList.add("active");
    loadDisasterAlerts(cat);
}

// Modal Inspector
function openAlertModal(id) {
    const alert = alertsData.find(a => a.id === id);
    if (!alert) return;

    selectedAlertId = id;
    modalTitle.textContent = alert.title;
    modalSeverity.textContent = alert.severity.toUpperCase();
    modalSeverity.className = `modal-badge ${alert.severity.toLowerCase()}`;
    modalLocation.textContent = alert.location;
    modalMagnitude.textContent = alert.magnitude || "Active";
    modalTime.textContent = alert.created_at ? alert.created_at.substring(0, 19).replace("T", " ") : "Live Telemetry";
    modalDetails.textContent = alert.details || "Multi-spectral sensors tracking geospatial progression and risk index.";

    alertModal.style.display = "flex";
}

function closeModal() {
    alertModal.style.display = "none";
}

// PDF Download
function downloadAlertReport(id) {
    window.open(`${API_URL}/disaster-alerts/report/${id}`, "_blank");
}

btnModalPdf.addEventListener("click", () => {
    downloadAlertReport(selectedAlertId);
});

// Quick Action: Export Briefing
function generateDisasterBriefing() {
    const targetId = alertsData.length > 0 ? alertsData[0].id : 1;
    downloadAlertReport(targetId);
}

function simulateDroneDispatch() {
    alert("🛰 Priority Orbital Tasking Request Dispatched!\n\nNext Sentinel & Landsat synthetic-aperture passes aligned with incident coordinates.");
}

refreshBtn.addEventListener("click", () => {
    loadDisasterAlerts(activeCategory);
});

window.addEventListener("DOMContentLoaded", () => {
    loadDisasterAlerts("all");
});