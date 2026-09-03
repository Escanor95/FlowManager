const db = require("../config/database");
const generateMembershipId =
    require("../utils/generateMembershipId");


// ====================================================
// SQLITE HELPERS
// ====================================================

const get = (sql, params = []) =>
    new Promise((resolve, reject) => {

        db.get(

            sql,

            params,

            (error, row) =>

                error
                    ? reject(error)
                    : resolve(row)

        );

    });


const all = (sql, params = []) =>
    new Promise((resolve, reject) => {

        db.all(

            sql,

            params,

            (error, rows) =>

                error
                    ? reject(error)
                    : resolve(rows)

        );

    });


const run = (sql, params = []) =>
    new Promise((resolve, reject) => {

        db.run(

            sql,

            params,

            function (error) {

                if (error) {

                    return reject(error);

                }


                resolve({

                    changes:
                        this.changes,

                    lastID:
                        this.lastID

                });

            }

        );

    });


// ====================================================
// TRANSACTION
// ====================================================

async function withTransaction(work) {

    await run(
        "BEGIN IMMEDIATE"
    );


    try {

        const result =
            await work();


        await run(
            "COMMIT"
        );


        return result;

    }

    catch (error) {

        try {

            await run(
                "ROLLBACK"
            );

        }

        catch (rollbackError) {

            console.error(

                "Membership rollback error:",

                rollbackError.message

            );

        }


        throw error;

    }

}


// ====================================================
// FECHA
// ====================================================

const getNow = () =>
    new Date().toISOString();


// ====================================================
// SUMAR DÍAS
// ====================================================

const addDays = (

    date,

    days

) => {

    const result =
        new Date(date);


    result.setDate(

        result.getDate() +

        Number(days || 0)

    );


    return result.toISOString();

};


// ====================================================
// DIFERENCIA DE DÍAS
// ====================================================

const getRemainingDays = expiresAt => {

    if (!expiresAt) {

        return null;

    }


    const now =
        new Date();


    const expiration =
        new Date(expiresAt);


    const difference =

        expiration.getTime()

        -

        now.getTime();


    return Math.max(

        0,

        Math.ceil(

            difference /

            (

                1000 *

                60 *

                60 *

                24

            )

        )

    );

};


// ====================================================
// GENERAR ID
// ====================================================

const generateSequentialId = (

    table,

    column,

    prefix,

    callback

) => {

    db.get(

        `
        SELECT ${column}

        FROM ${table}

        ORDER BY id DESC

        LIMIT 1
        `,

        [],

        (error, row) => {

            if (error) {

                return callback(error);

            }


            const next = row

                ?

                parseInt(

                    String(

                        row[column]

                    ).replace(

                        `${prefix}-`,

                        ""

                    ),

                    10

                ) + 1

                :

                1;


            callback(

                null,

                `${prefix}-${String(
                    next
                ).padStart(4, "0")}`

            );

        }

    );

};


// ====================================================
// PROMISE PARA GENERAR ID
// ====================================================

const generateId = (

    table,

    column,

    prefix

) =>

    new Promise((resolve, reject) => {

        generateSequentialId(

            table,

            column,

            prefix,

            (error, id) =>

                error

                    ?

                    reject(error)

                    :

                    resolve(id)

        );

    });


// ====================================================
// OBTENER TODAS LAS MEMBRESÍAS
// ====================================================

const getAllMemberships = (

    req,

    res

) => {

    db.all(

        `
        SELECT *

        FROM memberships

        WHERE isActive = 1

        ORDER BY name ASC
        `,

        [],

        (error, rows) => {

            if (error) {

                return res.status(500).json(
                    error
                );

            }


            res.json(
                rows
            );

        }

    );

};


// ====================================================
// OBTENER MEMBRESÍA POR ID
// ====================================================

const getMembershipById = (

    req,

    res

) => {

    db.get(

        `
        SELECT *

        FROM memberships

        WHERE membershipId = ?
        `,

        [

            req.params.membershipId

        ],

        (error, row) => {

            if (error) {

                return res.status(500).json(
                    error
                );

            }


            if (!row) {

                return res.status(404).json({

                    message:
                        "Membership not found"

                });

            }


            res.json(
                row
            );

        }

    );

};


// ====================================================
// BUSCAR MEMBRESÍAS
// ====================================================

