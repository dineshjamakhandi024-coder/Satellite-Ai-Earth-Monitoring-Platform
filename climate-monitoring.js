// ============================================================
// SATELLITE AI - GOOGLE WEATHER COMPLIANT LIVE CLIMATE ENGINE
// Real-Time Place Geocoding, Hourly Timelines, SVG Spline Graphs & Telemetry
// ============================================================

"use strict";

const API_URL = (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") ? "http://127.0.0.1:8000" : "https://satellite-ai-backend.onrender.com";

let currentTempUnit = "C"; // 'C' or 'F'
let currentGraphMetric = "humidity"; // 'humidity', 'temperature', 'precipitation', 'wind'
let searchDebounceTimer = null;

// Global active weather state
let activeLocationData = {
    name: "Nagadevana Halli, Bengaluru",
    country: "Karnataka, India",
    flag: "🇮🇳",
    lat: 12.93758,
    lon: 77.49681,
    rawTempC: 25,
    rawFeelsLikeC: 26,
    highC: 29,
    lowC: 19,
    conditionText: "Cloudy",
    conditionIcon: "fa-cloud",
    weatherData: null
};

let currentClimateData = {
    temperature: 25,
    rainfall_mm: 0,
    wind_speed: 23,
    humidity: 73,
    aqi: 52,
    cloud_cover: 65,
    region: "Nagadevana Halli, Bengaluru (India)"
};

// ============================================================
// 1. INITIALIZATION & AUTO-LOCATION
// ============================================================
document.addEventListener("DOMContentLoaded", function () {
    startClimateClock();
    initClimateCountryGrid();
    initRadarLoopEngine();
    autoDetectUserLocationOrLoadDefault();

    // Close autocomplete on outside click
    document.addEventListener("click", function (e) {
        const dropdown = document.getElementById("placeSearchDropdown");
        const searchBox = document.querySelector(".search-box-wrapper");
        if (dropdown && searchBox && !searchBox.contains(e.target)) {
            dropdown.classList.remove("show");
        }
    });

    // Close autocomplete on Escape
    document.addEventListener("keydown", function (e) {
        if (e.key === "Escape") {
            const dropdown = document.getElementById("placeSearchDropdown");
            if (dropdown) dropdown.classList.remove("show");
        }
    });
});

// ============================================================
// 2. LIVE UTC CLOCK
// ============================================================
function startClimateClock() {
    const clockEl = document.getElementById("climateClock");
    if (!clockEl) return;

    function update() {
        const now = new Date();
        const hrs = String(now.getUTCHours()).padStart(2, "0");
        const mins = String(now.getUTCMinutes()).padStart(2, "0");
        const secs = String(now.getUTCSeconds()).padStart(2, "0");
        clockEl.textContent = `UTC ${hrs}:${mins}:${secs}`;
    }

    update();
    setInterval(update, 1000);
}

// ============================================================
// 3. AUTO-DETECT USER LOCATION ON STARTUP
// ============================================================
async function autoDetectUserLocationOrLoadDefault() {
    try {
        // Try fast IP geolocation lookup
        const res = await fetch("https://ipapi.co/json/").catch(() => null);
        if (res && res.ok) {
            const ipData = await res.json();
            if (ipData && ipData.latitude && ipData.longitude) {
                const city = ipData.city || "Bengaluru";
                const region = [ipData.region, ipData.country_name].filter(Boolean).join(", ");
                const flag = getCountryFlag(ipData.country_code || "IN");

                // Set search bar value
                const input = document.getElementById("globalPlaceSearchInput");
                if (input) input.value = `${city}, ${region}`;

                await fetchAndDisplayPlaceWeather(ipData.latitude, ipData.longitude, city, region, flag);
                return;
            }
        }
    } catch (e) {
        console.warn("IP Geolocation auto-detection skipped:", e);
    }

    // Default to Nagadevana Halli, Bengaluru (Karnataka, India) matching Google Weather reference
    await searchAndLoadCity("Nagadevana Halli, Bengaluru", "Karnataka, India", 12.93758, 77.49681, "🇮🇳");
}

// ============================================================
// 4. SMART PLACE SEARCH & AUTOCOMPLETE
// ============================================================
function handlePlaceSearchInput(rawQuery) {
    const clearBtn = document.getElementById("btnSearchClear");
    const dropdown = document.getElementById("placeSearchDropdown");

    if (clearBtn) {
        clearBtn.style.display = rawQuery.trim().length > 0 ? "block" : "none";
    }

    clearTimeout(searchDebounceTimer);

    const query = cleanWeatherSearchQuery(rawQuery);

    if (!query || query.length < 2) {
        if (dropdown) {
            dropdown.classList.remove("show");
            dropdown.innerHTML = "";
        }
        return;
    }

    searchDebounceTimer = setTimeout(async () => {
        if (dropdown) {
            dropdown.classList.add("show");
            dropdown.innerHTML = `
                <div style="padding: 14px 18px; color: var(--cyan); font-size: 13px; display: flex; align-items: center; gap: 8px;">
                    <i class="fa-solid fa-spinner fa-spin"></i> Searching Google & Open-Meteo geocoding for "${escapeHtml(query)}"...
                </div>
            `;
        }

        try {
            const results = await fetchGeocodingPlaces(query);
            renderPlaceSearchResults(results, query);
        } catch (err) {
            console.error("Geocoding error:", err);
            if (dropdown) {
                dropdown.innerHTML = `
                    <div style="padding: 14px 18px; color: #ff5252; font-size: 13px;">
                        <i class="fa-solid fa-triangle-exclamation"></i> Location lookup error. Press Enter to search.
                    </div>
                `;
            }
        }
    }, 280);
}

function cleanWeatherSearchQuery(str) {
    if (!str) return "";
    return str
        .replace(/\b(weather|in|forecast|live|now|temperature|temp|climate|today)\b/gi, "")
        .trim()
        .replace(/\s+/g, " ");
}

async function fetchGeocodingPlaces(query) {
    // 1. Check Open-Meteo Geocoding
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=8&language=en&format=json`;
    const res = await fetch(url);
    if (res.ok) {
        const data = await res.json();
        if (data && data.results && data.results.length > 0) {
            return data.results.map((r) => ({
                id: r.id,
                name: r.name,
                country: r.country || "",
                countryCode: r.country_code || "",
                admin1: [r.admin2, r.admin1].filter(Boolean).join(", ") || "",
                lat: r.latitude,
                lon: r.longitude,
                flag: getCountryFlag(r.country_code)
            }));
        }
    }

    // 2. OpenStreetMap / Nominatim Fallback for micro-neighborhoods
    try {
        const nomUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5`;
        const nomRes = await fetch(nomUrl, { headers: { "User-Agent": "SatelliteAI-Weather/2.0" } });
        if (nomRes.ok) {
            const nomData = await nomRes.json();
            if (nomData && nomData.length > 0) {
                return nomData.map((n) => {
                    const parts = (n.display_name || "").split(",");
                    const mainName = parts[0] ? parts[0].trim() : query;
                    const subDesc = parts.slice(1, 3).map((p) => p.trim()).join(", ");
                    return {
                        id: n.place_id,
                        name: mainName,
                        country: parts[parts.length - 1] ? parts[parts.length - 1].trim() : "Earth",
                        countryCode: "",
                        admin1: subDesc,
                        lat: parseFloat(n.lat),
                        lon: parseFloat(n.lon),
                        flag: "📍"
                    };
                });
            }
        }
    } catch (e) {
        console.log("Nominatim fallback skipped:", e);
    }

    return [];
}

