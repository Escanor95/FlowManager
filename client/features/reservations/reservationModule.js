/*
====================================================

    FLOWMANAGER

    RESERVATION MODULE

====================================================
*/

class ReservationModule extends Module {

    constructor() {

        super("Reservations");

        this.user = null;

        this.mode = "client";

        this.selectedClient = null;

        this.coach = null;

        this.schedules = [];

        this.visibleDate =
            this.getToday();

        this.viewMode = "week";

        this.selectedReservations =
            new Map();

        this.availabilityBySchedule =
            {};

        this.calendar =
            null;

    }


    // ====================================================
    // OPEN
    // ====================================================

    async open() {

        await this.load(
            "reservations/reservations"
        );


        this.calendar =
            null;


        this.user =
            AuthService.getUser();


        await this.initialize();

    }


    // ====================================================
    // INITIALIZE
    // ====================================================

    async initialize() {

        if (
            !this.user
        ) {

            throw new Error(
                "No hay una sesión activa."
            );

        }


        const role =
            String(
                this.user.role || ""
            )
                .trim()
                .toLowerCase();


        // =================================================
        // CLIENTE
        // =================================================

        if (

            role === "client"

            ||

            role === "clienta"

            ||

            role === "cliente"

        ) {

            this.mode =
                "client";


            await this.initializeClientReservation(
                this.user
            );

        }


        // =================================================
        // COACH
        // =================================================

        else if (
            role === "coach"
        ) {

            this.mode =
                "coach";


            await this.initializeCoachReservation(
                this.user
            );

        }


        // =================================================
        // PERSONAL ADMINISTRATIVO
        // =================================================

        else {

            this.mode =
                "staff";


            await this.initializeStaffReservation();

        }


        await this.loadSchedules();


        // =================================================
        // COACH
        // =================================================

        if (
            this.mode === "coach"
        ) {

            await this.loadCoachAvailability();

            return;

        }


        // =================================================
        // CLIENTA / STAFF
        // =================================================

        this.renderMembership();

        await this.loadAvailability();

    }


    // ====================================================
    // CLIENTA
    // ====================================================

    async initializeClientReservation(
        user
    ) {

        const clientSection =
            document.querySelector(
                ".fm-reservation-client"
            );


        if (
            clientSection
        ) {

            clientSection.style.display =
                "none";

        }


        try {

            const client =
                await ClientService.get(
                    user.clientId
                );


            if (
                !client
            ) {

                throw new Error(
                    "No fue posible encontrar el perfil de la clienta."
                );

            }


            this.selectedClient =
                client;


            const description =
                document.getElementById(
                    "reservationPageDescription"
                );


            if (
                description
            ) {

                description.textContent =
                    "Elige tus clases disponibles y confirma tus reservaciones.";

            }


            this.clearSelections();

        }

        catch (error) {

            console.error(
                error
            );


            alert(
                "No fue posible cargar tu información."
            );

        }

    }


    // ====================================================
    // COACH
    //
    // IMPORTANTE:
    //
    // Un coach NO puede reservar una clase que él mismo
    // imparte.
    //
    // Por eso aquí solamente se muestran horarios cuyo
    // coachId sea diferente al coach autenticado.
    // ====================================================

    async initializeCoachReservation(
        user
    ) {

        this.selectedClient =
            null;


        this.coach = {

            coachId:
                user.coachId || null,

            fullName:
                user.fullName ||
                "Coach"

        };


        const clientSection =
            document.querySelector(
                ".fm-reservation-client"
            );


        if (
            clientSection
        ) {

            clientSection.style.display =
                "none";

        }


        const selector =
            document.getElementById(
                "reservationClientSelector"
            );


        if (
            selector
        ) {

            selector.style.display =
                "none";

        }


        const title =
            document.getElementById(
                "reservationClientTitle"
            );


        if (
            title
        ) {

            title.textContent =
                "Mi reserva";

        }


        const description =
            document.getElementById(
                "reservationPageDescription"
            );


        if (
            description
        ) {

            description.textContent =
                "Reserva únicamente clases disponibles para ti.";

        }


        const membership =
            document.getElementById(
                "reservationMembership"
            );


        if (
            membership
        ) {

            membership.innerHTML = `

                <div class="fm-reservation-coach-info">

                    <strong>

                        ${this.escapeHtml(
                user.fullName ||
                "Coach"
            )}

                    </strong>


                    <span>

                        Reserva personal de coach.

                    </span>


                    <span>

                        No puedes reservar las clases que impartes.

                    </span>

                </div>

            `;

        }


        this.clearSelections();

    }


