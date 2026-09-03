/*
====================================================

    FLOWMANAGER

    RESERVATION SCHEDULE CARD

====================================================
*/

const ReservationScheduleCard = {

    create(schedule, onSelect = null) {

        const card = document.createElement(

            "button"

        );

        card.type = "button";

        card.className =

            "fm-reservation-schedule-card";

        card.dataset.id =

            schedule.scheduleId;

        card.innerHTML = `

            <div
                class="fm-reservation-schedule-color"
                style="background:${schedule.color}">
            </div>

            <div
                class="fm-reservation-schedule-content">

                <div
                    class="fm-reservation-schedule-title">

                    <span
                        class="material-symbols-outlined"
                        style="color:${schedule.color}">

                        ${schedule.icon}

                    </span>

                    <span>

                        ${schedule.name}

                    </span>

                </div>

                <div
                    class="fm-reservation-schedule-info">

                    <span>

                        ${schedule.weekday}

                    </span>

                    <span>

                        ${schedule.startTime}

                        -

                        ${this.getEndTime(

            schedule.startTime,

            schedule.duration

        )}

                    </span>

                </div>

                <div
                    class="fm-reservation-schedule-capacity">

                    <span
                        class="material-symbols-outlined">

                        groups

                    </span>

                    <span>

                        ${schedule.capacity} lugares

                    </span>

                </div>

            </div>

        `;

        this.initializeEvents(

            card,

            schedule,

            onSelect

        );

        return card;

    },

    initializeEvents(

        card,

        schedule,

        onSelect

    ) {

        card.addEventListener(

            "click",

            () => {

                if (

                    typeof onSelect === "function"

                ) {

                    onSelect(schedule);

                }

            }

        );

    },

    getEndTime(

        startTime,

        duration

    ) {

        const [

            hours,

            minutes

        ] = startTime

            .split(":")

            .map(Number);

        const date = new Date();

        date.setHours(

            hours,

            minutes + Number(duration),

            0,

            0

        );

        return date.toLocaleTimeString(

            [],

            {

                hour: "2-digit",

                minute: "2-digit",

                hour12: false

            }

        );

    }

};