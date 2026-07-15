fetch("views/reception.html")
    .then(response => response.text())
    .then(async html => {

        document.getElementById("app").innerHTML = html;

        // Cargar el componente Modal
        const modalResponse = await fetch("components/modal.html");

        document.getElementById("modalContainer").innerHTML =
            await modalResponse.text();

        initializeReception();

    })
    .catch(error => {

        console.error("Error cargando la aplicación:", error);

    });

function initializeReception() {

    initializeSearch();

    initializeButtons();

}

function initializeButtons() {

    const newClientButton = document.getElementById("newClient");

    newClientButton.addEventListener("click", () => {

        openModal(`

            <h2>Nuevo Cliente</h2>

            <br>

            <p>

                Aquí aparecerá el formulario.

            </p>

            <br>

            <button onclick="closeModal()">

                Cerrar

            </button>

        `);

    });

}

function initializeSearch() {

    const search = document.getElementById("searchClient");

    search.addEventListener("input", async () => {

        const text = search.value.trim();

        if (text.length === 0) {

            document.getElementById("results").innerHTML =
                "<p>Sin resultados...</p>";

            document.getElementById("clientDetails").innerHTML = `

                <h2>Bienvenido a FlowManager</h2>

                <p>

                    Selecciona un cliente para comenzar.

                </p>

            `;

            return;

        }

        try {

            const response = await fetch(`/clients/search/${text}`);

            const clients = await response.json();

            renderClients(clients);

        }
        catch (error) {

            console.error(error);

        }

    });

}

function renderClients(clients) {

    const container = document.getElementById("results");

    container.innerHTML = "";

    if (clients.length === 0) {

        container.innerHTML = "<p>No se encontraron clientes.</p>";

        return;

    }

    clients.forEach(client => {

        const card = document.createElement("div");

        card.className = "client-card";

        card.innerHTML = `

            <strong>${client.fullName}</strong>

            <br>

            ${client.clientId}

        `;

        card.addEventListener("click", async () => {

            try {

                const response = await fetch(

                    `/clients/${client.clientId}`

                );

                const fullClient = await response.json();

                loadClient(fullClient);

            }
            catch (error) {

                console.error(error);

            }

        });

        container.appendChild(card);

    });

}

function loadClient(client) {

    document.getElementById("clientDetails").innerHTML = `

        <div class="client-profile">

            <div>

                <h2>${client.fullName}</h2>

                <small>${client.clientId}</small>

            </div>

            <hr>

            <p>

                <strong>📱 Teléfono</strong><br>

                ${client.phone || "No registrado"}

            </p>

            <p>

                <strong>✉️ Correo</strong><br>

                ${client.email || "No registrado"}

            </p>

            <hr>

            <p>

                <strong>🏷 Membresía</strong><br>

                ${client.membershipType || "-"}

            </p>

            <p>

                <strong>📊 Estado</strong><br>

                ${client.membershipStatus}

            </p>

            <p>

                <strong>📚 Clases restantes</strong><br>

                ${client.remainingClasses}

            </p>

            <p>

                <strong>📅 Inicio</strong><br>

                ${client.startDate || "--"}

            </p>

            <p>

                <strong>📅 Vencimiento</strong><br>

                ${client.endDate || "--"}

            </p>

            <div class="actions">

                <button id="attendanceBtn">

                    Registrar asistencia

                </button>

                <button id="renewBtn">

                    Renovar membresía

                </button>

                <button id="editBtn">

                    Editar contacto

                </button>

            </div>

        </div>

    `;

}