    // ====================================================
    // STAFF
    // ====================================================

    async initializeStaffReservation() {

        await ReservationClientSelector.init(

            "#reservationClientSelector",

            client =>
                this.selectClient(
                    client
                )

        );

    }


    // ====================================================
    // SELECTOR CLIENTA
    // ====================================================

    async selectClient(
        client
    ) {

        if (
            this.mode !== "staff"
        ) {

            return;

        }


        if (
            !client ||
            !client.clientId
        ) {

            return;

        }


        this.selectedClient =
            client;


        this.clearSelections();

        this.renderMembership();

        await this.loadAvailability();

    }


    // ====================================================
    // HORARIOS
    // ====================================================

    async loadSchedules() {

        try {

            const schedules =
                await ScheduleService.getAll();


            this.schedules =
                Array.isArray(
                    schedules
                )
                    ? schedules.filter(

                        schedule =>
                            schedule.isActive !== false

                    )
                    : [];

        }

        catch (error) {

            console.error(
                error
            );


            this.schedules =
                [];

        }

    }


    // ====================================================
    // LIMPIAR
    // ====================================================

    clearSelections() {

        this.selectedReservations.clear();

        this.availabilityBySchedule =
            {};

        this.renderSummary();

    }


    // ====================================================
    // DISPONIBILIDAD CLIENTA
    // ====================================================

    async loadAvailability() {

        if (
            this.mode === "coach"
        ) {

            return;

        }


        if (
            !this.selectedClient
        ) {

            this.mountCalendar();

            return;

        }


        try {

            const range =
                this.getCurrentRange();


            this.availabilityBySchedule =
                {};


            for (
                const schedule
                of this.schedules
            ) {

                const data =
                    await ReservationService.getAvailability({

                        clientId:
                            this.selectedClient.clientId,

                        scheduleId:
                            schedule.scheduleId,

                        from:
                            range.from,

                        to:
                            range.to

                    });


                this.availabilityBySchedule[
                    schedule.scheduleId
                ] =
                    data.dates || {};

            }


            this.mountCalendar();

            this.renderSummary();

        }

        catch (error) {

            console.error(
                "Reservation availability error:",
                error
            );


            const container =
                document.getElementById(
                    "reservationCalendar"
                );


            if (
                container
            ) {

                container.innerHTML = `

                    <div class="empty-state">

                        ${this.escapeHtml(
                    error.message
                )}

                    </div>

                `;

            }

        }

    }


    // ====================================================
    // DISPONIBILIDAD COACH
    //
    // SOLO MUESTRA CLASES QUE EL COACH NO IMPARTE.
    //
    // EL BACKEND DEBE VOLVER A VALIDAR ESTA REGLA.
    // ====================================================

