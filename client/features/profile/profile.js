/*
====================================================

    FLOWMANAGER

    PROFILE MODULE

====================================================
*/

class ProfileModule extends Module {


    // ====================================================
    // CONSTRUCTOR
    // ====================================================

    constructor() {

        super(
            "Mi perfil"
        );


        this.user =
            null;


        this.client =
            null;


        this.coach =
            null;


        this.coachCardModal =
            null;

    }


    // ====================================================
    // OPEN
    // ====================================================

    async open() {

        await this.load(
            "profile/profile"
        );


        await this.initialize();

    }


    // ====================================================
    // INITIALIZE
    // ====================================================

    async initialize() {

        this.user =
            AuthService.getUser();


        if (
            !this.user
        ) {

            throw new Error(
                "No hay una sesión activa."
            );

        }


        const container =
            document.getElementById(
                "profileCard"
            );


        if (
            container
        ) {

            container.innerHTML = `

                <div class="fm-profile-loading">

                    Cargando información...

                </div>

            `;

        }


        // =============================================
        // CLIENTE
        // =============================================

        if (
            this.isClient()
        ) {

            if (
                !this.user.clientId
            ) {

                throw new Error(
                    "Este usuario no tiene un cliente asociado."
                );

            }


            await this.loadClient();

        }


        // =============================================
        // COACH
        // =============================================

        if (
            this.isCoach()
        ) {

            await this.loadCoach();

        }


        this.renderProfile();

    }


    // ====================================================
    // IS CLIENT
    // ====================================================

    isClient() {

        const role =
            String(
                this.user?.role || ""
            )
                .trim()
                .toLowerCase();


        return (

            role === "client"

            ||

            role === "clienta"

            ||

            role === "cliente"

        );

    }


    // ====================================================
    // IS COACH
    // ====================================================

    isCoach() {

        const role =
            String(
                this.user?.role || ""
            )
                .trim()
                .toLowerCase();


        return (
            role === "coach"
        );

    }


    // ====================================================
    // LOAD CLIENT
    // ====================================================

    async loadClient() {

        try {

            this.client =
                await ClientService.get(
                    this.user.clientId
                );


            if (
                !this.client
            ) {

                throw new Error(
                    "Cliente no encontrado."
                );

            }

        }

        catch (
        error
        ) {

            console.error(
                "Error al cargar perfil de cliente:",
                error
            );


            throw new Error(
                "No fue posible cargar la información de tu perfil."
            );

        }

    }


    // ====================================================
    // LOAD COACH
    // ====================================================

    async loadCoach() {

        try {

            const token =
                AuthService.getToken();


            if (
                !token
            ) {

                throw new Error(
                    "Sesión no disponible."
                );

            }


            const response =
                await fetch(

                    "/dashboard",

                    {

                        method:
                            "GET",

                        headers: {

                            "Authorization":
                                `Bearer ${token}`

                        }

                    }

                );


            const data =
                await response
                    .json()
                    .catch(
                        () => null
                    );


            if (
                !response.ok
            ) {

                throw new Error(

                    data?.message
                    ||
                    "No fue posible obtener la información del coach."

                );

            }


            if (
                data?.role !== "coach"
            ) {

                throw new Error(
                    "La sesión no corresponde a un coach."
                );

            }


            if (
                !data.coach
            ) {

                throw new Error(
                    "No se encontró la información del coach."
                );

            }


            this.coach =
                data.coach;

        }

        catch (
        error
        ) {

            console.error(
                "Error al cargar perfil de coach:",
                error
            );


            throw new Error(
                "No fue posible cargar la información de tu perfil."
            );

        }

    }


    // ====================================================
    // RENDER PROFILE
    // ====================================================

    renderProfile() {

        const container =
            document.getElementById(
                "profileCard"
            );


        if (
            !container
        ) {

            console.error(
                "No se encontró #profileCard"
            );

            return;

        }


        if (
            this.isCoach()
        ) {

            this.renderCoachProfile(
                container
            );

            return;

        }


        this.renderClientProfile(
            container
        );

    }


