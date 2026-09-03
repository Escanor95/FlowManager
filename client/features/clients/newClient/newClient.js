async function loadNewClientForm() {

    try {

        const html = await FeatureManager.load(
            "clients/newClient/newClient"
        );

        openModal(html);

        initializeNewClient();

    }
    catch (error) {

        console.error("Error cargando el formulario:", error);

    }

}

function initializeNewClient() {

    const form = document.getElementById("newClientForm");

    const cancelButton = document.getElementById("cancelNewClient");

    cancelButton.addEventListener("click", () => {

        closeModal();

    });

    form.addEventListener("submit", saveNewClient);

}

async function saveNewClient(event) {

    event.preventDefault();

    const client = {

        fullName: document.getElementById("fullName").value.trim(),

        phone: document.getElementById("phone").value.trim(),

        email: document.getElementById("email").value.trim(),

        membershipType: document.getElementById("membershipType").value,

        emergencyContactName:
            document.getElementById("emergencyContactName").value.trim(),

        emergencyContactPhone:
            document.getElementById("emergencyContactPhone").value.trim(),

        medicalNotes:
            document.getElementById("medicalNotes").value.trim()

    };

    try {

        const saveButton = document.getElementById("saveNewClient");

        disableButton(saveButton, "Guardando...");

        const response = await fetch("/clients", {

            method: "POST",

            headers: {

                "Content-Type": "application/json"

            },

            body: JSON.stringify(client)

        });

        if (!response.ok) {

            throw new Error("No fue posible registrar el cliente.");

        }

        const result = await response.json();

        console.log(result);

        closeModal();

        await loadClients();

        const clientResponse = await fetch(`/clients/${result.clientId}`);

        const client = await clientResponse.json();

        loadClient(client);

        alert("Cliente registrado correctamente");

    }
    catch (error) {

        console.error(error);

        alert("Ocurrió un error al registrar el cliente.");

    }
    finally {

        const saveButton = document.getElementById("saveNewClient");

        enableButton(saveButton);

    }

}