    async loadCoachAvailability() {

        if (
            this.mode !== "coach"
        ) {

            return;

        }


        const container =
            document.getElementById(
                "reservationCalendar"
            );


        if (
            !this.user?.coachId
        ) {

            if (
                container
            ) {

                container.innerHTML = `

                    <div class="empty-state">

                        Tu cuenta de coach no tiene
                        un perfil de coach asociado.

                    </div>

                `;

            }


            return;

        }


        try {

            const range =
                this.getCurrentRange();


            this.availabilityBySchedule =
                {};


            // =================================================
            // SOLO CLASES QUE NO IMPARTE EL COACH
            // =================================================

            const reservableSchedules =
                this.getCoachReservableSchedules();


            for (
                const schedule
                of reservableSchedules
            ) {

                const data =
                    await ReservationService.getCoachAvailability({

                        scheduleId:
                            schedule.scheduleId,

                        from:
                            range.from,

                        to:
                            range.to

                    });


                this.availabilityBySchedule[
                    schedule.scheduleId
                ] =
                    data.dates || {};

            }


            this.mountCalendar();

            this.renderSummary();

        }

        catch (error) {

            console.error(
                "Coach availability error:",
                error
            );


            if (
                container
            ) {

                container.innerHTML = `

                    <div class="empty-state">

                        ${this.escapeHtml(
                    error.message
                )}

                    </div>

                `;

            }

        }

    }


    // ====================================================
    // OBTENER TODAS LAS CLASES DEL COACH
    //
    // Se conserva para consultas internas.
    // ====================================================

    getCoachSchedules() {

        if (
            this.mode !== "coach"
        ) {

            return [];

        }


        const coachId =
            this.user?.coachId ||
            this.coach?.coachId ||
            null;


        if (
            !coachId
        ) {

            return [];

        }


        return this.schedules.filter(

            schedule =>

                String(
                    schedule.coachId || ""
                )
                ===
                String(
                    coachId
                )

        );

    }


    // ====================================================
    // OBTENER CLASES QUE EL COACH PUEDE RESERVAR
    //
    // REGLA:
    //
    // schedule.coachId === coachId
    //
    // NO SE PUEDE RESERVAR.
    //
    // schedule.coachId vacío/null
    // schedule.coachId diferente
    //
    // SÍ SE PUEDE RESERVAR.
    // ====================================================

    getCoachReservableSchedules() {

        if (
            this.mode !== "coach"
        ) {

            return [];

        }


        const coachId =
            this.user?.coachId ||
            this.coach?.coachId ||
            null;


        if (
            !coachId
        ) {

            return [];

        }


        return this.schedules.filter(

            schedule => {

                const assignedCoachId =
                    String(
                        schedule.coachId || ""
                    )
                        .trim();


                return (

                    assignedCoachId === ""

                    ||

                    assignedCoachId !==
                    String(
                        coachId
                    )

                );

            }

        );

    }


    // ====================================================
    // VALIDAR SI EL COACH PUEDE RESERVAR EL HORARIO
    // ====================================================

    canCoachReserveSchedule(
        schedule
    ) {

        if (
            this.mode !== "coach"
        ) {

            return false;

        }


        if (
            !schedule
        ) {

            return false;

        }


        const coachId =
            this.user?.coachId ||
            this.coach?.coachId ||
            null;


        if (
            !coachId
        ) {

            return false;

        }


        const assignedCoachId =
            String(
                schedule.coachId || ""
            )
                .trim();


        return (

            assignedCoachId === ""

            ||

            assignedCoachId !==
            String(
                coachId
            )

        );

    }


    // ====================================================
    // CALENDARIO
    // ====================================================

    mountCalendar() {

        const options = {

            visibleDate:
                this.visibleDate,

            viewMode:
                this.viewMode,

            getDateState:
                date =>
                    this.getDateState(
                        date
                    ),

            onViewChange:
                async ({
                    visibleDate,
                    viewMode
                }) => {

                    this.visibleDate =
                        visibleDate;

                    this.viewMode =
                        viewMode;


                    if (
                        this.mode === "coach"
                    ) {

                        await this.loadCoachAvailability();

                    }

                    else {

                        await this.loadAvailability();

                    }

                },

            renderDateContent:
                date =>
                    this.renderDateContent(
                        date
                    )

        };


        if (
            !this.calendar
        ) {

            this.calendar =
                new FlowCalendar({

                    container:
                        "#reservationCalendar",

                    ...options

                });

        }

        else {

            this.calendar.setState(
                options
            );

        }

    }


    // ====================================================
    // ESTADO DEL DÍA
    // ====================================================