    // ====================================================
    // CLIENT PROFILE
    // ====================================================

    renderClientProfile(
        container
    ) {

        const profile =
            this.client
            ||
            this.user;


        const fullName =

            profile.fullName
            ||
            profile.name
            ||
            this.user.fullName
            ||
            this.user.name
            ||
            this.user.username
            ||
            "Usuario";


        const initials =
            this.getInitials(
                fullName
            );


        const role =
            this.getRoleLabel(
                this.user.role
            );


        const photoUrl =

            profile.photoUrl
            ||
            profile.profilePhoto
            ||
            profile.avatar
            ||
            null;


        const avatarContent =

            photoUrl

                ?

                `

                    <img
                        src="${this.escapeHtml(
                    photoUrl
                )}"
                        alt="${this.escapeHtml(
                    fullName
                )}"
                    >

                `

                :

                this.escapeHtml(
                    initials
                );


        const isActive =
            Number(
                profile.isActive
            ) !== 0;


        const membershipStatus =
            String(
                profile.membershipStatus || ""
            )
                .trim()
                .toUpperCase();


        const membershipName =
            profile.membershipName
            ||
            profile.membership?.name
            ||
            "Sin membresía asignada";


        const membershipIsActive =

            membershipStatus === "ACTIVE"
            ||
            membershipStatus === "ACTIVA";


        const remainingClasses =
            this.formatRemainingClasses(
                profile.remainingClasses
            );


        container.innerHTML = `

            <!-- =====================================
                 CLIENT IDENTITY
            ====================================== -->

            <section
                class="fm-profile-identity"
            >

                <div
                    class="fm-profile-avatar"
                >

                    ${avatarContent}

                </div>


                <h3
                    class="fm-profile-name"
                >

                    ${this.escapeHtml(
            fullName
        )}

                </h3>


                <p
                    class="fm-profile-role"
                >

                    ${this.escapeHtml(
            role
        )}

                </p>


                <div
                    class="fm-profile-status"
                >

                    <span
                        class="fm-profile-status-dot"
                    ></span>


                    ${isActive
                ? "Cuenta activa"
                : "Cuenta inactiva"
            }

                </div>

            </section>


            <!-- =====================================
                 CLIENT INFORMATION
            ====================================== -->

            <section
                class="fm-profile-information"
            >

                <div
                    class="fm-profile-section"
                >

                    <h3
                        class="fm-profile-information-title"
                    >

                        Información personal

                    </h3>


                    <div
                        class="fm-profile-grid"
                    >

                        ${this.createField(
                "badge",
                "ID de cliente",
                profile.clientId || "-"
            )}


                        ${this.createField(
                "person",
                "Nombre completo",
                fullName
            )}


                        ${this.createField(
                "phone",
                "Teléfono",
                profile.phone || "-"
            )}


                        ${this.createField(
                "mail",
                "Correo electrónico",
                profile.email
                ||
                this.user.email
                ||
                "-"
            )}


                        ${this.createField(
                "cake",
                "Fecha de nacimiento",
                this.formatDate(
                    profile.birthDate
                )
            )}


                        ${this.createField(
                "calendar_month",
                "Fecha de registro",
                this.formatDate(
                    profile.createdAt
                )
            )}


                        ${this.createField(
                "home",
                "Dirección",
                profile.address || "-",
                true
            )}

                    </div>

                </div>


                <div
                    class="fm-profile-section"
                >

                    <h3
                        class="fm-profile-information-title"
                    >

                        Contacto de emergencia

                    </h3>


                    <div
                        class="fm-profile-grid"
                    >

                        ${this.createField(
                "contact_emergency",
                "Nombre",
                profile.emergencyContactName
                ||
                "-"
            )}


                        ${this.createField(
                "phone_in_talk",
                "Teléfono",
                profile.emergencyContactPhone
                ||
                "-"
            )}

                    </div>

                </div>


                <div
                    class="fm-profile-section"
                >

                    <h3
                        class="fm-profile-information-title"
                    >

                        Membresía

                    </h3>


                    <div
                        class="fm-profile-membership-card"
                    >

                        <div
                            class="fm-profile-membership-header"
                        >

                            <div
                                class="fm-profile-membership-name"
                            >

                                ${this.escapeHtml(
                membershipName
            )}

                            </div>


                            <span
                                class="
                                    fm-profile-membership-status
                                    ${membershipIsActive
                ? "active"
                : "inactive"
            }
                                "
                            >

                                ${membershipIsActive
                ? "Activa"
                : (
                    membershipStatus
                    ||
                    "Sin membresía"
                )
            }

                            </span>

                        </div>


                        <div
                            class="fm-profile-membership-grid"
                        >

                            <div
                                class="fm-profile-membership-stat"
                            >

                                <span
                                    class="fm-profile-membership-stat-label"
                                >

                                    Clases restantes

                                </span>


                                <strong
                                    class="fm-profile-membership-stat-value"
                                >

                                    ${remainingClasses}

                                </strong>

                            </div>


                            <div
                                class="fm-profile-membership-stat"
                            >

                                <span
                                    class="fm-profile-membership-stat-label"
                                >

                                    Inicio

                                </span>


                                <strong
                                    class="fm-profile-membership-stat-value"
                                >

                                    ${this.formatDate(
                profile.startDate
            )}

                                </strong>

                            </div>


                            <div
                                class="fm-profile-membership-stat"
                            >

                                <span
                                    class="fm-profile-membership-stat-label"
                                >

                                    Vencimiento

                                </span>


                                <strong
                                    class="fm-profile-membership-stat-value"
                                >

                                    ${this.formatDate(
                profile.endDate
            )}

                                </strong>

                            </div>

                        </div>

                    </div>

                </div>


                <div
                    class="fm-profile-section"
                >

                    <h3
                        class="fm-profile-information-title"
                    >

                        Información adicional

                    </h3>


                    <div
                        class="fm-profile-grid"
                    >

                        ${this.createField(
                "medical_information",
                "Notas médicas",
                profile.medicalNotes || "-",
                true
            )}

                    </div>

                </div>

            </section>

        `;

    }


