/**
 * 🌍 SATELLITE AI - 3D INTERACTIVE EARTH ENGINE
 * Features:
 * - High-Res Earth Day & City Night Lights blending shader
 * - 🔮 Subsurface X-Ray & Core Interior Layer with Geological Mantle
 * - 📌 INSIDE-THE-EARTH PINNING: Borehole laser shaft penetrating deep into the mantle & core
 * - Atmospheric Rayleigh scattering edge glow
 * - Independent rotating atmospheric cloud layer
 * - 10,000+ procedural deep space stars with twinkling
 * - 3D Orbiting Satellite Constellation (ISS, Sentinel-2, Landsat-9, NOAA, Starlink, GOES)
 * - AI Detection Hotspot Markers with pulsing radar rings & holographic pins
 * - 🗺️ Interactive National Weather Markers for 30+ Global Nations with Live Meteorological Telemetry
 * - 🔍 Worldwide City & Landmark Geocoding Search
 * - Smooth Drag-to-Rotate & Zoom with momentum damping
 * - Interactive Sun light positioning & 24h day/night scrubber
 * - Cinematic Camera Fly-To navigation & Guided Tour mode
 */

// Global 3D Engine State
const EarthApp = {
    scene: null,
    camera: null,
    renderer: null,
    controls: null,
    earthGroup: null,
    earthMesh: null,
    innerCoreMesh: null,
    mantleGridMesh: null,
    cloudsMesh: null,
    atmosphereMesh: null,
    starField: null,
    sunLight: null,
    ambientLight: null,
    
    // Collections & Groups
    satellites: [],
    aiMarkers: [],
    countryPins: [],
    targetPinGroup: null,
    satelliteGroup: null,
    markersGroup: null,
    countryPinsGroup: null,
    orbitLinesGroup: null,
    
    // Animation & State variables
    autoRotate: true,
    rotationSpeed: 0.0012,
    cloudsSpeed: 0.0017,
    sunAngle: 0.8, // Radians around Y
    sunDistance: 100,
    activeTarget: null,
    isTouring: false,
    tourIndex: 0,
    tourTimer: null,
    isPinMode: false,        // Click-to-pin mode
    isSubsurfaceMode: true,  // Subsurface / Inside the Earth view mode
    
    // Layer Visibility States
    layers: {
        satellites: true,
        orbits: true,
        aiMarkers: true,
        countryPins: true,
        subsurfaceCore: true,
        clouds: true,
        atmosphere: true,
        nightLights: true,
        starfield: true
    },
    
    // Raycasting for Interactivity
    raycaster: new THREE.Raycaster(),
    mouse: new THREE.Vector2(),
    tooltip: null,
    
    // Earth Radius constant in 3D units
    EARTH_RADIUS: 10
};

// ============================================================================
// 1. INITIALIZATION & SETUP
// ============================================================================
function init3DEarth() {
    const container = document.getElementById('earth-canvas-container');
    if (!container) return;

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    // 1.1 Scene
    EarthApp.scene = new THREE.Scene();
    EarthApp.scene.fog = new THREE.FogExp2(0x02040b, 0.0015);

    // 1.2 Camera
    EarthApp.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 2000);
    EarthApp.camera.position.set(0, 8, 30);

    // 1.3 WebGL Renderer
    EarthApp.renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance'
    });
    EarthApp.renderer.setSize(width, height);
    EarthApp.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    EarthApp.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    EarthApp.renderer.toneMappingExposure = 1.15;
    container.innerHTML = '';
    container.appendChild(EarthApp.renderer.domElement);

    // 1.4 Controls (Smooth Drag to Rotate & Zoom)
    EarthApp.controls = new THREE.OrbitControls(EarthApp.camera, EarthApp.renderer.domElement);
    EarthApp.controls.enableDamping = true;
    EarthApp.controls.dampingFactor = 0.05;
    EarthApp.controls.rotateSpeed = 0.6;
    EarthApp.controls.zoomSpeed = 0.8;
    EarthApp.controls.minDistance = 11.2; // Allows zooming close to the crust to inspect inside
    EarthApp.controls.maxDistance = 120;  // Orbital boundary
    EarthApp.controls.enablePan = false;   // Keep centered on Earth

    // 1.5 Groups
    EarthApp.earthGroup = new THREE.Group();
    // Real Earth axial tilt: 23.44 degrees (0.409 rad)
    EarthApp.earthGroup.rotation.z = 23.44 * Math.PI / 180;
    EarthApp.scene.add(EarthApp.earthGroup);

    EarthApp.satelliteGroup = new THREE.Group();
    EarthApp.orbitLinesGroup = new THREE.Group();
    EarthApp.markersGroup = new THREE.Group();
    EarthApp.countryPinsGroup = new THREE.Group();
    
    EarthApp.scene.add(EarthApp.satelliteGroup);
    EarthApp.scene.add(EarthApp.orbitLinesGroup);
    EarthApp.earthGroup.add(EarthApp.markersGroup);     // AI Markers rotate with Earth
    EarthApp.earthGroup.add(EarthApp.countryPinsGroup); // Country Pins rotate with Earth

    // 1.6 Build Scene Elements
    setupLighting();
    setupStarfield();
    setupEarthInteriorCore();
    setupEarthGlobe();
    setupAtmosphere();
    setupClouds();
    setupSatellites();
    setupAIMarkers();
    setupCountryWeatherPins();
    setupEventListeners();
    setupGlobalPlaceSearch();

    // 1.7 Animation Loop
    animate();

    // 1.8 Update UI Telemetry
    updateTelemetryHUD();
    setInterval(updateTelemetryHUD, 1000);
}

// ============================================================================
// 2. LIGHTING (Sun & Space Ambient)
// ============================================================================
function setupLighting() {
    EarthApp.ambientLight = new THREE.AmbientLight(0x0c1a30, 0.6);
    EarthApp.scene.add(EarthApp.ambientLight);

    EarthApp.sunLight = new THREE.DirectionalLight(0xffffff, 2.2);
    updateSunPosition(EarthApp.sunAngle);
    EarthApp.scene.add(EarthApp.sunLight);

    const sunGeo = new THREE.SphereGeometry(4, 16, 16);
    const sunMat = new THREE.MeshBasicMaterial({
        color: 0xfffae0,
        wireframe: false
    });
    const sunMesh = new THREE.Mesh(sunGeo, sunMat);
    sunMesh.position.copy(EarthApp.sunLight.position);
    EarthApp.scene.add(sunMesh);
    EarthApp.sunMesh = sunMesh;
}

function updateSunPosition(angle) {
    EarthApp.sunAngle = angle;
    const x = Math.sin(angle) * EarthApp.sunDistance;
    const z = Math.cos(angle) * EarthApp.sunDistance;
    const y = 5.0;
    EarthApp.sunLight.position.set(x, y, z);
    
    if (EarthApp.sunMesh) {
        EarthApp.sunMesh.position.set(x * 4, y * 4, z * 4);
    }
    
    if (EarthApp.earthMesh && EarthApp.earthMesh.material.uniforms) {
        EarthApp.earthMesh.material.uniforms.sunDirection.value.copy(
            EarthApp.sunLight.position
        ).normalize();
    }
}

// ============================================================================
// 3. EARTH INTERIOR: MOLTEN CORE & GEOLOGICAL MANTLE GRID
// ============================================================================
function setupEarthInteriorCore() {
    // 3.1 Inner Molten Core Sphere
    const coreGeo = new THREE.SphereGeometry(4.8, 32, 32);
    const coreMat = new THREE.MeshBasicMaterial({
        color: 0xff6600,
        wireframe: false,
        transparent: true,
        opacity: 0.85
    });
    EarthApp.innerCoreMesh = new THREE.Mesh(coreGeo, coreMat);
    EarthApp.earthGroup.add(EarthApp.innerCoreMesh);

    // 3.2 Mantle Depth Wireframe Grid
    const mantleGeo = new THREE.SphereGeometry(7.5, 24, 24);
    const mantleMat = new THREE.MeshBasicMaterial({
        color: 0x00d9ff,
        wireframe: true,
        transparent: true,
        opacity: 0.18
    });
    EarthApp.mantleGridMesh = new THREE.Mesh(mantleGeo, mantleMat);
    EarthApp.earthGroup.add(EarthApp.mantleGridMesh);
}