const searchMemberships = (

    req,

    res

) => {

    const query =
        `%${req.params.query}%`;


    db.all(

        `
        SELECT *

        FROM memberships

        WHERE

            isActive = 1

            AND (

                membershipId LIKE ?

                OR

                name LIKE ?

            )

        ORDER BY name ASC
        `,

        [

            query,

            query

        ],

        (error, rows) => {

            if (error) {

                return res.status(500).json(
                    error
                );

            }


            res.json(
                rows
            );

        }

    );

};


// ====================================================
// CREAR MEMBRESÍA
// ====================================================

const createMembership = (

    req,

    res

) => {

    generateMembershipId(

        (

            error,

            membershipId

        ) => {

            if (error) {

                return res.status(500).json(
                    error
                );

            }


            const {

                name,
                price,
                classes,
                durationDays,
                description

            } = req.body;


            const now =
                getNow();


            db.run(

                `
                INSERT INTO memberships (

                    membershipId,

                    name,

                    price,

                    classes,

                    durationDays,

                    description,

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

                    ?,

                    ?,

                    ?

                )
                `,

                [

                    membershipId,

                    name,

                    price,

                    classes || null,

                    durationDays,

                    description,

                    1,

                    now,

                    now

                ],

                function (insertError) {

                    if (insertError) {

                        return res.status(500).json(
                            insertError
                        );

                    }


                    res.status(201).json({

                        message:
                            "Membership created successfully",

                        membershipId

                    });

                }

            );

        }

    );

};


// ====================================================
// ACTUALIZAR MEMBRESÍA
// ====================================================

const updateMembership = (

    req,

    res

) => {

    const {

        name,
        price,
        classes,
        durationDays,
        description

    } = req.body;


    db.run(

        `
        UPDATE memberships

        SET

            name = ?,

            price = ?,

            classes = ?,

            durationDays = ?,

            description = ?,

            updatedAt = ?

        WHERE membershipId = ?
        `,

        [

            name,

            price,

            classes || null,

            durationDays,

            description,

            getNow(),

            req.params.membershipId

        ],

        function (error) {

            if (error) {

                return res.status(500).json(
                    error
                );

            }


            if (this.changes === 0) {

                return res.status(404).json({

                    message:
                        "Membership not found"

                });

            }


            res.json({

                message:
                    "Membership updated successfully",

                membershipId:
                    req.params.membershipId

            });

        }

    );

};


// ====================================================
// DESACTIVAR MEMBRESÍA
// ====================================================

const deactivateMembership = (

    req,

    res

) => {

    db.run(

        `
        UPDATE memberships

        SET

            isActive = 0,

            updatedAt = ?

        WHERE membershipId = ?
        `,

        [

            getNow(),

            req.params.membershipId

        ],

        function (error) {

            if (error) {

                return res.status(500).json(
                    error
                );

            }


            if (this.changes === 0) {

                return res.status(404).json({

                    message:
                        "Membership not found"

                });

            }


            res.json({

                message:
                    "Membership deactivated successfully"

            });

        }

    );

};


// ====================================================
// OBTENER PAQUETES DEL CLIENTE
// ====================================================

const getClientMemberships =
    async (
        req,
        res
    ) => {

        try {

            const rows =
                await all(

                    `
                    SELECT

                        cm.*,

                        m.name AS membershipName,

                        m.price,

                        m.classes AS membershipClasses,

                        m.durationDays,

                        m.description

                    FROM client_memberships cm

                    INNER JOIN memberships m

                        ON cm.membershipId =
                        m.membershipId

                    WHERE cm.clientId = ?

                    ORDER BY

                        cm.purchasedAt DESC,

                        cm.id DESC
                    `,

                    [

                        req.params.clientId

                    ]

                );


            res.json(
                rows
            );

        }

        catch (error) {

            res.status(500).json({

                message:
                    error.message

            });

        }

    };


// ====================================================
// OBTENER PAQUETE POR ID
// ====================================================

