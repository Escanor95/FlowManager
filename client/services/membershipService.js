const MembershipService = {

    async getAll() {

        const response = await fetch("/memberships");

        if (!response.ok) {

            throw new Error(
                "No fue posible obtener las membresías."
            );

        }

        return await response.json();

    },

    async get(membershipId) {

        const response = await fetch(

            `/memberships/${membershipId}`

        );

        if (!response.ok) {

            throw new Error(
                "No fue posible obtener la membresía."
            );

        }

        return await response.json();

    },

    async search(query) {

        const response = await fetch(

            `/memberships/search/${query}`

        );

        if (!response.ok) {

            throw new Error(
                "No fue posible realizar la búsqueda."
            );

        }

        return await response.json();

    },

    async create(membership) {

        const response = await fetch(

            "/memberships",

            {

                method: "POST",

                headers: {

                    "Content-Type": "application/json"

                },

                body: JSON.stringify(membership)

            }

        );

        if (!response.ok) {

            throw new Error(
                "No fue posible registrar la membresía."
            );

        }

        return await response.json();

    },

    async update(membershipId, membership) {

        const response = await fetch(

            `/memberships/${membershipId}`,

            {

                method: "PUT",

                headers: {

                    "Content-Type": "application/json"

                },

                body: JSON.stringify(membership)

            }

        );

        if (!response.ok) {

            throw new Error(
                "No fue posible actualizar la membresía."
            );

        }

        return await response.json();

    },

    async delete(membershipId) {

        const response = await fetch(

            `/memberships/${membershipId}`,

            {

                method: "DELETE"

            }

        );

        if (!response.ok) {

            throw new Error(
                "No fue posible desactivar la membresía."
            );

        }

        return await response.json();

    },

async getClientMemberships(
    clientId
) {

    if (!clientId) {
        throw new Error(
            "ClientId requerido."
        );
    }

    const response = await fetch(
        `/clients/${encodeURIComponent(
            clientId
        )}/memberships`
    );

    if (!response.ok) {
        throw new Error(
            "No se pudieron obtener las membresías del cliente."
        );
    }

    return await response.json();

},


async activateClientMembership(
    clientMembershipId
) {

    if (!clientMembershipId) {
        throw new Error(
            "ClientMembershipId requerido."
        );
    }

    const response = await fetch(
        `/clients/memberships/${encodeURIComponent(
            clientMembershipId
        )}/activate`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            }
        }
    );

    if (!response.ok) {
        let message = "No se pudo activar la membresía.";
        try {
            const data = await response.json();
            message = data.message || message;
        } catch (_) {}
        throw new Error(message);
    }

    return await response.json();

},


async renewClient(clientId, membershipId) {

        const response = await fetch(

            `/clients/${encodeURIComponent(clientId)}/renew`,

            {

                method: "POST",

                headers: {

                    "Content-Type":
                        "application/json"

                },

                body: JSON.stringify({

                    membershipId

                })

            }

        );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(

                data.message ||
                "No fue posible renovar la membresía."

            );

        }


        return data;

    }

};
