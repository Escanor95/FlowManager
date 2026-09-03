/*
====================================================

    FLOWMANAGER

    CLIENTS FEATURE

====================================================
*/


// ====================================================
// ESTADO
// ====================================================

let selectedClientId = null;

let currentClients = [];


// ====================================================
// INICIALIZAR MÓDULO
// ====================================================

function initializeClients() {

    initializeClientSearch();

}


// ====================================================
// BUSCADOR
// ====================================================

function initializeClientSearch() {

    const search =
        document.getElementById(
            "searchClient"
        );


    if (!search) {

        return;

    }


    search.addEventListener(
        "input",
        async () => {

            const text =
                search.value.trim();


            const container =
                document.getElementById(
                    "results"
                );


            if (!container) {

                return;

            }


            /*
            ====================================================
            NO MOSTRAR CLIENTES HASTA ESCRIBIR
            AL MENOS 2 CARACTERES
            ====================================================
            */

            if (
                text.length < 2
            ) {

                currentClients = [];

                container.innerHTML =
                    "";

                return;

            }


            try {

                const clients =
                    await ClientService.search(
                        text
                    );


                currentClients =
                    clients;


                renderClientCards(
                    clients,
                    selectedClientId
                );

            }

            catch (error) {

                console.error(
                    error
                );


                container.innerHTML = `

                    <div class="search-empty">

                        No fue posible realizar
                        la búsqueda.

                    </div>

                `;

            }

        }
    );

}


// ====================================================
// RENDERIZAR RESULTADOS
// ====================================================

function renderClientCards(
    clients,
    selectedId = null
) {

    const container =
        document.getElementById(
            "results"
        );


    if (!container) {

        return;

    }


    container.innerHTML =
        "";


    if (
        !clients ||
        clients.length === 0
    ) {

        container.innerHTML = `

            <div class="search-empty">

                No se encontraron clientes.

            </div>

        `;

        return;

    }


    clients.forEach(
        client => {

            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "client-card";


            if (
                client.clientId ===
                selectedId
            ) {

                card.classList.add(
                    "active"
                );

            }


            const initials =
                getClientInitials(
                    client.fullName
                );


            card.innerHTML = `

                <div
                    class="client-card-avatar"
                >

                    ${client.photoUrl

                    ? `

                            <img
                                src="${client.photoUrl}"
                                alt="${client.fullName}"
                            >

                        `

                    : initials

                }

                </div>


                <div
                    class="client-card-info"
                >

                    <strong>

                        ${client.fullName}

                    </strong>


                    <small>

                        ${client.clientId}

                    </small>

                </div>

            `;


            card.addEventListener(
                "click",
                () => {

                    selectedClientId =
                        client.clientId;


                    document
                        .querySelectorAll(
                            ".client-card"
                        )
                        .forEach(
                            item => {

                                item.classList.remove(
                                    "active"
                                );

                            }
                        );


                    card.classList.add(
                        "active"
                    );


                    loadClientProfile(
                        client.clientId
                    );

                }
            );


            container.appendChild(
                card
            );

        }
    );

}


// ====================================================
// CARGAR PERFIL
// ====================================================

