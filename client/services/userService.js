/*
====================================================

    FLOWMANAGER

    USER SERVICE

====================================================
*/

const UserService = {

    async request(url, options = {}) {

        const token =
            AuthService.getToken();

        const response =
            await fetch(url, {

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

            });


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(

                data.message ||
                "No fue posible completar la operación."

            );

        }


        return data;

    },


    // ====================================================
    // LISTAR USUARIOS
    // ====================================================

    async getAll() {

        return await this.request(
            "/users"
        );

    },


    // ====================================================
    // CREAR USUARIO
    // ====================================================

    async create(user) {

        return await this.request(

            "/users",

            {

                method: "POST",

                body: JSON.stringify(user)

            }

        );

    },


    // ====================================================
    // ACTUALIZAR USUARIO
    // ====================================================

    async update(userId, user) {

        return await this.request(

            `/users/${userId}`,

            {

                method: "PUT",

                body: JSON.stringify(user)

            }

        );

    },


    // ====================================================
    // DESACTIVAR USUARIO
    // ====================================================

    async deactivate(userId) {

        return await this.request(

            `/users/${userId}/deactivate`,

            {

                method: "PATCH"

            }

        );

    },


    // ====================================================
    // ACTIVAR USUARIO
    // ====================================================

    async activate(userId) {

        return await this.request(

            `/users/${userId}/activate`,

            {

                method: "PATCH"

            }

        );

    }

};


window.UserService =
    UserService;