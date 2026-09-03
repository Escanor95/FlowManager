/*
====================================================

    FLOWMANAGER

    MY RESERVATIONS MODULE

====================================================
*/

class MyReservationsModule extends Module {

    constructor() {

        super(
            "My Reservations"
        );


        this.user =
            null;


        this.reservations =
            [];


        this.cancelHours =
            3;

    }


    // ====================================================
    // OPEN
    // ====================================================

    async open() {

        await this.load(
            "my-reservations/my-reservations"
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
                "No se encontró una sesión activa."
            );

        }


        await this.loadReservations();


        this.renderReservations();


        this.initializeEvents();

    }


    // ====================================================
    // DETECTAR COACH
    // ====================================================

    isCoach() {

        return (

            String(
                this.user?.role || ""
            )
                .trim()
                .toLowerCase()
            ===
            "coach"

        );

    }


    // ====================================================
    // EVENTS
    // ====================================================

    initializeEvents() {

        const reserveButton =
            document.querySelector(
                ".fm-my-reservations-new"
            );


        if (
            !reserveButton
        ) {

            return;

        }


        reserveButton.addEventListener(

            "click",

            async () => {

                await Router.navigate(
                    "reservations"
                );


                updateActiveMenu(
                    "reservations"
                );

            }

        );

    }


    // ====================================================
    // CARGAR RESERVACIONES
    // ====================================================

    async loadReservations() {

        try {

            // =============================================
            // COACH
            // =============================================

            if (
                this.isCoach()
            ) {

                if (

                    typeof ReservationService
                        .getByCoach
                    !==
                    "function"

                ) {

                    throw new Error(
                        "No existe el servicio de reservaciones del coach."
                    );

                }


                this.reservations =
                    await ReservationService.getByCoach();


                if (
                    !Array.isArray(
                        this.reservations
                    )
                ) {

                    this.reservations =
                        [];

                }


                return;

            }


            // =============================================
            // CLIENTA
            // =============================================

            const clientId =
                this.user?.clientId;


            if (
                !clientId
            ) {

                this.reservations =
                    [];

                return;

            }


            if (

                typeof ReservationService
                    .getByClient
                !==
                "function"

            ) {

                throw new Error(
                    "No existe el servicio de reservaciones de la clienta."
                );

            }


            this.reservations =
                await ReservationService.getByClient(
                    clientId
                );


            if (
                !Array.isArray(
                    this.reservations
                )
            ) {

                this.reservations =
                    [];

            }

        }

        catch (
        error
        ) {

            console.error(
                "Error al cargar reservaciones:",
                error
            );


            this.reservations =
                [];

        }

    }


    // ====================================================
    // RENDER
    // ====================================================

    renderReservations() {

        const upcomingContainer =
            document.getElementById(
                "myReservationsUpcoming"
            );


        const historyContainer =
            document.getElementById(
                "myReservationsHistory"
            );


        if (

            !upcomingContainer
            ||
            !historyContainer

        ) {

            return;

        }


        upcomingContainer.innerHTML =
            "";


        historyContainer.innerHTML =
            "";


        const now =
            new Date();


        const upcoming =
            this.reservations

                .filter(
                    reservation =>
                        this.isUpcoming(
                            reservation,
                            now
                        )
                )

                .sort(
                    (
                        a,
                        b
                    ) =>

                        this.getReservationDate(
                            a
                        )
                        -
                        this.getReservationDate(
                            b
                        )

                );


        const history =
            this.reservations

                .filter(
                    reservation =>
                        !this.isUpcoming(
                            reservation,
                            now
                        )
                )

                .sort(
                    (
                        a,
                        b
                    ) =>

                        this.getReservationDate(
                            b
                        )
                        -
                        this.getReservationDate(
                            a
                        )

                );


        // =============================================
        // PRÓXIMAS
        // =============================================

        if (
            !upcoming.length
        ) {

            upcomingContainer.innerHTML = `

                <div class="fm-my-reservations-empty">

                    <span class="material-symbols-outlined">

                        event_available

                    </span>


                    <strong>

                        No tienes reservaciones próximas

                    </strong>


                    <p>

                        ${this.isCoach()

                    ? "Cuando reserves una clase aparecerá aquí."

                    : "Cuando reserves una clase aparecerá aquí."
                }

                    </p>

                </div>

            `;

        }

        else {

            upcoming.forEach(

                reservation => {

                    upcomingContainer.appendChild(

                        this.createReservationCard(

                            reservation,

                            true

                        )

                    );

                }

            );

        }


        // =============================================
        // HISTORIAL
        // =============================================

        if (
            !history.length
        ) {

            historyContainer.innerHTML = `

                <div class="fm-my-reservations-empty">

                    <span class="material-symbols-outlined">

                        history

                    </span>


                    <strong>

                        Aún no hay historial

                    </strong>


                    <p>

                        Aquí aparecerán tus reservaciones anteriores.

                    </p>

                </div>

            `;

        }

        else {

            history.forEach(

                reservation => {

                    historyContainer.appendChild(

                        this.createReservationCard(

                            reservation,

                            false

                        )

                    );

                }

            );

        }

    }


    // ====================================================
    // CREATE CARD
    // ====================================================

    createReservationCard(
        reservation,
        isUpcoming
    ) {

        const card =
            document.createElement(
                "article"
            );


        card.className =
            "fm-my-reservation-card";


        const reservationDate =
            this.getReservationDate(
                reservation
            );


        const status =
            this.getStatus(
                reservation
            );


        const activityName =
            reservation.activityName
            ||
            reservation.scheduleName
            ||
            reservation.className
            ||
            reservation.activity?.name
            ||
            "Clase";


        const coachName =
            reservation.coachName
            ||
            reservation.coach?.fullName
            ||
            reservation.coach?.name
            ||
            "";


        const statusLabel =
            this.getStatusLabel(
                status,
                isUpcoming
            );


        const statusClass =
            this.getStatusClass(
                status,
                isUpcoming
            );


        const canCancel =
            isUpcoming
            &&
            this.canCancel(
                reservation
            );


        const header =
            document.createElement(
                "div"
            );


        header.className =
            "fm-my-reservation-card-header";


        const activity =
            document.createElement(
                "div"
            );


        activity.className =
            "fm-my-reservation-activity";


        const icon =
            document.createElement(
                "span"
            );


        icon.className =
            "material-symbols-outlined";


        icon.textContent =
            "calendar_month";


        const title =
            document.createElement(
                "div"
            );


        title.className =
            "fm-my-reservation-title";


        title.textContent =
            activityName;


        activity.append(
            icon,
            title
        );


        const statusElement =
            document.createElement(
                "span"
            );


        statusElement.className =
            `fm-my-reservation-status ${statusClass}`;


        statusElement.textContent =
            statusLabel;


        header.append(
            activity,
            statusElement
        );


        const details =
            document.createElement(
                "div"
            );


        details.className =
            "fm-my-reservation-details";


        const formattedDate =
            this.formatDate(
                reservationDate
            );


        const formattedTime =
            this.formatTime(
                reservationDate
            );


        details.innerHTML = `

            <div class="fm-my-reservation-detail">

                <span class="material-symbols-outlined">

                    calendar_today

                </span>

                <span>

                    ${this.escapeHtml(
            formattedDate
        )}

                </span>

            </div>


            <div class="fm-my-reservation-detail">

                <span class="material-symbols-outlined">

                    schedule

                </span>

                <span>

                    ${this.escapeHtml(
            formattedTime
        )}

                </span>

            </div>


            ${this.isCoach()

                ?

                `

                        <div class="fm-my-reservation-detail">

                            <span class="material-symbols-outlined">

                                badge

                            </span>

                            <span>

                                Reserva como coach

                            </span>

                        </div>

                    `

                :

                coachName

                    ?

                    `

                            <div class="fm-my-reservation-detail">

                                <span class="material-symbols-outlined">

                                    person

                                </span>

                                <span>

                                    ${this.escapeHtml(
                        coachName
                    )}

                                </span>

                            </div>

                        `

                    :

                    ""

            }

        `;


        card.append(
            header,
            details
        );


        // =================================================
        // CANCELAR
        // =================================================

        if (
            canCancel
        ) {

            const footer =
                document.createElement(
                    "div"
                );


            footer.className =
                "fm-my-reservation-card-footer";


            const cancelButton =
                document.createElement(
                    "button"
                );


            cancelButton.type =
                "button";


            cancelButton.className =
                "fm-my-reservation-cancel";


            cancelButton.innerHTML = `

                <span class="material-symbols-outlined">

                    cancel

                </span>

                Cancelar reservación

            `;


            cancelButton.addEventListener(

                "click",

                async event => {

                    event.preventDefault();

                    event.stopPropagation();


                    await this.cancelReservation(

                        reservation,

                        cancelButton

                    );

                }

            );


            footer.appendChild(
                cancelButton
            );


            card.appendChild(
                footer
            );

        }


        return card;

    }


    // ====================================================
    // CANCEL
    // ====================================================

    async cancelReservation(
        reservation,
        button
    ) {

        const confirmed =
            confirm(
                "¿Deseas cancelar esta reservación?"
            );


        if (
            !confirmed
        ) {

            return;

        }


        try {

            button.disabled =
                true;


            button.innerHTML = `

                <span class="material-symbols-outlined">

                    progress_activity

                </span>

                Cancelando...

            `;


            const reservationId =
                reservation?.reservationId
                ||
                reservation?.id;


            if (
                !reservationId
            ) {

                throw new Error(
                    "No se encontró el identificador de la reservación."
                );

            }


            await ReservationService.cancel(
                reservationId
            );


            await this.loadReservations();


            this.renderReservations();

        }

        catch (
        error
        ) {

            console.error(
                "Error al cancelar reservación:",
                error
            );


            alert(

                error.message
                ||
                "No fue posible cancelar la reservación."

            );


            button.disabled =
                false;


            button.innerHTML = `

                <span class="material-symbols-outlined">

                    cancel

                </span>

                Cancelar reservación

            `;

        }

    }


    // ====================================================
    // CAN CANCEL
    // ====================================================

    canCancel(
        reservation
    ) {

        const date =
            this.getReservationDate(
                reservation
            );


        if (

            !date
            ||
            Number.isNaN(
                date.getTime()
            )

        ) {

            return false;

        }


        const difference =
            date.getTime()
            -
            Date.now();


        const hours =
            difference
            /
            (
                1000
                *
                60
                *
                60
            );


        return (
            hours >=
            this.cancelHours
        );

    }


    // ====================================================
    // UPCOMING
    // ====================================================

    isUpcoming(
        reservation,
        now
    ) {

        const status =
            String(
                this.getStatus(
                    reservation
                )
            )
                .trim()
                .toUpperCase();


        if (

            status === "CANCELLED"
            ||
            status === "CANCELED"
            ||
            status === "CANCELADA"

        ) {

            return false;

        }


        if (

            status === "COMPLETED"
            ||
            status === "COMPLETADA"
            ||
            status === "ATTENDED"
            ||
            status === "ASISTIO"
            ||
            status === "ASISTIÓ"

        ) {

            return false;

        }


        const date =
            this.getReservationDate(
                reservation
            );


        if (
            !date
        ) {

            return false;

        }


        return (

            date.getTime()
            >
            now.getTime()

        );

    }


    // ====================================================
    // STATUS
    // ====================================================

    getStatus(
        reservation
    ) {

        return (

            reservation?.status
            ||
            reservation?.reservationStatus
            ||
            "reserved"

        );

    }


    getStatusLabel(
        status,
        isUpcoming
    ) {

        const normalized =
            String(
                status
            )
                .trim()
                .toLowerCase();


        if (

            normalized === "cancelled"
            ||
            normalized === "canceled"
            ||
            normalized === "cancelada"

        ) {

            return "Cancelada";

        }


        if (

            normalized === "completed"
            ||
            normalized === "completada"

        ) {

            return "Completada";

        }


        if (

            normalized === "attended"
            ||
            normalized === "asistio"
            ||
            normalized === "asistió"

        ) {

            return "Asistió";

        }


        if (
            isUpcoming
        ) {

            return "Reservada";

        }


        return "Finalizada";

    }


    getStatusClass(
        status,
        isUpcoming
    ) {

        const normalized =
            String(
                status
            )
                .trim()
                .toLowerCase();


        if (

            normalized === "cancelled"
            ||
            normalized === "canceled"
            ||
            normalized === "cancelada"

        ) {

            return "cancelled";

        }


        if (

            normalized === "completed"
            ||
            normalized === "completada"
            ||
            normalized === "attended"
            ||
            normalized === "asistio"
            ||
            normalized === "asistió"

        ) {

            return "completed";

        }


        if (
            isUpcoming
        ) {

            return "reserved";

        }


        return "completed";

    }


    // ====================================================
    // FECHA DE RESERVACIÓN
    // ====================================================

    getReservationDate(
        reservation
    ) {

        if (
            !reservation
        ) {

            return null;

        }


        const dateValue =

            reservation.reservationDate
            ||
            reservation.scheduleDate
            ||
            reservation.date
            ||
            reservation.startDate
            ||
            reservation.datetime;


        if (
            !dateValue
        ) {

            return null;

        }


        const dateString =
            String(
                dateValue
            )
                .trim();


        // =============================================
        // FECHA + HORA
        // =============================================

        if (

            dateString.includes(
                "T"
            )

            &&
            dateString.length > 10

        ) {

            const parsed =
                new Date(
                    dateString
                );


            if (
                !Number.isNaN(
                    parsed.getTime()
                )
            ) {

                return parsed;

            }

        }


        const date =
            dateString
                .split(
                    "T"
                )[0];


        const time =
            String(

                reservation.startTime
                ||
                reservation.time
                ||
                "00:00"

            )
                .slice(
                    0,
                    5
                );


        const parsed =
            new Date(
                `${date}T${time}:00`
            );


        if (
            Number.isNaN(
                parsed.getTime()
            )
        ) {

            return null;

        }


        return parsed;

    }


    // ====================================================
    // FORMAT DATE
    // ====================================================

    formatDate(
        value
    ) {

        if (

            !value
            ||
            Number.isNaN(
                value.getTime()
            )

        ) {

            return "-";

        }


        return value.toLocaleDateString(

            "es-MX",

            {

                weekday:
                    "long",

                day:
                    "numeric",

                month:
                    "long",

                year:
                    "numeric"

            }

        );

    }


    // ====================================================
    // FORMAT TIME
    // ====================================================

    formatTime(
        value
    ) {

        if (

            !value
            ||
            Number.isNaN(
                value.getTime()
            )

        ) {

            return "-";

        }


        return value.toLocaleTimeString(

            "es-MX",

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

window.MyReservationsModule =
    new MyReservationsModule();


// ====================================================
// REGISTER
// ====================================================

ModuleFactory.register(

    "my-reservations",

    window.MyReservationsModule

);