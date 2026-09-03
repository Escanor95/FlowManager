/*
====================================================

    FLOWMANAGER

    DASHBOARD SERVICE

====================================================
*/

const DashboardService = {

    // ====================================================
    // OBTENER DATOS
    // ====================================================

    async getData() {

        const token =
            AuthService.getToken();


        const response =
            await fetch(

                "/dashboard",

                {

                    method:
                        "GET",

                    headers: {

                        "Authorization":
                            `Bearer ${token}`

                    }

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

                "No fue posible cargar el Dashboard."

            );

        }


        return data;

    }

};


// ====================================================
// EXPORTAR
// ====================================================

window.DashboardService =
    DashboardService;