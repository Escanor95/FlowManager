/*
====================================================

    FLOWMANAGER

    ROUTER v2.3

====================================================
*/

class Router {


    // ====================================================
    // RUTAS
    // ====================================================

    static routes =
        new Map();


    // ====================================================
    // COLA DE NAVEGACIÓN
    // ====================================================

    static navigationQueue =
        Promise.resolve();


    // ====================================================
    // REGISTRAR RUTA
    // ====================================================

    static register(
        name,
        handler
    ) {

        this.routes.set(
            name,
            handler
        );

    }


    // ====================================================
    // NAVEGAR
    // ====================================================

    static async navigate(
        name
    ) {

        const handler =
            this.routes.get(
                name
            );


        if (
            !handler
        ) {

            throw new Error(
                `La ruta '${name}' no existe.`
            );

        }


        /*
        =================================================

        RECUPERAR LA COLA ANTERIOR.

        Si una navegación anterior falló,
        no bloqueamos las siguientes.

        =================================================
        */

        this.navigationQueue =
            this.navigationQueue
                .catch(
                    error => {

                        console.warn(
                            "Error recuperado de navegación anterior:",
                            error
                        );

                    }
                )
                .then(
                    async () => {

                        // =================================
                        // SIDEBAR
                        // =================================

                        document
                            .querySelectorAll(
                                ".fm-menu-item"
                            )
                            .forEach(
                                button => {

                                    button.classList.toggle(

                                        "active",

                                        button.dataset.feature ===
                                        name

                                    );

                                }
                            );


                        // =================================
                        // TÍTULO
                        // =================================

                        const activeButton =
                            document.querySelector(
                                `.fm-menu-item[data-feature="${name}"]`
                            );


                        const pageTitle =
                            document.getElementById(
                                "pageTitle"
                            );


                        if (

                            activeButton &&

                            pageTitle

                        ) {

                            pageTitle.textContent =
                                activeButton
                                    .textContent
                                    .trim();

                        }


                        // =================================
                        // EJECUTAR RUTA
                        // =================================

                        await handler();

                    }
                );


        return this.navigationQueue;

    }


    // ====================================================
    // VERIFICAR EXISTENCIA
    // ====================================================

    static exists(
        name
    ) {

        return this.routes.has(
            name
        );

    }


    // ====================================================
    // LIMPIAR
    // ====================================================

    static clear() {

        this.routes.clear();


        this.navigationQueue =
            Promise.resolve();

    }

}