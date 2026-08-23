/*=========================
    LOGGED-IN USER & AVATAR
=========================*/

function loadUser() {
    const userNameEl = document.getElementById("userName");
    const profileNameEl = document.getElementById("profileUserName");
    const storedName = localStorage.getItem("userName");
    const userData = localStorage.getItem("satelliteUser");

    let displayName = "Explorer";

    if (storedName) {
        displayName = storedName;
    } else if (userData) {
        try {
            const user = JSON.parse(userData);
            if (user && user.name) {
                displayName = user.name;
            }
        } catch (e) {
            console.warn("User parse error:", e);
        }
    }

    if (userNameEl) userNameEl.innerText = displayName;
    if (profileNameEl) profileNameEl.innerText = displayName;

    loadUserAvatar();
}

function loadUserAvatar() {
    const avatarData = localStorage.getItem("userAvatar");
    const navImg = document.getElementById("userAvatarImg");
    const navIcon = document.getElementById("defaultUserIcon");
    const largeImg = document.getElementById("largeUserAvatarImg");
    const largeIcon = document.getElementById("largeDefaultUserIcon");
    const removeBtn = document.getElementById("removeAvatarBtn");

    if (avatarData) {
        if (navImg) {
            navImg.src = avatarData;
            navImg.classList.remove("hidden");
        }
        if (navIcon) navIcon.classList.add("hidden");

        if (largeImg) {
            largeImg.src = avatarData;
            largeImg.classList.remove("hidden");
        }
        if (largeIcon) largeIcon.classList.add("hidden");

        if (removeBtn) removeBtn.classList.remove("hidden");
    } else {
        if (navImg) {
            navImg.src = "";
            navImg.classList.add("hidden");
        }
        if (navIcon) navIcon.classList.remove("hidden");

        if (largeImg) {
            largeImg.src = "";
            largeImg.classList.add("hidden");
        }
        if (largeIcon) largeIcon.classList.remove("hidden");

        if (removeBtn) removeBtn.classList.add("hidden");
    }
}

function triggerAvatarUpload() {
    const fileInput = document.getElementById("avatarFileInput");
    if (fileInput) {
        fileInput.click();
    }
}

function handleAvatarUpload(event) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
        alert("Please select a valid image file.");
        return;
    }

    // Limit to 4MB
    if (file.size > 4 * 1024 * 1024) {
        alert("Please select an image smaller than 4MB.");
        return;
    }

    const reader = new FileReader();
    reader.onload = function (e) {
        const base64Data = e.target.result;
        try {
            localStorage.setItem("userAvatar", base64Data);
            loadUserAvatar();
            if (typeof SatelliteNotifications !== "undefined" && SatelliteNotifications.showToast) {
                SatelliteNotifications.showToast({
                    title: "Profile Photo Updated",
                    desc: "Your new avatar has been synchronized.",
                    category: "fleet",
                    icon: "fa-user-check"
                });
            }
        } catch (err) {
            console.error("Storage error:", err);
            alert("Could not save photo due to browser storage limits.");
        }
    };
    reader.readAsDataURL(file);
}

function removeUserAvatar() {
    localStorage.removeItem("userAvatar");
    loadUserAvatar();
    if (typeof SatelliteNotifications !== "undefined" && SatelliteNotifications.showToast) {
        SatelliteNotifications.showToast({
            title: "Profile Photo Removed",
            desc: "Default satellite avatar restored.",
            category: "fleet",
            icon: "fa-user"
        });
    }
}

document.addEventListener("DOMContentLoaded", loadUser);
loadUser();




/*=========================
    LIVE CLOCK
=========================*/

function updateClock() {

    const now = new Date();

    const time = now.toLocaleTimeString();

    const clock = document.getElementById("clock");

    if (clock) {
        clock.innerHTML = time;
    }

}

setInterval(updateClock, 1000);

updateClock();


/*=========================
    SCROLL TO TOP
=========================*/

const topBtn = document.getElementById("topBtn");

window.onscroll = function () {

    if (
        document.body.scrollTop > 300 ||
        document.documentElement.scrollTop > 300
    ) {

        if (topBtn) {
            topBtn.style.display = "block";
        }

    } else {

        if (topBtn) {
            topBtn.style.display = "none";
        }

    }

};


if (topBtn) {

    topBtn.onclick = function () {

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    };

}


/*=========================
    ANIMATED COUNTERS
=========================*/

const counters = document.querySelectorAll(".stat-card h2");

counters.forEach(counter => {

    const target = counter.innerText;

    const number = parseInt(target);

    if (isNaN(number)) return;

    let count = 0;

    const speed = Math.ceil(number / 80);

    const update = () => {

        count += speed;

        if (count < number) {

            counter.innerText = count + "+";

            requestAnimationFrame(update);

        } else {

            counter.innerText = target;

        }

    };

    update();

});


