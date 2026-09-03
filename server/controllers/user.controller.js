/*
====================================================

    FLOWMANAGER

    USER CONTROLLER

====================================================
*/

const bcrypt = require("bcrypt");
const db = require("../config/database");


const VALID_ROLES = [

    "manager",
    "coach",
    "reception",
    "accountant"

];


// ====================================================
// GENERAR USER ID
// ====================================================

function generateUserId() {

    return `USR-${Date.now()}-${Math.floor(

        Math.random() * 1000

    )}`;

}


// ====================================================
// SQLITE HELPERS
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


function run(
    sql,
    params = []
) {

    return new Promise(

        (
            resolve,
            reject
        ) => {

            db.run(

                sql,

                params,

                function (
                    error
                ) {

                    if (error) {

                        reject(error);

                        return;

                    }

                    resolve({

                        changes:
                            this.changes,

                        lastID:
                            this.lastID

                    });

                }

            );

        }

    );

}


// ====================================================
// NORMALIZAR USERNAME
// ====================================================

function normalizeUsername(
    username
) {

    if (
        !username
    ) {

        return null;

    }


    return username

        .trim()

        .toLowerCase()

        .replace(
            /\s+/g,
            ""
        )

        .replace(
            /[^a-z0-9._-]/g,
            ""
        );

}


// ====================================================
// RESOLVER COACH AUTOMÁTICAMENTE
//
// No se solicita coachId desde el frontend.
//
// Si existe un coach con el mismo correo,
// se utiliza ese registro.
//
// Si no existe, se crea automáticamente.
// ====================================================

async function resolveCoachId(
    fullName,
    email
) {

    const normalizedEmail =
        String(
            email || ""
        )
            .trim()
            .toLowerCase();


    // =================================================
    // BUSCAR COACH EXISTENTE POR CORREO
    // =================================================

    if (
        normalizedEmail
    ) {

        const existingCoach =
            await get(

                `
                SELECT

                    coachId,

                    isActive

                FROM coaches

                WHERE

                    email = ?

                LIMIT 1
                `,

                [
                    normalizedEmail
                ]

            );


        if (
            existingCoach
        ) {

            // =========================================
            // ASEGURAR QUE LA FICHA ESTÉ ACTIVA
            // =========================================

            if (
                Number(
                    existingCoach.isActive
                ) !== 1
            ) {

                await run(

                    `
                    UPDATE coaches

                    SET

                        isActive = 1,

                        updatedAt = ?

                    WHERE

                        coachId = ?
                    `,

                    [

                        new Date()
                            .toISOString(),

                        existingCoach.coachId

                    ]

                );

            }


            return existingCoach.coachId;

        }

    }


    // =================================================
    // CREAR FICHA DE COACH
    // =================================================

    const coachId =
        `COA-${Date.now()}-${Math.floor(
            Math.random() * 1000
        )}`;


    const now =
        new Date()
            .toISOString();


    await run(

        `
        INSERT INTO coaches (

            coachId,

            fullName,

            phone,

            email,

            paymentPerClass,

            notes,

            isActive,

            createdAt,

            updatedAt

        )

        VALUES (

            ?,

            ?,

            NULL,

            ?,

            0,

            NULL,

            1,

            ?,

            ?

        )
        `,

        [

            coachId,

            String(
                fullName
            ).trim(),

            normalizedEmail || null,

            now,

            now

        ]

    );


    return coachId;

}


// ====================================================
// LISTAR USUARIOS
// ====================================================

function getAllUsers(
    req,
    res
) {

    db.all(

        `
        SELECT

            userId,

            fullName,

            username,

            email,

            role,

            clientId,

            coachId,

            photoUrl,

            isRoot,

            isActive,

            lastLoginAt,

            createdAt,

            updatedAt

        FROM users

        WHERE

            isRoot = 0

            AND role != 'client'

        ORDER BY

            fullName ASC
        `,

        [],

        (
            error,
            users
        ) => {

            if (error) {

                console.error(
                    error
                );

                return res.status(
                    500
                )
                    .json({

                        message:
                            "No fue posible obtener los usuarios."

                    });

            }


            res.json(
                users
            );

        }

    );

}


