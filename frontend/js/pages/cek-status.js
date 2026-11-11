document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("statusForm");
    const input = document.getElementById("trackingInput");
    const result = document.getElementById("statusResult");
    const error = document.getElementById("searchError");

    /*
     * DATA PENGAJUAN
     * Dibaca dari localStorage yang digunakan halaman PDM.
     * Penyimpanan ini masih berupa simulasi frontend.
     */
    let demoSubmissions = {};

    try {
        const savedData = localStorage.getItem("pdmSubmissions");

        if (savedData) {
            const parsedData = JSON.parse(savedData);

            if (
                parsedData &&
                typeof parsedData === "object" &&
                !Array.isArray(parsedData)
            ) {
                demoSubmissions = parsedData;
            }
        }
    } catch (error) {
        console.error("Gagal membaca data pengajuan PDM:", error);
    }

    function showError(message) {
        error.textContent = message;
        error.hidden = false;
        result.hidden = true;
    }

    function getStatusClass(status) {
        switch (status) {
            case "Sedang Diperiksa":
            case "Menunggu Pemeriksaan":
                return "is-review";

            case "Perlu Perbaikan":
                return "is-revision";

            case "Disetujui":
                return "is-approved";

            case "Ditolak":
                return "is-rejected";

            default:
                return "";
        }
    }

    function renderHistory(history) {
        const timeline = document.getElementById("statusTimeline");
        timeline.replaceChildren();

        history.forEach((item, index) => {
            const row = document.createElement("div");
            row.className = "timeline-item";

            const marker = document.createElement("span");
            marker.className = "timeline-marker";
            marker.textContent = index + 1;

            const content = document.createElement("div");

            const title = document.createElement("strong");
            title.textContent = item.title;

            const description = document.createElement("p");
            description.textContent = item.description;

            const date = document.createElement("time");
            date.textContent = item.date;

            content.append(title, description, date);
            row.append(marker, content);
            timeline.appendChild(row);
        });
    }

    function renderResult(code, data) {
        document.getElementById("resultName").textContent = data.nama;
        document.getElementById("resultNim").textContent = data.nim;
        document.getElementById("resultCode").textContent = code;
        document.getElementById("resultDate").textContent = data.tanggal;

        const badge = document.getElementById("statusBadge");
        badge.textContent = data.status;
        badge.className = `status-badge ${getStatusClass(data.status)}`;

        document.getElementById("statusDescription").textContent =
            data.description;

        const revisionNotice = document.getElementById("revisionNotice");

        if (data.revision) {
            document.getElementById("revisionMessage").textContent = data.revision;
            revisionNotice.hidden = false;
        } else {
            revisionNotice.hidden = true;
        }

        renderHistory(data.history);

        error.hidden = true;
        result.hidden = false;

        result.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    }

    form.addEventListener("submit", (event) => {
        event.preventDefault();

        const code = input.value.trim().toUpperCase();

        if (!code) {
            showError("Masukkan kode pelacakan terlebih dahulu.");
            return;
        }

        const submission = demoSubmissions[code];

        if (!submission) {
            showError("Kode pelacakan tidak ditemukan. Periksa kembali kode yang Anda masukkan.");
            return;
        }

        renderResult(code, submission);
    });

    input.addEventListener("input", () => {
        error.hidden = true;
    });
});
