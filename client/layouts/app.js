/*
====================================================

    FLOWMANAGER

    APP

====================================================
*/

document.addEventListener(
    "DOMContentLoaded",
    initializeApp
);


// ====================================================
// VALIDAR ROL CLIENTE
// ====================================================

function isClientRole(
    role
) {

    const normalizedRole =
        String(
            role || ""
        )
            .trim()
            .toLowerCase();


    return (

        normalizedRole === "client"

        ||

        normalizedRole === "clienta"

        ||

        normalizedRole === "cliente"

    );

}


// ====================================================
// VALIDAR ROL COACH
// ====================================================

function isCoachRole(
    role
) {

    const normalizedRole =
        String(
            role || ""
        )
            .trim()
            .toLowerCase();


    return (
        normalizedRole === "coach"
    );

}


// ====================================================
// INICIALIZAR APP
// ====================================================

async function initializeApp() {

    try {

        // =============================================
        // VALIDAR SESIÓN
        // =============================================

        if (
            !AuthService.isAuthenticated()
        ) {

            await loadLogin();

            return;

        }


        // =============================================
        // CARGAR LAYOUT
        // =============================================

        const response =
            await fetch(
                "layouts/app.html"
            );


        if (
            !response.ok
        ) {

            throw new Error(
                "No fue posible cargar el layout."
            );

        }


        const app =
            document.getElementById(
                "app"
            );


        if (
            !app
        ) {

            throw new Error(
                "No se encontró #app."
            );

        }


        app.innerHTML =
            await response.text();


        // =============================================
        // CARGAR MODAL
        // =============================================

        await loadModal();


        // =============================================
        // REGISTRAR RUTAS
        // =============================================

        registerRoutes();


        // =============================================
        // INICIALIZAR NAVEGACIÓN
        // =============================================

        initializeNavigation();


        // =============================================
        // OBTENER USUARIO
        // =============================================

        const user =
            AuthService.getUser();


        if (
            !user
        ) {

            AuthService.logout();

            return;

        }


        // =============================================
        // OBTENER ROL
        // =============================================

        const role =
            String(
                user.role || ""
            )
                .trim()
                .toLowerCase();


        // =============================================
        // APLICAR PERMISOS
        // =============================================

        applyMenuPermissions(
            role
        );


        // =============================================
        // LOGOUT
        // =============================================

        initializeLogout();


        // =============================================
        // TOPBAR
        // =============================================

        renderTopbarUser(
            user
        );


        // =============================================
        // FEATURE INICIAL
        // =============================================

        let initialFeature =
            "dashboard";


        // =============================================
        // CLIENTE
        // =============================================

        if (
            isClientRole(
                role
            )
        ) {

            initialFeature =
                "client-reservations";

        }


        // =============================================
        // COACH
        // =============================================

        else if (
            isCoachRole(
                role
            )
        ) {

            initialFeature =
                "dashboard";

        }


        // =============================================
        // NAVEGAR
        // =============================================

        await Router.navigate(
            initialFeature
        );


        // =============================================
        // MENU ACTIVO
        // =============================================

        updateActiveMenu(
            initialFeature
        );

    }

    catch (
    error
    ) {

        console.error(
            "Error al inicializar FlowManager:",
            error
        );

    }

}


// ====================================================
// LOGIN
// ====================================================

async function loadLogin() {

    const response =
        await fetch(
            "layouts/login.html"
        );


    if (
        !response.ok
    ) {

        throw new Error(
            "No fue posible cargar el login."
        );

    }


    const app =
        document.getElementById(
            "app"
        );


    if (
        !app
    ) {

        throw new Error(
            "No se encontró #app."
        );

    }


    app.innerHTML =
        await response.text();


    // =============================================
    // CSS LOGIN
    // =============================================

    const existingLoginCss =
        document.querySelector(
            'link[href="layouts/login.css"]'
        );


    if (
        !existingLoginCss
    ) {

        const loginCss =
            document.createElement(
                "link"
            );


        loginCss.rel =
            "stylesheet";


        loginCss.href =
            "layouts/login.css";


        document.head.appendChild(
            loginCss
        );

    }


    // =============================================
    // FORMULARIO
    // =============================================

    const form =
        document.getElementById(
            "loginForm"
        );


    const errorContainer =
        document.getElementById(
            "loginError"
        );


    if (
        !form
    ) {

        throw new Error(
            "No se encontró el formulario de login."
        );

    }


    form.addEventListener(

        "submit",

        async event => {

            event.preventDefault();


            const email =
                document
                    .getElementById(
                        "loginEmail"
                    )
                    .value
                    .trim();


            const password =
                document
                    .getElementById(
                        "loginPassword"
                    )
                    .value;


            const button =
                form.querySelector(
                    "button[type='submit']"
                );


            if (
                errorContainer
            ) {

                errorContainer.hidden =
                    true;

            }


            if (
                button
            ) {

                button.disabled =
                    true;


                button.textContent =
                    "Iniciando sesión...";

            }


            try {

                await AuthService.login(
                    email,
                    password
                );


                window.location.reload();

            }

            catch (
            error
            ) {

                if (
                    errorContainer
                ) {

                    errorContainer.textContent =
                        error.message;


                    errorContainer.hidden =
                        false;

                }

            }

            finally {

                if (
                    button
                ) {

                    button.disabled =
                        false;


                    button.textContent =
                        "Iniciar sesión";

                }

            }

        }

    );

}


