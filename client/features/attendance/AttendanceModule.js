/*
====================================================

    FLOWMANAGER

    ATTENDANCE MODULE

====================================================
*/

class AttendanceModule extends Module {

    constructor() {

        super("Registrar asistencia");

        this.selectedClient = null;

        this.currentReservation = null;

    }


    // ====================================================
    // OPEN
    // ====================================================

    async open() {

        await this.load(
            "attendance/attendance"
        );

        await this.initialize();

    }


    // ====================================================
    // INITIALIZE
    // ====================================================

    async initialize() {

        this.initializeSearch();

        this.initializeScannerButton();

        await this.loadClients();

        await this.loadHistory();

    }


    // ====================================================
    // BOTÓN ESCANEAR QR
    // ====================================================

    initializeScannerButton() {

        const button =
            document.getElementById(
                "attendanceScannerButton"
            );


        if (!button) {

            return;

        }


        button.onclick =
            async () => {

                try {

                    await Router.navigate(
                        "scanner"
                    );

                    updateActiveMenu(
                        "scanner"
                    );

                }

                catch (error) {

                    console.error(
                        "Error al abrir escáner QR:",
                        error
                    );

                }

            };

    }


    // ====================================================
    // CLIENTES
    // ====================================================

    async loadClients() {

        try {

            const clients =
                await ClientService.getAll();

            this.renderClients(
                clients
            );

        }

        catch (error) {

            console.error(
                error
            );

        }

    }


    // ====================================================
    // BÚSQUEDA
    // ====================================================

    initializeSearch() {

        const input =
            document.getElementById(
                "attendanceSearch"
            );


        if (
            !input
        ) {

            return;

        }


        input.oninput =
            async () => {

                const text =
                    input.value.trim();


                try {

                    const clients =

                        text === ""

                            ? await ClientService.getAll()

                            : await ClientService.search(
                                text
                            );


                    this.renderClients(
                        clients
                    );

                }

                catch (error) {

                    console.error(
                        error
                    );

                }

            };

    }


    // ====================================================
    // RENDER CLIENTES
    // ====================================================