/*=========================
    SCROLL REVEAL
=========================*/

const revealElements = document.querySelectorAll(
    ".feature-card,.project-card,.testimonial-card,.contact-card,.stat-card,.why-card"
);

function reveal() {

    const trigger = window.innerHeight - 120;

    revealElements.forEach(el => {

        const top = el.getBoundingClientRect().top;

        if (top < trigger) {

            el.style.opacity = "1";

            el.style.transform = "translateY(0)";

        }

    });

}


revealElements.forEach(el => {

    el.style.opacity = "0";

    el.style.transform = "translateY(40px)";

    el.style.transition = ".8s";

});

window.addEventListener("scroll", reveal);

reveal();


/*=========================
    NEWSLETTER
=========================*/

const subscribeBtn =
    document.querySelector(".newsletter button");

if (subscribeBtn) {

    subscribeBtn.addEventListener("click", () => {

        const email =
            document.querySelector(".newsletter input").value;

        if (email === "") {

            alert("Please enter your email.");

            return;

        }

        alert("Thank you for subscribing! 🎉");

        document.querySelector(".newsletter input").value = "";

    });

}


/*=========================
    BUTTON RIPPLE / HOVER
=========================*/

const buttons =
    document.querySelectorAll(".btn,.btn2,.login-btn");

buttons.forEach(btn => {

    btn.addEventListener("mouseenter", () => {

        btn.style.transition = ".3s";

        btn.style.transform = "scale(1.05)";

    });

    btn.addEventListener("mouseleave", () => {

        btn.style.transform = "scale(1)";

    });

});
/*=========================
    USER MENU & LOGOUT
=========================*/

function toggleUserMenu() {
    const profileMenu = document.getElementById("userProfileMenu");
    const logoutMenu = document.getElementById("logoutMenu");
    
    if (profileMenu) {
        profileMenu.classList.toggle("show");
    } else if (logoutMenu) {
        logoutMenu.classList.toggle("show");
    }
}

function logoutUser() {
    localStorage.removeItem("satelliteUser");
    window.location.href = "login.html";
}

/*============================================================
    LIVE SATELLITE NOTIFICATIONS CENTER & TOAST ENGINE
============================================================*/

