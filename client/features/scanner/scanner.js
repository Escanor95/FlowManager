/*
====================================================

    FLOWMANAGER

    QR SCANNER MODULE

====================================================
*/

class ScannerModule extends Module {


    // ====================================================
    // CONSTRUCTOR
    // ====================================================

    constructor() {

        super(
            "Escanear QR"
        );


        this.user =
            null;


        this.isCoach =
            false;


        this.html5QrCode =
            null;


        this.isScanning =
            false;


        this.isProcessing =
            false;


        this.lastScannedValue =
            null;


        this.lastScanTime =
            0;


        this.scanCooldown =
            2500;


        this.visibilityHandler =
            null;


        this.beforeUnloadHandler =
            null;

    }


    // ====================================================
    // ABRIR
    // ====================================================

    async open() {

        await FeatureManager.render(
            "scanner/scanner"
        );


        this.loadStyles();


        this.user =
            AuthService.getUser();


        this.isCoach =
            String(
                this.user?.role || ""
            )
                .trim()
                .toLowerCase() ===
            "coach";


        this.initialize();


        this.registerCameraEvents();


        await this.startScanner();

    }


    // ====================================================
    // ESTILOS
    // ====================================================

    loadStyles() {

        if (
            document.getElementById(
                "scannerStyles"
            )
        ) {

            return;

        }


        const link =
            document.createElement(
                "link"
            );


        link.id =
            "scannerStyles";


        link.rel =
            "stylesheet";


        link.href =
            "features/scanner/scanner.css";


        document.head.appendChild(
            link
        );

    }


    // ====================================================
    // INICIALIZAR
    // ====================================================

    initialize() {

        const restartButton =
            document.getElementById(
                "restartScanner"
            );


        if (
            restartButton
        ) {

            restartButton.onclick =
                async () => {

                    await this.restartScanner();

                };

        }

    }


    // ====================================================
    // EVENTOS DE CÁMARA
    // ====================================================

    registerCameraEvents() {

        this.removeCameraEvents();


        this.visibilityHandler =
            async () => {

                if (
                    document.hidden
                ) {

                    await this.stopScanner();

                    return;

                }


                const reader =
                    document.getElementById(
                        "qrReader"
                    );


                if (
                    reader &&
                    !this.isScanning
                ) {

                    await this.startScanner();

                }

            };


        document.addEventListener(

            "visibilitychange",

            this.visibilityHandler

        );


        this.beforeUnloadHandler =
            () => {

                this.stopScanner();

            };


        window.addEventListener(

            "beforeunload",

            this.beforeUnloadHandler

        );

    }


    // ====================================================
    // ELIMINAR EVENTOS
    // ====================================================

    removeCameraEvents() {

        if (
            this.visibilityHandler
        ) {

            document.removeEventListener(

                "visibilitychange",

                this.visibilityHandler

            );


            this.visibilityHandler =
                null;

        }


        if (
            this.beforeUnloadHandler
        ) {

            window.removeEventListener(

                "beforeunload",

                this.beforeUnloadHandler

            );


            this.beforeUnloadHandler =
                null;

        }

    }


    // ====================================================
    // CARGAR LIBRERÍA
    // ====================================================