function renderPlaceSearchResults(results, originalQuery) {
    const dropdown = document.getElementById("placeSearchDropdown");
    if (!dropdown) return;

    if (!results || results.length === 0) {
        dropdown.innerHTML = `
            <div style="padding: 14px 18px; color: var(--text-muted); font-size: 13px;">
                <i class="fa-solid fa-circle-question"></i> No places found matching "${escapeHtml(originalQuery)}". Try searching "Bengaluru", "Nagadevana Halli", etc.
            </div>
        `;
        dropdown.classList.add("show");
        return;
    }

    dropdown.innerHTML = results.map((place) => {
        const sub = [place.admin1, place.country].filter(Boolean).join(", ");
        const coordsStr = `${Math.abs(place.lat).toFixed(2)}° ${place.lat >= 0 ? "N" : "S"}, ${Math.abs(place.lon).toFixed(2)}° ${place.lon >= 0 ? "E" : "W"}`;
        const escapedPlace = JSON.stringify(place).replace(/"/g, "&quot;");

        return `
            <div class="search-result-item" onclick="selectSearchedPlace(${escapedPlace})">
                <div class="search-item-info">
                    <span class="search-item-flag">${place.flag || "📍"}</span>
                    <div class="search-item-names">
                        <h4>${escapeHtml(place.name)}</h4>
                        <small>${escapeHtml(sub)}</small>
                    </div>
                </div>
                <span class="search-item-coords">${coordsStr}</span>
            </div>
        `;
    }).join("");

    dropdown.classList.add("show");
}

function clearPlaceSearch() {
    const input = document.getElementById("globalPlaceSearchInput");
    const clearBtn = document.getElementById("btnSearchClear");
    const dropdown = document.getElementById("placeSearchDropdown");

    if (input) {
        input.value = "";
        input.focus();
    }
    if (clearBtn) clearBtn.style.display = "none";
    if (dropdown) {
        dropdown.classList.remove("show");
        dropdown.innerHTML = "";
    }
}

async function handlePlaceSearchSubmit(e) {
    if (e) e.preventDefault();

    const input = document.getElementById("globalPlaceSearchInput");
    const rawQuery = input ? input.value.trim() : "";
    if (!rawQuery) return false;

    const query = cleanWeatherSearchQuery(rawQuery);

    const dropdown = document.getElementById("placeSearchDropdown");
    if (dropdown) dropdown.classList.remove("show");

    showSearchLoading(`Targeting sensors on "${query}"...`);

    try {
        const results = await fetchGeocodingPlaces(query);
        if (results && results.length > 0) {
            await selectSearchedPlace(results[0]);
        } else {
            alert(`No location found matching "${rawQuery}". Please try another city.`);
            hideSearchLoading();
        }
    } catch (err) {
        console.error("Search submit error:", err);
        hideSearchLoading();
    }

    return false;
}

async function selectSearchedPlace(place) {
    const dropdown = document.getElementById("placeSearchDropdown");
    const input = document.getElementById("globalPlaceSearchInput");
    if (dropdown) dropdown.classList.remove("show");

    const sub = [place.admin1, place.country].filter(Boolean).join(", ");
    if (input) input.value = `${place.name}, ${sub}`;

    await fetchAndDisplayPlaceWeather(place.lat, place.lon, place.name, sub || place.country, place.flag || "📍");
}

async function searchAndLoadCity(cityName, countryName, lat, lon, flag) {
    const input = document.getElementById("globalPlaceSearchInput");
    const clearBtn = document.getElementById("btnSearchClear");
    if (input) input.value = `${cityName}, ${countryName}`;
    if (clearBtn) clearBtn.style.display = "block";

    document.querySelectorAll(".region-btn").forEach((b) => b.classList.remove("active"));

    await fetchAndDisplayPlaceWeather(lat, lon, cityName, countryName, flag);
}

// ============================================================
// 5. GPS GEOLOCATION
// ============================================================
function locateUserAndFetchWeather() {
    const btn = document.getElementById("btnUseMyLocation");

    if (!navigator.geolocation) {
        alert("Geolocation is not supported by your browser.");
        return;
    }

    if (btn) {
        btn.disabled = true;
        btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Locating GPS...`;
    }

    showSearchLoading("Acquiring GPS orbital lock for your position...");

    navigator.geolocation.getCurrentPosition(
        async (pos) => {
            const lat = pos.coords.latitude;
            const lon = pos.coords.longitude;

            let cityName = "Your Current Location";
            let countryName = "Local Region";
            let flag = "📍";

            try {
                const geoUrl = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&zoom=14`;
                const geoRes = await fetch(geoUrl, { headers: { "User-Agent": "SatelliteAI-Weather/2.0" } });
                if (geoRes.ok) {
                    const geoData = await geoRes.json();
                    if (geoData && geoData.address) {
                        const addr = geoData.address;
                        cityName = addr.suburb || addr.neighbourhood || addr.city || addr.town || addr.village || "Local Sector";
                        countryName = [addr.state || addr.county, addr.country].filter(Boolean).join(", ");
                        flag = getCountryFlag(addr.country_code) || "📍";
                    }
                }
            } catch (e) {
                console.log("Reverse geocode fallback:", e);
            }

            const input = document.getElementById("globalPlaceSearchInput");
            if (input) input.value = `${cityName}, ${countryName} (GPS)`;

            await fetchAndDisplayPlaceWeather(lat, lon, cityName, countryName, flag);

            if (btn) {
                btn.disabled = false;
                btn.innerHTML = `<i class="fa-solid fa-location-crosshairs"></i> <span>Use My Location</span>`;
            }
        },
        (err) => {
            console.warn("Geolocation error:", err);
            alert("Could not obtain GPS position. Please check browser location permissions.");
            hideSearchLoading();
            if (btn) {
                btn.disabled = false;
                btn.innerHTML = `<i class="fa-solid fa-location-crosshairs"></i> <span>Use My Location</span>`;
            }
        },
        { timeout: 10000, enableHighAccuracy: true }
    );
}

