
"use strict";

/* =========================
   DATA JARINGAN DEMO
========================= */

const hotspotData = [
    {
        ssid: "UMKOE-STAFF",
        area: "Gedung Rektorat",
        status: "tersedia",
        clients: 24,
        uptime: "99.5%",
        upload: "45 Mbps",
        download: "80 Mbps",
        security: "WPA2"
    },
    {
        ssid: "UMKOE-STUDENT",
        area: "Area Perkuliahan",
        status: "tersedia",
        clients: 86,
        uptime: "98.8%",
        upload: "60 Mbps",
        download: "100 Mbps",
        security: "WPA2"
    },
    {
        ssid: "UMKOE-LAB",
        area: "Laboratorium Komputer",
        status: "gangguan",
        clients: 0,
        uptime: "Tidak tersedia",
        upload: "-",
        download: "-",
        security: "WPA2"
    },
    {
        ssid: "UMKOE-LIBRARY",
        area: "Perpustakaan",
        status: "tersedia",
        clients: 18,
        uptime: "99.1%",
        upload: "30 Mbps",
        download: "50 Mbps",
        security: "WPA2"
    },
    {
        ssid: "UMKOE-GUEST",
        area: "Area Umum Kampus",
        status: "tersedia",
        clients: 32,
        uptime: "97.9%",
        upload: "25 Mbps",
        download: "40 Mbps",
        security: "Captive Portal"
    }
];

/* =========================
   ELEMENT HTML
========================= */

const elements = {
    totalSSID: document.getElementById("totalSSID"),
    availableSSID: document.getElementById("availableSSID"),
    totalClients: document.getElementById("totalClients"),
    totalAreas: document.getElementById("totalAreas"),

    search: document.getElementById("searchSSID"),
    filter: document.getElementById("statusFilter"),

    tableBody: document.getElementById("networkTableBody"),
    tableCount: document.getElementById("tableCount"),
    emptyState: document.getElementById("emptyState"),

    currentYear: document.getElementById("currentYear")
};

/* =========================
   RINGKASAN JARINGAN
========================= */

function updateSummary() {
    const total = hotspotData.length;

    const available = hotspotData.filter(
        network => network.status === "tersedia"
    ).length;

    const totalClients = hotspotData.reduce(
        (total, network) => total + network.clients,
        0
    );

    const totalAreas = new Set(
        hotspotData.map(network => network.area)
    ).size;

    elements.totalSSID.textContent = total;
    elements.availableSSID.textContent = available;
    elements.totalClients.textContent = totalClients;
    elements.totalAreas.textContent = totalAreas;
}

/* =========================
   MEMBUAT ELEMEN HTML
========================= */

function createElement(tag, className, text = "") {
    const element = document.createElement(tag);

    if (className) {
        element.className = className;
    }

    element.textContent = text;

    return element;
}

/* =========================
   KOLOM NAMA JARINGAN
========================= */

function createSSIDCell(network) {
    const cell = document.createElement("td");

    const wrapper = createElement("div", "ssid-wrapper");

    const icon = createElement("span", "ssid-icon");
    const iconElement = document.createElement("i");

    iconElement.className = "fa-solid fa-wifi";

    icon.appendChild(iconElement);

    const details = createElement("div", "ssid-details");

    const name = createElement(
        "strong",
        "",
        network.ssid
    );

    const description = createElement(
        "small",
        "",
        "Jaringan WiFi"
    );

    details.append(name, description);
    wrapper.append(icon, details);
    cell.appendChild(wrapper);

    return cell;
}

/* =========================
   KOLOM STATUS
========================= */

function createStatusCell(network) {
    const cell = document.createElement("td");

    const available = network.status === "tersedia";

    const badge = createElement(
        "span",
        available
            ? "status-badge available"
            : "status-badge issue",
        available ? "Tersedia" : "Gangguan"
    );

    const icon = document.createElement("i");

    icon.className = available
        ? "fa-solid fa-circle-check"
        : "fa-solid fa-triangle-exclamation";

    badge.prepend(icon);
    cell.appendChild(badge);

    return cell;
}

/* =========================
   KOLOM BANDWIDTH
========================= */

function createBandwidthCell(network) {
    const cell = document.createElement("td");

    const wrapper = createElement("div", "bandwidth");

    const download = createElement(
        "strong",
        "",
        `↓ ${network.download}`
    );

    const upload = createElement(
        "small",
        "",
        `↑ ${network.upload}`
    );

    wrapper.append(download, upload);
    cell.appendChild(wrapper);

    return cell;
}

/* =========================
   MEMBUAT BARIS TABEL
========================= */

function createNetworkRow(network) {
    const row = document.createElement("tr");

    const area = createElement(
        "td",
        "",
        network.area
    );

    const clients = createElement(
        "td",
        "",
        `${network.clients} perangkat`
    );

    const uptime = createElement(
        "td",
        "",
        network.uptime
    );

    const security = createElement(
        "td",
        "",
        network.security
    );

    row.append(
        createSSIDCell(network),
        area,
        createStatusCell(network),
        clients,
        uptime,
        createBandwidthCell(network),
        security
    );

    return row;
}

/* =========================
   MENAMPILKAN DATA
========================= */

function renderNetworks(data) {
    elements.tableBody.replaceChildren();

    data.forEach(network => {
        elements.tableBody.appendChild(
            createNetworkRow(network)
        );
    });

    elements.tableCount.textContent =
        `${data.length} Jaringan`;

    elements.emptyState.hidden = data.length > 0;
}

/* =========================
   PENCARIAN DAN FILTER
========================= */

function filterNetworks() {
    const keyword = elements.search.value
        .toLowerCase()
        .trim();

    const selectedStatus = elements.filter.value;

    const filteredData = hotspotData.filter(network => {
        const matchesKeyword =
            network.ssid.toLowerCase().includes(keyword) ||
            network.area.toLowerCase().includes(keyword);

        const matchesStatus =
            selectedStatus === "semua" ||
            network.status === selectedStatus;

        return matchesKeyword && matchesStatus;
    });

    renderNetworks(filteredData);
}

/* =========================
   EVENT LISTENERS
========================= */

elements.search.addEventListener(
    "input",
    filterNetworks
);

elements.filter.addEventListener(
    "change",
    filterNetworks
);

/* =========================
   INISIALISASI
========================= */

function initializeHotspotPage() {
    elements.currentYear.textContent =
        new Date().getFullYear();

    updateSummary();
    renderNetworks(hotspotData);
}

initializeHotspotPage();
