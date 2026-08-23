// ============================================================
// SATELLITE AI - REPORTS JAVASCRIPT
// ============================================================

"use strict";

const API_URL = (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") ? "http://127.0.0.1:8000" : "https://satellite-ai-backend.onrender.com";
let activeCategory = "all";
let allReportsCache = [];

// Elements
const reportsContainer = document.getElementById("reportsContainer");
const reportCount = document.getElementById("reportCount");
const reportSearch = document.getElementById("reportSearch");
const mapModal = document.getElementById("mapModal");
const modalMapImg = document.getElementById("modalMapImg");
const modalMapTitle = document.getElementById("modalMapTitle");

// Load All Reports
async function loadAllReports() {
    try {
        reportsContainer.innerHTML = `
            <div class="loading-state">
                <i class="fa-solid fa-spinner fa-spin"></i>
                <p>Loading reports repository from database...</p>
            </div>
        `;

        const url = activeCategory === "all" ? `${API_URL}/reports/all` : `${API_URL}/reports/all?category=${activeCategory}`;
        const res = await fetch(url);
        const data = await res.json();

        if (res.ok && data.success && data.reports) {
            allReportsCache = data.reports;
            reportCount.textContent = `${allReportsCache.length} Reports`;
            renderReports(allReportsCache);
        } else {
            renderEmptyState("No reports available.");
        }
    } catch (e) {
        console.warn("Reports fetch error:", e);
        renderEmptyState("Unable to connect to backend server. Ensure FastAPI is running.");
    }
}

function getCategoryColor(type) {
    switch (type.toLowerCase()) {
        case "urban growth": return "badge-urban";
        case "flood analysis": return "badge-flood";
        case "forest monitoring": return "badge-forest";
        case "change detection": return "badge-change";
        default: return "badge-default";
    }
}

function renderReports(reports) {
    if (!reports || reports.length === 0) {
        renderEmptyState("No reports match your selected filter or search term.");
        return;
    }

    reportsContainer.innerHTML = reports.map(r => {
        const catBadge = getCategoryColor(r.type);
        const dateStr = r.created_at ? r.created_at.substring(0, 19).replace("T", " ") : "Recently Generated";
        const mapImg = r.change_map ? `${API_URL}/uploads/${r.change_map}` : "images/earth.jpg";
        const pdfUrl = `${API_URL}${r.download_url}`;

        return `
            <div class="report-card">
                <div class="report-card-head">
                    <span class="report-type-badge ${catBadge}">${r.type.toUpperCase()}</span>
                    <span class="report-id-pill">#${r.id}</span>
                </div>

                <div class="report-thumb" onclick="openMapModal('${mapImg}', '${r.type} #${r.id}')">
                    <img src="${mapImg}" alt="${r.type} Map" onerror="this.src='images/earth.jpg'">
                    <div class="thumb-hover"><i class="fa-solid fa-magnifying-glass-plus"></i> Inspect Map</div>
                </div>

                <div class="report-body">
                    <h3 class="report-metric">${r.metric_label}</h3>
                    <p class="report-date"><i class="fa-solid fa-clock"></i> ${dateStr}</p>
                </div>

                <div class="report-foot">
                    <button class="btn-card-view" onclick="openMapModal('${mapImg}', '${r.type} #${r.id}')">
                        <i class="fa-solid fa-eye"></i> View Map
                    </button>
                    <button class="btn-card-pdf" onclick="window.open('${pdfUrl}', '_blank')">
                        <i class="fa-solid fa-file-pdf"></i> Download PDF
                    </button>
                </div>
            </div>
        `;
    }).join("");
}

function renderEmptyState(msg) {
    reportsContainer.innerHTML = `
        <div class="empty-state">
            <i class="fa-solid fa-folder-open"></i>
            <h3>No Reports Found</h3>
            <p>${msg}</p>
            <a href="change-detection.html" class="btn-create-report"><i class="fa-solid fa-plus"></i> Run New Analysis</a>
        </div>
    `;
}

// Category filter
function filterReportsCategory(cat) {
    activeCategory = cat;
    document.querySelectorAll(".tab-pill").forEach(btn => btn.classList.remove("active"));
    if (event && event.currentTarget) event.currentTarget.classList.add("active");
    loadAllReports();
}

// Search
function searchReports() {
    const q = reportSearch.value.trim().toLowerCase();
    if (!q) {
        renderReports(allReportsCache);
        return;
    }
    const filtered = allReportsCache.filter(r => 
        String(r.id).includes(q) ||
        r.type.toLowerCase().includes(q) ||
        r.metric_label.toLowerCase().includes(q) ||
        (r.created_at && r.created_at.toLowerCase().includes(q))
    );
    renderReports(filtered);
}

// Modal Map Inspector
function openMapModal(imgSrc, title) {
    modalMapImg.src = imgSrc;
    modalMapTitle.innerHTML = `<i class="fa-solid fa-map"></i> ${title} - AI Change Heatmap`;
    mapModal.style.display = "flex";
}

function closeMapModal() {
    mapModal.style.display = "none";
}

// Auto load
window.addEventListener("DOMContentLoaded", loadAllReports);