// ====================================================
// CREAR USUARIO
// ====================================================

async function createUser(
    req,
    res
) {

    try {

        const {

            fullName,

            username,

            email,

            password,

            role

        } =
            req.body;


        // ==============================================
        // VALIDACIONES
        // ==============================================

        if (

            !fullName
            ||
            !email
            ||
            !password
            ||
            !role

        ) {

            return res.status(
                400
            )
                .json({

                    message:
                        "Nombre, correo, contraseña y rol son obligatorios."

                });

        }


        if (
            !VALID_ROLES.includes(
                role
            )
        ) {

            return res.status(
                400
            )
                .json({

                    message:
                        "El rol seleccionado no es válido."

                });

        }


        if (
            password.length < 8
        ) {

            return res.status(
                400
            )
                .json({

                    message:
                        "La contraseña debe tener mínimo 8 caracteres."

                });

        }


        const normalizedEmail =
            String(
                email
            )
                .trim()
                .toLowerCase();


        const normalizedUsername =
            normalizeUsername(
                username
            );


        // ==============================================
        // VALIDAR CORREO
        // ==============================================

        const existingEmail =
            await get(

                `
                SELECT

                    userId

                FROM users

                WHERE email = ?

                LIMIT 1
                `,

                [
                    normalizedEmail
                ]

            );


        if (
            existingEmail
        ) {

            return res.status(
                409
            )
                .json({

                    message:
                        "Ya existe un usuario con ese correo."

                });

        }


        // ==============================================
        // VALIDAR USERNAME
        // ==============================================

        if (
            normalizedUsername
        ) {

            const existingUsername =
                await get(

                    `
                    SELECT

                        userId

                    FROM users

                    WHERE username = ?

                    LIMIT 1
                    `,

                    [
                        normalizedUsername
                    ]

                );


            if (
                existingUsername
            ) {

                return res.status(
                    409
                )
                    .json({

                        message:
                            "Ese nombre de usuario ya está en uso."

                    });

            }

        }


        // ==============================================
        // RESOLVER COACH AUTOMÁTICAMENTE
        // ==============================================

        let coachId =
            null;


        if (
            role === "coach"
        ) {

            coachId =
                await resolveCoachId(

                    fullName,

                    normalizedEmail

                );

        }


        // ==============================================
        // ENCRIPTAR PASSWORD
        // ==============================================

        const passwordHash =
            await bcrypt.hash(

                password,

                10

            );


        const userId =
            generateUserId();


        const now =
            new Date()
                .toISOString();


        // ==============================================
        // CREAR USUARIO
        // ==============================================

        await run(

            `
            INSERT INTO users (

                userId,

                fullName,

                username,

                email,

                passwordHash,

                role,

                clientId,

                coachId,

                isRoot,

                isActive,

                createdAt,

                updatedAt

            )

            VALUES (

                ?,

                ?,

                ?,

                ?,

                ?,

                ?,

                NULL,

                ?,

                0,

                1,

                ?,

                ?

            )
            `,

            [

                userId,

                fullName.trim(),

                normalizedUsername,

                normalizedEmail,

                passwordHash,

                role,

                coachId,

                now,

                now

            ]

        );


        return res.status(
            201
        )
            .json({

                message:
                    "Usuario creado correctamente.",

                user: {

                    userId,

                    fullName:
                        fullName.trim(),

                    username:
                        normalizedUsername,

                    email:
                        normalizedEmail,

                    role,

                    clientId:
                        null,

                    coachId,

                    isRoot:
                        0,

                    isActive:
                        1

                }

            });

    }

    catch (
    error
    ) {

        console.error(
            "Error creando usuario:",
            error
        );


        if (

            String(
                error.message
            )
                .includes(
                    "UNIQUE constraint failed"
                )

        ) {

            return res.status(
                409
            )
                .json({

                    message:
                        "Ya existe un registro con esos datos."

                });

        }


        return res.status(
            500
        )
            .json({

                message:
                    "No fue posible crear el usuario."

            });

    }

}


// ====================================================
// ACTUALIZAR USUARIO
// ====================================================