    // ====================================================
    // COACH PROFILE
    // ====================================================

    renderCoachProfile(
        container
    ) {

        const coach =
            this.coach;


        if (
            !coach
        ) {

            container.innerHTML = `

                <div class="fm-profile-empty">

                    No fue posible cargar la información del coach.

                </div>

            `;

            return;

        }


        const fullName =
            coach.fullName
            ||
            this.user.fullName
            ||
            "Coach";


        const initials =
            this.getInitials(
                fullName
            );


        const photoUrl =
            coach.photoUrl
            ||
            this.user.photoUrl
            ||
            null;


        const isActive =
            Number(
                coach.isActive
            ) !== 0;


        const qrValue =
            JSON.stringify({

                version:
                    1,

                type:
                    "flowmanager-user",

                userId:
                    this.user.userId

            });


        container.innerHTML = `

            <!-- =====================================
                 COACH IDENTITY
            ====================================== -->

            <section
                class="
                    fm-profile-identity
                    fm-profile-coach-identity
                "
            >

                <button
                    type="button"
                    id="openCoachCardButton"
                    class="fm-profile-coach-card-button"
                    aria-label="Abrir tarjeta digital"
                >

                    ${this.createDigitalCard(

            fullName,

            initials,

            this.user.userId,

            isActive,

            "profileCoachQr",

            photoUrl

        )}

                </button>


                <span
                    class="fm-profile-card-hint"
                >

                    Haz clic para ampliar

                </span>


                <h3
                    class="fm-profile-name"
                >

                    ${this.escapeHtml(
            fullName
        )}

                </h3>


                <p
                    class="fm-profile-role"
                >

                    Coach

                </p>


                <div
                    class="fm-profile-status"
                >

                    <span
                        class="fm-profile-status-dot"
                    ></span>


                    ${isActive
                ? "Cuenta activa"
                : "Cuenta inactiva"
            }

                </div>

            </section>


            <!-- =====================================
                 INFORMATION
            ====================================== -->

            <section
                class="fm-profile-information"
            >

                <div
                    class="fm-profile-section"
                >

                    <h3
                        class="fm-profile-information-title"
                    >

                        Información personal

                    </h3>


                    <div
                        class="fm-profile-grid"
                    >

                        ${this.createField(
                "badge",
                "ID de usuario",
                this.user.userId
            )}


                        ${this.createField(
                "person",
                "Nombre completo",
                fullName
            )}


                        ${this.createField(
                "phone",
                "Teléfono",
                coach.phone || "-"
            )}


                        ${this.createField(
                "mail",
                "Correo electrónico",
                coach.email
                ||
                this.user.email
                ||
                "-"
            )}


                        ${this.createField(
                "calendar_month",
                "Fecha de registro",
                this.formatDate(
                    coach.createdAt
                )
            )}


                        ${this.createField(
                "payments",
                "Pago por clase",
                this.formatCurrency(
                    coach.paymentPerClass
                )
            )}

                    </div>

                </div>


                <div
                    class="fm-profile-section"
                >

                    <h3
                        class="fm-profile-information-title"
                    >

                        Acceso y clases

                    </h3>


                    <div
                        class="fm-profile-coach-access-card"
                    >

                        <div>

                            <span>
                                Clases
                            </span>


                            <strong>
                                Ilimitadas
                            </strong>

                        </div>


                        <div>

                            <span>
                                Vigencia
                            </span>


                            <strong>
                                Sin límite de tiempo
                            </strong>

                        </div>


                        <div>

                            <span>
                                Estado
                            </span>


                            <strong>

                                ${isActive
                ? "Activo"
                : "Inactivo"
            }

                            </strong>

                        </div>

                    </div>

                </div>


                <div
                    class="fm-profile-section"
                >

                    <h3
                        class="fm-profile-information-title"
                    >

                        Información adicional

                    </h3>


                    <div
                        class="fm-profile-grid"
                    >

                        ${this.createField(
                "description",
                "Notas",
                coach.notes || "-",
                true
            )}

                    </div>

                </div>

            </section>

        `;


        this.renderCoachQr(

            qrValue,

            "profileCoachQr",

            120

        );


        this.initializeCoachCardModal();

    }


