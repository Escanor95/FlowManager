/*
====================================================

    FLOWMANAGER

    CLIENT MODULE

====================================================
*/

class ClientModule extends Module {

    constructor() {

        super("Clients");

        this.selectedClient = null;

    }


    // ====================================================
    // OPEN
    // ====================================================

    async open() {

        await this.load(
            "clients/clients"
        );

        this.initialize();

    }


    // ====================================================
    // INITIALIZE
    // ====================================================

    initialize() {

        this.initializeButtons();

        this.initializeSearch();

        this.refresh();

    }


    // ====================================================
    // REFRESH
    // ====================================================

    async refresh() {

        try {

            this.selectedClient = null;

            this.clearProfile();

            const results =
                document.getElementById(
                    "results"
                );

            if (results) {

                results.innerHTML = "";

                results.style.display =
                    "none";

            }

        }

        catch (error) {

            console.error(
                error
            );

        }

    }


    // ====================================================
    // NEW CLIENT
    // ====================================================

    initializeButtons() {

        const button =
            document.getElementById(
                "newClient"
            );

        if (!button) return;


        button.onclick = () => {

            loadNewClientForm();

        };

    }

    // ====================================================
    // APP ACCESS SETTINGS
    // ====================================================

    initializeAppAccessSettings(
        client
    ) {

        const emailInput =
            document.getElementById(
                "clientAppEmail"
            );


        const passwordInput =
            document.getElementById(
                "clientAppPassword"
            );


        const generatePasswordButton =
            document.getElementById(
                "generateSecurePassword"
            );


        const togglePasswordButton =
            document.getElementById(
                "toggleClientPassword"
            );


        const saveButton =
            document.getElementById(
                "saveClientAppAccess"
            );


        if (
            generatePasswordButton &&
            passwordInput
        ) {

            generatePasswordButton.onclick =
                () => {

                    passwordInput.value =
                        this.generateSecurePassword();


                    passwordInput.type =
                        "text";


                    const icon =
                        togglePasswordButton
                            ?.querySelector(
                                ".material-symbols-outlined"
                            );


                    if (icon) {

                        icon.textContent =
                            "visibility_off";

                    }

                };

        }


        if (
            togglePasswordButton &&
            passwordInput
        ) {

            togglePasswordButton.onclick =
                () => {

                    const isPassword =
                        passwordInput.type ===
                        "password";


                    passwordInput.type =
                        isPassword
                            ? "text"
                            : "password";


                    const icon =
                        togglePasswordButton
                            .querySelector(
                                ".material-symbols-outlined"
                            );


                    if (icon) {

                        icon.textContent =
                            isPassword
                                ? "visibility_off"
                                : "visibility";

                    }

                };

        }


        if (!saveButton) return;


        saveButton.onclick =
            async () => {

                const email =
                    emailInput
                        ?.value
                        .trim();


                const password =
                    passwordInput
                        ?.value;


                if (!email) {

                    alert(
                        "Ingresa un correo válido."
                    );

                    return;

                }


                if (
                    password &&
                    password.length < 12
                ) {

                    alert(
                        "La contraseña debe tener al menos 12 caracteres."
                    );

                    return;

                }


                saveButton.disabled =
                    true;


                saveButton.innerHTML = `

                <span
                    class="material-symbols-outlined"
                >

                    progress_activity

                </span>

                Guardando...

            `;


                try {

                    const data = {

                        email

                    };


                    if (
                        password &&
                        password.trim() !== ""
                    ) {

                        data.password =
                            password;

                    }


                    await ClientService.updateAppAccess(
                        client.clientId,
                        data
                    );


                    saveButton.innerHTML = `

                    <span
                        class="material-symbols-outlined"
                    >

                        check

                    </span>

                    Guardado

                `;


                    setTimeout(
                        () => {

                            saveButton.disabled =
                                false;


                            saveButton.innerHTML = `

                            <span
                                class="material-symbols-outlined"
                            >

                                save

                            </span>

                            Guardar cambios

                        `;

                        },
                        1500
                    );

                }

                catch (error) {

                    console.error(
                        error
                    );


                    alert(

                        error.message ||
                        "No fue posible guardar los cambios."

                    );


                    saveButton.disabled =
                        false;


                    saveButton.innerHTML = `

                    <span
                        class="material-symbols-outlined"
                    >

                        save

                    </span>

                    Guardar cambios

                `;

                }

            };

    }

    // ====================================================
    // VALIDATE APP PASSWORD
    // ====================================================