// ============================================================================
// 4. PROCEDURAL TEXTURES & EARTH DAY/NIGHT SHADER
// ============================================================================
function createProceduralEarthDayTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');

    const oceanGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    oceanGrad.addColorStop(0, '#0a2342');
    oceanGrad.addColorStop(0.3, '#0d324d');
    oceanGrad.addColorStop(0.5, '#05203c');
    oceanGrad.addColorStop(0.7, '#0d324d');
    oceanGrad.addColorStop(1, '#0a2342');
    ctx.fillStyle = oceanGrad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    function drawContinent(points, fillStyle = '#2d5a27') {
        ctx.fillStyle = fillStyle;
        ctx.beginPath();
        points.forEach((p, idx) => {
            const x = (p[0] / 360 + 0.5) * canvas.width;
            const y = (0.5 - p[1] / 180) * canvas.height;
            if (idx === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        });
        ctx.closePath();
        ctx.fill();
    }

    drawContinent([[-165, 65], [-140, 70], [-90, 75], [-60, 60], [-65, 45], [-75, 25], [-95, 18], [-105, 20], [-120, 35], [-125, 50], [-165, 60]], '#2b6330');
    drawContinent([[-80, 10], [-50, -5], [-35, -5], [-40, -22], [-55, -40], [-70, -55], [-75, -45], [-80, -5], [-80, 10]], '#1b4d24');
    drawContinent([[-10, 35], [30, 40], [60, 40], [100, 45], [140, 40], [130, 65], [80, 70], [30, 70], [0, 60], [-10, 40]], '#3d5a27');
    drawContinent([[-15, 35], [35, 35], [50, 10], [45, 0], [40, -15], [30, -35], [20, -35], [10, -5], [-15, 10]], '#5a552b');
    drawContinent([[60, 30], [80, 30], [80, 10], [90, 20], [110, 20], [105, 5], [75, 10], [68, 25]], '#285827');
    drawContinent([[115, -20], [135, -12], [150, -25], [145, -38], [115, -35]], '#6b5428');
    drawContinent([[-180, -75], [180, -75], [180, -90], [-180, -90]], '#e0f2fe');
    drawContinent([[-50, 80], [-20, 75], [-40, 60], [-55, 70]], '#e0f2fe');

    for (let i = 0; i < 6000; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const color = Math.random() > 0.6 ? 'rgba(217, 180, 130, 0.4)' : 'rgba(30, 80, 40, 0.3)';
        ctx.fillStyle = color;
        ctx.fillRect(x, y, Math.random() * 4 + 1, Math.random() * 4 + 1);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    return texture;
}

function createProceduralEarthNightTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#010309';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    function addCityCluster(lon, lat, radius, count, intensity = 1.0) {
        const cx = (lon / 360 + 0.5) * canvas.width;
        const cy = (0.5 - lat / 180) * canvas.height;

        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const dist = Math.pow(Math.random(), 1.8) * radius;
            const px = cx + Math.cos(angle) * dist;
            const py = cy + Math.sin(angle) * dist;
            const r = Math.random() * 2.5 + 0.8;
            
            const grad = ctx.createRadialGradient(px, py, 0, px, py, r * 2);
            grad.addColorStop(0, `rgba(255, 220, 130, ${0.9 * intensity})`);
            grad.addColorStop(0.4, `rgba(255, 170, 50, ${0.6 * intensity})`);
            grad.addColorStop(1, 'rgba(255, 120, 0, 0)');
            
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(px, py, r * 2, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    addCityCluster(-74, 40.7, 45, 120, 1.2);  // NYC
    addCityCluster(-87.6, 41.8, 30, 80, 1.0);  // Chicago
    addCityCluster(-118.2, 34.0, 35, 90, 1.1); // LA
    addCityCluster(0.1, 51.5, 30, 110, 1.2);   // London
    addCityCluster(2.3, 48.8, 25, 90, 1.1);    // Paris
    addCityCluster(139.7, 35.6, 50, 180, 1.4); // Tokyo
    addCityCluster(121.4, 31.2, 45, 160, 1.3); // Shanghai
    addCityCluster(77.2, 28.6, 40, 140, 1.2);  // New Delhi
    addCityCluster(72.8, 19.0, 35, 130, 1.2);  // Mumbai
    addCityCluster(55.2, 25.2, 25, 90, 1.3);   // Dubai
    addCityCluster(-46.6, -23.5, 35, 100, 1.1);// São Paulo
    addCityCluster(151.2, -33.8, 25, 70, 1.0); // Sydney

    for (let i = 0; i < 3000; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        ctx.fillStyle = 'rgba(255, 200, 100, 0.15)';
        ctx.fillRect(x, y, 1.2, 1.2);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    return texture;
}

function createProceduralCloudsTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < 180; i++) {
        const cx = Math.random() * canvas.width;
        const cy = Math.random() * canvas.height;
        const radiusX = Math.random() * 140 + 40;
        const radiusY = Math.random() * 50 + 15;
        const rotation = (Math.random() - 0.5) * 0.8;

        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(rotation);
        
        const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, radiusX);
        const alpha = Math.random() * 0.45 + 0.2;
        grad.addColorStop(0, `rgba(255, 255, 255, ${alpha})`);
        grad.addColorStop(0.5, `rgba(245, 250, 255, ${alpha * 0.6})`);
        grad.addColorStop(1, 'rgba(255, 255, 255, 0)');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.ellipse(0, 0, radiusX, radiusY, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    return texture;
}

function setupEarthGlobe() {
    const geometry = new THREE.SphereGeometry(EarthApp.EARTH_RADIUS, 64, 64);

    const dayTexture = createProceduralEarthDayTexture();
    const nightTexture = createProceduralEarthNightTexture();

    const textureLoader = new THREE.TextureLoader();
    textureLoader.crossOrigin = 'anonymous';

    textureLoader.load(
        'https://cdn.jsdelivr.net/npm/three-globe/example/img/earth-blue-marble.jpg',
        (tex) => {
            if (EarthApp.earthMesh && EarthApp.earthMesh.material.uniforms) {
                EarthApp.earthMesh.material.uniforms.dayTexture.value = tex;
                EarthApp.earthMesh.material.needsUpdate = true;
            }
        },
        undefined,
        (err) => {
            console.warn('Using procedural Earth day fallback texture.', err);
        }
    );

    textureLoader.load(
        'https://cdn.jsdelivr.net/npm/three-globe/example/img/earth-night.jpg',
        (tex) => {
            if (EarthApp.earthMesh && EarthApp.earthMesh.material.uniforms) {
                EarthApp.earthMesh.material.uniforms.nightTexture.value = tex;
                EarthApp.earthMesh.material.needsUpdate = true;
            }
        },
        undefined,
        (err) => {
            console.warn('Using procedural Earth night fallback texture.', err);
        }
    );

    const earthCustomMaterial = new THREE.ShaderMaterial({
        uniforms: {
            dayTexture: { value: dayTexture },
            nightTexture: { value: nightTexture },
            sunDirection: { value: new THREE.Vector3(1, 0, 0).normalize() },
            enableNightLights: { value: 1.0 },
            ambientIntensity: { value: 0.12 },
            crustOpacity: { value: 0.88 } // Translucent so you can see inside the Earth!
        },
        transparent: true,
        vertexShader: `
            varying vec2 vUv;
            varying vec3 vNormal;
            varying vec3 vWorldPosition;

            void main() {
                vUv = uv;
                vNormal = normalize(normalMatrix * normal);
                vec4 worldPos = modelMatrix * vec4(position, 1.0);
                vWorldPosition = worldPos.xyz;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            uniform sampler2D dayTexture;
            uniform sampler2D nightTexture;
            uniform vec3 sunDirection;
            uniform float enableNightLights;
            uniform float ambientIntensity;
            uniform float crustOpacity;

            varying vec2 vUv;
            varying vec3 vNormal;
            varying vec3 vWorldPosition;

            void main() {
                vec3 normSunDir = normalize(sunDirection);
                float sunDot = dot(normalize(vNormal), normSunDir);

                float dayFactor = smoothstep(-0.2, 0.25, sunDot);

                vec4 dayColor = texture2D(dayTexture, vUv);
                vec4 nightColor = texture2D(nightTexture, vUv) * enableNightLights;

                vec3 viewDir = normalize(cameraPosition - vWorldPosition);
                vec3 halfDir = normalize(normSunDir + viewDir);
                float specFactor = pow(max(dot(normalize(vNormal), halfDir), 0.0), 32.0);
                float isWater = step(0.15, dayColor.b - dayColor.r);
                vec3 specular = vec3(0.9, 0.95, 1.0) * specFactor * isWater * 0.8 * dayFactor;

                vec3 finalColor = mix(nightColor.rgb * 1.6, dayColor.rgb, dayFactor);
                finalColor += specular;
                finalColor += dayColor.rgb * ambientIntensity;

                gl_FragColor = vec4(finalColor, crustOpacity);
            }
        `
    });

    EarthApp.earthMesh = new THREE.Mesh(geometry, earthCustomMaterial);
    EarthApp.earthMesh.userData = { isEarthSphere: true };
    EarthApp.earthGroup.add(EarthApp.earthMesh);
}

// ============================================================================
// 5. ATMOSPHERIC RAYLEIGH SCATTERING GLOW
// ============================================================================
function setupAtmosphere() {
    const atmoGeo = new THREE.SphereGeometry(EarthApp.EARTH_RADIUS * 1.15, 64, 64);

    const atmoMat = new THREE.ShaderMaterial({
        vertexShader: `
            varying vec3 vNormal;
            void main() {
                vNormal = normalize(normalMatrix * normal);
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            varying vec3 vNormal;
            void main() {
                float intensity = pow(0.65 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.8);
                vec3 atmosphereColor = vec3(0.18, 0.65, 1.0);
                gl_FragColor = vec4(atmosphereColor, intensity * 0.95);
            }
        `,
        blending: THREE.AdditiveBlending,
        side: THREE.BackSide,
        transparent: true
    });

    EarthApp.atmosphereMesh = new THREE.Mesh(atmoGeo, atmoMat);
    EarthApp.scene.add(EarthApp.atmosphereMesh);
}

// ============================================================================
// 6. ATMOSPHERIC CLOUD LAYER
// ============================================================================
function setupClouds() {
    const cloudGeo = new THREE.SphereGeometry(EarthApp.EARTH_RADIUS * 1.018, 64, 64);
    const cloudTexture = createProceduralCloudsTexture();

    const textureLoader = new THREE.TextureLoader();
    textureLoader.crossOrigin = 'anonymous';
    textureLoader.load(
        'https://cdn.jsdelivr.net/gh/vasturiano/three-globe/example/clouds/clouds.png',
        (tex) => {
            if (EarthApp.cloudsMesh) {
                EarthApp.cloudsMesh.material.map = tex;
                EarthApp.cloudsMesh.material.needsUpdate = true;
            }
        },
        undefined,
        (err) => {
            console.warn('Using procedural Earth clouds fallback texture.', err);
        }
    );

    const cloudMat = new THREE.MeshStandardMaterial({
        map: cloudTexture,
        transparent: true,
        opacity: 0.75,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });

    EarthApp.cloudsMesh = new THREE.Mesh(cloudGeo, cloudMat);
    EarthApp.earthGroup.add(EarthApp.cloudsMesh);
}

// ============================================================================
// 7. DEEP SPACE STARFIELD
// ============================================================================
function setupStarfield() {
    const starsCount = 8000;
    const starGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(starsCount * 3);
    const colors = new Float32Array(starsCount * 3);
    const sizes = new Float32Array(starsCount);

    const palette = [
        new THREE.Color(0xffffff),
        new THREE.Color(0xaed9e0),
        new THREE.Color(0xffe3a8),
        new THREE.Color(0xd8b4f8)
    ];

    for (let i = 0; i < starsCount; i++) {
        const radius = THREE.MathUtils.randFloat(300, 900);
        const theta = 2 * Math.PI * Math.random();
        const phi = Math.acos(2 * Math.random() - 1);

        positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
        positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
        positions[i * 3 + 2] = radius * Math.cos(phi);

        const color = palette[Math.floor(Math.random() * palette.length)];
        colors[i * 3] = color.r;
        colors[i * 3 + 1] = color.g;
        colors[i * 3 + 2] = color.b;

        sizes[i] = Math.random() * 2.2 + 0.6;
    }

    starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    starGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    starGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const starMaterial = new THREE.PointsMaterial({
        size: 1.8,
        vertexColors: true,
        transparent: true,
        opacity: 0.9,
        sizeAttenuation: true
    });

    EarthApp.starField = new THREE.Points(starGeometry, starMaterial);
    EarthApp.scene.add(EarthApp.starField);
}

// ============================================================================
// 8. ORBITING SATELLITE CONSTELLATION
// ============================================================================
const SATELLITE_DATA = [
    {
        id: 'iss',
        name: 'ISS (Space Station)',
        type: 'Human Habitation & Science',
        altitude: 420,
        radius: 12.8,
        inclination: 51.6,
        speed: 27600,
        period: 92.68,
        color: '#00f3ff',
        description: 'International Space Station conducting microgravity research, environmental observation, and planetary science.',
        sensor: 'Optical LiDAR / Multi-band Infrared / Atmospheric Spectrometer',
        status: 'Active • Nominal',
        angle: 0.2
    },
    {
        id: 'sentinel2a',
        name: 'Sentinel-2A',
        type: 'Copernicus Earth Observation',
        altitude: 786,
        radius: 14.2,
        inclination: 98.62,
        speed: 26800,
        period: 100.6,
        color: '#00ff88',
        description: 'High-resolution multispectral imaging mission for land monitoring, emergency response, and deforestation analysis.',
        sensor: 'MSI (13 Spectral Bands • 10m Ground Resolution)',
        status: 'Active • Realtime Telemetry',
        angle: 1.8
    },
    {
        id: 'landsat9',
        name: 'Landsat 9',
        type: 'USGS/NASA Land Imager',
        altitude: 705,
        radius: 13.6,
        inclination: 98.2,
        speed: 27100,
        period: 98.8,
        color: '#ffaa00',
        description: 'Continues 50-year record of Earth observation, tracking agricultural shifts, water health, and urban sprawl.',
        sensor: 'OLI-2 & TIRS-2 (Thermal Infrared Sensor)',
        status: 'Active • Calibration OK',
        angle: 3.4
    },
    {
        id: 'noaa20',
        name: 'NOAA-20 (JPSS-1)',
        type: 'Global Weather & Storm Tracker',
        altitude: 824,
        radius: 14.8,
        inclination: 98.7,
        speed: 26500,
        period: 101.4,
        color: '#3b82f6',
        description: 'Advanced meteorological satellite providing global temperature sounding, hurricane tracking, and polar monitoring.',
        sensor: 'VIIRS (Visible Infrared Imaging Radiometer Suite)',
        status: 'Active • Scanning Storm Systems',
        angle: 4.6
    },
    {
        id: 'starlink',
        name: 'Starlink Fleet Relay (LEO)',
        type: 'Orbital Telemetry Relay',
        altitude: 550,
        radius: 13.1,
        inclination: 53.2,
        speed: 27400,
        period: 95.3,
        color: '#e0e7ff',
        description: 'Low-Earth-Orbit laser crosslink constellation enabling instant planetary telemetry and emergency disaster uplink.',
        sensor: 'Phased Array Ku/Ka-band Transceivers',
        status: 'Active • Low Latency Relay',
        angle: 5.5
    },
    {
        id: 'goes16',
        name: 'GOES-16 (Geostationary)',
        type: 'Geostationary Weather Satellite',
        altitude: 35786,
        radius: 18.5,
        inclination: 0.0,
        speed: 11070,
        period: 1436.0,
        color: '#f43f5e',
        description: 'Geostationary lightning mapper and advanced baseline imager providing continuous full-disk Earth views.',
        sensor: 'ABI (Advanced Baseline Imager) & GLM',
        status: 'Active • Geo-Locked Orbit',
        angle: 0.9
    }
];

function setupSatellites() {
    SATELLITE_DATA.forEach((data) => {
        const orbitCurve = new THREE.EllipseCurve(0, 0, data.radius, data.radius, 0, 2 * Math.PI, false, 0);
        const points = orbitCurve.getPoints(128);
        const orbitGeo = new THREE.BufferGeometry().setFromPoints(points);
        
        const orbitMat = new THREE.LineBasicMaterial({
            color: new THREE.Color(data.color),
            transparent: true,
            opacity: 0.35,
            linewidth: 1
        });
        const orbitLine = new THREE.Line(orbitGeo, orbitMat);
        
        orbitLine.rotation.x = Math.PI / 2;
        orbitLine.rotation.y = (data.inclination * Math.PI) / 180;
        EarthApp.orbitLinesGroup.add(orbitLine);

        const satMeshGroup = new THREE.Group();

        const bodyGeo = new THREE.BoxGeometry(0.35, 0.22, 0.22);
        const bodyMat = new THREE.MeshStandardMaterial({
            color: 0xd4af37,
            metalness: 0.85,
            roughness: 0.2
        });
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        satMeshGroup.add(body);

        const panelGeo = new THREE.BoxGeometry(1.2, 0.03, 0.45);
        const panelMat = new THREE.MeshStandardMaterial({
            color: 0x1d4ed8,
            metalness: 0.9,
            roughness: 0.15
        });
        const panel = new THREE.Mesh(panelGeo, panelMat);
        satMeshGroup.add(panel);

        const beaconGeo = new THREE.SphereGeometry(0.12, 8, 8);
        const beaconMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(data.color) });
        const beacon = new THREE.Mesh(beaconGeo, beaconMat);
        beacon.position.set(0, 0.2, 0);
        satMeshGroup.add(beacon);

        const glowGeo = new THREE.SphereGeometry(0.38, 12, 12);
        const glowMat = new THREE.MeshBasicMaterial({
            color: new THREE.Color(data.color),
            transparent: true,
            opacity: 0.45
        });
        const glow = new THREE.Mesh(glowGeo, glowMat);
        satMeshGroup.add(glow);

        satMeshGroup.userData = {
            isSatellite: true,
            data: data,
            glow: glow,
            beacon: beacon
        };

        EarthApp.satelliteGroup.add(satMeshGroup);
        EarthApp.satellites.push({
            group: satMeshGroup,
            data: data,
            orbitLine: orbitLine,
            angle: data.angle,
            speed: (1 / data.period) * 0.08
        });
    });
}

