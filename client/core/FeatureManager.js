class FeatureManager {

    static loadedCSS = new Set();

    static async load(featurePath) {

        try {

            const basePath = `features/${featurePath}`;

            await this.loadCSS(`${basePath}.css`);

            const response =
                await fetch(`${basePath}.html`);

            if (!response.ok) {

                throw new Error(
                    `No se pudo cargar ${basePath}.html`
                );

            }

            return await response.text();

        }

        catch (error) {

            console.error(error);

            return "<h2>Error cargando Feature</h2>";

        }

    }


    static async render(featurePath) {

        const workspace =
            document.getElementById("workspace");

        if (!workspace) {

            throw new Error(
                "Workspace no encontrado."
            );

        }

        const html =
            await this.load(featurePath);

        workspace.innerHTML = html;

        return html;

    }


    static async loadCSS(cssPath) {

        if (this.loadedCSS.has(cssPath)) {

            return;

        }

        return new Promise((resolve, reject) => {

            const link =
                document.createElement("link");

            link.rel = "stylesheet";

            link.href = cssPath;

            link.onload = () => {

                this.loadedCSS.add(cssPath);

                resolve();

            };

            link.onerror = () => {

                reject(
                    new Error(
                        `No se pudo cargar ${cssPath}`
                    )
                );

            };

            document.head.appendChild(link);

        });

    }

}