    // ====================================================
    // CREAR TARJETA DIGITAL
    // ====================================================

    createDigitalCard(
        fullName,
        initials,
        userId,
        isActive,
        qrContainerId,
        photoUrl = null
    ) {

        const avatarContent =

            photoUrl

                ?

                `

                    <img
                        src="${this.escapeHtml(
                    photoUrl
                )}"
                        alt="${this.escapeHtml(
                    fullName
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

                `;


        return `

            <div
                class="fm-profile-digital-card"
            >

                <div
                    class="
                        fm-profile-digital-card-decoration
                        decoration-top
                    "
                ></div>


                <div
                    class="
                        fm-profile-digital-card-decoration
                        decoration-bottom
                    "
                ></div>


                <div
                    class="fm-profile-digital-card-top"
                >

                    <strong>
                        FlowManager
                    </strong>


                    <span>
                        DIGITAL ID
                    </span>

                </div>


                <div
                    class="fm-profile-digital-card-center"
                >

                    <div
                        class="fm-profile-digital-avatar
                        ${photoUrl ? "has-photo" : ""}
                        "
                    >

                        ${avatarContent}

                    </div>


                    <div
                        class="fm-profile-digital-name"
                    >

                        ${this.escapeHtml(
            fullName
        )}

                    </div>


                    <div
                        class="fm-profile-digital-role"
                    >

                        Coach

                    </div>


                    <div
                        class="fm-profile-digital-id"
                    >

                        ${this.escapeHtml(
            userId
        )}

                    </div>

                </div>


                <div
                    id="${qrContainerId}"
                    class="fm-profile-digital-qr"
                ></div>


                <div
                    class="fm-profile-digital-footer"
                >

                    <span>

                        FlowManager

                    </span>


                    <strong
                        class="${isActive
                ? "active"
                : "inactive"
            }"
                    >

                        <span></span>

                        ${isActive
                ? "Activo"
                : "Inactivo"
            }

                    </strong>

                </div>

            </div>

        `;

    }


