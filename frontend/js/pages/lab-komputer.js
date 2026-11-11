
"use strict";

/* =========================
   DATA LABORATORIUM DEMO
========================= */

const laboratoryData = [
    {
        name: "Laboratorium Komputer 1",
        code: "LAB-001",
        location: "Gedung Laboratorium",
        status: "tersedia",
        computers: 30,
        capacity: 30,
        description:
            "Contoh informasi laboratorium untuk kegiatan praktikum dan pembelajaran berbasis komputer.",
        facilities: [
            "Komputer",
            "Meja dan Kursi",
            "Proyektor",
            "Jaringan Internet",
            "Pendingin Ruangan"
        ]
    },
    {
        name: "Laboratorium Komputer 2",
        code: "LAB-002",
        location: "Gedung Laboratorium",
        status: "tersedia",
        computers: 25,
        capacity: 25,
        description:
            "Contoh informasi fasilitas laboratorium untuk kegiatan praktik dan pembelajaran mahasiswa.",
        facilities: [
            "Komputer",
            "Meja dan Kursi",
            "Proyektor",
            "Jaringan Internet"
        ]
    },
    {
        name: "Laboratorium Multimedia",
        code: "LAB-003",
        location: "Gedung Laboratorium",
        status: "belum",
        computers: 0,
        capacity: 0,
        description:
            "Informasi fasilitas laboratorium ini belum tersedia dan perlu dikonfirmasi kepada pengelola.",
        facilities: []
    },
    {
        name: "Laboratorium Jaringan",
        code: "LAB-004",
        location: "Gedung Laboratorium",
        status: "belum",
        computers: 0,
        capacity: 0,
        description:
            "Informasi perangkat dan fasilitas laboratorium jaringan belum tersedia.",
        facilities: []
    }
];

/* =========================
   DATA JADWAL DEMO
========================= */

const scheduleData = [
    {
        day: "Senin",
        time: "08.00 - 10.00",
        lab: "Laboratorium Komputer 1",
        activity: "Praktikum Komputer",
        status: "Contoh jadwal"
    },
    {
        day: "Selasa",
        time: "10.00 - 12.00",
        lab: "Laboratorium Komputer 2",
        activity: "Praktikum Pemrograman",
        status: "Contoh jadwal"
    },
    {
        day: "Rabu",
        time: "13.00 - 15.00",
        lab: "Laboratorium Komputer 1",
        activity: "Praktikum Jaringan",
        status: "Contoh jadwal"
    },
    {
        day: "Kamis",
        time: "08.00 - 10.00",
        lab: "Laboratorium Komputer 2",
        activity: "Praktikum Aplikasi",
        status: "Contoh jadwal"
    }
];

/* =========================
   ELEMENT HTML
========================= */

const elements = {
    totalLabs: document.getElementById("totalLabs"),
    totalComputers: document.getElementById("totalComputers"),
    availableLabs: document.getElementById("availableLabs"),
    totalSchedules: document.getElementById("totalSchedules"),

    search: document.getElementById("searchLab"),
    filter: document.getElementById("labFilter"),

    grid: document.getElementById("laboratoryGrid"),
    emptyState: document.getElementById("emptyState"),

    scheduleBody: document.getElementById("scheduleTableBody"),
    currentYear: document.getElementById("currentYear")
};

/* =========================
   HELPER
========================= */

function createElement(tag, className = "", text = "") {
    const element = document.createElement(tag);

    if (className) {
        element.className = className;
    }

    element.textContent = text;

    return element;
}

/* =========================
   RINGKASAN
========================= */

function updateSummary() {
    const totalLabs = laboratoryData.length;

    const totalComputers = laboratoryData.reduce(
        (sum, lab) => sum + lab.computers,
        0
    );

    const availableLabs = laboratoryData.filter(
        lab => lab.status === "tersedia"
    ).length;

    elements.totalLabs.textContent = totalLabs;
    elements.totalComputers.textContent = totalComputers;
    elements.availableLabs.textContent = availableLabs;
    elements.totalSchedules.textContent = scheduleData.length;
}

/* =========================
   MEMBUAT KARTU LAB
========================= */