    isValidAppPassword(
        password
    ) {

        if (

            typeof password !==
            "string"

        ) {

            return false;

        }


        return (

            password.length >= 8 &&

            /[A-Z]/.test(
                password
            ) &&

            /[a-z]/.test(
                password
            ) &&

            /[0-9]/.test(
                password
            ) &&

            /[^A-Za-z0-9]/.test(
                password
            )

        );

    }
    // ====================================================
    // SEARCH
    // ====================================================

    initializeSearch() {

        const search =
            document.getElementById(
                "searchClient"
            );

        const results =
            document.getElementById(
                "results"
            );


        if (!search) return;


        search.oninput =
            async () => {

                const text =
                    search.value.trim();


                if (text === "") {

                    if (results) {

                        results.innerHTML = "";

                        results.style.display =
                            "none";

                    }

                    return;

                }


                try {

                    const clients =
                        await ClientService.search(
                            text
                        );


                    this.renderClientCards(
                        clients
                    );

                }

                catch (error) {

                    console.error(
                        error
                    );

                }

            };


        document.addEventListener(
            "click",
            event => {

                const searchWrapper =
                    document.querySelector(
                        ".client-search-wrapper"
                    );

                if (
                    !searchWrapper ||
                    searchWrapper.contains(
                        event.target
                    )
                ) {

                    return;

                }


                if (results) {

                    results.style.display =
                        "none";

                }

            }

        );

    }


    // ====================================================
    // RENDER SEARCH RESULTS
    // ====================================================

    renderClientCards(
        clients
    ) {

        const results =
            document.getElementById(
                "results"
            );

        if (!results) return;


        if (
            !clients ||
            clients.length === 0
        ) {

            results.innerHTML = `

                <div class="client-search-empty">

                    No se encontraron clientes.

                </div>

            `;


            results.style.display =
                "block";

            return;

        }


        results.innerHTML =
            clients
                .map(
                    client => `

                        <div
                            class="client-search-card"
                            data-client-id="${client.clientId}"
                        >

                            <div
                                class="client-search-avatar"
                            >

                                ${this.getInitials(
                        client.fullName
                    )}

                            </div>


                            <div
                                class="client-search-info"
                            >

                                <strong>

                                    ${this.escapeHtml(
                        client.fullName
                    )}

                                </strong>


                                <small>

                                    ${this.escapeHtml(
                        client.clientId
                    )}

                                </small>

                            </div>

                        </div>

                    `
                )
                .join(
                    ""
                );


        results.style.display =
            "block";


        results
            .querySelectorAll(
                ".client-search-card"
            )
            .forEach(
                card => {

                    card.onclick =
                        async () => {

                            const clientId =
                                card.dataset.clientId;


                            await this.selectClient(
                                clientId
                            );

                        };

                }
            );

    }


    // ====================================================
    // SELECT CLIENT
    // ====================================================

    async selectClient(
        clientId
    ) {

        try {

            const client =
                await ClientService.get(
                    clientId
                );


            this.selectedClient =
                client;


            const results =
                document.getElementById(
                    "results"
                );


            if (results) {

                results.innerHTML = "";

                results.style.display =
                    "none";

            }


            const search =
                document.getElementById(
                    "searchClient"
                );


            if (search) {

                search.value = "";

            }


            this.renderClientProfile(
                client
            );

        }

        catch (error) {

            console.error(
                error
            );

        }

    }


    // ====================================================
    // RENDER CLIENT PROFILE
    // ====================================================