// ============================================================
// 6. FETCH REAL-TIME WEATHER (OPEN-METEO + AIR QUALITY)
// ============================================================
async function fetchAndDisplayPlaceWeather(lat, lon, placeName, countryName, flag = "📍") {
    showSearchLoading(`Streaming real-time weather & telemetry for ${placeName}...`);

    try {
        const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,cloud_cover,surface_pressure,wind_speed_10m,wind_direction_10m,wind_gusts_10m&hourly=temperature_2m,relative_humidity_2m,precipitation_probability,precipitation,weather_code,uv_index,visibility,dew_point_2m,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,precipitation_sum,sunrise,sunset,uv_index_max&timezone=auto`;
        const aqiUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,ozone,european_aqi,us_aqi`;

        const [weatherRes, aqiRes] = await Promise.all([
            fetch(weatherUrl).then((r) => (r.ok ? r.json() : null)),
            fetch(aqiUrl).then((r) => (r.ok ? r.json() : null)).catch(() => null)
        ]);

        if (!weatherRes || !weatherRes.current) {
            throw new Error("Unable to retrieve weather feed.");
        }

        const cur = weatherRes.current;
        const hourly = weatherRes.hourly || {};
        const daily = weatherRes.daily || {};

        // Parse Weather Condition & Icon
        const wInfo = getWeatherInfo(cur.weather_code || 0, cur.is_day);

        // Parse AQI
        let aqiScore = 52;
        let aqiText = "Satisfactory air quality";
        let aqiBadge = "badge-good";
        let pm25Val = 14.2;

        if (aqiRes && aqiRes.current) {
            const ac = aqiRes.current;
            if (ac.pm2_5 !== undefined) pm25Val = ac.pm2_5;

            // Calculate Indian / US Standard AQI
            if (ac.us_aqi !== undefined && ac.us_aqi > 0) {
                aqiScore = ac.us_aqi;
            } else if (pm25Val > 0) {
                aqiScore = Math.round(pm25Val * 3.6);
            }

            if (aqiScore <= 50) {
                aqiText = "Good air quality";
                aqiBadge = "badge-good";
            } else if (aqiScore <= 100) {
                aqiText = "Satisfactory air quality";
                aqiBadge = "badge-good";
            } else if (aqiScore <= 150) {
                aqiText = "Moderate air quality";
                aqiBadge = "text-orange";
            } else {
                aqiText = "Unhealthy air quality";
                aqiBadge = "icon-temp";
            }
        }

        // Parse 24-Hour Hourly Timeline (Full 24-hour whole day cycle starting from current hour)
        const hourlyTimeline = [];
        const hourlySeriesData = {
            times: [],
            humidity: [],
            temperature: [],
            precipitation: [],
            wind: []
        };

        if (hourly.time && hourly.time.length > 0) {
            const now = new Date();
            const currentHourISO = now.toISOString().slice(0, 13); // YYYY-MM-DDTHH
            let startIdx = 0;

            for (let i = 0; i < hourly.time.length; i++) {
                if (hourly.time[i].startsWith(currentHourISO)) {
                    startIdx = i;
                    break;
                }
            }

            // Extract all 24 hours of the full day cycle
            const totalHoursToExtract = Math.min(24, hourly.time.length - startIdx);
            for (let i = startIdx; i < startIdx + totalHoursToExtract; i++) {
                const hTimeStr = hourly.time[i];
                const hDate = new Date(hTimeStr);
                const isNow = i === startIdx;
                const timeLabel = isNow ? "Now" : hDate.toLocaleTimeString([], { hour: "numeric", hour12: true }).toLowerCase();
                const hCode = hourly.weather_code ? hourly.weather_code[i] : 0;
                const hHour = hDate.getHours();
                const hIsDay = (hHour >= 6 && hHour < 19) ? 1 : 0;
                const hInfo = getWeatherInfo(hCode, hIsDay);
                const hTemp = Math.round(hourly.temperature_2m ? hourly.temperature_2m[i] : cur.temperature_2m);
                const hPrecipProb = hourly.precipitation_probability ? hourly.precipitation_probability[i] : 0;
                const hHum = Math.round(hourly.relative_humidity_2m ? hourly.relative_humidity_2m[i] : cur.relative_humidity_2m);
                const hWind = Math.round(hourly.wind_speed_10m ? hourly.wind_speed_10m[i] : cur.wind_speed_10m);

                hourlyTimeline.push({
                    time: timeLabel,
                    temp: hTemp,
                    icon: hInfo.icon,
                    text: hInfo.text,
                    precipProb: hPrecipProb
                });

                hourlySeriesData.times.push(timeLabel);
                hourlySeriesData.humidity.push(hHum);
                hourlySeriesData.temperature.push(hTemp);
                hourlySeriesData.precipitation.push(hPrecipProb);
                hourlySeriesData.wind.push(hWind);
            }
        }

        // Parse 7-Day Forecast
        const forecastDays = [];
        if (daily.time) {
            for (let i = 0; i < Math.min(daily.time.length, 7); i++) {
                const dateObj = new Date(daily.time[i]);
                const dayName = i === 0 ? "Today" : dateObj.toLocaleDateString("en-US", { weekday: "short" });
                const code = daily.weather_code ? daily.weather_code[i] : 0;
                const info = getWeatherInfo(code, 1);
                const maxT = Math.round(daily.temperature_2m_max ? daily.temperature_2m_max[i] : cur.temperature_2m + 3);
                const minT = Math.round(daily.temperature_2m_min ? daily.temperature_2m_min[i] : cur.temperature_2m - 4);
                const precipP = daily.precipitation_probability_max ? daily.precipitation_probability_max[i] : 0;

                forecastDays.push({
                    day: dayName,
                    date: daily.time[i],
                    maxTemp: maxT,
                    minTemp: minT,
                    precipProb: precipP,
                    icon: info.icon,
                    text: info.text
                });
            }
        }

        // Parse Sunrise & Sunset
        let sunriseStr = "06:09 AM";
        let sunsetStr = "06:48 PM";
        if (daily.sunrise && daily.sunrise[0]) {
            const srDate = new Date(daily.sunrise[0]);
            sunriseStr = srDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true });
        }
        if (daily.sunset && daily.sunset[0]) {
            const ssDate = new Date(daily.sunset[0]);
            sunsetStr = ssDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true });
        }

        // UV Index & Visibility & Dew Point
        const uvIndex = (daily.uv_index_max && daily.uv_index_max[0]) ? Math.round(daily.uv_index_max[0]) : (hourly.uv_index ? Math.round(hourly.uv_index[0] || 6) : 6);
        const visibilityKm = (hourly.visibility && hourly.visibility[0]) ? (hourly.visibility[0] / 1000).toFixed(1) : "10.0";
        const dewPoint = (hourly.dew_point_2m && hourly.dew_point_2m[0]) ? Math.round(hourly.dew_point_2m[0]) : Math.round(cur.temperature_2m - (100 - cur.relative_humidity_2m) / 5);

        // Daily High & Low
        const dayHigh = forecastDays[0] ? forecastDays[0].maxTemp : Math.round(cur.temperature_2m + 3);
        const dayLow = forecastDays[0] ? forecastDays[0].minTemp : Math.round(cur.temperature_2m - 4);

        // Store active data state
        activeLocationData = {
            name: placeName,
            country: countryName,
            flag: flag,
            lat: lat,
            lon: lon,
            rawTempC: cur.temperature_2m,
            rawFeelsLikeC: cur.apparent_temperature !== undefined ? cur.apparent_temperature : cur.temperature_2m + 1,
            highC: dayHigh,
            lowC: dayLow,
            conditionText: wInfo.text,
            conditionIcon: wInfo.icon,
            weatherData: {
                temp: cur.temperature_2m,
                feelsLike: cur.apparent_temperature !== undefined ? cur.apparent_temperature : cur.temperature_2m + 1,
                precipitation: cur.precipitation || 0,
                precipProb: (forecastDays[0] ? forecastDays[0].precipProb : (hourlyTimeline[0] ? hourlyTimeline[0].precipProb : 10)),
                windSpeed: cur.wind_speed_10m || 20,
                windGust: cur.wind_gusts_10m || cur.wind_speed_10m * 1.4 || 30,
                windDirection: cur.wind_direction_10m || 240,
                humidity: cur.relative_humidity_2m || 73,
                dewPoint: dewPoint,
                aqi: aqiScore,
                aqiText: aqiText,
                aqiBadge: aqiBadge,
                pm25: pm25Val,
                cloudCover: cur.cloud_cover || 50,
                surfacePressure: cur.surface_pressure || 1012,
                uvIndex: uvIndex,
                visibilityKm: visibilityKm,
                sunrise: sunriseStr,
                sunset: sunsetStr,
                hourly: hourlyTimeline,
                hourlySeries: hourlySeriesData,
                forecast: forecastDays
            }
        };

        currentClimateData = {
            temperature: Math.round(cur.temperature_2m),
            rainfall_mm: cur.precipitation || 0,
            wind_speed: Math.round(cur.wind_speed_10m || 20),
            humidity: cur.relative_humidity_2m || 73,
            aqi: aqiScore,
            cloud_cover: cur.cloud_cover || 50,
            region: `${flag} ${placeName}, ${countryName}`
        };

        // Render UI
        renderGoogleWeatherUI();
    } catch (err) {
        console.error("fetchAndDisplayPlaceWeather error:", err);
        alert(`Failed to retrieve live weather data: ${err.message}`);
    } finally {
        hideSearchLoading();
    }
}

