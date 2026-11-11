document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("pdmForm");
    const fileInputs = document.querySelectorAll("[data-file]");
    const progressText = document.getElementById("progressText");
    const progressFill = document.getElementById("progressFill");
    const resultSection = document.getElementById("submissionResult");

    const MAX_FILE_SIZE = 1 * 1024 * 1024;
    const REQUIRED_DOCUMENTS = 8;
    const selectedFiles = {};

    function formatFileSize(bytes) {
        return (bytes / 1024).toFixed(1) + " KB";
    }

    function updateProgress() {
        const completed = Object.keys(selectedFiles).length;
        progressText.textContent = `${completed} dari ${REQUIRED_DOCUMENTS} dokumen`;
        progressFill.style.width = `${(completed / REQUIRED_DOCUMENTS) * 100}%`;
    }

    function showFileStatus(input, message, isError = false) {
        const item = input.closest(".document-item");
        const status = item.querySelector(".file-status");

        status.textContent = message;
        status.style.color = isError ? "#b91c1c" : "";
        item.classList.toggle(
            "is-uploaded",
            !isError && Boolean(selectedFiles[input.dataset.file])
        );
    }

    fileInputs.forEach((input) => {
        input.addEventListener("change", () => {
            const file = input.files[0];
            const documentName = input.dataset.file;

            if (!file) return;

            if (!file.name.toLowerCase().endsWith(".pdf")) {
                delete selectedFiles[documentName];
                input.value = "";
                showFileStatus(input, "Format harus PDF", true);
                updateProgress();
                return;
            }

            if (file.type && file.type !== "application/pdf") {
                delete selectedFiles[documentName];
                input.value = "";
                showFileStatus(input, "File bukan PDF yang valid", true);
                updateProgress();
                return;
            }

            if (file.size > MAX_FILE_SIZE) {
                delete selectedFiles[documentName];
                input.value = "";
                showFileStatus(input, "Ukuran file melebihi 1 MB", true);
                updateProgress();
                return;
            }

            if (file.size === 0) {
                delete selectedFiles[documentName];
                input.value = "";
                showFileStatus(input, "File kosong tidak dapat digunakan", true);
                updateProgress();
                return;
            }

            selectedFiles[documentName] = file;

            showFileStatus(
                input,
                `${file.name} (${formatFileSize(file.size)})`
            );

            updateProgress();
        });
    });

    function generateTrackingCode() {
        const randomPart = Math.random()
            .toString(36)
            .substring(2, 8)
            .toUpperCase();

        return `PDM-${new Date().getFullYear()}-${randomPart}`;
    }

    form.addEventListener("submit", (event) => {
        event.preventDefault();

        const nama = document.getElementById("nama").value.trim();
        const nim = document.getElementById("nim").value.trim();
        const confirmation = document.getElementById("confirmation").checked;

        if (!nama || !nim) {
            alert("Nama lengkap dan NIM wajib diisi.");
            return;
        }

        if (!/^[a-zA-ZÀ-ÿ\s.'-]+$/.test(nama)) {
            alert("Nama hanya boleh berisi huruf dan tanda baca yang umum.");
            return;
        }

        if (Object.keys(selectedFiles).length !== REQUIRED_DOCUMENTS) {
            alert("Silakan lengkapi seluruh delapan dokumen persyaratan.");
            return;
        }

        if (!confirmation) {
            alert("Silakan centang pernyataan sebelum mengirim pengajuan.");
            return;
        }

        const trackingCode = generateTrackingCode();
        document.getElementById("trackingCode").textContent = trackingCode;

        form.hidden = true;
        resultSection.hidden = false;

        window.scrollTo({
            top: resultSection.offsetTop - 30,
            behavior: "smooth"
        });

        console.log("Simulasi pengajuan PDM NIM:", {
            nama,
            nim,
            dokumen: Object.keys(selectedFiles),
            trackingCode
        });
    });

    document.getElementById("copyTracking").addEventListener("click", async () => {
        const code = document.getElementById("trackingCode").textContent;

        try {
            await navigator.clipboard.writeText(code);
            alert("Kode simulasi berhasil disalin.");
        } catch {
            alert("Tidak dapat menyalin otomatis. Silakan salin kode secara manual.");
        }
    });

    document.getElementById("resetForm").addEventListener("click", () => {
        form.reset();

        fileInputs.forEach((input) => {
            input.value = "";
            showFileStatus(input, "Belum dipilih");
        });

        Object.keys(selectedFiles).forEach((key) => {
            delete selectedFiles[key];
        });

        updateProgress();

        form.hidden = false;
        resultSection.hidden = true;

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    });

    updateProgress();
});