async function loadClientProfile(
    clientId
) {

    const container =
        document.getElementById(
            "clientDetails"
        );


    if (!container) {

        return;

    }


    container.innerHTML = `

        <div class="client-loading">

            Cargando información
            del cliente...

        </div>

    `;


    try {

        const client =
            await ClientService.get(
                clientId
            );


        const initials =
            getClientInitials(
                client.fullName
            );


        const activePackage =
            getCurrentClientPackage(
                client
            );


        const membershipName =
            activePackage?.membershipName ||
            client.membershipName ||
            "Sin membresía";


        const membershipStatus =
            activePackage?.status ||
            client.membershipStatus ||
            "Sin membresía";


        const remainingClasses =

            activePackage?.remainingClasses === null

                ? "Ilimitadas"

                :

                (
                    activePackage?.remainingClasses ??

                    client.remainingClasses ??

                    "-"
                );


        const startDate =
            activePackage?.activatedAt ||
            activePackage?.startDate ||
            client.startDate;


        const endDate =
            activePackage?.expiresAt ||
            activePackage?.endDate ||
            client.endDate;


        const photoHtml =

            client.photoUrl

                ? `

                    <img
                        src="${client.photoUrl}"
                        alt="${client.fullName}"
                    >

                `

                : initials;


        container.innerHTML = `

            <div class="client-profile">


                <!-- =====================================
                     HEADER
                ====================================== -->

                <div class="client-profile-header">


                    <div class="client-profile-main">


                        <div
                            class="client-profile-avatar"
                        >

                            ${photoHtml}

                        </div>


                        <div
                            class="client-profile-title"
                        >


                            <h2>

                                ${client.fullName}

                            </h2>


                            <span>

                                ${client.clientId}

                            </span>


                            <div
                                class="client-status"
                            >

                                ${formatMembershipStatus(
            membershipStatus
        )}

                            </div>


                        </div>


                    </div>


                    <div
                        class="client-profile-actions"
                    >


                        <button
                            class="
                                fm-btn
                                fm-btn-secondary
                            "
                            id="editClientBtn"
                        >

                            Editar

                        </button>


                        <button
                            class="
                                fm-btn
                                fm-btn-secondary
                            "
                            id="generateCredentialsBtn"
                        >

                            Generar claves

                        </button>


                        <button
                            class="
                                fm-btn
                                fm-btn-primary
                            "
                            id="renewMembershipBtn"
                        >

                            Renovar membresía

                        </button>


                    </div>


                </div>


                <!-- =====================================
                     MEMBRESÍA
                ====================================== -->

                <div
                    class="client-info-section"
                >


                    <h3>

                        Membresía

                    </h3>


                    <div
                        class="client-info-grid"
                    >


                        <div
                            class="client-info-card"
                        >

                            <span>

                                Membresía

                            </span>


                            <strong>

                                ${membershipName}

                            </strong>

                        </div>


                        <div
                            class="client-info-card"
                        >

                            <span>

                                Clases restantes

                            </span>


                            <strong>

                                ${remainingClasses}

                            </strong>

                        </div>


                        <div
                            class="client-info-card"
                        >

                            <span>

                                Inicio

                            </span>


                            <strong>

                                ${formatClientDate(
            startDate
        )}

                            </strong>

                        </div>


                        <div
                            class="client-info-card"
                        >

                            <span>

                                Vencimiento

                            </span>


                            <strong>

                                ${formatClientDate(
            endDate
        )}

                            </strong>

                        </div>


                    </div>


                </div>


                <!-- =====================================
                     CONTACTO
                ====================================== -->

                <div
                    class="client-info-section"
                >


                    <h3>

                        Información de contacto

                    </h3>


                    <div
                        class="client-details-grid"
                    >


                        <div>

                            <span>

                                Correo electrónico

                            </span>


                            <strong>

                                ${client.email || "-"}

                            </strong>

                        </div>


                        <div>

                            <span>

                                Teléfono

                            </span>


                            <strong>

                                ${client.phone || "-"}

                            </strong>

                        </div>


                    </div>


                </div>


                <!-- =====================================
                     EMERGENCIA
                ====================================== -->

                <div
                    class="client-info-section"
                >


                    <h3>

                        Contacto de emergencia

                    </h3>


                    <div
                        class="client-details-grid"
                    >


                        <div>

                            <span>

                                Nombre

                            </span>


                            <strong>

                                ${client.emergencyContactName ||
            "-"
            }

                            </strong>

                        </div>


                        <div>

                            <span>

                                Teléfono

                            </span>


                            <strong>

                                ${client.emergencyContactPhone ||
            "-"
            }

                            </strong>

                        </div>


                    </div>


                </div>


                <!-- =====================================
                     INFORMACIÓN ADICIONAL
                ====================================== -->

                <div
                    class="client-info-section"
                >


                    <h3>

                        Información adicional

                    </h3>


                    <div
                        class="client-notes"
                    >

                        ${client.medicalNotes ||

            "Sin información adicional registrada."
            }

                    </div>


                </div>


                <!-- =====================================
                     QR
                ====================================== -->

                <div
                    class="
                        client-info-section
                        client-qr-section
                    "
                >


                    <h3>

                        Código QR

                    </h3>


                    <div
                        class="client-qr-content"
                    >


                        <div
                            class="client-qr-code"
                        >

                            <img
                                src="/clients/${encodeURIComponent(
                client.clientId
            )}/qr"
                                alt="Código QR de ${client.fullName}"
                            >

                        </div>


                        <div
                            class="client-qr-info"
                        >

                            <span>

                                ID del cliente

                            </span>


                            <strong>

                                ${client.clientId}

                            </strong>


                            <p>

                                Código único generado
                                automáticamente para
                                identificar al cliente.

                            </p>


                        </div>


                    </div>


                </div>


                <!-- =====================================
                     HISTORIAL
                ====================================== -->

                <div
                    class="client-reservation-history"
                >


                    <h3>

                        Historial de reservaciones

                    </h3>


                    <div
                        id="clientHistory"
                        class="client-history-content"
                    >

                        <div
                            class="client-history-empty"
                        >

                            Cargando historial...

                        </div>


                    </div>


                </div>


            </div>

        `;


        initializeClientProfileActions(
            client
        );


        loadClientReservationHistory(
            clientId
        );

    }

    catch (error) {

        console.error(
            error
        );


        container.innerHTML = `

            <div class="empty-state">

                <h2>

                    No fue posible cargar
                    el cliente

                </h2>


                <p>

                    Intenta nuevamente.

                </p>

            </div>

        `;

    }

}