    // ====================================================
    // MODAL
    // ====================================================

    initializeCoachCardModal() {

        const button =
            document.getElementById(
                "openCoachCardButton"
            );


        if (
            !button
        ) {

            return;

        }


        button.onclick =
            event => {

                event.preventDefault();

                event.stopPropagation();

                this.openCoachCardModal();

            };

    }


    // ====================================================
    // ABRIR MODAL
    // ====================================================

    openCoachCardModal() {

        this.closeCoachCardModal();


        const coach =
            this.coach;


        if (
            !coach
        ) {

            return;

        }


        const fullName =
            coach.fullName
            ||
            this.user.fullName
            ||
            "Coach";


        const initials =
            this.getInitials(
                fullName
            );


        const photoUrl =
            coach.photoUrl
            ||
            this.user.photoUrl
            ||
            null;


        const isActive =
            Number(
                coach.isActive
            ) !== 0;


        const qrValue =
            JSON.stringify({

                version:
                    1,

                type:
                    "flowmanager-user",

                userId:
                    this.user.userId

            });


        const modal =
            document.createElement(
                "div"
            );


        modal.id =
            "profileCoachCardModal";


        modal.className =
            "fm-profile-card-modal";


        modal.innerHTML = `

            <div
                class="fm-profile-card-modal-backdrop"
                data-close-card="true"
            ></div>


            <div
                class="fm-profile-card-modal-dialog"
                role="dialog"
                aria-modal="true"
                aria-label="Tarjeta digital"
            >

                <button
                    type="button"
                    id="closeCoachCardModal"
                    class="fm-profile-card-modal-close"
                    aria-label="Cerrar tarjeta"
                >

                    <span
                        class="material-symbols-outlined"
                    >

                        close

                    </span>

                </button>


                <div
                    class="fm-profile-card-modal-card"
                >

                    ${this.createDigitalCard(

            fullName,

            initials,

            this.user.userId,

            isActive,

            "profileCoachQrModal",

            photoUrl

        )}

                </div>


                <div
                    class="fm-profile-card-modal-caption"
                >

                    Tarjeta digital de
                    ${this.escapeHtml(
            fullName
        )}

                </div>

            </div>

        `;


        document.body.appendChild(
            modal
        );


        this.coachCardModal =
            modal;


        const closeButton =
            document.getElementById(
                "closeCoachCardModal"
            );


        if (
            closeButton
        ) {

            closeButton.onclick =
                () => {

                    this.closeCoachCardModal();

                };

        }


        const backdrop =
            modal.querySelector(
                "[data-close-card='true']"
            );


        if (
            backdrop
        ) {

            backdrop.addEventListener(

                "click",

                () => {

                    this.closeCoachCardModal();

                }

            );

        }


        this.renderCoachQr(

            qrValue,

            "profileCoachQrModal",

            190

        );


        document.body.classList.add(
            "fm-profile-modal-open"
        );


        document.addEventListener(

            "keydown",

            this.handleCardModalKeydown

        );

    }


    // ====================================================
    // CERRAR MODAL
    // ====================================================

    closeCoachCardModal() {

        const modal =
            document.getElementById(
                "profileCoachCardModal"
            );


        if (
            modal
        ) {

            modal.remove();

        }


        this.coachCardModal =
            null;


        document.body.classList.remove(
            "fm-profile-modal-open"
        );


        document.removeEventListener(

            "keydown",

            this.handleCardModalKeydown

        );

    }


    // ====================================================
    // ESC
    // ====================================================

