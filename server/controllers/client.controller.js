/*
====================================================

    FLOWMANAGER

    CLIENT CONTROLLER

====================================================
*/

const db =
    require("../config/database");

const bcrypt =
    require("bcrypt");

const QRCode =
    require("qrcode");

const generateClientId =
    require("../utils/generateClientId");


/*
====================================================

    HELPERS

====================================================
*/

function runQuery(
    query,
    params = []
) {

    return new Promise(
        (
            resolve,
            reject
        ) => {

            db.run(

                query,

                params,

                function (error) {

                    if (error) {

                        reject(error);

                        return;

                    }


                    resolve(this);

                }

            );

        }
    );

}


function getQuery(
    query,
    params = []
) {

    return new Promise(
        (
            resolve,
            reject
        ) => {

            db.get(

                query,

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


function allQuery(
    query,
    params = []
) {

    return new Promise(
        (
            resolve,
            reject
        ) => {

            db.all(

                query,

                params,

                (
                    error,
                    rows
                ) => {

                    if (error) {

                        reject(error);

                        return;

                    }


                    resolve(rows);

                }

            );

        }
    );

}


/*
====================================================

    GENERAR CONTRASEÑA SEGURA

====================================================
*/

function generateSecurePassword() {

    const uppercase =
        "ABCDEFGHJKLMNPQRSTUVWXYZ";

    const lowercase =
        "abcdefghijkmnopqrstuvwxyz";

    const numbers =
        "23456789";

    const symbols =
        "!@#$%*-_";


    const all =
        uppercase +
        lowercase +
        numbers +
        symbols;


    let password =
        "";


    password +=
        uppercase[
        Math.floor(
            Math.random() *
            uppercase.length
        )
        ];


    password +=
        lowercase[
        Math.floor(
            Math.random() *
            lowercase.length
        )
        ];


    password +=
        numbers[
        Math.floor(
            Math.random() *
            numbers.length
        )
        ];


    password +=
        symbols[
        Math.floor(
            Math.random() *
            symbols.length
        )
        ];


    for (
        let index = 4;
        index < 16;
        index++
    ) {

        password +=
            all[
            Math.floor(
                Math.random() *
                all.length
            )
            ];

    }


    return password

        .split(
            ""
        )

        .sort(
            () =>
                Math.random() - 0.5
        )

        .join(
            ""
        );

}


/*
====================================================

    VALIDAR CONTRASEÑA

====================================================
*/

function isValidPassword(
    password
) {

    if (
        typeof password !== "string"
    ) {

        return false;

    }


    return (

        password.length >= 8 &&

        /[A-Z]/.test(
            password
        ) &&

        /[a-z]/.test(
            password
        ) &&

        /[0-9]/.test(
            password
        ) &&

        /[^A-Za-z0-9]/.test(
            password
        )

    );

}


/*
====================================================

    OBTENER TODOS LOS CLIENTES

====================================================
*/

async function getAllClients(
    req,
    res
) {

    try {

        const clients =
            await allQuery(

                `
                SELECT

                    c.*,

                    m.name AS membershipName

                FROM clients c

                LEFT JOIN memberships m

                    ON c.membershipId =
                    m.membershipId

                WHERE c.isActive = 1

                ORDER BY

                    c.fullName ASC
                `

            );


        return res.json(
            clients
        );

    }

    catch (error) {

        console.error(
            "Error al obtener clientes:",
            error
        );


        return res.status(
            500
        ).json({

            message:
                "No fue posible obtener los clientes."

        });

    }

}


/*
====================================================

    BUSCAR CLIENTES

====================================================
*/

async function searchClients(
    req,
    res
) {

    try {

        const query =
            String(
                req.params.query || ""
            )
                .trim();


        if (!query) {

            return res.json([]);

        }


        const searchValue =
            `%${query}%`;


        const clients =
            await allQuery(

                `
                SELECT

                    c.*,

                    m.name AS membershipName

                FROM clients c

                LEFT JOIN memberships m

                    ON c.membershipId =
                    m.membershipId

                WHERE

                    c.isActive = 1

                AND (

                    c.fullName LIKE ?

                    OR

                    c.clientId LIKE ?

                    OR

                    c.phone LIKE ?

                    OR

                    c.email LIKE ?

                )

                ORDER BY

                    c.fullName ASC

                LIMIT 50
                `,

                [

                    searchValue,

                    searchValue,

                    searchValue,

                    searchValue

                ]

            );


        return res.json(
            clients
        );

    }

    catch (error) {

        console.error(
            "Error al buscar clientes:",
            error
        );


        return res.status(
            500
        ).json({

            message:
                "No fue posible realizar la búsqueda."

        });

    }

}


/*
====================================================

    OBTENER CLIENTE POR ID

====================================================
*/

async function getClientById(
    req,
    res
) {

    try {

        const clientId =
            req.params.clientId;


        const client =
            await getQuery(

                `
                SELECT

                    c.*,

                    m.name AS membershipName,

                    m.price AS membershipPrice,

                    m.classes AS membershipClasses,

                    m.durationDays
                        AS membershipDurationDays,

                    m.description
                        AS membershipDescription

                FROM clients c

                LEFT JOIN memberships m

                    ON c.membershipId =
                    m.membershipId

                WHERE

                    c.clientId = ?

                LIMIT 1
                `,

                [

                    clientId

                ]

            );


        if (!client) {

            return res.status(
                404
            ).json({

                message:
                    "Cliente no encontrado."

            });

        }


        return res.json(
            client
        );

    }

    catch (error) {

        console.error(
            "Error al obtener cliente:",
            error
        );


        return res.status(
            500
        ).json({

            message:
                "No fue posible obtener el cliente."

        });

    }

}


/*
====================================================

    CREAR CLIENTE

====================================================
*/

async function createClient(
    req,
    res
) {

    try {

        const {

            fullName,

            phone,

            email,

            photoUrl,

            membershipId,

            emergencyContactName,

            emergencyContactPhone,

            medicalNotes

        } =
            req.body;


        if (
            !fullName
            ||
            !String(fullName).trim()
        ) {

            return res.status(
                400
            ).json({

                message:
                    "El nombre del cliente es obligatorio."

            });

        }


        // =============================================
        // GENERAR ID CORRECTAMENTE
        // =============================================

        const clientId =
            await generateClientId();


        const now =
            new Date()
                .toISOString();


        let membershipStatus =
            null;

        let remainingClasses =
            0;

        let startDate =
            null;

        let endDate =
            null;


        if (
            membershipId
        ) {

            const membership =
                await getQuery(

                    `
                    SELECT *

                    FROM memberships

                    WHERE

                        membershipId = ?

                        AND isActive = 1

                    LIMIT 1
                    `,

                    [

                        membershipId

                    ]

                );


            if (!membership) {

                return res.status(
                    400
                ).json({

                    message:
                        "La membresía seleccionada no existe."

                });

            }


            membershipStatus =
                "ACTIVE";


            startDate =
                now;


            const endDateObject =
                new Date();


            endDateObject.setDate(

                endDateObject.getDate()

                +

                Number(
                    membership.durationDays || 0
                )

            );


            endDate =
                endDateObject
                    .toISOString();


            remainingClasses =
                membership.classes === null

                    ? null

                    : Number(
                        membership.classes
                    );

        }


        await runQuery(

            `
            INSERT INTO clients (

                clientId,

                fullName,

                phone,

                email,

                photoUrl,

                membershipId,

                membershipStatus,

                remainingClasses,

                startDate,

                endDate,

                emergencyContactName,

                emergencyContactPhone,

                medicalNotes,

                createdAt,

                updatedAt,

                isActive

            )

            VALUES (

                ?,

                ?,

                ?,

                ?,

                ?,

                ?,

                ?,

                ?,

                ?,

                ?,

                ?,

                ?,

                ?,

                ?,

                ?,

                1

            )
            `,

            [

                clientId,

                String(
                    fullName
                ).trim(),

                phone || null,

                email
                    ? String(
                        email
                    )
                        .trim()
                        .toLowerCase()
                    : null,

                photoUrl || null,

                membershipId || null,

                membershipStatus,

                remainingClasses,

                startDate,

                endDate,

                emergencyContactName || null,

                emergencyContactPhone || null,

                medicalNotes || null,

                now,

                now

            ]

        );


        const client =
            await getQuery(

                `
                SELECT *

                FROM clients

                WHERE

                    clientId = ?

                LIMIT 1
                `,

                [

                    clientId

                ]

            );


        return res.status(
            201
        ).json({

            message:
                "Cliente creado correctamente.",

            client

        });

    }

    catch (error) {

        console.error(
            "Error al crear cliente:",
            error
        );


        return res.status(
            500
        ).json({

            message:
                "No fue posible registrar el cliente."

        });

    }

}


/*
====================================================

    ACTUALIZAR CLIENTE

====================================================
*/

async function updateClient(
    req,
    res
) {

    try {

        const clientId =
            req.params.clientId;


        const existingClient =
            await getQuery(

                `
                SELECT *

                FROM clients

                WHERE clientId = ?

                LIMIT 1
                `,

                [

                    clientId

                ]

            );


        if (!existingClient) {

            return res.status(
                404
            ).json({

                message:
                    "Cliente no encontrado."

            });

        }


        const {

            fullName,

            phone,

            email,

            photoUrl,

            emergencyContactName,

            emergencyContactPhone,

            medicalNotes,

            isActive

        } =
            req.body;


        const now =
            new Date()
                .toISOString();


        await runQuery(

            `
            UPDATE clients

            SET

                fullName = ?,

                phone = ?,

                email = ?,

                photoUrl = ?,

                emergencyContactName = ?,

                emergencyContactPhone = ?,

                medicalNotes = ?,

                isActive = ?,

                updatedAt = ?

            WHERE

                clientId = ?
            `,

            [

                fullName !== undefined

                    ? String(
                        fullName
                    ).trim()

                    : existingClient.fullName,

                phone !== undefined
                    ? phone
                    : existingClient.phone,

                email !== undefined

                    ? (
                        email

                            ? String(
                                email
                            )
                                .trim()
                                .toLowerCase()

                            : null
                    )

                    : existingClient.email,

                photoUrl !== undefined
                    ? photoUrl
                    : existingClient.photoUrl,

                emergencyContactName !== undefined
                    ? emergencyContactName
                    : existingClient.emergencyContactName,

                emergencyContactPhone !== undefined
                    ? emergencyContactPhone
                    : existingClient.emergencyContactPhone,

                medicalNotes !== undefined
                    ? medicalNotes
                    : existingClient.medicalNotes,

                isActive !== undefined
                    ? Number(isActive)
                    : existingClient.isActive,

                now,

                clientId

            ]

        );


        const client =
            await getQuery(

                `
                SELECT *

                FROM clients

                WHERE

                    clientId = ?

                LIMIT 1
                `,

                [

                    clientId

                ]

            );


        return res.json({

            message:
                "Cliente actualizado correctamente.",

            client

        });

    }

    catch (error) {

        console.error(
            "Error al actualizar cliente:",
            error
        );


        return res.status(
            500
        ).json({

            message:
                "No fue posible actualizar el cliente."

        });

    }

}


/*
====================================================

    ELIMINAR CLIENTE

====================================================
*/

async function deleteClient(
    req,
    res
) {

    const clientId = req.params.clientId;

    try {

        const client = await getQuery(
            `SELECT clientId, fullName FROM clients WHERE clientId = ? LIMIT 1`,
            [clientId]
        );

        if (!client) {
            return res.status(404).json({
                message: "Cliente no encontrado."
            });
        }

        await runQuery("BEGIN TRANSACTION");

        try {
            await runQuery(
                `DELETE FROM membership_extensions WHERE clientMembershipId IN (SELECT clientMembershipId FROM client_memberships WHERE clientId = ?)`,
                [clientId]
            );

            await runQuery(
                `DELETE FROM membership_freezes WHERE clientMembershipId IN (SELECT clientMembershipId FROM client_memberships WHERE clientId = ?)`,
                [clientId]
            );

            await runQuery(
                `DELETE FROM attendances WHERE clientId = ?`,
                [clientId]
            );

            await runQuery(
                `DELETE FROM reservations WHERE clientId = ?`,
                [clientId]
            );

            await runQuery(
                `DELETE FROM client_memberships WHERE clientId = ?`,
                [clientId]
            );

            await runQuery(
                `DELETE FROM users WHERE clientId = ? AND COALESCE(isRoot, 0) = 0`,
                [clientId]
            );

            await runQuery(
                `DELETE FROM clients WHERE clientId = ?`,
                [clientId]
            );

            await runQuery("COMMIT");

        } catch (transactionError) {
            try { await runQuery("ROLLBACK"); } catch (rollbackError) {
                console.error("Rollback error:", rollbackError);
            }
            throw transactionError;
        }

        return res.json({
            message: "Cliente eliminado correctamente.",
            clientId
        });

    } catch (error) {

        console.error("Error al eliminar cliente:", error);

        return res.status(500).json({
            message: "No fue posible eliminar el cliente: " + error.message
        });

    }

}


/*
====================================================

    OBTENER HISTORIAL DE MEMBRESÍAS

====================================================
*/

async function getClientMemberships(
    req,
    res
) {

    try {

        const clientId =
            req.params.clientId;


        const memberships =
            await allQuery(

                `
                SELECT *

                FROM client_memberships

                WHERE

                    clientId = ?

                ORDER BY

                    createdAt DESC
                `,

                [

                    clientId

                ]

            );


        return res.json(
            memberships
        );

    }

    catch (error) {

        console.error(
            "Error al obtener historial:",
            error
        );


        return res.status(
            500
        ).json({

            message:
                "No fue posible obtener el historial de paquetes."

        });

    }

}


/*
====================================================

    COMPRAR NUEVO PAQUETE

====================================================
*/

async function purchaseClientMembership(
    req,
    res
) {

    try {

        const clientId =
            req.params.clientId;


        const {

            membershipId,

            startDate

        } =
            req.body;


        if (!membershipId) {

            return res.status(
                400
            ).json({

                message:
                    "Debes seleccionar un paquete."

            });

        }


        const client =
            await getQuery(

                `
                SELECT *

                FROM clients

                WHERE clientId = ?

                LIMIT 1
                `,

                [

                    clientId

                ]

            );


        if (!client) {

            return res.status(
                404
            ).json({

                message:
                    "Cliente no encontrado."

            });

        }


        const membership =
            await getQuery(

                `
                SELECT *

                FROM memberships

                WHERE

                    membershipId = ?

                    AND isActive = 1

                LIMIT 1
                `,

                [

                    membershipId

                ]

            );


        if (!membership) {

            return res.status(
                404
            ).json({

                message:
                    "El paquete seleccionado no existe."

            });

        }


        const now =
            new Date()
                .toISOString();


        const clientMembershipId =
            `CM-${Date.now()}-${Math.floor(
                Math.random() * 1000
            )}`;


        const initialRemainingClasses =
            membership.classes === null

                ? null

                : Number(
                    membership.classes
                );


        await runQuery(

            `
            INSERT INTO client_memberships (

                clientMembershipId,

                clientId,

                membershipId,

                membershipName,

                price,

                classes,

                remainingClasses,

                durationDays,

                status,

                startDate,

                endDate,

                frozenAt,

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

                ?,

                ?,

                'PENDING',

                ?,

                NULL,

                NULL,

                ?,

                ?

            )
            `,

            [

                clientMembershipId,

                clientId,

                membership.membershipId,

                membership.name,

                membership.price,

                membership.classes,

                initialRemainingClasses,

                membership.durationDays,

                startDate || null,

                now,

                now

            ]

        );


        return res.status(
            201
        ).json({

            message:
                "Paquete agregado correctamente.",

            clientMembershipId

        });

    }

    catch (error) {

        console.error(
            "Error al comprar paquete:",
            error
        );


        return res.status(
            500
        ).json({

            message:
                "No fue posible agregar el paquete."

        });

    }

}


/*
====================================================

    RENOVACIÓN ANTIGUA

====================================================
*/

async function renewClientMembership(
    req,
    res
) {

    return purchaseClientMembership(
        req,
        res
    );

}


/*
====================================================

    ACTIVAR PAQUETE

====================================================
*/

async function activateClientMembership(
    req,
    res
) {

    try {

        const clientMembershipId =
            req.params.clientMembershipId;


        const clientMembership =
            await getQuery(

                `
                SELECT *

                FROM client_memberships

                WHERE

                    clientMembershipId = ?

                LIMIT 1
                `,

                [

                    clientMembershipId

                ]

            );


        if (!clientMembership) {

            return res.status(
                404
            ).json({

                message:
                    "Paquete no encontrado."

            });

        }


        const now =
            new Date()
                .toISOString();


        const startDate =
            now;


        const endDateObject =
            new Date();


        endDateObject.setDate(

            endDateObject.getDate()

            +

            Number(
                clientMembership.durationDays || 0
            )

        );


        const endDate =
            endDateObject
                .toISOString();


        await runQuery(

            `
            UPDATE client_memberships

            SET

                status = 'ACTIVE',

                startDate = ?,

                endDate = ?,

                updatedAt = ?

            WHERE

                clientMembershipId = ?
            `,

            [

                startDate,

                endDate,

                now,

                clientMembershipId

            ]

        );


        await runQuery(

            `
            UPDATE clients

            SET

                membershipId = ?,

                membershipStatus = 'ACTIVE',

                remainingClasses = ?,

                startDate = ?,

                endDate = ?,

                updatedAt = ?

            WHERE

                clientId = ?
            `,

            [

                clientMembership.membershipId,

                clientMembership.remainingClasses,

                startDate,

                endDate,

                now,

                clientMembership.clientId

            ]

        );


        return res.json({

            message:
                "Paquete activado correctamente."

        });

    }

    catch (error) {

        console.error(
            "Error al activar paquete:",
            error
        );


        return res.status(
            500
        ).json({

            message:
                "No fue posible activar el paquete."

        });

    }

}


/*
====================================================

    CONGELAR PAQUETE

====================================================
*/

async function freezeClientMembership(
    req,
    res
) {

    try {

        const clientMembershipId =
            req.params.clientMembershipId;


        const now =
            new Date()
                .toISOString();


        await runQuery(

            `
            UPDATE client_memberships

            SET

                status = 'FROZEN',

                frozenAt = ?,

                updatedAt = ?

            WHERE

                clientMembershipId = ?
            `,

            [

                now,

                now,

                clientMembershipId

            ]

        );


        return res.json({

            message:
                "Paquete congelado correctamente."

        });

    }

    catch (error) {

        console.error(
            "Error al congelar paquete:",
            error
        );


        return res.status(
            500
        ).json({

            message:
                "No fue posible congelar el paquete."

        });

    }

}


/*
====================================================

    REACTIVAR PAQUETE

====================================================
*/

async function reactivateClientMembership(
    req,
    res
) {

    try {

        const clientMembershipId =
            req.params.clientMembershipId;


        const now =
            new Date()
                .toISOString();


        await runQuery(

            `
            UPDATE client_memberships

            SET

                status = 'ACTIVE',

                frozenAt = NULL,

                updatedAt = ?

            WHERE

                clientMembershipId = ?
            `,

            [

                now,

                clientMembershipId

            ]

        );


        return res.json({

            message:
                "Paquete reactivado correctamente."

        });

    }

    catch (error) {

        console.error(
            "Error al reactivar paquete:",
            error
        );


        return res.status(
            500
        ).json({

            message:
                "No fue posible reactivar el paquete."

        });

    }

}


/*
====================================================

    EXTENDER VIGENCIA

====================================================
*/

async function extendClientMembership(
    req,
    res
) {

    try {

        const clientMembershipId =
            req.params.clientMembershipId;


        const {
            days
        } =
            req.body;


        const extraDays =
            Number(
                days
            );


        if (
            !extraDays
            ||
            extraDays <= 0
        ) {

            return res.status(
                400
            ).json({

                message:
                    "Debes indicar una cantidad válida de días."

            });

        }


        const clientMembership =
            await getQuery(

                `
                SELECT *

                FROM client_memberships

                WHERE

                    clientMembershipId = ?

                LIMIT 1
                `,

                [

                    clientMembershipId

                ]

            );


        if (!clientMembership) {

            return res.status(
                404
            ).json({

                message:
                    "Paquete no encontrado."

            });

        }


        const endDateObject =
            clientMembership.endDate

                ? new Date(
                    clientMembership.endDate
                )

                : new Date();


        endDateObject.setDate(

            endDateObject.getDate()

            +

            extraDays

        );


        const newEndDate =
            endDateObject
                .toISOString();


        const now =
            new Date()
                .toISOString();


        await runQuery(

            `
            UPDATE client_memberships

            SET

                endDate = ?,

                updatedAt = ?

            WHERE

                clientMembershipId = ?
            `,

            [

                newEndDate,

                now,

                clientMembershipId

            ]

        );


        await runQuery(

            `
            UPDATE clients

            SET

                endDate = ?,

                updatedAt = ?

            WHERE

                clientId = ?
            `,

            [

                newEndDate,

                now,

                clientMembership.clientId

            ]

        );


        return res.json({

            message:
                "Vigencia extendida correctamente.",

            endDate:
                newEndDate

        });

    }

    catch (error) {

        console.error(
            "Error al extender vigencia:",
            error
        );


        return res.status(
            500
        ).json({

            message:
                "No fue posible extender la vigencia."

        });

    }

}


/*
====================================================

    OBTENER ACCESO A LA APP

====================================================
*/

async function getClientAppAccess(
    req,
    res
) {

    try {

        const clientId =
            req.params.clientId;


        const client =
            await getQuery(

                `
                SELECT

                    clientId,

                    fullName,

                    email

                FROM clients

                WHERE

                    clientId = ?

                LIMIT 1
                `,

                [

                    clientId

                ]

            );


        if (!client) {

            return res.status(
                404
            ).json({

                message:
                    "Cliente no encontrado."

            });

        }


        const user =
            await getQuery(

                `
                SELECT

                    userId,

                    username,

                    email,

                    role,

                    isActive

                FROM users

                WHERE

                    clientId = ?

                LIMIT 1
                `,

                [

                    clientId

                ]

            );


        return res.json({

            client,

            hasAccess:
                Boolean(
                    user
                ),

            user:
                user || null

        });

    }

    catch (error) {

        console.error(
            "Error al obtener acceso de app:",
            error
        );


        return res.status(
            500
        ).json({

            message:
                "No fue posible obtener el acceso del cliente."

        });

    }

}


/*
====================================================

    GENERAR ACCESO A LA APP

====================================================
*/

async function generateClientAppAccess(
    req,
    res
) {

    try {

        const clientId =
            req.params.clientId;


        const client =
            await getQuery(

                `
                SELECT *

                FROM clients

                WHERE

                    clientId = ?

                LIMIT 1
                `,

                [

                    clientId

                ]

            );


        if (!client) {

            return res.status(
                404
            ).json({

                message:
                    "Cliente no encontrado."

            });

        }


        const existingUser =
            await getQuery(

                `
                SELECT

                    userId,

                    username,

                    email,

                    role,

                    isActive

                FROM users

                WHERE

                    clientId = ?

                LIMIT 1
                `,

                [

                    clientId

                ]

            );


        if (existingUser) {

            return res.json({

                message:
                    "El cliente ya tiene acceso a la aplicación.",

                created:
                    false,

                username:
                    existingUser.username,

                email:
                    existingUser.email,

                password:
                    null,

                user:
                    existingUser

            });

        }


        const cleanClientId =
            String(
                client.clientId
            )
                .replace(
                    /[^a-zA-Z0-9]/g,
                    ""
                )
                .toLowerCase();


        const username =
            `client_${cleanClientId}`;


        let userEmail =
            client.email;


        if (!userEmail) {

            userEmail =
                `${username}@flowmanager.local`;

        }


        const userId =
            `USR-${Date.now()}-${Math.floor(
                Math.random() * 1000
            )}`;


        const password =
            generateSecurePassword();


        const passwordHash =
            await bcrypt.hash(
                password,
                10
            );


        const now =
            new Date()
                .toISOString();


        await runQuery(

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

                photoUrl,

                isRoot,

                isActive,

                lastLoginAt,

                createdAt,

                updatedAt

            )

            VALUES (

                ?,

                ?,

                ?,

                ?,

                ?,

                'client',

                ?,

                NULL,

                ?,

                0,

                1,

                NULL,

                ?,

                ?

            )
            `,

            [

                userId,

                client.fullName,

                username,

                userEmail,

                passwordHash,

                client.clientId,

                client.photoUrl || null,

                now,

                now

            ]

        );


        return res.status(
            201
        ).json({

            message:
                "Acceso generado correctamente.",

            created:
                true,

            username,

            email:
                userEmail,

            password,

            user: {

                userId,

                fullName:
                    client.fullName,

                username,

                email:
                    userEmail,

                role:
                    "client",

                clientId:
                    client.clientId,

                isActive:
                    true

            }

        });

    }

    catch (error) {

        console.error(
            "Error al generar acceso de app:",
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
            ).json({

                message:
                    "Ya existe un usuario con esos datos."

            });

        }


        return res.status(
            500
        ).json({

            message:
                "No fue posible generar el acceso a la aplicación."

        });

    }

}


/*
====================================================

    ACTUALIZAR ACCESO A LA APP

====================================================
*/

async function updateClientAppAccess(
    req,
    res
) {

    try {

        const clientId =
            req.params.clientId;


        const {

            email,

            password

        } =
            req.body;


        const client =
            await getQuery(

                `
                SELECT

                    clientId,

                    fullName

                FROM clients

                WHERE

                    clientId = ?

                LIMIT 1
                `,

                [

                    clientId

                ]

            );


        if (!client) {

            return res.status(
                404
            ).json({

                message:
                    "Cliente no encontrado."

            });

        }


        const user =
            await getQuery(

                `
                SELECT *

                FROM users

                WHERE

                    clientId = ?

                LIMIT 1
                `,

                [

                    clientId

                ]

            );


        if (!user) {

            return res.status(
                404
            ).json({

                message:
                    "Este cliente aún no tiene acceso a la aplicación."

            });

        }


        const normalizedEmail =
            String(
                email || ""
            )
                .trim()
                .toLowerCase();


        if (!normalizedEmail) {

            return res.status(
                400
            ).json({

                message:
                    "Debes indicar un correo válido."

            });

        }


        const emailOwner =
            await getQuery(

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

                    user.userId

                ]

            );


        if (emailOwner) {

            return res.status(
                409
            ).json({

                message:
                    "Ese correo ya está siendo utilizado por otro usuario."

            });

        }


        let passwordHash =
            user.passwordHash;


        if (

            password !== undefined

            &&

            String(
                password
            ).trim() !== ""

        ) {

            if (
                !isValidPassword(
                    String(
                        password
                    )
                )
            ) {

                return res.status(
                    400
                ).json({

                    message:
                        "La contraseña debe tener al menos 8 caracteres e incluir mayúscula, minúscula, número y símbolo."

                });

            }


            passwordHash =
                await bcrypt.hash(
                    String(
                        password
                    ),
                    10
                );

        }


        const now =
            new Date()
                .toISOString();


        await runQuery(

            `
            UPDATE users

            SET

                email = ?,

                passwordHash = ?,

                updatedAt = ?

            WHERE

                userId = ?
            `,

            [

                normalizedEmail,

                passwordHash,

                now,

                user.userId

            ]

        );


        await runQuery(

            `
            UPDATE clients

            SET

                email = ?,

                updatedAt = ?

            WHERE

                clientId = ?
            `,

            [

                normalizedEmail,

                now,

                clientId

            ]

        );


        const updatedUser =
            await getQuery(

                `
                SELECT

                    userId,

                    username,

                    email,

                    role,

                    isActive,

                    clientId

                FROM users

                WHERE

                    userId = ?

                LIMIT 1
                `,

                [

                    user.userId

                ]

            );


        return res.json({

            message:
                "Acceso actualizado correctamente.",

            user:
                updatedUser

        });

    }

    catch (error) {

        console.error(
            "Error al actualizar acceso de app:",
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
            ).json({

                message:
                    "Ese correo ya está siendo utilizado por otro usuario."

            });

        }


        return res.status(
            500
        ).json({

            message:
                "No fue posible actualizar el acceso."

        });

    }

}


/*
====================================================

    GENERAR QR DEL CLIENTE

====================================================
*/

async function getClientQr(
    req,
    res
) {

    try {

        const clientId =
            req.params.clientId;


        const client =
            await getQuery(

                `
                SELECT

                    clientId,

                    fullName,

                    membershipStatus,

                    isActive

                FROM clients

                WHERE

                    clientId = ?

                LIMIT 1
                `,

                [

                    clientId

                ]

            );


        if (!client) {

            return res.status(
                404
            ).json({

                message:
                    "Cliente no encontrado."

            });

        }


        if (
            Number(
                client.isActive
            ) !== 1
        ) {

            return res.status(
                400
            ).json({

                message:
                    "Este cliente se encuentra inactivo."

            });

        }


        const qrData =
            JSON.stringify({

                type:
                    "FLOWMANAGER_CLIENT",

                clientId:
                    client.clientId

            });


        const qr =
            await QRCode.toDataURL(

                qrData,

                {

                    errorCorrectionLevel:
                        "M",

                    width:
                        600,

                    margin:
                        2

                }

            );


        return res.json({

            clientId:
                client.clientId,

            fullName:
                client.fullName,

            qrData,

            qr

        });

    }

    catch (error) {

        console.error(
            "Error al generar QR:",
            error
        );


        return res.status(
            500
        ).json({

            message:
                "No fue posible generar el código QR."

        });

    }

}


/*
====================================================

    EXPORTS

====================================================
*/

module.exports = {

    getAllClients,

    createClient,

    searchClients,

    getClientById,

    updateClient,

    deleteClient,

    renewClientMembership,

    purchaseClientMembership,

    getClientMemberships,

    activateClientMembership,

    freezeClientMembership,

    reactivateClientMembership,

    extendClientMembership,

    getClientAppAccess,

    generateClientAppAccess,

    updateClientAppAccess,

    getClientQr

};