// ============================================================
// 7. RENDER GOOGLE WEATHER UI ELEMENTS
// ============================================================
function renderGoogleWeatherUI() {
    const d = activeLocationData;
    const w = d.weatherData;
    if (!w) return;

    // 1. Header Location & Time
    const placeNameEl = document.getElementById("gwPlaceName");
    const subLocEl = document.getElementById("gwSubLocation");
    const localTimeEl = document.getElementById("gwLocalTime");

    if (placeNameEl) placeNameEl.textContent = `${d.flag} ${d.name}`;
    if (subLocEl) {
        subLocEl.innerHTML = `${escapeHtml(d.country)} · Coordinates: <strong>${Math.abs(d.lat).toFixed(2)}° ${d.lat >= 0 ? "N" : "S"}, ${Math.abs(d.lon).toFixed(2)}° ${d.lon >= 0 ? "E" : "W"}</strong>`;
    }
    if (localTimeEl) {
        localTimeEl.textContent = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    }

    // 2. Main Temperature, Icon, Condition & High/Low
    const gwCurrentTemp = document.getElementById("gwCurrentTemp");
    const gwWeatherIcon = document.getElementById("gwWeatherIcon");
    const gwConditionText = document.getElementById("gwConditionText");
    const gwFeelsLike = document.getElementById("gwFeelsLike");
    const gwHighLow = document.getElementById("gwHighLow");

    const curTempFormatted = currentTempUnit === "C" ? `${Math.round(d.rawTempC)}°` : `${Math.round(cToF(d.rawTempC))}°`;
    const feelsFormatted = currentTempUnit === "C" ? `${Math.round(d.rawFeelsLikeC)}°` : `${Math.round(cToF(d.rawFeelsLikeC))}°`;
    const highFormatted = currentTempUnit === "C" ? `${d.highC}°` : `${Math.round(cToF(d.highC))}°`;
    const lowFormatted = currentTempUnit === "C" ? `${d.lowC}°` : `${Math.round(cToF(d.lowC))}°`;

    if (gwCurrentTemp) gwCurrentTemp.textContent = curTempFormatted;
    if (gwWeatherIcon) {
        gwWeatherIcon.className = `fa-solid ${d.conditionIcon}`;
    }
    if (gwConditionText) gwConditionText.textContent = d.conditionText;
    if (gwFeelsLike) gwFeelsLike.textContent = `Feels like ${feelsFormatted}`;
    if (gwHighLow) gwHighLow.textContent = `High ${highFormatted} · Low ${lowFormatted}`;

    // 3. Hourly Forecast Track
    const hourlyTrack = document.getElementById("gwHourlyTrack");
    if (hourlyTrack && w.hourly) {
        hourlyTrack.innerHTML = w.hourly.map((h, idx) => {
            const tempVal = currentTempUnit === "C" ? `${h.temp}°` : `${Math.round(cToF(h.temp))}°`;
            const rainBadge = h.precipProb > 0 ? `<span class="h-precip"><i class="fa-solid fa-droplet"></i> ${h.precipProb}%</span>` : `<span class="h-precip" style="opacity:0.3;">-</span>`;

            return `
                <div class="gw-hour-pill ${idx === 0 ? "active" : ""}">
                    <span class="h-time">${h.time}</span>
                    <span class="h-temp">${tempVal}</span>
                    <div class="h-icon"><i class="fa-solid ${h.icon}"></i></div>
                    ${rainBadge}
                </div>
            `;
        }).join("");
    }

    // 4. Render Google Weather Real-Data Line Graph
    renderHourlySvgLineGraph();

    // 5. Daily 7-Day Track
    const dailyTrack = document.getElementById("gwDailyTrack");
    if (dailyTrack && w.forecast) {
        dailyTrack.innerHTML = w.forecast.map((f, idx) => {
            const maxVal = currentTempUnit === "C" ? `${f.maxTemp}°` : `${Math.round(cToF(f.maxTemp))}°`;
            const minVal = currentTempUnit === "C" ? `${f.minTemp}°` : `${Math.round(cToF(f.minTemp))}°`;

            return `
                <div class="gw-day-tab ${idx === 0 ? "active" : ""}">
                    <span class="d-name">${f.day}</span>
                    <div class="d-icon"><i class="fa-solid ${f.icon}"></i></div>
                    <div class="d-temps">
                        <span class="d-max">${maxVal}</span>
                        <span class="d-min">/ ${minVal}</span>
                    </div>
                    <div class="d-precip"><i class="fa-solid fa-droplet"></i> ${f.precipProb}%</div>
                </div>
            `;
        }).join("");
    }

    // 6. Detailed Metric Cards
    // 6.1 Precipitation
    const dispRain = document.getElementById("dispRain");
    const mPrecipProbText = document.getElementById("mPrecipProbText");
    const dispRainSubtitle = document.getElementById("dispRainSubtitle");
    if (dispRain) dispRain.textContent = `${w.precipitation.toFixed(1)} mm`;
    if (mPrecipProbText) mPrecipProbText.textContent = `${w.precipProb}% Chance`;
    if (dispRainSubtitle) {
        dispRainSubtitle.textContent = w.precipProb > 50 ? "Moderate rain likely in next few hours" : w.precipitation > 0 ? "Precipitation recorded" : "No significant rainfall expected now";
    }

    // 6.2 Wind
    const dispWind = document.getElementById("dispWind");
    const mWindDirText = document.getElementById("mWindDirText");
    const dispWindGust = document.getElementById("dispWindGust");
    const compDir = getCompassDirection(w.windDirection);
    if (dispWind) dispWind.textContent = `${Math.round(w.windSpeed)} kph`;
    if (mWindDirText) mWindDirText.textContent = `${compDir} · ${w.windDirection}°`;
    if (dispWindGust) dispWindGust.textContent = `${Math.round(w.windGust)} kph`;

    // 6.3 Humidity
    const dispHum = document.getElementById("dispHum");
    const dispDewPoint = document.getElementById("dispDewPoint");
    const mHumLevelText = document.getElementById("mHumLevelText");
    const dewVal = currentTempUnit === "C" ? `${w.dewPoint}°C` : `${Math.round(cToF(w.dewPoint))}°F`;
    if (dispHum) dispHum.textContent = `${w.humidity}%`;
    if (dispDewPoint) dispDewPoint.textContent = dewVal;
    if (mHumLevelText) {
        mHumLevelText.textContent = w.humidity > 75 ? "Humid" : w.humidity < 35 ? "Dry" : "Comfortable";
    }

    // 6.4 Air Quality
    const dispAqi = document.getElementById("dispAqi");
    const dispAqiSubtitle = document.getElementById("dispAqiSubtitle");
    const mAqiStatusBadge = document.getElementById("mAqiStatusBadge");
    const dispPm25 = document.getElementById("dispPm25");
    if (dispAqi) dispAqi.textContent = `${w.aqi}`;
    if (mAqiStatusBadge) {
        mAqiStatusBadge.textContent = w.aqiText.split(" ")[0];
        mAqiStatusBadge.className = w.aqiBadge;
    }
    if (dispPm25) dispPm25.textContent = `${w.pm25.toFixed(1)}`;
    if (dispAqiSubtitle) {
        dispAqiSubtitle.innerHTML = `<span class="live-dot-green"></span> ${w.aqiText} (PM2.5: ${w.pm25.toFixed(1)} µg/m³)`;
    }

    // 6.5 UV Index
    const dispUv = document.getElementById("dispUv");
    const mUvCategory = document.getElementById("mUvCategory");
    const dispUvSubtitle = document.getElementById("dispUvSubtitle");
    if (dispUv) dispUv.textContent = `${w.uvIndex}`;
    if (mUvCategory) {
        mUvCategory.textContent = w.uvIndex >= 8 ? "Very High" : w.uvIndex >= 6 ? "High" : w.uvIndex >= 3 ? "Moderate" : "Low";
    }
    if (dispUvSubtitle) {
        dispUvSubtitle.textContent = w.uvIndex >= 6 ? "Wear sunglasses & SPF protection" : "Minimal sun protection needed";
    }

    // 6.6 Visibility
    const dispVisibility = document.getElementById("dispVisibility");
    if (dispVisibility) dispVisibility.textContent = `${w.visibilityKm} km`;

    // 6.7 Pressure
    const dispPressure = document.getElementById("dispPressure");
    if (dispPressure) dispPressure.textContent = `${Math.round(w.surfacePressure)} hPa`;

    // 6.8 Sunrise & Sunset
    const dispSunrise = document.getElementById("dispSunrise");
    const dispSunset = document.getElementById("dispSunset");
    const dispCloud = document.getElementById("dispCloud");
    if (dispSunrise) dispSunrise.textContent = w.sunrise;
    if (dispSunset) dispSunset.textContent = w.sunset;
    if (dispCloud) dispCloud.textContent = `${w.cloudCover}%`;

    // 7. Update Radar Summary Panel & Target Coordinates
    const sumRegion = document.getElementById("sumRegion");
    if (sumRegion) sumRegion.textContent = `${d.flag} ${d.name}, ${d.country}`;

    const radarTargetCoords = document.getElementById("radarTargetCoords");
    if (radarTargetCoords) {
        radarTargetCoords.textContent = `${Math.abs(d.lat).toFixed(2)}° ${d.lat >= 0 ? "N" : "S"}, ${Math.abs(d.lon).toFixed(2)}° ${d.lon >= 0 ? "E" : "W"}`;
    }
}

