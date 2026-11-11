document.addEventListener("DOMContentLoaded", () => {
    const mobileMenuToggle = document.getElementById("mobileMenuToggle");
    const navMenu = document.getElementById("primaryNavigation");
    const dropdownItems = document.querySelectorAll(".has-dropdown");
    const dropdownToggles = document.querySelectorAll(".dropdown-toggle");

    // Pastikan elemen navigasi tersedia
    if (!mobileMenuToggle || !navMenu) {
        return;
    }

    // Membuka dan menutup hamburger menu
    mobileMenuToggle.addEventListener("click", () => {
        const isExpanded =
            mobileMenuToggle.getAttribute("aria-expanded") === "true";

        mobileMenuToggle.setAttribute("aria-expanded", String(!isExpanded));
        mobileMenuToggle.setAttribute(
            "aria-label",
            isExpanded ? "Buka menu navigasi" : "Tutup menu navigasi"
        );

        navMenu.classList.toggle("is-open", !isExpanded);

        if (isExpanded) {
            closeAllDropdowns();
        }
    });

    // Menutup seluruh dropdown
    function closeAllDropdowns(except = null) {
        dropdownItems.forEach((item) => {
            if (item === except) return;

            item.classList.remove("open");

            const button = item.querySelector(".dropdown-toggle");

            if (button) {
                button.setAttribute("aria-expanded", "false");
            }
        });
    }

    // Membuka dan menutup dropdown melalui klik
    dropdownToggles.forEach((button) => {
        button.addEventListener("click", (event) => {
            event.stopPropagation();

            const parent = button.closest(".has-dropdown");
            const isOpen = parent.classList.contains("open");

            closeAllDropdowns();

            if (!isOpen) {
                parent.classList.add("open");
                button.setAttribute("aria-expanded", "true");
            }
        });
    });

    // Menutup dropdown ketika pengguna mengklik area luar navbar
    document.addEventListener("click", (event) => {
        if (!event.target.closest(".site-header")) {
            closeAllDropdowns();
            closeMobileMenu();
        }
    });

    // Menutup menu menggunakan tombol Escape
    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            closeAllDropdowns();
            closeMobileMenu();
        }
    });

    // Menutup hamburger menu
    function closeMobileMenu() {
        mobileMenuToggle.setAttribute("aria-expanded", "false");
        mobileMenuToggle.setAttribute("aria-label", "Buka menu navigasi");
        navMenu.classList.remove("is-open");
    }

    // Menutup menu setelah pengguna memilih halaman di perangkat mobile
    navMenu.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", () => {
            if (window.innerWidth <= 768) {
                closeMobileMenu();
                closeAllDropdowns();
            }
        });
    });

    // Mengatur ulang navigasi ketika ukuran layar berubah
    window.addEventListener("resize", () => {
        if (window.innerWidth > 768) {
            closeMobileMenu();
            closeAllDropdowns();
        }
    });
});