function createLabCard(lab) {
    const card = createElement("article", "lab-card");

    // Header kartu
    const top = createElement("div", "lab-card-top");

    const title = createElement("div", "lab-title");

    const icon = createElement("div", "lab-icon");
    const iconElement = document.createElement("i");

    iconElement.className = "fa-solid fa-desktop";
    icon.appendChild(iconElement);

    const titleText = document.createElement("div");

    titleText.append(
        createElement("h3", "", lab.name),
        createElement("p", "", lab.code)
    );

    title.append(icon, titleText);

    const status = createElement(
        "span",
        lab.status === "tersedia"
            ? "lab-status available"
            : "lab-status pending",
        lab.status === "tersedia"
            ? "Informasi tersedia"
            : "Belum tersedia"
    );

    top.append(title, status);

    // Deskripsi
    const description = createElement(
        "p",
        "lab-description",
        lab.description
    );

    // Detail fasilitas
    const details = createElement("div", "lab-details");

    const detailItems = [
        {
            icon: "fa-location-dot",
            label: "Lokasi",
            value: lab.location
        },
        {
            icon: "fa-desktop",
            label: "Jumlah Komputer",
            value: `${lab.computers} unit`
        },
        {
            icon: "fa-users",
            label: "Kapasitas",
            value: `${lab.capacity} orang`
        },
        {
            icon: "fa-circle-info",
            label: "Kode Laboratorium",
            value: lab.code
        }
    ];

    detailItems.forEach(item => {
        const detail = createElement("div", "lab-detail");

        const detailIcon = document.createElement("i");
        detailIcon.className = `fa-solid ${item.icon}`;

        const text = document.createElement("div");

        text.append(
            createElement("span", "", item.label),
            createElement("strong", "", item.value)
        );

        detail.append(detailIcon, text);
        details.appendChild(detail);
    });

    // Daftar fasilitas
    const facilities = createElement("div", "lab-facilities");

    facilities.appendChild(
        createElement("span", "", "Fasilitas Laboratorium")
    );

    const facilityList = createElement("div", "facility-list");

    if (lab.facilities.length > 0) {
        lab.facilities.forEach(facility => {
            facilityList.appendChild(
                createElement("span", "facility-tag", facility)
            );
        });
    } else {
        facilityList.appendChild(
            createElement(
                "span",
                "facility-unavailable",
                "Informasi fasilitas belum tersedia."
            )
        );
    }

    facilities.appendChild(facilityList);

    card.append(top, description, details, facilities);

    return card;
}

/* =========================
   MENAMPILKAN LAB
========================= */

function renderLaboratories(data) {
    elements.grid.replaceChildren();

    data.forEach(lab => {
        elements.grid.appendChild(createLabCard(lab));
    });

    elements.emptyState.hidden = data.length > 0;
}

/* =========================
   PENCARIAN DAN FILTER
========================= */

function filterLaboratories() {
    const keyword = elements.search.value
        .toLowerCase()
        .trim();

    const selectedStatus = elements.filter.value;

    const filteredData = laboratoryData.filter(lab => {
        const searchableText = [
            lab.name,
            lab.code,
            lab.location,
            lab.description,
            ...lab.facilities
        ].join(" ").toLowerCase();

        const matchesKeyword = searchableText.includes(keyword);

        const matchesStatus =
            selectedStatus === "semua" ||
            lab.status === selectedStatus;

        return matchesKeyword && matchesStatus;
    });

    renderLaboratories(filteredData);
}

/* =========================
   MENAMPILKAN JADWAL
========================= */

function renderSchedules() {
    elements.scheduleBody.replaceChildren();

    scheduleData.forEach(schedule => {
        const row = document.createElement("tr");

        const values = [
            schedule.day,
            schedule.time,
            schedule.lab,
            schedule.activity
        ];

        values.forEach(value => {
            row.appendChild(createElement("td", "", value));
        });

        const statusCell = document.createElement("td");

        statusCell.appendChild(
            createElement(
                "span",
                "schedule-status",
                schedule.status
            )
        );

        row.appendChild(statusCell);

        elements.scheduleBody.appendChild(row);
    });
}

/* =========================
   EVENT LISTENERS
========================= */

elements.search.addEventListener(
    "input",
    filterLaboratories
);

elements.filter.addEventListener(
    "change",
    filterLaboratories
);

/* =========================
   INISIALISASI
========================= */

function initializeLabPage() {
    elements.currentYear.textContent =
        new Date().getFullYear();

    updateSummary();
    renderLaboratories(laboratoryData);
    renderSchedules();
}

initializeLabPage();