    renderClients(
        clients
    ) {

        const container =
            document.getElementById(
                "attendanceResults"
            );


        if (
            !container
        ) {

            return;

        }


        container.innerHTML =
            "";


        if (
            !Array.isArray(clients)
            ||
            clients.length === 0
        ) {

            container.innerHTML = `

                <div class="empty-state">

                    No hay clientes.

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
                    "attendance-card";


                card.innerHTML = `

                    <strong>

                        ${this.escapeHtml(
                    client.fullName
                )}

                    </strong>


                    <br>


                    <small>

                        ${this.escapeHtml(
                    client.clientId
                )}

                    </small>

                `;


                card.onclick =
                    () => {

                        this.selectClient(
                            client
                        );

                    };


                container.appendChild(
                    card
                );

            }

        );

    }


    // ====================================================
    // SELECCIONAR CLIENTE
    // ====================================================

    async selectClient(
        client
    ) {

        try {

            this.selectedClient =
                await ClientService.get(

                    client.clientId

                );


            this.currentReservation =
                await this.getCurrentReservation();


            this.renderClient();

        }

        catch (error) {

            console.error(
                error
            );

        }

    }


    // ====================================================
    // OBTENER RESERVACIÓN ACTUAL
    // ====================================================

    async getCurrentReservation() {

        if (
            !this.selectedClient
        ) {

            return null;

        }


        try {

            const response =
                await fetch(

                    `/reservations/client/${encodeURIComponent(
                        this.selectedClient.clientId
                    )}`

                );


            if (
                !response.ok
            ) {

                return null;

            }


            const reservations =
                await response.json();


            if (
                !Array.isArray(
                    reservations
                )
            ) {

                return null;

            }


            const now =
                new Date();


            const today =
                this.getLocalDateKey(
                    now
                );


            const currentTime =
                now.getHours() * 60 +
                now.getMinutes();


            const activeReservations =
                reservations.filter(

                    reservation => {

                        if (

                            reservation.status !==
                            "CONFIRMED"

                        ) {

                            return false;

                        }


                        if (

                            String(
                                reservation.reservationDate
                            )
                                .split("T")[0] !==
                            today

                        ) {

                            return false;

                        }


                        const start =
                            this.timeToMinutes(
                                reservation.startTime
                            );


                        if (
                            start === null
                        ) {

                            return false;

                        }


                        return (

                            currentTime >=
                            start - 15

                            &&

                            currentTime <=
                            start + 10

                        );

                    }

                );


            if (
                activeReservations.length !== 1
            ) {

                return null;

            }


            return activeReservations[0];

        }

        catch (error) {

            console.error(

                "No fue posible obtener la clase actual:",

                error

            );


            return null;

        }

    }


    // ====================================================
    // RENDER CLIENTE
    // ====================================================

    renderClient() {

        const container =
            document.getElementById(
                "attendanceDetails"
            );


        if (
            !container
        ) {

            return;

        }


        const c =
            this.selectedClient;


        if (
            !c
        ) {

            return;

        }


        const reservation =
            this.currentReservation;


        const classInfo =

            reservation

                ? `

                    <div class="attendance-class-info">

                        <h3>

                            📅 Clase actual

                        </h3>


                        <p>

                            <strong>
                                Actividad:
                            </strong>

                            ${this.escapeHtml(
                    reservation.activityName || "-"
                )}

                        </p>


                        <p>

                            <strong>
                                Horario:
                            </strong>

                            ${this.formatTime(
                    reservation.startTime
                )}

                            -

                            ${this.getEndTime(
                    reservation.startTime,
                    reservation.duration
                )}

                        </p>


                        <p>

                            <strong>
                                Fecha:
                            </strong>

                            ${this.formatDate(
                    reservation.reservationDate
                )}

                        </p>


                        <p>

                            <strong>
                                Estado:
                            </strong>

                            Dentro de la ventana de asistencia

                        </p>

                    </div>

                `

                : `

                    <div class="attendance-class-info">

                        <h3>

                            📅 Clase actual

                        </h3>


                        <p>

                            No hay una reservación válida
                            en este momento.

                        </p>


                        <small>

                            La asistencia solo puede registrarse
                            desde 15 minutos antes hasta 10 minutos
                            después del inicio de una clase reservada.

                        </small>

                    </div>

                `;


        container.innerHTML = `

            <div class="client-profile">

                <h2>

                    ${this.escapeHtml(
            c.fullName
        )}

                </h2>


                <small>

                    ${this.escapeHtml(
            c.clientId
        )}

                </small>


                <hr>


                <p>

                    <strong>
                        Membresía:
                    </strong>

                    ${this.escapeHtml(
            c.membershipName || "-"
        )}

                </p>


                <p>

                    <strong>
                        Clases restantes:
                    </strong>

                    ${c.remainingClasses === null

                ? "Ilimitadas"

                : this.escapeHtml(
                    c.remainingClasses
                )
            }

                </p>


                <p>

                    <strong>
                        Estado:
                    </strong>

                    ${this.escapeHtml(
                c.membershipStatus || "-"
            )}

                </p>


                ${classInfo}


                <div class="attendance-actions">

                    <button

                        id="registerAttendance"

                        class="fm-btn fm-btn-primary"

                        ${reservation
                ? ""
                : "disabled"
            }

                    >

                        Registrar asistencia

                    </button>

                </div>

            </div>

        `;


        const registerButton =
            document.getElementById(
                "registerAttendance"
            );


        if (
            !registerButton
        ) {

            return;

        }


        registerButton.onclick =
            () => {

                this.registerAttendance();

            };

    }


    // ====================================================
    // REGISTRAR ASISTENCIA
    // ====================================================

    async registerAttendance() {

        if (
            !this.selectedClient
        ) {

            return;

        }


        if (
            !this.currentReservation
        ) {

            alert(
                "No existe una clase válida para registrar asistencia."
            );

            return;

        }


        try {

            const result =
                await AttendanceService.register(

                    this.selectedClient.clientId

                );


            alert(
                result.message
            );


            this.selectedClient =
                await ClientService.get(

                    this.selectedClient.clientId

                );


            this.currentReservation =
                null;


            this.renderClient();


            await this.loadClients();

            await this.loadHistory();

        }

        catch (error) {

            alert(
                error.message
            );


            this.currentReservation =
                await this.getCurrentReservation();


            this.renderClient();

        }

    }


    // ====================================================
    // HISTORIAL
    // ====================================================

    async loadHistory() {

        try {

            const attendances =
                await AttendanceService.getAll();


            this.renderHistory(
                attendances
            );

        }

        catch (error) {

            console.error(

                "Error al cargar historial:",

                error

            );

        }

    }


    // ====================================================
    // RENDER HISTORIAL
    // ====================================================

    renderHistory(
        attendances
    ) {

        const container =
            document.getElementById(
                "attendanceHistory"
            );


        if (
            !container
        ) {

            return;

        }


        if (

            !attendances

            ||

            attendances.length === 0

        ) {

            container.innerHTML = `

                <div class="empty-state">

                    No hay asistencias registradas.

                </div>

            `;

            return;

        }


        container.innerHTML = `

            <div class="attendance-history-table">

                <div class="attendance-history-header">

                    <div>
                        Fecha
                    </div>

                    <div>
                        Cliente
                    </div>

                    <div>
                        Clase
                    </div>

                    <div>
                        Horario
                    </div>

                    <div>
                        Membresía
                    </div>

                    <div>
                        Clases restantes
                    </div>

                </div>


                ${attendances.map(

            attendance => {

                const remainingClasses =

                    attendance.remainingClassesAfter === null

                        ? "Ilimitadas"

                        : attendance.remainingClassesAfter;


                const endTime =
                    this.getEndTime(

                        attendance.startTime,

                        attendance.duration

                    );


                return `

                            <div
                                class="attendance-history-row"
                            >

                                <div>

                                    ${this.formatDate(
                    attendance.attendanceDate
                )}

                                </div>


                                <div>

                                    <strong>

                                        ${this.escapeHtml(
                    attendance.fullName
                )}

                                    </strong>


                                    <br>


                                    <small>

                                        ${this.escapeHtml(
                    attendance.clientId
                )}

                                    </small>

                                </div>


                                <div>

                                    ${this.escapeHtml(
                    attendance.activityName || "-"
                )}

                                </div>


                                <div>

                                    ${attendance.startTime

                        ? `${this.formatTime(
                            attendance.startTime
                        )} - ${endTime}`

                        : "-"
                    }

                                </div>


                                <div>

                                    ${this.escapeHtml(
                        attendance.membershipId || "-"
                    )}

                                </div>


                                <div>

                                    ${this.escapeHtml(
                        remainingClasses
                    )}

                                </div>

                            </div>

                        `;

            }

        ).join("")}

            </div>

        `;

    }


    // ====================================================
    // HELPERS
    // ====================================================

    getLocalDateKey(
        date = new Date()
    ) {

        return (

            `${date.getFullYear()}-` +

            `${String(
                date.getMonth() + 1
            ).padStart(
                2,
                "0"
            )}-` +

            `${String(
                date.getDate()
            ).padStart(
                2,
                "0"
            )}`

        );

    }


    timeToMinutes(
        time
    ) {

        if (
            !time
        ) {

            return null;

        }


        const parts =
            String(
                time
            )
                .split(
                    ":"
                )
                .map(
                    Number
                );


        if (

            parts.length < 2

            ||

            !Number.isFinite(
                parts[0]
            )

            ||

            !Number.isFinite(
                parts[1]
            )

        ) {

            return null;

        }


        return (

            parts[0] * 60

            +

            parts[1]

        );

    }


    getEndTime(
        startTime,
        duration
    ) {

        if (
            !startTime
        ) {

            return "-";

        }


        const start =
            this.timeToMinutes(
                startTime
            );


        if (
            start === null
        ) {

            return "-";

        }


        const total =
            start +
            Number(
                duration || 0
            );


        const hours =
            Math.floor(
                total / 60
            ) % 24;


        const minutes =
            total % 60;


        return (

            `${String(
                hours
            ).padStart(
                2,
                "0"
            )}:` +

            `${String(
                minutes
            ).padStart(
                2,
                "0"
            )}`

        );

    }


    formatTime(
        time
    ) {

        if (
            !time
        ) {

            return "-";

        }


        return String(
            time
        )
            .slice(
                0,
                5
            );

    }


    formatDate(
        date
    ) {

        if (
            !date
        ) {

            return "-";

        }


        const normalizedDate =
            String(
                date
            )
                .split(
                    "T"
                )[0];


        const parts =
            normalizedDate.split(
                "-"
            );


        if (
            parts.length !== 3
        ) {

            return normalizedDate;

        }


        const [

            year,
            month,
            day

        ] =
            parts;


        return `${day}/${month}/${year}`;

    }


    escapeHtml(
        value
    ) {

        const element =
            document.createElement(
                "div"
            );


        element.textContent =
            value ?? "";


        return element.innerHTML;

    }

}


// ====================================================
// REGISTER MODULE
// ====================================================

window.AttendanceModule =
    new AttendanceModule();


ModuleFactory.register(

    "attendance",

    window.AttendanceModule

);