/*
====================================================
    FLOWMANAGER

    SCHEDULE BOARD
====================================================
*/

const ScheduleBoard = {

    weekdays: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday"
    ],

    titles: {
        Monday: "Lunes",
        Tuesday: "Martes",
        Wednesday: "Miércoles",
        Thursday: "Jueves",
        Friday: "Viernes",
        Saturday: "Sábado",
        Sunday: "Domingo"
    },

    render({
        container,
        schedules = [],
        range
    }) {

        const board =
            document.getElementById(container);

        if (!board) return;

        board.innerHTML = "";

        const visibleSchedules =
            this.filterSchedules(
                schedules,
                range
            );

        if (visibleSchedules.length === 0) {

            board.innerHTML = `
                <div class="fm-empty-state">
                    <span class="material-symbols-outlined">
                        calendar_month
                    </span>

                    <h2>
                        No hay horarios registrados
                    </h2>

                    <p>
                        Presiona "Nueva Clase Programada"
                        para comenzar.
                    </p>
                </div>
            `;

            return;
        }

        const times =
            this.getTimes(
                visibleSchedules
            );

        const table =
            document.createElement("div");

        table.className = "fm-board";

        table.appendChild(
            document.createElement("div")
        );

        this.weekdays.forEach(day => {

            const header =
                document.createElement("div");

            header.className =
                "fm-board-header";

            header.textContent =
                this.titles[day];

            table.appendChild(header);

        });

        times.forEach(time => {

            this.renderHour(
                table,
                time,
                visibleSchedules
            );

        });

        board.appendChild(table);

    },

    renderHour(
        table,
        time,
        schedules
    ) {

        const hour =
            document.createElement("div");

        hour.className =
            "fm-board-hour";

        hour.textContent =
            time;

        table.appendChild(hour);

        this.weekdays.forEach(day => {

            const cell =
                document.createElement("div");

            cell.className =
                "fm-board-cell";

            const classes =
                schedules.filter(schedule =>
                    schedule.weekday === day &&
                    schedule.startTime === time
                );

            classes.forEach(schedule => {

                cell.appendChild(
                    ScheduleCard.create(schedule)
                );

            });

            table.appendChild(cell);

        });

    },

    filterSchedules(
        schedules,
        range
    ) {

        if (!range) {
            return schedules;
        }

        const from =
            this.parseDate(range.from);

        const to =
            this.parseDate(range.to);

        return schedules.filter(schedule => {

            if (Number(schedule.isRecurring) !== 1) {

                const currentWeekStart =
                    this.getWeekStart(
                        new Date()
                    );

                return from.getTime() ===
                    currentWeekStart.getTime();

            }

            const dayDate =
                this.getWeekdayDate(
                    from,
                    schedule.weekday
                );

            if (!dayDate) {
                return false;
            }

            if (
                schedule.repeatFrom &&
                dayDate < this.parseDate(
                    schedule.repeatFrom
                )
            ) {
                return false;
            }

            if (
                schedule.repeatUntil &&
                dayDate > this.parseDate(
                    schedule.repeatUntil
                )
            ) {
                return false;
            }

            return true;

        });

    },

    getWeekStart(date) {

        const result =
            new Date(
                date.getFullYear(),
                date.getMonth(),
                date.getDate()
            );

        const day =
            result.getDay();

        const offset =
            (day + 6) % 7;

        result.setDate(
            result.getDate() - offset
        );

        return result;

    },

    getWeekdayDate(
        weekStart,
        weekday
    ) {

        const index =
            this.weekdays.indexOf(weekday);

        if (index === -1) {
            return null;
        }

        const date =
            new Date(weekStart);

        date.setDate(
            date.getDate() + index
        );

        return date;

    },

    parseDate(value) {

        if (!value) return null;

        const [year, month, day] =
            String(value)
                .split("-")
                .map(Number);

        return new Date(
            year,
            month - 1,
            day
        );

    },

    getTimes(schedules) {

        return [
            ...new Set(
                schedules.map(
                    schedule =>
                        schedule.startTime
                )
            )
        ].sort();

    }

};