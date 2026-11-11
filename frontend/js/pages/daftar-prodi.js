"use strict";

/*
 * DATA PROGRAM STUDI
 * Diambil dari daftar prodi.html versi lama.
 * Data belum diverifikasi sebagai data akademik terbaru.
 */

const totalProdiData = [
    { kode: "67201", nama: "Ilmu Politik", jenjang: "S1", semester: "2016/2017 Ganjil", no_sk: "4/KPT/I/2015", tgl_sk: "28/08/2015" },
    { kode: "86206", nama: "Pendidikan Guru Sekolah Dasar", jenjang: "S1", semester: "2016/2017 Ganjil", no_sk: "89/KPT/I/2015", tgl_sk: "18/11/2015" },
    { kode: "72201", nama: "Ilmu Kesejahteraan Sosial", jenjang: "S1", semester: "2002/2003 Ganjil", no_sk: "8724/D/T/K-VIII/2011", tgl_sk: "15/09/2011" },
    { kode: "74201", nama: "Ilmu Hukum", jenjang: "S1", semester: "2016/2017 Ganjil", no_sk: "89/KPT/I/2015", tgl_sk: "18/11/2015" },
    { kode: "88201", nama: "Pendidikan Bahasa Dan Sastra Indonesia", jenjang: "S1", semester: "2002/2003 Ganjil", no_sk: "8733/D/T/K-VIII/2011", tgl_sk: "15/09/2011" },
    { kode: "69201", nama: "Sosiologi", jenjang: "S1", semester: "2002/2003 Ganjil", no_sk: "3544/D/T/K-VIII/2009", tgl_sk: "30/09/2009" },
    { kode: "69101", nama: "Sosiologi", jenjang: "S2", semester: "2023/2024 Ganjil", no_sk: "248/E/O/2023", tgl_sk: "03/08/2023" },
    { kode: "61201", nama: "Manajemen", jenjang: "S1", semester: "2002/2003 Ganjil", no_sk: "7162/D/T/K-VIII/2011", tgl_sk: "23/05/2011" },
    { kode: "62201", nama: "Akuntansi", jenjang: "S1", semester: "2002/2003 Ganjil", no_sk: "8723/D/T/K-VIII/2011", tgl_sk: "15/09/2011" },
    { kode: "87204", nama: "Pendidikan Sosiologi", jenjang: "S1", semester: "2016/2017 Ganjil", no_sk: "91/KPT/I/2016", tgl_sk: "02/09/2016" },
    { kode: "54245", nama: "Agrobisnis Perikanan", jenjang: "S1", semester: "2002/2003 Ganjil", no_sk: "7365/D/T/K-VIII/2011", tgl_sk: "13/06/2011" },
    { kode: "84205", nama: "Pendidikan Biologi", jenjang: "S1", semester: "2002/2003 Ganjil", no_sk: "8734/D/T/K-VIII/2011", tgl_sk: "15/09/2011" },
    { kode: "74230", nama: "Ahwal Al Syakhshiyah", jenjang: "S1", semester: "2013/2014 Ganjil", no_sk: "Dj.I/1308/2011", tgl_sk: "27/09/2011" },
    { kode: "54246", nama: "Pemanfaatan Sumber Daya Perikanan", jenjang: "S1", semester: "2002/2003 Ganjil", no_sk: "7161/D/T/K-VIII/2011", tgl_sk: "23/05/2011" },
    { kode: "86208", nama: "Pendidikan Agama Islam", jenjang: "S1", semester: "2013/2014 Ganjil", no_sk: "E.229/1999", tgl_sk: "-" },
    { kode: "84202", nama: "Pendidikan Matematika", jenjang: "S1", semester: "2016/2017 Ganjil", no_sk: "189/KPT/I/2015", tgl_sk: "12/11/2015" },
    { kode: "82201", nama: "Antropologi Sosial", jenjang: "S1", semester: "2002/2003 Ganjil", no_sk: "7164/D/T/K-VIII/2011", tgl_sk: "23/05/2011" }
];

let filteredData = [...totalProdiData];

let currentPage = 1;
let recordsPerPage = 10;

const tableBody = document.getElementById("prodiTableBody");
const searchInput = document.getElementById("searchInput");
const lengthSelect = document.getElementById("lengthSelect");