    renderClientProfile(
        client
    ) {

        const profile =
            document.getElementById(
                "clientProfile"
            );

        if (!profile) return;


        const initials =
            this.getInitials(
                client.fullName
            );


        profile.innerHTML = `

            <div class="client-profile-page">

                <div class="client-profile-header">

                    <div class="client-avatar-section">

                        <div class="client-avatar">

                            ${initials}

                        </div>

                    </div>


                    <div class="client-profile-main">

                        <h2>

                            ${this.escapeHtml(
            client.fullName
        )}

                        </h2>


                        <span class="client-id">

                            ${this.escapeHtml(
            client.clientId
        )}

                        </span>


                        <span class="client-status">

                            ${this.getStatusLabel(
            client.membershipStatus
        )}

                        </span>


                        <div
                            class="client-profile-actions"
                        >

                            <button
                                class="fm-btn"
                                id="editClient"
                            >

                                <span
                                    class="material-symbols-outlined"
                                >

                                    edit

                                </span>

                                Editar cliente

                            </button>


                            <button
                                class="fm-btn fm-btn-primary"
                                id="renewMembership"
                            >

                                <span
                                    class="material-symbols-outlined"
                                >

                                    autorenew

                                </span>

                                Renovar membresía

                            </button>


                            <button
                                class="fm-btn"
                                id="clientApp"
                            >

                                <span
                                    class="material-symbols-outlined"
                                >

                                    smartphone

                                </span>

                                App

                            </button>


                            <button
                                class="fm-btn"
                                id="deleteClient"
                            >

                                <span
                                    class="material-symbols-outlined"
                                >

                                    delete

                                </span>

                                Eliminar cliente

                            </button>


                            <button
                                class="fm-btn"
                                id="registerAttendance"
                            >

                                <span
                                    class="material-symbols-outlined"
                                >

                                    check

                                </span>

                                Registrar asistencia

                            </button>

                        </div>

                    </div>

                </div>


                <div class="client-info-grid">

                    <div class="client-info-column">

                        ${this.infoItem(
            "Teléfono",
            client.phone
        )}

                        ${this.infoItem(
            "Precio",
            client.price
                ? `$${client.price}`
                : "-"
        )}

                        ${this.infoItem(
            "Inicio",
            this.formatDate(
                client.startDate
            )
        )}

                    </div>


                    <div class="client-info-column">

                        ${this.infoItem(
            "Correo",
            client.email
        )}

                        ${this.infoItem(
            "Clases del plan",
            client.membershipClasses ??
            "-"
        )}

                        ${this.infoItem(
            "Clases restantes",
            client.remainingClasses ??
            "-"
        )}

                        ${this.infoItem(
            "Vencimiento",
            this.formatDate(
                client.endDate
            )
        )}

                    </div>


                    <div class="client-info-column">

                        ${this.infoItem(
            "Estado",
            this.getStatusLabel(
                client.membershipStatus
            )
        )}

                        ${this.infoItem(
            "Contacto de emergencia",
            client.emergencyContactName
                ? `${client.emergencyContactName} ${client.emergencyContactPhone || ""}`
                : "-"
        )}

                        ${this.infoItem(
            "Notas médicas",
            client.medicalNotes
        )}

                    </div>

                </div>


                <div
                    class="client-reservation-history"
                >

                    <h3>

                        <span
                            class="material-symbols-outlined"
                        >

                            calendar_month

                        </span>

                        Historial de reservaciones

                    </h3>


                    <div
                        id="clientReservationHistory"
                    >

                        Cargando historial...

                    </div>

                </div>

            </div>

        `;


        this.initializeProfileButtons();

        this.loadReservationHistory(
            client.clientId
        );

    }


    // ====================================================
    // PROFILE BUTTONS
    // ====================================================

    initializeProfileButtons() {

        const editButton =
            document.getElementById(
                "editClient"
            );


        if (editButton) {

            editButton.onclick =
                () => {

                    if (
                        typeof loadNewClientForm ===
                        "function"
                    ) {

                        loadNewClientForm(
                            this.selectedClient
                        );

                    }

                };

        }


        const renewButton =
            document.getElementById(
                "renewMembership"
            );


        if (renewButton) {

            renewButton.onclick =
                () => {

                    this.openMemberships(
                        this.selectedClient
                    );

                };

        }


        const appButton =
            document.getElementById(
                "clientApp"
            );


        if (appButton) {

            appButton.onclick =
                async () => {

                    if (
                        !this.selectedClient ||
                        !this.selectedClient.clientId
                    ) {

                        return;

                    }


                    await this.openAppAccessModal(
                        this.selectedClient
                    );

                };

        }


        const deleteButton =
            document.getElementById(
                "deleteClient"
            );

        if (deleteButton) {

            deleteButton.onclick = async () => {

                await this.deleteSelectedClient();

            };

        }


        const attendanceButton =
            document.getElementById(
                "registerAttendance"
            );


        if (attendanceButton) {

            attendanceButton.onclick =
                () => {

                    this.openAttendance(
                        this.selectedClient
                    );

                };

        }

    }


    // ====================================================
    // APP ACCESS MODAL
    // ====================================================