    getDateState(
        date
    ) {

        const classes =
            this.getSchedulesForDate(
                date
            );


        if (
            !classes.length
        ) {

            return {

                enabled:
                    false,

                reason:
                    "NO_CLASSES",

                label:
                    this.mode === "coach"

                        ? "No hay clases disponibles para reservar este día."

                        : "No hay clases este día."

            };

        }


        const available =
            classes.some(

                item =>
                    item.availability?.eligible === true

            );


        return {

            enabled:
                available,

            reason:
                available
                    ? "AVAILABLE"
                    : "UNAVAILABLE",

            label:
                available

                    ? "Hay clases disponibles."

                    : "No hay disponibilidad."

        };

    }


    // ====================================================
    // CONTENIDO DEL DÍA
    // ====================================================

    renderDateContent(
        date
    ) {

        const wrapper =
            document.createElement(
                "div"
            );


        wrapper.className =
            "fm-reservation-day-classes";


        const classes =
            this.getSchedulesForDate(
                date
            );


        classes.forEach(

            item => {

                const card =
                    this.createClassCard(

                        item.schedule,

                        date,

                        item.availability

                    );


                wrapper.appendChild(
                    card
                );

            }

        );


        return wrapper;

    }


    // ====================================================
    // CLASES DEL DÍA
    // ====================================================

    getSchedulesForDate(
        date
    ) {

        const weekday =
            this.getWeekday(
                date
            );


        let schedules =
            this.schedules;


        // =================================================
        // COACH
        //
        // SOLO CLASES QUE PUEDE RESERVAR.
        // =================================================

        if (
            this.mode === "coach"
        ) {

            schedules =
                this.getCoachReservableSchedules();

        }


        return schedules

            .filter(

                schedule =>

                    String(
                        schedule.weekday || ""
                    )
                        .toLowerCase()

                    ===

                    String(
                        weekday
                    )
                        .toLowerCase()

            )

            .map(

                schedule => {

                    const dates =
                        this.availabilityBySchedule[
                        schedule.scheduleId
                        ] || {};


                    return {

                        schedule,

                        availability:
                            dates[date] || null

                    };

                }

            );

    }


    // ====================================================
    // TARJETA DE CLASE
    // ====================================================

    createClassCard(
        schedule,
        date,
        availability
    ) {

        const card =
            document.createElement(
                "button"
            );


        card.type =
            "button";


        card.className =
            "fm-reservation-class";


        const key =
            `${schedule.scheduleId}_${date}`;


        const selected =
            this.selectedReservations.has(
                key
            );


        let eligible =
            availability?.eligible === true;


        // =================================================
        // SEGURIDAD FRONTEND
        //
        // Aunque accidentalmente llegue una clase
        // asignada al coach, no podrá seleccionarla.
        // =================================================

        if (
            this.mode === "coach"
            &&
            !this.canCoachReserveSchedule(
                schedule
            )
        ) {

            eligible =
                false;

        }


        if (
            selected
        ) {

            card.classList.add(
                "selected"
            );

        }


        if (
            !eligible
        ) {

            card.classList.add(
                "disabled"
            );

            card.disabled =
                true;

        }


        const remaining =
            availability?.remaining ??
            schedule.capacity;


        card.innerHTML = `

            <div
                class="fm-reservation-class-color"
                style="
                    background:${schedule.color ||
            "var(--fm-primary)"
            };
                "
            ></div>


            <div
                class="fm-reservation-class-content"
            >

                <div
                    class="fm-reservation-class-title"
                >

                    <span
                        class="material-symbols-outlined"
                        style="
                            color:${schedule.color ||
            "var(--fm-primary)"
            };
                        "
                    >

                        ${schedule.icon ||
            "fitness_center"}

                    </span>


                    <strong>

                        ${this.escapeHtml(
                schedule.name ||
                "Clase"
            )}

                    </strong>

                </div>


                <div
                    class="fm-reservation-class-time"
                >

                    ${this.escapeHtml(
                String(
                    schedule.startTime ||
                    ""
                )
            )}

                    -

                    ${this.getEndTime(

                schedule.startTime,

                schedule.duration

            )}

                </div>


                <div
                    class="fm-reservation-class-capacity"
                >

                    ${remaining}/${schedule.capacity}

                </div>

            </div>

        `;


        if (
            eligible
        ) {

            card.addEventListener(

                "click",

                event => {

                    event.preventDefault();

                    event.stopPropagation();


                    this.toggleReservation(

                        schedule,

                        date,

                        availability

                    );

                }

            );

        }


        return card;

    }


