/*
====================================================

    FLOWMANAGER

    RESERVATION SUMMARY

====================================================
*/

const ReservationSummary = {

    render(container, { dates = [], client = null, schedule = null, onRemove, onConfirm }) {

        const target = typeof container === "string"
            ? document.querySelector(container)
            : container;

        if (!target) return;

        target.innerHTML = "";

        if (!client || !schedule || !dates.length) {
            target.textContent = "Selecciona una clienta, un horario y al menos una fecha para preparar las reservaciones.";
            return;
        }

        const heading = document.createElement("h3");
        heading.textContent = `${dates.length} reservación${dates.length === 1 ? "" : "es"} preparada${dates.length === 1 ? "" : "s"}`;

        const detail = document.createElement("p");
        detail.textContent = `${client.fullName} · ${schedule.name} · ${schedule.weekday} ${schedule.startTime}`;

        const classes = document.createElement("p");
        classes.textContent = `Clases que se apartarán: ${dates.length}`;

        const list = document.createElement("ul");
        list.className = "fm-reservation-summary-list";

        dates.forEach(date => {

            const item = document.createElement("li");
            const label = document.createElement("span");
            label.textContent = this.formatDate(date);

            const remove = document.createElement("button");
            remove.type = "button";
            remove.className = "fm-btn";
            remove.textContent = "Quitar";
            remove.addEventListener("click", () => onRemove(date));

            item.append(label, remove);
            list.appendChild(item);

        });

        const confirm = document.createElement("button");
        confirm.type = "button";
        confirm.className = "fm-btn fm-btn-primary";
        confirm.textContent = "Confirmar reservaciones";
        confirm.addEventListener("click", onConfirm);

        target.append(heading, detail, classes, list, confirm);

    },

    formatDate(key) {

        const [year, month, day] = key.split("-").map(Number);
        return new Date(year, month - 1, day).toLocaleDateString("es-MX", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric"
        });

    }

};
