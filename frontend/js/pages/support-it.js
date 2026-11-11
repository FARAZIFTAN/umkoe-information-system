"use strict";

/* =========================
   KONFIGURASI PENYIMPANAN
========================= */

const STORAGE_KEY = "pusdatin_support_tickets_v1";

/* =========================
   DATA KATEGORI
========================= */

const supportCategories = [
    {
        name: "Internet dan Jaringan",
        icon: "fa-wifi",
        description: "Kendala koneksi internet, WiFi kampus, dan jaringan komputer."
    },
    {
        name: "Akun dan Akses",
        icon: "fa-user-lock",
        description: "Masalah login, lupa password, dan akses akun layanan kampus."
    },
    {
        name: "Perangkat Komputer",
        icon: "fa-desktop",
        description: "Kerusakan komputer, printer, monitor, dan perangkat lainnya."
    },
    {
        name: "Aplikasi dan Sistem",
        icon: "fa-laptop-code",
        description: "Gangguan website, aplikasi akademik, dan sistem informasi."
    },
    {
        name: "Laboratorium",
        icon: "fa-computer",
        description: "Kendala perangkat dan fasilitas laboratorium komputer."
    },
    {
        name: "Lainnya",
        icon: "fa-circle-question",
        description: "Permasalahan teknologi informasi lainnya."
    }
];

/* =========================
   DATA FAQ
========================= */

const faqData = [
    {
        question: "Apa yang harus dilakukan jika tidak bisa terhubung ke WiFi kampus?",
        answer: "Pastikan WiFi perangkat aktif, pilih jaringan yang benar, kemudian periksa kembali koneksi. Jika masalah tetap terjadi, sampaikan kendala melalui formulir pengaduan."
    },
    {
        question: "Bagaimana jika saya lupa password akun kampus?",
        answer: "Gunakan prosedur pemulihan akun yang disediakan pengelola sistem. Jika belum berhasil, laporkan melalui kategori Akun dan Akses."
    },
    {
        question: "Apa yang harus dilakukan jika komputer laboratorium mengalami kerusakan?",
        answer: "Hentikan penggunaan perangkat apabila berpotensi menimbulkan kerusakan lebih lanjut. Catat identitas perangkat jika tersedia, kemudian laporkan kepada petugas."
    },
    {
        question: "Bagaimana cara melacak pengaduan?",
        answer: "Masukkan nomor tiket yang diperoleh setelah mengirim formulir ke kolom Lacak Pengaduan."
    },
    {
        question: "Apakah pengaduan langsung ditangani petugas?",
        answer: "Belum. Halaman ini masih berupa prototipe frontend dan belum terhubung dengan server maupun petugas Support IT."
    }
];

/* =========================
   ELEMENT HTML
========================= */

const elements = {
    totalTickets: document.getElementById("totalTickets"),
    pendingTickets: document.getElementById("pendingTickets"),
    completedTickets: document.getElementById("completedTickets"),
    totalCategories: document.getElementById("totalCategories"),

    categoryGrid: document.getElementById("categoryGrid"),

    form: document.getElementById("supportForm"),
    reporterName: document.getElementById("reporterName"),
    reporterId: document.getElementById("reporterId"),
    reporterEmail: document.getElementById("reporterEmail"),
    reporterPhone: document.getElementById("reporterPhone"),

    problemCategory: document.getElementById("problemCategory"),
    problemPriority: document.getElementById("problemPriority"),
    problemTitle: document.getElementById("problemTitle"),
    problemDescription: document.getElementById("problemDescription"),

    characterCount: document.getElementById("characterCount"),

    ticketTableBody: document.getElementById("ticketTableBody"),
    ticketEmpty: document.getElementById("ticketEmpty"),

    trackingForm: document.getElementById("ticketTrackingForm"),
    trackingTicketId: document.getElementById("trackingTicketId"),
    trackingResult: document.getElementById("trackingResult"),

    faqContainer: document.getElementById("faqContainer"),
    refreshTickets: document.getElementById("refreshTickets"),

    toast: document.getElementById("toast"),
    toastMessage: document.getElementById("toastMessage"),

    currentYear: document.getElementById("currentYear")
};

