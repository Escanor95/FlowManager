/*
====================================================

    FLOWMANAGER

    REUSABLE CALENDAR

====================================================
*/

class FlowCalendar {

    constructor(options = {}) {

        this.container = typeof options.container === "string"
            ? document.querySelector(options.container)
            : options.container;

        this.visibleDate = this.parseDate(options.visibleDate) || this.startOfDay(new Date());
        this.viewMode = options.viewMode === "week" ? "week" : "month";
        this.showViewSwitcher = options.showViewSwitcher !== false;
        this.selectedDates = new Set(options.selectedDates || []);
        this.getDateState = options.getDateState || (() => ({ enabled: false }));
        this.onSelectionChange = options.onSelectionChange || (() => { });
        this.onViewChange = options.onViewChange || (() => { });
        this.showDateGrid = options.showDateGrid !== false;
        this.renderDateContent =
            options.renderDateContent || null;

        if (!this.container) {
            throw new Error("No se encontró el contenedor del calendario.");
        }

        this.render();

    }

    setState(options = {}) {

        if (options.visibleDate) {
            this.visibleDate = this.parseDate(options.visibleDate) || this.visibleDate;
        }

        if (options.viewMode) {
            this.viewMode = options.viewMode;
        }

        if (options.selectedDates) {
            this.selectedDates = new Set(options.selectedDates);
        }

        if (options.getDateState) {
            this.getDateState = options.getDateState;
        }

        if (options.renderDateContent) {
            this.renderDateContent = options.renderDateContent;
        }

        this.render();

    }

    render() {

        this.container.innerHTML = "";

        const calendar = document.createElement("section");
        calendar.className = "fm-calendar";

        calendar.appendChild(this.createToolbar());

        if (this.showDateGrid) {

            calendar.appendChild(
                this.createWeekdayHeader()
            );

            calendar.appendChild(
                this.createGrid()
            );

        }

        this.container.appendChild(calendar);

    }

    createToolbar() {

        const toolbar = document.createElement("div");
        toolbar.className = "fm-calendar-toolbar";

        const navigation = document.createElement("div");
        navigation.className = "fm-calendar-navigation";

        navigation.appendChild(this.createButton("‹", "Periodo anterior", () => this.move(-1)));
        navigation.appendChild(this.createButton("Hoy", "Ir a hoy", () => this.goToday()));
        navigation.appendChild(this.createButton("›", "Periodo siguiente", () => this.move(1)));

        const title = document.createElement("h3");
        title.className = "fm-calendar-title";
        title.textContent = this.getTitle();

        let views = null;

        if (this.showViewSwitcher) {

            views = document.createElement("div");

            views.className =
                "fm-calendar-views";

            views.appendChild(
                this.createButton(
                    "Mes",
                    "Vista mensual",
                    () => this.changeView("month"),
                    this.viewMode === "month"
                )
            );

            views.appendChild(
                this.createButton(
                    "Semana",
                    "Vista semanal",
                    () => this.changeView("week"),
                    this.viewMode === "week"
                )
            );

        }

        toolbar.append(
            navigation,
            title
        );

        if (views) {

            toolbar.appendChild(
                views
            );

        }

        return toolbar;

    }

    createButton(label, title, handler, active = false) {

        const button = document.createElement("button");
        button.type = "button";
        button.className = "fm-calendar-button";
        button.textContent = label;
        button.title = title;

        if (active) {
            button.classList.add("active");
        }

        button.addEventListener("click", handler);

        return button;

    }

    createWeekdayHeader() {

        const header = document.createElement("div");
        header.className = "fm-calendar-weekdays";

        ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].forEach(day => {

            const item = document.createElement("span");
            item.textContent = day;
            header.appendChild(item);

        });

