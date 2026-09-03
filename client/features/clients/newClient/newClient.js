let editingClient = null;

window.loadNewClientForm = async function (client = null) {

    editingClient = client;

    try {

        const html = await FeatureManager.load(

            "clients/newClient/newClient"

        );

        openModal(html);

        await initializeNewClientForm();

    }

    catch (error) {

        console.error(error);

    }

};

async function initializeNewClientForm() {

    await loadMembershipTypes();

    if (editingClient) {

        populateClientForm(editingClient);

    }

    document

        .getElementById("newClientForm")

        .addEventListener(

            "submit",

            saveClient

        );

    document

        .getElementById("cancelNewClient")

        .addEventListener(

            "click",

            () => {

                editingClient = null;

                closeModal();

            }

        );

}

async function loadMembershipTypes() {

    const membershipSelect =

        document.getElementById(

            "membershipType"

        );

    membershipSelect.innerHTML =

        `<option value="">Seleccionar...</option>`;

    try {

        const memberships =

            await MembershipService.getAll();

        memberships.forEach(membership => {

            const option =

                document.createElement("option");

            option.value =

                membership.membershipId;

            option.textContent =

                membership.name;

            membershipSelect.appendChild(option);

        });

    }

    catch (error) {

        console.error(error);

    }

}

function populateClientForm(client) {

    document.getElementById(

        "clientFormTitle"

    ).textContent =

        "👤 Editar Cliente";

    document.getElementById(

        "clientFormDescription"

    ).textContent =

        "Actualiza la información del cliente.";

    document.getElementById(

        "saveNewClient"

    ).textContent =

        "Actualizar";

    document.getElementById(

        "clientId"

    ).value =

        client.clientId || "";

    document.getElementById(

        "fullName"

    ).value =

        client.fullName || "";

    document.getElementById(

        "phone"

    ).value =

        client.phone || "";

    document.getElementById(

        "email"

    ).value =

        client.email || "";

    document.getElementById(

        "membershipType"

    ).value =

        client.membershipId || "";

    document.getElementById(

        "emergencyContactName"

    ).value =

        client.emergencyContactName || "";

    document.getElementById(

        "emergencyContactPhone"

    ).value =

        client.emergencyContactPhone || "";

    document.getElementById(

        "medicalNotes"

    ).value =

        client.medicalNotes || "";

}

function getClientFormData() {

    return {

        fullName:

            document.getElementById("fullName")

                .value

                .trim(),

        phone:

            document.getElementById("phone")

                .value

                .trim(),

        email:

            document.getElementById("email")

                .value

                .trim(),

        membershipId:

            document.getElementById("membershipType")

                .value,

        emergencyContactName:

            document.getElementById("emergencyContactName")

                .value

                .trim(),

        emergencyContactPhone:

            document.getElementById("emergencyContactPhone")

                .value

                .trim(),

        medicalNotes:

            document.getElementById("medicalNotes")

                .value

                .trim()

    };

}

async function saveClient(event) {

    event.preventDefault();

    const client = getClientFormData();

    if (!client.fullName) {

        alert("Ingresa el nombre del cliente.");

        return;

    }

    if (!client.phone) {

        alert("Ingresa el teléfono.");

        return;

    }

    if (!client.membershipId) {

        alert("Selecciona una membresía.");

        return;

    }

    try {

        if (editingClient) {

            await ClientService.update(

                editingClient.clientId,

                client

            );

            alert(

                "Cliente actualizado correctamente."

            );

        }

        else {

            await ClientService.create(

                client

            );

            alert(

                "Cliente registrado correctamente."

            );

        }

        editingClient = null;

        closeModal();

        await ModuleFactory.refresh(

            "clients"

        );

    }

    catch (error) {

        console.error(error);

        alert(error.message);

    }

}