// ============================================================================
// 9. AI DETECTION HOTSPOT MARKERS
// ============================================================================
const AI_DETECTION_MARKERS = [
    {
        id: 'amazon_deforest',
        title: 'Illegal Deforestation Surge',
        category: 'Forest Monitoring',
        icon: 'fa-tree',
        color: '#22c55e',
        hexColor: 0x22c55e,
        lat: -3.4653,
        lon: -62.2159,
        location: 'Amazon Basin, Brazil',
        confidence: '94.8%',
        severity: 'High Alert',
        detectionType: 'Canopy Loss (Sentinel-2 NDVI)',
        areaAffected: '4,280 Hectares',
        pageUrl: 'forest-monitoring.html',
        summary: 'AI multi-temporal canopy analysis detected severe clear-cutting and illegal road construction in protected forest reserve.'
    },
    {
        id: 'brahmaputra_flood',
        title: 'Severe Hydrological Surge',
        category: 'Flood Analysis',
        icon: 'fa-water',
        color: '#38bdf8',
        hexColor: 0x38bdf8,
        lat: 25.5788,
        lon: 89.8700,
        location: 'Brahmaputra Delta, Bangladesh',
        confidence: '96.2%',
        severity: 'Critical Surge',
        detectionType: 'Water Surface Expansion (SAR Radar)',
        areaAffected: '18,500 Hectares Submerged',
        pageUrl: 'flood-analysis.html',
        summary: 'Synthetic Aperture Radar (SAR) detected monsoon water overflow exceeding historical 10-year threshold across 4 districts.'
    },
    {
        id: 'shenzhen_urban',
        title: 'High-Speed Megacity Expansion',
        category: 'Urban Growth',
        icon: 'fa-city',
        color: '#06b6d4',
        hexColor: 0x06b6d4,
        lat: 22.5431,
        lon: 114.0579,
        location: 'Shenzhen Bay & Pearl River, China',
        confidence: '91.5%',
        severity: 'Active Development',
        detectionType: 'Built-up Area Expansion (NDBI AI)',
        areaAffected: '+14.2% Structural Expansion',
        pageUrl: 'urban-growth.html',
        summary: 'AI segmentation identified new coastal tech infrastructure, high-density residential zones, and industrial transport corridors.'
    },
    {
        id: 'california_wildfire',
        title: 'Thermal Wildfire Anomaly',
        category: 'Disaster Alerts',
        icon: 'fa-fire',
        color: '#ef4444',
        hexColor: 0xef4444,
        lat: 39.7596,
        lon: -121.6219,
        location: 'Northern Sierra Foothills, USA',
        confidence: '98.1%',
        severity: 'Extreme Emergency',
        detectionType: 'Thermal Infrared Hotspot (VIIRS)',
        areaAffected: '8,900 Acres Rapid Spread',
        pageUrl: 'disaster-alerts.html',
        summary: 'Intense thermal infrared emissions detected with high-velocity wind vectors pushing burn front towards urban interfaces.'
    },
    {
        id: 'antarctica_ice_calve',
        title: 'Pine Island Ice Shelf Fracture',
        category: 'Climate Monitoring',
        icon: 'fa-snowflake',
        color: '#93c5fd',
        hexColor: 0x93c5fd,
        lat: -75.1667,
        lon: -100.0,
        location: 'Pine Island Glacier, Antarctica',
        confidence: '89.4%',
        severity: 'Climate Alert',
        detectionType: 'Cryospheric Rift Propagation',
        areaAffected: '310 sq km Calving Front',
        pageUrl: 'climate-monitoring.html',
        summary: 'Longitudinal thermal rift expansion detected along the glacier grounding line, indicating upcoming iceberg detachment.'
    },
    {
        id: 'bengal_cyclone',
        title: 'Cyclone Formation & Eye Tracking',
        category: 'Disaster Alerts',
        icon: 'fa-tornado',
        color: '#f59e0b',
        hexColor: 0xf59e0b,
        lat: 16.5,
        lon: 87.2,
        location: 'Bay of Bengal, Indian Ocean',
        confidence: '95.0%',
        severity: 'Category 3 Alert',
        detectionType: 'Cloud Vorticity & Barometric Drop',
        areaAffected: 'Wind Speeds 165 km/h',
        pageUrl: 'disaster-alerts.html',
        summary: 'Autonomous cloud vortex recognition identified central eye condensation with severe coastal landfall trajectory within 36 hours.'
    },
    {
        id: 'sahara_desert',
        title: 'Sahel Vegetation Depletion',
        category: 'Change Detection',
        icon: 'fa-arrows-rotate',
        color: '#eab308',
        hexColor: 0xeab308,
        lat: 14.5,
        lon: 17.8,
        location: 'Lake Chad Basin, Sahel',
        confidence: '88.7%',
        severity: 'Ecological Shift',
        detectionType: 'Soil Moisture & Aridity Index',
        areaAffected: '-22% Surface Water Extent',
        pageUrl: 'change-detection.html',
        summary: '5-year multi-sensor comparison reveals severe arid boundary migration and pastoral vegetation stress.'
    }
];

