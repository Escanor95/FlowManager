/*
====================================================

    FLOWMANAGER

    MODULE FACTORY v2.1

====================================================
*/

class ModuleFactory {


    // ====================================================
    // MÓDULOS REGISTRADOS
    // ====================================================

    static modules =
        new Map();


    // ====================================================
    // MÓDULO ACTIVO
    // ====================================================

    static activeModule =
        null;


    // ====================================================
    // REGISTRAR
    // ====================================================

    static register(
        name,
        module
    ) {

        if (!name) {

            throw new Error(

                "El nombre del módulo es obligatorio."

            );

        }


        this.modules.set(

            name,

            module

        );

    }


    // ====================================================
    // OBTENER
    // ====================================================

    static get(
        name
    ) {

        const module =
            this.modules.get(
                name
            );


        if (!module) {

            throw new Error(

                `El módulo '${name}' no está registrado.`

            );

        }


        return module;

    }


    // ====================================================
    // ABRIR MÓDULO
    // ====================================================

    static async open(
        name,
        context = null
    ) {

        const nextModule =
            this.get(
                name
            );


        /*
        =================================================

        SI YA HAY UN MÓDULO ABIERTO,
        LO CERRAMOS ANTES DE CAMBIAR.

        =================================================
        */

        if (

            this.activeModule

            &&

            this.activeModule !==
            nextModule

        ) {

            if (

                typeof
                this.activeModule.close ===
                "function"

            ) {

                try {

                    await this.activeModule.close();

                }

                catch (
                error
                ) {

                    console.warn(

                        "Error al cerrar módulo anterior:",

                        error

                    );

                }

            }

        }


        /*
        =================================================

        ABRIR NUEVO MÓDULO

        =================================================
        */

        await nextModule.open(
            context
        );

        /*
        =================================================

        GUARDAR COMO ACTIVO

        =================================================
        */

        this.activeModule =
            nextModule;

    }


    // ====================================================
    // REFRESCAR
    // ====================================================

    static async refresh(
        name
    ) {

        const module =
            this.get(
                name
            );


        if (

            typeof module.refresh ===
            "function"

        ) {

            await module.refresh();

        }

    }


    // ====================================================
    // EXISTE
    // ====================================================

    static exists(
        name
    ) {

        return this.modules.has(
            name
        );

    }


    // ====================================================
    // DESREGISTRAR
    // ====================================================

    static unregister(
        name
    ) {

        const module =
            this.modules.get(
                name
            );


        if (

            module ===
            this.activeModule

        ) {

            this.activeModule =
                null;

        }


        this.modules.delete(
            name
        );

    }


    // ====================================================
    // CERRAR MÓDULO ACTIVO
    // ====================================================

    static async closeActive() {

        if (
            !this.activeModule
        ) {

            return;

        }


        if (

            typeof
            this.activeModule.close ===
            "function"

        ) {

            try {

                await this.activeModule.close();

            }

            catch (
            error
            ) {

                console.warn(

                    "Error al cerrar módulo:",

                    error

                );

            }

        }


        this.activeModule =
            null;

    }


    // ====================================================
    // LIMPIAR
    // ====================================================

    static clear() {

        this.modules.clear();

        this.activeModule =
            null;

    }

}
