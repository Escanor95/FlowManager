/*
====================================================

    FLOWMANAGER

    DASHBOARD MODULE

====================================================
*/

class DashboardModule extends Module {

    constructor() {

        super(
            "Dashboard"
        );


        this.data =
            null;


        this.currentPeriod =
            "today";


        this.user =
            AuthService.getUser();

    }


    // ====================================================
    // OPEN
    // ====================================================

    async open() {

        await this.load(
            "dashboard/dashboard"
        );


        this.user =
            AuthService.getUser();


        await this.initialize();

    }


    // ====================================================
    // INITIALIZE
    // ====================================================

    async initialize() {

        await this.refresh();

    }


    // ====================================================
    // REFRESH
    // ====================================================

    async refresh() {

        try {

            this.data =
                await DashboardService.getData();


            if (
                this.isCoach()
            ) {

                this.renderCoachDashboard();

                return;

            }


            this.renderManagerDashboard();

        }

        catch (
        error
        ) {

            console.error(
                "Dashboard error:",
                error
            );


            this.showError(
                error.message
            );

        }

    }


    // ====================================================
    // DETECTAR COACH
    // ====================================================

    isCoach() {

        const role =
            String(
                this.user?.role ||
                this.data?.role ||
                ""
            )
                .trim()
                .toLowerCase();


        return (
            role === "coach"
        );

    }


    // ====================================================
    // DASHBOARD MANAGER
    // ====================================================

    renderManagerDashboard() {

        const manager =
            document.getElementById(
                "managerDashboard"
            );


        const coach =
            document.getElementById(
                "coachDashboard"
            );


        if (
            manager
        ) {

            manager.hidden =
                false;

        }


        if (
            coach
        ) {

            coach.hidden =
                true;

        }


        const activeClients =
            document.getElementById(
                "activeClients"
            );


        const expiredClients =
            document.getElementById(
                "expiredClients"
            );


        const todayClasses =
            document.getElementById(
                "todayClasses"
            );


        const todayReservations =
            document.getElementById(
                "todayReservations"
            );


        const todayAttendances =
            document.getElementById(
                "todayAttendances"
            );


        const occupancy =
            document.getElementById(
                "occupancy"
            );


        const capacitySummary =
            document.getElementById(
                "capacitySummary"
            );


        if (

            !activeClients
            ||
            !expiredClients
            ||
            !todayClasses
            ||
            !todayReservations
            ||
            !todayAttendances
            ||
            !occupancy

        ) {

            console.error(
                "Dashboard: No se encontraron los elementos administrativos."
            );

            return;

        }


        activeClients.textContent =
            this.data.activeClients ?? 0;


        expiredClients.textContent =
            this.data.expiredClients ?? 0;


        todayClasses.textContent =
            this.data.todayClasses ?? 0;


        todayReservations.textContent =
            this.data.todayReservations ?? 0;


        todayAttendances.textContent =
            this.data.todayAttendances ?? 0;


        occupancy.textContent =
            `${this.data.occupancy ?? 0}%`;


        if (
            capacitySummary
        ) {

            capacitySummary.textContent =

                "La ocupación se calcula utilizando las reservaciones confirmadas frente a la capacidad total programada para hoy.";

        }

    }


    // ====================================================
    // DASHBOARD COACH
    // ====================================================

