// ============================================================
// ASK SATELLITE AI BACKEND
// ============================================================

async function askSatelliteAI(command) {
    try {
        const response = await fetch(
            ((window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") ? "http://127.0.0.1:8000" : "https://satellite-ai-backend.onrender.com") + "/ai-assistant?command=" +
            encodeURIComponent(command)
        );

        if (!response.ok) {
            throw new Error("Backend returned HTTP " + response.status);
        }

        const data = await response.json();

        if (data.success && data.reply) {
            if (typeof AIAssistant !== 'undefined' && typeof AIAssistant.appendMessage === 'function') {
                AIAssistant.appendMessage('assistant', data.reply);
                if (typeof AIAssistant.speakResponse === 'function') {
                    AIAssistant.speakResponse(data.reply);
                }
            } else if (typeof respond === 'function') {
                respond(data.reply);
            }
            return true;
        }

        return false;
    } catch (error) {
        console.warn("Satellite AI backend not available (using client intelligence):", error.message);
        return false;
    }
}