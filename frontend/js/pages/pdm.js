document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("pdmForm");
    const resultSection = document.getElementById("submissionResult");

    const steps = document.querySelectorAll(".pdm-step");
    const indicators = document.querySelectorAll("[data-step-indicator]");
    const nextButtons = document.querySelectorAll(".pdm-next");
    const prevButtons = document.querySelectorAll(".pdm-prev");

    const methodInputs = document.querySelectorAll('input[name="metode"]');

    const panels = {
        satuan: document.getElementById("methodSatuan"),
        link: document.getElementById("methodLink"),
        zip: document.getElementById("methodZip")
    };

    const fileInputs = document.querySelectorAll("[data-file]");
    const archiveInput = document.getElementById("archiveFile");

    const progressText = document.getElementById("progressText");
    const progressFill = document.getElementById("progressFill");

    const selectedFiles = {};
    const MAX_FILE_SIZE = 1 * 1024 * 1024;

    let selectedArchive = null;
    let currentStep = 1;

    // =====================================
    // DATA DAN UTILITAS
    // =====================================

    function getActiveMethod() {
        return document.querySelector('input[name="metode"]:checked')?.value || "satuan";
    }

    function formatFileSize(bytes) {
        return (bytes / 1024).toFixed(1) + " KB";
    }

    function scrollToForm() {
        const offset = document.querySelector(".pdm-stepper").getBoundingClientRect().top
            + window.scrollY - 30;

        window.scrollTo({
            top: offset,
            behavior: "smooth"
        });
    }

    function showStatus(input, message, isError = false) {
        const item = input.closest(".document-item");
        const status = item.querySelector(".file-status");

        status.textContent = message;
        status.style.color = isError ? "#b91c1c" : "";

        item.classList.toggle(
            "is-uploaded",
            !isError && Boolean(selectedFiles[input.dataset.file])
        );
    }

    function updateProgress() {
        const completed = Object.keys(selectedFiles).length;
        const total = fileInputs.length;

        progressText.textContent = `${completed} dari ${total} dokumen`;
        progressFill.style.width = `${(completed / total) * 100}%`;
    }

    function switchMethod(method) {
        Object.entries(panels).forEach(([key, panel]) => {
            panel.hidden = key !== method;
        });

        document.querySelectorAll(".pdm-method-option").forEach(option => {
            const radio = option.querySelector("input");

            option.classList.toggle("active", radio.value === method);
        });
    }

    function getMethodLabel() {
        const labels = {
            satuan: "PDF Satuan",
            link: "Link Cloud",
            zip: "File Arsip"
        };

        return labels[getActiveMethod()];
    }

    // =====================================
    // NAVIGASI TAHAP
    // =====================================

    function showStep(stepNumber) {
        currentStep = stepNumber;

        steps.forEach(step => {
            step.hidden = Number(step.dataset.step) !== stepNumber;
        });

        indicators.forEach(indicator => {
            const number = Number(indicator.dataset.stepIndicator);

            indicator.classList.toggle("active", number === stepNumber);
            indicator.classList.toggle("completed", number < stepNumber);

            if (number === stepNumber) {
                indicator.setAttribute("aria-current", "step");
            } else {
                indicator.removeAttribute("aria-current");
            }
        });

        scrollToForm();
    }

    // =====================================
    // VALIDASI IDENTITAS
    // =====================================

    function validateIdentity() {
        const namaInput = document.getElementById("nama");
        const nimInput = document.getElementById("nim");

        const nama = namaInput.value.trim();
        const nim = nimInput.value.trim();

        if (!nama || !nim) {
            alert("Nama lengkap dan NIM wajib diisi.");

            const target = !nama ? namaInput : nimInput;
            target.focus();

            return false;
        }

        if (!/^[\p{L}\s.'-]+$/u.test(nama)) {
            alert("Nama mengandung karakter yang tidak diperbolehkan.");
            namaInput.focus();

            return false;
        }

        if (!/^[a-zA-Z0-9./-]+$/.test(nim)) {
            alert("Format NIM tidak valid.");
            nimInput.focus();

            return false;
        }

        return true;
    }

    // =====================================
    // VALIDASI METODE
    // =====================================

    function validateMethod() {
        const method = getActiveMethod();

        if (!panels[method]) {
            alert("Silakan pilih metode pengiriman dokumen.");
            return false;
        }

        return true;
    }

    // =====================================
    // VALIDASI DOKUMEN
    // =====================================

    function validateDocuments() {
        const method = getActiveMethod();

        if (method === "satuan") {
            const completed = Object.keys(selectedFiles).length;

            if (completed !== fileInputs.length) {
                alert("Silakan lengkapi seluruh tujuh dokumen PDF.");

                const firstMissing = Array.from(fileInputs).find(
                    input => !selectedFiles[input.dataset.file]
                );

                if (firstMissing) {
                    firstMissing.closest(".document-item").scrollIntoView({
                        behavior: "smooth",
                        block: "center"
                    });
                }

                return false;
            }
        }

        if (method === "link") {
            const linkInput = document.getElementById("cloudLink");
            const link = linkInput.value.trim();

            if (!link) {
                alert("Silakan masukkan tautan penyimpanan dokumen.");
                linkInput.focus();

                return false;
            }

            try {
                const url = new URL(link);

                if (!["http:", "https:"].includes(url.protocol)) {
                    throw new Error("Protokol tidak valid");
                }
            } catch {
                alert("Format tautan tidak valid.");
                linkInput.focus();

                return false;
            }
        }

        if (method === "zip" && !selectedArchive) {
            alert("Silakan pilih file arsip terlebih dahulu.");

            archiveInput.focus();
            return false;
        }

        return true;
    }

    // =====================================
    // RINGKASAN PENGAJUAN
    // =====================================

    function updateReview() {
        const method = getActiveMethod();

        let documentSummary = "-";

        if (method === "satuan") {
            documentSummary = `${Object.keys(selectedFiles).length} dari ${fileInputs.length} dokumen PDF`;
        }

        if (method === "link") {
            documentSummary = "Tautan penyimpanan dokumen";
        }

        if (method === "zip") {
            documentSummary = selectedArchive
                ? selectedArchive.name
                : "Belum dipilih";
        }

        document.getElementById("reviewNama").textContent =
            document.getElementById("nama").value.trim();

        document.getElementById("reviewNim").textContent =
            document.getElementById("nim").value.trim();

        document.getElementById("reviewMetode").textContent =
            getMethodLabel();

        document.getElementById("reviewDokumen").textContent =
            documentSummary;
    }

    // =====================================
    // TOMBOL LANJUTKAN
    // =====================================

    nextButtons.forEach(button => {
        button.addEventListener("click", () => {
            const nextStep = Number(button.dataset.next);

            if (currentStep === 1 && !validateIdentity()) {
                return;
            }

            if (currentStep === 2 && !validateMethod()) {
                return;
            }

            if (currentStep === 3 && !validateDocuments()) {
                return;
            }

            if (nextStep === 4) {
                updateReview();
            }

            showStep(nextStep);
        });
    });

    // =====================================
    // TOMBOL KEMBALI
    // =====================================

    prevButtons.forEach(button => {
        button.addEventListener("click", () => {
            const previousStep = Number(button.dataset.prev);

            showStep(previousStep);
        });
    });

    // =====================================
    // PILIH METODE PENGIRIMAN
    // =====================================

    methodInputs.forEach(input => {
        input.addEventListener("change", () => {
            switchMethod(input.value);
        });
    });

    // =====================================
    // VALIDASI PDF SATUAN
    // =====================================

    fileInputs.forEach(input => {
        input.addEventListener("change", () => {
            const file = input.files[0];
            const key = input.dataset.file;

            if (!file) {
                delete selectedFiles[key];

                showStatus(input, "Belum dipilih");
                updateProgress();

                return;
            }

            if (!file.name.toLowerCase().endsWith(".pdf")) {
                delete selectedFiles[key];
                input.value = "";

                showStatus(input, "Format harus PDF", true);
                updateProgress();

                return;
            }

            if (file.type && file.type !== "application/pdf") {
                delete selectedFiles[key];
                input.value = "";

                showStatus(input, "Tipe file tidak valid", true);
                updateProgress();

                return;
            }

            if (file.size === 0 || file.size > MAX_FILE_SIZE) {
                delete selectedFiles[key];
                input.value = "";

                showStatus(
                    input,
                    file.size === 0
                        ? "File kosong tidak dapat digunakan"
                        : "Ukuran file melebihi 1 MB",
                    true
                );

                updateProgress();

                return;
            }

            selectedFiles[key] = file;

            showStatus(
                input,
                `${file.name} (${formatFileSize(file.size)})`
            );

            updateProgress();
        });
    });

    // =====================================
    // VALIDASI FILE ARSIP
    // =====================================

    archiveInput.addEventListener("change", () => {
        const file = archiveInput.files[0];
        const status = document.getElementById("archiveStatus");

        selectedArchive = null;

        if (!file) {
            status.textContent = "Belum dipilih";
            status.style.color = "";

            return;
        }

        const validExtension = /\.(zip|rar|7z)$/i.test(file.name);

        if (!validExtension) {
            archiveInput.value = "";

            status.textContent = "Format harus ZIP, RAR, atau 7Z";
            status.style.color = "#b91c1c";

            return;
        }

        if (file.size === 0 || file.size > MAX_FILE_SIZE) {
            archiveInput.value = "";

            status.textContent = file.size === 0
                ? "File kosong tidak dapat digunakan"
                : "Ukuran file melebihi 1 MB";

            status.style.color = "#b91c1c";

            return;
        }

        selectedArchive = file;

        status.textContent = `${file.name} (${formatFileSize(file.size)})`;
        status.style.color = "#15803d";
    });

    // =====================================
    // KODE TRACKING SIMULASI
    // =====================================

    function generateTrackingCode() {
        const randomPart = Math.random()
            .toString(36)
            .substring(2, 8)
            .toUpperCase();

        return `PDM-${new Date().getFullYear()}-${randomPart}`;
    }

    // =====================================
    // SUBMIT PENGAJUAN
    // =====================================

    form.addEventListener("submit", event => {
        event.preventDefault();

        if (currentStep !== 4) {
            return;
        }

        if (!validateIdentity() || !validateMethod() || !validateDocuments()) {
            return;
        }

        const confirmation = document.getElementById("confirmation").checked;

        if (!confirmation) {
            alert("Silakan centang pernyataan sebelum melanjutkan.");

            document.getElementById("confirmation").focus();

            return;
        }

        const nama = document.getElementById("nama").value.trim();
        const nim = document.getElementById("nim").value.trim();
        const method = getActiveMethod();

        // =====================================
        // SIMPAN DATA PENGAJUAN (SIMULASI)
        // =====================================

        let submissions = {};

        try {
            submissions = JSON.parse(
                localStorage.getItem("pdmSubmissions") || "{}"
            );

            if (
                !submissions ||
                typeof submissions !== "object" ||
                Array.isArray(submissions)
            ) {
                submissions = {};
            }
        } catch (error) {
            alert("Data penyimpanan browser tidak dapat dibaca. Silakan periksa browser Anda.");
            console.error("Gagal membaca data PDM:", error);
            return;
        }

        let trackingCode;

        do {
            trackingCode = generateTrackingCode();
        } while (submissions[trackingCode]);

        const submissionDate = new Date();

        const tanggal = submissionDate.toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "long",
            year: "numeric"
        });

        let documentSummary = [];

        if (method === "satuan") {
            documentSummary = Object.entries(selectedFiles).map(
                ([key, file]) => ({
                    jenis: key,
                    nama: file?.name || key
                })
            );
        } else if (method === "zip") {
            documentSummary = [{
                jenis: "arsip",
                nama: selectedArchive?.name || "File arsip"
            }];
        } else {
            documentSummary = [{
                jenis: "link",
                nama: "Tautan Cloud diberikan"
            }];
        }

        const submissionData = {
            nama,
            nim,
            tanggal,
            createdAt: submissionDate.toISOString(),
            metode: method,
            dokumen: documentSummary,
            status: "Menunggu Pemeriksaan",
            description: "Pengajuan Anda telah diterima dalam simulasi dan sedang menunggu pemeriksaan.",
            revision: "",
            history: [
                {
                    title: "Pengajuan Dibuat",
                    description: "Mahasiswa menyelesaikan pengisian formulir dan dokumen.",
                    date: tanggal
                },
                {
                    title: "Menunggu Pemeriksaan",
                    description: "Pengajuan masuk ke antrean pemeriksaan admin.",
                    date: tanggal
                }
            ]
        };

        try {
            submissions[trackingCode] = submissionData;

            localStorage.setItem(
                "pdmSubmissions",
                JSON.stringify(submissions)
            );
        } catch (error) {
            alert("Pengajuan simulasi gagal disimpan di browser. Silakan coba kembali.");
            console.error("Gagal menyimpan data PDM:", error);
            return;
        }

        document.getElementById("trackingCode").textContent = trackingCode;

        form.hidden = true;
        resultSection.hidden = false;

        console.log("Simulasi PDM:", {
            nama,
            nim,
            metode: method,
            dokumen: method === "satuan"
                ? Object.keys(selectedFiles)
                : method === "zip"
                    ? selectedArchive.name
                    : "Link Cloud",
            trackingCode
        });

        window.scrollTo({
            top: resultSection.offsetTop - 30,
            behavior: "smooth"
        });
    });

    // =====================================
    // SALIN KODE SIMULASI
    // =====================================

    document.getElementById("copyTracking").addEventListener("click", async () => {
        const code = document.getElementById("trackingCode").textContent;

        try {
            await navigator.clipboard.writeText(code);
            alert("Kode simulasi berhasil disalin.");
        } catch {
            alert("Silakan salin kode secara manual: " + code);
        }
    });

    // =====================================
    // RESET FORMULIR
    // =====================================

    document.getElementById("resetForm").addEventListener("click", () => {
        form.reset();

        Object.keys(selectedFiles).forEach(key => {
            delete selectedFiles[key];
        });

        selectedArchive = null;

        fileInputs.forEach(input => {
            input.value = "";
            showStatus(input, "Belum dipilih");
        });

        document.getElementById("archiveStatus").textContent = "Belum dipilih";
        document.getElementById("archiveStatus").style.color = "";

        document.getElementById("cloudLink").value = "";

        updateProgress();
        switchMethod("satuan");

        resultSection.hidden = true;
        form.hidden = false;

        showStep(1);
    });

    // =====================================
    // INISIALISASI
    // =====================================

    updateProgress();
    switchMethod("satuan");
    showStep(1);
});
