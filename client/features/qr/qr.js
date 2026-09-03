/*
====================================================

    FLOWMANAGER

    QR MODULE

====================================================
*/

class QrModule extends Module {


    // ====================================================
    // CONSTRUCTOR
    // ====================================================

    constructor() {

        super(
            "Mi código QR"
        );


        this.user =
            null;


        this.client =
            null;

    }


    // ====================================================
    // ABRIR
    // ====================================================

    async open() {

        await this.load(
            "qr/qr"
        );


        await this.initialize();

    }


    // ====================================================
    // INICIALIZAR
    // ====================================================

    async initialize() {

        // ================================================
        // OBTENER USUARIO DE LA SESIÓN
        // ================================================

        this.user =
            AuthService.getUser();


        if (
            !this.user
        ) {

            throw new Error(
                "No hay una sesión activa."
            );

        }


        // ================================================
        // VALIDAR QUE SEA CLIENTE
        // ================================================

        if (
            !this.isClient()
        ) {

            this.showNotAvailable();

            return;

        }


        // ================================================
        // VALIDAR CLIENTE ASOCIADO
        // ================================================

        if (
            !this.user.clientId
        ) {

            throw new Error(
                "Este usuario no tiene un cliente asociado."
            );

        }


        // ================================================
        // CARGAR DATOS DE LA CLIENTA
        // ================================================

        await this.loadClient();


        // ================================================
        // MOSTRAR INFORMACIÓN EN LA TARJETA
        // ================================================

        this.renderClientInfo();


        // ================================================
        // CARGAR QR PERMANENTE
        // ================================================

        await this.loadQr();

    }


    // ====================================================
    // VERIFICAR SI ES CLIENTE
    // ====================================================

    isClient() {

        const role =
            String(
                this.user?.role || ""
            )
                .trim()
                .toLowerCase();


        return (

            role === "client"

            ||

            role === "clienta"

            ||

            role === "cliente"

        );

    }


    // ====================================================
    // CARGAR CLIENTE
    // ====================================================

    async loadClient() {

        this.client =
            await ClientService.get(

                this.user.clientId

            );


        if (
            !this.client
        ) {

            throw new Error(
                "No fue posible encontrar los datos de la clienta."
            );

        }

    }


    // ====================================================
    // RENDERIZAR INFORMACIÓN DE CLIENTE
    // ====================================================

    renderClientInfo() {

        const fullName =

            this.client?.fullName

            ||

            this.user?.fullName

            ||

            this.user?.name

            ||

            "Cliente";


        const clientId =

            this.client?.clientId

            ||

            this.user?.clientId

            ||

            "--";


        const initials =

            fullName
                .split(
                    " "
                )
                .filter(
                    Boolean
                )
                .slice(
                    0,
                    2
                )
                .map(

                    name =>

                        name
                            .charAt(0)
                            .toUpperCase()

                )
                .join(
                    ""
                );


        const nameElement =
            document.getElementById(
                "qrUserName"
            );


        const roleElement =
            document.getElementById(
                "qrUserRole"
            );


        const clientIdElement =
            document.getElementById(
                "qrClientId"
            );


        const initialsElement =
            document.getElementById(
                "qrUserInitials"
            );


        const statusElement =
            document.getElementById(
                "qrStatus"
            );


        // ================================================
        // NOMBRE
        // ================================================

        if (
            nameElement
        ) {

            nameElement.textContent =
                fullName;

        }


        // ================================================
        // ROL
        // ================================================

        if (
            roleElement
        ) {

            roleElement.textContent =
                "Cliente";

        }


        // ================================================
        // ID
        // ================================================

        if (
            clientIdElement
        ) {

            clientIdElement.textContent =
                clientId;

        }


        // ================================================
        // INICIALES
        // ================================================

        if (
            initialsElement
        ) {

            initialsElement.textContent =
                initials;

        }


        // ================================================
        // ESTADO
        // ================================================

        if (
            statusElement
        ) {

            const isActive =

                this.client?.isActive !==
                0;


            statusElement.textContent =

                isActive

                    ? "Activo"

                    : "Inactivo";

        }

    }


    // ====================================================
    // CARGAR QR
    // ====================================================

    async loadQr() {

        const container =
            document.getElementById(
                "qrCodeContainer"
            );


        if (
            !container
        ) {

            console.error(
                "No se encontró #qrCodeContainer"
            );

            return;

        }


        try {

            // ============================================
            // LOADING
            // ============================================

            container.innerHTML =
                this.getLoadingHtml();


            // ============================================
            // OBTENER QR DE LA CLIENTA
            // ============================================

            const qr =
                await ClientService.getQr(

                    this.user.clientId

                );


            console.log(
                "QR recibido:",
                qr
            );


            // ============================================
            // RENDERIZAR QR
            // ============================================

            await this.renderQr(
                qr
            );

        }

        catch (
        error
        ) {

            console.error(
                "Error al cargar QR:",
                error
            );


            this.showError(
                error.message
            );

        }

    }


    // ====================================================
    // RENDER QR
    // ====================================================