/* =========================
   DATA TIKET
========================= */

function loadTickets() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);

        if (!saved) return [];

        const parsed = JSON.parse(saved);

        return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
        console.error("Gagal membaca data tiket:", error);
        return [];
    }
}

let tickets = loadTickets();

function saveTickets() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(tickets));
        return true;
    } catch (error) {
        console.error("Gagal menyimpan tiket:", error);
        showToast("Tiket gagal disimpan. Periksa penyimpanan browser.");
        return false;
    }
}

/* =========================
   HELPER
========================= */

function createElement(tag, className = "", text = "") {
    const element = document.createElement(tag);

    if (className) element.className = className;

    element.textContent = text;

    return element;
}

function formatDate(value) {
    return new Intl.DateTimeFormat("id-ID", {
        dateStyle: "medium",
        timeStyle: "short"
    }).format(new Date(value));
}

function getCurrentDate() {
    return new Intl.DateTimeFormat("id-ID", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
    }).format(new Date());
}

function generateTicketId() {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    let randomPart;

    if (window.crypto && window.crypto.getRandomValues) {
        const values = new Uint32Array(1);
        window.crypto.getRandomValues(values);
        randomPart = values[0].toString(16).slice(0, 6).toUpperCase();
    } else {
        randomPart = Math.random().toString(16).slice(2, 8).toUpperCase();
    }

    const id = `PUS-${year}${month}${day}-${randomPart}`;

    return tickets.some(ticket => ticket.id === id)
        ? generateTicketId()
        : id;
}

/* =========================
   NOTIFIKASI
========================= */

let toastTimer;

function showToast(message) {
    elements.toastMessage.textContent = message;
    elements.toast.classList.add("show");

    clearTimeout(toastTimer);

    toastTimer = setTimeout(() => {
        elements.toast.classList.remove("show");
    }, 3500);
}

/* =========================
   RINGKASAN
========================= */

function updateSummary() {
    elements.totalTickets.textContent = tickets.length;

    elements.pendingTickets.textContent = tickets.filter(
        ticket => ticket.status === "Menunggu"
    ).length;

    elements.completedTickets.textContent = tickets.filter(
        ticket => ticket.status === "Selesai"
    ).length;

    elements.totalCategories.textContent = supportCategories.length;
}

/* =========================
   KATEGORI
========================= */

function renderCategories() {
    elements.categoryGrid.replaceChildren();

    supportCategories.forEach(category => {
        const card = createElement("article", "category-card");

        const icon = createElement("div", "category-icon");
        const iconElement = document.createElement("i");
        iconElement.className = `fa-solid ${category.icon}`;
        icon.appendChild(iconElement);

        const title = createElement("h3", "", category.name);
        const description = createElement("p", "", category.description);

        const button = createElement("button", "category-link", "Buat pengaduan");
        button.type = "button";

        const arrow = document.createElement("i");
        arrow.className = "fa-solid fa-arrow-right";
        button.appendChild(arrow);

        button.addEventListener("click", () => {
            elements.problemCategory.value = category.name;

            document.getElementById("form-pengaduan").scrollIntoView({
                behavior: "smooth"
            });

            elements.problemCategory.focus();
            showToast(`Kategori ${category.name} dipilih.`);
        });

        card.append(icon, title, description, button);
        elements.categoryGrid.appendChild(card);
    });
}

/* =========================
   TABEL RIWAYAT TIKET
========================= */

