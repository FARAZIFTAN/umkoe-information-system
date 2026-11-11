const complaintForm = document.getElementById("complaintForm");
const evidenceInput = document.getElementById("bukti");
const fileNameDisplay = document.getElementById("fileName");
const formMessage = document.getElementById("formMessage");

const STORAGE_KEY = "pusdatin_helpdesk_tickets_v1";
const MAX_FILE_SIZE = 2 * 1024 * 1024;

evidenceInput.addEventListener("change", function () {
    const file = this.files[0];

    if (!file) {
        fileNameDisplay.textContent = "Belum ada file dipilih";
        return;
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
        this.value = "";
        fileNameDisplay.textContent = "Belum ada file dipilih";
        showMessage("Format file harus JPG, PNG, atau WEBP.", "error");
        return;
    }

    if (file.size > MAX_FILE_SIZE) {
        this.value = "";
        fileNameDisplay.textContent = "Belum ada file dipilih";
        showMessage("Ukuran gambar maksimal 2 MB.", "error");
        return;
    }

    fileNameDisplay.textContent = file.name;
    showMessage("", "");
});

complaintForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const nama = document.getElementById("nama").value.trim();
    const kontak = document.getElementById("kontak").value.trim();
    const kategori = document.getElementById("kategori").value;
    const judul = document.getElementById("judul").value.trim();
    const lokasi = document.getElementById("lokasi").value.trim();
    const deskripsi = document.getElementById("deskripsi").value.trim();
    const file = evidenceInput.files[0];

    if (!nama || !kontak || !kategori || !judul || !deskripsi) {
        showMessage("Mohon lengkapi semua kolom wajib.", "error");
        return;
    }

    if (file && file.size > MAX_FILE_SIZE) {
        showMessage("Ukuran gambar maksimal 2 MB.", "error");
        return;
    }

    const submitButton = document.getElementById("submitButton");
    submitButton.disabled = true;
    submitButton.textContent = "Memproses...";

    try {
        const tickets = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");

        const ticket = {
            id: generateTicketNumber(),
            nama,
            kontak,
            kategori,
            judul,
            lokasi,
            deskripsi,
            buktiNama: file ? file.name : "",
            status: "Menunggu",
            tanggal: new Date().toISOString(),
            riwayat: [
                {
                    status: "Menunggu",
                    keterangan: "Pengaduan berhasil dicatat pada perangkat ini.",
                    waktu: new Date().toISOString()
                }
            ]
        };

        tickets.push(ticket);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(tickets));

        showMessage(
            "Pengaduan berhasil dicatat pada prototipe ini. Nomor tiket: " + ticket.id,
            "success"
        );

        complaintForm.reset();
        fileNameDisplay.textContent = "Belum ada file dipilih";

        const trackingUrl = "tracking-pengaduan.html?ticket=" +
            encodeURIComponent(ticket.id);

        const trackingLink = document.createElement("a");
        trackingLink.href = trackingUrl;
        trackingLink.textContent = "Lacak pengaduan Anda";
        trackingLink.className = "tracking-result-link";

        formMessage.appendChild(document.createElement("br"));
        formMessage.appendChild(trackingLink);

    } catch (error) {
        showMessage("Terjadi kesalahan saat mencatat pengaduan.", "error");
    } finally {
        submitButton.disabled = false;
        submitButton.innerHTML = 'Kirim Pengaduan <span>→</span>';
    }
});

function generateTicketNumber() {
    const date = new Date();
    const dateCode =
        date.getFullYear().toString() +
        String(date.getMonth() + 1).padStart(2, "0") +
        String(date.getDate()).padStart(2, "0");

    const randomCode = Math.floor(10000 + Math.random() * 90000);

    return `PUS-${dateCode}-${randomCode}`;
}

function showMessage(message, type) {
    formMessage.textContent = message;
    formMessage.className = "form-message";

    if (type) {
        formMessage.classList.add(type);
    }
}