    async renderQr(
        qr
    ) {

        const container =
            document.getElementById(
                "qrCodeContainer"
            );


        if (
            !container
        ) {

            return;

        }


        // ==================================================
        // SOPORTAMOS DIFERENTES RESPUESTAS DEL BACKEND
        //
        // qr.qr
        // qr.qrCode
        // qr.code
        // qr.data
        // ==================================================

        const qrValue =

            qr?.qr

            ||

            qr?.qrCode

            ||

            qr?.code

            ||

            qr?.data

            ||

            null;


        if (
            !qrValue
        ) {

            throw new Error(
                "El servidor no devolvió un código QR válido."
            );

        }


        // ==================================================
        // SI EL BACKEND DEVUELVE UNA IMAGEN
        // ==================================================

        if (

            typeof qrValue === "string"

            &&

            (

                qrValue.startsWith(
                    "data:image"
                )

                ||

                qrValue.startsWith(
                    "http://"
                )

                ||

                qrValue.startsWith(
                    "https://"
                )

            )

        ) {

            container.innerHTML = `

                <img
                    class="fm-client-qr-image"
                    src="${qrValue}"
                    alt="Código QR"
                >

            `;

            return;

        }


        // ==================================================
        // SI EL BACKEND DEVUELVE EL CONTENIDO DEL QR
        //
        // Generamos visualmente el QR.
        // ==================================================

        await this.generateQrImage(
            qrValue
        );

    }


    // ====================================================
    // GENERAR IMAGEN QR
    // ====================================================

    async generateQrImage(
        value
    ) {

        const container =
            document.getElementById(
                "qrCodeContainer"
            );


        if (
            !container
        ) {

            return;

        }


        // ================================================
        // CARGAR LIBRERÍA QR
        // ================================================

        await this.loadQrLibrary();


        // ================================================
        // LIMPIAR CONTENEDOR
        // ================================================

        container.innerHTML =
            "";


        // ================================================
        // GENERAR QR
        // ================================================

        new QRCode(

            container,

            {

                text:

                    typeof value === "string"

                        ? value

                        : JSON.stringify(
                            value
                        ),


                width:
                    240,


                height:
                    240,


                correctLevel:

                    QRCode.CorrectLevel.H

            }

        );

    }


    // ====================================================
    // CARGAR LIBRERÍA QR
    // ====================================================

    async loadQrLibrary() {

        // ================================================
        // SI YA ESTÁ CARGADA
        // ================================================

        if (

            typeof QRCode !==
            "undefined"

        ) {

            return;

        }


        await new Promise(

            (
                resolve,
                reject
            ) => {

                // ========================================
                // VERIFICAR SI YA EXISTE EL SCRIPT
                // ========================================

                const existingScript =
                    document.querySelector(

                        'script[data-qrcode="true"]'

                    );


                if (
                    existingScript
                ) {

                    if (

                        typeof QRCode !==
                        "undefined"

                    ) {

                        resolve();

                        return;

                    }


                    existingScript.addEventListener(

                        "load",

                        resolve,

                        {
                            once: true
                        }

                    );


                    existingScript.addEventListener(

                        "error",

                        reject,

                        {
                            once: true
                        }

                    );


                    return;

                }


                // ========================================
                // CREAR SCRIPT
                // ========================================

                const script =
                    document.createElement(
                        "script"
                    );


                script.dataset.qrcode =
                    "true";


                script.src =
                    "https://cdn.jsdelivr.net/npm/qrcodejs@1.0.0/qrcode.min.js";


                script.onload =
                    () => {

                        if (

                            typeof QRCode ===
                            "undefined"

                        ) {

                            reject(

                                new Error(
                                    "La librería QR no se cargó correctamente."
                                )

                            );

                            return;

                        }


                        resolve();

                    };


                script.onerror =
                    () => {

                        reject(

                            new Error(
                                "No fue posible cargar la librería QR."
                            )

                        );

                    };


                document.head.appendChild(
                    script
                );

            }

        );

    }


    // ====================================================
    // LOADING
    // ====================================================

    getLoadingHtml() {

        return `

            <div
                class="fm-qr-loading"
            >

                <div
                    class="fm-qr-spinner"
                ></div>


                <span>

                    Cargando tu código QR...

                </span>

            </div>

        `;

    }


    // ====================================================
    // ERROR
    // ====================================================

    showError(
        message
    ) {

        const container =
            document.getElementById(
                "qrCodeContainer"
            );


        if (
            !container
        ) {

            return;

        }


        container.innerHTML = `

            <div
                class="fm-qr-error"
            >

                <span
                    class="material-symbols-outlined"
                >

                    error

                </span>


                <strong>

                    No fue posible cargar tu QR

                </strong>


                <p>

                    ${this.escapeHtml(
            message
        )}

                </p>


                <button
                    id="retryQrButton"
                    class="fm-qr-retry"
                >

                    Intentar nuevamente

                </button>

            </div>

        `;


        const retryButton =
            document.getElementById(
                "retryQrButton"
            );


        if (
            retryButton
        ) {

            retryButton.onclick =
                () => {

                    this.loadQr();

                };

        }

    }


    // ====================================================
    // NO DISPONIBLE
    // ====================================================

    showNotAvailable() {

        const container =
            document.getElementById(
                "qrCodeContainer"
            );


        if (
            !container
        ) {

            return;

        }


        container.innerHTML = `

            <div
                class="fm-qr-error"
            >

                <span
                    class="material-symbols-outlined"
                >

                    lock

                </span>


                <strong>

                    QR no disponible

                </strong>


                <p>

                    Esta función está disponible
                    únicamente para clientes.

                </p>

            </div>

        `;

    }


    // ====================================================
    // ESCAPE HTML
    // ====================================================

    escapeHtml(
        value
    ) {

        return String(
            value ?? ""
        )

            .replace(
                /&/g,
                "&amp;"
            )

            .replace(
                /</g,
                "&lt;"
            )

            .replace(
                />/g,
                "&gt;"
            )

            .replace(
                /"/g,
                "&quot;"
            )

            .replace(
                /'/g,
                "&#039;"
            );

    }

}


// ====================================================
// INSTANCIA
// ====================================================

window.QrModule =
    new QrModule();


// ====================================================
// REGISTRO
// ====================================================

ModuleFactory.register(

    "qr",

    window.QrModule

);


// ====================================================
// LOG
// ====================================================

console.log(
    "QrModule registrado correctamente"
);