// ============================================================
// 8. SATELLITE ATMOSPHERIC RADAR LOOP & PLAYBACK ENGINE
// ============================================================
const radarFrames = [
    {
        src: "images/climate.jpg",
        title: "Atmospheric Thermal Sounder",
        pass: "PASS #8402 (10.8µm IR)",
        mode: "thermal",
        badge: "THERMAL INFRARED RADIOMETER SOUNDING (10.8µm)"
    },
    {
        src: "images/world.jpg",
        title: "Global Moisture & Cloud Cover Radar",
        pass: "PASS #8403 (Water Vapor Band)",
        mode: "doppler",
        badge: "DOPPLER METEOROLOGICAL PRECIPITATION RADAR"
    },
    {
        src: "images/global.jpg",
        title: "Planetary Jetstream & Vector Flow",
        pass: "PASS #8404 (Doppler Radar)",
        mode: "wind",
        badge: "UPPER ATMOSPHERIC JETSTREAM VECTOR FLOW"
    },
    {
        src: "images/earth.jpg",
        title: "Orbital Multispectral Radiometer",
        pass: "PASS #8405 (Visible + NIR)",
        mode: "optical",
        badge: "SENTINEL-2 MULTISPECTRAL OPTICAL SURVEY"
    },
    {
        src: "images/flood.jpg",
        title: "Surface Hydrological Water Radar",
        pass: "PASS #8406 (SAR C-Band)",
        mode: "doppler",
        badge: "C-BAND SAR HYDROLOGICAL FLOOD DETECTION"
    },
    {
        src: "images/forest.jpg",
        title: "Thermal Canopy & Vegetation Index",
        pass: "PASS #8407 (NDVI IR Band)",
        mode: "thermal",
        badge: "VEGETATION CANOPY THERMAL REFLECTANCE"
    }
];

let currentRadarIndex = 0;
let isRadarPlaying = true;
let radarIntervalMs = 2800;
let radarLoopTimer = null;
let activeRadarImageLayer = 1; // 1 or 2 for smooth crossfades

function initRadarLoopEngine() {
    renderRadarPlaybackDots();
    showRadarFrame(0);
    startRadarLoopTimer();
}

function renderRadarPlaybackDots() {
    const dotsContainer = document.getElementById("radarPlaybackDots");
    if (!dotsContainer) return;

    dotsContainer.innerHTML = radarFrames.map((frame, idx) => `
        <div class="playback-dot ${idx === currentRadarIndex ? "active" : ""}" 
             onclick="goToRadarFrame(${idx})" 
             title="${frame.title} (${idx + 1}/${radarFrames.length})">
        </div>
    `).join("");
}