// Geo-Coordinates Math Helpers
function latLongToVector3(lat, lon, radius) {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lon + 180) * (Math.PI / 180);

    const x = -(radius * Math.sin(phi) * Math.cos(theta));
    const z = (radius * Math.sin(phi) * Math.sin(theta));
    const y = (radius * Math.cos(phi));

    return new THREE.Vector3(x, y, z);
}

function vector3ToLatLong(vector, radius = EarthApp.EARTH_RADIUS) {
    const clampedY = Math.max(-radius, Math.min(radius, vector.y));
    const phi = Math.acos(clampedY / radius);
    const lat = 90 - (phi * 180 / Math.PI);
    const theta = Math.atan2(vector.z, -vector.x);
    let lon = (theta * 180 / Math.PI) - 180;
    while (lon < -180) lon += 360;
    while (lon > 180) lon -= 360;
    return {
        lat: parseFloat(lat.toFixed(4)),
        lon: parseFloat(lon.toFixed(4))
    };
}

function setupAIMarkers() {
    AI_DETECTION_MARKERS.forEach((marker) => {
        const markerPos = latLongToVector3(marker.lat, marker.lon, EarthApp.EARTH_RADIUS * 1.02);
        const markerGroup = new THREE.Group();
        markerGroup.position.copy(markerPos);
        markerGroup.lookAt(markerPos.clone().multiplyScalar(2));

        const pinGeo = new THREE.SphereGeometry(0.22, 16, 16);
        const pinMat = new THREE.MeshBasicMaterial({ color: marker.hexColor });
        const pinMesh = new THREE.Mesh(pinGeo, pinMat);
        markerGroup.add(pinMesh);

        const ringGeo = new THREE.RingGeometry(0.3, 0.48, 32);
        const ringMat = new THREE.MeshBasicMaterial({
            color: marker.hexColor,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.85
        });
        const ringMesh = new THREE.Mesh(ringGeo, ringMat);
        markerGroup.add(ringMesh);

        const ringGeo2 = new THREE.RingGeometry(0.6, 0.72, 32);
        const ringMat2 = new THREE.MeshBasicMaterial({
            color: marker.hexColor,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.45
        });
        const ringMesh2 = new THREE.Mesh(ringGeo2, ringMat2);
        markerGroup.add(ringMesh2);

        const beamGeo = new THREE.CylinderGeometry(0.02, 0.05, 1.2, 8);
        const beamMat = new THREE.MeshBasicMaterial({
            color: marker.hexColor,
            transparent: true,
            opacity: 0.6
        });
        const beamMesh = new THREE.Mesh(beamGeo, beamMat);
        beamMesh.position.z = 0.6;
        beamMesh.rotation.x = Math.PI / 2;
        markerGroup.add(beamMesh);

        markerGroup.userData = {
            isAIMarker: true,
            data: marker,
            rings: [ringMesh, ringMesh2],
            pinMesh: pinMesh
        };

        EarthApp.markersGroup.add(markerGroup);
        EarthApp.aiMarkers.push({
            group: markerGroup,
            data: marker,
            ring1: ringMesh,
            ring2: ringMesh2,
            pulsePhase: Math.random() * Math.PI * 2
        });
    });

    populateAIFeedUI();
    populateSatellitesFeedUI();
}

function setupCountryWeatherPins() {
    if (typeof NationalWeatherService === 'undefined' || !NationalWeatherService.countries) return;

    EarthApp.countryPinsGroup.clear();
    EarthApp.countryPins = [];

    NationalWeatherService.countries.forEach((c) => {
        const pinPos = latLongToVector3(c.lat, c.lon, EarthApp.EARTH_RADIUS * 1.015);
        const pinGroup = new THREE.Group();
        pinGroup.position.copy(pinPos);
        pinGroup.lookAt(pinPos.clone().multiplyScalar(2));

        const coreGeo = new THREE.SphereGeometry(0.18, 12, 12);
        const coreMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
        const coreMesh = new THREE.Mesh(coreGeo, coreMat);
        pinGroup.add(coreMesh);

        const ringGeo = new THREE.RingGeometry(0.24, 0.42, 24);
        const ringMat = new THREE.MeshBasicMaterial({
            color: 0x00d9ff,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.7
        });
        const ringMesh = new THREE.Mesh(ringGeo, ringMat);
        pinGroup.add(ringMesh);

        const stalkGeo = new THREE.CylinderGeometry(0.015, 0.035, 0.9, 6);
        const stalkMat = new THREE.MeshBasicMaterial({
            color: 0x38bdf8,
            transparent: true,
            opacity: 0.75
        });
        const stalkMesh = new THREE.Mesh(stalkGeo, stalkMat);
        stalkMesh.position.z = 0.45;
        stalkMesh.rotation.x = Math.PI / 2;
        pinGroup.add(stalkMesh);

        pinGroup.userData = {
            isCountryMarker: true,
            data: c,
            ring: ringMesh
        };

        EarthApp.countryPinsGroup.add(pinGroup);
        EarthApp.countryPins.push({
            group: pinGroup,
            data: c,
            ring: ringMesh,
            pulsePhase: Math.random() * Math.PI * 2
        });
    });

    populateCountryWeatherFeedUI();
}

// ============================================================================
// 9.8 INSIDE-THE-EARTH TARGET PINNING & SUBTERRANEAN STRATIGRAPHY CUTAWAY
// ============================================================================
EarthApp.activePinnedCoords = null;