    async openAppAccessModal(
        client
    ) {

        this.removeAppAccessModal();


        const overlay =
            document.createElement(
                "div"
            );


        overlay.className =
            "client-app-access-overlay";


        overlay.innerHTML = `

            <div
                class="client-app-access-modal"
                role="dialog"
                aria-modal="true"
            >

                <button
                    class="client-app-access-close"
                    type="button"
                    aria-label="Cerrar"
                >

                    <span
                        class="material-symbols-outlined"
                    >

                        close

                    </span>

                </button>


                <div
                    class="client-app-access-header"
                >

                    <div
                        class="client-app-access-icon"
                    >

                        <span
                            class="material-symbols-outlined"
                        >

                            smartphone

                        </span>

                    </div>


                    <div>

                        <h2>

                            Acceso a la App

                        </h2>


                        <p>

                            ${this.escapeHtml(
            client.fullName
        )}

                        </p>

                    </div>

                </div>


                <div
                    id="clientAppAccessContent"
                >

                    <div
                        class="app-access-loading"
                    >

                        <span
                            class="material-symbols-outlined"
                        >

                            progress_activity

                        </span>


                        <p>

                            Cargando acceso...

                        </p>

                    </div>

                </div>

            </div>

        `;


        document.body.appendChild(
            overlay
        );


        const closeButton =
            overlay.querySelector(
                ".client-app-access-close"
            );


        closeButton.onclick =
            () => {

                this.removeAppAccessModal();

            };


        overlay.addEventListener(
            "click",
            event => {

                if (
                    event.target === overlay
                ) {

                    this.removeAppAccessModal();

                }

            }
        );


        document.addEventListener(
            "keydown",
            this.handleAppAccessEscape
        );


        try {

            const access =
                await ClientService.getAppAccess(
                    client.clientId
                );


            this.renderAppAccessContent(
                client,
                access
            );

        }

        catch (error) {

            console.error(
                error
            );


            const content =
                document.getElementById(
                    "clientAppAccessContent"
                );


            if (content) {

                content.innerHTML = `

                    <div
                        class="client-app-access-empty"
                    >

                        <span
                            class="material-symbols-outlined"
                        >

                            error

                        </span>


                        <h3>

                            No fue posible cargar el acceso

                        </h3>


                        <p>

                            ${this.escapeHtml(
                    error.message ||
                    "Ocurrió un error."
                )}

                        </p>

                    </div>

                `;

            }

        }

    }


    // ====================================================
    // GENERATE SECURE PASSWORD
    // ====================================================

    generateSecurePassword() {

        const uppercase =
            "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

        const lowercase =
            "abcdefghijklmnopqrstuvwxyz";

        const numbers =
            "0123456789";

        const symbols =
            "!@#$%&*_-+=?";


        const all =
            uppercase +
            lowercase +
            numbers +
            symbols;


        const randomChar =
            characters => {

                const array =
                    new Uint32Array(
                        1
                    );


                crypto.getRandomValues(
                    array
                );


                return characters[
                    array[0] %
                    characters.length
                ];

            };


        const password = [

            randomChar(
                uppercase
            ),

            randomChar(
                lowercase
            ),

            randomChar(
                numbers
            ),

            randomChar(
                symbols
            )

        ];


        for (
            let index = password.length;
            index < 16;
            index++
        ) {

            password.push(

                randomChar(
                    all
                )

            );

        }


        for (
            let index = password.length - 1;
            index > 0;
            index--
        ) {

            const randomIndex =
                crypto.getRandomValues(
                    new Uint32Array(
                        1
                    )
                )[0] %
                (
                    index + 1
                );


            [
                password[index],
                password[randomIndex]
            ] = [

                    password[randomIndex],
                    password[index]

                ];

        }


        return password.join(
            ""
        );

    }

    // ====================================================
    // RENDER APP ACCESS CONTENT
    // ====================================================