async function updateUser(
    req,
    res
) {

    try {

        const {
            userId
        } =
            req.params;


        const {

            fullName,

            username,

            email,

            role,

            password

        } =
            req.body;


        // ==============================================
        // VALIDACIONES
        // ==============================================

        if (

            !fullName
            ||
            !email
            ||
            !role

        ) {

            return res.status(
                400
            )
                .json({

                    message:
                        "Nombre, correo y rol son obligatorios."

                });

        }


        if (
            !VALID_ROLES.includes(
                role
            )
        ) {

            return res.status(
                400
            )
                .json({

                    message:
                        "El rol seleccionado no es válido."

                });

        }


        // ==============================================
        // BUSCAR USUARIO
        // ==============================================

        const user =
            await get(

                `
                SELECT *

                FROM users

                WHERE userId = ?

                LIMIT 1
                `,

                [
                    userId
                ]

            );


        if (!user) {

            return res.status(
                404
            )
                .json({

                    message:
                        "Usuario no encontrado."

                });

        }


        // ==============================================
        // ROOT
        // ==============================================

        if (
            Number(
                user.isRoot
            ) === 1
        ) {

            return res.status(
                403
            )
                .json({

                    message:
                        "El usuario Root no puede modificarse desde esta sección."

                });

        }


        const normalizedEmail =
            String(
                email
            )
                .trim()
                .toLowerCase();


        const normalizedUsername =
            normalizeUsername(
                username
            );


        // ==============================================
        // VALIDAR EMAIL
        // ==============================================

        const existingEmail =
            await get(

                `
                SELECT

                    userId

                FROM users

                WHERE

                    email = ?

                    AND userId != ?

                LIMIT 1
                `,

                [

                    normalizedEmail,

                    userId

                ]

            );


        if (
            existingEmail
        ) {

            return res.status(
                409
            )
                .json({

                    message:
                        "Ya existe otro usuario con ese correo."

                });

        }


        // ==============================================
        // VALIDAR USERNAME
        // ==============================================

        if (
            normalizedUsername
        ) {

            const existingUsername =
                await get(

                    `
                    SELECT

                        userId

                    FROM users

                    WHERE

                        username = ?

                        AND userId != ?

                    LIMIT 1
                    `,

                    [

                        normalizedUsername,

                        userId

                    ]

                );


            if (
                existingUsername
            ) {

                return res.status(
                    409
                )
                    .json({

                        message:
                            "Ese nombre de usuario ya está en uso."

                    });

            }

        }


        // ==============================================
        // RESOLVER COACH AUTOMÁTICAMENTE
        // ==============================================

        let coachId =
            null;


        if (
            role === "coach"
        ) {

            if (
                user.coachId
            ) {

                coachId =
                    user.coachId;


                // =====================================
                // SINCRONIZAR DATOS
                // =====================================

                await run(

                    `
                    UPDATE coaches

                    SET

                        fullName = ?,

                        email = ?,

                        isActive = 1,

                        updatedAt = ?

                    WHERE

                        coachId = ?
                    `,

                    [

                        fullName.trim(),

                        normalizedEmail,

                        new Date()
                            .toISOString(),

                        coachId

                    ]

                );

            }

            else {

                coachId =
                    await resolveCoachId(

                        fullName,

                        normalizedEmail

                    );

            }

        }


        // ==============================================
        // PASSWORD
        // ==============================================

        let passwordHash =
            user.passwordHash;


        if (
            password
        ) {

            if (
                password.length < 8
            ) {

                return res.status(
                    400
                )
                    .json({

                        message:
                            "La nueva contraseña debe tener mínimo 8 caracteres."

                    });

            }


            passwordHash =
                await bcrypt.hash(

                    password,

                    10

                );

        }


        const now =
            new Date()
                .toISOString();


        // ==============================================
        // ACTUALIZAR USUARIO
        // ==============================================

        await run(

            `
            UPDATE users

            SET

                fullName = ?,

                username = ?,

                email = ?,

                role = ?,

                coachId = ?,

                passwordHash = ?,

                updatedAt = ?

            WHERE

                userId = ?
            `,

            [

                fullName.trim(),

                normalizedUsername,

                normalizedEmail,

                role,

                coachId,

                passwordHash,

                now,

                userId

            ]

        );


        // ==============================================
        // RESPUESTA
        // ==============================================

        const updatedUser =
            await get(

                `
                SELECT

                    userId,

                    fullName,

                    username,

                    email,

                    role,

                    clientId,

                    coachId,

                    photoUrl,

                    isRoot,

                    isActive,

                    lastLoginAt,

                    createdAt,

                    updatedAt

                FROM users

                WHERE userId = ?

                LIMIT 1
                `,

                [
                    userId
                ]

            );


        return res.json({

            message:
                "Usuario actualizado correctamente.",

            user:
                updatedUser

        });

    }

    catch (
    error
    ) {

        console.error(
            "Error actualizando usuario:",
            error
        );


        return res.status(
            500
        )
            .json({

                message:
                    "No fue posible actualizar el usuario."

            });

    }

}


