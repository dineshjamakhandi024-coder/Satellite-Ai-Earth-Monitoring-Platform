// ============================================================
// SATELLITE AI - AEROSPACE AUTHENTICATION & INTERACTIVE ENGINE
// ============================================================

const API_URL = (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") ? "http://127.0.0.1:8000" : "https://satellite-ai-backend.onrender.com";

// ============================================================
// 1. INITIALIZATION ON DOM LOAD
// ============================================================
document.addEventListener("DOMContentLoaded", function () {
    initSpaceCanvas();
    startUtcClock();
    checkBackendHealth();
});

// ============================================================
// 2. LIVE UTC TELEMETRY CLOCK
// ============================================================
function startUtcClock() {
    const clockEl = document.getElementById("utcClock");
    if (!clockEl) return;

    function update() {
        const now = new Date();
        const hrs = String(now.getUTCHours()).padStart(2, '0');
        const mins = String(now.getUTCMinutes()).padStart(2, '0');
        const secs = String(now.getUTCSeconds()).padStart(2, '0');
        clockEl.textContent = `UTC ${hrs}:${mins}:${secs}`;
    }

    update();
    setInterval(update, 1000);
}

// ============================================================
// 3. INTERACTIVE DEEP SPACE PARTICLE & CONSTELLATION CANVAS
// ============================================================
function initSpaceCanvas() {
    const canvas = document.getElementById("spaceCanvas");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    window.addEventListener("resize", function () {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    });

    const particles = [];
    const numParticles = Math.min(Math.floor((width * height) / 12000), 120);

    const mouse = { x: null, y: null, maxDist: 150 };

    window.addEventListener("mousemove", function (e) {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });

    window.addEventListener("mouseleave", function () {
        mouse.x = null;
        mouse.y = null;
    });

    class Particle {
        constructor() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.vx = (Math.random() - 0.5) * 0.4;
            this.vy = (Math.random() - 0.5) * 0.4;
            this.radius = Math.random() * 1.8 + 0.6;
            this.alpha = Math.random() * 0.7 + 0.3;
            this.isSat = Math.random() > 0.88;
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;

            if (this.x < 0) this.x = width;
            if (this.x > width) this.x = 0;
            if (this.y < 0) this.y = height;
            if (this.y > height) this.y = 0;
        }

        draw() {
            ctx.save();
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);

            if (this.isSat) {
                ctx.fillStyle = `rgba(0, 255, 163, ${this.alpha})`;
                ctx.shadowColor = "#00ffa3";
                ctx.shadowBlur = 8;
            } else {
                ctx.fillStyle = `rgba(0, 243, 255, ${this.alpha})`;
                ctx.shadowColor = "#00f3ff";
                ctx.shadowBlur = 4;
            }

            ctx.fill();
            ctx.restore();
        }
    }

    for (let i = 0; i < numParticles; i++) {
        particles.push(new Particle());
    }

    function animate() {
        ctx.clearRect(0, 0, width, height);

        // Draw connections between close particles
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < 110) {
                    const alpha = (1 - dist / 110) * 0.18;
                    ctx.strokeStyle = `rgba(0, 243, 255, ${alpha})`;
                    ctx.lineWidth = 0.7;
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.stroke();
                }
            }
        }

        // Draw interactive mouse connection lines
        if (mouse.x !== null && mouse.y !== null) {
            for (let i = 0; i < particles.length; i++) {
                const dx = particles[i].x - mouse.x;
                const dy = particles[i].y - mouse.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < mouse.maxDist) {
                    const alpha = (1 - dist / mouse.maxDist) * 0.35;
                    ctx.strokeStyle = `rgba(0, 255, 163, ${alpha})`;
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(mouse.x, mouse.y);
                    ctx.stroke();
                }
            }
        }

        particles.forEach((p) => {
            p.update();
            p.draw();
        });

        requestAnimationFrame(animate);
    }

    animate();
}

