/*
====================================================

    FLOWMANAGER

    FEATURE MANAGER v2.0

====================================================
*/

class FeatureManager {

    static loadedCSS = new Set();

    static async load(featurePath) {

        const htmlPath = `features/${featurePath}.html`;
        const cssPath = `features/${featurePath}.css`;

        await this.loadCSS(cssPath);

        const response = await fetch(htmlPath);

        if (!response.ok) {

            throw new Error(

                `No fue posible cargar ${htmlPath}`

            );

        }

        return await response.text();

    }

    static async render(featurePath) {

        const workspace = document.getElementById(

            "workspace"

        );

        if (!workspace) {

            throw new Error(

                "Workspace no encontrado."

            );

        }

        workspace.innerHTML = await this.load(

            featurePath

        );

    }

    static async loadCSS(cssPath) {

        if (this.loadedCSS.has(cssPath)) {

            return;

        }

        return new Promise((resolve, reject) => {

            const link = document.createElement(

                "link"

            );

            link.rel = "stylesheet";

            link.href = cssPath;

            link.onload = () => {

                this.loadedCSS.add(cssPath);

                resolve();

            };

            link.onerror = () => {

                reject(

                    new Error(

                        `No fue posible cargar ${cssPath}`

                    )

                );

            };

            document.head.appendChild(link);

        });

    }

    static async openModal(featurePath) {

        const html = await this.load(

            featurePath

        );

        openModal(html);

    }

}