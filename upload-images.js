// ============================================================
// SATELLITE AI - UPLOAD & INGESTION HUB CONTROLLER
// ============================================================

document.addEventListener("DOMContentLoaded", () => {
    setupImagePreview("beforeInput", "beforePreview", "beforeFileName");
    setupImagePreview("afterInput", "afterPreview", "afterFileName");
    setupDragAndDrop("beforeCard", "beforeInput", "beforePreview", "beforeFileName");
    setupDragAndDrop("afterCard", "afterInput", "afterPreview", "afterFileName");
});

function setupImagePreview(inputId, imgId, nameTagId) {
    const input = document.getElementById(inputId);
    const img = document.getElementById(imgId);
    const tag = document.getElementById(nameTagId);

    if (!input || !img) return;

    input.addEventListener("change", function () {
        const file = this.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                img.src = e.target.result;
                if (tag) tag.textContent = file.name;
            };
            reader.readAsDataURL(file);
        }
    });
}

function setupDragAndDrop(cardId, inputId, imgId, nameTagId) {
    const card = document.getElementById(cardId);
    const input = document.getElementById(inputId);
    const img = document.getElementById(imgId);
    const tag = document.getElementById(nameTagId);

    if (!card || !input || !img) return;

    card.addEventListener("dragover", (e) => {
        e.preventDefault();
        card.style.borderColor = "var(--accent-cyan)";
        card.style.transform = "scale(1.02)";
    });

    card.addEventListener("dragleave", (e) => {
        e.preventDefault();
        card.style.borderColor = "";
        card.style.transform = "";
    });

    card.addEventListener("drop", (e) => {
        e.preventDefault();
        card.style.borderColor = "";
        card.style.transform = "";

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const file = e.dataTransfer.files[0];
            const reader = new FileReader();
            reader.onload = (ev) => {
                img.src = ev.target.result;
                if (tag) tag.textContent = file.name;
            };
            reader.readAsDataURL(file);
        }
    });
}

function clearUploads() {
    const beforeInput = document.getElementById("beforeInput");
    const afterInput = document.getElementById("afterInput");
    const beforePreview = document.getElementById("beforePreview");
    const afterPreview = document.getElementById("afterPreview");
    const beforeTag = document.getElementById("beforeFileName");
    const afterTag = document.getElementById("afterFileName");

    if (beforeInput) beforeInput.value = "";
    if (afterInput) afterInput.value = "";
    if (beforePreview) beforePreview.src = "images/before image.png";
    if (afterPreview) afterPreview.src = "images/after image.png";
    if (beforeTag) beforeTag.textContent = "images/before image.png";
    if (afterTag) afterTag.textContent = "images/after image.png";
}