EarthApp.dropTargetPin = function(lat, lon, label = 'Pinned Location') {
    EarthApp.activePinnedCoords = { lat, lon, label };

    if (EarthApp.targetPinGroup) {
        EarthApp.earthGroup.remove(EarthApp.targetPinGroup);
        EarthApp.targetPinGroup = null;
    }

    const pinGroup = new THREE.Group();

    // 1. Surface Entry Port / Borehole Collar (Radius: 10.0)
    const surfacePos = latLongToVector3(lat, lon, EarthApp.EARTH_RADIUS);
    const collarGroup = new THREE.Group();
    collarGroup.position.copy(surfacePos);
    collarGroup.lookAt(surfacePos.clone().multiplyScalar(2));

    const collarRingGeo = new THREE.RingGeometry(0.28, 0.55, 32);
    const collarRingMat = new THREE.MeshBasicMaterial({
        color: 0x00d9ff,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.95
    });
    const collarRing = new THREE.Mesh(collarRingGeo, collarRingMat);
    collarGroup.add(collarRing);

    const surfacePulseGeo = new THREE.RingGeometry(0.65, 0.95, 32);
    const surfacePulseMat = new THREE.MeshBasicMaterial({
        color: 0xef4444,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.65
    });
    const surfacePulseMesh = new THREE.Mesh(surfacePulseGeo, surfacePulseMat);
    collarGroup.add(surfacePulseMesh);
    pinGroup.add(collarGroup);

    // 2. SUBTERRANEAN GEOLOGICAL STRATIGRAPHY CUTAWAY PILLAR (Entering into radius 5.2)
    const shaftLength = 5.0; // Depth into the Earth interior
    const shaftMidDist = EarthApp.EARTH_RADIUS - (shaftLength / 2);
    const shaftPos = latLongToVector3(lat, lon, shaftMidDist);

    // Central High-Energy Laser Probe Shaft
    const shaftGeo = new THREE.CylinderGeometry(0.05, 0.08, shaftLength, 12);
    const shaftMat = new THREE.MeshBasicMaterial({
        color: 0xef4444,
        transparent: true,
        opacity: 0.9
    });
    const shaftMesh = new THREE.Mesh(shaftGeo, shaftMat);
    shaftMesh.position.copy(shaftPos);
    shaftMesh.lookAt(surfacePos);
    shaftMesh.rotateX(Math.PI / 2);
    pinGroup.add(shaftMesh);

    // Strata Layer 1: Topsoil & Urban Base (Depth -0.8)
    const topsoilPos = latLongToVector3(lat, lon, EarthApp.EARTH_RADIUS - 0.7);
    const topsoilGeo = new THREE.CylinderGeometry(0.32, 0.35, 0.7, 16);
    const topsoilMat = new THREE.MeshBasicMaterial({
        color: 0xd97706,
        transparent: true,
        opacity: 0.75,
        wireframe: true
    });
    const topsoilMesh = new THREE.Mesh(topsoilGeo, topsoilMat);
    topsoilMesh.position.copy(topsoilPos);
    topsoilMesh.lookAt(surfacePos);
    topsoilMesh.rotateX(Math.PI / 2);
    pinGroup.add(topsoilMesh);

    // Strata Layer 2: Groundwater & Aquifer Reservoir (Depth -1.8)
    const aquiferPos = latLongToVector3(lat, lon, EarthApp.EARTH_RADIUS - 1.8);
    const aquiferGeo = new THREE.CylinderGeometry(0.38, 0.42, 0.9, 16);
    const aquiferMat = new THREE.MeshBasicMaterial({
        color: 0x0ea5e9,
        transparent: true,
        opacity: 0.8,
        wireframe: true
    });
    const aquiferMesh = new THREE.Mesh(aquiferGeo, aquiferMat);
    aquiferMesh.position.copy(aquiferPos);
    aquiferMesh.lookAt(surfacePos);
    aquiferMesh.rotateX(Math.PI / 2);
    pinGroup.add(aquiferMesh);

    // Strata Layer 3: Bedrock Lithosphere Granitic Plate (Depth -3.1)
    const lithoPos = latLongToVector3(lat, lon, EarthApp.EARTH_RADIUS - 3.1);
    const lithoGeo = new THREE.CylinderGeometry(0.44, 0.48, 1.1, 16);
    const lithoMat = new THREE.MeshBasicMaterial({
        color: 0x94a3b8,
        transparent: true,
        opacity: 0.75,
        wireframe: true
    });
    const lithoMesh = new THREE.Mesh(lithoGeo, lithoMat);
    lithoMesh.position.copy(lithoPos);
    lithoMesh.lookAt(surfacePos);
    lithoMesh.rotateX(Math.PI / 2);
    pinGroup.add(lithoMesh);

    // Strata Layer 4: Asthenosphere Magma Chamber & Core Beacon (Depth -4.5)
    const magmaPos = latLongToVector3(lat, lon, EarthApp.EARTH_RADIUS - 4.5);
    const magmaGeo = new THREE.CylinderGeometry(0.5, 0.55, 1.2, 16);
    const magmaMat = new THREE.MeshBasicMaterial({
        color: 0xff4500,
        transparent: true,
        opacity: 0.85,
        wireframe: true
    });
    const magmaMesh = new THREE.Mesh(magmaGeo, magmaMat);
    magmaMesh.position.copy(magmaPos);
    magmaMesh.lookAt(surfacePos);
    magmaMesh.rotateX(Math.PI / 2);
    pinGroup.add(magmaMesh);

    // 3. INNER MANTLE CORE PROBE NODE (Anchored INSIDE the Earth at radius: 5.0)
    const coreDepthDist = EarthApp.EARTH_RADIUS - shaftLength;
    const coreDepthPos = latLongToVector3(lat, lon, coreDepthDist);

    const innerNodeGeo = new THREE.SphereGeometry(0.42, 16, 16);
    const innerNodeMat = new THREE.MeshBasicMaterial({
        color: 0xff2200,
        wireframe: false
    });
    const innerNodeMesh = new THREE.Mesh(innerNodeGeo, innerNodeMat);
    innerNodeMesh.position.copy(coreDepthPos);
    pinGroup.add(innerNodeMesh);

    // Inner Depth Pulse Halo
    const innerHaloGeo = new THREE.SphereGeometry(0.75, 16, 16);
    const innerHaloMat = new THREE.MeshBasicMaterial({
        color: 0xffaa00,
        transparent: true,
        opacity: 0.55,
        wireframe: true
    });
    const innerHaloMesh = new THREE.Mesh(innerHaloGeo, innerHaloMat);
    innerHaloMesh.position.copy(coreDepthPos);
    pinGroup.add(innerHaloMesh);

    pinGroup.userData = {
        isTargetPin: true,
        lat: lat,
        lon: lon,
        label: label,
        collarRing: collarRing,
        surfacePulseMesh: surfacePulseMesh,
        innerHaloMesh: innerHaloMesh,
        topsoilMesh: topsoilMesh,
        aquiferMesh: aquiferMesh,
        lithoMesh: lithoMesh,
        magmaMesh: magmaMesh,
        pulsePhase: 0
    };

    EarthApp.earthGroup.add(pinGroup);
    EarthApp.targetPinGroup = pinGroup;

    // Adjust crust opacity to reveal the internal geological strata
    if (EarthApp.earthMesh && EarthApp.earthMesh.material.uniforms) {
        EarthApp.earthMesh.material.uniforms.crustOpacity.value = 0.78;
    }
};

EarthApp.diveToDepth = function(depthLevel) {
    if (!EarthApp.activePinnedCoords) return;
    const { lat, lon } = EarthApp.activePinnedCoords;
    const targetPos = latLongToVector3(lat, lon, EarthApp.EARTH_RADIUS);
    const worldPos = targetPos.clone();
    if (EarthApp.earthGroup) {
        worldPos.applyEuler(EarthApp.earthGroup.rotation);
    }

    let targetDistance = 13.5;
    let targetCrustOpacity = 0.85;

    if (depthLevel === 'aquifer') {
        targetDistance = 11.2;
        targetCrustOpacity = 0.70;
    } else if (depthLevel === 'lithosphere') {
        targetDistance = 9.8;
        targetCrustOpacity = 0.55;
    } else if (depthLevel === 'mantle') {
        targetDistance = 8.2;
        targetCrustOpacity = 0.38;
    } else {
        targetDistance = 13.5;
        targetCrustOpacity = 0.85;
    }

    if (EarthApp.earthMesh && EarthApp.earthMesh.material.uniforms && typeof gsap !== 'undefined') {
        gsap.to(EarthApp.earthMesh.material.uniforms.crustOpacity, {
            value: targetCrustOpacity,
            duration: 1.2
        });
    }

    flyToPosition(worldPos, targetDistance);
};

EarthApp.removeTargetPin = function() {
    if (EarthApp.targetPinGroup) {
        EarthApp.earthGroup.remove(EarthApp.targetPinGroup);
        EarthApp.targetPinGroup = null;
    }
    if (EarthApp.earthMesh && EarthApp.earthMesh.material.uniforms) {
        EarthApp.earthMesh.material.uniforms.crustOpacity.value = 0.92;
    }
};

function toggleSubsurfaceView() {
    EarthApp.isSubsurfaceMode = !EarthApp.isSubsurfaceMode;
    const btn = document.getElementById('btnSubsurface');
    if (btn) {
        btn.classList.toggle('active', EarthApp.isSubsurfaceMode);
    }
    if (EarthApp.earthMesh && EarthApp.earthMesh.material.uniforms) {
        EarthApp.earthMesh.material.uniforms.crustOpacity.value = EarthApp.isSubsurfaceMode ? 0.78 : 1.0;
    }
    if (EarthApp.innerCoreMesh) {
        EarthApp.innerCoreMesh.visible = EarthApp.isSubsurfaceMode;
    }
    if (EarthApp.mantleGridMesh) {
        EarthApp.mantleGridMesh.visible = EarthApp.isSubsurfaceMode;
    }
}

function togglePinMode() {
    EarthApp.isPinMode = !EarthApp.isPinMode;
    const btn = document.getElementById('btnPinMode');
    if (btn) {
        btn.classList.toggle('active', EarthApp.isPinMode);
        btn.innerHTML = EarthApp.isPinMode ?
            '<i class="fa-solid fa-location-crosshairs"></i> Inside Pin: ON' :
            '<i class="fa-solid fa-location-dot"></i> Pin Inside Earth';
    }

    const container = document.getElementById('earth-canvas-container');
    if (container) {
        container.style.cursor = EarthApp.isPinMode ? 'crosshair' : 'default';
    }
}