function showRadarFrame(index) {
    if (index < 0 || index >= radarFrames.length) return;
    currentRadarIndex = index;

    const frame = radarFrames[currentRadarIndex];
    const layer1 = document.getElementById("radarImgLayer1");
    const layer2 = document.getElementById("radarImgLayer2");
    const viewport = document.getElementById("radarViewport");
    const frameCounter = document.getElementById("radarFrameCounter");
    const frameTitle = document.getElementById("radarFrameTitle");
    const framePass = document.getElementById("radarFramePass");
    const modeBadge = document.getElementById("radarModeName");

    // Alternate layers for smooth 0.8s CSS crossfade
    if (layer1 && layer2) {
        if (activeRadarImageLayer === 1) {
            layer2.src = frame.src;
            layer2.classList.add("active");
            layer1.classList.remove("active");
            activeRadarImageLayer = 2;
        } else {
            layer1.src = frame.src;
            layer1.classList.add("active");
            layer2.classList.remove("active");
            activeRadarImageLayer = 1;
        }
    }

    // Update Mode class on Viewport
    if (viewport) {
        viewport.className = `radar-view mode-${frame.mode}`;
    }

    // Update Mode button active state
    const btns = {
        thermal: document.getElementById("btnRadarThermal"),
        doppler: document.getElementById("btnRadarDoppler"),
        wind: document.getElementById("btnRadarWind"),
        optical: document.getElementById("btnRadarOptical")
    };
    Object.keys(btns).forEach((k) => {
        if (btns[k]) {
            if (k === frame.mode) {
                btns[k].classList.add("active");
            } else {
                btns[k].classList.remove("active");
            }
        }
    });

    // Update text labels
    if (frameCounter) frameCounter.textContent = `Frame ${currentRadarIndex + 1} of ${radarFrames.length}`;
    if (frameTitle) frameTitle.textContent = frame.title;
    if (framePass) framePass.textContent = frame.pass;
    if (modeBadge) modeBadge.textContent = frame.badge;

    // Update dots
    const dots = document.querySelectorAll(".playback-dot");
    dots.forEach((d, i) => {
        if (i === currentRadarIndex) {
            d.classList.add("active");
        } else {
            d.classList.remove("active");
        }
    });
}

function startRadarLoopTimer() {
    clearInterval(radarLoopTimer);
    if (!isRadarPlaying) return;

    radarLoopTimer = setInterval(() => {
        nextRadarFrame();
    }, radarIntervalMs);
}

function nextRadarFrame() {
    const nextIdx = (currentRadarIndex + 1) % radarFrames.length;
    showRadarFrame(nextIdx);
}

function prevRadarFrame() {
    const prevIdx = (currentRadarIndex - 1 + radarFrames.length) % radarFrames.length;
    showRadarFrame(prevIdx);
}

function goToRadarFrame(index) {
    showRadarFrame(index);
    if (isRadarPlaying) {
        startRadarLoopTimer();
    }
}

function toggleRadarPlayback() {
    isRadarPlaying = !isRadarPlaying;

    const icon = document.getElementById("radarPlayPauseIcon");
    const text = document.getElementById("radarPlayPauseText");

    if (isRadarPlaying) {
        if (icon) icon.className = "fa-solid fa-pause";
        if (text) text.textContent = "Live Loop";
        startRadarLoopTimer();
    } else {
        if (icon) icon.className = "fa-solid fa-play";
        if (text) text.textContent = "Paused";
        clearInterval(radarLoopTimer);
    }
}

function toggleRadarSpeed() {
    const speedBtn = document.getElementById("radarSpeedLabel");
    if (radarIntervalMs === 2800) {
        radarIntervalMs = 1400; // 2x speed
        if (speedBtn) speedBtn.textContent = "2.0x";
    } else {
        radarIntervalMs = 2800; // 1x speed
        if (speedBtn) speedBtn.textContent = "1.0x";
    }

    if (isRadarPlaying) {
        startRadarLoopTimer();
    }
}

function switchRadarLayer(mode) {
    // Find the first frame matching this mode or switch mode
    const idx = radarFrames.findIndex((f) => f.mode === mode);
    if (idx !== -1) {
        goToRadarFrame(idx);
    }
}

// ============================================================
// 9. GOOGLE WEATHER REAL-DATA SVG LINE GRAPH RENDERER
// ============================================================
function switchHourlyGraphMetric(metric) {
    currentGraphMetric = metric;

    // Update active tab buttons
    const tabs = {
        humidity: document.getElementById("tabGraphHumidity"),
        temperature: document.getElementById("tabGraphTemperature"),
        precipitation: document.getElementById("tabGraphPrecipitation"),
        wind: document.getElementById("tabGraphWind")
    };

    Object.keys(tabs).forEach((k) => {
        if (tabs[k]) {
            if (k === metric) {
                tabs[k].classList.add("active");
            } else {
                tabs[k].classList.remove("active");
            }
        }
    });

    renderHourlySvgLineGraph();
}

function renderHourlySvgLineGraph() {
    const w = activeLocationData.weatherData;
    if (!w || !w.hourlySeries) return;

    const series = w.hourlySeries;
    const times = series.times;
    let rawVals = series[currentGraphMetric] || [];

    if (!rawVals || rawVals.length === 0) return;

    let displayVals = [];
    let labelSuffix = "";
    let avgLabel = "Today's average";

    if (currentGraphMetric === "humidity") {
        displayVals = rawVals;
        labelSuffix = "%";
    } else if (currentGraphMetric === "temperature") {
        displayVals = rawVals.map((t) => (currentTempUnit === "C" ? Math.round(t) : Math.round(cToF(t))));
        labelSuffix = "°";
    } else if (currentGraphMetric === "precipitation") {
        displayVals = rawVals;
        labelSuffix = "%";
        avgLabel = "Today's max chance";
    } else if (currentGraphMetric === "wind") {
        displayVals = rawVals;
        labelSuffix = " kph";
    }

    // Calculate Summary Text
    const sumEl = document.getElementById("gwGraphAverageText");
    const lblEl = document.getElementById("gwGraphAverageLabel");
    if (lblEl) lblEl.textContent = avgLabel;

    if (sumEl) {
        if (currentGraphMetric === "precipitation") {
            const maxP = Math.max(...displayVals);
            sumEl.textContent = `${maxP}%`;
        } else {
            const avg = Math.round(displayVals.reduce((a, b) => a + b, 0) / displayVals.length);
            sumEl.textContent = `${avg}${labelSuffix}`;
        }
    }

    // Prepare SVG Coordinates for 24-Hour Whole Day
    const count = displayVals.length;
    // Scale width smoothly: minimum 900px, 68px per hourly point for 24 hours = ~1632px
    const width = Math.max(900, count * 68);
    const height = 170;
    const padTop = 42;
    const padBottom = 38;
    const padLeft = 45;
    const padRight = 45;

    // Apply responsive width and viewBox to the SVG element
    const svgEl = document.getElementById("gwHourlySvgGraph");
    if (svgEl) {
        svgEl.setAttribute("viewBox", `0 0 ${width} ${height}`);
        svgEl.style.minWidth = `${width}px`;
    }

    const minVal = Math.min(...displayVals);
    const maxVal = Math.max(...displayVals);
    const range = (maxVal - minVal) === 0 ? 1 : (maxVal - minVal);

    const points = displayVals.map((val, i) => {
        const x = padLeft + (i / (count - 1)) * (width - padLeft - padRight);
        const norm = (val - minVal) / range;
        // Invert Y: higher values are near the top
        const y = (height - padBottom) - norm * (height - padTop - padBottom);
        return {
            x: x,
            y: y,
            val: val,
            label: `${val}${labelSuffix}`,
            time: times[i] || ""
        };
    });

    // Build Cubic Spline Curve Path
    let lineD = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
    for (let i = 0; i < points.length - 1; i++) {
        const p0 = i > 0 ? points[i - 1] : points[i];
        const p1 = points[i];
        const p2 = points[i + 1];
        const p3 = i < points.length - 2 ? points[i + 2] : p2;

        const cp1x = p1.x + (p2.x - p0.x) / 6;
        const cp1y = p1.y + (p2.y - p0.y) / 6;
        const cp2x = p2.x - (p3.x - p1.x) / 6;
        const cp2y = p2.y - (p3.y - p1.y) / 6;

        lineD += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
    }

    // Build Closed Gradient Area Path
    const baselineY = height - padBottom + 10;
    const areaD = `${lineD} L ${points[points.length - 1].x.toFixed(1)} ${baselineY} L ${points[0].x.toFixed(1)} ${baselineY} Z`;

    // Apply paths
    const curveEl = document.getElementById("gwSvgCurveLine");
    const areaEl = document.getElementById("gwSvgAreaFill");
    if (curveEl) curveEl.setAttribute("d", lineD);
    if (areaEl) areaEl.setAttribute("d", areaD);

    // Render Data Point Circles
    const pointsGroup = document.getElementById("gwSvgPointsGroup");
    if (pointsGroup) {
        pointsGroup.innerHTML = points.map((p, idx) => `
            <circle class="gw-svg-point" cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="4.5" title="${p.time}: ${p.label}">
            </circle>
        `).join("");
    }

    // Render Value Labels (above each point)
    const labelsGroup = document.getElementById("gwSvgLabelsGroup");
    if (labelsGroup) {
        labelsGroup.innerHTML = points.map((p) => `
            <text class="gw-svg-val-text" x="${p.x.toFixed(1)}" y="${(p.y - 12).toFixed(1)}">
                ${p.label}
            </text>
        `).join("");
    }

    // Render Time Labels (at the bottom)
    const timeGroup = document.getElementById("gwSvgTimeGroup");
    if (timeGroup) {
        timeGroup.innerHTML = points.map((p) => `
            <text class="gw-svg-time-text" x="${p.x.toFixed(1)}" y="${(height - 12).toFixed(1)}">
                ${p.time}
            </text>
        `).join("");
    }
}