// ====================================================
// CARGAR MODAL
// ====================================================

async function loadModal() {

    const existingModal =
        document.getElementById(
            "modalContainer"
        );


    if (
        existingModal
    ) {

        return;

    }


    const response =
        await fetch(
            "components/ui/modal/modal.html"
        );


    if (
        !response.ok
    ) {

        throw new Error(
            "No fue posible cargar el modal."
        );

    }


    const modal =
        document.createElement(
            "div"
        );


    modal.id =
        "modalContainer";


    modal.innerHTML =
        await response.text();


    document.body.appendChild(
        modal
    );

}


// ====================================================
// CERRAR SESIÓN
// ====================================================

function initializeLogout() {

    const logoutButton =
        document.getElementById(
            "logoutButton"
        );


    if (
        !logoutButton
    ) {

        console.error(
            "No se encontró el botón de cerrar sesión."
        );

        return;

    }


    logoutButton.addEventListener(

        "click",

        () => {

            const confirmed =
                confirm(
                    "¿Deseas cerrar sesión?"
                );


            if (
                !confirmed
            ) {

                return;

            }


            AuthService.logout();

        }

    );

}


// ====================================================
// REGISTRAR RUTAS
// ====================================================

function registerRoutes() {

    Router.register(
        "home",
        loadHomeFeature
    );


    Router.register(

        "dashboard",

        async () => {

            scrollToTop();

            await ModuleFactory.open(
                "dashboard"
            );

        }

    );


    Router.register(

        "clients",

        async () => {

            scrollToTop();

            await ModuleFactory.open(
                "clients"
            );

        }

    );


    Router.register(

        "memberships",

        async () => {

            scrollToTop();

            await ModuleFactory.open(
                "memberships"
            );

        }

    );


    Router.register(

        "activities",

        async () => {

            scrollToTop();

            await ModuleFactory.open(
                "activities"
            );

        }

    );


    Router.register(

        "schedules",

        async () => {

            scrollToTop();

            await ModuleFactory.open(
                "schedules"
            );

        }

    );


    Router.register(

        "reservations",

        async () => {

            scrollToTop();

            await ModuleFactory.open(
                "reservations"
            );

        }

    );


    Router.register(

        "client-reservations",

        async () => {

            scrollToTop();

            await ModuleFactory.open(
                "reservations"
            );

        }

    );


    Router.register(

        "my-reservations",

        async () => {

            scrollToTop();

            await ModuleFactory.open(
                "my-reservations"
            );

        }

    );


    Router.register(

        "scanner",

        async () => {

            scrollToTop();

            await ModuleFactory.open(
                "scanner"
            );

        }

    );


    Router.register(

        "attendance",

        async () => {

            scrollToTop();

            await ModuleFactory.open(
                "attendance"
            );

        }

    );


    Router.register(

        "my-attendance",

        async () => {

            scrollToTop();

            await ModuleFactory.open(
                "my-attendance"
            );

        }

    );


    Router.register(

        "qr",

        async () => {

            scrollToTop();

            await ModuleFactory.open(
                "qr"
            );

        }

    );


    Router.register(

        "profile",

        async () => {

            scrollToTop();

            await ModuleFactory.open(
                "profile"
            );

        }

    );


    Router.register(

        "coaches",

        async () => {

            scrollToTop();

            await ModuleFactory.open(
                "coaches"
            );

        }

    );


    Router.register(

        "users",

        async () => {

            scrollToTop();

            await ModuleFactory.open(
                "users"
            );

        }

    );


    Router.register(

        "settings",

        async () => {

            scrollToTop();

            await loadSettingsFeature();

        }

    );

}


// ====================================================
// APLICAR PERMISOS AL MENÚ
// ====================================================