// ============================================================================
// 10. ANIMATION LOOP & ROTATION
// ============================================================================
function animate() {
    requestAnimationFrame(animate);

    const time = performance.now() * 0.001;

    // 10.1 Planetary Axial Auto-Rotation
    if (EarthApp.autoRotate && EarthApp.earthGroup) {
        EarthApp.earthGroup.rotation.y += EarthApp.rotationSpeed;
    }

    // 10.2 Clouds Layer Independent Drift
    if (EarthApp.cloudsMesh && EarthApp.layers.clouds) {
        EarthApp.cloudsMesh.rotation.y += EarthApp.cloudsSpeed;
    }

    // 10.3 Inner Molten Core Pulsing Glow
    if (EarthApp.innerCoreMesh && EarthApp.isSubsurfaceMode) {
        const pulse = (Math.sin(time * 2.5) + 1) * 0.5;
        EarthApp.innerCoreMesh.scale.setScalar(0.98 + pulse * 0.04);
    }

    // 10.4 Orbiting Satellites Propagation
    if (EarthApp.layers.satellites) {
        EarthApp.satellites.forEach((sat) => {
            sat.angle += sat.speed;
            
            const r = sat.data.radius;
            const inc = (sat.data.inclination * Math.PI) / 180;
            
            const rawX = Math.cos(sat.angle) * r;
            const rawZ = Math.sin(sat.angle) * r;
            
            const x = rawX * Math.cos(inc);
            const y = rawX * Math.sin(inc);
            const z = rawZ;

            sat.group.position.set(x, y, z);
            sat.group.lookAt(x - Math.sin(sat.angle), y, z + Math.cos(sat.angle));

            if (sat.group.userData.glow) {
                const pulse = (Math.sin(time * 4 + sat.angle) + 1) * 0.5;
                sat.group.userData.glow.scale.setScalar(0.8 + pulse * 0.5);
                sat.group.userData.glow.material.opacity = 0.3 + pulse * 0.4;
            }
        });
    }

    // 10.5 AI Marker Radar Rings Pulsing Animation
    if (EarthApp.layers.aiMarkers) {
        EarthApp.aiMarkers.forEach((m) => {
            m.pulsePhase += 0.04;
            const s1 = 1 + (Math.sin(m.pulsePhase) + 1) * 0.4;
            const s2 = 1 + (Math.cos(m.pulsePhase) + 1) * 0.4;
            m.ring1.scale.set(s1, s1, 1);
            m.ring2.scale.set(s2, s2, 1);
            m.ring1.material.opacity = 0.85 - (s1 - 1) * 0.7;
            m.ring2.material.opacity = 0.65 - (s2 - 1) * 0.5;
        });
    }

    // 10.6 National Weather Pins Pulsing Animation
    if (EarthApp.layers.countryPins) {
        EarthApp.countryPins.forEach((cp) => {
            cp.pulsePhase += 0.035;
            const s = 1 + (Math.sin(cp.pulsePhase) + 1) * 0.3;
            cp.ring.scale.set(s, s, 1);
            cp.ring.material.opacity = 0.75 - (s - 1) * 0.6;
        });
    }

    // 10.7 Inside-the-Earth Target Pinning Pulsing Animation
    if (EarthApp.targetPinGroup && EarthApp.targetPinGroup.userData) {
        const ud = EarthApp.targetPinGroup.userData;
        ud.pulsePhase += 0.045;
        const s = 1 + (Math.sin(ud.pulsePhase) + 1) * 0.5;
        if (ud.surfacePulseMesh) {
            ud.surfacePulseMesh.scale.set(s, s, 1);
            ud.surfacePulseMesh.material.opacity = 0.7 - (s - 1) * 0.5;
        }
        if (ud.innerHaloMesh) {
            ud.innerHaloMesh.scale.setScalar(0.9 + (Math.sin(ud.pulsePhase * 1.5) + 1) * 0.25);
        }
        if (ud.collarRing) {
            ud.collarRing.rotation.z += 0.015;
        }
    }

    // 10.8 Camera Smooth OrbitControls Update
    EarthApp.controls.update();

    // 10.9 Render Frame
    EarthApp.renderer.render(EarthApp.scene, EarthApp.camera);
}

// ============================================================================
// 11. INTERACTIVITY: RAYCASTING, CLICKS & FLY-TO
// ============================================================================
function setupEventListeners() {
    window.addEventListener('resize', onWindowResize);

    const canvas = EarthApp.renderer.domElement;
    canvas.addEventListener('click', onCanvasClick);
    canvas.addEventListener('mousemove', onCanvasMouseMove);

    EarthApp.controls.addEventListener('start', () => {
        EarthApp.wasAutoRotating = EarthApp.autoRotate;
    });
}

function onWindowResize() {
    const container = document.getElementById('earth-canvas-container');
    if (!container || !EarthApp.renderer || !EarthApp.camera) return;

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    EarthApp.camera.aspect = width / height;
    EarthApp.camera.updateProjectionMatrix();
    EarthApp.renderer.setSize(width, height);
}

function onCanvasMouseMove(event) {
    const rect = EarthApp.renderer.domElement.getBoundingClientRect();
    EarthApp.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    EarthApp.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    EarthApp.raycaster.setFromCamera(EarthApp.mouse, EarthApp.camera);

    const interactiveObjects = [];
    if (EarthApp.layers.satellites) EarthApp.satellites.forEach(s => interactiveObjects.push(s.group));
    if (EarthApp.layers.aiMarkers) EarthApp.aiMarkers.forEach(m => interactiveObjects.push(m.group));
    if (EarthApp.layers.countryPins) EarthApp.countryPins.forEach(c => interactiveObjects.push(c.group));

    const intersects = EarthApp.raycaster.intersectObjects(interactiveObjects, true);

    const cursorElem = document.body;
    if (intersects.length > 0) {
        cursorElem.style.cursor = 'pointer';
        
        let root = intersects[0].object;
        while (root.parent && !root.userData.isSatellite && !root.userData.isAIMarker && !root.userData.isCountryMarker) {
            root = root.parent;
        }

        if (root.userData.isSatellite) {
            showHoverTooltip(event, `🛰️ ${root.userData.data.name} (${root.userData.data.altitude} km)`);
        } else if (root.userData.isAIMarker) {
            showHoverTooltip(event, `📍 ${root.userData.data.title} [${root.userData.data.confidence}]`);
        } else if (root.userData.isCountryMarker) {
            showHoverTooltip(event, `🌤️ ${root.userData.data.flag} ${root.userData.data.name} • Click for National Weather`);
        }
    } else if (EarthApp.isPinMode) {
        cursorElem.style.cursor = 'crosshair';
        
        if (EarthApp.earthMesh) {
            const earthIntersects = EarthApp.raycaster.intersectObject(EarthApp.earthMesh, false);
            if (earthIntersects.length > 0) {
                const localPt = EarthApp.earthMesh.worldToLocal(earthIntersects[0].point.clone());
                const coords = vector3ToLatLong(localPt, EarthApp.EARTH_RADIUS);
                showHoverTooltip(event, `📌 Click to Pin Inside Earth: ${Math.abs(coords.lat).toFixed(2)}°${coords.lat >= 0 ? 'N' : 'S'}, ${Math.abs(coords.lon).toFixed(2)}°${coords.lon >= 0 ? 'E' : 'W'}`);
                return;
            }
        }
        hideHoverTooltip();
    } else {
        cursorElem.style.cursor = 'default';
        hideHoverTooltip();
    }
}

function onCanvasClick(event) {
    const rect = EarthApp.renderer.domElement.getBoundingClientRect();
    EarthApp.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    EarthApp.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    EarthApp.raycaster.setFromCamera(EarthApp.mouse, EarthApp.camera);

    // 1. Check interactive objects first (Satellites, AI Markers, Country Pins)
    const interactiveObjects = [];
    if (EarthApp.layers.satellites) EarthApp.satellites.forEach(s => interactiveObjects.push(s.group));
    if (EarthApp.layers.aiMarkers) EarthApp.aiMarkers.forEach(m => interactiveObjects.push(m.group));
    if (EarthApp.layers.countryPins) EarthApp.countryPins.forEach(c => interactiveObjects.push(c.group));

    const intersects = EarthApp.raycaster.intersectObjects(interactiveObjects, true);

    if (intersects.length > 0) {
        let root = intersects[0].object;
        while (root.parent && !root.userData.isSatellite && !root.userData.isAIMarker && !root.userData.isCountryMarker) {
            root = root.parent;
        }

        if (root.userData.isSatellite) {
            selectSatellite(root.userData.data);
            return;
        } else if (root.userData.isAIMarker) {
            selectAIMarker(root.userData.data);
            return;
        } else if (root.userData.isCountryMarker) {
            if (typeof NationalWeatherService !== 'undefined') {
                NationalWeatherService.openNationalWeather(root.userData.data.code);
            }
            return;
        }
    }

    // 2. Direct Click on Earth Sphere: Drive 3D Pin Deep INSIDE the Earth & Zoom Close In!
    if (EarthApp.earthMesh) {
        const earthIntersects = EarthApp.raycaster.intersectObject(EarthApp.earthMesh, false);
        if (earthIntersects.length > 0) {
            const hit = earthIntersects[0];
            
            const localPoint = EarthApp.earthMesh.worldToLocal(hit.point.clone());
            const coords = vector3ToLatLong(localPoint, EarthApp.EARTH_RADIUS);

            // Pin inside the Earth, deep zoom, and fetch live weather + subsurface telemetry
            if (typeof NationalWeatherService !== 'undefined') {
                NationalWeatherService.openParticularPlaceWeather(coords.lat, coords.lon);
            }
        }
    }
}

