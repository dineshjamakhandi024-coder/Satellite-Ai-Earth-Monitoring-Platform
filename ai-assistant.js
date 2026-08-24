/**
 * 🤖 SATELLITE AI - INTELLIGENT VOICE, CHAT & REAL-TIME CHART BOT
 * Features:
 * - 💬 Natural Language Conversational Assistant with Aerospace UI
 * - 📊 Interactive Live Telemetry Chart Bot (Forest, Urban, Flood, Climate, Fleet, Overview)
 * - 📈 Dynamic Chart.js multi-type rendering (Bar, Smooth Line, Donut, Radar)
 * - 🛰️ Live Telemetry Simulation Feed with live updating stats
 * - 🎤 Hands-Free Voice Control via Web Speech Recognition API
 * - 🔊 Cute Voice Speech Synthesis with cheerful spoken readouts
 * - 📍 Worldwide Real-Time City Weather & Environmental Telemetry
 * - 🗺️ Navigation & Website Control Controller
 * - 🌐 Dual compatibility with index.html, earth.html, and dashboard modules
 */

const AIAssistant = {
    isOpen: false,
    isListening: false,
    voiceEnabled: true,
    isExpanded: false,
    activeTab: 'chat', // 'chat' | 'charts'
    currentModule: 'forest', // 'forest' | 'urban' | 'flood' | 'climate' | 'fleet' | 'overview'
    currentChartType: 'bar', // 'bar' | 'line' | 'doughnut' | 'radar'
    chartInstance: null,
    isLiveStream: true,
    liveInterval: null,
    recognition: null,
    synth: window.speechSynthesis,
    voices: [],

    // Quick prompt chips
    quickPrompts: [
        "📊 Show Forest Chart",
        "🏙️ Plot Urban Growth",
        "🌊 Flood Risk Analytics",
        "🌡️ Global Climate Trends",
        "🛰️ Track ISS Station",
        "📍 Weather in Tokyo",
        "🚀 Launch 3D Earth",
        "📑 Open Reports Archive",
        "⚡ Track Bengal Cyclone",
        "🍩 Show Land Use Donut Chart"
    ],

    // Telemetry Datasets for Chart Bot
    chartDatasets: {
        forest: {
            title: "AI Forest Canopy & Deforestation Telemetry",
            labels: ['2021', '2022', '2023', '2024', '2025', '2026 (Live)'],
            metrics: {
                m1: { lbl: "Canopy Loss Index", val: "-4.2%", trend: "Improving", class: "positive", icon: "fa-arrow-trend-down" },
                m2: { lbl: "AI Confidence", val: "98.6%", trend: "High Precision", class: "", icon: "fa-shield-check" },
                m3: { lbl: "Monitored Extent", val: "14,280 km²", trend: "Real-time", class: "", icon: "fa-vector-square" },
                m4: { lbl: "Telemetry Sensors", val: "Multispectral MSI", trend: "Sentinel-2", class: "", icon: "fa-satellite" }
            },
            insight: "Vegetation health index (NDVI) across primary target zones indicates stabilization. Afforestation projects gained +8,400 hectares this quarter while illegal deforestation alerts dropped by 12.4%.",
            datasets: [
                {
                    label: 'Canopy Loss (x1000 ha)',
                    data: [420, 395, 360, 310, 275, 240],
                    backgroundColor: 'rgba(239, 68, 68, 0.65)',
                    borderColor: '#ef4444',
                    borderWidth: 2,
                    fill: true
                },
                {
                    label: 'Reforestation (x1000 ha)',
                    data: [110, 140, 190, 230, 290, 340],
                    backgroundColor: 'rgba(16, 185, 129, 0.65)',
                    borderColor: '#10b981',
                    borderWidth: 2,
                    fill: true
                }
            ]
        },
        urban: {
            title: "AI Urban Growth & Built-Up Sprawl Index",
            labels: ['2020', '2021', '2022', '2023', '2024', '2025', '2026 (Live)'],
            metrics: {
                m1: { lbl: "Urban Sprawl Rate", val: "+6.8%/yr", trend: "Accelerating", class: "warning", icon: "fa-arrow-trend-up" },
                m2: { lbl: "AI Confidence", val: "99.1%", trend: "SAR Calibrated", class: "", icon: "fa-shield-check" },
                m3: { lbl: "Monitored Megacities", val: "42 Clusters", trend: "Global", class: "", icon: "fa-city" },
                m4: { lbl: "Telemetry Sensors", val: "SAR Radar + Landsat", trend: "Sentinel-1", class: "", icon: "fa-satellite" }
            },
            insight: "High-density concrete expansion identified along the eastern corridor. Satellite radar backscatter indicates +340 sq km of new industrial infrastructure with green cover shrinking by 3.1%.",
            datasets: [
                {
                    label: 'Built-up Impervious Area (km²)',
                    data: [1240, 1480, 1750, 2100, 2490, 2850, 3120],
                    backgroundColor: 'rgba(0, 217, 255, 0.65)',
                    borderColor: '#00d9ff',
                    borderWidth: 2,
                    fill: true
                },
                {
                    label: 'Green Buffer Zone (km²)',
                    data: [820, 790, 750, 710, 680, 640, 620],
                    backgroundColor: 'rgba(168, 85, 247, 0.65)',
                    borderColor: '#a855f7',
                    borderWidth: 2,
                    fill: true
                }
            ]
        },
        flood: {
            title: "AI Hydrological Inundation & Flood Risk Matrix",
            labels: ['Jan', 'Mar', 'May', 'Jul', 'Sep', 'Nov', 'Live (Aug)'],
            metrics: {
                m1: { lbl: "Flood Alert Level", val: "Moderate", trend: "Runoff Peaked", class: "warning", icon: "fa-water" },
                m2: { lbl: "AI Confidence", val: "97.8%", trend: "Dual-Pol SAR", class: "", icon: "fa-shield-check" },
                m3: { lbl: "Inundated Area", val: "1,420 km²", trend: "-18% in 48h", class: "positive", icon: "fa-arrow-trend-down" },
                m4: { lbl: "Telemetry Sensors", val: "C-Band SAR Radar", trend: "Sentinel-1", class: "", icon: "fa-satellite" }
            },
            insight: "Monsoon precipitation runoff in Brahmaputra and Ganges basins has peaked. Inundation extent decreased by 18% over the past 48 hours; high-risk zones remain alert for downstream surges.",
            datasets: [
                {
                    label: 'Inundated Terrain (sq km)',
                    data: [340, 480, 1250, 3800, 2100, 890, 1420],
                    backgroundColor: 'rgba(59, 130, 246, 0.65)',
                    borderColor: '#3b82f6',
                    borderWidth: 2,
                    fill: true
                },
                {
                    label: 'Basin Runoff Water Level (m)',
                    data: [42, 51, 78, 124, 96, 62, 75],
                    backgroundColor: 'rgba(6, 182, 212, 0.65)',
                    borderColor: '#06b6d4',
                    borderWidth: 2,
                    fill: true
                }
            ]
        },
        climate: {
            title: "AI Global Climate & Thermal Variance Anomalies",
            labels: ['2000', '2005', '2010', '2015', '2020', '2024', '2026 (Live)'],
            metrics: {
                m1: { lbl: "Temp Anomaly", val: "+1.24°C", trend: "Above Normal", class: "danger", icon: "fa-temperature-high" },
                m2: { lbl: "Atmospheric CO2", val: "427 ppm", trend: "High Level", class: "danger", icon: "fa-smog" },
                m3: { lbl: "Arctic Sea Ice", val: "3.9 M km²", trend: "Critical Low", class: "danger", icon: "fa-snowflake" },
                m4: { lbl: "Telemetry Sensors", val: "NOAA GOES + MODIS", trend: "Thermal IR", class: "", icon: "fa-satellite" }
            },
            insight: "Thermal IR sensors detect intense heat dome anomalies across Southern Europe and Central Asia. Ocean surface thermal variance is elevated by +0.8°C with accelerated glacier melt observed.",
            datasets: [
                {
                    label: 'Temp Variance (°C x10)',
                    data: [3.2, 4.8, 6.4, 8.7, 10.2, 11.8, 12.4],
                    backgroundColor: 'rgba(239, 68, 68, 0.65)',
                    borderColor: '#ef4444',
                    borderWidth: 2,
                    fill: true
                },
                {
                    label: 'Atmospheric CO2 (ppm/10)',
                    data: [36.9, 37.9, 38.9, 40.1, 41.4, 42.3, 42.7],
                    backgroundColor: 'rgba(245, 158, 11, 0.65)',
                    borderColor: '#f59e0b',
                    borderWidth: 2,
                    fill: true
                }
            ]
        },
        fleet: {
            title: "AI Satellite Fleet Telemetry & Payload Health",
            labels: ['ISS Station', 'Sentinel-2A', 'Sentinel-2B', 'Landsat-9', 'Terra MODIS', 'GOES-16', 'Starlink Link'],
            metrics: {
                m1: { lbl: "Constellation Status", val: "18 Birds", trend: "All Operational", class: "positive", icon: "fa-check-circle" },
                m2: { lbl: "Telemetry Health", val: "98.7%", trend: "Nominal", class: "positive", icon: "fa-heart-pulse" },
                m3: { lbl: "Daily Downlink", val: "1.48 TB", trend: "Continuous", class: "", icon: "fa-download" },
                m4: { lbl: "Payload Sensors", val: "LiDAR + SAR + IR", trend: "Synchronized", class: "", icon: "fa-tower-broadcast" }
            },
            insight: "All 18 synchronized orbital payloads report nominal operating conditions. ISS low-earth orbit path scheduled for ground station uplink in 14 minutes with zero telemetry packet loss.",
            datasets: [
                {
                    label: 'Payload Health (%)',
                    data: [99.2, 98.4, 99.8, 97.5, 94.2, 98.9, 99.6],
                    backgroundColor: 'rgba(16, 185, 129, 0.65)',
                    borderColor: '#10b981',
                    borderWidth: 2,
                    fill: true
                },
                {
                    label: 'Downlink Speed (Gbps x10)',
                    data: [105, 82, 84, 65, 42, 120, 158],
                    backgroundColor: 'rgba(0, 217, 255, 0.65)',
                    borderColor: '#00d9ff',
                    borderWidth: 2,
                    fill: true
                }
            ]
        },
        overview: {
            title: "AI Global Composite Planetary Matrix",
            labels: ['Forest Canopy', 'Urban Balance', 'Flood Shield', 'Climate Safety', 'Sensor Health', 'Disaster Action'],
            metrics: {
                m1: { lbl: "Global Health Score", val: "82.8/100", trend: "Balanced", class: "positive", icon: "fa-earth-americas" },
                m2: { lbl: "AI Precision Score", val: "99.2%", trend: "Ensemble AI", class: "", icon: "fa-microchip" },
                m3: { lbl: "Global Coverage", val: "195 Countries", trend: "100% Monitored", class: "", icon: "fa-globe" },
                m4: { lbl: "Sensor Mesh", val: "18 Synchronous", trend: "Active Constellation", class: "", icon: "fa-satellite" }
            },
            insight: "Composite planetary health matrix balances environmental indicators. Strongest performance in Forest Monitoring and Sensor Telemetry; Climate Safety requires proactive mitigation.",
            datasets: [
                {
                    label: 'Current Planetary Score (%)',
                    data: [84, 76, 88, 62, 96, 91],
                    backgroundColor: 'rgba(0, 217, 255, 0.45)',
                    borderColor: '#00d9ff',
                    borderWidth: 2,
                    fill: true
                },
                {
                    label: 'Global Benchmark Goal (%)',
                    data: [80, 70, 85, 75, 90, 85],
                    backgroundColor: 'rgba(168, 85, 247, 0.35)',
                    borderColor: '#a855f7',
                    borderWidth: 2,
                    fill: true
                }
            ]
        }
    },

    init() {
        this.ensureDOMStructure();
        this.setupSpeechRecognition();
        this.setupVoices();
        this.renderQuickChips();
        this.bindEvents();
        this.initDraggable();
        this.startLiveTelemetrySimulator();
    },

    ensureDOMStructure() {
        // 1. Auto-inject ai-assistant.css if missing
        if (!document.querySelector('link[href*="ai-assistant.css"]')) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = 'ai-assistant.css';
            document.head.appendChild(link);
        }

        // 2. Ensure Chart.js is available
        if (!window.Chart && !document.querySelector('script[src*="chart.js"]')) {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
            document.head.appendChild(script);
        }

        let drawer = document.getElementById('aiChatDrawer');
        let launcher = document.getElementById('aiChatLauncher') || document.querySelector('.floating-ai-trigger') || document.querySelector('.ai-chat-launcher');
        
        if (!drawer) {
            let wrapper = document.querySelector('.ai-assistant-wrapper');
            if (!wrapper) {
                wrapper = document.createElement('div');
                wrapper.className = 'ai-assistant-wrapper';
                document.body.appendChild(wrapper);
            }

            if (!launcher) {
                const btn = document.createElement('button');
                btn.className = 'ai-button floating-ai-trigger';
                btn.id = 'aiChatLauncher';
                btn.onclick = () => this.open();
                btn.title = 'Open Satellite AI & Chart Bot (Drag to move)';
                btn.innerHTML = `
                    <div class="ai-trigger-pulse"></div>
                    <div class="ai-trigger-icon">
                        <i class="fa-solid fa-robot"></i>
                    </div>
                    <span class="ai-trigger-text">AI & Charts</span>
                `;
                wrapper.appendChild(btn);
            }

            const drawerEl = document.createElement('div');
            drawerEl.className = 'ai-chat-drawer';
            drawerEl.id = 'aiChatDrawer';
            drawerEl.style.display = 'none';
            drawerEl.innerHTML = `
                <div class="ai-chat-header">
                    <div class="ai-drag-handle-bar" title="Drag to reposition window (Double-click to reset)">
                        <span class="drag-pill"></span>
                    </div>
                    <div class="ai-header-brand">
                        <div class="ai-bot-avatar">
                            <i class="fa-solid fa-satellite-dish"></i>
                            <span class="avatar-status-dot"></span>
                        </div>
                        <div class="ai-header-info">
                            <div class="ai-title-row">
                                <h3>Satellite AI Assistant</h3>
                                <span class="ai-badge-live"><i class="fa-solid fa-circle fa-beat"></i> Online</span>
                            </div>
                            <small id="aiVoiceStatus">Natural Language & Live Chart Bot</small>
                        </div>
                    </div>
                    <div class="ai-view-tabs">
                        <button type="button" class="ai-tab-btn active" id="tabBtnChat" onclick="AIAssistant.switchTab('chat')">
                            <i class="fa-solid fa-comments"></i>
                            <span>Chat</span>
                        </button>
                        <button type="button" class="ai-tab-btn" id="tabBtnCharts" onclick="AIAssistant.switchTab('charts')">
                            <i class="fa-solid fa-chart-line"></i>
                            <span>Chart Bot</span>
                        </button>
                    </div>
                    <div class="ai-header-tools">
                        <button type="button" class="btn-ai-tool btn-ai-mic" onclick="AIAssistant.toggleVoiceRecognition()" title="Voice Command Mic">
                            <i class="fa-solid fa-microphone"></i>
                        </button>
                        <button type="button" class="btn-ai-tool" id="aiVoiceToggleBtn" onclick="AIAssistant.toggleVoiceFeedback()" title="Toggle Voice Audio Feedback">
                            <i class="fa-solid fa-volume-high"></i>
                        </button>
                        <button type="button" class="btn-ai-tool" id="aiResetPosBtn" onclick="AIAssistant.resetPosition()" title="Reset Position to Default">
                            <i class="fa-solid fa-arrows-rotate"></i>
                        </button>
                        <button type="button" class="btn-ai-tool" id="aiExpandBtn" onclick="AIAssistant.toggleExpand()" title="Toggle Expand View">
                            <i class="fa-solid fa-expand"></i>
                        </button>
                        <button type="button" class="btn-ai-tool close" onclick="closeAI()" title="Close Assistant">
                            <i class="fa-solid fa-xmark"></i>
                        </button>
                    </div>
                </div>
                <div class="ai-audio-waveform" id="aiAudioWaveform" style="display:none;">
                    <div class="wave-bar"></div>
                    <div class="wave-bar"></div>
                    <div class="wave-bar"></div>
                    <div class="wave-bar"></div>
                    <div class="wave-bar"></div>
                    <span>Listening for voice command...</span>
                </div>
                <div class="ai-tab-content active" id="aiTabChat">
                    <div class="ai-chat-messages" id="aiChatMessages">
                        <div class="chat-msg assistant">
                            <div class="msg-avatar"><i class="fa-solid fa-wand-magic-sparkles"></i></div>
                            <div class="msg-bubble">
                                <div class="msg-text">
                                    ✨ Hello! I'm your <strong>Satellite AI Assistant & Chart Bot</strong>. 🛰️
                                    <p style="margin:6px 0 6px 0;">I can generate interactive telemetry charts, answer satellite observation questions, or control this website:</p>
                                    <div class="welcome-guide-grid">
                                        <div class="guide-item" onclick="AIAssistant.handleQuickChip('📊 Show Forest Chart')">
                                            <i class="fa-solid fa-tree"></i> <strong>Chart Bot</strong>: "Show forest chart" / "Plot urban growth"
                                        </div>
                                        <div class="guide-item" onclick="AIAssistant.handleQuickChip('🛰️ Track ISS Station')">
                                            <i class="fa-solid fa-satellite"></i> <strong>Orbit Telemetry</strong>: "Track ISS" / "Sentinel-2 specs"
                                        </div>
                                        <div class="guide-item" onclick="AIAssistant.handleQuickChip('📍 Weather in Tokyo')">
                                            <i class="fa-solid fa-cloud-sun"></i> <strong>Live Weather</strong>: "Weather in Tokyo / London / Paris"
                                        </div>
                                        <div class="guide-item" onclick="AIAssistant.handleQuickChip('🚀 Launch 3D Earth')">
                                            <i class="fa-solid fa-globe"></i> <strong>Navigation</strong>: "Open 3D Earth" / "Open Reports"
                                        </div>
                                    </div>
                                </div>
                                <span class="msg-time">Ready</span>
                            </div>
                        </div>
                    </div>
                    <div class="ai-quick-chips-wrapper">
                        <div class="ai-quick-chips" id="aiQuickChips"></div>
                    </div>
                    <form class="ai-chat-input-bar" id="aiChatForm">
                        <button type="button" class="btn-ai-mic" onclick="AIAssistant.toggleVoiceRecognition()" title="Hold/Click to Speak">
                            <i class="fa-solid fa-microphone"></i>
                        </button>
                        <input type="text" id="aiChatInput" placeholder="Ask AI or say 'Show forest chart', 'Plot urban growth'..." autocomplete="off">
                        <button type="submit" class="btn-ai-send" title="Send Query">
                            <i class="fa-solid fa-paper-plane"></i>
                        </button>
                    </form>
                </div>
                <div class="ai-tab-content" id="aiTabCharts">
                    <div class="chartbot-modules-nav">
                        <button type="button" class="module-tab-btn active" data-module="forest" onclick="AIAssistant.selectChartModule('forest')">
                            <i class="fa-solid fa-tree"></i> Forest
                        </button>
                        <button type="button" class="module-tab-btn" data-module="urban" onclick="AIAssistant.selectChartModule('urban')">
                            <i class="fa-solid fa-city"></i> Urban
                        </button>
                        <button type="button" class="module-tab-btn" data-module="flood" onclick="AIAssistant.selectChartModule('flood')">
                            <i class="fa-solid fa-water"></i> Flood
                        </button>
                        <button type="button" class="module-tab-btn" data-module="climate" onclick="AIAssistant.selectChartModule('climate')">
                            <i class="fa-solid fa-temperature-high"></i> Climate
                        </button>
                        <button type="button" class="module-tab-btn" data-module="fleet" onclick="AIAssistant.selectChartModule('fleet')">
                            <i class="fa-solid fa-satellite"></i> Fleet
                        </button>
                        <button type="button" class="module-tab-btn" data-module="overview" onclick="AIAssistant.selectChartModule('overview')">
                            <i class="fa-solid fa-chart-pie"></i> Overview
                        </button>
                    </div>
                    <div class="chartbot-toolbar">
                        <div class="chart-type-selector">
                            <button type="button" class="chart-type-btn active" data-type="bar" onclick="AIAssistant.changeChartType('bar')" title="Bar Chart">
                                <i class="fa-solid fa-chart-column"></i> Bar
                            </button>
                            <button type="button" class="chart-type-btn" data-type="line" onclick="AIAssistant.changeChartType('line')" title="Line Chart">
                                <i class="fa-solid fa-chart-line"></i> Line
                            </button>
                            <button type="button" class="chart-type-btn" data-type="doughnut" onclick="AIAssistant.changeChartType('doughnut')" title="Donut Chart">
                                <i class="fa-solid fa-chart-pie"></i> Donut
                            </button>
                            <button type="button" class="chart-type-btn" data-type="radar" onclick="AIAssistant.changeChartType('radar')" title="Radar Chart">
                                <i class="fa-solid fa-circle-nodes"></i> Radar
                            </button>
                        </div>
                        <div class="chart-actions">
                            <button type="button" class="btn-live-stream active" id="btnLiveStream" onclick="AIAssistant.toggleLiveStream()" title="Toggle Live Telemetry Stream">
                                <span class="live-dot-pulse"></span>
                                <span id="liveStreamText">LIVE TELEMETRY</span>
                            </button>
                            <button type="button" class="btn-chart-action" onclick="AIAssistant.exportChartSnapshot()" title="Save Chart Image">
                                <i class="fa-solid fa-camera"></i>
                            </button>
                        </div>
                    </div>
                    <div class="chartbot-metrics-grid">
                        <div class="metric-card">
                            <span class="metric-lbl" id="metric1Label">Canopy Loss Index</span>
                            <strong class="metric-val" id="metric1Value">-4.2%</strong>
                            <small class="metric-trend positive" id="metric1Trend"><i class="fa-solid fa-arrow-trend-down"></i> Improving</small>
                        </div>
                        <div class="metric-card">
                            <span class="metric-lbl" id="metric2Label">AI Confidence</span>
                            <strong class="metric-val" id="metric2Value">98.6%</strong>
                            <small class="metric-trend" id="metric2Trend"><i class="fa-solid fa-shield-check"></i> High Precision</small>
                        </div>
                        <div class="metric-card">
                            <span class="metric-lbl" id="metric3Label">Monitored Extent</span>
                            <strong class="metric-val" id="metric3Value">14,280 km²</strong>
                            <small class="metric-trend" id="metric3Trend"><i class="fa-solid fa-vector-square"></i> Real-time</small>
                        </div>
                        <div class="metric-card">
                            <span class="metric-lbl" id="metric4Label">Telemetry Sensors</span>
                            <strong class="metric-val" id="metric4Value">Multispectral + SAR</strong>
                            <small class="metric-trend" id="metric4Trend"><i class="fa-solid fa-tower-broadcast"></i> Synchronized</small>
                        </div>
                    </div>
                    <div class="chart-canvas-container">
                        <canvas id="aiChartCanvas"></canvas>
                    </div>
                    <div class="chartbot-insight-box">
                        <div class="insight-header">
                            <div class="insight-title">
                                <i class="fa-solid fa-sparkles"></i>
                                <strong id="chartInsightTitle">AI Forest Canopy Analysis & Anomaly Report</strong>
                            </div>
                            <button type="button" class="btn-ask-ai" onclick="AIAssistant.askAboutCurrentChart()">
                                <i class="fa-solid fa-comments"></i> Ask AI
                            </button>
                        </div>
                        <p id="chartInsightBody">
                            Vegetation health index (NDVI) across primary target zones indicates stabilization. Afforestation projects gained +8,400 hectares this quarter while illegal deforestation alerts dropped by 12.4%.
                        </p>
                    </div>
                </div>
            `;
            wrapper.appendChild(drawerEl);
        } else {
            // Drawer already in HTML: inject drag bar & reset button if absent
            const header = drawer.querySelector('.ai-chat-header');
            if (header) {
                if (!header.querySelector('.ai-drag-handle-bar')) {
                    const dragBar = document.createElement('div');
                    dragBar.className = 'ai-drag-handle-bar';
                    dragBar.title = 'Drag to reposition window (Double-click to reset)';
                    dragBar.innerHTML = '<span class="drag-pill"></span>';
                    header.insertBefore(dragBar, header.firstChild);
                }
                const tools = header.querySelector('.ai-header-tools');
                if (tools && !tools.querySelector('#aiResetPosBtn')) {
                    const resetBtn = document.createElement('button');
                    resetBtn.type = 'button';
                    resetBtn.className = 'btn-ai-tool';
                    resetBtn.id = 'aiResetPosBtn';
                    resetBtn.onclick = () => this.resetPosition();
                    resetBtn.title = 'Reset Position to Default';
                    resetBtn.innerHTML = '<i class="fa-solid fa-arrows-rotate"></i>';
                    const closeBtn = tools.querySelector('.close');
                    if (closeBtn) {
                        tools.insertBefore(resetBtn, closeBtn);
                    } else {
                        tools.appendChild(resetBtn);
                    }
                }
            }
        }
    },

    initDraggable() {
        const launcher = document.getElementById('aiChatLauncher') || document.querySelector('.floating-ai-trigger') || document.querySelector('.ai-chat-launcher');
        const wrapper = document.querySelector('.ai-assistant-wrapper');
        const drawer = document.getElementById('aiChatDrawer');

        // Restore saved positions from localStorage
        this.restorePositions();

        // 1. DRAGGABLE FLOATING TRIGGER BUTTON (Mobile & Window)
        if (launcher) {
            let startX = 0, startY = 0;
            let initialLeft = 0, initialTop = 0;
            let isDragging = false;
            let hasMoved = false;
            const dragTarget = wrapper || launcher;

            const onPointerDown = (e) => {
                if (e.button !== undefined && e.button !== 0) return;

                const clientX = e.clientX ?? (e.touches && e.touches[0] ? e.touches[0].clientX : 0);
                const clientY = e.clientY ?? (e.touches && e.touches[0] ? e.touches[0].clientY : 0);
                
                startX = clientX;
                startY = clientY;
                
                const rect = dragTarget.getBoundingClientRect();
                initialLeft = rect.left;
                initialTop = rect.top;
                
                isDragging = true;
                hasMoved = false;

                if (e.target && e.target.setPointerCapture && e.pointerId !== undefined) {
                    try { e.target.setPointerCapture(e.pointerId); } catch (_) {}
                }
            };

            const onPointerMove = (e) => {
                if (!isDragging) return;

                const clientX = e.clientX ?? (e.touches && e.touches[0] ? e.touches[0].clientX : 0);
                const clientY = e.clientY ?? (e.touches && e.touches[0] ? e.touches[0].clientY : 0);
                
                const dx = clientX - startX;
                const dy = clientY - startY;

                if (!hasMoved && Math.hypot(dx, dy) > 5) {
                    hasMoved = true;
                    dragTarget.classList.add('is-dragging');
                    launcher.classList.add('is-dragging');
                    document.body.classList.add('ai-dragging-active');
                }

                if (hasMoved) {
                    if (e.cancelable) e.preventDefault();
                    let newLeft = initialLeft + dx;
                    let newTop = initialTop + dy;

                    const width = dragTarget.offsetWidth || 68;
                    const height = dragTarget.offsetHeight || 68;

                    // Clamping within viewport with safe margin
                    const minLeft = 8;
                    const maxLeft = Math.max(8, window.innerWidth - width - 8);
                    const minTop = 8;
                    const maxTop = Math.max(8, window.innerHeight - height - 8);

                    newLeft = Math.max(minLeft, Math.min(maxLeft, newLeft));
                    newTop = Math.max(minTop, Math.min(maxTop, newTop));

                    dragTarget.style.left = newLeft + 'px';
                    dragTarget.style.top = newTop + 'px';
                    dragTarget.style.right = 'auto';
                    dragTarget.style.bottom = 'auto';
                    dragTarget.style.position = 'fixed';
                }
            };

            const onPointerUp = (e) => {
                if (!isDragging) return;
                isDragging = false;
                dragTarget.classList.remove('is-dragging');
                launcher.classList.remove('is-dragging');
                document.body.classList.remove('ai-dragging-active');

                if (e.target && e.target.releasePointerCapture && e.pointerId !== undefined) {
                    try { e.target.releasePointerCapture(e.pointerId); } catch (_) {}
                }

                if (hasMoved) {
                    this.suppressClick = true;
                    setTimeout(() => { this.suppressClick = false; }, 300);

                    const rect = dragTarget.getBoundingClientRect();
                    const pos = { left: rect.left, top: rect.top };
                    try {
                        localStorage.setItem('satellite_ai_launcher_pos', JSON.stringify(pos));
                    } catch (_) {}

                    this.adjustDrawerPositionToLauncher(pos);
                }
            };

            launcher.addEventListener('pointerdown', onPointerDown, { passive: false });
            window.addEventListener('pointermove', onPointerMove, { passive: false });
            window.addEventListener('pointerup', onPointerUp);
            window.addEventListener('pointercancel', onPointerUp);

            launcher.addEventListener('touchstart', onPointerDown, { passive: true });
            window.addEventListener('touchmove', onPointerMove, { passive: false });
            window.addEventListener('touchend', onPointerUp);

            launcher.addEventListener('click', (e) => {
                if (this.suppressClick) {
                    e.preventDefault();
                    e.stopPropagation();
                    e.stopImmediatePropagation();
                }
            }, true);
        }

        // 2. DRAGGABLE CHAT DRAWER WINDOW (Mobile & Window Header Drag)
        if (drawer) {
            const header = drawer.querySelector('.ai-chat-header');
            const dragBar = drawer.querySelector('.ai-drag-handle-bar');
            const handle = dragBar || header;

            if (handle) {
                let startX = 0, startY = 0;
                let initialLeft = 0, initialTop = 0;
                let isDraggingDrawer = false;
                let hasMovedDrawer = false;

                const onDrawerPointerDown = (e) => {
                    if (e.target.closest('button, input, a, select, textarea, .ai-view-tabs, .ai-header-tools')) {
                        return;
                    }
                    if (e.button !== undefined && e.button !== 0) return;

                    const clientX = e.clientX ?? (e.touches && e.touches[0] ? e.touches[0].clientX : 0);
                    const clientY = e.clientY ?? (e.touches && e.touches[0] ? e.touches[0].clientY : 0);

                    startX = clientX;
                    startY = clientY;

                    const rect = drawer.getBoundingClientRect();
                    initialLeft = rect.left;
                    initialTop = rect.top;

                    isDraggingDrawer = true;
                    hasMovedDrawer = false;

                    if (e.target && e.target.setPointerCapture && e.pointerId !== undefined) {
                        try { e.target.setPointerCapture(e.pointerId); } catch (_) {}
                    }
                };

                const onDrawerPointerMove = (e) => {
                    if (!isDraggingDrawer) return;

                    const clientX = e.clientX ?? (e.touches && e.touches[0] ? e.touches[0].clientX : 0);
                    const clientY = e.clientY ?? (e.touches && e.touches[0] ? e.touches[0].clientY : 0);

                    const dx = clientX - startX;
                    const dy = clientY - startY;

                    if (!hasMovedDrawer && Math.hypot(dx, dy) > 5) {
                        hasMovedDrawer = true;
                        drawer.classList.add('is-dragging');
                        document.body.classList.add('ai-dragging-active');
                    }

                    if (hasMovedDrawer) {
                        if (e.cancelable) e.preventDefault();
                        let newLeft = initialLeft + dx;
                        let newTop = initialTop + dy;

                        const width = drawer.offsetWidth || 480;
                        const height = drawer.offsetHeight || 600;

                        const minLeft = 8;
                        const maxLeft = Math.max(8, window.innerWidth - width - 8);
                        const minTop = 8;
                        const maxTop = Math.max(8, window.innerHeight - height - 8);

                        newLeft = Math.max(minLeft, Math.min(maxLeft, newLeft));
                        newTop = Math.max(minTop, Math.min(maxTop, newTop));

                        drawer.style.left = newLeft + 'px';
                        drawer.style.top = newTop + 'px';
                        drawer.style.right = 'auto';
                        drawer.style.bottom = 'auto';
                        drawer.style.position = 'fixed';
                    }
                };

                const onDrawerPointerUp = (e) => {
                    if (!isDraggingDrawer) return;
                    isDraggingDrawer = false;
                    drawer.classList.remove('is-dragging');
                    document.body.classList.remove('ai-dragging-active');

                    if (e.target && e.target.releasePointerCapture && e.pointerId !== undefined) {
                        try { e.target.releasePointerCapture(e.pointerId); } catch (_) {}
                    }

                    if (hasMovedDrawer) {
                        const rect = drawer.getBoundingClientRect();
                        const pos = { left: rect.left, top: rect.top };
                        try {
                            localStorage.setItem('satellite_ai_drawer_pos', JSON.stringify(pos));
                        } catch (_) {}
                    }
                };

                handle.addEventListener('pointerdown', onDrawerPointerDown, { passive: false });
                window.addEventListener('pointermove', onDrawerPointerMove, { passive: false });
                window.addEventListener('pointerup', onDrawerPointerUp);
                window.addEventListener('pointercancel', onDrawerPointerUp);

                handle.addEventListener('touchstart', onDrawerPointerDown, { passive: true });
                window.addEventListener('touchmove', onDrawerPointerMove, { passive: false });
                window.addEventListener('touchend', onDrawerPointerUp);

                if (header) {
                    header.addEventListener('dblclick', (e) => {
                        if (!e.target.closest('button, input, a, select, textarea, .ai-view-tabs, .ai-header-tools')) {
                            this.resetPosition();
                        }
                    });
                }
            }
        }

        // 3. RESPONSIVE RESIZE AUTO-CLAMP
        window.addEventListener('resize', () => {
            this.clampToViewport();
        });
    },

    restorePositions() {
        const launcher = document.getElementById('aiChatLauncher') || document.querySelector('.floating-ai-trigger') || document.querySelector('.ai-chat-launcher');
        const wrapper = document.querySelector('.ai-assistant-wrapper');
        const drawer = document.getElementById('aiChatDrawer');
        const dragTarget = wrapper || launcher;

        try {
            const rawBtn = localStorage.getItem('satellite_ai_launcher_pos');
            if (rawBtn && dragTarget) {
                const pos = JSON.parse(rawBtn);
                if (typeof pos.left === 'number' && typeof pos.top === 'number') {
                    const width = dragTarget.offsetWidth || 68;
                    const height = dragTarget.offsetHeight || 68;
                    const left = Math.max(8, Math.min(window.innerWidth - width - 8, pos.left));
                    const top = Math.max(8, Math.min(window.innerHeight - height - 8, pos.top));

                    dragTarget.style.left = left + 'px';
                    dragTarget.style.top = top + 'px';
                    dragTarget.style.right = 'auto';
                    dragTarget.style.bottom = 'auto';
                    dragTarget.style.position = 'fixed';
                }
            }
        } catch (_) {}

        try {
            const rawDrawer = localStorage.getItem('satellite_ai_drawer_pos');
            if (rawDrawer && drawer) {
                const pos = JSON.parse(rawDrawer);
                if (typeof pos.left === 'number' && typeof pos.top === 'number') {
                    const width = drawer.offsetWidth || 480;
                    const height = drawer.offsetHeight || 600;
                    const left = Math.max(8, Math.min(window.innerWidth - width - 8, pos.left));
                    const top = Math.max(8, Math.min(window.innerHeight - height - 8, pos.top));

                    drawer.style.left = left + 'px';
                    drawer.style.top = top + 'px';
                    drawer.style.right = 'auto';
                    drawer.style.bottom = 'auto';
                    drawer.style.position = 'fixed';
                }
            }
        } catch (_) {}
    },

    adjustDrawerPositionToLauncher(launcherPos) {
        const drawer = document.getElementById('aiChatDrawer');
        const launcher = document.getElementById('aiChatLauncher') || document.querySelector('.floating-ai-trigger') || document.querySelector('.ai-chat-launcher');
        if (!drawer || !launcher) return;

        // If user already custom-dragged drawer, keep their custom placement
        try {
            if (localStorage.getItem('satellite_ai_drawer_pos')) return;
        } catch (_) {}

        const launcherWidth = launcher.offsetWidth || 68;
        const launcherHeight = launcher.offsetHeight || 68;
        const drawerWidth = Math.min(drawer.offsetWidth || 480, window.innerWidth - 16);
        const drawerHeight = Math.min(drawer.offsetHeight || 620, window.innerHeight - 80);

        let left = launcherPos.left;
        let top = launcherPos.top - drawerHeight - 16;

        if (launcherPos.left > window.innerWidth / 2) {
            left = launcherPos.left + launcherWidth - drawerWidth;
        }

        if (top < 10) {
            top = launcherPos.top + launcherHeight + 16;
        }

        left = Math.max(8, Math.min(window.innerWidth - drawerWidth - 8, left));
        top = Math.max(8, Math.min(window.innerHeight - drawerHeight - 8, top));

        drawer.style.left = left + 'px';
        drawer.style.top = top + 'px';
        drawer.style.right = 'auto';
        drawer.style.bottom = 'auto';
        drawer.style.position = 'fixed';
    },

    clampToViewport() {
        const launcher = document.getElementById('aiChatLauncher') || document.querySelector('.floating-ai-trigger') || document.querySelector('.ai-chat-launcher');
        const wrapper = document.querySelector('.ai-assistant-wrapper');
        const drawer = document.getElementById('aiChatDrawer');
        const dragTarget = wrapper || launcher;

        if (dragTarget && dragTarget.style.left) {
            const width = dragTarget.offsetWidth || 68;
            const height = dragTarget.offsetHeight || 68;
            const curLeft = parseInt(dragTarget.style.left, 10);
            const curTop = parseInt(dragTarget.style.top, 10);

            if (!isNaN(curLeft) && !isNaN(curTop)) {
                const left = Math.max(8, Math.min(window.innerWidth - width - 8, curLeft));
                const top = Math.max(8, Math.min(window.innerHeight - height - 8, curTop));
                dragTarget.style.left = left + 'px';
                dragTarget.style.top = top + 'px';
            }
        }

        if (drawer && drawer.style.left) {
            const width = drawer.offsetWidth || 480;
            const height = drawer.offsetHeight || 600;
            const curLeft = parseInt(drawer.style.left, 10);
            const curTop = parseInt(drawer.style.top, 10);

            if (!isNaN(curLeft) && !isNaN(curTop)) {
                const left = Math.max(8, Math.min(window.innerWidth - width - 8, curLeft));
                const top = Math.max(8, Math.min(window.innerHeight - height - 8, curTop));
                drawer.style.left = left + 'px';
                drawer.style.top = top + 'px';
            }
        }
    },

    resetPosition() {
        try {
            localStorage.removeItem('satellite_ai_launcher_pos');
            localStorage.removeItem('satellite_ai_drawer_pos');
        } catch (_) {}

        const launcher = document.getElementById('aiChatLauncher') || document.querySelector('.floating-ai-trigger') || document.querySelector('.ai-chat-launcher');
        const wrapper = document.querySelector('.ai-assistant-wrapper');
        const drawer = document.getElementById('aiChatDrawer');

        const targets = [wrapper, launcher, drawer].filter(Boolean);
        targets.forEach(el => {
            el.style.left = '';
            el.style.top = '';
            el.style.right = '';
            el.style.bottom = '';
            el.style.position = '';
            el.classList.remove('is-dragging');
        });

        const resetBtn = document.getElementById('aiResetPosBtn');
        if (resetBtn) {
            resetBtn.style.transition = 'transform 0.4s ease';
            resetBtn.style.transform = 'rotate(360deg)';
            setTimeout(() => { 
                resetBtn.style.transform = ''; 
                setTimeout(() => { resetBtn.style.transition = ''; }, 200);
            }, 400);
        }
    },

    setupVoices() {
        if (!window.speechSynthesis) return;
        const loadVoices = () => {
            this.voices = window.speechSynthesis.getVoices();
        };
        loadVoices();
        if (window.speechSynthesis.onvoiceschanged !== undefined) {
            window.speechSynthesis.onvoiceschanged = loadVoices;
        }
    },

    setupSpeechRecognition() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            console.warn('Speech Recognition not supported on this browser.');
            return;
        }

        this.recognition = new SpeechRecognition();
        this.recognition.continuous = false;
        this.recognition.interimResults = false;
        this.recognition.lang = 'en-US';

        this.recognition.onstart = () => {
            this.isListening = true;
            this.updateVoiceUI(true);
            this.showWaveform(true);
        };

        this.recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            const input = document.getElementById('aiChatInput');
            if (input) input.value = transcript;
            this.handleUserQuery(transcript);
        };

        this.recognition.onerror = (event) => {
            console.warn('Voice recognition error:', event.error);
            this.isListening = false;
            this.updateVoiceUI(false);
            this.showWaveform(false);
        };

        this.recognition.onend = () => {
            this.isListening = false;
            this.updateVoiceUI(false);
            this.showWaveform(false);
        };
    },

    toggleVoiceRecognition() {
        if (!this.recognition) {
            this.appendMessage('assistant', '⚠️ Speech recognition is not supported in this browser. Please type your query in the input box.');
            return;
        }

        if (this.isListening) {
            this.recognition.stop();
        } else {
            try {
                this.recognition.start();
            } catch (e) {
                console.warn('Recognition start error:', e);
            }
        }
    },

    updateVoiceUI(active) {
        const micBtns = document.querySelectorAll('.btn-ai-mic, .mic-btn');
        micBtns.forEach(btn => {
            btn.classList.toggle('listening', active);
            if (active) {
                btn.innerHTML = '<i class="fa-solid fa-microphone-lines fa-beat" style="color:#ef4444"></i>';
            } else {
                btn.innerHTML = '<i class="fa-solid fa-microphone"></i>';
            }
        });

        const statusEl = document.getElementById('aiVoiceStatus');
        if (statusEl) {
            statusEl.innerText = active ? 'Listening for voice command...' : 'Natural Language & Live Chart Bot';
            statusEl.style.color = active ? '#ef4444' : '#94a3b8';
        }
    },

    showWaveform(show) {
        const wave = document.getElementById('aiAudioWaveform');
        if (wave) {
            wave.style.display = show ? 'flex' : 'none';
        }
    },

    toggleVoiceFeedback() {
        this.voiceEnabled = !this.voiceEnabled;
        const btn = document.getElementById('aiVoiceToggleBtn');
        if (btn) {
            btn.innerHTML = this.voiceEnabled 
                ? '<i class="fa-solid fa-volume-high"></i>' 
                : '<i class="fa-solid fa-volume-xmark" style="color:#ef4444"></i>';
            btn.title = this.voiceEnabled ? "Mute Voice Audio" : "Unmute Voice Audio";
        }
        if (!this.voiceEnabled && window.speechSynthesis) {
            window.speechSynthesis.cancel();
        }
    },

    getBestCuteGirlVoice() {
        if (!this.voices || this.voices.length === 0) {
            this.voices = window.speechSynthesis ? window.speechSynthesis.getVoices() : [];
        }

        const femaleNames = [
            'zira', 'samantha', 'jenny', 'aria', 'victoria', 'karen', 'moira', 
            'tessa', 'fiona', 'stephanie', 'allison', 'ava', 'olivia', 'emma', 
            'chloe', 'zoe', 'natasha', 'serena', 'clara', 'eva', 'female', 'girl'
        ];

        const maleBlacklist = [
            'david', 'mark', 'george', 'male', 'man', 'boy', 'guy', 'richard', 
            'james', 'alex', 'fred', 'daniel', 'oliver', 'rishi', 'ravi', 
            'deepak', 'paul', 'tom', 'michael', 'arthur', 'stefan', 'martin'
        ];

        for (const target of femaleNames) {
            const found = this.voices.find(v => {
                const name = v.name.toLowerCase();
                const isMale = maleBlacklist.some(m => name.includes(m));
                return !isMale && name.includes(target) && (v.lang.startsWith('en') || v.lang === '');
            });
            if (found) return found;
        }

        const googleFemale = this.voices.find(v => {
            const name = v.name.toLowerCase();
            const isMale = maleBlacklist.some(m => name.includes(m));
            return !isMale && (name.includes('google') || name.includes('natural')) && v.lang.startsWith('en');
        });
        if (googleFemale) return googleFemale;

        const nonMaleVoice = this.voices.find(v => {
            const name = v.name.toLowerCase();
            return v.lang.startsWith('en') && !maleBlacklist.some(m => name.includes(m));
        });

        return nonMaleVoice || this.voices[0] || null;
    },

    speakResponse(text) {
        if (!this.voiceEnabled || !window.speechSynthesis) return;

        window.speechSynthesis.cancel();

        const cleanText = text.replace(/<[^>]*>?/gm, '').replace(/[^\w\s.,!?-]/gi, ' ');
        const utterance = new SpeechSynthesisUtterance(cleanText);

        utterance.pitch = 1.25;
        utterance.rate = 1.08;
        utterance.volume = 1.0;

        const cuteVoice = this.getBestCuteGirlVoice();
        if (cuteVoice) {
            utterance.voice = cuteVoice;
        }

        window.speechSynthesis.speak(utterance);
    },

    open() {
        this.isOpen = true;
        const panel = document.getElementById('aiChatDrawer') || document.getElementById('aiMessageBox');
        const launcher = document.getElementById('aiChatLauncher') || document.querySelector('.floating-ai-trigger');
        if (panel) {
            panel.classList.add('open');
            panel.classList.add('active');
            panel.classList.add('show');
            panel.style.display = 'flex';

            try {
                const rawBtn = localStorage.getItem('satellite_ai_launcher_pos');
                const rawDrawer = localStorage.getItem('satellite_ai_drawer_pos');
                if (rawBtn && !rawDrawer) {
                    this.adjustDrawerPositionToLauncher(JSON.parse(rawBtn));
                }
            } catch (_) {}

            this.clampToViewport();
        }
        if (launcher) launcher.classList.add('active');

        if (this.activeTab === 'charts') {
            this.renderChart();
        } else {
            const input = document.getElementById('aiChatInput');
            if (input) input.focus();
        }
    },

    close() {
        this.isOpen = false;
        const panel = document.getElementById('aiChatDrawer') || document.getElementById('aiMessageBox');
        const launcher = document.getElementById('aiChatLauncher') || document.querySelector('.floating-ai-trigger');
        if (panel) {
            panel.classList.remove('open');
            panel.classList.remove('active');
            panel.classList.remove('show');
            panel.style.display = 'none';
        }
        if (launcher) launcher.classList.remove('active');
        if (window.speechSynthesis) window.speechSynthesis.cancel();
    },

    toggleChat() {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    },

    toggleExpand() {
        this.isExpanded = !this.isExpanded;
        const panel = document.getElementById('aiChatDrawer');
        const btn = document.getElementById('aiExpandBtn');
        if (panel) panel.classList.toggle('expanded', this.isExpanded);
        if (btn) {
            btn.innerHTML = this.isExpanded ? '<i class="fa-solid fa-compress"></i>' : '<i class="fa-solid fa-expand"></i>';
        }
        if (this.activeTab === 'charts') {
            setTimeout(() => this.renderChart(), 200);
        }
    },

    switchTab(tabName) {
        this.activeTab = tabName;
        const tabChat = document.getElementById('aiTabChat');
        const tabCharts = document.getElementById('aiTabCharts');
        const btnChat = document.getElementById('tabBtnChat');
        const btnCharts = document.getElementById('tabBtnCharts');

        if (tabChat && tabCharts) {
            tabChat.classList.toggle('active', tabName === 'chat');
            tabCharts.classList.toggle('active', tabName === 'charts');
        }
        if (btnChat && btnCharts) {
            btnChat.classList.toggle('active', tabName === 'chat');
            btnCharts.classList.toggle('active', tabName === 'charts');
        }

        if (tabName === 'charts') {
            setTimeout(() => this.renderChart(), 100);
        }
    },

    renderQuickChips() {
        const container = document.getElementById('aiQuickChips');
        if (!container) return;

        container.innerHTML = this.quickPrompts.map(p => `
            <button type="button" class="ai-chip" onclick="AIAssistant.handleQuickChip('${p}')">
                ${p}
            </button>
        `).join('');
    },

    handleQuickChip(chipText) {
        const cleanQuery = chipText.replace(/^[^\w\s]+/, '').trim();
        const input = document.getElementById('aiChatInput');
        if (input) input.value = cleanQuery;
        this.handleUserQuery(cleanQuery);
    },

    bindEvents() {
        const form = document.getElementById('aiChatForm');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                const input = document.getElementById('aiChatInput');
                if (input && input.value.trim()) {
                    const query = input.value.trim();
                    input.value = '';
                    this.handleUserQuery(query);
                }
            });
        }
    },

    appendMessage(sender, contentHtml) {
        const chatBody = document.getElementById('aiChatMessages');
        if (!chatBody) return;

        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const isUser = sender === 'user';

        const msg = document.createElement('div');
        msg.className = `chat-msg ${isUser ? 'user' : 'assistant'}`;
        msg.innerHTML = `
            <div class="msg-avatar">
                <i class="fa-solid ${isUser ? 'fa-user' : 'fa-wand-magic-sparkles'}"></i>
            </div>
            <div class="msg-bubble">
                <div class="msg-text">${contentHtml}</div>
                <span class="msg-time">${time}</span>
            </div>
        `;
        chatBody.appendChild(msg);
        chatBody.scrollTop = chatBody.scrollHeight;
    },

    // ========================================================================
    // CHART BOT ENGINE & VISUALIZATION
    // ========================================================================
    selectChartModule(moduleKey) {
        if (!this.chartDatasets[moduleKey]) return;
        this.currentModule = moduleKey;

        // Update module buttons
        document.querySelectorAll('.module-tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-module') === moduleKey);
        });

        this.updateMetricsUI();
        this.renderChart();
    },

    changeChartType(chartType) {
        this.currentChartType = chartType;

        // Update type buttons
        document.querySelectorAll('.chart-type-btn').forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-type') === chartType);
        });

        this.renderChart();
    },

    updateMetricsUI() {
        const data = this.chartDatasets[this.currentModule];
        if (!data) return;

        // Update metric cards
        const m = data.metrics;
        const updateCard = (num, mData) => {
            const lbl = document.getElementById(`metric${num}Label`);
            const val = document.getElementById(`metric${num}Value`);
            const trend = document.getElementById(`metric${num}Trend`);
            if (lbl) lbl.innerText = mData.lbl;
            if (val) val.innerText = mData.val;
            if (trend) {
                trend.className = `metric-trend ${mData.class || ''}`;
                trend.innerHTML = `<i class="fa-solid ${mData.icon}"></i> ${mData.trend}`;
            }
        };

        updateCard(1, m.m1);
        updateCard(2, m.m2);
        updateCard(3, m.m3);
        updateCard(4, m.m4);

        // Update Insight Box
        const title = document.getElementById('chartInsightTitle');
        const body = document.getElementById('chartInsightBody');
        if (title) title.innerText = data.title;
        if (body) body.innerText = data.insight;
    },

    renderChart() {
        const canvas = document.getElementById('aiChartCanvas');
        if (!canvas) return;

        if (typeof Chart === 'undefined') {
            if (!document.getElementById('chartjs-script')) {
                const s = document.createElement('script');
                s.id = 'chartjs-script';
                s.src = 'https://cdn.jsdelivr.net/npm/chart.js';
                s.onload = () => this.renderChart();
                document.head.appendChild(s);
            }
            return;
        }

        const data = this.chartDatasets[this.currentModule];
        if (!data) return;

        if (this.chartInstance) {
            this.chartInstance.destroy();
        }

        const ctx = canvas.getContext('2d');
        const isRadar = this.currentChartType === 'radar';
        const isDonut = this.currentChartType === 'doughnut';

        this.chartInstance = new Chart(ctx, {
            type: this.currentChartType,
            data: {
                labels: data.labels,
                datasets: data.datasets.map(ds => ({
                    ...ds,
                    tension: 0.38,
                    pointRadius: 4,
                    pointHoverRadius: 7,
                    pointBackgroundColor: ds.borderColor,
                    pointBorderColor: '#ffffff'
                }))
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: {
                    duration: 600,
                    easing: 'easeOutQuart'
                },
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                        labels: {
                            color: '#cbd5e1',
                            font: { size: 11, weight: '600' },
                            boxWidth: 12,
                            padding: 10
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(6, 12, 24, 0.95)',
                        titleColor: '#00d9ff',
                        bodyColor: '#ffffff',
                        borderColor: 'rgba(0, 217, 255, 0.4)',
                        borderWidth: 1,
                        padding: 10,
                        cornerRadius: 8
                    }
                },
                scales: (isRadar || isDonut) ? {
                    r: isRadar ? {
                        grid: { color: 'rgba(255, 255, 255, 0.1)' },
                        angleLines: { color: 'rgba(0, 217, 255, 0.2)' },
                        pointLabels: { color: '#94a3b8', font: { size: 10 } },
                        ticks: { display: false }
                    } : undefined
                } : {
                    x: {
                        grid: { color: 'rgba(255, 255, 255, 0.05)' },
                        ticks: { color: '#94a3b8', font: { size: 10 } }
                    },
                    y: {
                        grid: { color: 'rgba(0, 217, 255, 0.08)' },
                        ticks: { color: '#94a3b8', font: { size: 10 } }
                    }
                }
            }
        });
    },

    toggleLiveStream() {
        this.isLiveStream = !this.isLiveStream;
        const btn = document.getElementById('btnLiveStream');
        const text = document.getElementById('liveStreamText');
        if (btn) btn.classList.toggle('active', this.isLiveStream);
        if (text) text.innerText = this.isLiveStream ? 'LIVE TELEMETRY' : 'STREAM PAUSED';
    },

    startLiveTelemetrySimulator() {
        if (this.liveInterval) clearInterval(this.liveInterval);

        this.liveInterval = setInterval(() => {
            if (!this.isLiveStream || !this.chartInstance || this.activeTab !== 'charts') return;

            const modData = this.chartDatasets[this.currentModule];
            if (!modData || !modData.datasets) return;

            // Slight dynamic perturbation on the last live data point
            modData.datasets.forEach(ds => {
                const len = ds.data.length;
                if (len > 0) {
                    const delta = (Math.random() - 0.48) * (ds.data[len - 1] * 0.04);
                    ds.data[len - 1] = Math.max(1, Math.round((ds.data[len - 1] + delta) * 10) / 10);
                }
            });

            this.chartInstance.update('none');
        }, 2800);
    },

    exportChartSnapshot() {
        const canvas = document.getElementById('aiChartCanvas');
        if (!canvas) return;
        const link = document.createElement('a');
        link.download = `satellite_ai_${this.currentModule}_chart.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
    },

    askAboutCurrentChart() {
        const data = this.chartDatasets[this.currentModule];
        if (!data) return;
        this.switchTab('chat');
        this.handleUserQuery(`Explain the ${data.title} and key telemetry insights.`);
    },

    // ========================================================================
    // NLP INTENT ENGINE & ACTIONS
    // ========================================================================
    async handleUserQuery(query) {
        if (!query || !query.trim()) return;

        // 1. Show user message
        this.appendMessage('user', query);

        // 2. Show thinking indicator
        const thinkingId = 'thinking-' + Date.now();
        const chatBody = document.getElementById('aiChatMessages');
        if (chatBody) {
            const thinkMsg = document.createElement('div');
            thinkMsg.id = thinkingId;
            thinkMsg.className = 'chat-msg assistant';
            thinkMsg.innerHTML = `
                <div class="msg-avatar"><i class="fa-solid fa-robot"></i></div>
                <div class="msg-bubble">
                    <div class="msg-text"><i class="fa-solid fa-circle-notch fa-spin"></i> Analyzing telemetry & generating response...</div>
                </div>
            `;
            chatBody.appendChild(thinkMsg);
            chatBody.scrollTop = chatBody.scrollHeight;
        }

        const removeThinking = () => {
            const el = document.getElementById(thinkingId);
            if (el) el.remove();
        };

        const q = query.toLowerCase().trim();

        // --------------------------------------------------------------------
        // INTENT 1: Chart Bot Commands (Forest, Urban, Flood, Climate, Fleet, Overview)
        // --------------------------------------------------------------------
        const isChartRequest = q.includes('chart') || q.includes('graph') || q.includes('plot') || q.includes('visualize') || q.includes('analytics') || q.includes('trend');

        if (isChartRequest || q.includes('forest') || q.includes('urban') || q.includes('flood') || q.includes('climate') || q.includes('fleet') || q.includes('deforest')) {
            let targetModule = null;
            if (q.includes('forest') || q.includes('tree') || q.includes('deforest') || q.includes('canopy') || q.includes('ndvi')) targetModule = 'forest';
            else if (q.includes('urban') || q.includes('city') || q.includes('sprawl') || q.includes('concrete')) targetModule = 'urban';
            else if (q.includes('flood') || q.includes('water') || q.includes('inundation') || q.includes('river')) targetModule = 'flood';
            else if (q.includes('climate') || q.includes('temp') || q.includes('co2') || q.includes('ice') || q.includes('heat')) targetModule = 'climate';
            else if (q.includes('fleet') || q.includes('iss') || q.includes('satellite') || q.includes('downlink') || q.includes('sensor')) targetModule = 'fleet';
            else if (q.includes('overview') || q.includes('radar') || q.includes('compare') || q.includes('global matrix')) targetModule = 'overview';

            // Detect chart type
            if (q.includes('line')) this.currentChartType = 'line';
            else if (q.includes('donut') || q.includes('doughnut') || q.includes('pie')) this.currentChartType = 'doughnut';
            else if (q.includes('radar')) this.currentChartType = 'radar';
            else if (q.includes('bar')) this.currentChartType = 'bar';

            if (targetModule) {
                removeThinking();
                this.selectChartModule(targetModule);
                const modData = this.chartDatasets[targetModule];

                const cardHtml = `
                    <div style="background:rgba(0,217,255,0.08); border:1px solid rgba(0,217,255,0.3); border-radius:12px; padding:12px; margin-top:8px;">
                        <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:6px;">
                            <strong style="color:#00d9ff;"><i class="fa-solid fa-chart-column"></i> ${modData.title}</strong>
                            <span style="color:#10b981; font-size:11px; font-weight:700;">● Live Stream</span>
                        </div>
                        <p style="font-size:12px; color:#cbd5e1; margin-bottom:8px;">${modData.insight}</p>
                        <div style="display:flex; gap:8px;">
                            <button type="button" onclick="AIAssistant.switchTab('charts')" style="background:linear-gradient(135deg,#0284c7,#06b6d4); color:#fff; border:none; border-radius:6px; padding:5px 10px; font-size:11px; font-weight:700; cursor:pointer;">
                                <i class="fa-solid fa-chart-line"></i> Open Full Chart Bot
                            </button>
                        </div>
                    </div>
                `;

                this.appendMessage('assistant', `📊 I've generated the <strong>${modData.title}</strong> in the Chart Bot panel!${cardHtml}`);
                this.speakResponse(`Displaying ${modData.title}. ${modData.insight}`);
                return;
            }
        }

        // --------------------------------------------------------------------
        // INTENT 1.5: 3D Earth Interactive Camera & Subsurface Controls (When on earth.html)
        // --------------------------------------------------------------------
        if (typeof EarthApp !== 'undefined') {
            if (q.includes('see inside') || q.includes('look inside') || q.includes('dive inside')) {
                removeThinking();
                let depth = 'lithosphere';
                if (q.includes('aquifer') || q.includes('water')) depth = 'aquifer';
                else if (q.includes('mantle') || q.includes('magma')) depth = 'mantle';
                if (typeof EarthApp.diveToDepth === 'function') EarthApp.diveToDepth(depth);
                this.appendMessage('assistant', `🔍 Diving 3D camera into subterranean strata and mantle layers.`);
                this.speakResponse('Diving 3D camera into subsurface geological layers.');
                return;
            }
            if (q.includes('core') || q.includes('x-ray') || q.includes('xray') || q.includes('subsurface')) {
                removeThinking();
                if (typeof toggleSubsurfaceView === 'function') toggleSubsurfaceView();
                this.appendMessage('assistant', '🔮 Subsurface Core & Geological Mantle X-Ray mode toggled.');
                this.speakResponse('Subsurface core and mantle X-Ray mode calibrated.');
                return;
            }
            if (q.includes('reset') || q.includes('default view')) {
                removeThinking();
                if (typeof resetEarthView === 'function') resetEarthView();
                this.appendMessage('assistant', '🎯 Resetting camera to global orbital perspective.');
                this.speakResponse('Resetting camera to orbital view.');
                return;
            }
            if (q.includes('spin') || q.includes('rotate')) {
                removeThinking();
                if (typeof toggleAutoRotate === 'function') toggleAutoRotate();
                this.appendMessage('assistant', '🔄 Planetary axial auto-rotation toggled.');
                this.speakResponse('Planetary rotation toggled.');
                return;
            }
        }

        // --------------------------------------------------------------------
        // INTENT 2: Website Navigation Commands
        // --------------------------------------------------------------------
        if (q.includes('3d earth') || q.includes('open earth') || q.includes('launch earth') || q.includes('go to earth')) {
            removeThinking();
            this.appendMessage('assistant', '🚀 Launching the <strong>3D Earth Observation Module</strong> with real-time satellite fleet & planetary X-Ray!');
            this.speakResponse('Launching 3D Earth Observation Module.');
            setTimeout(() => { window.location.href = 'earth.html'; }, 900);
            return;
        }

        if (q.includes('report') || q.includes('open report') || q.includes('download report')) {
            removeThinking();
            this.appendMessage('assistant', '📑 Navigating to <strong>Satellite AI Intelligence Reports Archive</strong>...');
            this.speakResponse('Opening Reports Archive.');
            setTimeout(() => { window.location.href = 'reports.html'; }, 900);
            return;
        }

        if (q.includes('change detection') || q.includes('open change')) {
            removeThinking();
            this.appendMessage('assistant', '🔄 Opening <strong>Change Detection Analysis</strong>...');
            this.speakResponse('Opening Change Detection.');
            setTimeout(() => { window.location.href = 'change-detection.html'; }, 900);
            return;
        }

        if (q.includes('dashboard') || q.includes('open dashboard')) {
            removeThinking();
            this.appendMessage('assistant', '📊 Opening <strong>Satellite AI Live Dashboard</strong>...');
            this.speakResponse('Opening Live Dashboard.');
            setTimeout(() => { window.location.href = 'dashboard.html'; }, 900);
            return;
        }

        if (q.includes('upload') || q.includes('upload image')) {
            removeThinking();
            this.appendMessage('assistant', '📤 Opening <strong>Satellite Image Upload & Analysis Module</strong>...');
            this.speakResponse('Opening Image Upload Module.');
            setTimeout(() => { window.location.href = 'upload-images.html'; }, 900);
            return;
        }

        if (q.includes('scroll to features') || q.includes('features') || q.includes('show features')) {
            removeThinking();
            const feat = document.getElementById('features') || document.querySelector('.features');
            if (feat) {
                feat.scrollIntoView({ behavior: 'smooth' });
                this.appendMessage('assistant', '✨ Scrolled to platform features!');
                this.speakResponse('Here are the core Satellite AI capabilities.');
                return;
            }
        }

        // --------------------------------------------------------------------
        // INTENT 3: Satellites & Space Stations Tracking
        // --------------------------------------------------------------------
        if (q.includes('iss') || q.includes('space station') || q.includes('sentinel') || q.includes('landsat') || q.includes('starlink')) {
            removeThinking();
            let satName = 'ISS (International Space Station)';
            let alt = '420 km';
            let vel = '27,600 km/h';
            let sensor = 'Optical LiDAR + Hyperspectral';

            if (q.includes('sentinel')) {
                satName = 'Sentinel-2A / 2B';
                alt = '786 km (Sun-Synchronous)';
                vel = '27,000 km/h';
                sensor = '13-Band Multispectral Instrument (MSI)';
            } else if (q.includes('landsat')) {
                satName = 'Landsat-9';
                alt = '705 km (Polar Orbit)';
                vel = '26,900 km/h';
                sensor = 'OLI-2 + TIRS-2 Thermal Infrared';
            }

            const satHtml = `
                <div style="background:rgba(0,217,255,0.08); border:1px solid rgba(0,217,255,0.3); border-radius:12px; padding:12px; margin-top:8px;">
                    <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:6px;">
                        <strong style="color:#00d9ff;"><i class="fa-solid fa-satellite"></i> ${satName}</strong>
                        <span style="color:#10b981; font-size:11px; font-weight:700;">● Active LEO Orbit</span>
                    </div>
                    <p style="font-size:12px; color:#cbd5e1; margin-bottom:4px;"><strong>Altitude:</strong> ${alt} • <strong>Speed:</strong> ${vel}</p>
                    <p style="font-size:12px; color:#cbd5e1; margin-bottom:6px;"><strong>Payload:</strong> ${sensor}</p>
                    <button type="button" onclick="AIAssistant.selectChartModule('fleet'); AIAssistant.switchTab('charts');" style="background:linear-gradient(135deg,#0284c7,#06b6d4); color:#fff; border:none; border-radius:6px; padding:5px 10px; font-size:11px; font-weight:700; cursor:pointer;">
                        <i class="fa-solid fa-chart-line"></i> View Fleet Telemetry Chart
                    </button>
                </div>
            `;

            this.appendMessage('assistant', `🛰️ Telemetry locked on <strong>${satName}</strong>:${satHtml}`);
            this.speakResponse(`Telemetry locked on ${satName}. Orbit altitude ${alt}, operational speed ${vel}.`);
            return;
        }

        // --------------------------------------------------------------------
        // INTENT 4: Weather & Place Lookups
        // --------------------------------------------------------------------
        let placeQuery = query
            .replace(/what('s| is) the weather in/gi, '')
            .replace(/weather in|weather of|forecast for|fly to|show me|find|search for|search|pin|go to|take me to|locate/gi, '')
            .replace(/[?.!]/g, '')
            .trim();

        if (placeQuery && placeQuery.length > 2 && (q.includes('weather') || q.includes('temp') || q.includes('climate in') || q.includes('forecast'))) {
            try {
                const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(placeQuery)}&count=1&language=en&format=json`);
                if (geoRes.ok) {
                    const geoData = await geoRes.json();
                    if (geoData.results && geoData.results.length > 0) {
                        const place = geoData.results[0];
                        const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${place.latitude}&longitude=${place.longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m`);
                        if (weatherRes.ok) {
                            const wData = await weatherRes.json();
                            removeThinking();
                            const temp = Math.round(wData.current.temperature_2m);
                            const hum = wData.current.relative_humidity_2m;
                            const wind = wData.current.wind_speed_10m;

                            const weatherHtml = `
                                <div style="background:rgba(0,217,255,0.08); border:1px solid rgba(0,217,255,0.3); border-radius:12px; padding:12px; margin-top:8px;">
                                    <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:6px;">
                                        <strong>📍 ${place.name}, ${place.country || ''}</strong>
                                        <span style="color:#00d9ff; font-weight:800; font-size:17px;">${temp}°C</span>
                                    </div>
                                    <p style="font-size:12px; color:#cbd5e1; margin-bottom:6px;">
                                        <i class="fa-solid fa-wind" style="color:#00d9ff;"></i> Wind: ${wind} km/h • <i class="fa-solid fa-droplet" style="color:#00d9ff;"></i> Humidity: ${hum}%
                                    </p>
                                    <small style="color:#10b981; font-weight:700;"><i class="fa-solid fa-satellite-dish"></i> Geospatial Coordinates: ${place.latitude.toFixed(2)}°N, ${place.longitude.toFixed(2)}°E</small>
                                </div>
                            `;

                            this.appendMessage('assistant', `🌤️ Live meteorological telemetry for <strong>${place.name}</strong>:${weatherHtml}`);
                            this.speakResponse(`Current temperature in ${place.name} is ${temp} degrees Celsius, with ${hum} percent humidity.`);
                            return;
                        }
                    }
                }
            } catch (err) {
                console.warn('Weather fetch error:', err);
            }
        }

        // --------------------------------------------------------------------
        // INTENT 5: Backend API Integration Fallback
        // --------------------------------------------------------------------
        try {
            if (typeof askSatelliteAI === 'function') {
                const answered = await askSatelliteAI(query);
                if (answered) {
                    removeThinking();
                    return;
                }
            }
        } catch (e) {
            console.warn('Backend query error:', e);
        }

        // --------------------------------------------------------------------
        // DEFAULT: Intelligent Assistant Telemetry Response
        // --------------------------------------------------------------------
        removeThinking();
        const fallbackHtml = `
            🛰️ I've analyzed your query for "<strong>${query}</strong>". Here is what you can ask me:
            <ul style="margin: 6px 0 0 16px; font-size:12.5px; line-height:1.6;">
                <li>📊 <strong>Chart Bot</strong>: <i>"Show forest chart"</i>, <i>"Plot urban growth"</i>, <i>"Show flood risk"</i></li>
                <li>🌡️ <strong>Climate Trends</strong>: <i>"Show climate trend"</i> or <i>"Weather in Tokyo"</i></li>
                <li>🛰️ <strong>Orbit Telemetry</strong>: <i>"Track ISS"</i>, <i>"Sentinel-2 payload health"</i></li>
                <li>🚀 <strong>Website Controls</strong>: <i>"Launch 3D Earth"</i>, <i>"Open Reports Archive"</i></li>
            </ul>
        `;
        this.appendMessage('assistant', fallbackHtml);
        this.speakResponse("I can help you generate environmental telemetry charts, look up worldwide weather, or track satellite orbits.");
    }
};

// Global compatibility bindings
function openAI() {
    AIAssistant.open();
}

function closeAI() {
    AIAssistant.close();
}

function toggleAIChat() {
    AIAssistant.toggleChat();
}

function toggleAIVoice() {
    AIAssistant.toggleVoiceRecognition();
}

function startListening() {
    AIAssistant.toggleVoiceRecognition();
}

function speakAI() {
    const lastMsg = document.querySelector('#aiChatMessages .chat-msg.assistant:last-child .msg-text');
    const txt = lastMsg ? lastMsg.innerText : "Hello! I am Satellite AI. How can I help you today?";
    AIAssistant.speakResponse(txt);
}

function stopSpeaking() {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
}

// Initialize on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
    AIAssistant.init();
});