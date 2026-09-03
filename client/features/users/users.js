/*
====================================================

    FLOWMANAGER

    USERS MODULE

====================================================
*/

class UsersModule extends Module {

    constructor() {

        super(
            "Usuarios"
        );

        this.createdCredentials =
            null;

        this.editingUserId =
            null;

        this.selectedUser =
            null;

    }


    // ====================================================
    // ABRIR
    // ====================================================

    async open() {

        await FeatureManager.render(
            "users/users"
        );

        this.loadStyles();

        this.initializeForm();

        await this.refresh();

    }


    // ====================================================
    // CSS
    // ====================================================

    loadStyles() {

        if (
            document.getElementById(
                "usersStyles"
            )
        ) {

            return;

        }

        const link =
            document.createElement(
                "link"
            );

        link.id =
            "usersStyles";

        link.rel =
            "stylesheet";

        link.href =
            "features/users/users.css";

        document.head.appendChild(
            link
        );

    }


    // ====================================================
    // FORMULARIO
    // ====================================================

    initializeForm() {

        const button =
            document.getElementById(
                "newUserButton"
            );

        const formContainer =
            document.getElementById(
                "userFormContainer"
            );

        const cancel =
            document.getElementById(
                "cancelUser"
            );

        const form =
            document.getElementById(
                "userForm"
            );

        const password =
            document.getElementById(
                "userPassword"
            );

        const togglePassword =
            document.getElementById(
                "toggleUserPassword"
            );

        const copyCredentials =
            document.getElementById(
                "copyCredentials"
            );

        const sendCredentialsEmail =
            document.getElementById(
                "sendCredentialsEmail"
            );


        if (

            !button
            ||
            !formContainer
            ||
            !cancel
            ||
            !form
            ||
            !password
            ||
            !togglePassword

        ) {

            console.error(
                "❌ UsersModule: no se encontró el formulario."
            );

            return;

        }


        // =================================================
        // NUEVO USUARIO
        // =================================================

        button.onclick =
            () => {

                this.selectedUser =
                    null;

                this.resetUserForm();

                formContainer.hidden =
                    false;

                button.style.display =
                    "none";

            };


        // =================================================
        // CANCELAR
        // =================================================

        cancel.onclick =
            () => {

                this.resetUserForm();

            };


        // =================================================
        // PASSWORD
        // =================================================

        togglePassword.onclick =
            () => {

                const visible =
                    password.type ===
                    "text";

                password.type =
                    visible
                        ? "password"
                        : "text";

                togglePassword.textContent =
                    visible
                        ? "👁"
                        : "🙈";

                togglePassword.setAttribute(

                    "aria-label",

                    visible
                        ? "Mostrar contraseña"
                        : "Ocultar contraseña"

                );

            };


        // =================================================
        // SUBMIT
        // =================================================

        form.addEventListener(

            "submit",

            event => {

                event.preventDefault();

                if (
                    this.editingUserId
                ) {

                    this.updateUser();

                    return;

                }

                this.createUser();

            }

        );


        // =================================================
        // COPIAR
        // =================================================

        if (
            copyCredentials
        ) {

            copyCredentials.onclick =
                () => {

                    this.copyCredentials();

                };

        }


        // =================================================
        // EMAIL
        // =================================================

        if (
            sendCredentialsEmail
        ) {

            sendCredentialsEmail.onclick =
                () => {

                    this.sendCredentialsByEmail();

                };

        }

    }


    // ====================================================
    // EDITAR
    // ====================================================