function showHoverTooltip(event, text) {
    let tip = document.getElementById('earth-hover-tooltip');
    if (!tip) {
        tip = document.createElement('div');
        tip.id = 'earth-hover-tooltip';
        tip.className = 'earth-tooltip';
        document.body.appendChild(tip);
    }
    tip.innerHTML = text;
    tip.style.left = (event.clientX + 15) + 'px';
    tip.style.top = (event.clientY + 15) + 'px';
    tip.style.display = 'block';
}

function hideHoverTooltip() {
    const tip = document.getElementById('earth-hover-tooltip');
    if (tip) tip.style.display = 'none';
}

/**
 * Smooth Cinematic Camera Fly-To Zoom
 */
function flyToPosition(targetPos, distance = 22, onComplete = null) {
    if (typeof gsap === 'undefined') {
        EarthApp.camera.position.set(targetPos.x * 1.5, targetPos.y * 1.5, targetPos.z * 1.5);
        EarthApp.controls.target.copy(targetPos);
        if (onComplete) onComplete();
        return;
    }

    const direction = targetPos.clone().normalize();
    const endPos = direction.multiplyScalar(distance);

    gsap.to(EarthApp.camera.position, {
        x: endPos.x,
        y: endPos.y,
        z: endPos.z,
        duration: 1.8,
        ease: 'power3.inOut',
        onUpdate: () => {
            EarthApp.controls.update();
        },
        onComplete: () => {
            if (onComplete) onComplete();
        }
    });
}

// ============================================================================
// 12. SELECTION HANDLERS & MODAL INSPECTORS
// ============================================================================
function selectSatellite(satData) {
    const satObj = EarthApp.satellites.find(s => s.data.id === satData.id);
    if (!satObj) return;

    const worldPos = new THREE.Vector3();
    satObj.group.getWorldPosition(worldPos);
    flyToPosition(worldPos, satData.radius * 1.4);

    const inspector = document.getElementById('inspectorCard');
    if (!inspector) return;

    document.getElementById('inspectorTitle').innerHTML = `<i class="fa-solid fa-satellite" style="color:${satData.color}"></i> ${satData.name}`;
    document.getElementById('inspectorBadge').className = 'badge-blue';
    document.getElementById('inspectorBadge').innerText = satData.type;
    
    document.getElementById('inspectorBody').innerHTML = `
        <p class="insp-desc">${satData.description}</p>
        <div class="insp-grid">
            <div class="insp-stat">
                <span>Orbital Altitude:</span>
                <strong>${satData.altitude} km</strong>
            </div>
            <div class="insp-stat">
                <span>Velocity:</span>
                <strong>${satData.speed.toLocaleString()} km/h</strong>
            </div>
            <div class="insp-stat">
                <span>Orbital Period:</span>
                <strong>${satData.period} mins</strong>
            </div>
            <div class="insp-stat">
                <span>Inclination:</span>
                <strong>${satData.inclination}°</strong>
            </div>
        </div>
        <div class="insp-sensor">
            <span>Primary Sensor Payload:</span>
            <p><strong>${satData.sensor}</strong></p>
        </div>
        <div class="insp-status">
            <span>Live Telemetry Link:</span>
            <span class="status-active"><i class="fa-solid fa-signal"></i> ${satData.status}</span>
        </div>
        <div class="insp-actions">
            <button class="btn-close-insp" onclick="closeInspector()"><i class="fa-solid fa-xmark"></i> Close</button>
        </div>
    `;

    inspector.classList.add('active');
}

function selectAIMarker(markerData) {
    const markerPos = latLongToVector3(markerData.lat, markerData.lon, EarthApp.EARTH_RADIUS);
    
    const worldPos = markerPos.clone();
    worldPos.applyEuler(EarthApp.earthGroup.rotation);

    flyToPosition(worldPos, 16);
    EarthApp.dropTargetPin(markerData.lat, markerData.lon, markerData.title);

    const inspector = document.getElementById('inspectorCard');
    if (!inspector) return;

    document.getElementById('inspectorTitle').innerHTML = `<i class="fa-solid ${markerData.icon}" style="color:${markerData.color}"></i> ${markerData.title}`;
    document.getElementById('inspectorBadge').className = 'badge-red';
    document.getElementById('inspectorBadge').innerText = markerData.severity;

    document.getElementById('inspectorBody').innerHTML = `
        <p class="insp-desc">${markerData.summary}</p>
        <div class="insp-grid">
            <div class="insp-stat">
                <span>Location:</span>
                <strong>${markerData.location}</strong>
            </div>
            <div class="insp-stat">
                <span>AI Confidence:</span>
                <strong style="color:${markerData.color}">${markerData.confidence}</strong>
            </div>
            <div class="insp-stat">
                <span>Detection Algorithm:</span>
                <strong>${markerData.detectionType}</strong>
            </div>
            <div class="insp-stat">
                <span>Area Extent:</span>
                <strong>${markerData.areaAffected}</strong>
            </div>
        </div>
        <div class="insp-actions">
            <a href="${markerData.pageUrl}" class="btn-launch-module">
                <i class="fa-solid fa-arrow-up-right-from-square"></i> Open ${markerData.category} Analysis
            </a>
            <button class="btn-close-insp" onclick="closeInspector()"><i class="fa-solid fa-xmark"></i> Dismiss</button>
        </div>
    `;

    inspector.classList.add('active');
}

function closeInspector() {
    const inspector = document.getElementById('inspectorCard');
    if (inspector) inspector.classList.remove('active');
}

function resetEarthView() {
    closeInspector();
    EarthApp.removeTargetPin();
    if (typeof NationalWeatherService !== 'undefined') {
        NationalWeatherService.closeModal();
    }
    flyToPosition(new THREE.Vector3(0, 8, 30), 30);
}

// ============================================================================
// 13. GUIDED AI PLANETARY TOUR & SPEED CONTROLLER
// ============================================================================
EarthApp.tourSpeed = 1.0; // Multiplier: 0.5x, 1x, 2x, 4x

function setTourSpeed(speedMultiplier) {
    EarthApp.tourSpeed = parseFloat(speedMultiplier);

    document.querySelectorAll('#tourSpeedGroup .speed-pill').forEach(pill => {
        pill.classList.remove('active');
    });
    const activePill = document.getElementById(`tourSpeed-${speedMultiplier}x`);
    if (activePill) activePill.classList.add('active');

    // If tour is actively running, reschedule with new speed
    if (EarthApp.isTouring) {
        clearTimeout(EarthApp.tourTimer);
        const stepDelay = Math.round(7500 / EarthApp.tourSpeed);
        EarthApp.tourTimer = setTimeout(runTourStep, stepDelay);
    }
}

function startGuidedTour() {
    EarthApp.isTouring = true;
    EarthApp.tourIndex = 0;
    
    const tourBtn = document.getElementById('btnTour');
    if (tourBtn) {
        tourBtn.innerHTML = '<i class="fa-solid fa-pause"></i> Pause Tour';
        tourBtn.classList.add('active');
    }

    runTourStep();
}

function stopGuidedTour() {
    EarthApp.isTouring = false;
    clearTimeout(EarthApp.tourTimer);
    
    const tourBtn = document.getElementById('btnTour');
    if (tourBtn) {
        tourBtn.innerHTML = '<i class="fa-solid fa-play"></i> Tour';
        tourBtn.classList.remove('active');
    }
}

function toggleGuidedTour() {
    if (EarthApp.isTouring) {
        stopGuidedTour();
    } else {
        startGuidedTour();
    }
}

function runTourStep() {
    if (!EarthApp.isTouring) return;

    if (EarthApp.tourIndex >= AI_DETECTION_MARKERS.length) {
        EarthApp.tourIndex = 0;
    }

    const currentMarker = AI_DETECTION_MARKERS[EarthApp.tourIndex];
    selectAIMarker(currentMarker);

    EarthApp.tourIndex++;
    const stepDelay = Math.round(7500 / EarthApp.tourSpeed);
    EarthApp.tourTimer = setTimeout(runTourStep, stepDelay);
}

// ============================================================================
// 14. UI FEEDS, PLACE SEARCH & CONTROLS BINDINGS
// ============================================================================
function populateAIFeedUI() {
    const feedContainer = document.getElementById('aiDetectionList');
    if (!feedContainer) return;

    feedContainer.innerHTML = '';
    AI_DETECTION_MARKERS.forEach((m) => {
        const item = document.createElement('div');
        item.className = 'hud-list-item';
        item.innerHTML = `
            <div class="hud-item-icon" style="background:${m.color}22; color:${m.color}; border-color:${m.color}">
                <i class="fa-solid ${m.icon}"></i>
            </div>
            <div class="hud-item-info">
                <h4>${m.title}</h4>
                <small>${m.location} • <b style="color:${m.color}">${m.confidence}</b></small>
            </div>
            <div class="hud-item-action">
                <i class="fa-solid fa-chevron-right"></i>
            </div>
        `;
        item.onclick = () => selectAIMarker(m);
        feedContainer.appendChild(item);
    });
}

