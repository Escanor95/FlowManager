/*
====================================================

    FLOWMANAGER

    RESERVATION CLIENT SELECTOR

====================================================
*/

const ReservationClientSelector = {

    async init(container, onSelect) {

        this.container = typeof container === "string"
            ? document.querySelector(container)
            : container;

        this.onSelect = onSelect;
        this.selectedClient = null;

        if (!this.container) {
            throw new Error("No se encontró el selector de clienta.");
        }

        this.renderShell();

    },


    // ====================================================
    // ESTRUCTURA
    // ====================================================

    renderShell() {

        this.container.innerHTML = "";

        const wrapper = document.createElement("div");
        wrapper.className = "fm-reservation-client-selector";


        const input = document.createElement("input");

        input.type = "search";
        input.id = "reservationClientSearch";
        input.className = "fm-reservation-client-search";
        input.placeholder = "Buscar por nombre, teléfono o ID";
        input.autocomplete = "off";


        const results = document.createElement("div");

        results.id = "reservationClientResults";
        results.className = "fm-reservation-client-results";


        input.addEventListener("input", async () => {

            try {

                const query = input.value.trim();

                if (!query) {

                    this.selectedClient = null;
                    this.clearResults();

                    return;

                }

                await this.search(query);

            }
            catch (error) {

                this.renderError(error.message);

            }

        });


        wrapper.append(input, results);

        this.container.appendChild(wrapper);

    },


    // ====================================================
    // BUSCAR
    // ====================================================

    async search(query) {

        if (!query) {

            this.clearResults();

            return;

        }


        const clients =
            await ClientService.search(query);

        this.renderResults(clients);

    },


    // ====================================================
    // RESULTADOS
    // ====================================================

    renderResults(clients) {

        const results =
            document.getElementById(
                "reservationClientResults"
            );

        if (!results) return;

        results.innerHTML = "";


        if (!clients.length) {

            const empty = document.createElement("div");

            empty.className =
                "fm-reservation-client-empty";

            empty.textContent =
                "No hay clientas que coincidan.";

            results.appendChild(empty);

            return;

        }


        clients.forEach(client => {

            const button =
                document.createElement("button");

            button.type = "button";

            button.className =
                "fm-reservation-client-option";


            const name =
                document.createElement("strong");

            name.textContent =
                client.fullName;


            const detail =
                document.createElement("small");

            detail.textContent =
                `${client.clientId} · ${client.membershipName || "Sin membresía"}`;


            button.append(
                name,
                detail
            );


            button.addEventListener(
                "click",
                () => this.selectClient(client)
            );


            results.appendChild(button);

        });

    },


    // ====================================================
    // SELECCIONAR
    // ====================================================

    selectClient(client) {

        this.selectedClient = client;


        const input =
            document.getElementById(
                "reservationClientSearch"
            );

        if (input) {

            input.value =
                client.fullName;

        }


        this.renderSelectedClient(client);


        if (this.onSelect) {

            this.onSelect(client);

        }

    },


    // ====================================================
    // CLIENTA SELECCIONADA
    // ====================================================

    renderSelectedClient(client) {

        const results =
            document.getElementById(
                "reservationClientResults"
            );

        if (!results) return;


        results.innerHTML = "";


        const selected =
            document.createElement("div");

        selected.className =
            "fm-reservation-client-selected";


        const name =
            document.createElement("strong");

        name.textContent =
            client.fullName;


        const detail =
            document.createElement("small");

        detail.textContent =
            `${client.clientId} · ${client.membershipName || "Sin membresía"}`;


        selected.append(
            name,
            detail
        );


        results.appendChild(selected);

    },


    // ====================================================
    // LIMPIAR
    // ====================================================

    clearResults() {

        const results =
            document.getElementById(
                "reservationClientResults"
            );

        if (!results) return;

        results.innerHTML = "";

    },


    // ====================================================
    // ERROR
    // ====================================================

    renderError(message) {

        const results =
            document.getElementById(
                "reservationClientResults"
            );

        if (results) {

            results.textContent =
                message;

        }

    }

};