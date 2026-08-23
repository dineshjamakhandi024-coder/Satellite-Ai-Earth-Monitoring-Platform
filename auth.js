// ===============================
// SATELLITE AI LOGIN PROTECTION
// ===============================

(function () {
    const path = window.location.pathname;
    const currentPage = path.substring(path.lastIndexOf('/') + 1).toLowerCase() || "index.html";
    const publicPages = ["index.html", "login.html", "intro.html", ""];

    // Only protect internal operational modules
    if (!publicPages.includes(currentPage) && localStorage.getItem("isLoggedIn") !== "true") {
        window.location.href = "login.html";
    }
})();