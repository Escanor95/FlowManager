/*
====================================================

    FLOWMANAGER

    MEMBERSHIP MODULE

====================================================
*/

class MembershipModule extends Module {

    constructor() {

        super("Memberships");

        this.selectedMembership = null;
        this.selectedClient = null;

    }

    async open(
        client = null
    ) {

        this.selectedClient =
            client || null;

        this.selectedMembership = null;

        await this.load(

            "memberships/memberships"

        );

        await this.initialize();

        if (
            this.selectedClient &&
            this.selectedClient.clientId
        ) {

            await this.selectClientMembership(
                this.selectedClient.clientId
            );

        }

    }

    async initialize() {

        this.initializeButtons();

        this.initializeSearch();

        await this.refresh();

    }

    async refresh() {

        try {

            const memberships =

                await MembershipService.getAll();

            this.renderCards(

                memberships

            );

            this.clearProfile();

        }

        catch (error) {

            console.error(error);

        }

    }

    initializeButtons() {

        const button =

            document.getElementById(

                "newMembership"

            );

        if (!button) return;

        button.onclick = () => {

            loadMembershipForm();

        };

    }

    initializeSearch() {

        const search =

            document.getElementById(

                "searchMembership"

            );

        if (!search) return;

        search.oninput = async () => {

            const text =

                search.value.trim();

            try {

                const memberships =

                    text === ""

                        ? await MembershipService.getAll()

                        : await MembershipService.search(text);

                this.renderCards(

                    memberships

                );

            }

            catch (error) {

                console.error(error);

            }

        };

    }

    renderCards(memberships) {

        const container =

            document.getElementById(

                "membershipResults"

            );

        if (!container) return;

        container.innerHTML = "";

        if (memberships.length === 0) {

            container.innerHTML = `

                <div class="empty-state">

                    No hay membresías.

                </div>

            `;

            return;

        }

        memberships.forEach(membership => {

            const card =

                document.createElement("div");

            card.className =

                "membership-card";

            card.dataset.membershipId =
                membership.membershipId;

            card.innerHTML = `

                <strong>

                    ${membership.name}

                </strong>

                <br>

                <small>

                    ${membership.membershipId}

                </small>

            `;

            card.onclick = () => {

                this.loadMembership(

                    membership.membershipId

                );

            };

            container.appendChild(card);

        });

    }

    async loadMembership(membershipId) {

        try {

            this.selectedMembership =

                await MembershipService.get(

                    membershipId

                );

            document
                .querySelectorAll(
                    "#membershipResults .membership-card"
                )
                .forEach(card => {
                    card.classList.toggle(
                        "selected",
                        String(card.dataset.membershipId) ===
                        String(membershipId)
                    );
                });

            this.renderProfile();

        }

        catch (error) {

            console.error(error);

        }

    }

    renderProfile() {

        const membership =

            this.selectedMembership;

        if (!membership) return;

        document.getElementById(

            "membershipDetails"

        ).innerHTML = `

            <div class="membership-profile">

                <h2>

                    ${membership.name}

                </h2>

                <small>

                    ${membership.membershipId}

                </small>

                <hr>

                <p>

                    <strong>Precio:</strong>

                    $${membership.price}

                </p>

                <p>

                    <strong>Clases:</strong>

                    ${membership.classes ?? "Ilimitadas"}

                </p>

                <p>

                    <strong>Duración:</strong>

                    ${membership.durationDays} días

                </p>

                <p>

                    <strong>Descripción:</strong>

                    ${membership.description || "-"}

                </p>

                <div class="actions">

                    ${this.selectedClient ? `
                    <button
                        id="renewSelectedMembership"
                        class="fm-btn fm-btn-primary">

                        Renovar para ${this.selectedClient.fullName || this.selectedClient.clientId}

                    </button>
                    ` : ""}

                    <button
                        id="editMembership"
                        class="fm-btn fm-btn-primary">

                        Editar

                    </button>

                    <button
                        id="deleteMembership"
                        class="fm-btn">

                        Desactivar

                    </button>

                </div>

            </div>

        `;

        document

            .getElementById(

                "editMembership"

            )

            .onclick = () => {

                loadMembershipForm(

                    membership

                );

            };

        const renewButton =
            document.getElementById(
                "renewSelectedMembership"
            );

        if (renewButton) {

            renewButton.onclick = () => {
                this.renewSelectedMembership();
            };

        }

        document

            .getElementById(

                "deleteMembership"

            )

            .onclick = () => {

                this.deleteMembership();

            };

    }

    async renewSelectedMembership() {

        const client = this.selectedClient;
        const membership = this.selectedMembership;

        if (!client?.clientId || !membership?.membershipId) {
            return;
        }

        const confirmed = window.confirm(
            `¿Renovar la membresía "${membership.name}" para ${client.fullName || client.clientId}?`
        );

        if (!confirmed) return;

        try {

            const result = await MembershipService.renewClient(
                client.clientId,
                membership.membershipId
            );

            if (result?.clientMembershipId) {
                await MembershipService.activateClientMembership(
                    result.clientMembershipId
                );
            }

            window.alert(
                "Membresía renovada correctamente."
            );

            if (typeof ClientService !== "undefined") {
                this.selectedClient = await ClientService.get(
                    client.clientId
                );
            }

            await this.refresh();
            await this.selectClientMembership(
                client.clientId
            );

        } catch (error) {

            console.error(
                "Error renovando membresía:",
                error
            );

            window.alert(
                error.message ||
                "No fue posible renovar la membresía."
            );

        }

    }


    async selectClientMembership(
        clientId
    ) {

        try {

            const memberships =
                await MembershipService.getClientMemberships(
                    clientId
                );

            if (
                !memberships ||
                memberships.length === 0
            ) {

                console.warn(
                    "El cliente no tiene membresías."
                );

                return;

            }

            const membership =
                memberships.find(
                    item =>
                        [
                            "ACTIVE",
                            "FROZEN"
                        ].includes(
                            String(item.status || "").toUpperCase()
                        )
                ) || memberships[0];

            if (
                membership &&
                membership.membershipId
            ) {

                await this.loadMembership(
                    membership.membershipId
                );

            }

        } catch (error) {

            console.error(
                "Error al seleccionar la membresía del cliente:",
                error
            );

        }

    }

    async deleteMembership() {

        if (

            !confirm(

                "¿Deseas desactivar esta membresía?"

            )

        ) {

            return;

        }

        try {

            await MembershipService.delete(

                this.selectedMembership.membershipId

            );

            await this.refresh();

        }

        catch (error) {

            console.error(error);

        }

    }

    clearProfile() {

        document.getElementById(

            "membershipDetails"

        ).innerHTML = `

            <div class="empty-state">

                <h2>

                    Selecciona una membresía

                </h2>

                <p>

                    Aquí aparecerá toda la información.

                </p>

            </div>

        `;

    }

}

window.MembershipModule = new MembershipModule();

ModuleFactory.register(
    "memberships",
    window.MembershipModule
);