    startEdit(
        user
    ) {

        const formContainer =
            document.getElementById(
                "userFormContainer"
            );

        const newUserButton =
            document.getElementById(
                "newUserButton"
            );

        const form =
            document.getElementById(
                "userForm"
            );

        const password =
            document.getElementById(
                "userPassword"
            );

        const submitButton =
            form?.querySelector(
                'button[type="submit"]'
            );

        if (

            !formContainer
            ||
            !newUserButton
            ||
            !form
            ||
            !password
            ||
            !submitButton

        ) {

            return;

        }


        this.hideCredentials();

        this.editingUserId =
            user.userId;


        document.getElementById(
            "userFullName"
        ).value =
            user.fullName || "";


        document.getElementById(
            "userEmail"
        ).value =
            user.email || "";


        document.getElementById(
            "userRole"
        ).value =
            user.role || "";


        password.value =
            "";

        password.type =
            "password";

        password.required =
            false;

        password.removeAttribute(
            "minlength"
        );


        const togglePassword =
            document.getElementById(
                "toggleUserPassword"
            );

        if (
            togglePassword
        ) {

            togglePassword.textContent =
                "👁";

            togglePassword.setAttribute(
                "aria-label",
                "Mostrar contraseña"
            );

        }


        const passwordGroup =
            password.closest(
                ".fm-group"
            );

        const passwordLabel =
            passwordGroup?.querySelector(
                "label"
            );

        const passwordHelp =
            passwordGroup?.querySelector(
                "small"
            );


        if (
            passwordLabel
        ) {

            passwordLabel.textContent =
                "Nueva contraseña (opcional)";

        }


        if (
            passwordHelp
        ) {

            passwordHelp.textContent =
                "Déjala vacía para conservar la contraseña actual.";

        }


        submitButton.textContent =
            "Guardar cambios";


        formContainer.hidden =
            false;

        newUserButton.style.display =
            "none";


        formContainer.scrollIntoView({

            behavior:
                "smooth",

            block:
                "start"

        });

    }


    // ====================================================
    // CREAR
    // ====================================================

    async createUser() {

        const errorContainer =
            document.getElementById(
                "userFormError"
            );

        if (
            !errorContainer
        ) {

            return;

        }


        errorContainer.hidden =
            true;


        const fullName =
            document.getElementById(
                "userFullName"
            )
                .value
                .trim();


        const email =
            document.getElementById(
                "userEmail"
            )
                .value
                .trim();


        const password =
            document.getElementById(
                "userPassword"
            )
                .value;


        const role =
            document.getElementById(
                "userRole"
            )
                .value;


        if (
            !fullName
        ) {

            errorContainer.textContent =
                "El nombre completo es obligatorio.";

            errorContainer.hidden =
                false;

            return;

        }


        if (
            !email
        ) {

            errorContainer.textContent =
                "El correo es obligatorio.";

            errorContainer.hidden =
                false;

            return;

        }


        if (
            !role
        ) {

            errorContainer.textContent =
                "Selecciona un tipo de usuario.";

            errorContainer.hidden =
                false;

            return;

        }


        if (
            password.length < 8
        ) {

            errorContainer.textContent =
                "La contraseña debe tener mínimo 8 caracteres.";

            errorContainer.hidden =
                false;

            return;

        }


        /*
        ====================================================
        IMPORTANTE

        NO enviamos coachId.

        Cuando role === "coach", el backend crea o detecta
        automáticamente el perfil de coach.
        ====================================================
        */

        const data = {

            fullName,

            email,

            password,

            role

        };


        try {

            const response =
                await UserService.create(
                    data
                );


            this.createdCredentials = {

                fullName,

                email,

                password

            };


            this.resetUserForm(
                false
            );


            this.showCredentials();

            await this.refresh();


            console.log(
                "Usuario creado:",
                response
            );

        }

        catch (
        error
        ) {

            console.error(
                error
            );


            errorContainer.textContent =
                error.message;

            errorContainer.hidden =
                false;

        }

    }


    // ====================================================
    // ACTUALIZAR
    // ====================================================