const prevButton = document.getElementById("prevButton");
const nextButton = document.getElementById("nextButton");
const printButton = document.getElementById("printButton");

const pageInfo = document.getElementById("pageInfo");
const resultInfo = document.getElementById("resultInfo");

/* RINGKASAN */

function updateSummary() {
    document.getElementById("totalProdi").textContent =
        totalProdiData.length;

    document.getElementById("totalS1").textContent =
        totalProdiData.filter(item => item.jenjang === "S1").length;

    document.getElementById("totalS2").textContent =
        totalProdiData.filter(item => item.jenjang === "S2").length;
}

/* MEMBUAT CELL TABEL */

function createCell(value, className = "") {
    const cell = document.createElement("td");

    cell.textContent = value;

    if (className) {
        cell.className = className;
    }

    return cell;
}

/* MENAMPILKAN DATA */

function renderTable() {
    tableBody.replaceChildren();

    const totalPages = Math.ceil(
        filteredData.length / recordsPerPage
    ) || 1;

    currentPage = Math.min(currentPage, totalPages);

    const startIndex = (currentPage - 1) * recordsPerPage;

    const endIndex = startIndex + recordsPerPage;

    const visibleData = filteredData.slice(
        startIndex,
        endIndex
    );

    if (visibleData.length === 0) {
        const row = document.createElement("tr");

        const cell = createCell(
            "Tidak ada program studi yang cocok dengan pencarian.",
            "empty-state"
        );

        cell.colSpan = 7;

        row.appendChild(cell);
        tableBody.appendChild(row);
    } else {
        visibleData.forEach((item, index) => {
            const row = document.createElement("tr");

            row.appendChild(
                createCell(startIndex + index + 1, "number-column")
            );

            row.appendChild(
                createCell(item.kode, "prodi-code")
            );

            row.appendChild(
                createCell(item.nama, "prodi-name")
            );

            const levelCell = document.createElement("td");

            const badge = document.createElement("span");

            badge.textContent = item.jenjang;

            badge.className = item.jenjang === "S1"
                ? "level-badge level-s1"
                : "level-badge level-s2";

            levelCell.appendChild(badge);

            row.appendChild(levelCell);

            row.appendChild(createCell(item.semester));
            row.appendChild(createCell(item.no_sk));
            row.appendChild(createCell(item.tgl_sk));

            tableBody.appendChild(row);
        });
    }

    const firstRecord = filteredData.length === 0
        ? 0
        : startIndex + 1;

    const lastRecord = Math.min(
        endIndex,
        filteredData.length
    );

    resultInfo.textContent =
        `Menampilkan ${firstRecord}–${lastRecord} dari ${filteredData.length} data`;

    pageInfo.textContent =
        `Halaman ${currentPage} dari ${totalPages}`;

    prevButton.disabled = currentPage === 1;

    nextButton.disabled = currentPage === totalPages;
}

/* PENCARIAN */

function filterData() {
    const keyword = searchInput.value
        .trim()
        .toLowerCase();

    filteredData = totalProdiData.filter(item => {
        return (
            item.nama.toLowerCase().includes(keyword) ||
            item.kode.toLowerCase().includes(keyword) ||
            item.jenjang.toLowerCase().includes(keyword)
        );
    });

    currentPage = 1;

    renderTable();
}

/* JUMLAH DATA */

function changeLength() {
    recordsPerPage = Number(lengthSelect.value);

    currentPage = 1;

    renderTable();
}

/* PAGINATION */

function changePage(direction) {
    const totalPages = Math.ceil(
        filteredData.length / recordsPerPage
    ) || 1;

    const nextPage = currentPage + direction;

    if (nextPage < 1 || nextPage > totalPages) {
        return;
    }

    currentPage = nextPage;

    renderTable();

    document.querySelector(".prodi-card").scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}

/* CETAK DATA */

function printData() {
    window.print();
}

/* EVENT LISTENERS */

searchInput.addEventListener("input", filterData);

lengthSelect.addEventListener("change", changeLength);

prevButton.addEventListener("click", () => {
    changePage(-1);
});

nextButton.addEventListener("click", () => {
    changePage(1);
});

printButton.addEventListener("click", printData);

/* INISIALISASI */

updateSummary();
renderTable();
