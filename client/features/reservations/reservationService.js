/*
====================================================

    FLOWMANAGER

    RESERVATION SERVICE

====================================================
*/

const ReservationService = {


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

            const details =
                data.invalidDates?.length

                    ? ` (${data.invalidDates
                        .map(
                            item => item.date
                        )
                        .join(", ")})`

                    : "";


            throw new Error(

                (
                    data.message ||

                    "No fue posible completar la operación."

                )

                +

                details

            );

        }


        return data;

    },


    // ====================================================
    // OBTENER TODAS
    // ====================================================

    async getAll() {

        return await this.request(

            "/reservations"

        );

    },


    // ====================================================
    // OBTENER UNA
    // ====================================================

    async get(
        reservationId
    ) {

        return await this.request(

            `/reservations/${encodeURIComponent(
                reservationId
            )}`

        );

    },


    // ====================================================
    // OBTENER POR CLIENTE
    // ====================================================

    async getByClient(
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

            `/reservations/client/${encodeURIComponent(
                clientId
            )}`

        );

    },


    // ====================================================
    // OBTENER POR COACH
    // ====================================================

    async getByCoach() {

        return await this.request(

            "/reservations/coach"

        );

    },


    // ====================================================
    // CREAR UNA CLIENTA
    // ====================================================

    async create(
        reservation
    ) {

        if (
            !reservation
        ) {

            throw new Error(
                "Datos de reservación requeridos."
            );

        }


        return await this.request(

            "/reservations",

            {

                method:
                    "POST",

                body:
                    JSON.stringify(
                        reservation
                    )

            }

        );

    },


    // ====================================================
    // DISPONIBILIDAD CLIENTA
    // ====================================================

    async getAvailability({

        clientId,

        scheduleId,

        from,

        to

    }) {

        if (

            !clientId
            ||
            !scheduleId
            ||
            !from
            ||
            !to

        ) {

            throw new Error(
                "clientId, scheduleId, from y to son requeridos."
            );

        }


        const query =
            new URLSearchParams({

                clientId,

                scheduleId,

                from,

                to

            });


        return await this.request(

            `/reservations/availability?${query.toString()}`

        );

    },


    // ====================================================
    // DISPONIBILIDAD COACH
    //
    // NO ENVÍA coachId.
    //
    // El servidor identifica al coach
    // mediante la sesión autenticada.
    // ====================================================

    async getCoachAvailability({

        scheduleId,

        from,

        to

    }) {

        if (

            !scheduleId
            ||
            !from
            ||
            !to

        ) {

            throw new Error(
                "scheduleId, from y to son requeridos."
            );

        }


        const query =
            new URLSearchParams({

                scheduleId,

                from,

                to

            });


        return await this.request(

            `/reservations/coach/availability?${query.toString()}`

        );

    },


    // ====================================================
    // CREAR LOTE CLIENTA
    // ====================================================

    async createBatch({

        clientId,

        scheduleId,

        reservationDates

    }) {

        if (

            !clientId
            ||
            !scheduleId
            ||
            !Array.isArray(
                reservationDates
            )
            ||
            !reservationDates.length

        ) {

            throw new Error(
                "Datos de reservación inválidos."
            );

        }


        return await this.request(

            "/reservations/batch",

            {

                method:
                    "POST",

                body:
                    JSON.stringify({

                        clientId,

                        scheduleId,

                        reservationDates

                    })

            }

        );

    },


    // ====================================================
    // CREAR LOTE COACH
    //
    // NO ENVÍA coachId.
    //
    // El backend lo obtiene de la sesión.
    // ====================================================

    async createCoachBatch({

        scheduleId,

        reservationDates

    }) {

        if (

            !scheduleId
            ||
            !Array.isArray(
                reservationDates
            )
            ||
            !reservationDates.length

        ) {

            throw new Error(
                "Horario y fechas de reservación son requeridos."
            );

        }


        return await this.request(

            "/reservations/coach/batch",

            {

                method:
                    "POST",

                body:
                    JSON.stringify({

                        scheduleId,

                        reservationDates

                    })

            }

        );

    },


    // ====================================================
    // CANCELAR
    //
    // El servidor determina si la reservación pertenece
    // al coach autenticado cuando corresponde.
    // ====================================================

    async cancel(
        reservationId
    ) {

        if (
            !reservationId
        ) {

            throw new Error(
                "ReservationId requerido."
            );

        }


        return await this.request(

            `/reservations/${encodeURIComponent(
                reservationId
            )}`,

            {

                method:
                    "DELETE"

            }

        );

    }

};


// ====================================================
// GLOBAL
// ====================================================

window.ReservationService =
    ReservationService;