    async updateUser() {

        const errorContainer =
            document.getElementById(
                "userFormError"
            );

        if (
            !errorContainer
        ) {

            return;

        }


        errorContainer.hidden =
            true;


        const fullName =
            document.getElementById(
                "userFullName"
            )
                .value
                .trim();


        const email =
            document.getElementById(
                "userEmail"
            )
                .value
                .trim();


        const password =
            document.getElementById(
                "userPassword"
            )
                .value;


        const role =
            document.getElementById(
                "userRole"
            )
                .value;


        if (
            !fullName
        ) {

            errorContainer.textContent =
                "El nombre completo es obligatorio.";

            errorContainer.hidden =
                false;

            return;

        }


        if (
            !email
        ) {

            errorContainer.textContent =
                "El correo es obligatorio.";

            errorContainer.hidden =
                false;

            return;

        }


        if (
            !role
        ) {

            errorContainer.textContent =
                "Selecciona un tipo de usuario.";

            errorContainer.hidden =
                false;

            return;

        }


        if (

            password
            &&
            password.length < 8

        ) {

            errorContainer.textContent =
                "La nueva contraseña debe tener mínimo 8 caracteres.";

            errorContainer.hidden =
                false;

            return;

        }


        /*
        ====================================================
        NO enviamos coachId.

        El servidor resuelve automáticamente la ficha
        del coach cuando corresponde.
        ====================================================
        */

        const data = {

            fullName,

            email,

            role

        };


        if (
            password
        ) {

            data.password =
                password;

        }


        try {

            await UserService.update(

                this.editingUserId,

                data

            );


            this.resetUserForm();

            await this.refresh();

        }

        catch (
        error
        ) {

            console.error(
                error
            );


            errorContainer.textContent =
                error.message;

            errorContainer.hidden =
                false;

        }

    }


    // ====================================================
    // RESET
    // ====================================================

    resetUserForm(
        hideCredentials = true
    ) {

        const form =
            document.getElementById(
                "userForm"
            );

        const formContainer =
            document.getElementById(
                "userFormContainer"
            );

        const newUserButton =
            document.getElementById(
                "newUserButton"
            );

        const password =
            document.getElementById(
                "userPassword"
            );

        const errorContainer =
            document.getElementById(
                "userFormError"
            );


        if (
            hideCredentials
        ) {

            this.hideCredentials();

        }


        if (
            form
        ) {

            form.reset();

        }


        this.editingUserId =
            null;


        if (
            password
        ) {

            password.required =
                true;

            password.minLength =
                8;

            password.type =
                "password";


            const togglePassword =
                document.getElementById(
                    "toggleUserPassword"
                );


            if (
                togglePassword
            ) {

                togglePassword.textContent =
                    "👁";

                togglePassword.setAttribute(
                    "aria-label",
                    "Mostrar contraseña"
                );

            }


            const passwordGroup =
                password.closest(
                    ".fm-group"
                );


            const passwordLabel =
                passwordGroup?.querySelector(
                    "label"
                );


            const passwordHelp =
                passwordGroup?.querySelector(
                    "small"
                );


            if (
                passwordLabel
            ) {

                passwordLabel.textContent =
                    "Contraseña";

            }


            if (
                passwordHelp
            ) {

                passwordHelp.textContent =
                    "Mínimo 8 caracteres.";

            }

        }


        const submitButton =
            form?.querySelector(
                'button[type="submit"]'
            );


        if (
            submitButton
        ) {

            submitButton.textContent =
                "Crear usuario";

        }


        if (
            errorContainer
        ) {

            errorContainer.hidden =
                true;

            errorContainer.textContent =
                "";

        }


        if (
            formContainer
        ) {

            formContainer.hidden =
                true;

        }


        if (
            newUserButton
        ) {

            newUserButton.style.display =
                "";

        }

    }


    // ====================================================
    // CREDENCIALES
    // ====================================================

    showCredentials() {

        if (
            !this.createdCredentials
        ) {

            return;

        }


        const container =
            document.getElementById(
                "userCredentials"
            );

        const email =
            document.getElementById(
                "createdUserEmail"
            );

        const password =
            document.getElementById(
                "createdUserPassword"
            );


        if (

            !container
            ||
            !email
            ||
            !password

        ) {

            return;

        }


        email.textContent =
            this.createdCredentials.email;

        password.textContent =
            this.createdCredentials.password;

        container.hidden =
            false;


        container.scrollIntoView({

            behavior:
                "smooth",

            block:
                "nearest"

        });

    }


    hideCredentials() {

        const container =
            document.getElementById(
                "userCredentials"
            );


        if (
            container
        ) {

            container.hidden =
                true;

        }


        this.createdCredentials =
            null;

    }


