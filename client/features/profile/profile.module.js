/*
====================================================

    FLOWMANAGER

    PROFILE MODULE

====================================================
*/

class ProfileModule extends Module {

    constructor() {

        super(
            "Profile"
        );

    }


    // ====================================================
    // ABRIR
    // ====================================================

    async open() {

        await this.load(
            "profile/profile"
        );

        await this.initialize();

    }


    // ====================================================
    // INICIALIZAR
    // ====================================================

    async initialize() {

        const user =
            AuthService.getUser();


        if (!user) {

            throw new Error(
                "No hay una sesión activa."
            );

        }


        this.renderProfile(
            user
        );

    }


    // ====================================================
    // RENDER PERFIL
    // ====================================================

    renderProfile(
        user
    ) {

        const name =
            document.getElementById(
                "profileName"
            );


        const email =
            document.getElementById(
                "profileEmail"
            );


        const role =
            document.getElementById(
                "profileRole"
            );


        if (name) {

            name.textContent =

                user.fullName

                ||

                user.name

                ||

                user.username

                ||

                "Usuario";

        }


        if (email) {

            email.textContent =

                user.email

                ||

                "-";

        }


        if (role) {

            role.textContent =
                this.getRoleLabel(
                    user.role
                );

        }

    }


    // ====================================================
    // LABEL DEL ROL
    // ====================================================

    getRoleLabel(
        role
    ) {

        const normalized =
            String(
                role || ""
            )
                .trim()
                .toLowerCase();


        if (

            normalized === "client"

            ||

            normalized === "clienta"

        ) {

            return "Cliente";

        }


        if (

            normalized === "admin"

            ||

            normalized === "administrator"

        ) {

            return "Administrador";

        }


        if (

            normalized === "coach"

        ) {

            return "Coach";

        }


        return "Usuario";

    }

}


// ====================================================
// CREAR INSTANCIA
// ====================================================

window.ProfileModule =
    new ProfileModule();


// ====================================================
// REGISTRAR MÓDULO
// ====================================================

ModuleFactory.register(

    "profile",

    window.ProfileModule

);


console.log(
    "ProfileModule registrado correctamente"
);