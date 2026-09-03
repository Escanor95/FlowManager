/*
====================================================

    AURA WELLNESS

    HOME / RESERVA DE CLASE

====================================================
*/


function renderHomePage() {

    const days = [

        {
            day: "LUN",
            number: "12"
        },

        {
            day: "MAR",
            number: "13"
        },

        {
            day: "MIÉ",
            number: "14",
            active: true
        },

        {
            day: "JUE",
            number: "15"
        },

        {
            day: "VIE",
            number: "16"
        },

        {
            day: "SÁB",
            number: "17"
        },

        {
            day: "DOM",
            number: "18"
        }

    ];


    const classes = [

        {
            name:
                "Pilates Reformer",

            time:
                "7:00 AM - 8:00 AM",

            coach:
                "Ana Gómez",

            spaces:
                8,

            icon:
                "fa-person-walking"
        },

        {
            name:
                "Yoga Flow",

            time:
                "8:15 AM - 9:15 AM",

            coach:
                "María López",

            spaces:
                6,

            icon:
                "fa-spa"
        },

        {
            name:
                "Pilates Mat",

            time:
                "10:00 AM - 11:00 AM",

            coach:
                "Sofía Martínez",

            spaces:
                4,

            icon:
                "fa-heart-pulse"
        }

    ];


    return `

        <section
            class="
                page
                animate-fade
            "
        >


            ${renderHeader(
        "Reserva de Clase"
    )}


            <!-- ==============================

                BRAND

            =============================== -->

            <div
                class="
                    aura-brand
                "

                style="
                    margin-bottom: 26px;
                "
            >

                <img
                    class="
                        aura-brand-logo
                    "

                    src="./assets/logo/logoaura.png"

                    alt="
                        Aura Wellness
                    "
                >


                <div
                    class="
                        aura-brand-name
                    "
                >

                    AURA WELLNESS

                </div>


                <span
                    style="
                        color: var(--color-gray);
                        font-size: 11px;
                        margin-top: -2px;
                    "
                >

                    Tu bienestar, tu prioridad

                </span>

            </div>


            <!-- ==============================

                CALENDARIO

            =============================== -->

            <div
                class="
                    calendar-strip
                "
            >

                ${days.map(
        day => `

                        <button
                            class="
                                calendar-day
                                ${day.active

                ? "active"

                : ""
            }
                            "
                        >

                            <span
                                class="
                                    calendar-day-name
                                "
                            >

                                ${day.day}

                            </span>


                            <span
                                class="
                                    calendar-day-number
                                "
                            >

                                ${day.number}

                            </span>

                        </button>

                    `
    ).join("")}

            </div>


            <!-- ==============================

                FECHA

            =============================== -->

            <button
                class="
                    date-selector
                "
            >

                <span>

                    Miércoles 14 de Mayo

                </span>


                <i
                    class="
                        fa-regular
                        fa-calendar
                    "
                ></i>

            </button>


            <!-- ==============================

                FILTROS

            =============================== -->

            <div
                class="
                    class-filters
                "
            >

                <button
                    class="
                        filter-button
                        active
                    "
                >

                    Fitness

                </button>


                <button
                    class="
                        filter-button
                    "
                >

                    Yoga

                </button>


                <button
                    class="
                        filter-button
                    "
                >

                    Pilates

                </button>


                <button
                    class="
                        filter-button
                    "
                >

                    Fuerza

                </button>


                <button
                    class="
                        filter-icon
                    "
                >

                    <i
                        class="
                            fa-solid
                            fa-filter
                        "
                    ></i>

                </button>

            </div>


            <!-- ==============================

                CLASES

            =============================== -->

            <div
                class="
                    class-list
                "
            >

                ${classes.map(
        classItem => `

                        <article
                            class="
                                class-card
                            "
                        >


                            <div
                                class="
                                    class-card-main
                                "
                            >


                                <div
                                    class="
                                        class-icon
                                    "
                                >

                                    <i
                                        class="
                                            fa-solid
                                            ${classItem.icon}
                                        "
                                    ></i>

                                </div>


                                <div
                                    class="
                                        class-info
                                    "
                                >

                                    <h3>

                                        ${classItem.name}

                                    </h3>


                                    <p>

                                        ${classItem.time}

                                    </p>


                                    <span>

                                        ${classItem.coach}

                                    </span>

                                </div>


                                <div
                                    class="
                                        class-spaces
                                    "
                                >

                                    <strong>

                                        ${classItem.spaces}

                                    </strong>


                                    <span>

                                        lugares

                                    </span>

                                </div>


                            </div>


                            <div
                                class="
                                    class-card-footer
                                "
                            >

                                <span>

                                    <i
                                        class="
                                            fa-regular
                                            fa-clock
                                        "
                                    ></i>

                                    Disponible

                                </span>


                                <button
                                    class="
                                        reserve-button
                                    "
                                >

                                    Reservar

                                </button>

                            </div>


                        </article>

                    `
    ).join("")}

            </div>


        </section>

    `;

}