    async copyCredentials() {

        if (
            !this.createdCredentials
        ) {

            return;

        }


        const text =
            `FlowManager

Usuario: ${this.createdCredentials.email}
Contraseña: ${this.createdCredentials.password}`;


        try {

            await navigator.clipboard.writeText(
                text
            );


            const button =
                document.getElementById(
                    "copyCredentials"
                );


            if (
                button
            ) {

                const original =
                    button.textContent;


                button.textContent =
                    "✓ Credenciales copiadas";


                setTimeout(

                    () => {

                        button.textContent =
                            original;

                    },

                    2000

                );

            }

        }

        catch (
        error
        ) {

            console.error(
                error
            );

            alert(
                "No fue posible copiar las credenciales."
            );

        }

    }


    sendCredentialsByEmail() {

        if (
            !this.createdCredentials
        ) {

            return;

        }


        const {

            fullName,

            email,

            password

        } =
            this.createdCredentials;


        const subject =
            encodeURIComponent(
                "Tus credenciales de FlowManager"
            );


        const body =
            encodeURIComponent(

                `Hola ${fullName},

Tu cuenta de FlowManager ha sido creada.

Usuario:
${email}

Contraseña:
${password}

Puedes ingresar con estas credenciales.

Saludos.`

            );


        const mailto =
            `mailto:${encodeURIComponent(
                email
            )}?subject=${subject}&body=${body}`;


        window.open(
            mailto,
            "_blank"
        );

    }


    // ====================================================
    // REFRESH
    // ====================================================

    async refresh() {

        const container =
            document.getElementById(
                "usersList"
            );


        if (
            !container
        ) {

            return;

        }


        container.innerHTML = `

            <div class="fm-state">

                Cargando usuarios...

            </div>

        `;


        try {

            const users =
                await UserService.getAll();


            this.renderUsers(
                users
            );

        }

        catch (
        error
        ) {

            console.error(
                error
            );


            container.innerHTML = `

                <div class="fm-state">

                    ${this.escapeHtml(
                error.message
            )}

                </div>

            `;

        }

    }


    // ====================================================
    // RENDER USUARIOS
    // ====================================================