// ====================================================
// ACCIONES DEL PERFIL
// ====================================================

function initializeClientProfileActions(
    client
) {

    const editButton =
        document.getElementById(
            "editClientBtn"
        );


    const credentialsButton =
        document.getElementById(
            "generateCredentialsBtn"
        );


    const renewButton =
        document.getElementById(
            "renewMembershipBtn"
        );


    if (editButton) {

        editButton.addEventListener(
            "click",
            () => {

                if (
                    typeof openEditClientModal ===
                    "function"
                ) {

                    openEditClientModal(
                        client
                    );

                }

            }
        );

    }


    if (credentialsButton) {

        credentialsButton.addEventListener(
            "click",
            () => {

                if (
                    typeof openGenerateCredentialsModal ===
                    "function"
                ) {

                    openGenerateCredentialsModal(
                        client
                    );

                }

                else {

                    console.log(
                        "Generar credenciales:",
                        client
                    );

                }

            }
        );

    }


    if (renewButton) {

        renewButton.addEventListener(
            "click",
            () => {

                if (
                    typeof openRenewMembershipModal ===
                    "function"
                ) {

                    openRenewMembershipModal(
                        client
                    );

                }

            }
        );

    }

}


// ====================================================
// PAQUETE ACTUAL
// ====================================================

function getCurrentClientPackage(
    client
) {

    if (
        !client.packages ||
        client.packages.length === 0
    ) {

        return null;

    }


    return (

        client.packages.find(
            item =>
                item.status === "ACTIVE"
        )

        ||

        client.packages.find(
            item =>
                item.status === "FROZEN"
        )

        ||

        client.packages.find(
            item =>
                item.status ===
                "PENDING_ACTIVATION"
        )

        ||

        client.packages[0]

    );

}


// ====================================================
// HISTORIAL DE RESERVACIONES
// ====================================================

