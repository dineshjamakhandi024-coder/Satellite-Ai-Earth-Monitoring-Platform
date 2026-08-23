// ============================================================
// SATELLITE AI - UNIVERSAL RESPONSIVE MOBILE NAVIGATION CONTROLLER
// ============================================================

(function () {
    'use strict';

    const MODULES = [
        { title: 'Home', url: 'index.html', icon: 'fa-solid fa-house', tag: null },
        { title: '3D Earth Globe', url: 'earth.html', icon: 'fa-solid fa-globe', tag: '3D' },
        { title: 'Platform Dashboard', url: 'dashboard.html', icon: 'fa-solid fa-chart-pie', tag: 'Live' },
        { title: 'Change Detection', url: 'change-detection.html', icon: 'fa-solid fa-arrows-rotate', tag: 'AI' },
        { title: 'Urban Growth', url: 'urban-growth.html', icon: 'fa-solid fa-city', tag: null },
        { title: 'Forest Monitoring', url: 'forest-monitoring.html', icon: 'fa-solid fa-tree', tag: 'Eco' },
        { title: 'Flood Analysis', url: 'flood-analysis.html', icon: 'fa-solid fa-water', tag: null },
        { title: 'Climate Station', url: 'climate-monitoring.html', icon: 'fa-solid fa-cloud-sun', tag: 'Radar' },
        { title: 'Disaster Alerts', url: 'disaster-alerts.html', icon: 'fa-solid fa-triangle-exclamation', tag: 'Alert' },
        { title: 'Intelligence Reports', url: 'reports.html', icon: 'fa-solid fa-file-lines', tag: null },
        { title: 'Upload & Process', url: 'upload-images.html', icon: 'fa-solid fa-cloud-arrow-up', tag: null },
        { title: 'Global Live Feed', url: 'global-monitoring.html', icon: 'fa-solid fa-satellite-dish', tag: 'Live' }
    ];

    function getCurrentPage() {
        const path = window.location.pathname;
        const page = path.substring(path.lastIndexOf('/') + 1).toLowerCase();
        return page || 'index.html';
    }

    function initMobileNav() {
        // Ensure CSS is loaded
        if (!document.querySelector('link[href*="mobile-nav.css"]')) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = 'mobile-nav.css';
            document.head.appendChild(link);
        }

        const currentPage = getCurrentPage();
        const userName = localStorage.getItem('userName') || localStorage.getItem('userEmail') || 'Mission Analyst';
        const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

        // Check if drawer already exists
        let drawer = document.getElementById('mobileNavDrawer');
        let backdrop = document.getElementById('mobileNavBackdrop');

        if (!drawer) {
            // Create Backdrop
            backdrop = document.createElement('div');
            backdrop.id = 'mobileNavBackdrop';
            backdrop.className = 'mobile-nav-backdrop';
            document.body.appendChild(backdrop);

            // Create Drawer
            drawer = document.createElement('aside');
            drawer.id = 'mobileNavDrawer';
            drawer.className = 'mobile-nav-drawer';
            drawer.setAttribute('aria-label', 'Mobile Navigation');

            const navItemsHtml = MODULES.map(item => {
                const isActive = (item.url === currentPage) || (currentPage === '' && item.url === 'index.html');
                const tagHtml = item.tag ? `<span class="mobile-nav-tag ${item.tag.toLowerCase()}">${item.tag}</span>` : '';
                return `
                    <li class="mobile-nav-item">
                        <a href="${item.url}" class="${isActive ? 'active' : ''}">
                            <i class="${item.icon}"></i>
                            <span>${item.title}</span>
                            ${tagHtml}
                        </a>
                    </li>
                `;
            }).join('');

            drawer.innerHTML = `
                <div class="mobile-drawer-header">
                    <a href="index.html" class="mobile-drawer-brand">
                        <i class="fa-solid fa-satellite"></i>
                        <div class="mobile-drawer-brand-text">
                            <h3>SATELLITE AI</h3>
                            <small>Earth Intelligence</small>
                        </div>
                    </a>
                    <button type="button" class="mobile-drawer-close" id="mobileDrawerCloseBtn" aria-label="Close Navigation">
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                </div>
                
                <div class="mobile-drawer-body">
                    <div class="mobile-nav-group-title">Observation Modules</div>
                    <ul class="mobile-nav-list">
                        ${navItemsHtml}
                    </ul>
                </div>

                <div class="mobile-drawer-footer">
                    <div class="mobile-telemetry-badge">
                        <span class="mobile-telemetry-dot"></span>
                        <span>Orbital Telemetry Online</span>
                    </div>
                    <a href="${isLoggedIn ? 'dashboard.html' : 'login.html'}" class="mobile-drawer-user">
                        <div class="mobile-user-info">
                            <div class="mobile-user-avatar">
                                <i class="fa-solid fa-user-astronaut"></i>
                            </div>
                            <div class="mobile-user-meta">
                                <span class="mobile-user-name">${userName}</span>
                                <span class="mobile-user-role">${isLoggedIn ? 'Active Session' : 'Tap to Login'}</span>
                            </div>
                        </div>
                        <i class="fa-solid fa-chevron-right" style="font-size: 12px; color: #64748b;"></i>
                    </a>
                </div>
            `;

            document.body.appendChild(drawer);
        }

        function openDrawer() {
            if (drawer && backdrop) {
                drawer.classList.add('active');
                backdrop.classList.add('active');
                document.body.style.overflow = 'hidden';
            }
        }

        function closeDrawer() {
            if (drawer && backdrop) {
                drawer.classList.remove('active');
                backdrop.classList.remove('active');
                document.body.style.overflow = '';
            }
        }

        // Bind existing toggles or create header toggle if not found
        bindToggles(openDrawer);

        // Bind close button and backdrop
        const closeBtn = document.getElementById('mobileDrawerCloseBtn');
        if (closeBtn) {
            closeBtn.addEventListener('click', closeDrawer);
        }
        if (backdrop) {
            backdrop.addEventListener('click', closeDrawer);
        }

        // Close on ESC key
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && drawer.classList.contains('active')) {
                closeDrawer();
            }
        });

        // Touch swipe-to-close on mobile
        let touchStartX = 0;
        drawer.addEventListener('touchstart', function (e) {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        drawer.addEventListener('touchend', function (e) {
            const touchEndX = e.changedTouches[0].screenX;
            if (touchEndX - touchStartX > 60) {
                closeDrawer();
            }
        }, { passive: true });

        // Expose to window for inline onclick triggers
        window.SatelliteMobileNav = {
            open: openDrawer,
            close: closeDrawer,
            toggle: function () {
                if (drawer.classList.contains('active')) {
                    closeDrawer();
                } else {
                    openDrawer();
                }
            }
        };
    }

    function bindToggles(openDrawer) {
        // Look for buttons with class .mobile-nav-toggle or data-mobile-nav
        const toggles = document.querySelectorAll('.mobile-nav-toggle, [data-mobile-nav-toggle]');
        toggles.forEach(toggle => {
            toggle.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                openDrawer();
            });
        });

        // If no toggle was found in the header, inject a mobile toggle into .top-nav, .top-header, or .navbar
        if (toggles.length === 0) {
            const headerContainer = document.querySelector('.top-nav, .top-header, .cosmic-navbar, .navbar');
            if (headerContainer) {
                const autoToggle = document.createElement('button');
                autoToggle.type = 'button';
                autoToggle.className = 'mobile-nav-toggle';
                autoToggle.setAttribute('aria-label', 'Open Navigation');
                autoToggle.innerHTML = '<i class="fa-solid fa-bars"></i>';
                autoToggle.addEventListener('click', function (e) {
                    e.preventDefault();
                    e.stopPropagation();
                    openDrawer();
                });

                // Insert into actions or at end of header
                const actions = headerContainer.querySelector('.nav-actions, .header-right, .nav-buttons');
                if (actions) {
                    actions.appendChild(autoToggle);
                } else {
                    headerContainer.appendChild(autoToggle);
                }
            }
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initMobileNav);
    } else {
        initMobileNav();
    }
})();