    renderCoachDashboard() {

        const manager =
            document.getElementById(
                "managerDashboard"
            );


        const container =
            document.getElementById(
                "coachDashboard"
            );


        if (
            manager
        ) {

            manager.hidden =
                true;

        }


        if (
            !container
        ) {

            console.error(
                "Dashboard Coach: no se encontró #coachDashboard."
            );

            return;

        }


        container.hidden =
            false;


        const pageTitle =
            document.getElementById(
                "pageTitle"
            );


        if (
            pageTitle
        ) {

            pageTitle.textContent =
                "Clases";

        }


        const classes =
            this.getCurrentClasses();


        const nextClass =
            this.getNextClass(
                classes
            );


        container.innerHTML = `

            <div class="fm-coach-dashboard-header">

                <div>

                    <span class="fm-coach-dashboard-eyebrow">

                        CLASES

                    </span>


                    <h2>

                        Mis clases

                    </h2>


                    <p>

                        Consulta tus clases y las clientas
                        reservadas en cada una.

                    </p>

                </div>


                <div class="fm-coach-dashboard-header-actions">

                    <div class="fm-coach-dashboard-date">

                        ${this.formatToday(
            this.data?.today
        )}

                    </div>


                    <button
                        type="button"
                        class="fm-btn fm-btn-primary"
                        id="coachScanQrButton"
                    >

                        <span class="material-symbols-outlined">

                            qr_code_scanner

                        </span>

                        Escanear QR

                    </button>

                </div>

            </div>


            <!-- =========================================
                 FILTROS
            ========================================== -->

            <div class="fm-coach-period-filters">

                <button
                    type="button"
                    class="
                        fm-coach-period-button
                        ${this.currentPeriod === "today"
                ? "active"
                : ""
            }
                    "
                    data-period="today"
                >

                    Hoy

                </button>


                <button
                    type="button"
                    class="
                        fm-coach-period-button
                        ${this.currentPeriod === "week"
                ? "active"
                : ""
            }
                    "
                    data-period="week"
                >

                    Semana

                </button>


                <button
                    type="button"
                    class="
                        fm-coach-period-button
                        ${this.currentPeriod === "month"
                ? "active"
                : ""
            }
                    "
                    data-period="month"
                >

                    Mes

                </button>

            </div>


            <!-- =========================================
                 PRÓXIMA CLASE
            ========================================== -->

            <section class="fm-coach-next-section">

                <div class="fm-coach-section-header">

                    <div>

                        <span class="fm-coach-dashboard-eyebrow">

                            PRÓXIMA CLASE

                        </span>


                        <h3>

                            ${nextClass
                ? "Tu siguiente clase"
                : "Agenda"
            }

                        </h3>

                    </div>

                </div>


                <div
                    id="coachNextClass"
                    class="fm-coach-next-class-container"
                >

                    ${this.renderNextClass(
                nextClass
            )}

                </div>

            </section>


            <!-- =========================================
                 CLASES
            ========================================== -->

            <section class="fm-coach-classes-section">

                <div class="fm-coach-section-header">

                    <div>

                        <span class="fm-coach-dashboard-eyebrow">

                            ${this.getPeriodLabel()}

                        </span>


                        <h3>

                            ${this.getClassesTitle()}

                        </h3>

                    </div>


                    <span class="fm-coach-class-count">

                        ${classes.length}

                        ${classes.length === 1
                ? "clase"
                : "clases"
            }

                    </span>

                </div>


                <div
                    id="coachClassesList"
                    class="fm-coach-classes-list"
                >

                    ${classes.length

                ?

                classes
                    .map(
                        item =>
                            this.renderClassCard(
                                item
                            )
                    )
                    .join("")

                :

                this.renderEmptyClasses()
            }

                </div>

            </section>

        `;


        this.initializeCoachDashboardActions();

    }


    // ====================================================
    // ACCIONES DASHBOARD COACH
    // ====================================================

    initializeCoachDashboardActions() {

        const scanButton =
            document.getElementById(
                "coachScanQrButton"
            );


        if (
            scanButton
        ) {

            scanButton.onclick =
                async () => {

                    try {

                        await Router.navigate(
                            "scanner"
                        );


                        updateActiveMenu(
                            "scanner"
                        );

                    }

                    catch (
                    error
                    ) {

                        console.error(

                            "Error al abrir escáner QR:",

                            error

                        );

                    }

                };

        }


        const periodButtons =
            document.querySelectorAll(
                ".fm-coach-period-button"
            );


        periodButtons.forEach(

            button => {

                button.onclick =
                    async () => {

                        const period =
                            button.dataset.period;


                        if (
                            !period
                        ) {

                            return;

                        }


                        this.currentPeriod =
                            period;


                        this.renderCoachDashboard();

                    };

            }

        );

    }


    // ====================================================
    // OBTENER CLASES DEL PERÍODO
    // ====================================================

    getCurrentClasses() {

        let classes = [];


        if (
            this.currentPeriod === "week"
        ) {

            classes =
                this.data?.weekClasses
                ||
                this.data?.weeklyClasses
                ||
                this.data?.classes
                ||
                this.data?.todayClasses
                ||
                [];

        }

        else if (
            this.currentPeriod === "month"
        ) {

            classes =
                this.data?.monthClasses
                ||
                this.data?.monthlyClasses
                ||
                this.data?.classes
                ||
                this.data?.todayClasses
                ||
                [];

        }

        else {

            classes =
                this.data?.todayClasses
                ||
                [];

        }


        if (
            !Array.isArray(
                classes
            )
        ) {

            return [];

        }


        return classes.slice();

    }


    // ====================================================
    // OBTENER PRÓXIMA CLASE
    // ====================================================

    getNextClass(
        classes
    ) {

        if (
            !Array.isArray(
                classes
            )
            ||
            !classes.length
        ) {

            return null;

        }


        const now =
            new Date();


        const currentTime =
            now.getHours() * 60 +
            now.getMinutes();


        const upcoming =
            classes.filter(

                item => {

                    const time =
                        this.timeToMinutes(
                            item.startTime
                        );


                    if (
                        time === null
                    ) {

                        return false;

                    }


                    if (
                        item.isFinished
                    ) {

                        return false;

                    }


                    return (
                        time >= currentTime
                    );

                }

            );


        if (
            upcoming.length
        ) {

            return upcoming.sort(

                (
                    a,
                    b
                ) => {

                    return (

                        this.timeToMinutes(
                            a.startTime
                        )

                        -

                        this.timeToMinutes(
                            b.startTime
                        )

                    );

                }

            )[0];

        }


        return null;

    }


