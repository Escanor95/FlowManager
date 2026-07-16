fetch("views/reception.html")
    .then(response => response.text())
    .then(async html => {

        document.getElementById("app").innerHTML = html;

        // Cargar el Modal
        const modalResponse = await fetch("components/ui/modal/modal.html");

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

    loadClients();

}

async function loadClients() {

    try {

        const response = await fetch("/clients");

        const clients = await response.json();

        renderClients(clients);

    }
    catch (error) {

        console.error(error);

    }

}

function initializeButtons() {

    const newClientButton = document.getElementById("newClient");

    newClientButton.addEventListener("click", () => {

        loadNewClientForm();

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

                <p>Selecciona un cliente para comenzar.</p>

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

                const response = await fetch(`/clients/${client.clientId}`);

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

            <p><strong>📱 Teléfono:</strong> ${client.phone || "No registrado"}</p>

            <p><strong>✉️ Correo:</strong> ${client.email || "No registrado"}</p>

            <hr>

            <p><strong>🏷 Membresía:</strong> ${client.membershipType || "-"}</p>

            <p><strong>📊 Estado:</strong> ${client.membershipStatus}</p>

            <p><strong>📚 Clases restantes:</strong> ${client.remainingClasses}</p>

            <p><strong>📅 Inicio:</strong> ${client.startDate || "--"}</p>

            <p><strong>📅 Vencimiento:</strong> ${client.endDate || "--"}</p>

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