    handleCardModalKeydown = (
        event
    ) => {

        if (
            event.key === "Escape"
        ) {

            this.closeCoachCardModal();

        }

    };


    // ====================================================
    // QR
    // ====================================================

    renderCoachQr(
        value,
        containerId,
        size
    ) {

        const container =
            document.getElementById(
                containerId
            );


        if (
            !container
        ) {

            console.error(
                `No se encontró #${containerId}`
            );

            return;

        }


        container.innerHTML =
            "";


        if (
            typeof QRCode ===
            "undefined"
        ) {

            container.innerHTML = `

                <span
                    class="fm-profile-qr-error"
                >

                    QR no disponible

                </span>

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
                        size,

                    height:
                        size,

                    colorDark:
                        "#202020",

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
                "Error generando QR:",
                error
            );

        }

    }


    // ====================================================
    // CREATE FIELD
    // ====================================================

    createField(
        icon,
        label,
        value,
        full = false
    ) {

        return `

            <div
                class="
                    fm-profile-field
                    ${full ? "full" : ""}
                "
            >

                <div
                    class="fm-profile-label"
                >

                    <span
                        class="material-symbols-outlined"
                    >

                        ${icon}

                    </span>


                    ${this.escapeHtml(
            label
        )}

                </div>


                <div
                    class="fm-profile-value"
                >

                    ${this.escapeHtml(
            String(
                value ?? "-"
            )
        )}

                </div>

            </div>

        `;

    }


    // ====================================================
    // ROLE LABEL
    // ====================================================

    getRoleLabel(
        role
    ) {

        const normalized =
            String(
                role || ""
            )
                .trim()
                .toLowerCase();


        if (

            normalized === "client"
            ||
            normalized === "clienta"
            ||
            normalized === "cliente"

        ) {

            return "Cliente";

        }


        if (

            normalized === "admin"
            ||
            normalized === "administrator"

        ) {

            return "Administrador";

        }


        if (
            normalized === "coach"
        ) {

            return "Coach";

        }


        if (
            normalized === "manager"
        ) {

            return "Gerente";

        }


        if (
            normalized === "reception"
        ) {

            return "Recepción";

        }


        if (
            normalized === "accountant"
        ) {

            return "Contador";

        }


        return "Usuario";

    }


    // ====================================================
    // INITIALS
    // ====================================================

    getInitials(
        fullName
    ) {

        return String(
            fullName || ""
        )
            .trim()
            .split(
                /\s+/
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
            )

            ||

            "U";

    }


    // ====================================================
    // REMAINING CLASSES
    // ====================================================

    formatRemainingClasses(
        value
    ) {

        if (
            value === null
            ||
            value === undefined
        ) {

            return "Ilimitadas";

        }


        const number =
            Number(
                value
            );


        if (
            !Number.isFinite(
                number
            )
        ) {

            return "-";

        }


        return String(
            number
        );

    }


    // ====================================================
    // CURRENCY
    // ====================================================

    formatCurrency(
        value
    ) {

        const number =
            Number(
                value
            );


        if (
            !Number.isFinite(
                number
            )
        ) {

            return "$0.00";

        }


        return number.toLocaleString(

            "es-MX",

            {

                style:
                    "currency",

                currency:
                    "MXN"

            }

        );

    }


    // ====================================================
    // FORMAT DATE
    // ====================================================

    formatDate(
        value
    ) {

        if (
            !value
        ) {

            return "-";

        }


        const date =
            new Date(
                value
            );


        if (
            Number.isNaN(
                date.getTime()
            )
        ) {

            return "-";

        }


        return date.toLocaleDateString(

            "es-MX",

            {

                year:
                    "numeric",

                month:
                    "long",

                day:
                    "numeric"

            }

        );

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
// INSTANCE
// ====================================================

window.ProfileModule =
    new ProfileModule();


// ====================================================
// REGISTER
// ====================================================

ModuleFactory.register(

    "profile",

    window.ProfileModule

);


console.log(
    "ProfileModule registrado correctamente"
);