"use strict";

/* ============================================================
   SATELLITE AI DASHBOARD - COMPLETE JAVASCRIPT
   ============================================================ */

const SATELLITE_API_URL = (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") ? "http://127.0.0.1:8000" : "https://satellite-ai-backend.onrender.com";

/* ============================================================
   ELEMENTS
   ============================================================ */

const clock = document.getElementById("clock");

const notificationButton =
    document.getElementById("notificationButton");

const refreshActivityButton =
    document.getElementById("refreshActivityButton");

const activityTableBody =
    document.getElementById("activityTableBody");

const countriesCount =
    document.getElementById("countriesCount");

const imagesCount =
    document.getElementById("imagesCount");

const alertsCount =
    document.getElementById("alertsCount");

const accuracyCount =
    document.getElementById("accuracyCount");

const cloudCoverage =
    document.getElementById("cloudCoverage");

const lastScan =
    document.getElementById("lastScan");


/* ============================================================
   AI VOICE ASSISTANT ELEMENTS
   ============================================================ */

const voiceAssistant =
    document.getElementById("voiceAssistant");

const openVoiceButton =
    document.getElementById("openVoiceButton");

const closeVoiceButton =
    document.getElementById("closeVoiceButton");

const startVoiceButton =
    document.getElementById("startVoiceButton");

const voiceMessage =
    document.getElementById("voiceMessage");

const voiceStatus =
    document.getElementById("voiceStatus");


/* ============================================================
   LIVE CLOCK
   ============================================================ */

function updateClock() {

    if (!clock) {
        return;
    }

    const now = new Date();

    clock.textContent =
        now.toLocaleTimeString();

}

updateClock();

setInterval(updateClock, 1000);


/* ============================================================
   AI ASSISTANT MESSAGE
   ============================================================ */

function setAIMessage(message) {

    if (!voiceMessage) {
        return;
    }

    voiceMessage.textContent = message;

}


/* ============================================================
   AI STATUS
   ============================================================ */

function setAIStatus(status) {

    if (!voiceStatus) {
        return;
    }

    voiceStatus.textContent = status;

}


/* ============================================================
   OPEN AI ASSISTANT
   ============================================================ */

if (openVoiceButton) {

    openVoiceButton.addEventListener(
        "click",
        function () {

            if (voiceAssistant) {

                voiceAssistant.classList.add("active");

            }

            setAIStatus("Ready");

            setAIMessage(
                "Hello! 👋 I'm Satellite AI. I can help you monitor your satellite analysis and control this dashboard using your voice."
            );

        }
    );

}


/* ============================================================
   CLOSE AI ASSISTANT
   ============================================================ */

if (closeVoiceButton) {

    closeVoiceButton.addEventListener(
        "click",
        function () {

            if (voiceAssistant) {

                voiceAssistant.classList.remove("active");

            }

            stopListening();

        }
    );

}


/* ============================================================
   NOTIFICATION
   ============================================================ */

if (notificationButton) {

    notificationButton.addEventListener(
        "click",
        function () {

            setAIMessage(
                "🔔 You currently have active satellite monitoring alerts."
            );

            if (voiceAssistant) {
                voiceAssistant.classList.add("active");
            }

        }
    );

}


/* ============================================================
   ANIMATE DASHBOARD NUMBERS
   ============================================================ */

function animateNumber(
    element,
    target,
    suffix = ""
) {

    if (!element) {
        return;
    }

    let current = 0;

    const duration = 1200;

    const startTime = performance.now();

    function update(currentTime) {

        const elapsed =
            currentTime - startTime;

        const progress =
            Math.min(
                elapsed / duration,
                1
            );

        current =
            Math.floor(
                progress * target
            );

        element.textContent =
            current.toLocaleString()
            + suffix;

        if (progress < 1) {

            requestAnimationFrame(
                update
            );

        }

    }

    requestAnimationFrame(update);

}


/* ============================================================
   START NUMBER ANIMATIONS
   ============================================================ */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        animateNumber(
            countriesCount,
            150,
            "+"
        );

        animateNumber(
            imagesCount,
            12580
        );

        animateNumber(
            alertsCount,
            96
        );

        animateNumber(
            accuracyCount,
            99,
            "%"
        );

    }
);


/* ============================================================
   REFRESH ACTIVITY
   ============================================================ */

if (refreshActivityButton) {

    refreshActivityButton.addEventListener(
        "click",
        function () {

            loadDashboardActivity();

        }
    );

}


/* ============================================================
   LOAD URBAN GROWTH HISTORY
   ============================================================ */

