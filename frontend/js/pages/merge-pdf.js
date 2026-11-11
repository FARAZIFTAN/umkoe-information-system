document.addEventListener("DOMContentLoaded", () => {
    const pdfInput = document.getElementById("pdfInput");
    const uploadArea = document.getElementById("uploadArea");
    const fileList = document.getElementById("fileList");
    const fileCount = document.getElementById("fileCount");
    const clearFilesButton = document.getElementById("clearFiles");
    const mergeButton = document.getElementById("mergeButton");
    const statusMessage = document.getElementById("statusMessage");
    const summaryText = document.getElementById("summaryText");
    const totalSize = document.getElementById("totalSize");
    const resultPanel = document.getElementById("resultPanel");
    const resultDescription = document.getElementById("resultDescription");
    const downloadButton = document.getElementById("downloadButton");
    const resetButton = document.getElementById("resetButton");
    const currentYear = document.getElementById("currentYear");

    const MAX_FILES = 20;
    const MAX_FILE_SIZE = 25 * 1024 * 1024;
    const MAX_TOTAL_SIZE = 100 * 1024 * 1024;

    let selectedFiles = [];
    let mergedBlob = null;
    let mergedUrl = null;
    let isProcessing = false;

    if (currentYear) {
        currentYear.textContent = new Date().getFullYear();
    }

    function formatSize(bytes) {
        if (bytes < 1024 * 1024) {
            return `${(bytes / 1024).toFixed(1)} KB`;
        }

        return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    }

    function updateStatus(message, type = "") {
        statusMessage.textContent = message;
        statusMessage.className = "status-message";

        if (type) {
            statusMessage.classList.add(type);
        }
    }

    function getTotalSize() {
        return selectedFiles.reduce((total, item) => {
            return total + item.file.size;
        }, 0);
    }

    function releaseMergedUrl() {
        if (mergedUrl) {
            URL.revokeObjectURL(mergedUrl);
            mergedUrl = null;
        }

        mergedBlob = null;
    }

    function hideResult() {
        releaseMergedUrl();
        resultPanel.hidden = true;
    }

    async function isPdfFile(file) {
        if (
            file.type !== "application/pdf" &&
            !file.name.toLowerCase().endsWith(".pdf")
        ) {
            return false;
        }

        try {
            const header = await file.slice(0, 5).text();
            return header === "%PDF-";
        } catch {
            return false;
        }
    }

    async function addFiles(fileCollection) {
        if (isProcessing) return;

        const incomingFiles = Array.from(fileCollection);

        if (incomingFiles.length === 0) return;

        hideResult();

        let addedCount = 0;
        const errors = [];

        for (const file of incomingFiles) {
            if (selectedFiles.length >= MAX_FILES) {
                errors.push(`Maksimal ${MAX_FILES} file PDF.`);
                break;
            }

            if (file.size === 0) {
                errors.push(`${file.name}: file kosong.`);
                continue;
            }

            if (file.size > MAX_FILE_SIZE) {
                errors.push(`${file.name}: ukuran melebihi 25 MB.`);
                continue;
            }

            if (getTotalSize() + file.size > MAX_TOTAL_SIZE) {
                errors.push("Total ukuran file tidak boleh melebihi 100 MB.");
                break;
            }

            const alreadySelected = selectedFiles.some((item) => {
                return (
                    item.file.name === file.name &&
                    item.file.size === file.size &&
                    item.file.lastModified === file.lastModified
                );
            });

            if (alreadySelected) {
                errors.push(`${file.name}: file sudah dipilih.`);
                continue;
            }

            const validPdf = await isPdfFile(file);

            if (!validPdf) {
                errors.push(`${file.name}: bukan file PDF yang valid.`);
                continue;
            }

            selectedFiles.push({
                id: crypto.randomUUID
                    ? crypto.randomUUID()
                    : `${Date.now()}-${Math.random()}`,
                file
            });

            addedCount++;
        }

        renderFileList();

        if (errors.length > 0) {
            const displayedErrors = errors.slice(0, 3).join(" ");
            const remaining = errors.length > 3
                ? ` Dan ${errors.length - 3} masalah lainnya.`
                : "";

            updateStatus(
                `${addedCount} file ditambahkan. ${displayedErrors}${remaining}`,
                "error"
            );
        } else if (addedCount > 0) {
            updateStatus(`${addedCount} file berhasil ditambahkan.`, "success");
        }
    }

    function renderFileList() {
        fileList.replaceChildren();

        if (selectedFiles.length === 0) {
            const empty = document.createElement("div");
            empty.className = "empty-files";

            const icon = document.createElement("i");
            icon.className = "fa-regular fa-file-pdf";

            const title = document.createElement("strong");
            title.textContent = "Belum ada dokumen";

            const description = document.createElement("span");
            description.textContent = "File yang kamu pilih akan muncul di sini.";

            empty.append(icon, title, description);
            fileList.appendChild(empty);
        } else {
            selectedFiles.forEach((item, index) => {
                const row = document.createElement("div");
                row.className = "file-item";

                const number = document.createElement("span");
                number.className = "file-number";
                number.textContent = index + 1;

                const icon = document.createElement("i");
                icon.className = "fa-solid fa-file-pdf file-type-icon";

                const details = document.createElement("div");
                details.className = "file-details";

                const name = document.createElement("div");
                name.className = "file-name";
                name.textContent = item.file.name;
                name.title = item.file.name;

                const size = document.createElement("div");
                size.className = "file-size";
                size.textContent = formatSize(item.file.size);

                details.append(name, size);

                const actions = document.createElement("div");
                actions.className = "file-actions";

                const upButton = createActionButton(
                    "fa-solid fa-chevron-up",
                    "Pindahkan ke atas",
                    () => moveFile(index, -1)
                );

                upButton.disabled = index === 0;

                const downButton = createActionButton(
                    "fa-solid fa-chevron-down",
                    "Pindahkan ke bawah",
                    () => moveFile(index, 1)
                );

                downButton.disabled = index === selectedFiles.length - 1;

                const removeButton = createActionButton(
                    "fa-solid fa-xmark",
                    "Hapus file",
                    () => removeFile(item.id)
                );

                removeButton.classList.add("remove-file");

                actions.append(upButton, downButton, removeButton);
                row.append(number, icon, details, actions);
                fileList.appendChild(row);
            });
        }

        const count = selectedFiles.length;
        const size = getTotalSize();

        fileCount.textContent = `${count} file`;
        summaryText.textContent = count === 0
            ? "Belum ada file yang dipilih."
            : `${count} dokumen siap diproses.`;

        totalSize.textContent = formatSize(size);
        mergeButton.disabled = count < 2 || isProcessing;
        clearFilesButton.disabled = count === 0 || isProcessing;
    }

    function createActionButton(iconClass, label, callback) {
        const button = document.createElement("button");
        button.type = "button";
        button.setAttribute("aria-label", label);
        button.title = label;

        const icon = document.createElement("i");
        icon.className = iconClass;

        button.appendChild(icon);
        button.addEventListener("click", callback);

        return button;
    }

    function moveFile(index, direction) {
        const targetIndex = index + direction;

        if (
            targetIndex < 0 ||
            targetIndex >= selectedFiles.length ||
            isProcessing
        ) {
            return;
        }

        [
            selectedFiles[index],
            selectedFiles[targetIndex]
        ] = [
            selectedFiles[targetIndex],
            selectedFiles[index]
        ];

        renderFileList();
        hideResult();
        updateStatus("Urutan dokumen berhasil diperbarui.");
    }

    function removeFile(id) {
        if (isProcessing) return;

        selectedFiles = selectedFiles.filter((item) => item.id !== id);

        renderFileList();
        hideResult();
        updateStatus("Dokumen berhasil dihapus dari daftar.");
    }

    function clearFiles() {
        if (isProcessing) return;

        selectedFiles = [];
        pdfInput.value = "";

        renderFileList();
        hideResult();

        updateStatus("Semua dokumen telah dihapus.");
    }

    async function mergePdfs() {
        if (isProcessing || selectedFiles.length < 2) {
            return;
        }

        if (!window.PDFLib) {
            updateStatus(
                "Library PDF tidak berhasil dimuat. Periksa koneksi internet lalu muat ulang halaman.",
                "error"
            );
            return;
        }

        isProcessing = true;
        mergeButton.disabled = true;
        clearFilesButton.disabled = true;

        mergeButton.innerHTML =
            '<i class="fa-solid fa-spinner fa-spin"></i> Sedang menggabungkan...';

        updateStatus("Sedang membaca dan menggabungkan dokumen PDF...");

        try {
            const { PDFDocument } = window.PDFLib;
            const mergedPdf = await PDFDocument.create();

            for (let index = 0; index < selectedFiles.length; index++) {
                const item = selectedFiles[index];

                updateStatus(
                    `Memproses dokumen ${index + 1} dari ${selectedFiles.length}: ${item.file.name}`
                );

                const arrayBuffer = await item.file.arrayBuffer();

                const sourcePdf = await PDFDocument.load(arrayBuffer, {
                    ignoreEncryption: false
                });

                const copiedPages = await mergedPdf.copyPages(
                    sourcePdf,
                    sourcePdf.getPageIndices()
                );

                copiedPages.forEach((page) => {
                    mergedPdf.addPage(page);
                });
            }

            updateStatus("Menyimpan dokumen hasil gabungan...");

            const pdfBytes = await mergedPdf.save();

            mergedBlob = new Blob([pdfBytes], {
                type: "application/pdf"
            });

            mergedUrl = URL.createObjectURL(mergedBlob);

            resultDescription.textContent =
                `${selectedFiles.length} file berhasil digabungkan. Ukuran hasil: ${formatSize(mergedBlob.size)}.`;

            resultPanel.hidden = false;

            updateStatus("PDF berhasil digabungkan. Silakan unduh hasilnya.", "success");

            resultPanel.scrollIntoView({
                behavior: "smooth",
                block: "center"
            });
        } catch (error) {
            console.error("Merge PDF error:", error);

            let message = "Gagal menggabungkan PDF. Pastikan semua file dapat dibaca.";

            if (
                error &&
                /password|encrypt/i.test(error.message || "")
            ) {
                message =
                    "Salah satu PDF dilindungi kata sandi atau enkripsi dan tidak dapat diproses.";
            } else if (
                error &&
                /invalid|header|pdf/i.test(error.message || "")
            ) {
                message =
                    "Ada dokumen PDF yang rusak atau formatnya tidak dapat dibaca.";
            }

            updateStatus(message, "error");
        } finally {
            isProcessing = false;

            mergeButton.innerHTML =
                '<i class="fa-solid fa-layer-group"></i> Gabungkan PDF';

            renderFileList();
        }
    }

    function downloadMergedPdf() {
        if (!mergedUrl || !mergedBlob) return;

        const link = document.createElement("a");
        link.href = mergedUrl;
        link.download = "dokumen-gabungan.pdf";

        document.body.appendChild(link);
        link.click();
        link.remove();
    }

    function resetWorkspace() {
        if (isProcessing) return;

        selectedFiles = [];
        pdfInput.value = "";

        hideResult();
        renderFileList();

        updateStatus("Pilih minimal dua file PDF untuk melanjutkan.");

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    }

    pdfInput.addEventListener("change", async (event) => {
        await addFiles(event.target.files);
        pdfInput.value = "";
    });

    uploadArea.addEventListener("dragover", (event) => {
        event.preventDefault();
        uploadArea.classList.add("drag-over");
    });

    uploadArea.addEventListener("dragleave", (event) => {
        if (!uploadArea.contains(event.relatedTarget)) {
            uploadArea.classList.remove("drag-over");
        }
    });

    uploadArea.addEventListener("drop", async (event) => {
        event.preventDefault();
        uploadArea.classList.remove("drag-over");

        await addFiles(event.dataTransfer.files);
    });

    clearFilesButton.addEventListener("click", clearFiles);
    mergeButton.addEventListener("click", mergePdfs);
    downloadButton.addEventListener("click", downloadMergedPdf);
    resetButton.addEventListener("click", resetWorkspace);

    window.addEventListener("beforeunload", releaseMergedUrl);

    renderFileList();
});