    renderAppAccessContent(
        client,
        access
    ) {

        const content =
            document.getElementById(
                "clientAppAccessContent"
            );

        if (!content) return;


        if (
            !access ||
            access.hasAccess === false ||
            !access.user
        ) {

            content.innerHTML = `

            <div
                class="client-app-access-empty"
            >

                <span
                    class="material-symbols-outlined"
                >

                    smartphone

                </span>


                <h3>

                    Este cliente aún no tiene acceso

                </h3>


                <p>

                    Genera sus credenciales para que
                    pueda iniciar sesión en la aplicación.

                </p>

            </div>


            <button
                type="button"
                class="client-generate-app-access"
                id="generateClientAppAccess"
            >

                <span
                    class="material-symbols-outlined"
                >

                    person_add

                </span>

                Generar acceso

            </button>

        `;


            const generateButton =
                document.getElementById(
                    "generateClientAppAccess"
                );


            if (generateButton) {

                generateButton.onclick =
                    async () => {

                        generateButton.disabled =
                            true;


                        generateButton.innerHTML = `

                        <span
                            class="material-symbols-outlined"
                        >

                            progress_activity

                        </span>

                        Generando acceso...

                    `;


                        try {

                            const result =
                                await ClientService.generateAppAccess(
                                    client.clientId
                                );


                            this.renderGeneratedAppAccess(
                                client,
                                result
                            );

                        }

                        catch (error) {

                            console.error(
                                error
                            );


                            generateButton.disabled =
                                false;


                            generateButton.innerHTML = `

                            <span
                                class="material-symbols-outlined"
                            >

                                person_add

                            </span>

                            Reintentar

                        `;

                        }

                    };

            }


            return;

        }


        const user =
            access.user;


        content.innerHTML = `

        <div
            class="client-app-settings"
        >

            <div
                class="client-app-field"
            >

                <label>

                    Correo

                </label>


                <input
                    type="email"
                    id="clientAppEmail"
                    value="${this.escapeHtml(
            user.email || ""
        )}"
                    autocomplete="email"
                >

            </div>


            <div
                class="client-app-field"
            >

                <label>

                    Usuario

                </label>


                <input
                    type="text"
                    value="${this.escapeHtml(
            user.username ||
            user.email ||
            ""
        )}"
                    disabled
                >

            </div>


            <div
                class="client-app-field"
            >

                <div
                    class="client-app-password-label"
                >

                    <label>

                        Nueva contraseña

                    </label>


                    <button
                        type="button"
                        class="client-generate-password-btn"
                        id="generateSecurePassword"
                    >

                        <span
                            class="material-symbols-outlined"
                        >

                            refresh

                        </span>

                        Generar segura

                    </button>

                </div>


                <div
                    class="client-password-wrapper"
                >

                    <input
                        type="password"
                        id="clientAppPassword"
                        placeholder="Escribe o genera una contraseña"
                        autocomplete="new-password"
                    >


                    <button
                        type="button"
                        class="client-toggle-password"
                        id="toggleClientPassword"
                        aria-label="Mostrar contraseña"
                    >

                        <span
                            class="material-symbols-outlined"
                        >

                            visibility

                        </span>

                    </button>

                </div>


                <small>

                    Puedes escribir una contraseña manualmente
                    o generar una contraseña segura automáticamente.

                </small>

            </div>


            <button
                type="button"
                class="client-save-app-access"
                id="saveClientAppAccess"
            >

                <span
                    class="material-symbols-outlined"
                >

                    save

                </span>

                Guardar cambios

            </button>

        </div>


        <div
            class="client-app-access-active"
        >

            <span
                class="material-symbols-outlined"
            >

                check_circle

            </span>

            Acceso activo

        </div>


        <div
            class="app-qr-section"
        >

            <span>

                Código QR

            </span>


            <div
                class="app-qr-box"
                id="clientQrContainer"
            >

                Cargando QR...

            </div>

        </div>

    `;


        this.initializeAppAccessSettings(
            client
        );


        this.loadClientQr(
            client.clientId
        );

    }


    // ====================================================
    // RENDER GENERATED APP ACCESS
    // ====================================================

    renderGeneratedAppAccess(
        client,
        result
    ) {

        const content =
            document.getElementById(
                "clientAppAccessContent"
            );

        if (!content) return;


        const user =
            result.user ||
            result;


        const password =
            result.password ||
            result.temporaryPassword ||
            null;


        content.innerHTML = `

            <div
                class="client-app-credentials"
            >

                <div
                    class="client-app-credential"
                >

                    <span>

                        Correo

                    </span>


                    <strong>

                        ${this.escapeHtml(
            user.email || "-"
        )}

                    </strong>

                </div>


                <div
                    class="client-app-credential"
                >

                    <span>

                        Usuario

                    </span>


                    <strong>

                        ${this.escapeHtml(
            user.username ||
            user.email ||
            "-"
        )}

                    </strong>

                </div>


                ${password

                ? `

                            <div
                                class="client-app-credential"
                            >

                                <span>

                                    Contraseña temporal

                                </span>


                                <strong>

                                    ${this.escapeHtml(
                    password
                )}

                                </strong>

                            </div>

                        `

                : ""

            }

            </div>


            <div
                class="client-app-access-active"
            >

                <span
                    class="material-symbols-outlined"
                >

                    check_circle

                </span>

                Acceso generado correctamente

            </div>


            <div
                class="app-qr-section"
            >

                <span>

                    Código QR

                </span>


                <div
                    class="app-qr-box"
                    id="clientQrContainer"
                >

                    Cargando QR...

                </div>

            </div>

        `;


        this.loadClientQr(
            client.clientId
        );

    }


    // ====================================================
    // LOAD CLIENT QR
    // ====================================================

    async loadClientQr(
        clientId
    ) {

        const container =
            document.getElementById(
                "clientQrContainer"
            );

        if (!container) return;


        try {

            const response =
                await fetch(

                    `/clients/${encodeURIComponent(
                        clientId
                    )}/qr`

                );


            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(

                    data.message ||
                    "No fue posible generar el QR."

                );

            }


            const qr =
                data.qr ||
                data.qrCode ||
                data.qrDataUrl ||
                data.data;


            if (!qr) {

                throw new Error(
                    "El servidor no devolvió un código QR."
                );

            }


            container.innerHTML = `

                <img
                    src="${qr}"
                    alt="Código QR"
                >

            `;

        }

