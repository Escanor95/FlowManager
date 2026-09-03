/*
====================================================

    FLOWMANAGER

    PERMISSION SERVICE

====================================================
*/

const PermissionService = {

    // ====================================================
    // PERMISOS POR ROL
    // ====================================================

    permissions: {

        // ================================================
        // ROOT
        // ================================================

        root: [

            "dashboard",
            "clients",
            "memberships",
            "activities",
            "schedules",
            "reservations",

            "scanner",

            "attendance",
            "coaches",
            "users",
            "history",
            "settings"

        ],


        // ================================================
        // MANAGER
        // ================================================

        manager: [

            "dashboard",
            "clients",
            "memberships",
            "activities",
            "schedules",
            "reservations",

            "scanner",

            "attendance",
            "coaches",
            "users",
            "history"

        ],


        // ================================================
        // RECEPTION
        // ================================================

        reception: [

            "dashboard",
            "clients",
            "reservations",

            "scanner",

            "attendance"

        ],


        // ================================================
        // COACH
        // ================================================

        coach: [

            "dashboard",
            "reservations",
            "attendance",
            "my-reservations",
            "profile"

        ],


        // ================================================
        // CLIENT
        // ================================================

        client: [

            "client-reservations",
            "my-reservations",
            "my-attendance",
            "qr",
            "profile"

        ]

    },


    // ====================================================
    // OBTENER ROL ACTUAL
    // ====================================================

    getCurrentRole() {

        const user =
            AuthService.getUser();


        if (!user) {

            return null;

        }


        // ================================================
        // ROOT
        // ================================================

        if (
            user.isRoot === true ||
            Number(user.isRoot) === 1
        ) {

            return "root";

        }


        return String(
            user.role || ""
        )
            .trim()
            .toLowerCase();

    },


    // ====================================================
    // VALIDAR ACCESO
    // ====================================================

    canAccess(
        feature
    ) {

        const role =
            this.getCurrentRole();


        if (!role) {

            return false;

        }


        const permissions =
            this.permissions[role] || [];


        return permissions.includes(
            feature
        );

    },


    // ====================================================
    // OBTENER PERMISOS
    // ====================================================

    getPermissions() {

        const role =
            this.getCurrentRole();


        if (!role) {

            return [];

        }


        return this.permissions[role] || [];

    }

};


window.PermissionService =
    PermissionService;