// ============================================================
// 4. TAB SWITCHING (SIGN IN / REGISTER)
// ============================================================
function switchAuthTab(tab) {
    const tabLogin = document.getElementById("tabLogin");
    const tabRegister = document.getElementById("tabRegister");
    const tabContainer = document.querySelector(".auth-tabs");
    const loginForm = document.getElementById("loginForm");
    const registerForm = document.getElementById("registerForm");
    const authTitle = document.getElementById("authTitle");
    const authSubtitle = document.getElementById("authSubtitle");

    if (tab === "login") {
        tabLogin.classList.add("active");
        tabRegister.classList.remove("active");
        tabContainer.classList.remove("register-active");

        loginForm.classList.add("active");
        registerForm.classList.remove("active");

        authTitle.textContent = "Terminal Authorization";
        authSubtitle.textContent = "Authenticate credentials to establish telemetry link";
    } else {
        tabRegister.classList.add("active");
        tabLogin.classList.remove("active");
        tabContainer.classList.add("register-active");

        registerForm.classList.add("active");
        loginForm.classList.remove("active");

        authTitle.textContent = "Operator Registration";
        authSubtitle.textContent = "Generate orbital clearance credentials for Earth observation";
    }
}

// ============================================================
// 5. 1-CLICK DEMO AUTO-FILL
// ============================================================
function fillDemoCredentials() {
    switchAuthTab("login");
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");

    if (emailInput && passwordInput) {
        emailInput.value = "demo@satellite.ai";
        passwordInput.value = "satellite123";

        // Highlight input field
        emailInput.parentElement.style.boxShadow = "0 0 25px rgba(0, 243, 255, 0.8)";
        passwordInput.parentElement.style.boxShadow = "0 0 25px rgba(0, 243, 255, 0.8)";

        setTimeout(() => {
            emailInput.parentElement.style.boxShadow = "";
            passwordInput.parentElement.style.boxShadow = "";
        }, 1200);

        showToast("Demo Credentials Loaded (Dr. Sarah Connor)", "info");
    }
}

// ============================================================
// 6. PASSWORD VISIBILITY TOGGLING
// ============================================================
function togglePassword(inputId, btn) {
    const input = document.getElementById(inputId);
    if (!input || !btn) return;

    const icon = btn.querySelector("i");
    if (input.type === "password") {
        input.type = "text";
        if (icon) {
            icon.classList.remove("fa-eye");
            icon.classList.add("fa-eye-slash");
        }
    } else {
        input.type = "password";
        if (icon) {
            icon.classList.remove("fa-eye-slash");
            icon.classList.add("fa-eye");
        }
    }
}

// ============================================================
// 7. PASSWORD STRENGTH METER
// ============================================================
function checkPasswordStrength(val) {
    const fill = document.getElementById("strengthFill");
    const label = document.getElementById("strengthLabel");
    if (!fill || !label) return;

    if (!val) {
        fill.style.width = "0%";
        fill.style.backgroundColor = "#475569";
        label.textContent = "Security: Enter password";
        label.style.color = "var(--text-muted)";
        return;
    }

    let score = 0;
    if (val.length >= 6) score++;
    if (val.length >= 10) score++;
    if (/[A-Z]/.test(val) && /[a-z]/.test(val)) score++;
    if (/[0-9]/.test(val)) score++;
    if (/[^A-Za-z0-9]/.test(val)) score++;

    if (score <= 2) {
        fill.style.width = "30%";
        fill.style.backgroundColor = "var(--accent-red)";
        label.textContent = "Security: Weak (Min 6 chars)";
        label.style.color = "var(--accent-red)";
    } else if (score <= 3) {
        fill.style.width = "65%";
        fill.style.backgroundColor = "var(--accent-gold)";
        label.textContent = "Security: Moderate (Add symbols/numbers)";
        label.style.color = "var(--accent-gold)";
    } else {
        fill.style.width = "100%";
        fill.style.backgroundColor = "var(--emerald-neon)";
        label.textContent = "Security: Quantum Grade (Verified)";
        label.style.color = "var(--emerald-neon)";
    }
}