    renderUsers(
        users
    ) {

        const container =
            document.getElementById(
                "usersList"
            );


        if (
            !container
        ) {

            return;

        }


        container.innerHTML =
            "";


        if (

            !Array.isArray(
                users
            )

            ||

            !users.length

        ) {

            container.innerHTML = `

                <div class="fm-state">

                    No hay usuarios registrados.

                </div>

            `;

            return;

        }


        users.forEach(

            user => {

                const card =
                    document.createElement(
                        "button"
                    );


                card.type =
                    "button";


                card.className =
                    "fm-user-card";


                const role =
                    this.getRoleName(
                        user.role
                    );


                const initials =
                    this.getInitials(
                        user.fullName
                    );


                card.innerHTML = `

                    <div class="fm-user-card-avatar">

                        ${user.photoUrl

                        ?

                        `

                                    <img
                                        src="${this.escapeHtml(
                            user.photoUrl
                        )}"
                                        alt="${this.escapeHtml(
                            user.fullName
                        )}"
                                    >

                                `

                        :

                        `

                                    <span>

                                        ${this.escapeHtml(
                            initials
                        )}

                                    </span>

                                `
                    }

                    </div>


                    <div class="fm-user-info">

                        <strong>

                            ${this.escapeHtml(
                        user.fullName
                    )}

                        </strong>


                        <span>

                            ${this.escapeHtml(
                        user.email || "-"
                    )}

                        </span>


                        <small>

                            ${this.escapeHtml(
                        role
                    )}

                            ·

                            ${Number(
                        user.isActive
                    ) === 1

                        ? "Activo"

                        : "Inactivo"
                    }

                        </small>

                    </div>


                    <div class="fm-user-card-arrow">

                        ›

                    </div>

                `;


                card.onclick =
                    () => {

                        this.openUserDetails(
                            user
                        );

                    };


                container.appendChild(
                    card
                );

            }

        );

    }


    // ====================================================
    // DETALLE
    // ====================================================

    openUserDetails(
        user
    ) {

        this.selectedUser =
            user;


        const container =
            document.getElementById(
                "usersList"
            );


        const pageHeader =
            document.querySelector(
                ".fm-page-header"
            );


        const formContainer =
            document.getElementById(
                "userFormContainer"
            );


        const credentials =
            document.getElementById(
                "userCredentials"
            );


        if (
            !container
        ) {

            return;

        }


        if (
            pageHeader
        ) {

            pageHeader.hidden =
                true;

        }


        if (
            formContainer
        ) {

            formContainer.hidden =
                true;

        }


        if (
            credentials
        ) {

            credentials.hidden =
                true;

        }


        const role =
            this.getRoleName(
                user.role
            );


        const initials =
            this.getInitials(
                user.fullName
            );


        container.innerHTML = `

            <div class="fm-user-detail">

                <div class="fm-user-detail-header">

                    <button
                        type="button"
                        class="fm-btn"
                        data-action="back"
                    >

                        ← Volver

                    </button>

                </div>


                <div class="fm-user-profile">

                    <div class="fm-user-profile-avatar">

                        ${user.photoUrl

                ?

                `

                                    <img
                                        src="${this.escapeHtml(
                    user.photoUrl
                )}"
                                        alt="${this.escapeHtml(
                    user.fullName
                )}"
                                    >

                                `

                :

                `

                                    <span>

                                        ${this.escapeHtml(
                    initials
                )}

                                    </span>

                                `
            }

                    </div>


                    <div class="fm-user-profile-main">

                        <h2>

                            ${this.escapeHtml(
                user.fullName
            )}

                        </h2>


                        <span class="fm-user-id">

                            ${this.escapeHtml(
                user.userId
            )}

                        </span>


                        <span class="fm-status-badge">

                            ${Number(
                user.isActive
            ) === 1

                ? "Activo"

                : "Inactivo"
            }

                        </span>


                        <div class="fm-user-detail-actions">

                            <button
                                type="button"
                                class="fm-btn"
                                data-action="edit"
                            >

                                ✎ Editar usuario

                            </button>


                            <button
                                type="button"
                                class="fm-btn fm-btn-primary"
                                data-action="app"
                            >

                                📱 Tarjeta digital

                            </button>


                            ${Number(
                user.isRoot
            ) === 1

                ?

                `

                                        <span class="fm-root-badge">

                                            ROOT

                                        </span>

                                    `

                :

                Number(
                    user.isActive
                ) === 1

                    ?

                    `

                                            <button
                                                type="button"
                                                class="fm-btn fm-btn-danger"
                                                data-action="deactivate"
                                            >

                                                Desactivar

                                            </button>

                                        `

                    :

                    `

                                            <button
                                                type="button"
                                                class="fm-btn"
                                                data-action="activate"
                                            >

                                                Activar

                                            </button>

                                        `
            }

                        </div>

                    </div>

                </div>


                <div class="fm-user-detail-grid">

                    <div class="fm-user-detail-item">

                        <strong>
                            Correo
                        </strong>

                        <span>

                            ${this.escapeHtml(
                user.email || "-"
            )}

                        </span>

                    </div>


                    <div class="fm-user-detail-item">

                        <strong>
                            Tipo de usuario
                        </strong>

                        <span>

                            ${this.escapeHtml(
                role
            )}

                        </span>

                    </div>


                    <div class="fm-user-detail-item">

                        <strong>
                            Estado
                        </strong>

                        <span>

                            ${Number(
                user.isActive
            ) === 1
                ? "Activo"
                : "Inactivo"
            }

                        </span>

                    </div>


                    <div class="fm-user-detail-item">

                        <strong>
                            Último acceso
                        </strong>

                        <span>

                            ${this.formatDate(
                user.lastLoginAt
            )}

                        </span>

                    </div>


                    ${String(
                user.role || ""
            ).toLowerCase()
                ===
                "coach"

                ?

                `

                                <div class="fm-user-detail-item">

                                    <strong>
                                        Coach
                                    </strong>

                                    <span>

                                        Perfil de Coach activo

                                    </span>

                                </div>

                            `

                :

                ""
            }

                </div>

            </div>

        `;


        const backButton =
            container.querySelector(
                '[data-action="back"]'
            );

        const editButton =
            container.querySelector(
                '[data-action="edit"]'
            );

        const appButton =
            container.querySelector(
                '[data-action="app"]'
            );

        const deactivateButton =
            container.querySelector(
                '[data-action="deactivate"]'
            );

        const activateButton =
            container.querySelector(
                '[data-action="activate"]'
            );


        if (
            backButton
        ) {

            backButton.onclick =
                () => {

                    this.closeUserDetails();

                };

        }


        if (
            editButton
        ) {

            editButton.onclick =
                () => {

                    this.closeUserDetails(
                        false
                    );

                    this.startEdit(
                        user
                    );

                };

        }


        if (
            appButton
        ) {

            appButton.onclick =
                () => {

                    this.openUserApp(
                        user
                    );

                };

        }


        if (
            deactivateButton
        ) {

            deactivateButton.onclick =
                async () => {

                    await this.changeStatus(

                        "deactivate",

                        user.userId

                    );


                    await this.refresh();

                };

        }


        if (
            activateButton
        ) {

            activateButton.onclick =
                async () => {

                    await this.changeStatus(

                        "activate",

                        user.userId

                    );


                    await this.refresh();

                };

        }

    }


    // ====================================================
    // CERRAR DETALLE
    // ====================================================

    async closeUserDetails(
        refresh = true
    ) {

        this.selectedUser =
            null;


        const pageHeader =
            document.querySelector(
                ".fm-page-header"
            );


        if (
            pageHeader
        ) {

            pageHeader.hidden =
                false;

        }


        if (
            refresh
        ) {

            await this.refresh();

        }

    }


    // ====================================================
    // TARJETA DIGITAL
    // ====================================================

    openUserApp(
        user
    ) {

        const container =
            document.getElementById(
                "usersList"
            );


        if (
            !container
        ) {

            return;

        }


        const initials =
            this.getInitials(
                user.fullName
            );


        const role =
            this.getRoleName(
                user.role
            );


        const qrValue =
            JSON.stringify({

                version:
                    1,

                type:
                    "flowmanager-user",

                userId:
                    user.userId

            });


        container.innerHTML = `

            <div class="fm-digital-card-page">

                <div class="fm-digital-card-header">

                    <div>

                        <h2>
                            Tarjeta digital
                        </h2>

                        <p>
                            Credencial digital del usuario para FlowManager.
                        </p>

                    </div>


                    <button
                        type="button"
                        class="fm-btn"
                        data-action="back-to-user"
                    >

                        ← Volver al usuario

                    </button>

                </div>


                <div class="fm-digital-card-layout">


                    <div class="fm-digital-card">

                        <div class="fm-digital-card-content">


                            <div class="fm-digital-card-brand">

                                <strong>
                                    Aura Access
                                </strong>

                                <span>
                                    DIGITAL ID
                                </span>

                            </div>


                            <div class="fm-digital-card-profile">

                                <div class="fm-digital-card-avatar">

                                    ${user.photoUrl

                ?

                `

                                                <img
                                                    src="${this.escapeHtml(
                    user.photoUrl
                )}"
                                                    alt="${this.escapeHtml(
                    user.fullName
                )}"
                                                >

                                            `

                :

                `

                                                <span>

                                                    ${this.escapeHtml(
                    initials
                )}

                                                </span>

                                            `
            }

                                </div>


                                <div class="fm-digital-card-name">

                                    ${this.escapeHtml(
                user.fullName
            )}

                                </div>


                                <div class="fm-digital-card-role">

                                    ${this.escapeHtml(
                role
            )}

                                </div>


                                <div class="fm-digital-card-id">

                                    ${this.escapeHtml(
                user.userId
            )}

                                </div>

                            </div>


                            <div
                                id="digitalUserQr"
                                class="fm-digital-card-qr"
                            ></div>


                            <div class="fm-digital-card-footer">

                                <span>
                                    FlowManager · Identificación digital
                                </span>


                                <div class="fm-digital-card-status">

                                    ${Number(
                user.isActive
            ) === 1

                ? "Activo"

                : "Inactivo"
            }

                                </div>

                            </div>

                        </div>

                    </div>


                    <div class="fm-digital-card-info">

                        <div class="fm-digital-card-info-panel">

                            <h3>
                                Información de la tarjeta
                            </h3>


                            <p>
                                Esta credencial identifica al usuario dentro
                                del ecosistema de FlowManager.
                            </p>


                            <div class="fm-digital-card-user-data">

                                <div>

                                    <strong>
                                        Nombre
                                    </strong>

                                    <span>

                                        ${this.escapeHtml(
                user.fullName
            )}

                                    </span>

                                </div>


                                <div>

                                    <strong>
                                        Correo
                                    </strong>

                                    <span>

                                        ${this.escapeHtml(
                user.email || "-"
            )}

                                    </span>

                                </div>


                                <div>

                                    <strong>
                                        Tipo de usuario
                                    </strong>

                                    <span>

                                        ${this.escapeHtml(
                role
            )}

                                    </span>

                                </div>


                                <div>

                                    <strong>
                                        ID
                                    </strong>

                                    <span>

                                        ${this.escapeHtml(
                user.userId
            )}

                                    </span>

                                </div>

                            </div>

                        </div>


                        <div class="fm-digital-card-info-panel">

                            <h3>
                                Código QR
                            </h3>

                            <p>
                                El código QR contiene el identificador único
                                de esta cuenta.
                            </p>

                        </div>

                    </div>

                </div>

            </div>

        `;


        const backButton =
            container.querySelector(
                '[data-action="back-to-user"]'
            );


        if (
            backButton
        ) {

            backButton.onclick =
                () => {

                    this.openUserDetails(
                        user
                    );

                };

        }


        this.renderUserQr(
            qrValue
        );

    }


    // ====================================================
    // QR
    // ====================================================

    renderUserQr(
        value
    ) {

        const container =
            document.getElementById(
                "digitalUserQr"
            );


        if (
            !container
        ) {

            return;

        }


        container.innerHTML =
            "";


        if (
            typeof QRCode ===
            "undefined"
        ) {

            container.innerHTML = `

                <div class="fm-qr-error">

                    No fue posible generar el código QR.

                </div>

            `;

            return;

        }


        try {

            new QRCode(

                container,

                {

                    text:
                        value,

                    width:
                        160,

                    height:
                        160,

                    colorDark:
                        "#1d1d1f",

                    colorLight:
                        "#ffffff",

                    correctLevel:
                        QRCode.CorrectLevel.H

                }

            );

        }

        catch (
        error
        ) {

            console.error(
                "❌ Error generando QR:",
                error
            );

        }

    }


    // ====================================================
    // ESTADO
    // ====================================================

    async changeStatus(
        action,
        userId
    ) {

        try {

            if (
                action === "deactivate"
            ) {

                const confirmed =
                    confirm(
                        "¿Deseas desactivar este usuario?"
                    );


                if (
                    !confirmed
                ) {

                    return;

                }


                await UserService.deactivate(
                    userId
                );

            }

            else {

                await UserService.activate(
                    userId
                );

            }


            await this.refresh();

        }

        catch (
        error
        ) {

            console.error(
                error
            );


            alert(
                error.message
            );

        }

    }


    // ====================================================
    // INICIALES
    // ====================================================

    getInitials(
        fullName
    ) {

        if (
            !fullName
        ) {

            return "U";

        }


        return String(
            fullName
        )
            .trim()
            .split(
                /\s+/
            )
            .slice(
                0,
                2
            )
            .map(
                name =>
                    name
                        .charAt(
                            0
                        )
                        .toUpperCase()
            )
            .join("");

    }


    // ====================================================
    // FECHA
    // ====================================================

    formatDate(
        date
    ) {

        if (
            !date
        ) {

            return "-";

        }


        const parsed =
            new Date(
                date
            );


        if (
            Number.isNaN(
                parsed.getTime()
            )
        ) {

            return "-";

        }


        return parsed.toLocaleString(

            "es-MX",

            {

                dateStyle:
                    "medium",

                timeStyle:
                    "short"

            }

        );

    }


    // ====================================================
    // ROL
    // ====================================================

    getRoleName(
        role
    ) {

        return {

            manager:
                "Gerente",

            coach:
                "Coach",

            reception:
                "Recepción",

            accountant:
                "Contador",

            client:
                "Cliente"

        }[
            role
        ]
            ||
            role;

    }


    // ====================================================
    // ESCAPE HTML
    // ====================================================

    escapeHtml(
        value
    ) {

        return String(
            value ?? ""
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
// INSTANCIA
// ====================================================

window.UsersModule =
    new UsersModule();


// ====================================================
// REGISTRO
// ====================================================

ModuleFactory.register(

    "users",

    window.UsersModule

);