async function loadDashboardActivity() {

    if (!activityTableBody) {
        return;
    }

    activityTableBody.innerHTML = `

        <tr>

            <td colspan="4"
                style="text-align:center;">

                <i class="fa-solid fa-spinner fa-spin"></i>

                Loading satellite activity...

            </td>

        </tr>

    `;

    try {

        const response =
            await fetch(
                SATELLITE_API_URL
                + "/urban-growth/history"
            );

        if (!response.ok) {

            throw new Error(
                "Backend returned HTTP "
                + response.status
            );

        }

        const data =
            await response.json();

        console.log(
            "Dashboard history:",
            data
        );

        if (
            !data ||
            !Array.isArray(data.results)
        ) {

            throw new Error(
                "Invalid history response."
            );

        }

        if (data.results.length === 0) {

            activityTableBody.innerHTML = `

                <tr>

                    <td colspan="4"
                        style="text-align:center;">

                        No recent monitoring activity.

                    </td>

                </tr>

            `;

            return;

        }

        activityTableBody.innerHTML = "";

        /*
         * Show latest 5 reports
         */

        const reports =
            data.results.slice(0, 5);

        reports.forEach(
            function (report) {

                const row =
                    document.createElement("tr");

                const date =
                    formatDate(
                        report.created_at
                    );

                row.innerHTML = `

                    <td>
                        Urban Growth
                    </td>

                    <td>
                        Satellite Analysis
                    </td>

                    <td>
                        <span class="status-completed">
                            Completed
                        </span>
                    </td>

                    <td>
                        ${escapeHTML(date)}
                    </td>

                `;

                activityTableBody.appendChild(
                    row
                );

            }
        );

    }
    catch (error) {

        console.error(
            "Dashboard history error:",
            error
        );

        activityTableBody.innerHTML = `

            <tr>

                <td colspan="4"
                    style="text-align:center;">

                    Unable to load activity.

                </td>

            </tr>

        `;

    }

}


/* ============================================================
   FORMAT DATE
   ============================================================ */