// ============================================================
// 8. USER LOGIN HANDLER
// ============================================================
async function loginUser(event) {
    event.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const loginButton = document.getElementById("loginButton");

    if (!email || !password) {
        showToast("Please enter both email and password.", "error");
        return false;
    }

    if (loginButton) {
        loginButton.disabled = true;
        loginButton.innerHTML = `
            <span class="btn-content">
                <i class="fa-solid fa-spinner fa-spin"></i>
                <span>Verifying Clearance...</span>
            </span>
        `;
    }

    try {
        const response = await fetch(`${API_URL}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: email, password: password })
        });

        const data = await response.json();

        if (response.ok && data.success) {
            handleLoginSuccess(data.user || { name: "Satellite Analyst", email: email, role: "Analyst" });
        } else {
            // Check fallback for demo credentials even if database doesn't have it yet
            if (email.toLowerCase() === "demo@satellite.ai" && password === "satellite123") {
                handleLoginSuccess({ name: "Dr. Sarah Connor", email: "demo@satellite.ai", role: "Chief Satellite Analyst" });
            } else {
                showToast(data.message || "Invalid operator credentials.", "error");
                resetLoginButton();
            }
        }
    } catch (error) {
        console.warn("FastAPI backend connection error:", error);

        // Fallback for offline demo testing
        if (email.toLowerCase() === "demo@satellite.ai" && password === "satellite123") {
            showToast("Authenticated in Offline Simulation Mode", "info");
            handleLoginSuccess({ name: "Dr. Sarah Connor", email: "demo@satellite.ai", role: "Chief Satellite Analyst" });
        } else {
            showToast("Cannot reach Satellite AI server (FastAPI offline).", "error");
            resetLoginButton();
        }
    }

    return false;
}

function handleLoginSuccess(user) {
    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("userName", user.name || "Satellite Analyst");
    localStorage.setItem("userEmail", user.email || "analyst@satellite.ai");
    localStorage.setItem("userRole", user.role || "Researcher");

    showToast("Clearance Verified! Launching Command Hub...", "success");

    // Trigger futuristic Access Granted HUD
    const hud = document.getElementById("accessGrantedHud");
    if (hud) {
        hud.classList.add("show");
    }

    setTimeout(() => {
        window.location.href = "index.html";
    }, 2200);
}

function resetLoginButton() {
    const loginButton = document.getElementById("loginButton");
    if (!loginButton) return;

    loginButton.disabled = false;
    loginButton.innerHTML = `
        <span class="btn-content">
            <i class="fa-solid fa-rocket"></i>
            <span>Authorize & Enter Platform</span>
        </span>
        <div class="btn-glow"></div>
    `;
}

// ============================================================
// 9. USER REGISTRATION HANDLER
// ============================================================
async function registerUser(event) {
    event.preventDefault();

    const name = document.getElementById("registerName").value.trim();
    const email = document.getElementById("registerEmail").value.trim();
    const role = document.getElementById("registerRole").value;
    const mobile = document.getElementById("registerMobile").value.trim();
    const password = document.getElementById("registerPassword").value;
    const confirmPassword = document.getElementById("confirmPassword").value;
    const registerButton = document.getElementById("registerButton");

    if (password !== confirmPassword) {
        showToast("Passwords do not match!", "error");
        return false;
    }

    if (password.length < 6) {
        showToast("Password must be at least 6 characters.", "error");
        return false;
    }

    if (registerButton) {
        registerButton.disabled = true;
        registerButton.innerHTML = `
            <span class="btn-content">
                <i class="fa-solid fa-spinner fa-spin"></i>
                <span>Enrolling Operator...</span>
            </span>
        `;
    }

    try {
        const response = await fetch(`${API_URL}/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                name: name,
                email: email,
                role: role,
                mobile: mobile,
                password: password
            })
        });

        const data = await response.json();

        if (response.ok && data.success) {
            showToast("Account Created! You may now sign in.", "success");
            switchAuthTab("login");

            const loginEmail = document.getElementById("email");
            const loginPassword = document.getElementById("password");
            if (loginEmail) loginEmail.value = email;
            if (loginPassword) {
                loginPassword.value = "";
                loginPassword.focus();
            }
        } else {
            showToast(data.message || "Registration failed.", "error");
        }
    } catch (error) {
        console.error("Register network error:", error);
        showToast("Unable to connect to backend server for registration.", "error");
    } finally {
        if (registerButton) {
            registerButton.disabled = false;
            registerButton.innerHTML = `
                <span class="btn-content">
                    <i class="fa-solid fa-user-check"></i>
                    <span>Register & Generate Clearance</span>
                </span>
                <div class="btn-glow"></div>
            `;
        }
    }

    return false;
}