function applyMenuPermissions(
    role
) {

    const buttons =
        document.querySelectorAll(
            ".fm-menu-item[data-feature]"
        );


    const isClient =
        isClientRole(
            role
        );


    const isCoach =
        isCoachRole(
            role
        );


    buttons.forEach(

        button => {

            const menuRole =
                button.dataset.roleMenu;


            // =========================================
            // CLIENTE
            // =========================================

            if (
                menuRole === "client"
            ) {

                button.hidden =
                    !isClient;

                return;

            }


            // =========================================
            // COACH
            // =========================================

            if (
                menuRole === "coach"
            ) {

                button.hidden =
                    !isCoach;

                return;

            }


            // =========================================
            // ADMIN
            // =========================================

            if (
                menuRole === "admin"
            ) {

                button.hidden =
                    isClient ||
                    isCoach;

                return;

            }


            // =========================================
            // OTROS PERMISOS
            // =========================================

            const feature =
                button.dataset.feature;


            const allowed =
                PermissionService.canAccess(
                    feature
                );


            button.hidden =
                !allowed;

        }

    );

}


// ====================================================
// NAVEGACIÓN
// ====================================================

function initializeNavigation() {

    const buttons =
        document.querySelectorAll(
            ".fm-menu-item[data-feature]"
        );


    buttons.forEach(

        button => {

            button.addEventListener(

                "click",

                async () => {

                    const feature =
                        button.dataset.feature;


                    if (
                        !feature ||
                        button.hidden
                    ) {

                        return;

                    }


                    try {

                        await Router.navigate(
                            feature
                        );


                        updateActiveMenu(
                            feature
                        );

                    }

                    catch (
                    error
                    ) {

                        console.error(

                            `Error al navegar a ${feature}:`,

                            error

                        );

                    }

                }

            );

        }

    );

}


// ====================================================
// ACTUALIZAR MENÚ ACTIVO
// ====================================================

function updateActiveMenu(
    feature
) {

    const buttons =
        document.querySelectorAll(
            ".fm-menu-item[data-feature]"
        );


    buttons.forEach(

        button => {

            button.classList.toggle(

                "active",

                button.dataset.feature ===
                feature
                &&
                !button.hidden

            );

        }

    );


    const activeButton =
        Array.from(
            buttons
        )
            .find(

                button =>

                    button.dataset.feature ===
                    feature
                    &&
                    !button.hidden

            );


    const pageTitle =
        document.getElementById(
            "pageTitle"
        );


    if (
        activeButton &&
        pageTitle
    ) {

        pageTitle.textContent =
            activeButton.textContent.trim();

    }

}


// ====================================================
// TOPBAR
// ====================================================

function renderTopbarUser(
    user
) {

    const container =
        document.getElementById(
            "topbarUser"
        );


    if (
        !container
    ) {

        return;

    }


    if (
        !user
    ) {

        container.innerHTML =
            "";

        return;

    }


    const fullName =

        user.fullName
        ||
        user.name
        ||
        user.username
        ||
        "Usuario";


    const role =
        String(
            user.role || ""
        )
            .trim()
            .toLowerCase();


    let roleLabel =
        "Usuario";


    if (
        isClientRole(
            role
        )
    ) {

        roleLabel =
            "Cliente";

    }

    else if (
        isCoachRole(
            role
        )
    ) {

        roleLabel =
            "Coach";

    }

    else if (

        role === "manager"

        ||

        role === "admin"

        ||

        role === "administrator"

    ) {

        roleLabel =
            "Gerente";

    }

    else if (
        role === "reception"
    ) {

        roleLabel =
            "Recepción";

    }

    else if (
        role === "accountant"
    ) {

        roleLabel =
            "Contador";

    }


    const initials =
        fullName
            .split(
                " "
            )
            .filter(
                Boolean
            )
            .slice(
                0,
                2
            )
            .map(

                name =>

                    name
                        .charAt(0)
                        .toUpperCase()

            )
            .join(
                ""
            );


    container.innerHTML = `

        <div class="fm-topbar-user-avatar">

            ${initials}

        </div>


        <div class="fm-topbar-user-info">

            <strong>

                ${fullName}

            </strong>


            <span>

                ${roleLabel}

            </span>

        </div>

    `;

}


// ====================================================
// UTILIDADES
// ====================================================

function scrollToTop() {

    window.scrollTo({

        top: 0,

        behavior:
            "auto"

    });

}


// ====================================================
// HOME
// ====================================================

async function loadHomeFeature() {

    const workspace =
        document.getElementById(
            "workspace"
        );


    if (
        !workspace
    ) {

        return;

    }


    workspace.innerHTML = `

        <div class="fm-home">

            <h2>
                Bienvenido a FlowManager
            </h2>


            <p>
                Selecciona un módulo del menú lateral.
            </p>

        </div>

    `;

}


// ====================================================
// SETTINGS
// ====================================================

async function loadSettingsFeature() {

    const workspace =
        document.getElementById(
            "workspace"
        );


    if (
        !workspace
    ) {

        return;

    }


    workspace.innerHTML = `

        <div class="fm-home">

            <h2>
                ⚙ Configuración
            </h2>


            <p>
                En construcción.
            </p>

        </div>

    `;

}