    // ====================================================
    // TOGGLE
    // ====================================================

    toggleReservation(
        schedule,
        date,
        availability
    ) {

        // =================================================
        // SEGURIDAD:
        // UN COACH NUNCA PUEDE SELECCIONAR UNA CLASE
        // QUE ÉL MISMO IMPARTE.
        // =================================================

        if (

            this.mode === "coach"

            &&

            !this.canCoachReserveSchedule(
                schedule
            )

        ) {

            alert(
                "No puedes reservar una clase que tú impartes."
            );

            return;

        }


        const key =
            `${schedule.scheduleId}_${date}`;


        if (
            this.selectedReservations.has(
                key
            )
        ) {

            this.selectedReservations.delete(
                key
            );

        }

        else {

            // =================================================
            // SOLO CLIENTA
            // =================================================

            if (
                this.mode === "client"
            ) {

                const remainingClasses =
                    this.selectedClient
                        ?.remainingClasses;


                if (
                    remainingClasses !== null
                    &&
                    remainingClasses !== undefined
                ) {

                    const limit =
                        Number(
                            remainingClasses
                        );


                    if (

                        Number.isFinite(
                            limit
                        )

                        &&

                        this.selectedReservations.size >=
                        limit

                    ) {

                        alert(

                            `Tu membresía permite reservar hasta ${limit} clases.`

                        );

                        return;

                    }

                }

            }


            this.selectedReservations.set(

                key,

                {

                    schedule,

                    date,

                    availability

                }

            );

        }


        this.renderSummary();

        this.mountCalendar();

    }


    // ====================================================
    // MEMBRESÍA
    // ====================================================

    renderMembership() {

        const container =
            document.getElementById(
                "reservationMembership"
            );


        if (
            !container
        ) {

            return;

        }


        if (
            this.mode === "coach"
        ) {

            const name =
                this.user?.fullName ||
                "Coach";


            const assigned =
                this.getCoachSchedules();


            const reservable =
                this.getCoachReservableSchedules();


            container.innerHTML = `

                <div class="fm-reservation-coach-info">

                    <strong>

                        ${this.escapeHtml(
                name
            )}

                    </strong>


                    <span>

                        Reserva personal de coach.

                    </span>


                    <span>

                        No puedes reservar las clases que impartes.

                    </span>


                    <span>

                        ${reservable.length}

                        ${reservable.length === 1
                    ? "clase disponible"
                    : "clases disponibles"
                }
                        para reservar.

                    </span>

                </div>

            `;

            return;

        }


        if (
            !this.selectedClient
        ) {

            container.textContent =
                "Selecciona una clienta para consultar su membresía.";

            return;

        }


        const unlimited =
            this.selectedClient.remainingClasses === null;


        container.innerHTML =
            "";


        const name =
            document.createElement(
                "strong"
            );


        name.textContent =
            this.selectedClient.fullName;


        container.appendChild(
            name
        );


        const details = [

            `Membresía: ${this.selectedClient.membershipName ||
            this.selectedClient.membershipId ||
            "Sin membresía"
            }`,

            `Inicio: ${this.formatDate(
                this.selectedClient.startDate
            )
            }`,

            `Vencimiento: ${this.formatDate(
                this.selectedClient.endDate
            )
            }`,

            `Clases restantes: ${unlimited
                ? "Ilimitadas"
                : this.selectedClient.remainingClasses
            }`

        ];


        details.forEach(

            detail => {

                container.appendChild(
                    document.createElement(
                        "br"
                    )
                );


                container.appendChild(
                    document.createTextNode(
                        detail
                    )
                );

            }

        );

    }