// ============================================================
// 9. °C / °F UNIT TOGGLE
// ============================================================
function toggleClimateTempUnit() {
    currentTempUnit = currentTempUnit === "C" ? "F" : "C";
    const btnText = document.getElementById("unitToggleText");
    if (btnText) {
        btnText.textContent = currentTempUnit === "C" ? "°C / °F" : "°F / °C";
    }

    renderGoogleWeatherUI();
}

function cToF(c) {
    return (c * 9) / 5 + 32;
}

// ============================================================
// 10. REGIONAL PRESETS
// ============================================================
function setClimateRegion(regionName, temp, rain, wind, hum, aqi, cloud, flag = "🌐") {
    document.querySelectorAll(".region-btn").forEach((btn) => btn.classList.remove("active"));
    if (window.event && window.event.currentTarget) {
        window.event.currentTarget.classList.add("active");
    }

    const input = document.getElementById("globalPlaceSearchInput");
    if (input) input.value = "";

    // Generate full 24-hour fallback array
    const reg24Hours = [];
    const reg24Times = [];
    const reg24Hum = [];
    const reg24Temp = [];
    const reg24Precip = [];
    const reg24Wind = [];

    const now = new Date();
    const curH = now.getHours();

    for (let i = 0; i < 24; i++) {
        const d = new Date();
        d.setHours(curH + i);
        const tLabel = i === 0 ? "Now" : d.toLocaleTimeString([], { hour: "numeric", hour12: true }).toLowerCase();
        const hr = d.getHours();
        const isDay = hr >= 6 && hr < 19 ? 1 : 0;
        const tempVariation = Math.round(temp + Math.sin((i / 24) * Math.PI * 2) * 3);
        const humVariation = Math.round(hum - Math.sin((i / 24) * Math.PI * 2) * 8);
        const precipVariation = Math.max(0, Math.min(100, Math.round(rain * 0.4 + (i % 5 === 0 ? 30 : 0))));
        const windVariation = Math.max(5, Math.round(wind + Math.cos((i / 24) * Math.PI * 2) * 4));

        reg24Hours.push({
            time: tLabel,
            temp: tempVariation,
            icon: isDay ? "fa-cloud-sun" : "fa-cloud-moon",
            text: "Partly Cloudy",
            precipProb: precipVariation
        });

        reg24Times.push(tLabel);
        reg24Hum.push(humVariation);
        reg24Temp.push(tempVariation);
        reg24Precip.push(precipVariation);
        reg24Wind.push(windVariation);
    }

    activeLocationData = {
        name: regionName,
        country: "Regional Sector",
        flag: flag,
        lat: 0,
        lon: 0,
        rawTempC: temp,
        rawFeelsLikeC: temp + 1,
        highC: temp + 3,
        lowC: temp - 4,
        conditionText: "Regional Atmospheric Sector",
        conditionIcon: "fa-cloud-sun",
        weatherData: {
            temp: temp,
            feelsLike: temp + 1,
            precipitation: rain,
            precipProb: Math.min(rain, 90),
            windSpeed: wind,
            windGust: wind * 1.4,
            windDirection: 240,
            humidity: hum,
            dewPoint: Math.round(temp - (100 - hum) / 5),
            aqi: aqi,
            aqiText: aqi <= 50 ? "Good air quality" : "Satisfactory air quality",
            aqiBadge: aqi <= 50 ? "badge-good" : "badge-good",
            pm25: aqi / 3.6,
            cloudCover: cloud,
            surfacePressure: 1012,
            uvIndex: 6,
            visibilityKm: "10.0",
            sunrise: "06:09 AM",
            sunset: "06:48 PM",
            hourly: reg24Hours,
            hourlySeries: {
                times: reg24Times,
                humidity: reg24Hum,
                temperature: reg24Temp,
                precipitation: reg24Precip,
                wind: reg24Wind
            },
            forecast: [
                { day: "Today", date: "", maxTemp: temp + 3, minTemp: temp - 4, precipProb: Math.min(rain, 90), icon: "fa-cloud-rain", text: "Showers" },
                { day: "Sun", date: "", maxTemp: temp + 4, minTemp: temp - 3, precipProb: 80, icon: "fa-cloud-rain", text: "Rain" },
                { day: "Mon", date: "", maxTemp: temp + 3, minTemp: temp - 3, precipProb: 20, icon: "fa-cloud", text: "Cloudy" },
                { day: "Tue", date: "", maxTemp: temp + 4, minTemp: temp - 3, precipProb: 15, icon: "fa-cloud", text: "Cloudy" },
                { day: "Wed", date: "", maxTemp: temp + 4, minTemp: temp - 3, precipProb: 20, icon: "fa-cloud", text: "Cloudy" },
                { day: "Thu", date: "", maxTemp: temp + 5, minTemp: temp - 2, precipProb: 10, icon: "fa-sun", text: "Partly Sunny" },
                { day: "Fri", date: "", maxTemp: temp + 4, minTemp: temp - 3, precipProb: 10, icon: "fa-cloud-sun", text: "Fair" }
            ]
        }
    };

    currentClimateData = {
        temperature: temp,
        rainfall_mm: rain,
        wind_speed: wind,
        humidity: hum,
        aqi: aqi,
        cloud_cover: cloud,
        region: `${flag} ${regionName}`
    };

    renderGoogleWeatherUI();
}