    async loadQrLibrary() {

        if (
            typeof Html5Qrcode !==
            "undefined"
        ) {

            return;

        }


        await new Promise(

            (
                resolve,
                reject
            ) => {

                const existingScript =
                    document.querySelector(

                        'script[data-html5-qrcode="true"]'

                    );


                if (
                    existingScript
                ) {

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


                const script =
                    document.createElement(
                        "script"
                    );


                script.dataset.html5Qrcode =
                    "true";


                script.src =
                    "https://unpkg.com/html5-qrcode@2.3.8/html5-qrcode.min.js";


                script.onload =
                    resolve;


                script.onerror =
                    reject;


                document.head.appendChild(
                    script
                );

            }

        );

    }


    // ====================================================
    // INICIAR ESCÁNER
    // ====================================================

    async startScanner() {

        const reader =
            document.getElementById(
                "qrReader"
            );


        if (
            !reader
        ) {

            return;

        }


        if (
            this.isScanning
        ) {

            return;

        }


        this.setStatus(
            "Preparando cámara..."
        );


        try {

            await this.loadQrLibrary();


            if (
                this.html5QrCode
            ) {

                await this.stopScanner();

            }


            reader.innerHTML =
                "";


            this.html5QrCode =
                new Html5Qrcode(
                    "qrReader"
                );


            const devices =
                await Html5Qrcode.getCameras();


            if (
                !devices.length
            ) {

                throw new Error(
                    "No se encontró ninguna cámara."
                );

            }


            const preferredCamera =
                this.getPreferredCamera(
                    devices
                );


            this.setStatus(

                this.isCoach

                    ? "Escanea el QR de la clienta"

                    : "Apunta la cámara hacia un código QR"

            );


            await this.html5QrCode.start(

                preferredCamera.id,

                {

                    fps:
                        10,

                    qrbox: {

                        width:
                            250,

                        height:
                            250

                    },

                    aspectRatio:
                        1.777

                },


                async (
                    decodedText
                ) => {

                    await this.handleScan(
                        decodedText
                    );

                },


                () => {

                    /*
                    ============================================
                    NO HACEMOS NADA AQUÍ.
                    ============================================
                    */

                }

            );


            this.isScanning =
                true;

        }

        catch (
        error
        ) {

            console.error(
                "Scanner error:",
                error
            );


            this.isScanning =
                false;


            this.setStatus(
                "No fue posible iniciar la cámara."
            );


            this.showCameraError(
                error
            );

        }

    }


    // ====================================================
    // ELEGIR CÁMARA
    // ====================================================

    getPreferredCamera(
        devices
    ) {

        const backCamera =
            devices.find(

                device =>
                    /back|rear|environment/i.test(
                        device.label
                    )

            );


        return (

            backCamera
            ||
            devices[0]

        );

    }


    // ====================================================
    // DETENER ESCÁNER
    // ====================================================

    async stopScanner() {

        if (

            !this.html5QrCode
            ||
            !this.isScanning

        ) {

            return;

        }


        try {

            await this.html5QrCode.stop();

        }

        catch (
        error
        ) {

            console.warn(

                "No fue posible detener la cámara:",

                error

            );

        }


        this.isScanning =
            false;

    }


    // ====================================================
    // REINICIAR
    // ====================================================

    async restartScanner() {

        await this.stopScanner();


        this.isProcessing =
            false;


        this.lastScannedValue =
            null;


        this.lastScanTime =
            0;


        const result =
            document.getElementById(
                "scannerResult"
            );


        if (
            result
        ) {

            result.className =
                "fm-scanner-empty";


            result.innerHTML = `

                <div
                    class="fm-scanner-empty-icon"
                >

                    ⌁

                </div>


                <strong>

                    Esperando un código QR

                </strong>


                <span>

                    ${this.isCoach

                    ? "Coloca la tarjeta de la clienta frente a la cámara."

                    : "Coloca una tarjeta digital frente a la cámara."
                }

                </span>

            `;

        }


        await this.startScanner();

    }


    // ====================================================
    // QR DETECTADO
    // ====================================================

    async handleScan(
        value
    ) {

        if (
            this.isProcessing
        ) {

            return;

        }


        const now =
            Date.now();


        // =================================================
        // EVITAR DUPLICADOS
        // =================================================

        if (

            value ===
            this.lastScannedValue

            &&

            now -
            this.lastScanTime

            <
            this.scanCooldown

        ) {

            return;

        }


        this.lastScannedValue =
            value;


        this.lastScanTime =
            now;


        this.isProcessing =
            true;


        this.setStatus(
            "Código QR detectado"
        );


        console.log(
            "QR detectado:",
            value
        );


        let data;


        try {

            data =
                JSON.parse(
                    value
                );

        }

        catch (
        error
        ) {

            this.showInvalidQr();


            this.isProcessing =
                false;


            return;

        }


        // =================================================
        // QR DE USUARIO
        // =================================================

        if (

            (

                data.type ===
                "FLOWMANAGER_USER"

                ||

                data.type ===
                "flowmanager-user"

            )

            &&

            data.userId

        ) {

            /*
            =================================================
            COACH

            El coach trabaja únicamente con QR de clientas
            desde este flujo.

            =================================================
            */

            if (
                this.isCoach
            ) {

                this.showCoachOnlyClientQr();


                this.isProcessing =
                    false;


                return;

            }


            await this.handleUserQr(
                data
            );


            this.isProcessing =
                false;


            return;

        }


        // =================================================
        // QR DE CLIENTE
        // =================================================

        if (

            (

                data.type ===
                "FLOWMANAGER_CLIENT"

                ||

                data.type ===
                "flowmanager-client"

            )

            &&

            data.clientId

        ) {

            await this.handleClientQr(
                data
            );


            this.isProcessing =
                false;


            return;

        }


        // =================================================
        // QR NO VÁLIDO
        // =================================================

        this.showInvalidQr();


        this.isProcessing =
            false;

    }


    // ====================================================
    // QR DE USUARIO
    // ====================================================

    async handleUserQr(
        data
    ) {

        try {

            const users =
                await UserService.getAll();


            const user =
                users.find(

                    item =>
                        item.userId ===
                        data.userId

                );


            if (
                !user
            ) {

                this.showNotFound(
                    "Usuario"
                );

                return;

            }


            this.showUserResult(
                user
            );


            this.setStatus(
                "Usuario identificado"
            );

        }

        catch (
        error
        ) {

            console.error(
                error
            );


            this.showError(
                error.message
            );

        }

    }


    // ====================================================
    // QR DE CLIENTE
    // ====================================================

    async handleClientQr(
        data
    ) {

        try {

            this.setStatus(
                "Buscando clienta..."
            );


            const client =
                await ClientService.get(
                    data.clientId
                );


            if (
                !client
            ) {

                this.showNotFound(
                    "Clienta"
                );

                return;

            }


            this.showClientResult(
                client
            );


            this.setStatus(
                "Validando asistencia..."
            );


            /*
            =================================================
            REGISTRAR ASISTENCIA

            El backend debe validar:

            - Clienta activa
            - Reservación confirmada
            - Fecha
            - Horario
            - Ventana de asistencia
            - Coach responsable
            - Asistencia duplicada

            =================================================
            */

            try {

                const attendance =
                    await AttendanceService.register(

                        client.clientId

                    );


                this.showAttendanceSuccess(

                    client,

                    attendance

                );


                this.setStatus(
                    "Asistencia registrada correctamente"
                );

            }

            catch (
            attendanceError
            ) {

                console.log(

                    "No fue posible registrar asistencia:",

                    attendanceError.message

                );


                this.showAttendancePending(

                    client,

                    attendanceError.message

                );


                this.setStatus(
                    "Cliente identificado"
                );

            }

        }

        catch (
        error
        ) {

            console.error(
                error
            );


            this.showNotFound(
                "Clienta"
            );

        }

    }


    // ====================================================
    // MOSTRAR USUARIO
    // ====================================================

    showUserResult(
        user
    ) {

        const result =
            document.getElementById(
                "scannerResult"
            );


        if (
            !result
        ) {

            return;

        }


        const initials =
            this.getInitials(
                user.fullName
            );


        const role =
            this.getRoleName(
                user.role
            );


        result.className =
            "fm-scan-success";


        result.innerHTML = `

            <div class="fm-scan-success-icon">

                ✓

            </div>


            <div class="fm-scan-avatar">

                ${user.photoUrl

                ?

                `

                            <img
                                src="${user.photoUrl}"
                                alt="${user.fullName}"
                            >

                        `

                :

                `

                            <span>

                                ${initials}

                            </span>

                        `
            }

            </div>


            <h3>

                ${user.fullName}

            </h3>


            <div class="fm-scan-role">

                ${role}

            </div>


            <div class="fm-scan-id">

                ${user.userId}

            </div>


            <div class="fm-scan-active">

                ${Number(
                user.isActive
            ) === 1

                ? "✓ Usuario activo"

                : "⚠ Usuario inactivo"
            }

            </div>

        `;

    }


    // ====================================================
    // MOSTRAR CLIENTA
    // ====================================================

    showClientResult(
        client
    ) {

        const result =
            document.getElementById(
                "scannerResult"
            );


        if (
            !result
        ) {

            return;

        }


        const fullName =

            client.fullName

            ||

            `${client.firstName || ""} ${client.lastName || ""}`
                .trim()

            ||

            "Clienta";


        const initials =
            this.getInitials(
                fullName
            );


        result.className =
            "fm-scan-success";


        result.innerHTML = `

            <div class="fm-scan-success-icon">

                ✓

            </div>


            <div class="fm-scan-avatar">

                ${client.photoUrl

                ?

                `

                            <img
                                src="${client.photoUrl}"
                                alt="${fullName}"
                            >

                        `

                :

                `

                            <span>

                                ${initials}

                            </span>

                        `
            }

            </div>


            <h3>

                ${fullName}

            </h3>


            <div class="fm-scan-id">

                ${client.clientId}

            </div>


            <div class="fm-scan-role">

                Clienta identificada correctamente

            </div>


            <div class="fm-scan-pending">

                <strong>

                    ⏳ Validando asistencia...

                </strong>

            </div>

        `;

    }


    // ====================================================
    // ASISTENCIA REGISTRADA
    // ====================================================

    showAttendanceSuccess(
        client,
        attendance
    ) {

        const result =
            document.getElementById(
                "scannerResult"
            );


        if (
            !result
        ) {

            return;

        }


        const fullName =

            client.fullName

            ||

            `${client.firstName || ""} ${client.lastName || ""}`
                .trim()

            ||

            "Clienta";


        const initials =
            this.getInitials(
                fullName
            );


        const className =
            attendance.class?.name
            ||
            "Clase";


        const startTime =
            attendance.class?.startTime
            ||
            "";


        result.className =
            "fm-scan-success";


        result.innerHTML = `

            <div class="fm-scan-success-icon">

                ✓

            </div>


            <div class="fm-scan-avatar">

                ${client.photoUrl

                ?

                `

                            <img
                                src="${client.photoUrl}"
                                alt="${fullName}"
                            >

                        `

                :

                `

                            <span>

                                ${initials}

                            </span>

                        `
            }

            </div>


            <h3>

                ${fullName}

            </h3>


            <div class="fm-scan-id">

                ${client.clientId}

            </div>


            <div class="fm-scan-role">

                ${className}

                ${startTime

                ? ` • ${String(
                    startTime
                ).slice(
                    0,
                    5
                )}`

                : ""
            }

            </div>


            <div
                class="fm-scan-attendance-success"
            >

                <strong>

                    ✓ Asistencia registrada

                </strong>


                <span>

                    ${attendance.message || ""}

                </span>

            </div>

        `;

    }


    // ====================================================
    // ASISTENCIA PENDIENTE
    // ====================================================

    showAttendancePending(
        client,
        message
    ) {

        const result =
            document.getElementById(
                "scannerResult"
            );


        if (
            !result
        ) {

            return;

        }


        const fullName =

            client.fullName

            ||

            `${client.firstName || ""} ${client.lastName || ""}`
                .trim()

            ||

            "Clienta";


        const initials =
            this.getInitials(
                fullName
            );


        result.className =
            "fm-scan-success";


        result.innerHTML = `

            <div class="fm-scan-success-icon">

                ✓

            </div>


            <div class="fm-scan-avatar">

                ${client.photoUrl

                ?

                `

                            <img
                                src="${client.photoUrl}"
                                alt="${fullName}"
                            >

                        `

                :

                `

                            <span>

                                ${initials}

                            </span>

                        `
            }

            </div>


            <h3>

                ${fullName}

            </h3>


            <div class="fm-scan-id">

                ${client.clientId}

            </div>


            <div class="fm-scan-role">

                Clienta identificada correctamente

            </div>


            <div class="fm-scan-pending">

                <strong>

                    ⏳ Asistencia pendiente

                </strong>


                <span>

                    ${message || ""}

                </span>

            </div>

        `;

    }


    // ====================================================
    // COACH SOLO CLIENTAS
    // ====================================================

    showCoachOnlyClientQr() {

        const result =
            document.getElementById(
                "scannerResult"
            );


        if (
            !result
        ) {

            return;

        }


        result.className =
            "fm-scan-error";


        result.innerHTML = `

            <div class="fm-scan-error-icon">

                ⚠

            </div>


            <strong>

                Este QR no corresponde a una clienta

            </strong>


            <span>

                Como coach, escanea únicamente
                la tarjeta QR de una clienta.

            </span>

        `;


        this.setStatus(
            "Escanea el QR de una clienta"
        );

    }


    // ====================================================
    // QR INVÁLIDO
    // ====================================================

    showInvalidQr() {

        const result =
            document.getElementById(
                "scannerResult"
            );


        if (
            !result
        ) {

            return;

        }


        result.className =
            "fm-scan-error";


        result.innerHTML = `

            <div class="fm-scan-error-icon">

                ⚠

            </div>


            <strong>

                Código QR no reconocido

            </strong>


            <span>

                Este código no pertenece a FlowManager.

            </span>

        `;


        this.setStatus(
            "Código no válido"
        );

    }


    // ====================================================
    // NO ENCONTRADO
    // ====================================================

    showNotFound(
        type
    ) {

        const result =
            document.getElementById(
                "scannerResult"
            );


        if (
            !result
        ) {

            return;

        }


        result.className =
            "fm-scan-error";


        result.innerHTML = `

            <div class="fm-scan-error-icon">

                ?

            </div>


            <strong>

                ${type} no encontrada

            </strong>


            <span>

                El código es válido pero la cuenta
                ya no existe en el sistema.

            </span>

        `;

    }


    // ====================================================
    // ERROR CÁMARA
    // ====================================================

    showCameraError(
        error
    ) {

        const reader =
            document.getElementById(
                "qrReader"
            );


        if (
            !reader
        ) {

            return;

        }


        reader.innerHTML = `

            <div class="fm-scan-error">

                <div class="fm-scan-error-icon">

                    📷

                </div>


                <strong>

                    No fue posible acceder a la cámara

                </strong>


                <span>

                    ${error.message
            ||
            "Revisa los permisos de cámara."
            }

                </span>

            </div>

        `;

    }


    // ====================================================
    // ERROR GENERAL
    // ====================================================

    showError(
        message
    ) {

        const result =
            document.getElementById(
                "scannerResult"
            );


        if (
            !result
        ) {

            return;

        }


        result.className =
            "fm-scan-error";


        result.innerHTML = `

            <div class="fm-scan-error-icon">

                ⚠

            </div>


            <strong>

                Ocurrió un error

            </strong>


            <span>

                ${message}

            </span>

        `;

    }


    // ====================================================
    // STATUS
    // ====================================================

    setStatus(
        text
    ) {

        const status =
            document.getElementById(
                "scannerStatus"
            );


        if (
            status
        ) {

            status.textContent =
                text;

        }

    }


    // ====================================================
    // INICIALES
    // ====================================================

    getInitials(
        fullName
    ) {

        if (
            !fullName
        ) {

            return "U";

        }


        return String(
            fullName
        )
            .trim()
            .split(
                /\s+/
            )
            .slice(
                0,
                2
            )
            .map(

                name =>
                    name
                        .charAt(
                            0
                        )
                        .toUpperCase()

            )
            .join(
                ""
            );

    }


    // ====================================================
    // NOMBRE DEL ROL
    // ====================================================

    getRoleName(
        role
    ) {

        return {

            manager:
                "Gerente",

            coach:
                "Coach",

            reception:
                "Recepción",

            accountant:
                "Contador",

            client:
                "Cliente"

        }[
            role
        ]
            ||
            role;

    }


    // ====================================================
    // CERRAR MÓDULO
    // ====================================================

    async close() {

        this.removeCameraEvents();


        this.isProcessing =
            false;


        await this.stopScanner();

    }

}


// ====================================================
// REGISTRO
// ====================================================

window.ScannerModule =
    new ScannerModule();


ModuleFactory.register(

    "scanner",

    window.ScannerModule

);