    // ====================================================
    // RESUMEN
    // ====================================================

    renderSummary() {

        const target =
            document.getElementById(
                "reservationSummary"
            );


        if (
            !target
        ) {

            return;

        }


        target.innerHTML =
            "";


        const reservations =
            [...this.selectedReservations.values()]
                .sort(

                    (a, b) =>
                        a.date.localeCompare(
                            b.date
                        )

                );


        if (
            this.mode !== "coach"
            &&
            !this.selectedClient
        ) {

            target.textContent =
                "Selecciona una clienta.";

            return;

        }


        if (
            !reservations.length
        ) {

            target.textContent =
                "Selecciona una o más clases.";

            return;

        }


        const heading =
            document.createElement(
                "h3"
            );


        heading.textContent =

            `${reservations.length} clase${reservations.length === 1
                ? ""
                : "s"
            } seleccionada${reservations.length === 1
                ? ""
                : "s"
            }`;


        const list =
            document.createElement(
                "div"
            );


        list.className =
            "fm-reservation-summary-list";


        reservations.forEach(

            item => {

                const li =
                    document.createElement(
                        "div"
                    );


                li.className =
                    "fm-reservation-summary-item";


                const info =
                    document.createElement(
                        "span"
                    );


                info.textContent =

                    `${this.formatDate(
                        item.date
                    )} · ${item.schedule.name
                    } · ${item.schedule.startTime
                    }`;


                const remove =
                    document.createElement(
                        "button"
                    );


                remove.type =
                    "button";


                remove.className =
                    "fm-btn";


                remove.textContent =
                    "Quitar";


                remove.onclick =
                    () => {

                        const key =
                            `${item.schedule.scheduleId}_${item.date}`;


                        this.selectedReservations.delete(
                            key
                        );


                        this.renderSummary();

                        this.mountCalendar();

                    };


                li.append(
                    info,
                    remove
                );


                list.appendChild(
                    li
                );

            }

        );


        const confirm =
            document.createElement(
                "button"
            );


        confirm.type =
            "button";


        confirm.className =
            "fm-btn fm-btn-primary";


        confirm.textContent =
            this.mode === "coach"

                ? "Reservar clases"

                : "Confirmar reservaciones";


        confirm.onclick =
            () =>
                this.confirmReservations();


        target.append(

            heading,

            list,

            confirm

        );

    }


    // ====================================================
    // CONFIRMAR
    // ====================================================

    async confirmReservations() {

        if (
            !this.selectedReservations.size
        ) {

            return;

        }


        const grouped =
            new Map();


        this.selectedReservations.forEach(

            item => {

                // =================================================
                // SEGURIDAD EXTRA ANTES DE ENVIAR
                // =================================================

                if (
                    this.mode === "coach"
                    &&
                    !this.canCoachReserveSchedule(
                        item.schedule
                    )
                ) {

                    return;

                }


                const scheduleId =
                    item.schedule.scheduleId;


                if (
                    !grouped.has(
                        scheduleId
                    )
                ) {

                    grouped.set(

                        scheduleId,

                        []

                    );

                }


                grouped
                    .get(
                        scheduleId
                    )
                    .push(
                        item.date
                    );

            }

        );


        if (
            !grouped.size
        ) {

            this.selectedReservations.clear();

            this.renderSummary();

            this.mountCalendar();

            return;

        }


        try {

            for (
                const [
                    scheduleId,
                    dates
                ]
                of grouped
            ) {

                if (
                    this.mode === "coach"
                ) {

                    await ReservationService.createCoachBatch({

                        scheduleId,

                        reservationDates:
                            dates.sort()

                    });

                }

                else {

                    await ReservationService.createBatch({

                        clientId:
                            this.selectedClient.clientId,

                        scheduleId,

                        reservationDates:
                            dates.sort()

                    });

                }

            }


            this.selectedReservations.clear();


            alert(

                this.mode === "coach"

                    ? "Reservación realizada correctamente."

                    : "Reservaciones confirmadas."

            );


            if (
                this.mode === "coach"
            ) {

                await this.loadCoachAvailability();

            }

            else {

                await this.loadAvailability();

            }

        }

        catch (error) {

            console.error(
                "Reservation confirmation error:",
                error
            );


            alert(
                error.message
            );


            if (
                this.mode === "coach"
            ) {

                await this.loadCoachAvailability();

            }

            else {

                await this.loadAvailability();

            }

        }

    }