const getClientMembershipById =
    async (
        req,
        res
    ) => {

        try {

            const membership =
                await get(

                    `
                    SELECT

                        cm.*,

                        m.name AS membershipName,

                        m.price,

                        m.classes AS membershipClasses,

                        m.durationDays,

                        m.description,

                        c.fullName

                    FROM client_memberships cm

                    INNER JOIN memberships m

                        ON cm.membershipId =
                        m.membershipId

                    INNER JOIN clients c

                        ON cm.clientId =
                        c.clientId

                    WHERE

                        cm.clientMembershipId = ?
                    `,

                    [

                        req.params.clientMembershipId

                    ]

                );


            if (!membership) {

                return res.status(404).json({

                    message:
                        "Paquete del cliente no encontrado."

                });

            }


            res.json(
                membership
            );

        }

        catch (error) {

            res.status(500).json({

                message:
                    error.message

            });

        }

    };


// ====================================================
// COMPRAR PAQUETE
//
// CREA EL PAQUETE EN ESTADO:
//
// PENDING_ACTIVATION
// ====================================================

const purchaseClientMembership =
    async (
        req,
        res
    ) => {

        const {

            clientId,

            membershipId,

            createdByUserId

        } = req.body;


        if (

            !clientId

            ||

            !membershipId

        ) {

            return res.status(400).json({

                message:
                    "clientId y membershipId son requeridos."

            });

        }


        try {

            const [

                client,

                membership

            ] = await Promise.all([

                get(

                    `
                    SELECT *

                    FROM clients

                    WHERE

                        clientId = ?

                        AND isActive = 1
                    `,

                    [

                        clientId

                    ]

                ),

                get(

                    `
                    SELECT *

                    FROM memberships

                    WHERE

                        membershipId = ?

                        AND isActive = 1
                    `,

                    [

                        membershipId

                    ]

                )

            ]);


            if (!client) {

                return res.status(404).json({

                    message:
                        "Cliente no encontrado."

                });

            }


            if (!membership) {

                return res.status(404).json({

                    message:
                        "Membresía no encontrada o inactiva."

                });

            }


            const clientMembershipId =
                await generateId(

                    "client_memberships",

                    "clientMembershipId",

                    "CM"

                );


            const now =
                getNow();


            await withTransaction(

                async () => {

                    await run(

                        `
                        INSERT INTO client_memberships (

                            clientMembershipId,

                            clientId,

                            membershipId,

                            status,

                            purchasedAt,

                            activatedAt,

                            expiresAt,

                            frozenAt,

                            frozenRemainingDays,

                            remainingClasses,

                            createdByUserId,

                            createdAt,

                            updatedAt

                        )

                        VALUES (

                            ?,

                            ?,

                            ?,

                            'PENDING_ACTIVATION',

                            ?,

                            NULL,

                            NULL,

                            NULL,

                            NULL,

                            ?,

                            ?,

                            ?,

                            ?

                        )
                        `,

                        [

                            clientMembershipId,

                            clientId,

                            membershipId,

                            now,

                            membership.classes === null

                                ?

                                null

                                :

                                Number(
                                    membership.classes
                                ),

                            createdByUserId || null,

                            now,

                            now

                        ]

                    );

                }

            );


            res.status(201).json({

                message:
                    "Paquete comprado y pendiente de activación.",

                clientMembershipId,

                status:
                    "PENDING_ACTIVATION"

            });

        }

        catch (error) {

            res.status(500).json({

                message:
                    error.message

            });

        }

    };


// ====================================================
// ACTIVAR PAQUETE
// ====================================================

