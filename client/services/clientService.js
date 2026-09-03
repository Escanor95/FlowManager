/*
====================================================

    FLOWMANAGER

    CLIENT SERVICE

====================================================
*/

const ClientService = {

    // ====================================================
    // REQUEST BASE
    // ====================================================

    async request(
        url,
        options = {}
    ) {

        const token =
            AuthService.getToken();


        const response =
            await fetch(

                url,

                {

                    ...options,

                    headers: {

                        "Content-Type":
                            "application/json",

                        ...(options.headers || {}),

                        ...(token
                            ? {
                                Authorization:
                                    `Bearer ${token}`
                            }
                            : {})

                    }

                }

            );


        const data =
            await response
                .json()
                .catch(
                    () => ({})
                );


        if (!response.ok) {

            throw new Error(

                data.message
                ||
                "No fue posible completar la operación."

            );

        }


        return data;

    },


    // ====================================================
    // OBTENER TODOS LOS CLIENTES
    // ====================================================

    async getAll() {

        return await this.request(

            "/clients",

            {

                method:
                    "GET"

            }

        );

    },


    // ====================================================
    // OBTENER CLIENTE
    // ====================================================

    async get(
        clientId
    ) {

        if (
            !clientId
        ) {

            throw new Error(
                "ClientId requerido."
            );

        }


        return await this.request(

            `/clients/${encodeURIComponent(
                clientId
            )}`,

            {

                method:
                    "GET"

            }

        );

    },


    // ====================================================
    // BUSCAR CLIENTES
    // ====================================================

    async search(
        query
    ) {

        if (
            !query
        ) {

            return [];

        }


        return await this.request(

            `/clients/search/${encodeURIComponent(
                query
            )}`,

            {

                method:
                    "GET"

            }

        );

    },


    // ====================================================
    // HISTORIAL DE RESERVACIONES
    // ====================================================

    async getReservationHistory(
        clientId
    ) {

        if (
            !clientId
        ) {

            throw new Error(
                "ClientId requerido."
            );

        }


        return await this.request(

            `/clients/${encodeURIComponent(
                clientId
            )}/reservations`,

            {

                method:
                    "GET"

            }

        );

    },


    // ====================================================
    // CREAR CLIENTE
    // ====================================================

    async create(
        client
    ) {

        if (
            !client
        ) {

            throw new Error(
                "Datos del cliente requeridos."
            );

        }


        return await this.request(

            "/clients",

            {

                method:
                    "POST",

                body:
                    JSON.stringify(
                        client
                    )

            }

        );

    },


    // ====================================================
    // ACTUALIZAR CLIENTE
    // ====================================================

    async update(
        clientId,
        client
    ) {

        if (
            !clientId
        ) {

            throw new Error(
                "ClientId requerido."
            );

        }


        if (
            !client
        ) {

            throw new Error(
                "Datos del cliente requeridos."
            );

        }


        return await this.request(

            `/clients/${encodeURIComponent(
                clientId
            )}`,

            {

                method:
                    "PUT",

                body:
                    JSON.stringify(
                        client
                    )

            }

        );

    },


    // ====================================================
    // ELIMINAR CLIENTE
    // ====================================================

    async delete(
        clientId
    ) {

        if (!clientId) {
            throw new Error(
                "ClientId requerido."
            );
        }

        return await this.request(
            `/clients/${encodeURIComponent(clientId)}`,
            {
                method: "DELETE"
            }
        );

    },


    // ====================================================
    // RENOVAR MEMBRESÍA
    // ====================================================

    async renewMembership(
        clientId,
        membershipId
    ) {

        if (
            !clientId
            ||
            !membershipId
        ) {

            throw new Error(
                "Cliente y membresía son requeridos."
            );

        }


        return await this.request(

            `/clients/${encodeURIComponent(
                clientId
            )}/renew`,

            {

                method:
                    "POST",

                body:
                    JSON.stringify({

                        membershipId

                    })

            }

        );

    },


    // ====================================================
    // OBTENER ACCESO APP
    // ====================================================

    async getAppAccess(
        clientId
    ) {

        if (
            !clientId
        ) {

            throw new Error(
                "ClientId requerido."
            );

        }


        return await this.request(

            `/clients/${encodeURIComponent(
                clientId
            )}/app-access`,

            {

                method:
                    "GET"

            }

        );

    },


    // ====================================================
    // GENERAR ACCESO APP
    // ====================================================

    async generateAppAccess(
        clientId
    ) {

        if (
            !clientId
        ) {

            throw new Error(
                "ClientId requerido."
            );

        }


        return await this.request(

            `/clients/${encodeURIComponent(
                clientId
            )}/app-access`,

            {

                method:
                    "POST"

            }

        );

    },


    // ====================================================
    // ACTUALIZAR ACCESO APP
    // ====================================================

    async updateAppAccess(
        clientId,
        access
    ) {

        if (
            !clientId
        ) {

            throw new Error(
                "ClientId requerido."
            );

        }


        if (
            !access
        ) {

            throw new Error(
                "Datos de acceso requeridos."
            );

        }


        return await this.request(

            `/clients/${encodeURIComponent(
                clientId
            )}/app-access`,

            {

                method:
                    "PUT",

                body:
                    JSON.stringify(
                        access
                    )

            }

        );

    },


    // ====================================================
    // OBTENER QR
    // ====================================================

    async getQr(
        clientId
    ) {

        if (
            !clientId
        ) {

            throw new Error(
                "ClientId requerido."
            );

        }


        return await this.request(

            `/clients/${encodeURIComponent(
                clientId
            )}/qr`,

            {

                method:
                    "GET"

            }

        );

    }

};


// ====================================================
// GLOBAL
// ====================================================

window.ClientService =
    ClientService;