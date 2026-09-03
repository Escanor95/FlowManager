/*
====================================================

    FLOWMANAGER

    AUTH SERVICE

====================================================
*/

const AuthService = {

    async login(email, password) {

        const response =
            await fetch("/auth/login", {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    email,
                    password
                })

            });


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "No fue posible iniciar sesión."
            );

        }


        localStorage.setItem(
            "flowmanager_token",
            data.token
        );


        localStorage.setItem(
            "flowmanager_user",
            JSON.stringify(data.user)
        );


        return data;

    },


    logout() {

        localStorage.removeItem(
            "flowmanager_token"
        );

        localStorage.removeItem(
            "flowmanager_user"
        );

        window.location.reload();

    },


    getToken() {

        return localStorage.getItem(
            "flowmanager_token"
        );

    },


    getUser() {

        const user =
            localStorage.getItem(
                "flowmanager_user"
            );

        if (!user) {
            return null;
        }

        try {
            return JSON.parse(user);
        }
        catch {
            return null;
        }

    },


    isAuthenticated() {

        return Boolean(
            this.getToken()
        );

    }

};


window.AuthService =
    AuthService;