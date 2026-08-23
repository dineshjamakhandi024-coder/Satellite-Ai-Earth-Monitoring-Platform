function showUpload() {
    const upload = document.getElementById("uploadSection");

    if (upload.style.display === "block") {
        upload.style.display = "none";
    } else {
        upload.style.display = "block";
        upload.scrollIntoView({
            behavior: "smooth"
        });
    }
}