// ============================================================
// 11. COUNTRY GRID SELECTOR
// ============================================================
function initClimateCountryGrid() {
    const grid = document.getElementById("climateCountryGrid");
    if (!grid || typeof NationalWeatherService === "undefined") return;

    grid.innerHTML = "";
    NationalWeatherService.countries.forEach((country) => {
        const card = document.createElement("div");
        card.className = "climate-country-card";
        card.setAttribute("data-name", country.name.toLowerCase());
        card.setAttribute("data-code", country.code.toLowerCase());
        card.style.cssText = `
            background: rgba(255, 255, 255, 0.04);
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 12px;
            padding: 10px 12px;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 10px;
            transition: all 0.25s ease;
        `;
        card.innerHTML = `
            <span style="font-size: 22px; line-height: 1;">${country.flag}</span>
            <div style="min-width:0; flex:1;">
                <h4 style="font-size: 13px; color: #fff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-bottom: 2px;">${country.name}</h4>
                <small style="font-size: 11px; color: #94a3b8; display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${country.capital}</small>
            </div>
            <i class="fa-solid fa-chevron-right" style="font-size: 11px; color: #64748b;"></i>
        `;

        card.onmouseover = () => {
            card.style.background = "rgba(0, 217, 255, 0.12)";
            card.style.borderColor = "#00d9ff";
            card.style.transform = "translateY(-2px)";
        };
        card.onmouseout = () => {
            if (!card.classList.contains("active-country-card")) {
                card.style.background = "rgba(255, 255, 255, 0.04)";
                card.style.borderColor = "rgba(255, 255, 255, 0.08)";
                card.style.transform = "translateY(0)";
            }
        };

        card.onclick = () => {
            document.querySelectorAll(".climate-country-card").forEach((c) => {
                c.classList.remove("active-country-card");
                c.style.background = "rgba(255, 255, 255, 0.04)";
                c.style.borderColor = "rgba(255, 255, 255, 0.08)";
            });
            card.classList.add("active-country-card");
            card.style.background = "rgba(0, 217, 255, 0.18)";
            card.style.borderColor = "#00d9ff";

            searchAndLoadCity(country.capital, country.name, country.lat, country.lon, country.flag);
        };

        grid.appendChild(card);
    });
}

function filterClimateCountries(query) {
    const q = (query || "").toLowerCase().trim();
    const cards = document.querySelectorAll(".climate-country-card");
    cards.forEach((c) => {
        const name = c.getAttribute("data-name") || "";
        const code = c.getAttribute("data-code") || "";
        if (name.includes(q) || code.includes(q)) {
            c.style.display = "flex";
        } else {
            c.style.display = "none";
        }
    });
}

// ============================================================
// 12. PDF REPORT EXPORT
// ============================================================
const downloadPdfBtn = document.getElementById("downloadClimatePdfBtn");
if (downloadPdfBtn) {
    downloadPdfBtn.addEventListener("click", async function () {
        try {
            downloadPdfBtn.disabled = true;
            downloadPdfBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Generating Climate PDF Report...';

            const res = await fetch(`${API_URL}/climate-monitoring/report`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(currentClimateData)
            });
            const data = await res.json();
            const repId = data && data.report_id ? data.report_id : 1;

            window.open(`${API_URL}/climate-monitoring/report/${repId}`, "_blank");
        } catch (err) {
            console.error("Climate report download error:", err);
            window.open(`${API_URL}/climate-monitoring/report/1`, "_blank");
        } finally {
            downloadPdfBtn.disabled = false;
            downloadPdfBtn.innerHTML = '<i class="fa-solid fa-file-pdf"></i> Generate & Download Climate Report';
        }
    });
}

// ============================================================
// 13. HELPER UTILITIES
// ============================================================
function getWeatherInfo(code, isDay = 1) {
    const sunMoon = isDay ? "fa-sun" : "fa-moon";

    switch (code) {
        case 0:
            return { icon: isDay ? "fa-sun" : "fa-moon", text: isDay ? "Clear Sky" : "Clear Night" };
        case 1:
            return { icon: isDay ? "fa-cloud-sun" : "fa-cloud-moon", text: "Mainly Clear" };
        case 2:
            return { icon: isDay ? "fa-cloud-sun" : "fa-cloud-moon", text: "Partly Cloudy" };
        case 3:
            return { icon: "fa-cloud", text: "Cloudy" };
        case 45:
        case 48:
            return { icon: "fa-smog", text: "Foggy" };
        case 51:
        case 53:
        case 55:
            return { icon: "fa-cloud-rain", text: "Light Drizzle" };
        case 61:
            return { icon: "fa-cloud-rain", text: "Slight Rain" };
        case 63:
            return { icon: "fa-cloud-showers-heavy", text: "Moderate Rain" };
        case 65:
            return { icon: "fa-cloud-showers-water", text: "Heavy Rain" };
        case 71:
        case 73:
        case 75:
            return { icon: "fa-snowflake", text: "Snowfall" };
        case 80:
        case 81:
        case 82:
            return { icon: "fa-cloud-showers-heavy", text: "Showers" };
        case 95:
        case 96:
        case 99:
            return { icon: "fa-cloud-bolt", text: "Thunderstorm" };
        default:
            return { icon: sunMoon, text: "Cloudy" };
    }
}

function getCompassDirection(deg) {
    if (deg === undefined || deg === null) return "N";
    const dirs = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
    const idx = Math.round((deg % 360) / 22.5) % 16;
    return dirs[idx];
}

function getCountryFlag(countryCode) {
    if (!countryCode) return "📍";
    try {
        const codePoints = countryCode
            .toUpperCase()
            .split("")
            .map((char) => 127397 + char.charCodeAt(0));
        return String.fromCodePoint(...codePoints);
    } catch (e) {
        return "📍";
    }
}

function escapeHtml(str) {
    if (!str) return "";
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function showSearchLoading(msg) {
    const title = document.getElementById("gwConditionText");
    if (title) {
        title.innerHTML = `<i class="fa-solid fa-spinner fa-spin" style="color:var(--cyan)"></i> Loading...`;
    }
}

function hideSearchLoading() {
    // Handled in render
}

// Global Exports
window.handlePlaceSearchInput = handlePlaceSearchInput;
window.handlePlaceSearchSubmit = handlePlaceSearchSubmit;
window.selectSearchedPlace = selectSearchedPlace;
window.searchAndLoadCity = searchAndLoadCity;
window.locateUserAndFetchWeather = locateUserAndFetchWeather;
window.clearPlaceSearch = clearPlaceSearch;
window.toggleClimateTempUnit = toggleClimateTempUnit;
window.switchHourlyGraphMetric = switchHourlyGraphMetric;
window.switchRadarLayer = switchRadarLayer;
window.nextRadarFrame = nextRadarFrame;
window.prevRadarFrame = prevRadarFrame;
window.goToRadarFrame = goToRadarFrame;
window.toggleRadarPlayback = toggleRadarPlayback;
window.toggleRadarSpeed = toggleRadarSpeed;
window.setClimateRegion = setClimateRegion;
window.filterClimateCountries = filterClimateCountries;