        return header;

    }

    createGrid() {

        const grid =
            document.createElement("div");

        grid.className =
            "fm-calendar-grid";


        this.getVisibleDates().forEach(
            ({ date, outsideMonth }) => {

                const key =
                    this.toDateKey(date);

                const state =
                    this.getDateState(key) || {};

                const isSelected =
                    this.selectedDates.has(key);


                // Si existe contenido personalizado,
                // usamos DIV para permitir botones dentro.
                const day =
                    this.renderDateContent
                        ? document.createElement("div")
                        : document.createElement("button");


                if (!this.renderDateContent) {

                    day.type = "button";

                }


                day.className =
                    "fm-calendar-day";

                day.dataset.date =
                    key;


                if (outsideMonth) {

                    day.classList.add(
                        "outside-month"
                    );

                }

                if (isSelected) {

                    day.classList.add(
                        "selected"
                    );

                }

                if (!state.enabled) {

                    day.classList.add(
                        "disabled"
                    );

                }

                if (state.reason) {

                    day.classList.add(
                        `is-${String(
                            state.reason
                        ).toLowerCase()}`
                    );

                }


                const number =
                    document.createElement("span");

                number.className =
                    "fm-calendar-day-number";

                number.textContent =
                    String(date.getDate());

                day.appendChild(
                    number
                );


                // =========================================
                // CONTENIDO PERSONALIZADO
                // =========================================

                if (this.renderDateContent) {

                    const content =
                        this.renderDateContent(
                            key,
                            date,
                            state
                        );

                    if (
                        content instanceof HTMLElement
                    ) {

                        day.appendChild(
                            content
                        );

                    }

                }


                // =========================================
                // DISPONIBILIDAD
                // =========================================

                if (
                    state.capacity !== undefined
                ) {

                    const availability =
                        document.createElement("small");

                    availability.className =
                        "fm-calendar-day-availability";

                    availability.textContent =
                        `${state.remaining}/${state.capacity}`;

                    day.appendChild(
                        availability
                    );

                }


                if (
                    state.reason &&
                    !state.enabled
                ) {

                    day.title =
                        state.label ||
                        state.reason;

                }


                // =========================================
                // CLICK DEL DÍA
                // =========================================

                day.addEventListener(
                    "click",
                    event => {

                        // Si el click fue sobre una clase,
                        // la clase controla el evento.
                        if (
                            event.target.closest(
                                ".fm-reservation-class"
                            )
                        ) {

                            return;

                        }


                        if (
                            !this.renderDateContent
                        ) {

                            this.toggleDate(
                                key,
                                state
                            );

                        }

                    }
                );


                grid.appendChild(
                    day
                );

            }
        );


        return grid;

    }

    toggleDate(key, state) {

        if (!state.enabled) return;

        if (this.selectedDates.has(key)) {
            this.selectedDates.delete(key);
        }
        else {
            this.selectedDates.add(key);
        }

        this.onSelectionChange([...this.selectedDates].sort());
        this.render();

    }

    changeView(viewMode) {

        if (this.viewMode === viewMode) return;

        this.viewMode = viewMode;
        this.notifyViewChange();

    }

    move(direction) {

        const next = new Date(this.visibleDate);

        if (this.viewMode === "week") {
            next.setDate(next.getDate() + (direction * 7));
        }
        else {
            next.setMonth(next.getMonth() + direction);
        }

        this.visibleDate = this.startOfDay(next);
        this.notifyViewChange();

    }

    goToday() {

        this.visibleDate = this.startOfDay(new Date());
        this.notifyViewChange();

    }

    notifyViewChange() {

        this.onViewChange({
            visibleDate: this.toDateKey(this.visibleDate),
            viewMode: this.viewMode,
            range: this.getRange()
        });

        this.render();

    }

    getRange() {

        const dates = this.getVisibleDates();

        return {
            from: this.toDateKey(dates[0].date),
            to: this.toDateKey(dates[dates.length - 1].date)
        };

    }

    getVisibleDates() {

        if (this.viewMode === "week") {

            const start = new Date(this.visibleDate);
            const offset = (start.getDay() + 6) % 7;
            start.setDate(start.getDate() - offset);

            return Array.from({ length: 7 }, (_, index) => {

                const date = new Date(start);
                date.setDate(start.getDate() + index);
                return { date, outsideMonth: false };

            });

        }

        const first = new Date(this.visibleDate.getFullYear(), this.visibleDate.getMonth(), 1);
        const offset = (first.getDay() + 6) % 7;
        const start = new Date(first);
        start.setDate(first.getDate() - offset);

        return Array.from({ length: 42 }, (_, index) => {

            const date = new Date(start);
            date.setDate(start.getDate() + index);

            return {
                date,
                outsideMonth: date.getMonth() !== this.visibleDate.getMonth()
            };

        });

    }

    getTitle() {

        if (this.viewMode === "week") {

            const range = this.getRange();
            return `${this.formatDate(range.from, { day: "numeric", month: "short" })} – ${this.formatDate(range.to, { day: "numeric", month: "short", year: "numeric" })}`;

        }

        return this.visibleDate.toLocaleDateString("es-MX", {
            month: "long",
            year: "numeric"
        });

    }

    formatDate(key, options) {

        return this.parseDate(key).toLocaleDateString("es-MX", options);

    }

    parseDate(value) {

        if (!value) return null;
        if (value instanceof Date) return this.startOfDay(value);

        const match = String(value).match(/^(\d{4})-(\d{2})-(\d{2})/);
        if (!match) return null;

        return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));

    }

    startOfDay(date) {

        return new Date(date.getFullYear(), date.getMonth(), date.getDate());

    }

    toDateKey(date) {

        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");

        return `${year}-${month}-${day}`;

    }

}
