/*
====================================================

    FLOWMANAGER

    SCHEDULE SERVICE

====================================================
*/

const ScheduleService = {

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
    // OBTENER TODOS
    // ====================================================

    async getAll() {

        return await this.request(

            "/schedules",

            {

                method:
                    "GET"

            }

        );

    },


    // ====================================================
    // OBTENER UNO
    // ====================================================

    async get(
        scheduleId
    ) {

        if (
            !scheduleId
        ) {

            throw new Error(
                "ScheduleId requerido."
            );

        }


        return await this.request(

            `/schedules/${encodeURIComponent(
                scheduleId
            )}`,

            {

                method:
                    "GET"

            }

        );

    },


    // ====================================================
    // CREAR
    // ====================================================

    async create(
        schedule
    ) {

        if (
            !schedule
        ) {

            throw new Error(
                "Datos de horario requeridos."
            );

        }


        return await this.request(

            "/schedules",

            {

                method:
                    "POST",

                body:
                    JSON.stringify(
                        schedule
                    )

            }

        );

    },


    // ====================================================
    // ACTUALIZAR
    // ====================================================

    async update(
        scheduleId,
        schedule
    ) {

        if (
            !scheduleId
        ) {

            throw new Error(
                "ScheduleId requerido."
            );

        }


        if (
            !schedule
        ) {

            throw new Error(
                "Datos de horario requeridos."
            );

        }


        return await this.request(

            `/schedules/${encodeURIComponent(
                scheduleId
            )}`,

            {

                method:
                    "PUT",

                body:
                    JSON.stringify(
                        schedule
                    )

            }

        );

    },


    // ====================================================
    // ELIMINAR / DESACTIVAR
    // ====================================================

    async delete(
        scheduleId
    ) {

        if (
            !scheduleId
        ) {

            throw new Error(
                "ScheduleId requerido."
            );

        }


        return await this.request(

            `/schedules/${encodeURIComponent(
                scheduleId
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

window.ScheduleService =
    ScheduleService;