        catch (error) {

            console.error(
                error
            );


            container.innerHTML = `

                <div
                    class="client-search-empty"
                >

                    No fue posible cargar el QR.

                </div>

            `;

        }

    }


    // ====================================================
    // REMOVE APP ACCESS MODAL
    // ====================================================

    removeAppAccessModal() {

        const overlay =
            document.querySelector(
                ".client-app-access-overlay"
            );


        if (overlay) {

            overlay.remove();

        }


        document.removeEventListener(
            "keydown",
            this.handleAppAccessEscape
        );

    }


    handleAppAccessEscape =
        event => {

            if (
                event.key === "Escape"
            ) {

                this.removeAppAccessModal();

            }

        };

    // ====================================================
    // RESERVATION HISTORY
    // ====================================================

    async loadReservationHistory() {

        const container =
            document.querySelector(
                ".client-history-content"
            );


        if (!container) {

            return;

        }


        if (!this.selectedClient) {

            return;

        }


        container.innerHTML = `

        <div
            class="empty-state"
        >

            Cargando reservaciones...

        </div>

    `;


        try {

            const response =
                await fetch(

                    `/reservations/client/${encodeURIComponent(
                        this.selectedClient.clientId
                    )}`

                );


            if (!response.ok) {

                throw new Error(

                    "No fue posible obtener el historial."

                );

            }


            const reservations =
                await response.json();


            this.renderReservationHistory(
                reservations
            );

        }

        catch (error) {

            console.error(
                error
            );


            container.innerHTML = `

            <div
                class="empty-state"
            >

                No fue posible cargar el historial.

            </div>

        `;

        }

    }


    // ====================================================
    // RENDER RESERVATION HISTORY
    // ====================================================

    renderReservationHistory(
        reservations
    ) {

        const container =
            document.querySelector(
                ".client-history-content"
            );


        if (!container) {

            return;

        }


        // ====================================================
        // EMPTY
        // ====================================================

        if (

            !Array.isArray(
                reservations
            )

            ||

            reservations.length === 0

        ) {

            container.innerHTML = `

            <div
                class="empty-state"
            >

                No hay reservaciones registradas.

            </div>

        `;

            return;

        }


        container.innerHTML = `

        <div
            class="client-history-table"
        >

            <div
                class="client-history-table-header"
            >

                <span>
                    Fecha
                </span>

                <span>
                    Hora
                </span>

                <span>
                    Actividad
                </span>

                <span>
                    Estado
                </span>

                <span>
                    Acciones
                </span>

            </div>

        </div>

    `;


        const table =
            container.querySelector(
                ".client-history-table"
            );


        reservations.forEach(
            reservation => {

                const item =
                    document.createElement(
                        "div"
                    );


                item.className =
                    "client-history-row";


                const status =
                    this.getReservationStatus(
                        reservation.status
                    );


                // ============================================
                // SOLO SE PUEDE CANCELAR
                //
                // - Si está CONFIRMADA
                // - Si faltan 3 horas o más
                //
                // A las 2:59 ya NO se puede cancelar.
                // ============================================

                const canCancel =
                    this.canCancelReservation(
                        reservation
                    );


                item.innerHTML = `

                <span>

                    ${this.formatReservationDate(
                    reservation.reservationDate
                )}

                </span>


                <span>

                    ${this.formatReservationTime(
                    reservation.startTime
                )}

                </span>


                <strong>

                    ${reservation.activityName ||
                    "Clase"}

                </strong>


                <span
                    class="reservation-status"
                >

                    ${status}

                </span>


                <span>

                    ${canCancel

                        ? `

                            <button
                                type="button"
                                class="fm-btn reservation-cancel-btn"
                            >

                                Cancelar

                            </button>

                        `

                        : "-"

                    }

                </span>

            `;


                const cancelButton =
                    item.querySelector(
                        ".reservation-cancel-btn"
                    );


                if (cancelButton) {

                    cancelButton.onclick =
                        async () => {

                            await this.cancelReservation(
                                reservation
                            );

                        };

                }


                table.appendChild(
                    item
                );

            }

        );

    }


    // ====================================================
    // VALIDAR SI LA RESERVACIÓN PUEDE CANCELARSE
    //
    // Deben faltar mínimo 3 horas.
    //
    // Ejemplo:
    //
    // Clase: 18:00
    //
    // Se puede cancelar:
    // 15:00 o antes
    //
    // NO se puede cancelar:
    // 15:01 en adelante
    //
    // Por lo tanto:
    // 2:59 antes = NO
    // ====================================================

    canCancelReservation(
        reservation
    ) {

        if (

            !reservation

            ||

            reservation.status !==
            "CONFIRMED"

        ) {

            return false;

        }


        if (

            !reservation.reservationDate

            ||

            !reservation.startTime

        ) {

            return false;

        }


        const date =
            String(
                reservation.reservationDate
            )
                .split(
                    "T"
                )[0];


        const time =
            String(
                reservation.startTime
            )
                .slice(
                    0,
                    5
                );


        const classDateTime =
            new Date(
                `${date}T${time}:00`
            );


        if (

            Number.isNaN(
                classDateTime.getTime()
            )

        ) {

            return false;

        }


        const now =
            new Date();


        const difference =
            classDateTime.getTime()

            -

            now.getTime();


        const threeHours =
            3
            *
            60
            *
            60
            *
            1000;


        return (
            difference >=
            threeHours
        );

    }


    // ====================================================
    // CANCEL RESERVATION
    // ====================================================

    async cancelReservation(
        reservation
    ) {

        if (

            !reservation

            ||

            !reservation.reservationId

        ) {

            return;

        }


        // ====================================================
        // VALIDAR NUEVAMENTE
        //
        // Aunque el botón esté visible,
        // comprobamos otra vez antes de cancelar.
        // ====================================================

        if (

            !this.canCancelReservation(
                reservation
            )

        ) {

            alert(

                "Esta reservación ya no puede cancelarse. Deben faltar al menos 3 horas para el inicio de la clase."

            );

            return;

        }


        const confirmed =
            confirm(

                `¿Cancelar la reservación de "${reservation.activityName || "esta clase"}"?\n\n`

                +

                "La clase será devuelta a la clienta."

            );


        if (!confirmed) {

            return;

        }


        try {

            const response =
                await fetch(

                    `/reservations/${encodeURIComponent(
                        reservation.reservationId
                    )}`,

                    {

                        method:
                            "DELETE"

                    }

                );


            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(

                    data.message

                    ||

                    "No fue posible cancelar la reservación."

                );

            }


            alert(
                data.message
            );


            await this.loadClient(
                this.selectedClient.clientId
            );

        }

        catch (error) {

            alert(
                error.message
            );

        }

    }


    // ====================================================
    // RESERVATION STATUS
    // ====================================================

    getReservationStatus(
        status
    ) {

        const statuses = {

            CONFIRMED:
                "Confirmada",

            CANCELLED:
                "Cancelada",

            ATTENDED:
                "Asistió",

            NO_SHOW:
                "No asistió"

        };


        return statuses[
            status
        ]

            ||

            status

            ||

            "Sin estado";

    }

    // ====================================================
    // RENDER HISTORIAL DE RESERVACIONES
    // ====================================================

    renderReservationHistory(
        reservations
    ) {

        const container =
            document.querySelector(
                ".client-history-content"
            );


        if (!container) {

            return;

        }


        if (

            !Array.isArray(
                reservations
            )

            ||

            reservations.length === 0

        ) {

            container.innerHTML = `

            <div class="empty-state">

                No hay reservaciones registradas.

            </div>

        `;

            return;

        }


        container.innerHTML = `

        <div class="client-history-table">

            <div
                class="client-history-table-header"
            >

                <span>
                    Fecha
                </span>

                <span>
                    Hora
                </span>

                <span>
                    Actividad
                </span>

                <span>
                    Estado
                </span>

                <span>
                    Acciones
                </span>

            </div>

        </div>

    `;


        const table =
            container.querySelector(
                ".client-history-table"
            );


        reservations.forEach(
            reservation => {

                const item =
                    document.createElement(
                        "div"
                    );


                item.className =
                    "client-history-row";


                const status =
                    this.getReservationStatus(
                        reservation.status
                    );


                const canCancel =
                    this.canCancelReservation(
                        reservation
                    );


                item.innerHTML = `

                <span>

                    ${this.formatReservationDate(
                    reservation.reservationDate
                )}

                </span>

                <span>

                    ${this.formatReservationTime(
                    reservation.startTime
                )}

                </span>

                <strong>

                    ${reservation.activityName ||
                    "Clase"}

                </strong>

                <span
                    class="reservation-status"
                >

                    ${status}

                </span>

                <span>

                    ${canCancel

                        ? `

                            <button
                                type="button"
                                class="fm-btn reservation-cancel-btn"
                            >

                                Cancelar

                            </button>

                        `

                        : reservation.status === "CONFIRMED"

                            ? `

                                <small>

                                    Cancelación cerrada

                                </small>

                            `

                            : "-"

                    }

                </span>

            `;


                const cancelButton =
                    item.querySelector(
                        ".reservation-cancel-btn"
                    );


                if (cancelButton) {

                    cancelButton.onclick =
                        async () => {

                            await this.cancelReservation(
                                reservation
                            );

                        };

                }


                table.appendChild(
                    item
                );

            }
        );

    }


    // ====================================================
    // ELIMINAR CLIENTE
    // ====================================================

    async deleteSelectedClient() {

        const client = this.selectedClient;

        if (!client?.clientId) return;

        const confirmed = window.confirm(
            `¿Eliminar permanentemente a ${client.fullName || client.clientId}?\n\nSe eliminarán sus membresías, reservas, asistencias y acceso PWA. Esta acción no se puede deshacer.`
        );

        if (!confirmed) return;

        try {

            await ClientService.delete(client.clientId);

            this.selectedClient = null;

            const profile = document.getElementById("clientProfile");
            if (profile) {
                profile.innerHTML = `
                    <div class="empty-state">
                        <h2>Cliente eliminado</h2>
                        <p>El cliente fue eliminado correctamente.</p>
                    </div>
                `;
            }

            if (typeof this.refresh === "function") {
                await this.refresh();
            }

            window.alert("Cliente eliminado correctamente.");

        } catch (error) {

            console.error("Error eliminando cliente:", error);
            window.alert(
                error.message ||
                "No fue posible eliminar el cliente."
            );

        }

    }


    // ====================================================
    // OPEN MEMBERSHIPS
    // ====================================================

    openMemberships(
        client
    ) {

        if (!client) return;


        if (
            typeof ModuleFactory !==
            "undefined"
        ) {

            if (
                ModuleFactory.exists(
                    "memberships"
                )
            ) {

                ModuleFactory.open(
                    "memberships",
		    client
                );

            }

        }

    }


    // ====================================================
    // OPEN ATTENDANCE
    // ====================================================

    openAttendance(
        client
    ) {

        if (!client) return;


        if (
            typeof ModuleFactory !==
            "undefined"
        ) {

            if (
                ModuleFactory.exists(
                    "attendance"
                )
            ) {

                ModuleFactory.open(
                    "attendance"
                );

            }

        }

    }


    // ====================================================
    // CLEAR PROFILE
    // ====================================================

    clearProfile() {

        const profile =
            document.getElementById(
                "clientProfile"
            );

        if (!profile) return;


        profile.innerHTML = `

            <div
                class="client-empty-profile"
            >

                <span
                    class="material-symbols-outlined"
                >

                    person_search

                </span>


                <h2>

                    Busca un cliente

                </h2>


                <p>

                    Utiliza la barra de búsqueda para
                    encontrar y consultar un cliente.

                </p>

            </div>

        `;

    }


    // ====================================================
    // INFO ITEM
    // ====================================================

    infoItem(
        label,
        value
    ) {

        return `

            <div
                class="client-info-item"
            >

                <span
                    class="client-info-label"
                >

                    ${label}

                </span>


                <span>

                    ${this.escapeHtml(
            value ?? "-"
        )}

                </span>

            </div>

        `;

    }


    // ====================================================
    // INITIALS
    // ====================================================

    getInitials(
        name
    ) {

        if (!name) {

            return "--";

        }


        return name
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
                part =>
                    part.charAt(
                        0
                    )
                        .toUpperCase()
            )
            .join(
                ""
            );

    }


    // ====================================================
    // STATUS
    // ====================================================

    getStatusLabel(
        status
    ) {

        const labels = {

            ACTIVE:
                "Activo",

            Active:
                "Activo",

            active:
                "Activo",

            PENDING_ACTIVATION:
                "Pendiente de activación",

            PendingActivation:
                "Pendiente de activación",

            EXPIRED:
                "Vencida",

            Expired:
                "Vencida",

            FROZEN:
                "Congelada",

            Frozen:
                "Congelada",

            INACTIVE:
                "Inactiva"

        };


        return (
            labels[status] ||
            status ||
            "-"
        );

    }


    // ====================================================
    // DATE
    // ====================================================

    formatDate(
        date
    ) {

        if (!date) {

            return "-";

        }


        try {

            const parsed =
                new Date(
                    date
                );


            if (
                Number.isNaN(
                    parsed.getTime()
                )
            ) {

                return date;

            }


            return parsed
                .toLocaleDateString(
                    "es-MX"
                );

        }

        catch {

            return date;

        }

    }


    // ====================================================
    // ESCAPE HTML
    // ====================================================

    escapeHtml(
        value
    ) {

        if (
            value === null ||
            value === undefined
        ) {

            return "-";

        }


        return String(
            value
        )

            .replace(
                /&/g,
                "&amp;"
            )

            .replace(
                /</g,
                "&lt;"
            )

            .replace(
                />/g,
                "&gt;"
            )

            .replace(
                /"/g,
                "&quot;"
            )

            .replace(
                /'/g,
                "&#039;"
            );

    }

}


// ====================================================
// REGISTER MODULE
// ====================================================

ModuleFactory.register(
    "clients",
    new ClientModule()
);
