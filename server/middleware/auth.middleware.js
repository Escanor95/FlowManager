/*
====================================================

    FLOWMANAGER

    AUTH MIDDLEWARE

====================================================
*/

const jwt =
    require("jsonwebtoken");


const db =
    require("../config/database");


const JWT_SECRET =
    process.env.JWT_SECRET ||
    "FLOWMANAGER_SECRET_CHANGE_ME";


// ====================================================
// SQLITE HELPER
// ====================================================

function get(
    sql,
    params = []
) {

    return new Promise(

        (
            resolve,
            reject
        ) => {

            db.get(

                sql,

                params,

                (
                    error,
                    row
                ) => {

                    if (error) {

                        reject(error);

                        return;

                    }

                    resolve(row);

                }

            );

        }

    );

}


// ====================================================
// AUTENTICAR USUARIO
// ====================================================

async function authenticate(
    req,
    res,
    next
) {

    const header =
        req.headers.authorization || "";


    const token =
        header.startsWith("Bearer ")
            ? header.substring(7)
            : null;


    if (!token) {

        return res.status(401).json({

            message:
                "No estás autenticado."

        });

    }


    try {

        const decoded =
            jwt.verify(

                token,

                JWT_SECRET

            );


        // =================================================
        // BUSCAR USUARIO ACTUAL EN LA BASE
        //
        // Así coachId no depende únicamente del token.
        // =================================================

        const user =
            await get(

                `
                SELECT

                    userId,

                    fullName,

                    email,

                    role,

                    clientId,

                    coachId,

                    photoUrl,

                    isRoot,

                    isActive

                FROM users

                WHERE

                    userId = ?

                LIMIT 1
                `,

                [

                    decoded.userId

                ]

            );


        if (
            !user
        ) {

            return res.status(401).json({

                message:
                    "El usuario de la sesión ya no existe."

            });

        }


        if (
            Number(
                user.isActive
            ) !== 1
        ) {

            return res.status(401).json({

                message:
                    "La cuenta está inactiva."

            });

        }


        const role =
            String(
                user.role || ""
            )
                .trim()
                .toLowerCase();


        // =================================================
        // COACH
        //
        // Si el usuario es Coach pero no tiene coachId,
        // intentamos resolverlo automáticamente por correo.
        // =================================================

        let coachId =
            user.coachId ||
            null;


        if (
            role === "coach"
            &&
            !coachId
        ) {

            const coach =
                await get(

                    `
                    SELECT

                        coachId

                    FROM coaches

                    WHERE

                        LOWER(
                            TRIM(email)
                        ) = LOWER(
                            TRIM(?)
                        )

                        AND isActive = 1

                    LIMIT 1
                    `,

                    [

                        user.email

                    ]

                );


            if (
                coach
            ) {

                coachId =
                    coach.coachId;

                // =========================================
                // Guardar relación detectada
                // =========================================

                db.run(

                    `
                    UPDATE users

                    SET

                        coachId = ?,

                        updatedAt = ?

                    WHERE

                        userId = ?

                    `,

                    [

                        coachId,

                        new Date()
                            .toISOString(),

                        user.userId

                    ]

                );

            }

        }


        // =================================================
        // SESIÓN FINAL
        // =================================================

        req.user = {

            userId:
                user.userId,

            fullName:
                user.fullName,

            email:
                user.email,

            role,

            clientId:
                user.clientId ||
                null,

            coachId,

            photoUrl:
                user.photoUrl ||
                null,

            isRoot:
                Number(
                    user.isRoot
                ) === 1,

            isActive:
                Number(
                    user.isActive
                ) === 1

        };


        next();

    }

    catch (
    error
    ) {

        console.error(
            "Authentication error:",
            error
        );


        return res.status(401).json({

            message:
                "Sesión inválida o expirada."

        });

    }

}


// ====================================================
// AUTORIZAR ROLES
// ====================================================

function authorizeRoles(
    ...allowedRoles
) {

    return (

        req,
        res,
        next

    ) => {

        if (
            !req.user
        ) {

            return res.status(401).json({

                message:
                    "No estás autenticado."

            });

        }


        // ================================================
        // ROOT
        // ================================================

        if (
            req.user.isRoot === true
            ||
            Number(
                req.user.isRoot
            ) === 1
        ) {

            return next();

        }


        // ================================================
        // VALIDAR ROL
        // ================================================

        const userRole =
            String(
                req.user.role || ""
            )
                .trim()
                .toLowerCase();


        const normalizedAllowedRoles =
            allowedRoles.map(

                role =>
                    String(
                        role
                    )
                        .trim()
                        .toLowerCase()

            );


        if (
            !normalizedAllowedRoles.includes(
                userRole
            )
        ) {

            return res.status(403).json({

                message:
                    "No tienes permisos para realizar esta acción."

            });

        }


        next();

    };

}


// ====================================================
// EXPORTAR
// ====================================================

module.exports = {

    authenticate,

    authorizeRoles

};