function populateSatellitesFeedUI() {
    const satContainer = document.getElementById('satelliteList');
    if (!satContainer) return;

    satContainer.innerHTML = '';
    SATELLITE_DATA.forEach((s) => {
        const item = document.createElement('div');
        item.className = 'hud-list-item';
        item.innerHTML = `
            <div class="hud-item-icon" style="background:#3b82f622; color:#38bdf8; border-color:#38bdf8">
                <i class="fa-solid fa-satellite"></i>
            </div>
            <div class="hud-item-info">
                <h4>${s.name}</h4>
                <small>Alt: ${s.altitude}km • ${s.type}</small>
            </div>
            <div class="hud-item-action">
                <span class="live-dot-green"></span>
            </div>
        `;
        item.onclick = () => selectSatellite(s);
        satContainer.appendChild(item);
    });
}

function populateCountryWeatherFeedUI() {
    const container = document.getElementById('countryWeatherList');
    if (!container || typeof NationalWeatherService === 'undefined') return;

    container.innerHTML = '';
    NationalWeatherService.countries.forEach((c) => {
        const item = document.createElement('div');
        item.className = 'hud-list-item country-item';
        item.setAttribute('data-country-name', c.name.toLowerCase());
        item.setAttribute('data-country-code', c.code.toLowerCase());
        item.innerHTML = `
            <div class="hud-item-flag">${c.flag}</div>
            <div class="hud-item-info">
                <h4>${c.name}</h4>
                <small>${c.capital} • ${c.region}</small>
            </div>
            <div class="hud-item-action">
                <i class="fa-solid fa-cloud-sun" style="color:var(--accent-cyan)"></i>
            </div>
        `;
        item.onclick = () => NationalWeatherService.openNationalWeather(c.code);
        container.appendChild(item);
    });
}

function filterCountryWeather(query) {
    const q = (query || '').toLowerCase().trim();
    const items = document.querySelectorAll('.country-item');
    items.forEach((item) => {
        const name = item.getAttribute('data-country-name') || '';
        const code = item.getAttribute('data-country-code') || '';
        if (name.includes(q) || code.includes(q)) {
            item.style.display = 'flex';
        } else {
            item.style.display = 'none';
        }
    });
}

// Global Place Search & Autocomplete
let placeSearchTimeout = null;
function setupGlobalPlaceSearch() {
    const searchInput = document.getElementById('globalPlaceSearchInput');
    const dropdown = document.getElementById('placeSearchResultsDropdown');
    if (!searchInput || !dropdown) return;

    searchInput.addEventListener('input', (e) => {
        clearTimeout(placeSearchTimeout);
        const query = e.target.value;
        if (!query || query.trim().length < 2) {
            dropdown.style.display = 'none';
            dropdown.innerHTML = '';
            return;
        }

        dropdown.innerHTML = '<div style="padding:10px; color:#94a3b8; font-size:12px; text-align:center;"><i class="fa-solid fa-spinner fa-spin"></i> Searching planetary places...</div>';
        dropdown.style.display = 'block';

        placeSearchTimeout = setTimeout(async () => {
            if (typeof NationalWeatherService !== 'undefined') {
                const results = await NationalWeatherService.searchGlobalPlaces(query);
                if (results.length === 0) {
                    dropdown.innerHTML = '<div style="padding:10px; color:#94a3b8; font-size:12px; text-align:center;">No matching cities/places found.</div>';
                    return;
                }

                dropdown.innerHTML = results.map(r => `
                    <div class="search-result-item" onclick="selectSearchedPlace(${r.lat}, ${r.lon}, '${r.name.replace(/'/g, "\\'")}', '${(r.country || '').replace(/'/g, "\\'")}')">
                        <span class="res-flag">${r.flag}</span>
                        <div class="res-info">
                            <strong>${r.name}</strong>
                            <small>${r.admin1 ? r.admin1 + ', ' : ''}${r.country} (${r.lat.toFixed(2)}°, ${r.lon.toFixed(2)}°)</small>
                        </div>
                        <i class="fa-solid fa-location-crosshairs" style="color:var(--accent-cyan); font-size:12px;"></i>
                    </div>
                `).join('');
            }
        }, 350);
    });

    document.addEventListener('click', (e) => {
        if (!searchInput.contains(e.target) && !dropdown.contains(e.target)) {
            dropdown.style.display = 'none';
        }
    });
}

function selectSearchedPlace(lat, lon, placeName, countryName) {
    const dropdown = document.getElementById('placeSearchResultsDropdown');
    if (dropdown) dropdown.style.display = 'none';

    const searchInput = document.getElementById('globalPlaceSearchInput');
    if (searchInput) searchInput.value = placeName;

    if (typeof NationalWeatherService !== 'undefined') {
        NationalWeatherService.openParticularPlaceWeather(lat, lon, placeName, countryName);
    }
}

function switchLeftHudTab(tabName) {
    document.querySelectorAll('.hud-tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.hud-tab-content').forEach(c => c.classList.remove('active'));

    const activeBtn = document.getElementById(`tabBtn-${tabName}`);
    const activeContent = document.getElementById(`tabContent-${tabName}`);

    if (activeBtn) activeBtn.classList.add('active');
    if (activeContent) activeContent.classList.add('active');
}

function updateTelemetryHUD() {
    const now = new Date();
    const clockElem = document.getElementById('utcClock');
    if (clockElem) {
        clockElem.innerText = `UTC ${now.toUTCString().slice(17, 25)}`;
    }

    const altElem = document.getElementById('dispCameraAlt');
    if (altElem && EarthApp.camera) {
        const dist = EarthApp.camera.position.length();
        const altKm = Math.round((dist - EarthApp.EARTH_RADIUS) * 637.1);
        altElem.innerText = `${altKm.toLocaleString()} km`;
    }

    const satCountElem = document.getElementById('dispSatCount');
    if (satCountElem) {
        satCountElem.innerText = SATELLITE_DATA.length;
    }

    const anomalyCountElem = document.getElementById('dispAnomalyCount');
    if (anomalyCountElem) {
        anomalyCountElem.innerText = AI_DETECTION_MARKERS.length;
    }

    const countryCountElem = document.getElementById('dispCountryCount');
    if (countryCountElem && typeof NationalWeatherService !== 'undefined') {
        countryCountElem.innerText = NationalWeatherService.countries.length;
    }
}

// Layer Toggle Handlers
function toggleLayer(layerName) {
    if (layerName === 'satellites') {
        EarthApp.layers.satellites = !EarthApp.layers.satellites;
        EarthApp.satelliteGroup.visible = EarthApp.layers.satellites;
    } else if (layerName === 'orbits') {
        EarthApp.layers.orbits = !EarthApp.layers.orbits;
        EarthApp.orbitLinesGroup.visible = EarthApp.layers.orbits;
    } else if (layerName === 'aiMarkers') {
        EarthApp.layers.aiMarkers = !EarthApp.layers.aiMarkers;
        EarthApp.markersGroup.visible = EarthApp.layers.aiMarkers;
    } else if (layerName === 'countryPins') {
        EarthApp.layers.countryPins = !EarthApp.layers.countryPins;
        EarthApp.countryPinsGroup.visible = EarthApp.layers.countryPins;
    } else if (layerName === 'subsurfaceCore') {
        EarthApp.layers.subsurfaceCore = !EarthApp.layers.subsurfaceCore;
        if (EarthApp.innerCoreMesh) EarthApp.innerCoreMesh.visible = EarthApp.layers.subsurfaceCore;
        if (EarthApp.mantleGridMesh) EarthApp.mantleGridMesh.visible = EarthApp.layers.subsurfaceCore;
    } else if (layerName === 'clouds') {
        EarthApp.layers.clouds = !EarthApp.layers.clouds;
        if (EarthApp.cloudsMesh) EarthApp.cloudsMesh.visible = EarthApp.layers.clouds;
    } else if (layerName === 'atmosphere') {
        EarthApp.layers.atmosphere = !EarthApp.layers.atmosphere;
        if (EarthApp.atmosphereMesh) EarthApp.atmosphereMesh.visible = EarthApp.layers.atmosphere;
    } else if (layerName === 'nightLights') {
        EarthApp.layers.nightLights = !EarthApp.layers.nightLights;
        if (EarthApp.earthMesh && EarthApp.earthMesh.material.uniforms) {
            EarthApp.earthMesh.material.uniforms.enableNightLights.value = EarthApp.layers.nightLights ? 1.0 : 0.0;
        }
    } else if (layerName === 'starfield') {
        EarthApp.layers.starfield = !EarthApp.layers.starfield;
        if (EarthApp.starField) EarthApp.starField.visible = EarthApp.layers.starfield;
    }

    const btn = document.getElementById(`toggle-${layerName}`);
    if (btn) {
        btn.classList.toggle('active', EarthApp.layers[layerName]);
    }
}

function setRotationSpeed(speedMultiplier) {
    EarthApp.rotationSpeed = 0.0012 * speedMultiplier;
    EarthApp.cloudsSpeed = 0.0017 * speedMultiplier;
    
    document.querySelectorAll('.speed-pill').forEach(pill => {
        pill.classList.remove('active');
    });
    const activePill = document.getElementById(`speed-${speedMultiplier}x`);
    if (activePill) activePill.classList.add('active');
}

function toggleAutoRotate() {
    EarthApp.autoRotate = !EarthApp.autoRotate;
    const btn = document.getElementById('btnAutoRotate');
    if (btn) {
        btn.classList.toggle('active', EarthApp.autoRotate);
        btn.innerHTML = EarthApp.autoRotate ? 
            '<i class="fa-solid fa-pause"></i> Auto Spin' : 
            '<i class="fa-solid fa-play"></i> Auto Spin';
    }
}

function onSunScrub(value) {
    const angle = (parseFloat(value) / 100) * Math.PI * 2;
    updateSunPosition(angle);
}

// Initialize on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
    init3DEarth();
});