async function loadClientReservationHistory(
    clientId
) {

    const container =
        document.getElementById(
            "clientHistory"
        );


    if (!container) {

        return;

    }


    if (
        !ClientService.getReservationHistory
    ) {

        container.innerHTML = `

            <div class="client-history-empty">

                Este cliente todavía no tiene
                reservaciones registradas.

            </div>

        `;

        return;

    }


    try {

        const history =
            await ClientService.getReservationHistory(
                clientId
            );


        if (
            !history ||
            history.length === 0
        ) {

            container.innerHTML = `

                <div class="client-history-empty">

                    Este cliente todavía no tiene
                    reservaciones registradas.

                </div>

            `;

            return;

        }


        container.innerHTML =
            "";


        history.forEach(
            reservation => {

                const item =
                    document.createElement(
                        "div"
                    );


                const statusClass =
                    getReservationStatusClass(
                        reservation.status
                    );


                item.className =
                    "client-history-item";


                item.innerHTML = `

                    <div
                        class="client-history-main"
                    >

                        <strong>

                            ${reservation.activityName ||
                    "Clase"
                    }

                        </strong>


                        <span>

                            ${formatClientDate(
                        reservation.reservationDate
                    )}

                            ${reservation.startTime

                        ? ` · ${reservation.startTime}`

                        : ""
                    }

                        </span>


                        <small>

                            ${reservation.coachName ||
                    ""
                    }

                        </small>


                    </div>


                    <div
                        class="
                            client-history-status
                            ${statusClass}
                        "
                    >

                        ${formatReservationStatus(
                        reservation.status
                    )}

                    </div>

                `;


                container.appendChild(
                    item
                );

            }
        );

    }

    catch (error) {

        console.error(
            error
        );


        container.innerHTML = `

            <div class="client-history-empty">

                No fue posible cargar
                el historial.

            </div>

        `;

    }

}


// ====================================================
// CLASE CSS DEL ESTADO
// ====================================================

function getReservationStatusClass(
    status
) {

    const normalized =
        String(
            status || "CONFIRMED"
        )
            .toUpperCase();


    if (
        normalized === "USED" ||
        normalized === "COMPLETED"
    ) {

        return "status-used";

    }


    if (
        normalized === "CANCELLED" ||
        normalized === "CANCELED"
    ) {

        return "status-cancelled";

    }


    if (
        normalized === "NO_SHOW" ||
        normalized === "NOSHOW"
    ) {

        return "status-no-show";

    }


    if (
        normalized === "RESERVED"
    ) {

        return "status-reserved";

    }


    return "status-confirmed";

}


// ====================================================
// INICIALES
// ====================================================

function getClientInitials(
    fullName
) {

    if (!fullName) {

        return "CL";

    }


    return fullName
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map(
            name =>
                name.charAt(0)
        )
        .join("")
        .toUpperCase();

}


// ====================================================
// ESTADO MEMBRESÍA
// ====================================================

function formatMembershipStatus(
    status
) {

    const statuses = {

        ACTIVE:
            "Activo",

        Active:
            "Activo",

        FROZEN:
            "Congelado",

        Frozen:
            "Congelado",

        PENDING_ACTIVATION:
            "Pendiente de activación",

        PendingActivation:
            "Pendiente de activación",

        EXPIRED:
            "Vencida",

        Expired:
            "Vencida",

        EXHAUSTED:
            "Agotada",

        NoClasses:
            "Agotada",

        NoMembership:
            "Sin membresía"

    };


    return (

        statuses[
        status
        ]

        ||

        status

        ||

        "Sin membresía"

    );

}


// ====================================================
// ESTADO RESERVACIÓN
// ====================================================

function formatReservationStatus(
    status
) {

    const statuses = {

        CONFIRMED:
            "Confirmada",

        RESERVED:
            "Reservada",

        USED:
            "Utilizada",

        COMPLETED:
            "Utilizada",

        CANCELLED:
            "Cancelada",

        CANCELED:
            "Cancelada",

        NO_SHOW:
            "No asistió",

        NOSHOW:
            "No asistió"

    };


    return (

        statuses[
        status
        ]

        ||

        status

        ||

        "Confirmada"

    );

}


// ====================================================
// FORMATEAR FECHA
// ====================================================

function formatClientDate(
    date
) {

    if (!date) {

        return "-";

    }


    try {

        return new Date(
            date
        ).toLocaleDateString(
            "es-MX",
            {

                day:
                    "2-digit",

                month:
                    "short",

                year:
                    "numeric"

            }
        );

    }

    catch {

        return date;

    }

}