// ============================================================
// 10. FORGOT PASSWORD MODAL & HANDLER
// ============================================================
function openForgotModal() {
    const modal = document.getElementById("forgotModal");
    if (!modal) return;
    modal.classList.add("open");
    const currentEmail = document.getElementById("email").value;
    const forgotEmail = document.getElementById("forgotEmail");
    if (forgotEmail && currentEmail) {
        forgotEmail.value = currentEmail;
    }
}

function closeForgotModal() {
    const modal = document.getElementById("forgotModal");
    if (!modal) return;
    modal.classList.remove("open");
}

async function handleForgotPassword(event) {
    event.preventDefault();
    const email = document.getElementById("forgotEmail").value.trim();
    const submitBtn = document.getElementById("btnForgotSubmit");

    if (!email) {
        showToast("Please provide your email address.", "error");
        return false;
    }

    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `<span><i class="fa-solid fa-spinner fa-spin"></i> Dispatching...</span>`;
    }

    try {
        const response = await fetch(`${API_URL}/forgot-password`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: email })
        });

        const data = await response.json();
        if (response.ok && data.success) {
            showToast(data.message || "Recovery link dispatched to email.", "success");
            closeForgotModal();
        } else {
            showToast(data.message || "No account found with this email.", "error");
        }
    } catch (e) {
        showToast("Password reset instructions dispatched.", "info");
        closeForgotModal();
    } finally {
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = `<span>Send Recovery Dispatch</span>`;
        }
    }

    return false;
}

// ============================================================
// 11. TOAST NOTIFICATION SYSTEM
// ============================================================
function showToast(message, type = "info", duration = 4000) {
    const container = document.getElementById("toastContainer");
    if (!container) return;

    const toast = document.createElement("div");
    toast.className = `toast ${type}`;

    let icon = "fa-circle-info";
    if (type === "success") icon = "fa-circle-check";
    if (type === "error") icon = "fa-triangle-exclamation";

    toast.innerHTML = `
        <i class="fa-solid ${icon}"></i>
        <span>${message}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = "0";
        toast.style.transform = "translateX(100%)";
        toast.style.transition = "all 0.3s ease";
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

// ============================================================
// 12. BACKEND HEALTH CHECK
// ============================================================
async function checkBackendHealth() {
    const textEl = document.getElementById("backendStatusText");
    if (!textEl) return;

    try {
        const res = await fetch(`${API_URL}/`, { method: "GET" });
        if (res.ok) {
            textEl.textContent = "CONNECTED (ONLINE)";
            textEl.style.color = "var(--emerald-neon)";
        } else {
            textEl.textContent = "STANDBY (OFFLINE)";
            textEl.style.color = "var(--accent-gold)";
        }
    } catch (e) {
        textEl.textContent = "STANDBY (LOCAL SIM)";
        textEl.style.color = "var(--cyan-neon)";
    }
}

// Global Exports
window.loginUser = loginUser;
window.registerUser = registerUser;
window.switchAuthTab = switchAuthTab;
window.fillDemoCredentials = fillDemoCredentials;
window.togglePassword = togglePassword;
window.checkPasswordStrength = checkPasswordStrength;
window.openForgotModal = openForgotModal;
window.closeForgotModal = closeForgotModal;
window.handleForgotPassword = handleForgotPassword;
window.showToast = showToast;