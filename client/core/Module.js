/*
====================================================

    FLOWMANAGER

    MODULE BASE v2.2

====================================================
*/

class Module {


    constructor(
        name
    ) {

        this.name =
            name;

    }


    // ====================================================
    // WORKSPACE
    // ====================================================

    get workspace() {

        const workspace =
            document.getElementById(
                "workspace"
            );


        if (
            !workspace
        ) {

            throw new Error(

                "Workspace no encontrado."

            );

        }


        return workspace;

    }


    // ====================================================
    // ABRIR
    // ====================================================

    async open() {

        throw new Error(

            `${this.name}: open() no implementado.`

        );

    }


    // ====================================================
    // RENDER
    // ====================================================

    async render(
        featurePath
    ) {

        await FeatureManager.render(
            featurePath
        );

    }


    // ====================================================
    // COMPATIBILIDAD
    // ====================================================

    async load(
        featurePath
    ) {

        await this.render(
            featurePath
        );

    }


    // ====================================================
    // MODAL
    // ====================================================

    async openModal(
        featurePath
    ) {

        await FeatureManager.openModal(
            featurePath
        );

    }


    // ====================================================
    // REFRESH
    // ====================================================

    async refresh() {

        // Cada módulo puede implementar
        // su propia lógica.

    }


    // ====================================================
    // CLOSE
    // ====================================================

    async close() {

        // Método estándar.
        //
        // Los módulos que tengan recursos
        // especiales pueden sobrescribirlo.
        //
        // Ejemplo:
        // ScannerModule → detener cámara.

    }


    // ====================================================
    // CLEAR
    // ====================================================

    clear() {

        this.workspace.innerHTML =
            "";

    }


    // ====================================================
    // DESTROY
    // ====================================================

    async destroy() {

        await this.close();

        this.clear();

    }

}