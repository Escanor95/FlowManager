/*
====================================================

    FLOWMANAGER

    RESERVATION SCHEDULE LIST

====================================================
*/

const ReservationScheduleList = {

    container: null,

    schedules: [],

    selectedSchedule: null,

    // ======================================
    // Inicializar
    // ======================================

    async init(container, options = {}) {

        this.container =

            typeof container === "string"

                ? document.querySelector(container)

                : container;

        if (!this.container) {

            throw new Error(

                "No se encontró el contenedor de horarios."

            );

        }

        this.onSelect = options.onSelect || null;

        await this.load();

    },

    // ======================================
    // Cargar horarios
    // ======================================

    async load() {

        this.showLoading();

        try {

            this.schedules =

                await ScheduleService.getAll();

            this.render();

        }

        catch (error) {

            console.error(error);

            this.showError(

                error.message

            );

        }

    },

    // ======================================
    // Renderizar
    // ======================================

    render() {

        this.container.innerHTML = "";

        this.selectedSchedule = null;

        if (

            !this.schedules.length

        ) {

            this.showEmpty();

            return;

        }

        const list =

            document.createElement("div");

        list.className =

            "fm-reservation-schedule-list";

        this.schedules.forEach(

            schedule => {

                const card =

                    ReservationScheduleCard.create(

                        schedule,

                        selectedSchedule => {

                            this.select(

                                selectedSchedule

                            );

                        }

                    );

                list.appendChild(card);

            }

        );

        this.container.appendChild(list);

    },

    // ======================================
    // Seleccionar horario
    // ======================================

    select(schedule) {

        this.selectedSchedule =

            schedule;

        const cards =

            this.container.querySelectorAll(

                ".fm-reservation-schedule-card"

            );

        cards.forEach(card => {

            card.classList.remove(

                "selected"

            );

        });

        const selectedCard =

            this.container.querySelector(

                `[data-id="${schedule.scheduleId}"]`

            );

        if (selectedCard) {

            selectedCard.classList.add(

                "selected"

            );

        }

        if (typeof this.onSelect === "function") {
            this.onSelect(schedule);
        }

    },

    // ======================================
    // Obtener selección
    // ======================================

    getSelected() {

        return this.selectedSchedule;

    },

    // ======================================
    // Estado de carga
    // ======================================

    showLoading() {

        this.container.innerHTML = `

            <div class="fm-reservation-state">

                <span
                    class="material-symbols-outlined">

                    progress_activity

                </span>

                <span>

                    Cargando horarios...

                </span>

            </div>

        `;

    },

    // ======================================
    // Estado vacío
    // ======================================

    showEmpty() {

        this.container.innerHTML = `

            <div class="fm-reservation-state">

                <span
                    class="material-symbols-outlined">

                    event_busy

                </span>

                <span>

                    No hay horarios disponibles.

                </span>

            </div>

        `;

    },

    // ======================================
    // Error
    // ======================================

    showError(message) {

        this.container.innerHTML = `

            <div class="fm-reservation-state">

                <span
                    class="material-symbols-outlined">

                    error

                </span>

                <span>

                    ${message}

                </span>

            </div>

        `;

    }

};