function renderTickets() {
    elements.ticketTableBody.replaceChildren();

    if (tickets.length === 0) {
        elements.ticketEmpty.hidden = false;
        return;
    }

    elements.ticketEmpty.hidden = true;

    tickets.forEach(ticket => {
        const row = document.createElement("tr");

        row.appendChild(createElement("td", "ticket-id", ticket.id));
        row.appendChild(createElement("td", "", ticket.title));
        row.appendChild(createElement("td", "", ticket.category));

        const priorityCell = document.createElement("td");
        priorityCell.appendChild(
            createElement(
                "span",
                `priority ${ticket.priority.toLowerCase()}`,
                ticket.priority
            )
        );
        row.appendChild(priorityCell);

        const statusCell = document.createElement("td");
        statusCell.appendChild(
            createElement(
                "span",
                `ticket-status ${ticket.status.toLowerCase()}`,
                ticket.status
            )
        );
        row.appendChild(statusCell);

        row.appendChild(
            createElement("td", "", getCurrentDateFromISO(ticket.createdAt))
        );

        elements.ticketTableBody.appendChild(row);
    });
}

function getCurrentDateFromISO(value) {
    return new Intl.DateTimeFormat("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    }).format(new Date(value));
}

/* =========================
   TRACKING TIKET
========================= */

function renderTracking(ticket) {
    elements.trackingResult.replaceChildren();
    elements.trackingResult.hidden = false;

    if (!ticket) {
        const message = createElement("div", "tracking-not-found");

        const icon = document.createElement("i");
        icon.className = "fa-solid fa-circle-exclamation";

        const content = document.createElement("div");
        content.append(
            createElement("h3", "", "Tiket tidak ditemukan"),
            createElement(
                "p",
                "",
                "Periksa kembali nomor tiket. Pastikan nomor yang dimasukkan sesuai dengan tiket yang dibuat pada browser ini."
            )
        );

        message.append(icon, content);
        elements.trackingResult.appendChild(message);
        return;
    }

    const header = createElement("div", "tracking-detail-header");

    const headingContent = document.createElement("div");
    headingContent.append(
        createElement("small", "", "DETAIL PENGADUAN"),
        createElement("h3", "", ticket.title),
        createElement("div", "tracking-detail-id", ticket.id)
    );

    const status = createElement(
        "span",
        `tracking-status ${ticket.status.toLowerCase()}`,
        ticket.status
    );

    header.append(headingContent, status);

    const metadata = createElement("div", "tracking-metadata");

    const fields = [
        ["Kategori", ticket.category],
        ["Prioritas", ticket.priority],
        ["Tanggal dibuat", formatDate(ticket.createdAt)]
    ];

    fields.forEach(([label, value]) => {
        const item = document.createElement("div");
        item.append(
            createElement("span", "", label),
            createElement("strong", "", value)
        );
        metadata.appendChild(item);
    });

    const history = createElement("div", "tracking-history");
    history.appendChild(createElement("h4", "", "Riwayat Penanganan"));

    const timeline = createElement("div", "tracking-timeline");

    (ticket.history || []).forEach(event => {
        const item = createElement("div", "tracking-event");

        item.append(
            createElement("strong", "", event.title),
            createElement("span", "", formatDate(event.date)),
            createElement("span", "", event.description)
        );

        timeline.appendChild(item);
    });

    history.appendChild(timeline);

    elements.trackingResult.append(header, metadata, history);
}

function handleTracking(event) {
    event.preventDefault();

    const id = elements.trackingTicketId.value.trim().toUpperCase();

    if (!id) {
        showToast("Masukkan nomor tiket terlebih dahulu.");
        return;
    }

    const ticket = tickets.find(
        item => item.id.toUpperCase() === id
    );

    renderTracking(ticket || null);
}

/* =========================
   FAQ
========================= */

function renderFAQ() {
    elements.faqContainer.replaceChildren();

    faqData.forEach((faq, index) => {
        const item = createElement("article", "faq-item");

        const question = createElement("button", "faq-question", faq.question);
        question.type = "button";
        question.setAttribute("aria-expanded", "false");
        question.setAttribute("aria-controls", `faq-answer-${index}`);

        const arrow = document.createElement("i");
        arrow.className = "fa-solid fa-chevron-down";
        question.appendChild(arrow);

        const answer = createElement("div", "faq-answer", faq.answer);
        answer.id = `faq-answer-${index}`;

        question.addEventListener("click", () => {
            const isActive = item.classList.contains("active");

            elements.faqContainer.querySelectorAll(".faq-item").forEach(faqItem => {
                faqItem.classList.remove("active");
                faqItem.querySelector(".faq-question").setAttribute(
                    "aria-expanded",
                    "false"
                );
            });

            if (!isActive) {
                item.classList.add("active");
                question.setAttribute("aria-expanded", "true");
            }
        });

        item.append(question, answer);
        elements.faqContainer.appendChild(item);
    });
}

/* =========================
   HITUNG KARAKTER
========================= */

function updateCharacterCount() {
    elements.characterCount.textContent =
        elements.problemDescription.value.length;
}

/* =========================
   VALIDASI FORM
========================= */

function validateForm() {
    const requiredFields = [
        elements.reporterName,
        elements.reporterId,
        elements.reporterEmail,
        elements.problemCategory,
        elements.problemPriority,
        elements.problemTitle,
        elements.problemDescription
    ];

    if (requiredFields.some(field => !field.value.trim())) {
        showToast("Mohon lengkapi seluruh data wajib.");
        return false;
    }

    if (elements.problemDescription.value.trim().length < 10) {
        showToast("Deskripsi kendala minimal 10 karakter.");
        elements.problemDescription.focus();
        return false;
    }

    if (!elements.form.checkValidity()) {
        elements.form.reportValidity();
        return false;
    }

    return true;
}

/* =========================
   KIRIM PENGADUAN
========================= */

function handleFormSubmit(event) {
    event.preventDefault();

    if (!validateForm()) return;

    const now = new Date().toISOString();

    const newTicket = {
        id: generateTicketId(),
        title: elements.problemTitle.value.trim(),
        category: elements.problemCategory.value,
        priority: elements.problemPriority.value,
        status: "Menunggu",
        createdAt: now,
        history: [
            {
                title: "Pengaduan berhasil dibuat",
                description: "Laporan tersimpan pada browser ini dan menunggu tindak lanjut.",
                date: now
            }
        ]
    };

    tickets.unshift(newTicket);

    if (!saveTickets()) {
        tickets.shift();
        return;
    }

    updateSummary();
    renderTickets();

    elements.form.reset();
    updateCharacterCount();

    elements.trackingTicketId.value = newTicket.id;
    renderTracking(newTicket);

    showToast(`Pengaduan berhasil dibuat. Nomor tiket: ${newTicket.id}`);

    document.getElementById("tracking-pengaduan").scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}

/* =========================
   REFRESH DATA
========================= */

function refreshTicketList() {
    tickets = loadTickets();

    updateSummary();
    renderTickets();

    showToast("Daftar pengaduan diperbarui.");
}

/* =========================
   EVENT LISTENERS
========================= */

elements.form.addEventListener("submit", handleFormSubmit);

elements.trackingForm.addEventListener("submit", handleTracking);

elements.refreshTickets.addEventListener("click", refreshTicketList);

elements.problemDescription.addEventListener(
    "input",
    updateCharacterCount
);

/* =========================
   SINKRONISASI ANTAR TAB
========================= */

window.addEventListener("storage", event => {
    if (event.key === STORAGE_KEY) {
        tickets = loadTickets();
        updateSummary();
        renderTickets();
    }
});

/* =========================
   INITIALIZATION
========================= */

function initializeSupportPage() {
    elements.currentYear.textContent = new Date().getFullYear();

    updateSummary();
    renderCategories();
    renderTickets();
    renderFAQ();
    updateCharacterCount();
}

initializeSupportPage();
