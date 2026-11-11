
document.addEventListener("DOMContentLoaded", function () {

    // Tahun otomatis pada footer
    const currentYear = document.getElementById("currentYear");

    if (currentYear) {
        currentYear.textContent = new Date().getFullYear();
    }


    // Animasi ringan ketika elemen masuk ke layar
    const animatedElements = document.querySelectorAll(
        ".scope-card, .service-card, .commitment-item, .about-content"
    );

    if ("IntersectionObserver" in window) {

        const observer = new IntersectionObserver(
            function (entries, observerInstance) {

                entries.forEach(function (entry) {

                    if (entry.isIntersecting) {

                        entry.target.classList.add("is-visible");

                        observerInstance.unobserve(entry.target);

                    }

                });

            },
            {
                threshold: 0.12
            }
        );

        animatedElements.forEach(function (element) {

            element.classList.add("reveal-element");

            observer.observe(element);

        });

    }

});

