/*
====================================================

    FLOWMANAGER

    SCHEDULE CARD

====================================================
*/

const ScheduleCard = {

    create(schedule) {

        const card = document.createElement(
            "div"
        );

        card.className =
            "fm-schedule-card";

        card.dataset.id =
            schedule.scheduleId;

        card.innerHTML = `

            <div
                class="fm-card-color"
                style="background:${schedule.color}">
            </div>

            <span
                class="material-symbols-outlined fm-card-icon"
                style="color:${schedule.color}">

                ${schedule.icon}

            </span>

           <span
    class="fm-card-name">

    ${schedule.name}

</span>

        `;

        this.initializeEvents(
            card,
            schedule
        );

        return card;

    },

    initializeEvents(
        card,
        schedule
    ) {

        card.addEventListener(
            "mouseenter",
            event => {

                Tooltip.show(
                    this.buildTooltip(schedule),
                    event.pageX,
                    event.pageY
                );

            }
        );

        card.addEventListener(
            "mousemove",
            event => {

                Tooltip.move(
                    event.pageX,
                    event.pageY
                );

            }
        );

        card.addEventListener(
            "mouseleave",
            () => {

                Tooltip.hide();

            }
        );

        card.addEventListener(
            "click",
            () => {

                openScheduleForm(
                    schedule
                );

            }
        );

    },

    buildTooltip(schedule) {

        const reserved =
            schedule.reserved ?? 0;

        const capacity =
            Number(schedule.capacity) || 0;

        const occupancy =
            capacity > 0
                ? Math.min(
                    100,
                    (reserved / capacity) * 100
                )
                : 0;

        return `

            <div
                style="
                    border-top:5px solid ${schedule.color};
                    margin:-14px -16px 14px;
                    border-radius:12px 12px 0 0;
                ">
            </div>

            <div class="fm-tooltip-title">

                <span
                    class="material-symbols-outlined"
                    style="
                        color:${schedule.color};
                        font-size:22px;
                    ">

                    ${schedule.icon}

                </span>

                <span>

                    ${schedule.name}

                </span>

            </div>

            <div class="fm-tooltip-row">

                <span
                    class="material-symbols-outlined">

                    person

                </span>

                <span>

                    ${schedule.coachName || "Sin asignar"}

                </span>

            </div>

            <div class="fm-tooltip-row">

                <span
                    class="material-symbols-outlined">

                    calendar_today

                </span>

                <span>

                    ${schedule.weekday}

                </span>

            </div>

            <div class="fm-tooltip-row">

                <span
                    class="material-symbols-outlined">

                    schedule

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

            <div class="fm-tooltip-row">

                <span
                    class="material-symbols-outlined">

                    groups

                </span>

                <span>

                    ${reserved} / ${capacity}

                </span>

            </div>

            <div class="fm-tooltip-progress">

                <div
                    class="fm-tooltip-progress-bar"
                    style="width:${occupancy}%">
                </div>

            </div>

            ${schedule.wellhubSuggested ? `

                <div class="fm-tooltip-row">

                    🟢 Wellhub

                </div>

            ` : ""}

            ${schedule.totalpassSuggested ? `

                <div class="fm-tooltip-row">

                    🔵 TotalPass

                </div>

            ` : ""}

        `;

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