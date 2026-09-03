/*
====================================================

    FLOWMANAGER

    ATTENDANCE SERVICE

====================================================
*/

const AttendanceService = {


    // ====================================================
    // HEADERS
    // ====================================================

    getHeaders() {

        const token =
            AuthService.getToken();


        return {

            "Content-Type":
                "application/json",

            ...(token

                ? {

                    "Authorization":
                        `Bearer ${token}`

                }

                : {})

        };

    },


    // ====================================================
    // OBTENER TODAS LAS ASISTENCIAS
    //
    // ADMIN / PERSONAL
    //
    // El backend será responsable de filtrar
    // las asistencias cuando el usuario sea Coach.
    // ====================================================

    async getAll() {

        const response =
            await fetch(

                "/attendance",

                {

                    method:
                        "GET",

                    headers:
                        this.getHeaders()

                }

            );


        const data =
            await response
                .json()
                .catch(
                    () => null
                );


        if (
            !response.ok
        ) {

            throw new Error(

                data?.message
                ||
                "No fue posible obtener las asistencias."

            );

        }


        return data;

    },


    // ====================================================
    // OBTENER ASISTENCIAS DE UNA CLIENTA
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


        const response =
            await fetch(

                `/attendance/client/${encodeURIComponent(
                    clientId
                )}`,

                {

                    method:
                        "GET",

                    headers:
                        this.getHeaders()

                }

            );


        const data =
            await response
                .json()
                .catch(
                    () => null
                );


        if (
            !response.ok
        ) {

            throw new Error(

                data?.message
                ||
                "No fue posible obtener las asistencias."

            );

        }


        return data;

    },


    // ====================================================
    // OBTENER ASISTENCIAS RECIENTES
    // ====================================================

    async getRecent() {

        const response =
            await fetch(

                "/attendance/recent",

                {

                    method:
                        "GET",

                    headers:
                        this.getHeaders()

                }

            );


        const data =
            await response
                .json()
                .catch(
                    () => null
                );


        if (
            !response.ok
        ) {

            throw new Error(

                data?.message
                ||
                "No fue posible obtener las asistencias recientes."

            );

        }


        return data;

    },


    // ====================================================
    // REGISTRAR ASISTENCIA
    //
    // IMPORTANTE:
    //
    // El clientId identifica a la clienta.
    //
    // El coach NO se manda manualmente desde aquí.
    //
    // El backend debe utilizar req.user para saber
    // quién está intentando registrar la asistencia
    // y validar que la clienta pertenece a una clase
    // asignada a ese coach.
    // ====================================================

    async register(
        clientId
    ) {

        if (
            !clientId
        ) {

            throw new Error(
                "ClientId requerido."
            );

        }


        const response =
            await fetch(

                "/attendance",

                {

                    method:
                        "POST",

                    headers:
                        this.getHeaders(),

                    body:
                        JSON.stringify({

                            clientId

                        })

                }

            );


        const data =
            await response
                .json()
                .catch(
                    () => null
                );


        if (
            !response.ok
        ) {

            throw new Error(

                data?.message
                ||
                "No fue posible registrar la asistencia."

            );

        }


        return data;

    }

};


// ====================================================
// EXPORTAR
// ====================================================

window.AttendanceService =
    AttendanceService;