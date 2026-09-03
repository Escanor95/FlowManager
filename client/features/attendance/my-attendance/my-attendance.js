/*
====================================================

    FLOWMANAGER

    MY ATTENDANCE MODULE

====================================================
*/

class MyAttendanceModule extends Module {

    constructor() {

        super(
            "My Attendance"
        );

        this.client = null;

        this.attendances = [];

    }


    // ====================================================
    // ABRIR
    // ====================================================

    async open() {

        await this.load(
            "attendance/my-attendance/my-attendance"
        );

        await this.initialize();

    }


    // ====================================================
    // INICIALIZAR
    // ====================================================

    async initialize() {

        const user =
            AuthService.getUser();


        if (
            !user
            ||
            (
                user.role !== "client"
                &&
                user.role !== "clienta"
            )
            ||
            !user.clientId
        ) {

            throw new Error(
                "No tienes permiso para acceder a este módulo."
            );

        }


        await this.loadClient(
            user.clientId
        );


        await this.loadAttendances(
            user.clientId
        );


        this.renderStats();

        this.renderAttendances();

    }


    // ====================================================
    // CARGAR CLIENTE
    // ====================================================

    async loadClient(
        clientId
    ) {

        try {

            this.client =
                await ClientService.get(
                    clientId
                );

        }

        catch (error) {

            console.error(
                "Error al cargar cliente:",
                error
            );

            this.client =
                null;

        }

    }


    // ====================================================
    // CARGAR ASISTENCIAS
    // ====================================================

    async loadAttendances(
        clientId
    ) {

        try {

            this.attendances =
                await AttendanceService.getByClient(
                    clientId
                );

        }

        catch (error) {

            console.error(
                "Error al cargar asistencias:",
                error
            );

            this.attendances = [];

        }

    }


    // ====================================================
    // ESTADÍSTICAS
    // ====================================================

    renderStats() {

        const container =
            document.getElementById(
                "myAttendanceStats"
            );


        if (!container) {

            return;

        }


        const total =
            this.attendances.length;


        const currentMonth =
            new Date().getMonth();


        const currentYear =
            new Date().getFullYear();


        const thisMonth =
            this.attendances.filter(
                attendance => {

                    const value =
                        attendance.attendanceDate
                        ||
                        attendance.createdAt;


                    if (!value) {

                        return false;

                    }


                    const date =
                        new Date(
                            value
                        );


                    return (

                        date.getMonth()
                        ===
                        currentMonth

                        &&

                        date.getFullYear()
                        ===
                        currentYear

                    );

                }

            ).length;


        container.innerHTML = `

            <div class="fm-my-attendance-stat">

                <div class="fm-my-attendance-stat-label">

                    Total de asistencias

                </div>

                <div class="fm-my-attendance-stat-value">

                    ${total}

                </div>

            </div>


            <div class="fm-my-attendance-stat">

                <div class="fm-my-attendance-stat-label">

                    Este mes

                </div>

                <div class="fm-my-attendance-stat-value">

                    ${thisMonth}

                </div>

            </div>

        `;

    }


    // ====================================================
    // RENDER HISTORIAL
    // ====================================================

    renderAttendances() {

        const container =
            document.getElementById(
                "myAttendanceList"
            );


        if (!container) {

            return;

        }


        container.innerHTML =
            "";


        if (
            !this.attendances.length
        ) {

            container.innerHTML = `

                <div class="fm-my-attendance-empty">

                    Aún no tienes asistencias registradas.

                </div>

            `;

            return;

        }


        this.attendances.forEach(

            attendance => {

                const item =
                    document.createElement(
                        "div"
                    );


                item.className =
                    "fm-my-attendance-item";


                const info =
                    document.createElement(
                        "div"
                    );


                info.className =
                    "fm-my-attendance-item-info";


                const title =
                    document.createElement(
                        "div"
                    );


                title.className =
                    "fm-my-attendance-item-title";


                title.textContent =

                    attendance.activityName

                    ||

                    attendance.scheduleName

                    ||

                    "Clase";


                const date =
                    document.createElement(
                        "div"
                    );


                date.className =
                    "fm-my-attendance-item-date";


                date.textContent =
                    this.formatDate(

                        attendance.attendanceDate

                        ||

                        attendance.createdAt

                    );


                info.append(
                    title,
                    date
                );


                const status =
                    document.createElement(
                        "div"
                    );


                status.className =
                    "fm-my-attendance-item-status";


                status.textContent =
                    "Asistencia";


                item.append(
                    info,
                    status
                );


                container.appendChild(
                    item
                );

            }

        );

    }


    // ====================================================
    // FORMATEAR FECHA
    // ====================================================

    formatDate(
        value
    ) {

        if (!value) {

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

                weekday:
                    "long",

                year:
                    "numeric",

                month:
                    "long",

                day:
                    "numeric"

            }

        );

    }

}


// ====================================================
// CREAR MÓDULO
// ====================================================

window.MyAttendanceModule =
    new MyAttendanceModule();


// ====================================================
// REGISTRAR MÓDULO
// ====================================================

ModuleFactory.register(

    "my-attendance",

    window.MyAttendanceModule

);


console.log(
    "MyAttendanceModule registrado correctamente"
);