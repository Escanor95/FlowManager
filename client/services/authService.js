/*
====================================================

    FLOWMANAGER

    AUTH SERVICE

====================================================
*/

const AuthService = {


    // ====================================================
    // LOGIN
    // ====================================================

    async login(
        email,
        password
    ) {

        const response =
            await fetch(

                "/auth/login",

                {

                    method:
                        "POST",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    body:
                        JSON.stringify({

                            email,

                            password

                        })

                }

            );


        const data =
            await response
                .json()
                .catch(
                    () => ({})
                );


        if (
            !response.ok
        ) {

            throw new Error(

                data.message ||

                "No fue posible iniciar sesión."

            );

        }


        // ==============================================
        // GUARDAR TOKEN
        // ==============================================

        sessionStorage.setItem(

            "flowmanager_token",

            data.token

        );


        // ==============================================
        // NORMALIZAR USUARIO
        //
        // IMPORTANTE:
        // Para Coach conservamos coachId si el backend
        // ya lo proporciona.
        // ==============================================

        const user =
            this.normalizeUser(
                data.user
            );


        sessionStorage.setItem(

            "flowmanager_user",

            JSON.stringify(
                user
            )

        );


        return {

            ...data,

            user

        };

    },


    // ====================================================
    // NORMALIZAR USUARIO
    // ====================================================

    normalizeUser(
        user
    ) {

        if (
            !user
        ) {

            return null;

        }


        const normalized = {

            ...user

        };


        normalized.userId =
            user.userId ||
            null;


        normalized.fullName =
            user.fullName ||
            user.name ||
            "";


        normalized.email =
            user.email ||
            "";


        normalized.role =
            String(
                user.role || ""
            )
                .trim()
                .toLowerCase();


        normalized.clientId =
            user.clientId ||
            null;


        normalized.coachId =
            user.coachId ||
            null;


        normalized.isRoot =

            user.isRoot === true ||

            Number(
                user.isRoot
            ) === 1;


        return normalized;

    },


    // ====================================================
    // LOGOUT
    // ====================================================

    logout() {

        sessionStorage.removeItem(
            "flowmanager_token"
        );


        sessionStorage.removeItem(
            "flowmanager_user"
        );


        window.location.reload();

    },


    // ====================================================
    // TOKEN
    // ====================================================

    getToken() {

        return sessionStorage.getItem(

            "flowmanager_token"

        );

    },


    // ====================================================
    // USUARIO
    // ====================================================

    getUser() {

        const data =
            sessionStorage.getItem(

                "flowmanager_user"

            );


        if (
            !data
        ) {

            return null;

        }


        try {

            const user =
                JSON.parse(
                    data
                );


            return this.normalizeUser(
                user
            );

        }

        catch {

            sessionStorage.removeItem(
                "flowmanager_user"
            );


            return null;

        }

    },


    // ====================================================
    // AUTENTICACIÓN
    // ====================================================

    isAuthenticated() {

        return Boolean(

            this.getToken()

        );

    }

};


window.AuthService =
    AuthService;