function formatDate(value) {

    if (!value) {
        return "Unknown";
    }

    const date =
        new Date(value);

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

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


/* ============================================================
   VOICE RECOGNITION
   ============================================================ */

let recognition = null;

let isListening = false;


/* ============================================================
   CHECK BROWSER SUPPORT
   ============================================================ */

const SpeechRecognition =
    window.SpeechRecognition ||
    window.webkitSpeechRecognition;


/* ============================================================
   CREATE RECOGNITION
   ============================================================ */

if (SpeechRecognition) {

    recognition =
        new SpeechRecognition();

    recognition.continuous = false;

    recognition.interimResults = false;

    recognition.lang = "en-US";


    /* ========================================================
       VOICE START
       ======================================================== */

    recognition.onstart =
        function () {

            isListening = true;

            setAIStatus(
                "Listening..."
            );

            setAIMessage(
                "🎤 I'm listening. Tell me what you want to do."
            );

            if (startVoiceButton) {

                startVoiceButton.innerHTML = `

                    <i class="fa-solid fa-stop"></i>

                    <span>Stop Listening</span>

                `;

            }

        };


    /* ========================================================
       VOICE RESULT
       ======================================================== */

    recognition.onresult =
        function (event) {

            const transcript =
                event.results[0][0]
                .transcript
                .trim();

            console.log(
                "Voice command:",
                transcript
            );

            setAIMessage(
                "You said: " + transcript
            );

            setAIStatus(
                "Processing..."
            );

            processVoiceCommand(
                transcript
            );

        };


    /* ========================================================
       VOICE ERROR
       ======================================================== */

    recognition.onerror =
        function (event) {

            console.error(
                "Voice recognition error:",
                event.error
            );

            isListening = false;

            if (
                event.error ===
                "not-allowed"
            ) {

                setAIStatus(
                    "Microphone permission denied"
                );

                setAIMessage(
                    "⚠️ Please allow microphone access in your browser."
                );

            }
            else if (
                event.error ===
                "no-speech"
            ) {

                setAIStatus(
                    "No speech detected"
                );

                setAIMessage(
                    "I didn't hear anything. Please try again."
                );

            }
            else {

                setAIStatus(
                    "Voice error"
                );

                setAIMessage(
                    "Sorry, I couldn't understand the voice command."
                );

            }

            resetVoiceButton();

        };


    /* ========================================================
       VOICE END
       ======================================================== */

    recognition.onend =
        function () {

            isListening = false;

            resetVoiceButton();

            if (
                voiceStatus &&
                voiceStatus.textContent ===
                "Listening..."
            ) {

                setAIStatus(
                    "Ready"
                );

            }

        };

}
else {

    console.warn(
        "Speech Recognition is not supported by this browser."
    );

}


/* ============================================================
   START / STOP VOICE
   ============================================================ */

if (startVoiceButton) {

    startVoiceButton.addEventListener(
        "click",
        function () {

            if (!recognition) {

                setAIStatus(
                    "Not supported"
                );

                setAIMessage(
                    "⚠️ Your browser does not support voice recognition. Try Google Chrome or Microsoft Edge."
                );

                return;

            }


            if (isListening) {

                stopListening();

            }
            else {

                startListening();

            }

        }
    );

}


/* ============================================================
   START LISTENING
   ============================================================ */

function startListening() {

    if (!recognition) {
        return;
    }

    try {

        recognition.start();

    }
    catch (error) {

        console.warn(
            "Recognition start error:",
            error
        );

    }

}


/* ============================================================
   STOP LISTENING
   ============================================================ */

function stopListening() {

    if (!recognition) {
        return;
    }

    try {

        recognition.stop();

    }
    catch (error) {

        console.warn(
            "Recognition stop error:",
            error
        );

    }

    isListening = false;

    resetVoiceButton();

}


/* ============================================================
   RESET VOICE BUTTON
   ============================================================ */

function resetVoiceButton() {

    if (!startVoiceButton) {
        return;
    }

    startVoiceButton.innerHTML = `

        <i class="fa-solid fa-microphone"></i>

        <span>Start Voice Assistant</span>

    `;

}


/* ============================================================
   PROCESS VOICE COMMAND
   ============================================================ */

function processVoiceCommand(command) {

    const text =
        command
            .toLowerCase()
            .trim();


    /* ========================================================
       OPEN REPORTS
       ======================================================== */

    if (
        text.includes("open reports") ||
        text.includes("show reports") ||
        text.includes("reports")
    ) {

        speak(
            "Opening reports."
        );

        setAIStatus(
            "Opening Reports..."
        );

        setTimeout(
            function () {

                window.location.href =
                    "reports.html";

            },
            700
        );

        return;

    }


    /* ========================================================
       OPEN URBAN GROWTH
       ======================================================== */

    if (
        text.includes("open urban growth") ||
        text.includes("urban growth")
    ) {

        speak(
            "Opening urban growth analysis."
        );

        setAIStatus(
            "Opening Urban Growth..."
        );

        setTimeout(
            function () {

                window.location.href =
                    "urban-growth.html";

            },
            700
        );

        return;

    }


    /* ========================================================
       OPEN CHANGE DETECTION
       ======================================================== */

    if (
        text.includes("open change detection") ||
        text.includes("change detection")
    ) {

        speak(
            "Opening change detection."
        );

        setAIStatus(
            "Opening Change Detection..."
        );

        setTimeout(
            function () {

                window.location.href =
                    "change-detection.html";

            },
            700
        );

        return;

    }


    /* ========================================================
       REFRESH DASHBOARD
       ======================================================== */

    if (
        text.includes("refresh dashboard") ||
        text.includes("refresh")
    ) {

        speak(
            "Refreshing dashboard."
        );

        setAIStatus(
            "Refreshing..."
        );

        setTimeout(
            function () {

                loadDashboardActivity();

                setAIStatus(
                    "Ready"
                );

                setAIMessage(
                    "Dashboard activity has been refreshed."
                );

            },
            500
        );

        return;

    }


    /* ========================================================
       OPEN HOME
       ======================================================== */

    if (
        text.includes("open home") ||
        text.includes("go home") ||
        text === "home"
    ) {

        speak(
            "Opening home."
        );

        setTimeout(
            function () {

                window.location.href =
                    "index.html";

            },
            700
        );

        return;

    }


    /* ========================================================
       CLOSE ASSISTANT
       ======================================================== */

    if (
        text.includes("close assistant") ||
        text.includes("close ai")
    ) {

        speak(
            "Closing Satellite AI."
        );

        setTimeout(
            function () {

                if (voiceAssistant) {

                    voiceAssistant.classList.remove(
                        "active"
                    );

                }

            },
            700
        );

        return;

    }


    /* ========================================================
       HELP
       ======================================================== */

    if (
        text.includes("help") ||
        text.includes("what can you do")
    ) {

        const message =
            "You can say open reports, open urban growth, open change detection, refresh dashboard, or open home.";

        setAIMessage(
            message
        );

        setAIStatus(
            "Ready"
        );

        speak(
            message
        );

        return;

    }


    /* ========================================================
       UNKNOWN COMMAND
       ======================================================== */

    const unknownMessage =
        "I didn't recognize that command. Try saying open reports, open urban growth, open change detection, or refresh dashboard.";

    setAIMessage(
        unknownMessage
    );

    setAIStatus(
        "Command not recognized"
    );

    speak(
        unknownMessage
    );

}


/* ============================================================
   TEXT TO SPEECH
   ============================================================ */

function speak(text) {

    if (
        !("speechSynthesis" in window)
    ) {

        return;

    }

    window.speechSynthesis.cancel();

    const utterance =
        new SpeechSynthesisUtterance(
            text
        );

    utterance.lang =
        "en-US";

    utterance.rate =
        0.95;

    utterance.pitch =
        1;

    window.speechSynthesis.speak(
        utterance
    );

}


/* ============================================================
   INITIALIZE DASHBOARD
   ============================================================ */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        loadDashboardActivity();

        setAIStatus(
            "Ready"
        );

    }
);


/* ============================================================
   DEBUG MESSAGE
   ============================================================ */

console.log(
    "Satellite AI Dashboard JavaScript loaded successfully."
);