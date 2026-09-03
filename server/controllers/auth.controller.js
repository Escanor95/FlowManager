/*
====================================================

    FLOWMANAGER

    AUTH CONTROLLER

====================================================
*/

const bcrypt =
    require("bcrypt");

const jwt =
    require("jsonwebtoken");

const db =
    require("../config/database");


const JWT_SECRET =
    process.env.JWT_SECRET ||
    "FLOWMANAGER_SECRET_CHANGE_ME";


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
// BUSCAR USUARIO
// ====================================================

function findUserByEmail(
    email
) {

    return get(

        `
        SELECT *

        FROM users

        WHERE

            email = ?

            AND isActive = 1

        LIMIT 1
        `,

        [
            email
        ]

    );

}


// ====================================================
// RESOLVER COACH AUTOMÁTICAMENTE
//
// El usuario Coach NO necesita seleccionar
// manualmente un coach.
//
// El sistema intenta:
//
// 1. coachId existente en users
// 2. coach por correo
// 3. crear coach automáticamente
//
// Finalmente guarda coachId en users.
// ====================================================

async function resolveCoachForUser(
    user
) {

    if (
        String(
            user.role || ""
        )
            .trim()
            .toLowerCase()
        !==
        "coach"
    ) {

        return user;

    }


    // =================================================
    // YA TIENE COACH ID
    // =================================================

    if (
        user.coachId
    ) {

        const coach =
            await get(

                `
                SELECT *

                FROM coaches

                WHERE

                    coachId = ?

                    AND isActive = 1

                LIMIT 1
                `,

                [
                    user.coachId
                ]

            );


        if (
            coach
        ) {

            return {

                ...user,

                coachId:
                    coach.coachId

            };

        }

    }


    // =================================================
    // BUSCAR POR CORREO
    // =================================================

    const normalizedEmail =
        String(
            user.email || ""
        )
            .trim()
            .toLowerCase();


    if (
        normalizedEmail
    ) {

        const coachByEmail =
            await get(

                `
                SELECT *

                FROM coaches

                WHERE

                    LOWER(
                        TRIM(email)
                    ) = ?

                LIMIT 1
                `,

                [
                    normalizedEmail
                ]

            );


        if (
            coachByEmail
        ) {

            await run(

                `
                UPDATE users

                SET

                    coachId = ?,

                    updatedAt = ?

                WHERE

                    userId = ?
                `,

                [

                    coachByEmail.coachId,

                    new Date()
                        .toISOString(),

                    user.userId

                ]

            );


            return {

                ...user,

                coachId:
                    coachByEmail.coachId

            };

        }

    }


    // =================================================
    // CREAR AUTOMÁTICAMENTE EL PERFIL
    // =================================================

    const coachId =
        `COA-${Date.now()}-${Math.floor(
            Math.random() * 1000
        )}`;


    const now =
        new Date()
            .toISOString();


    try {

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

                user.fullName,

                normalizedEmail || null,

                now,

                now

            ]

        );

    }

    catch (
    error
    ) {

        // Si otro proceso creó el coach
        // al mismo tiempo, intentamos
        // localizarlo por correo.

        if (
            !String(
                error.message
            )
                .includes(
                    "UNIQUE"
                )
        ) {

            throw error;

        }

    }


    let coach =
        null;


    if (
        normalizedEmail
    ) {

        coach =
            await get(

                `
                SELECT *

                FROM coaches

                WHERE

                    LOWER(
                        TRIM(email)
                    ) = ?

                LIMIT 1
                `,

                [

                    normalizedEmail

                ]

            );

    }


    if (
        !coach
    ) {

        coach =
            await get(

                `
                SELECT *

                FROM coaches

                WHERE

                    coachId = ?

                LIMIT 1
                `,

                [

                    coachId

                ]

            );

    }


    if (
        !coach
    ) {

        throw new Error(
            "No fue posible crear el perfil del coach."
        );

    }


    await run(

        `
        UPDATE users

        SET

            coachId = ?,

            updatedAt = ?

        WHERE

            userId = ?
        `,

        [

            coach.coachId,

            now,

            user.userId

        ]

    );


    return {

        ...user,

        coachId:
            coach.coachId

    };

}