const activateClientMembership =
    async (
        req,
        res
    ) => {

        const {

            clientMembershipId

        } = req.params;


        try {

            const clientMembership =
                await get(

                    `
                    SELECT

                        cm.*,

                        m.classes,

                        m.durationDays

                    FROM client_memberships cm

                    INNER JOIN memberships m

                        ON cm.membershipId =
                        m.membershipId

                    WHERE

                        cm.clientMembershipId = ?
                    `,

                    [

                        clientMembershipId

                    ]

                );


            if (!clientMembership) {

                return res.status(404).json({

                    message:
                        "Paquete no encontrado."

                });

            }


            if (

                clientMembership.status ===
                "ACTIVE"

            ) {

                return res.status(409).json({

                    message:
                        "Este paquete ya está activo."

                });

            }


            if (

                clientMembership.status ===
                "FROZEN"

            ) {

                return res.status(409).json({

                    message:
                        "El paquete está congelado. Debe reactivarse."

                });

            }


            const now =
                getNow();


            const expiresAt =

                clientMembership.durationDays

                    ?

                    addDays(

                        now,

                        clientMembership.durationDays

                    )

                    :

                    null;


            const remainingClasses =

                clientMembership.classes === null

                    ?

                    null

                    :

                    Number(
                        clientMembership.classes
                    );


            await withTransaction(

                async () => {

                    await run(

                        `
                        UPDATE client_memberships

                        SET

                            status = 'ACTIVE',

                            activatedAt = ?,

                            expiresAt = ?,

                            frozenAt = NULL,

                            frozenRemainingDays = NULL,

                            remainingClasses = ?,

                            updatedAt = ?

                        WHERE

                            clientMembershipId = ?
                        `,

                        [

                            now,

                            expiresAt,

                            remainingClasses,

                            now,

                            clientMembershipId

                        ]

                    );


                    await run(

                        `
                        UPDATE clients

                        SET

                            membershipId = ?,

                            remainingClasses = ?,

                            startDate = ?,

                            endDate = ?,

                            membershipStatus = 'Active',

                            updatedAt = ?

                        WHERE

                            clientId = ?
                        `,

                        [

                            clientMembership.membershipId,

                            remainingClasses,

                            now,

                            expiresAt,

                            now,

                            clientMembership.clientId

                        ]

                    );

                }

            );


            res.json({

                message:
                    "Paquete activado correctamente.",

                clientMembershipId,

                status:
                    "ACTIVE",

                activatedAt:
                    now,

                expiresAt,

                remainingClasses

            });

        }

        catch (error) {

            res.status(500).json({

                message:
                    error.message

            });

        }

    };


// ====================================================
// CONGELAR PAQUETE
// ====================================================

const freezeClientMembership =
    async (
        req,
        res
    ) => {

        const {

            clientMembershipId

        } = req.params;


        const {

            frozenByUserId

        } = req.body;


        try {

            const clientMembership =
                await get(

                    `
                    SELECT *

                    FROM client_memberships

                    WHERE

                        clientMembershipId = ?
                    `,

                    [

                        clientMembershipId

                    ]

                );


            if (!clientMembership) {

                return res.status(404).json({

                    message:
                        "Paquete no encontrado."

                });

            }


            if (

                clientMembership.status !==
                "ACTIVE"

            ) {

                return res.status(409).json({

                    message:
                        "Solo se puede congelar un paquete activo."

                });

            }


            const freezeId =
                await generateId(

                    "membership_freezes",

                    "freezeId",

                    "MF"

                );


            const now =
                getNow();


            const remainingDays =
                getRemainingDays(

                    clientMembership.expiresAt

                );


            await withTransaction(

                async () => {

                    await run(

                        `
                        UPDATE client_memberships

                        SET

                            status = 'FROZEN',

                            frozenAt = ?,

                            frozenRemainingDays = ?,

                            updatedAt = ?

                        WHERE

                            clientMembershipId = ?
                        `,

                        [

                            now,

                            remainingDays,

                            now,

                            clientMembershipId

                        ]

                    );


                    await run(

                        `
                        INSERT INTO membership_freezes (

                            freezeId,

                            clientMembershipId,

                            frozenAt,

                            reactivatedAt,

                            remainingDays,

                            frozenByUserId,

                            reactivatedByUserId,

                            createdAt,

                            updatedAt

                        )

                        VALUES (

                            ?,

                            ?,

                            ?,

                            NULL,

                            ?,

                            ?,

                            NULL,

                            ?,

                            ?

                        )
                        `,

                        [

                            freezeId,

                            clientMembershipId,

                            now,

                            remainingDays,

                            frozenByUserId || null,

                            now,

                            now

                        ]

                    );


                    await run(

                        `
                        UPDATE clients

                        SET

                            membershipStatus = 'Frozen',

                            updatedAt = ?

                        WHERE

                            clientId = ?
                        `,

                        [

                            now,

                            clientMembership.clientId

                        ]

                    );

                }

            );


            res.json({

                message:
                    "Paquete congelado correctamente.",

                clientMembershipId,

                status:
                    "FROZEN",

                frozenAt:
                    now,

                remainingDays

            });

        }

        catch (error) {

            res.status(500).json({

                message:
                    error.message

            });

        }

    };


// ====================================================
// REACTIVAR PAQUETE
// ====================================================

