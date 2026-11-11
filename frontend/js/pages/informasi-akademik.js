document.addEventListener("DOMContentLoaded", () => {

    const API_URL = "https://umkoe.ac.id/wp-json/wp/v2";

    const NEWS_CATEGORY_ID = 7;
    const ANNOUNCEMENT_CATEGORY_ID = 11;

    const newsGrid = document.getElementById("newsGrid");
    const newsStatus = document.getElementById("newsStatus");
    const searchInput = document.getElementById("newsSearch");
    const filterButtons = document.querySelectorAll(".filter-button");
    const loadMoreButton = document.getElementById("loadMoreButton");
    const announcementMessage = document.getElementById("announcementMessage");

    const yearElement = document.getElementById("currentYear");

    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }


    let allNews = [];
    let currentFilter = "all";
    let currentPage = 1;
    let isLoading = false;
    let hasMoreNews = true;

    const perPage = 9;


    // =====================================
    // FORMAT TANGGAL
    // =====================================

    function formatDate(dateString) {

        if (!dateString) {
            return "Tanggal tidak tersedia";
        }

        const date = new Date(dateString);

        if (Number.isNaN(date.getTime())) {
            return "Tanggal tidak tersedia";
        }

        return new Intl.DateTimeFormat("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric"
        }).format(date);
    }


    // =====================================
    // MENGAMBIL TEKS DARI HTML
    // =====================================

    function extractText(html) {

        const temporaryElement = document.createElement("div");

        temporaryElement.innerHTML = html || "";

        return (temporaryElement.textContent || temporaryElement.innerText || "")
            .replace(/\s+/g, " ")
            .trim();
    }


    // =====================================
    // VALIDASI LINK
    // =====================================

    function isOfficialUrl(url) {

        try {

            const parsedUrl = new URL(url);

            return (
                parsedUrl.protocol === "https:" &&
                parsedUrl.hostname === "umkoe.ac.id"
            );

        } catch {
            return false;
        }
    }


    // =====================================
    // KLASIFIKASI TOPIK BERITA
    // =====================================

    function classifyNews(title) {

        const text = (title || "").toLowerCase();

        const academicKeywords = [
            "akademik",
            "perkuliahan",
            "semester",
            "kurikulum",
            "pembelajaran",
            "pddikti",
            "program studi",
            "prodi",
            "ob e",
            "obe",
            "audit mutu",
            "akreditasi",
            "dosen",
            "wisuda"
        ];

        const researchKeywords = [
            "penelitian",
            "pengabdian",
            "lp2m",
            "riset",
            "jurnal",
            "publikasi ilmiah"
        ];

        const studentKeywords = [
            "mahasiswa",
            "ormaba",
            "organisasi mahasiswa",
            "prestasi mahasiswa",
            "kompetisi mahasiswa",
            "olimpiade"
        ];

        if (researchKeywords.some(keyword => text.includes(keyword))) {
            return "research";
        }

        if (studentKeywords.some(keyword => text.includes(keyword))) {
            return "student";
        }

        if (academicKeywords.some(keyword => text.includes(keyword))) {
            return "academic";
        }

        return "general";
    }


    // =====================================
    // LABEL TOPIK
    // =====================================

    function getTopicLabel(topic) {

        const labels = {
            academic: "Akademik",
            research: "Penelitian",
            student: "Kemahasiswaan",
            general: "Berita Kampus"
        };

        return labels[topic] || "Berita Kampus";
    }


    // =====================================
    // MENGAMBIL GAMBAR BERITA
    // =====================================

    function getFeaturedImage(post) {

        const media = post?._embedded?.["wp:featuredmedia"]?.[0];

        const imageUrl = media?.source_url;

        if (imageUrl && isOfficialUrl(imageUrl)) {
            return imageUrl;
        }

        return null;
    }


    // =====================================
    // MEMBUAT KARTU BERITA
    // =====================================

    function createNewsCard(post) {

        const title = extractText(post.title?.rendered);
        const excerpt = extractText(post.excerpt?.rendered);

        const date = formatDate(post.date);
        const topic = classifyNews(title);

        const imageUrl = getFeaturedImage(post);

        const articleUrl = isOfficialUrl(post.link)
            ? post.link
            : "https://umkoe.ac.id/";


        const card = document.createElement("article");

        card.className = "news-card";

        const imageContainer = document.createElement("div");
        imageContainer.className = "news-image";

        if (imageUrl) {

            const image = document.createElement("img");

            image.src = imageUrl;
            image.alt = title || "Gambar berita UMKOE";
            image.loading = "lazy";

            image.onerror = () => {

                imageContainer.innerHTML = `
                    <div class="image-placeholder">
                        <i class="fa-solid fa-newspaper"></i>
                    </div>
                `;

            };

            imageContainer.appendChild(image);

        } else {

            imageContainer.innerHTML = `
                <div class="image-placeholder">
                    <i class="fa-solid fa-newspaper"></i>
                </div>
            `;

        }


        const body = document.createElement("div");
        body.className = "news-body";


        const meta = document.createElement("div");
        meta.className = "news-meta";

        meta.innerHTML = `
            <i class="fa-regular fa-calendar"></i>
            <span>${date}</span>
        `;


        const category = document.createElement("span");
        category.className = "news-category";
        category.textContent = getTopicLabel(topic);


        const heading = document.createElement("h3");
        heading.textContent = title || "Berita tanpa judul";


        const description = document.createElement("p");
        description.className = "news-excerpt";

        description.textContent = excerpt
            ? excerpt.substring(0, 160) + (excerpt.length > 160 ? "..." : "")
            : "Baca informasi selengkapnya melalui website resmi Universitas Muhammadiyah Kupang.";


        const readMore = document.createElement("a");

        readMore.className = "news-read-more";
        readMore.href = articleUrl;
        readMore.target = "_blank";
        readMore.rel = "noopener noreferrer";

        readMore.innerHTML = `
            Baca Selengkapnya
            <i class="fa-solid fa-arrow-right"></i>
        `;


        body.appendChild(meta);
        body.appendChild(category);
        body.appendChild(heading);
        body.appendChild(description);
        body.appendChild(readMore);

        card.appendChild(imageContainer);
        card.appendChild(body);

        return card;
    }


    // =====================================
    // MENAMPILKAN BERITA
    // =====================================

    function renderNews() {

        newsGrid.innerHTML = "";

        const keyword = searchInput.value.toLowerCase().trim();

        const filteredNews = allNews.filter(post => {

            const title = extractText(post.title?.rendered).toLowerCase();

            const excerpt = extractText(post.excerpt?.rendered).toLowerCase();

            const topic = classifyNews(title);

            const matchesSearch =
                title.includes(keyword) ||
                excerpt.includes(keyword);

            const matchesFilter =
                currentFilter === "all" ||
                topic === currentFilter;

            return matchesSearch && matchesFilter;

        });


        if (filteredNews.length === 0) {

            newsGrid.innerHTML = `
                <div class="news-status" style="grid-column: 1 / -1;">
                    <i class="fa-solid fa-magnifying-glass"></i>
                    Tidak ada berita yang sesuai dengan pencarian.
                </div>
            `;

            return;
        }


        filteredNews.forEach(post => {

            const card = createNewsCard(post);

            newsGrid.appendChild(card);

        });

    }


    // =====================================
    // MENGAMBIL BERITA DARI API
    // =====================================

    async function loadNews() {

        if (isLoading || !hasMoreNews) {
            return;
        }

        isLoading = true;

        loadMoreButton.disabled = true;

        loadMoreButton.textContent = "Memuat berita...";


        try {

            const endpoint =
                `${API_URL}/posts?categories=${NEWS_CATEGORY_ID}` +
                `&per_page=${perPage}` +
                `&page=${currentPage}` +
                `&_embed`;


            const response = await fetch(endpoint);


            if (!response.ok) {

                throw new Error(
                    `Server memberikan status HTTP ${response.status}`
                );

            }


            const posts = await response.json();


            if (!Array.isArray(posts)) {
                throw new Error("Format data berita tidak sesuai.");
            }


            if (posts.length === 0) {

                hasMoreNews = false;

            } else {

                allNews = [...allNews, ...posts];

                currentPage++;

                renderNews();

            }


            const totalPages = Number(
                response.headers.get("X-WP-TotalPages")
            );

            if (totalPages && currentPage > totalPages) {
                hasMoreNews = false;
            }


            newsStatus.style.display = "none";

            loadMoreButton.hidden = !hasMoreNews;


        } catch (error) {

            console.error("Gagal mengambil berita:", error);

            if (allNews.length === 0) {

                newsStatus.innerHTML = `
                    <i class="fa-solid fa-triangle-exclamation"></i>
                    Berita belum dapat dimuat.
                    Silakan periksa koneksi internet atau kunjungi
                    <a href="https://umkoe.ac.id/category/berita/"
                       target="_blank"
                       rel="noopener noreferrer">
                       website berita resmi UMKOE
                    </a>.
                `;

            } else {

                console.error("Gagal memuat halaman berita berikutnya.");

            }

            hasMoreNews = false;
            loadMoreButton.hidden = true;

        } finally {

            isLoading = false;

            loadMoreButton.disabled = false;

            loadMoreButton.innerHTML = `
                Muat Berita Lainnya
                <i class="fa-solid fa-arrow-down"></i>
            `;

        }

    }


    // =====================================
    // FILTER BERITA
    // =====================================

    filterButtons.forEach(button => {

        button.addEventListener("click", () => {

            filterButtons.forEach(item => {
                item.classList.remove("active");
            });

            button.classList.add("active");

            currentFilter = button.dataset.filter;

            renderNews();

        });

    });


    // =====================================
    // PENCARIAN
    // =====================================

    searchInput.addEventListener("input", () => {

        renderNews();

    });


    // =====================================
    // MUAT BERITA BERIKUTNYA
    // =====================================

    loadMoreButton.addEventListener("click", () => {

        loadNews();

    });


    // =====================================
    // CEK PENGUMUMAN
    // =====================================

    async function checkAnnouncements() {

        try {

            const endpoint =
                `${API_URL}/posts?categories=${ANNOUNCEMENT_CATEGORY_ID}&per_page=1`;


            const response = await fetch(endpoint);


            if (!response.ok) {
                throw new Error("Gagal memeriksa pengumuman.");
            }


            const announcements = await response.json();


            if (announcements.length > 0) {

                announcementMessage.textContent =
                    `Terdapat ${announcements.length} atau lebih informasi pengumuman yang tersedia pada sumber resmi. Silakan kunjungi website UMKOE untuk melihat detailnya.`;

            } else {

                announcementMessage.textContent =
                    "Belum ada artikel yang dipublikasikan pada kategori Pengumuman di sumber data website resmi yang diperiksa.";

            }

        } catch (error) {

            console.error("Pemeriksaan pengumuman gagal:", error);

            announcementMessage.textContent =
                "Informasi pengumuman belum dapat diperiksa. Silakan kunjungi website resmi UMKOE.";

        }

    }


    // =====================================
    // INISIALISASI
    // =====================================

    loadNews();

    checkAnnouncements();

});
