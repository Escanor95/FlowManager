/*
====================================================

    FLOWMANAGER CORE

    FeatureManager v1.0

    Responsabilidad:

    - Cargar HTML
    - Cargar CSS
    - Evitar CSS duplicados

====================================================
*/

class FeatureManager {

    static loadedCSS = new Set();

    static async load(featurePath) {

        try {

            const basePath = `features/${featurePath}`;

            await this.loadCSS(`${basePath}.css`);

            const response = await fetch(`${basePath}.html`);

            if (!response.ok) {

                throw new Error(`No se pudo cargar ${basePath}.html`);

            }

            return await response.text();

        }

        catch (error) {

            console.error(error);

            return "<h2>Error cargando Feature</h2>";

        }

    }

    static async loadCSS(cssPath) {

        if (this.loadedCSS.has(cssPath)) {

            return;

        }

        return new Promise((resolve) => {

            const link = document.createElement("link");

            link.rel = "stylesheet";

            link.href = cssPath;

            link.onload = () => {

                this.loadedCSS.add(cssPath);

                resolve();

            };

            document.head.appendChild(link);

        });

    }

}