    // ====================================================
    // RENDER PRÓXIMA CLASE
    // ====================================================

    renderNextClass(
        classData
    ) {

        if (
            !classData
        ) {

            return `

                <div class="fm-coach-next-class empty">

                    <div class="fm-coach-next-class-icon">

                        <span class="material-symbols-outlined">

                            event_available

                        </span>

                    </div>


                    <div>

                        <span class="fm-coach-next-label">

                            PRÓXIMA CLASE

                        </span>


                        <strong>

                            No tienes más clases hoy

                        </strong>


                        <p>

                            Cuando tengas una próxima clase aparecerá aquí.

                        </p>

                    </div>

                </div>

            `;

        }


        const reserved =
            Number(
                classData.reserved
            )
            ||
            0;


        const capacity =
            Number(
                classData.capacity
            )
            ||
            0;


        const remaining =
            classData.remaining !== undefined

                ?

                classData.remaining

                :

                Math.max(
                    0,
                    capacity - reserved
                );


        return `

            <section class="fm-coach-next-class">

                <div class="fm-coach-next-class-main">

                    <span class="fm-coach-next-label">

                        PRÓXIMA CLASE

                    </span>


                    <h3>

                        ${this.escapeHtml(
            classData.activityName
            ||
            "Clase"
        )}

                    </h3>


                    <strong>

                        ${this.formatTime(
            classData.startTime
        )}

                        –

                        ${this.calculateEndTime(
            classData.startTime,
            classData.duration
        )}

                    </strong>

                </div>


                <div class="fm-coach-next-class-stats">

                    <div>

                        <strong>

                            ${reserved}

                        </strong>

                        <span>

                            Reservadas

                        </span>

                    </div>


                    <div>

                        <strong>

                            ${capacity}

                        </strong>

                        <span>

                            Cupo

                        </span>

                    </div>


                    <div>

                        <strong>

                            ${remaining}

                        </strong>

                        <span>

                            Disponibles

                        </span>

                    </div>

                </div>

            </section>

        `;

    }


    // ====================================================
    // TARJETA DE CLASE
    // ====================================================

    renderClassCard(
        item
    ) {

        const reserved =
            Number(
                item.reserved
            )
            ||
            0;


        const capacity =
            Number(
                item.capacity
            )
            ||
            0;


        const remaining =
            item.remaining !== undefined

                ?

                item.remaining

                :

                Math.max(
                    0,
                    capacity - reserved
                );


        const clients =
            Array.isArray(
                item.clientNames
            )
                ?
                item.clientNames
                :
                [];


        const isStarted =
            Boolean(
                item.isStarted
            );


        const isFinished =
            Boolean(
                item.isFinished
            );


        let statusHtml =
            "";


        if (
            isFinished
        ) {

            statusHtml = `

                <span class="fm-coach-class-status finished">

                    Finalizada

                </span>

            `;

        }

        else if (
            isStarted
        ) {

            statusHtml = `

                <span class="fm-coach-class-status started">

                    En curso

                </span>

            `;

        }

        else {

            statusHtml = `

                <span class="fm-coach-class-status upcoming">

                    Próxima

                </span>

            `;

        }


        const clientHtml =

            clients.length

                ?

                clients
                    .map(

                        client => `

                            <div
                                class="fm-coach-client"
                            >

                                <span
                                    class="fm-coach-client-avatar"
                                >

                                    ${this.getInitials(
                            client.clientName
                        )}

                                </span>


                                <span>

                                    ${this.escapeHtml(
                            client.clientName
                        )}

                                </span>

                            </div>

                        `

                    )
                    .join("")

                :

                `

                    <span class="fm-coach-no-clients">

                        Aún no hay reservaciones.

                    </span>

                `;


        return `

            <article
                class="
                    fm-coach-class-card
                    ${isFinished
                ? "finished"
                : isStarted
                    ? "started"
                    : ""
            }
                "
            >

                <div
                    class="fm-coach-class-time"
                >

                    <strong>

                        ${this.formatTime(
                item.startTime
            )}

                    </strong>


                    <span>

                        ${this.calculateEndTime(
                item.startTime,
                item.duration
            )}

                    </span>

                </div>


                <div
                    class="fm-coach-class-content"
                >

                    <div
                        class="fm-coach-class-title-row"
                    >

                        <h4>

                            ${this.escapeHtml(
                item.activityName
                ||
                "Clase"
            )}

                        </h4>


                        ${statusHtml}

                    </div>


                    <div
                        class="fm-coach-class-meta"
                    >

                        <span>

                            <span class="material-symbols-outlined">

                                group

                            </span>

                            ${reserved}
                            /
                            ${capacity}

                            reservadas

                        </span>


                        <span>

                            <span class="material-symbols-outlined">

                                event_seat

                            </span>

                            ${remaining}

                            disponibles

                        </span>

                    </div>


                    <div
                        class="fm-coach-class-clients"
                    >

                        <strong>

                            Clientas inscritas

                        </strong>


                        <div
                            class="fm-coach-client-list"
                        >

                            ${clientHtml}

                        </div>

                    </div>

                </div>

            </article>

        `;

    }