    // ====================================================
    // CAMBIO DE FECHA
    // ====================================================

    handleDateSelection(
        dates
    ) {

        this.mountCalendar();

    }


    // ====================================================
    // END TIME
    // ====================================================

    getEndTime(
        startTime,
        duration
    ) {

        if (
            !startTime
        ) {

            return "-";

        }


        const [

            hours,

            minutes

        ] =
            String(
                startTime
            )
                .split(":")
                .map(
                    Number
                );


        if (

            !Number.isFinite(hours)

            ||

            !Number.isFinite(minutes)

        ) {

            return "-";

        }


        const date =
            new Date();


        date.setHours(

            hours,

            minutes +
            Number(
                duration
            ),

            0,

            0

        );


        return date.toLocaleTimeString(

            [],

            {

                hour:
                    "2-digit",

                minute:
                    "2-digit",

                hour12:
                    false

            }

        );

    }


    // ====================================================
    // CURRENT RANGE
    // ====================================================

    getCurrentRange() {

        const [

            year,

            month,

            day

        ] =
            this.visibleDate
                .split("-")
                .map(
                    Number
                );


        const visible =
            new Date(

                year,

                month - 1,

                day

            );


        const offset =

            (
                visible.getDay() +
                6
            ) % 7;


        visible.setDate(

            visible.getDate() -
            offset

        );


        const end =
            new Date(
                visible
            );


        end.setDate(

            end.getDate() +
            6

        );


        return {

            from:
                this.toDateKey(
                    visible
                ),

            to:
                this.toDateKey(
                    end
                )

        };

    }


    // ====================================================
    // WEEKDAY
    // ====================================================

    getWeekday(
        date
    ) {

        const days = [

            "Sunday",

            "Monday",

            "Tuesday",

            "Wednesday",

            "Thursday",

            "Friday",

            "Saturday"

        ];


        const [

            year,

            month,

            day

        ] =
            String(
                date
            )
                .split("-")
                .map(
                    Number
                );


        return days[

            new Date(

                year,

                month - 1,

                day

            )
                .getDay()

        ];

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


        const match =
            String(
                value
            )
                .match(
                    /^(\d{4})-(\d{2})-(\d{2})/
                );


        if (
            !match
        ) {

            return "-";

        }


        return new Date(

            Number(
                match[1]
            ),

            Number(
                match[2]
            ) - 1,

            Number(
                match[3]
            )

        )
            .toLocaleDateString(

                "es-MX",

                {

                    weekday:
                        "long",

                    day:
                        "numeric",

                    month:
                        "long"

                }

            );

    }


    // ====================================================
    // DATE KEY
    // ====================================================

    toDateKey(
        date
    ) {

        return `${date.getFullYear()}-${String(

            date.getMonth() + 1

        ).padStart(

            2,

            "0"

        )}-${String(

            date.getDate()

        ).padStart(

            2,

            "0"

        )}`;

    }


    // ====================================================
    // TODAY
    // ====================================================

    getToday() {

        return this.toDateKey(
            new Date()
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

window.ReservationModule =
    new ReservationModule();


// ====================================================
// REGISTER
// ====================================================

ModuleFactory.register(

    "reservations",

    window.ReservationModule

);