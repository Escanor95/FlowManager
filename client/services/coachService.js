/*
====================================================

    AURA ACCESS PRO

    COACH SERVICE

====================================================
*/

const CoachService = {


    // ====================================================
    // TOKEN
    // ====================================================

    getHeaders() {

        const token =
            AuthService.getToken();


        return {

            "Content-Type":
                "application/json",

            "Authorization":
                `Bearer ${token}`

        };

    },


    // ====================================================
    // OBTENER TODOS
    // ====================================================

    async getAll() {

        const response =
            await fetch(
                "/coaches",
                {

                    headers:
                        this.getHeaders()

                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(

                data.message ||
                "No fue posible obtener los coaches."

            );

        }


        return data;

    },


    // ====================================================
    // OBTENER ACTIVOS
    // ====================================================

    async getActive() {

        const response =
            await fetch(
                "/coaches/active",
                {

                    headers:
                        this.getHeaders()

                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(

                data.message ||
                "No fue posible obtener los coaches."

            );

        }


        return data;

    },


    // ====================================================
    // CREAR
    // ====================================================

    async create(coachData) {

        const response =
            await fetch(
                "/coaches",
                {

                    method:
                        "POST",

                    headers:
                        this.getHeaders(),

                    body:
                        JSON.stringify(
                            coachData
                        )

                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(

                data.message ||
                "No fue posible crear el coach."

            );

        }


        return data;

    },


    // ====================================================
    // ACTUALIZAR
    // ====================================================

    async update(
        coachId,
        coachData
    ) {

        const response =
            await fetch(
                `/coaches/${coachId}`,
                {

                    method:
                        "PUT",

                    headers:
                        this.getHeaders(),

                    body:
                        JSON.stringify(
                            coachData
                        )

                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(

                data.message ||
                "No fue posible actualizar el coach."

            );

        }


        return data;

    },


    // ====================================================
    // DESACTIVAR
    // ====================================================

    async deactivate(coachId) {

        const response =
            await fetch(
                `/coaches/${coachId}/deactivate`,
                {

                    method:
                        "PATCH",

                    headers:
                        this.getHeaders()

                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(

                data.message ||
                "No fue posible desactivar el coach."

            );

        }


        return data;

    },


    // ====================================================
    // ACTIVAR
    // ====================================================

    async activate(coachId) {

        const response =
            await fetch(
                `/coaches/${coachId}/activate`,
                {

                    method:
                        "PATCH",

                    headers:
                        this.getHeaders()

                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(

                data.message ||
                "No fue posible activar el coach."

            );

        }


        return data;

    }

};