// ====================================================
// LOGIN
// ====================================================

async function login(
    req,
    res
) {

    try {

        const email =
            String(
                req.body.email || ""
            )
                .trim()
                .toLowerCase();


        const password =
            String(
                req.body.password || ""
            );


        const rememberMe =
            Boolean(req.body.rememberMe);


        if (
            !email ||
            !password
        ) {

            return res.status(
                400
            )
                .json({

                    message:
                        "Correo y contraseña son obligatorios."

                });

        }


        let user =
            await findUserByEmail(
                email
            );


        if (
            !user
        ) {

            return res.status(
                401
            )
                .json({

                    message:
                        "Correo o contraseña incorrectos."

                });

        }


        const valid =
            await bcrypt.compare(

                password,

                user.passwordHash

            );


        if (
            !valid
        ) {

            return res.status(
                401
            )
                .json({

                    message:
                        "Correo o contraseña incorrectos."

                });

        }


        // =================================================
        // RESOLVER COACH ANTES DE CREAR EL TOKEN
        // =================================================

        user =
            await resolveCoachForUser(
                user
            );


        // =================================================
        // TOKEN
        // =================================================

        const token =
            jwt.sign(

                {

                    userId:
                        user.userId,

                    role:
                        user.role,

                    clientId:
                        user.clientId ||
                        null,

                    coachId:
                        user.coachId ||
                        null,

                    isRoot:
                        Number(
                            user.isRoot
                        ) === 1

                },

                JWT_SECRET,

                {

                    expiresIn:
                        rememberMe
                            ? "30d"
                            : "12h"

                }

            );


        // =================================================
        // ÚLTIMO ACCESO
        // =================================================

        await run(

            `
            UPDATE users

            SET

                lastLoginAt = ?,

                updatedAt = ?

            WHERE

                userId = ?
            `,

            [

                new Date()
                    .toISOString(),

                new Date()
                    .toISOString(),

                user.userId

            ]

        );


        // =================================================
        // RESPUESTA
        // =================================================

        return res.json({

            message:
                "Inicio de sesión correcto.",

            token,

            user: {

                userId:
                    user.userId,

                fullName:
                    user.fullName,

                email:
                    user.email,

                role:
                    user.role,

                clientId:
                    user.clientId ||
                    null,

                coachId:
                    user.coachId ||
                    null,

                isRoot:
                    Number(
                        user.isRoot
                    ) === 1

            }

        });

    }

    catch (
    error
    ) {

        console.error(

            "Login error:",

            error

        );


        return res.status(
            500
        )
            .json({

                message:
                    "No fue posible iniciar sesión."

            });

    }

}


// ====================================================
// ME
// ====================================================

async function me(
    req,
    res
) {

    try {

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

                    isActive,

                    lastLoginAt,

                    createdAt,

                    updatedAt

                FROM users

                WHERE

                    userId = ?

                LIMIT 1
                `,

                [

                    req.user?.userId

                ]

            );


        if (
            !user
        ) {

            return res.status(
                404
            )
                .json({

                    message:
                        "Usuario no encontrado."

                });

        }


        return res.json({

            user: {

                ...user,

                isRoot:
                    Number(
                        user.isRoot
                    ) === 1,

                isActive:
                    Number(
                        user.isActive
                    ) === 1

            }

        });

    }

    catch (
    error
    ) {

        console.error(
            "Auth me error:",
            error
        );


        return res.status(
            500
        )
            .json({

                message:
                    "No fue posible obtener la sesión."

            });

    }

}


// ====================================================
// EXPORTS
// ====================================================

module.exports = {

    login,

    me

};