const reactivateClientMembership =
    async (
        req,
        res
    ) => {

        const {

            clientMembershipId

        } = req.params;


        const {

            reactivatedByUserId

        } = req.body;


        try {

            const clientMembership =
                await get(

                    `
                    SELECT *

                    FROM client_memberships

                    WHERE

                        clientMembershipId = ?
                    `,

                    [

                        clientMembershipId

                    ]

                );


            if (!clientMembership) {

                return res.status(404).json({

                    message:
                        "Paquete no encontrado."

                });

            }


            if (

                clientMembership.status !==
                "FROZEN"

            ) {

                return res.status(409).json({

                    message:
                        "Este paquete no está congelado."

                });

            }


            const now =
                getNow();


            const remainingDays =

                clientMembership.frozenRemainingDays;


            const expiresAt =

                remainingDays === null

                    ?

                    null

                    :

                    addDays(

                        now,

                        remainingDays

                    );


            await withTransaction(

                async () => {

                    await run(

                        `
                        UPDATE client_memberships

                        SET

                            status = 'ACTIVE',

                            expiresAt = ?,

                            frozenAt = NULL,

                            frozenRemainingDays = NULL,

                            updatedAt = ?

                        WHERE

                            clientMembershipId = ?
                        `,

                        [

                            expiresAt,

                            now,

                            clientMembershipId

                        ]

                    );


                    await run(

                        `
                        UPDATE membership_freezes

                        SET

                            reactivatedAt = ?,

                            reactivatedByUserId = ?,

                            updatedAt = ?

                        WHERE

                            clientMembershipId = ?

                            AND reactivatedAt IS NULL
                        `,

                        [

                            now,

                            reactivatedByUserId || null,

                            now,

                            clientMembershipId

                        ]

                    );


                    await run(

                        `
                        UPDATE clients

                        SET

                            endDate = ?,

                            membershipStatus = 'Active',

                            updatedAt = ?

                        WHERE

                            clientId = ?
                        `,

                        [

                            expiresAt,

                            now,

                            clientMembership.clientId

                        ]

                    );

                }

            );


            res.json({

                message:
                    "Paquete reactivado correctamente.",

                clientMembershipId,

                status:
                    "ACTIVE",

                expiresAt

            });

        }

        catch (error) {

            res.status(500).json({

                message:
                    error.message

            });

        }

    };


// ====================================================
// EXTENDER PAQUETE
// ====================================================

const extendClientMembership =
    async (
        req,
        res
    ) => {

        const {

            clientMembershipId

        } = req.params;


        const {

            daysAdded,

            reason,

            extendedByUserId

        } = req.body;


        if (

            !daysAdded

            ||

            Number(daysAdded) <= 0

        ) {

            return res.status(400).json({

                message:
                    "daysAdded debe ser mayor a cero."

            });

        }


        if (!reason) {

            return res.status(400).json({

                message:
                    "reason es requerido."

            });

        }


        try {

            const clientMembership =
                await get(

                    `
                    SELECT *

                    FROM client_memberships

                    WHERE

                        clientMembershipId = ?
                    `,

                    [

                        clientMembershipId

                    ]

                );


            if (!clientMembership) {

                return res.status(404).json({

                    message:
                        "Paquete no encontrado."

                });

            }


            const extensionId =
                await generateId(

                    "membership_extensions",

                    "extensionId",

                    "ME"

                );


            const now =
                getNow();


            let expiresAt =

                clientMembership.expiresAt;


            if (

                clientMembership.status ===
                "FROZEN"

            ) {

                const currentDays =

                    Number(

                        clientMembership
                            .frozenRemainingDays || 0

                    );


                const newRemainingDays =

                    currentDays +

                    Number(daysAdded);


                await withTransaction(

                    async () => {

                        await run(

                            `
                            UPDATE client_memberships

                            SET

                                frozenRemainingDays = ?,

                                updatedAt = ?

                            WHERE

                                clientMembershipId = ?
                            `,

                            [

                                newRemainingDays,

                                now,

                                clientMembershipId

                            ]

                        );


                        await run(

                            `
                            INSERT INTO membership_extensions (

                                extensionId,

                                clientMembershipId,

                                daysAdded,

                                reason,

                                extendedByUserId,

                                createdAt

                            )

                            VALUES (

                                ?,

                                ?,

                                ?,

                                ?,

                                ?,

                                ?

                            )
                            `,

                            [

                                extensionId,

                                clientMembershipId,

                                Number(daysAdded),

                                reason,

                                extendedByUserId || null,

                                now

                            ]

                        );

                    }

                );


                return res.json({

                    message:
                        "Extensión aplicada correctamente.",

                    clientMembershipId,

                    extensionId,

                    frozenRemainingDays:
                        newRemainingDays

                });

            }


            if (!expiresAt) {

                expiresAt =
                    addDays(

                        now,

                        Number(daysAdded)

                    );

            }

            else {

                const baseDate =

                    new Date(expiresAt) > new Date()

                        ?

                        expiresAt

                        :

                        now;


                expiresAt =
                    addDays(

                        baseDate,

                        Number(daysAdded)

                    );

            }


            await withTransaction(

                async () => {

                    await run(

                        `
                        UPDATE client_memberships

                        SET

                            expiresAt = ?,

                            updatedAt = ?

                        WHERE

                            clientMembershipId = ?
                        `,

                        [

                            expiresAt,

                            now,

                            clientMembershipId

                        ]

                    );


                    await run(

                        `
                        INSERT INTO membership_extensions (

                            extensionId,

                            clientMembershipId,

                            daysAdded,

                            reason,

                            extendedByUserId,

                            createdAt

                        )

                        VALUES (

                            ?,

                            ?,

                            ?,

                            ?,

                            ?,

                            ?

                        )
                        `,

                        [

                            extensionId,

                            clientMembershipId,

                            Number(daysAdded),

                            reason,

                            extendedByUserId || null,

                            now

                        ]

                    );


                    if (

                        clientMembership.status ===
                        "ACTIVE"

                    ) {

                        await run(

                            `
                            UPDATE clients

                            SET

                                endDate = ?,

                                updatedAt = ?

                            WHERE

                                clientId = ?
                            `,

                            [

                                expiresAt,

                                now,

                                clientMembership.clientId

                            ]

                        );

                    }

                }

            );


            res.json({

                message:
                    "Extensión aplicada correctamente.",

                clientMembershipId,

                extensionId,

                expiresAt

            });

        }

        catch (error) {

            res.status(500).json({

                message:
                    error.message

            });

        }

    };


