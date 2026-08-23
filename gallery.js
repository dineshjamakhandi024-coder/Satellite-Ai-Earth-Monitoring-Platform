function breakImage(element, videoPath) {
    if (!element || element.classList.contains("breaking")) {
        return;
    }

    element.classList.add("breaking");

    setTimeout(function () {
        const modal = document.getElementById("videoModal");
        const video = document.getElementById("galleryVideo");

        if (video && videoPath) {
            video.src = videoPath;
            video.play().catch(function () {
                console.log("Video autoplay blocked.");
            });
        }

        if (modal) {
            modal.classList.add("show");
        }

        setTimeout(function () {
            if (element) element.classList.remove("breaking");
        }, 500);
    }, 900);
}

function closeVideo() {
    const modal = document.getElementById("videoModal");
    const video = document.getElementById("galleryVideo");

    if (video) {
        video.pause();
        video.currentTime = 0;
        video.removeAttribute("src");
        video.load();
    }

    if (modal) {
        modal.classList.remove("show");
    }
}

// Close when clicking outside video
document.addEventListener("DOMContentLoaded", function () {
    const videoModal = document.getElementById("videoModal");
    if (videoModal) {
        videoModal.addEventListener("click", function (event) {
            if (event.target === this) {
                closeVideo();
            }
        });
    }
});

// ESC key
document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
        closeVideo();
    }
});