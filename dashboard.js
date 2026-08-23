"use strict";

/* ============================================================
   SATELLITE AI DASHBOARD - JAVASCRIPT CONTROLLER
   ============================================================ */

const SATELLITE_API_URL = (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") ? "http://127.0.0.1:8000" : "https://satellite-ai-backend.onrender.com";

/* ============================================================
   ELEMENTS
   ============================================================ */

const clock = document.getElementById("clock");
const notificationButton = document.getElementById("notificationButton");
const refreshActivityButton = document.getElementById("refreshActivityButton");
const activityTableBody = document.getElementById("activityTableBody");
const countriesCount = document.getElementById("countriesCount");
const imagesCount = document.getElementById("imagesCount");
const alertsCount = document.getElementById("alertsCount");
const accuracyCount = document.getElementById("accuracyCount");
const cloudCoverage = document.getElementById("cloudCoverage");
const lastScan = document.getElementById("lastScan");

/* ============================================================
   LIVE CLOCK
   ============================================================ */

function updateClock() {
    if (!clock) return;
    const now = new Date();
    clock.textContent = now.toLocaleTimeString();
}

updateClock();
setInterval(updateClock, 1000);

/* ============================================================
   NOTIFICATION BUTTON - OPENS AI ASSISTANT & ALERTS
   ============================================================ */

if (notificationButton) {
    notificationButton.addEventListener("click", function () {
        if (window.AIAssistant) {
            AIAssistant.open();
            AIAssistant.appendMessage(
                "assistant",
                "🔔 <strong>Active Satellite Alerts:</strong><br>• 1 Critical Inundation Alert in Kerala Basin.<br>• 2 Thermal Anomalies in Central Asia.<br>• 1 Urban Sprawl High-Velocity Cluster in Eastern Corridor."
            );
            if (typeof AIAssistant.speakResponse === "function") {
                AIAssistant.speakResponse("You have active satellite monitoring alerts. Displaying details.");
            }
        }
    });
}

/* ============================================================
   ANIMATE DASHBOARD NUMBERS
   ============================================================ */

function animateNumber(element, target, suffix = "") {
    if (!element) return;
    let current = 0;
    const duration = 1200;
    const startTime = performance.now();

    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        current = Math.floor(progress * target);
        element.textContent = current.toLocaleString() + suffix;
        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }
    requestAnimationFrame(update);
}

/* ============================================================
   START NUMBER ANIMATIONS & ACTIVITY LOAD
   ============================================================ */

document.addEventListener("DOMContentLoaded", function () {
    animateNumber(countriesCount, 150, "+");
    animateNumber(imagesCount, 12580);
    animateNumber(alertsCount, 96);
    animateNumber(accuracyCount, 99, "%");
    loadDashboardActivity();
});

/* ============================================================
   REFRESH ACTIVITY
   ============================================================ */

if (refreshActivityButton) {
    refreshActivityButton.addEventListener("click", function () {
        loadDashboardActivity();
    });
}

/* ============================================================
   LOAD URBAN GROWTH HISTORY
   ============================================================ */

async function loadDashboardActivity() {
    if (!activityTableBody) return;

    activityTableBody.innerHTML = `
        <tr>
            <td colspan="4" style="text-align:center;">
                <i class="fa-solid fa-spinner fa-spin"></i> Loading satellite activity...
            </td>
        </tr>
    `;

    try {
        const response = await fetch(SATELLITE_API_URL + "/urban-growth/history");
        if (!response.ok) {
            throw new Error("Backend returned HTTP " + response.status);
        }

        const data = await response.json();
        console.log("Dashboard history:", data);

        if (!data || !Array.isArray(data.results)) {
            throw new Error("Invalid history response.");
        }

        if (data.results.length === 0) {
            activityTableBody.innerHTML = `
                <tr>
                    <td colspan="4" style="text-align:center;">
                        No recent monitoring activity.
                    </td>
                </tr>
            `;
            return;
        }

        activityTableBody.innerHTML = "";
        const reports = data.results.slice(0, 5);

        reports.forEach(function (report) {
            const row = document.createElement("tr");
            const date = formatDate(report.created_at);

            row.innerHTML = `
                <td>Urban Growth</td>
                <td>Satellite Analysis</td>
                <td>
                    <span class="status-completed">Completed</span>
                </td>
                <td>${escapeHTML(date)}</td>
            `;
            activityTableBody.appendChild(row);
        });
    } catch (error) {
        console.error("Dashboard history error:", error);
        activityTableBody.innerHTML = `
            <tr>
                <td>Forest Monitoring</td>
                <td>Amazon Basin</td>
                <td><span class="status-completed">Completed</span></td>
                <td>10:45 AM</td>
            </tr>
            <tr>
                <td>Flood Analysis</td>
                <td>Kerala Region</td>
                <td><span class="status-warning">Warning</span></td>
                <td>11:10 AM</td>
            </tr>
            <tr>
                <td>Urban Expansion</td>
                <td>Bengaluru Metro</td>
                <td><span class="status-updated">Updated</span></td>
                <td>11:30 AM</td>
            </tr>
            <tr>
                <td>Climate Thermal</td>
                <td>Global Fleet</td>
                <td><span class="status-live">Live</span></td>
                <td>11:45 AM</td>
            </tr>
            <tr>
                <td>Disaster Detection</td>
                <td>Japan Trench</td>
                <td><span class="status-critical">Critical</span></td>
                <td>12:00 PM</td>
            </tr>
        `;
    }
}

/* ============================================================
   FORMAT DATE
   ============================================================ */

function formatDate(value) {
    if (!value) return "Unknown";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return String(value);
    }
    return date.toLocaleString();
}

/* ============================================================
   ESCAPE HTML
   ============================================================ */

function escapeHTML(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

console.log("Satellite AI Dashboard JavaScript loaded successfully.");