// ====================================================
// HISTORIAL DE MOVIMIENTOS
// ====================================================

const getClientMembershipHistory =
    async (
        req,
        res
    ) => {

        const {

            clientMembershipId

        } = req.params;


        try {

            const [

                extensions,

                freezes

            ] = await Promise.all([

                all(

                    `
                    SELECT

                        extensionId,

                        clientMembershipId,

                        daysAdded,

                        reason,

                        extendedByUserId,

                        createdAt

                    FROM membership_extensions

                    WHERE

                        clientMembershipId = ?
                    `,

                    [

                        clientMembershipId

                    ]

                ),

                all(

                    `
                    SELECT

                        freezeId,

                        clientMembershipId,

                        frozenAt,

                        reactivatedAt,

                        remainingDays,

                        frozenByUserId,

                        reactivatedByUserId,

                        createdAt,

                        updatedAt

                    FROM membership_freezes

                    WHERE

                        clientMembershipId = ?
                    `,

                    [

                        clientMembershipId

                    ]

                )

            ]);


            const history = [


                ...extensions.map(

                    extension => ({

                        type:
                            "EXTENSION",

                        date:
                            extension.createdAt,

                        data:
                            extension

                    })

                ),


                ...freezes.map(

                    freeze => ({

                        type:
                            "FREEZE",

                        date:
                            freeze.createdAt,

                        data:
                            freeze

                    })

                )

            ];


            history.sort(

                (

                    a,

                    b

                ) =>

                    new Date(
                        b.date
                    )

                    -

                    new Date(
                        a.date
                    )

            );


            res.json({

                clientMembershipId,

                history

            });

        }

        catch (error) {

            res.status(500).json({

                message:
                    error.message

            });

        }

    };


// ====================================================
// EXPORTS
// ====================================================

module.exports = {

    // MEMBRESÍAS BASE

    getAllMemberships,

    getMembershipById,

    searchMemberships,

    createMembership,

    updateMembership,

    deactivateMembership,


    // PAQUETES DEL CLIENTE

    getClientMemberships,

    getClientMembershipById,

    purchaseClientMembership,

    activateClientMembership,

    freezeClientMembership,

    reactivateClientMembership,

    extendClientMembership,

    getClientMembershipHistory

};