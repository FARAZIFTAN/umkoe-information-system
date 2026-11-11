document.addEventListener("DOMContentLoaded", () => {
    const SESSION_KEY = "pusdatinAdminSession";
    const DEMO_EMAIL = "admin@pusdatin.ac.id";
    const DEMO_PASSWORD = "Pusdatin123!";

    const currentPage = window.location.pathname;
    const isLoginPage = currentPage.endsWith("/admin.html");
    const isNestedAdminPage = currentPage.includes("/pages/admin/");

    const loginPath = isNestedAdminPage
        ? "../admin.html"
        : "admin.html";

    const dashboardPath = isLoginPage
        ? "admin/dashboard.html"
        : "dashboard.html";

    function getSession() {
        try {
            const session = JSON.parse(
                localStorage.getItem(SESSION_KEY)
            );

            return session && session.loggedIn === true
                ? session
                : null;
        } catch (error) {
            return null;
        }
    }

    if (isLoginPage && getSession()) {
        window.location.replace(dashboardPath);
        return;
    }

    if (!isLoginPage && !getSession()) {
        window.location.replace(loginPath);
        return;
    }

    const loginForm = document.getElementById("loginForm");

    if (loginForm) {
        loginForm.addEventListener("submit", (event) => {
            event.preventDefault();

            const email = document
                .getElementById("email")
                .value.trim()
                .toLowerCase();

            const password = document.getElementById("password").value;
            const message = document.getElementById("loginMessage");

            if (
                email !== DEMO_EMAIL ||
                password !== DEMO_PASSWORD
            ) {
                message.textContent =
                    "Email atau password yang Anda masukkan tidak sesuai.";
                return;
            }

            try {
                localStorage.setItem(
                    SESSION_KEY,
                    JSON.stringify({
                        email: DEMO_EMAIL,
                        loggedIn: true,
                        loggedInAt: new Date().toISOString()
                    })
                );

                window.location.href = dashboardPath;
            } catch (error) {
                message.textContent =
                    "Sesi gagal disimpan. Periksa pengaturan browser.";
            }
        });
    }

    const logoutButton = document.getElementById("logoutButton");

    if (logoutButton) {
        logoutButton.addEventListener("click", () => {
            localStorage.removeItem(SESSION_KEY);
            window.location.replace(loginPath);
        });
    }
});