const SatelliteNotifications = {
    currentCategory: 'all',
    data: [
        {
            id: 'notif-1',
            title: 'California Wildfire Alert: Level 4',
            desc: 'Thermal infrared anomaly detected by Terra MODIS across Sierra foothills. 4,200 ha active fire front.',
            category: 'critical',
            time: '2m ago',
            tag: 'Disaster Alert',
            unread: true,
            icon: 'fa-fire',
            link: 'disaster-alerts.html'
        },
        {
            id: 'notif-2',
            title: 'Sentinel-2A Constellation Sync',
            desc: 'Orbital downlink completed over North European sector. 4.8 TB high-res imagery indexed.',
            category: 'fleet',
            time: '14m ago',
            tag: 'Telemetry',
            unread: true,
            icon: 'fa-satellite',
            link: 'earth.html'
        },
        {
            id: 'notif-3',
            title: 'Brahmaputra Basin Flood Status',
            desc: 'Sentinel-1 SAR radar confirms inundation receded by 18% in lower delta. Downstream alerts easing.',
            category: 'critical',
            time: '35m ago',
            tag: 'Hydrology',
            unread: true,
            icon: 'fa-water',
            link: 'flood-analysis.html'
        },
        {
            id: 'notif-4',
            title: 'Arctic Sea Ice Margin Shift',
            desc: 'Multispectral sensors report calving along Larsen-C ice shelf. Temperature variance +1.24°C.',
            category: 'climate',
            time: '1h ago',
            tag: 'Climate',
            unread: true,
            icon: 'fa-temperature-high',
            link: 'climate-monitoring.html'
        },
        {
            id: 'notif-5',
            title: 'Amazon Basin NDVI Reforestation',
            desc: 'Vegetation canopy density gained +12,400 hectares in verified recovery zone.',
            category: 'climate',
            time: '2h ago',
            tag: 'Forest',
            unread: false,
            icon: 'fa-tree',
            link: 'forest-monitoring.html'
        }
    ],

    init() {
        this.render();
        this.bindEvents();
        this.startToastSimulator();
    },

    bindEvents() {
        // Close notification panel and user menu when clicking outside
        document.addEventListener('click', (e) => {
            const notifPanel = document.getElementById('notificationPanel');
            const notifBtn = document.getElementById('notificationBtn');
            const profileMenu = document.getElementById('userProfileMenu');
            const logoutMenu = document.getElementById('logoutMenu');
            const userBtn = document.getElementById('userAvatarBtn') || document.querySelector('.welcome-user');

            if (notifPanel && notifBtn && !notifPanel.contains(e.target) && !notifBtn.contains(e.target)) {
                notifPanel.classList.remove('show');
                notifBtn.classList.remove('active');
            }

            if (profileMenu && userBtn && !profileMenu.contains(e.target) && !userBtn.contains(e.target)) {
                profileMenu.classList.remove('show');
            }

            if (logoutMenu && userBtn && !logoutMenu.contains(e.target) && !userBtn.contains(e.target)) {
                logoutMenu.classList.remove('show');
            }
        });
    },


    toggle() {
        const panel = document.getElementById('notificationPanel');
        const btn = document.getElementById('notificationBtn');
        if (panel && btn) {
            const isOpen = panel.classList.toggle('show');
            btn.classList.toggle('active', isOpen);
            if (isOpen) {
                this.render();
            }
        }
    },

    render() {
        const list = document.getElementById('notificationList');
        const badge = document.getElementById('notificationBadge');
        if (!list) return;

        const filtered = this.data.filter(item => {
            if (this.currentCategory === 'all') return true;
            return item.category === this.currentCategory;
        });

        // Update badge
        const unreadCount = this.data.filter(d => d.unread).length;
        if (badge) {
            badge.innerText = unreadCount;
            badge.classList.toggle('hidden', unreadCount === 0);
        }

        if (filtered.length === 0) {
            list.innerHTML = `
                <div class="notif-empty">
                    <i class="fa-solid fa-bell-slash"></i>
                    <p>No notifications in this category.</p>
                </div>
            `;
            return;
        }

        list.innerHTML = filtered.map(item => `
            <div class="notif-item ${item.unread ? 'unread' : ''}" onclick="SatelliteNotifications.openItem('${item.id}', '${item.link}')">
                <div class="notif-icon-wrap ${item.category}">
                    <i class="fa-solid ${item.icon}"></i>
                </div>
                <div class="notif-content">
                    <div class="notif-title-row">
                        <strong>${item.title}</strong>
                        <span class="notif-time">${item.time}</span>
                    </div>
                    <p class="notif-desc">${item.desc}</p>
                    <div class="notif-tag-row">
                        <span class="notif-tag">${item.tag}</span>
                        <a href="${item.link}" class="notif-action-link" onclick="event.stopPropagation()">Inspect <i class="fa-solid fa-arrow-right"></i></a>
                    </div>
                </div>
            </div>
        `).join('');
    },

    filter(category) {
        this.currentCategory = category;
        document.querySelectorAll('.notif-tab-pill').forEach(pill => {
            pill.classList.toggle('active', pill.getAttribute('data-cat') === category);
        });
        this.render();
    },

    openItem(id, link) {
        const item = this.data.find(d => d.id === id);
        if (item) item.unread = false;
        this.render();
        if (link) window.location.href = link;
    },

    clearAll() {
        this.data.forEach(d => d.unread = false);
        this.render();
        this.showToast({
            title: 'Notifications Cleared',
            desc: 'All satellite telemetry alerts marked as read.',
            category: 'fleet',
            icon: 'fa-check'
        });
    },

    showToast(notif) {
        const container = document.getElementById('toastContainer');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = 'toast-item';
        toast.innerHTML = `
            <i class="fa-solid ${notif.icon || 'fa-bell'} toast-icon ${notif.category || 'fleet'}"></i>
            <div class="toast-body">
                <div class="toast-title">${notif.title}</div>
                <p class="toast-msg">${notif.desc}</p>
            </div>
            <button type="button" class="toast-close" onclick="this.parentElement.remove()"><i class="fa-solid fa-xmark"></i></button>
            <div class="toast-progress"></div>
        `;

        container.appendChild(toast);

        // Auto remove after 5s
        setTimeout(() => {
            toast.classList.add('hide');
            setTimeout(() => toast.remove(), 350);
        }, 5000);
    },

    startToastSimulator() {
        // Trigger initial welcome toast after 2.5s
        setTimeout(() => {
            this.showToast({
                title: '🛰️ Fleet Telemetry Synchronized',
                desc: '18 orbital satellites connected and streaming live telemetry.',
                category: 'fleet',
                icon: 'fa-satellite-dish'
            });
        }, 2200);
    }
};

// Global helper functions
function toggleNotificationPanel() {
    SatelliteNotifications.toggle();
}

function filterNotifications(cat) {
    SatelliteNotifications.filter(cat);
}

function clearAllNotifications() {
    SatelliteNotifications.clearAll();
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    SatelliteNotifications.init();
});