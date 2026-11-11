document.addEventListener("DOMContentLoaded", () => {
    const searchInput = document.getElementById("toolSearch");
    const filterButtons = document.querySelectorAll(".filter-btn");
    const toolCards = document.querySelectorAll(".tool-card");
    const emptyState = document.getElementById("emptyState");
    const toolGrid = document.getElementById("toolGrid");
    const toolCount = document.getElementById("toolCount");
    const resetSearch = document.getElementById("resetSearch");
    const currentYear = document.getElementById("currentYear");

    let activeFilter = "all";

    if (currentYear) {
        currentYear.textContent = new Date().getFullYear();
    }

    function filterTools() {
        const keyword = searchInput.value.trim().toLowerCase();
        let visibleCount = 0;

        toolCards.forEach((card) => {
            const category = card.dataset.category;
            const searchableText = (
                card.dataset.search + " " + card.textContent
            ).toLowerCase();

            const matchesCategory =
                activeFilter === "all" || category === activeFilter;

            const matchesSearch = searchableText.includes(keyword);
            const shouldShow = matchesCategory && matchesSearch;

            card.hidden = !shouldShow;

            if (shouldShow) {
                visibleCount++;
            }
        });

        toolCount.textContent = visibleCount;
        emptyState.hidden = visibleCount !== 0;
        toolGrid.hidden = visibleCount === 0;
    }

    searchInput.addEventListener("input", filterTools);

    filterButtons.forEach((button) => {
        button.addEventListener("click", () => {
            filterButtons.forEach((item) => {
                item.classList.remove("active");
            });

            button.classList.add("active");
            activeFilter = button.dataset.filter;

            filterTools();
        });
    });

    resetSearch.addEventListener("click", () => {
        searchInput.value = "";
        activeFilter = "all";

        filterButtons.forEach((button) => {
            button.classList.toggle(
                "active",
                button.dataset.filter === "all"
            );
        });

        filterTools();
    });

    filterTools();
});