    // ====================================================
    // SIN CLASES
    // ====================================================

    renderEmptyClasses() {

        const title =
            this.currentPeriod === "today"

                ?

                "No tienes clases programadas para hoy"

                :

                this.currentPeriod === "week"

                    ?

                    "No tienes clases programadas esta semana"

                    :

                    "No tienes clases programadas este mes";


        return `

            <div class="fm-coach-empty">

                <span class="material-symbols-outlined">

                    event_available

                </span>


                <strong>

                    ${title}

                </strong>


                <p>

                    Cuando tengas clases asignadas aparecerán aquí.

                </p>

            </div>

        `;

    }


    // ====================================================
    // TÍTULO DE CLASES
    // ====================================================

    getClassesTitle() {

        return {

            today:
                "Clases de hoy",

            week:
                "Clases de la semana",

            month:
                "Clases del mes"

        }[
            this.currentPeriod
        ]
            ||
            "Clases";

    }


    // ====================================================
    // ETIQUETA DEL PERÍODO
    // ====================================================

    getPeriodLabel() {

        return {

            today:
                "HOY",

            week:
                "SEMANA",

            month:
                "MES"

        }[
            this.currentPeriod
        ]
            ||
            "AGENDA";

    }


    // ====================================================
    // ERROR
    // ====================================================

    showError(
        message
    ) {

        const container =
            document.getElementById(
                "workspace"
            );


        if (
            !container
        ) {

            return;

        }


        container.innerHTML = `

            <div class="fm-coach-empty">

                <span class="material-symbols-outlined">

                    error

                </span>


                <strong>

                    No fue posible cargar las clases

                </strong>


                <p>

                    ${this.escapeHtml(
            message
            ||
            "Ocurrió un error inesperado."
        )}

                </p>

            </div>

        `;

    }


    // ====================================================
    // FECHA
    // ====================================================

    formatToday(
        dateString
    ) {

        if (
            !dateString
        ) {

            return "";

        }


        const date =
            new Date(
                `${dateString}T12:00:00`
            );


        if (
            Number.isNaN(
                date.getTime()
            )
        ) {

            return this.escapeHtml(
                dateString
            );

        }


        return this.escapeHtml(

            date.toLocaleDateString(

                "es-MX",

                {

                    weekday:
                        "long",

                    day:
                        "numeric",

                    month:
                        "long"

                }

            )

        );

    }


    // ====================================================
    // HORA
    // ====================================================

    formatTime(
        value
    ) {

        return String(
            value || ""
        )
            .slice(
                0,
                5
            );

    }


    // ====================================================
    // HORA FINAL
    // ====================================================

    calculateEndTime(
        startTime,
        duration
    ) {

        const start =
            this.timeToMinutes(
                startTime
            );


        const minutes =
            Number(
                duration
            )
            ||
            0;


        if (
            start === null
        ) {

            return "-";

        }


        const end =
            start +
            minutes;


        const hours =
            Math.floor(
                end / 60
            ) % 24;


        const mins =
            end % 60;


        return `${String(
            hours
        ).padStart(
            2,
            "0"
        )}:${String(
            mins
        ).padStart(
            2,
            "0"
        )}`;

    }


    // ====================================================
    // CONVERTIR HORA
    // ====================================================

    timeToMinutes(
        value
    ) {

        if (
            !value
        ) {

            return null;

        }


        const parts =
            String(
                value
            )
                .slice(
                    0,
                    5
                )
                .split(
                    ":"
                )
                .map(
                    Number
                );


        if (

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

            parts[0] *
            60

        )
            +
            parts[1];

    }


    // ====================================================
    // INICIALES
    // ====================================================

    getInitials(
        name
    ) {

        return String(
            name || "C"
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

                part =>
                    part
                        .charAt(
                            0
                        )
                        .toUpperCase()

            )
            .join("")
            ||
            "C";

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

window.DashboardModule =
    new DashboardModule();


// ====================================================
// REGISTER
// ====================================================

ModuleFactory.register(

    "dashboard",

    window.DashboardModule

);