# 05. Frontend Components, 3D WebGL & UI Design System

## 1. Overview
The frontend of the Satellite AI Platform delivers an aerospace-grade interface styled with a deep cosmic dark palette, neon accents, glassmorphic cards, and smooth CSS transitions.

---

## 2. Global Design System Tokens

```css
:root {
    --bg-primary: #070b14;
    --bg-secondary: #0d1527;
    --bg-glass: rgba(13, 21, 39, 0.75);
    --border-glass: rgba(0, 240, 255, 0.15);
    --accent-cyan: #00f0ff;
    --accent-blue: #3b82f6;
    --accent-emerald: #10b981;
    --accent-amber: #f59e0b;
    --accent-rose: #ef4444;
    --accent-purple: #a855f7;
    --text-primary: #f8fafc;
    --text-muted: #94a3b8;
    --font-main: 'Inter', system-ui, sans-serif;
    --glow-cyan: 0 0 20px rgba(0, 240, 255, 0.35);
    --glow-card: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
}
```

---

## 3. Frontend Views Catalog

| HTML File | Primary CSS | Primary JS | Description & Capabilities |
| :--- | :--- | :--- | :--- |
| `index.html` | `style.css` | `index.js`, `script.js`, `ai-assistant.js` | Main Landing Page: Hero with live ticker, mission metrics, AI Chart Bot live demo modal, feature cards. |
| `dashboard.html` | `dashboard.css` | `dashboard.js`, `auth.js` | Mission Control: Active satellite constellation tracking, system health monitors, sensor logs, telemetry graphs. |
| `earth.html` | `earth.css` | `earth-3d.js`, `national-weather.js` | WebGL 3D Globe: Interactive Three.js globe with atmospheric shader, orbital paths, country pins, HUD info. |
| `change-detection.html` | `change.css` | `script.js` | Dual-temporal comparative analysis: Before/After upload, method selection, interactive difference slider. |
| `flood-analysis.html` | `flood-analysis.css` | `flood-analysis.js` | Flood inundation mapper: SAR/optical difference, depth meter, damaged building calculator. |
| `forest-monitoring.html`| `forest-detection.css`| `forest-monitoring.js`| Canopy health: Deforestation rate, NDVI vegetation index, illegal logging risk meter. |
| `urban-growth.html` | `urban-growth.css` | `urban-growth.js` | Urban expansion: Infrastructure growth tracker, temporal comparison slider. |
| `climate-monitoring.html`| `climate-monitoring.css`| `climate-monitoring.js`| Atmospheric indices: Global temperature, CO2 emissions, AQI index, Open-Meteo live API integration. |
| `disaster-alerts.html` | `disaster-alerts.css` | `disaster-alerts.js` | Hazard monitoring: Earthquakes, Wildfires, Cyclones, Floods with severity filters and PDF export. |
| `upload-images.html` | `upload-images.css` | `upload-images.js` | Imagery ingestion: Drag-and-drop satellite imagery ingestion, automatic CV pipeline dispatch. |
| `reports.html` | `reports.css` | `reports.js` | Intelligence Archive: Searchable repository of generated reports with single-click PDF downloads. |
| `login.html` | `login.css` | `login.js` | Authentication Hub: Sign In, Sign Up, Forgot Password, and Role selection with cosmic animations. |
| `mobile_access.html` | Inline/Modern | Inline | LAN Mobile Companion: Displays dynamically generated QR code and local network pairing instructions. |

---

## 4. 3D WebGL Earth Engine (`earth-3d.js`)

The 3D Earth visualization is built on **Three.js (r128)**:
- **Sphere Geometry**: Radius 200 units with high-res earth texture map (`earth.jpg`).
- **Atmosphere Glow Shader**: Custom vertex and fragment GLSL shaders creating atmospheric Rayleigh scattering backlighting.
- **Orbital Satellite Constellations**: Procedurally calculates Keplerian orbital paths with glowing satellite nodes (ISS, Sentinel-2, Landsat-9, Terra).
- **Interactive Raycasting**: Mouse and touch raycasting identifying geographic latitude/longitude coordinates and country boundaries.
- **GSAP Smooth Camera Animations**: Smooth orbital transitions when zooming to alert coordinates or telemetry sectors.

---

## 5. Intelligent AI Assistant & Chart Bot (`ai-assistant.js`)

The floating AI Assistant (**Dr. Astra**) delivers a full multi-modal interface:
- **Speech Recognition (STT)**: Uses Web Speech `webkitSpeechRecognition` for hands-free voice command execution.
- **Voice Synthesis (TTS)**: Speech synthesis with pitch and rate modulation for natural spoken answers.
- **Dynamic Chart Bot**: Renders real-time Chart.js telemetry graphs on demand for 6 distinct operational modules:
  1. `forest`: Canopy Loss vs Afforestation Gain
  2. `urban`: Sprawl Rate & Infrastructure Expansion
  3. `flood`: Inundation Extent & Impact Severity
  4. `climate`: Global Temperature & Greenhouse Gas Trends
  5. `fleet`: Active Satellite Constellation Health
  6. `overview`: Multi-Domain Consolidated Radar Telemetry
- **Live Stream Simulation**: Auto-updates telemetry series every 3 seconds to emulate active orbital downlinks.
