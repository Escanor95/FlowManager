/* ====================================================
   AURA WELLNESS PWA - AUTH
   ==================================================== */

async function loginUser(event) {
    if (event) event.preventDefault();

    const emailInput = document.getElementById("loginEmail");
    const passwordInput = document.getElementById("loginPassword");
    const loginButton = document.getElementById("loginButton");
    const rememberMe = document.getElementById("rememberMe");

    if (!emailInput || !passwordInput) return;

    const email = emailInput.value.trim().toLowerCase();
    const password = passwordInput.value;

    if (!email || !password) {
        return showToast(
            "Ingresa tu correo y contraseña.",
            "error"
        );
    }

    const original =
        loginButton?.innerHTML ||
        "Iniciar sesión";

    if (loginButton) {
        loginButton.disabled = true;
        loginButton.innerHTML =
            '<i class="fa-solid fa-spinner fa-spin"></i> Iniciando sesión...';
    }

    try {
        const response = await fetch(
            `${API_URL}/auth/login`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email,
                    password,
                    rememberMe: Boolean(rememberMe?.checked)
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.message ||
                "Correo o contraseña incorrectos."
            );
        }

        if (!data.token || !data.user) {
            throw new Error(
                "El servidor no devolvió una sesión válida."
            );
        }

        /*
         * RECORDAR SESIÓN
         *
         * Si está activado:
         *   → localStorage
         *
         * Si está desactivado:
         *   → sessionStorage
         */

        if (rememberMe?.checked) {

            localStorage.setItem(
                "auraToken",
                data.token
            );

            localStorage.setItem(
                "auraUser",
                JSON.stringify(data.user)
            );

            sessionStorage.removeItem(
                "auraToken"
            );

            sessionStorage.removeItem(
                "auraUser"
            );

        } else {

            sessionStorage.setItem(
                "auraToken",
                data.token
            );

            sessionStorage.setItem(
                "auraUser",
                JSON.stringify(data.user)
            );

            localStorage.removeItem(
                "auraToken"
            );

            localStorage.removeItem(
                "auraUser"
            );
        }

        AppState.user = data.user;
        persistUser();
        AppState.currentPage = "home";

        renderApp();
        startInactivityWatcher();

        if (typeof refreshCurrentUserData === "function") {
            await refreshCurrentUserData();
        } else if (
            String(data.user.role || "")
                .trim()
                .toLowerCase() === "coach"
        ) {
            await loadCoachProfile();
        } else {
            await refreshClientData();
        }

        renderApp();

    } catch (error) {

        console.error(error);

        showToast(
            error.message ||
            "No fue posible iniciar sesión.",
            "error"
        );

        if (loginButton) {
            loginButton.disabled = false;
            loginButton.innerHTML = original;
        }
    }
}


/* ====================================================
   AUTH TOKEN
   ==================================================== */

function getAuthToken() {

    return (
        localStorage.getItem("auraToken") ||
        sessionStorage.getItem("auraToken")
    );
}


/* ====================================================
   AUTH FETCH
   ==================================================== */

function authFetch(url, options = {}) {

    const token = getAuthToken();

    const headers = {
        ...(options.headers || {})
    };

    if (token) {
        headers.Authorization =
            `Bearer ${token}`;
    }

    if (
        options.body &&
        !headers["Content-Type"]
    ) {
        headers["Content-Type"] =
            "application/json";
    }

    return fetch(
        url,
        {
            ...options,
            headers
        }
    );
}