// ====================================================
// DESACTIVAR USUARIO
// ====================================================

function deactivateUser(
    req,
    res
) {

    const {
        userId
    } =
        req.params;


    if (
        req.user?.userId === userId
    ) {

        return res.status(
            400
        )
            .json({

                message:
                    "No puedes desactivar tu propia cuenta."

            });

    }


    db.get(

        `
        SELECT

            isRoot

        FROM users

        WHERE

            userId = ?

        LIMIT 1
        `,

        [
            userId
        ],

        (
            findError,
            user
        ) => {

            if (findError) {

                return res.status(
                    500
                )
                    .json({

                        message:
                            "No fue posible validar el usuario."

                    });

            }


            if (!user) {

                return res.status(
                    404
                )
                    .json({

                        message:
                            "Usuario no encontrado."

                    });

            }


            if (
                Number(
                    user.isRoot
                ) === 1
            ) {

                return res.status(
                    403
                )
                    .json({

                        message:
                            "El usuario Root no puede desactivarse."

                    });

            }


            db.run(

                `
                UPDATE users

                SET

                    isActive = 0,

                    updatedAt = ?

                WHERE

                    userId = ?
                `,

                [

                    new Date()
                        .toISOString(),

                    userId

                ],

                function (
                    error
                ) {

                    if (error) {

                        console.error(
                            error
                        );

                        return res.status(
                            500
                        )
                            .json({

                                message:
                                    "No fue posible desactivar el usuario."

                            });

                    }


                    res.json({

                        message:
                            "Usuario desactivado correctamente."

                    });

                }

            );

        }

    );

}


// ====================================================
// ACTIVAR USUARIO
// ====================================================

function activateUser(
    req,
    res
) {

    const {
        userId
    } =
        req.params;


    db.get(

        `
        SELECT

            isRoot

        FROM users

        WHERE

            userId = ?

        LIMIT 1
        `,

        [
            userId
        ],

        (
            findError,
            user
        ) => {

            if (findError) {

                return res.status(
                    500
                )
                    .json({

                        message:
                            "No fue posible validar el usuario."

                    });

            }


            if (!user) {

                return res.status(
                    404
                )
                    .json({

                        message:
                            "Usuario no encontrado."

                    });

            }


            if (
                Number(
                    user.isRoot
                ) === 1
            ) {

                return res.status(
                    403
                )
                    .json({

                        message:
                            "El usuario Root no puede modificarse."

                    });

            }


            db.run(

                `
                UPDATE users

                SET

                    isActive = 1,

                    updatedAt = ?

                WHERE

                    userId = ?
                `,

                [

                    new Date()
                        .toISOString(),

                    userId

                ],

                function (
                    error
                ) {

                    if (error) {

                        console.error(
                            error
                        );

                        return res.status(
                            500
                        )
                            .json({

                                message:
                                    "No fue posible activar el usuario."

                            });

                    }


                    res.json({

                        message:
                            "Usuario activado correctamente."

                    });

                }

            );

        }

    );

}


// ====================================================
// EXPORTS
// ====================================================

module.exports = {

    getAllUsers,

    createUser,

    updateUser,

    deactivateUser,

    activateUser

};