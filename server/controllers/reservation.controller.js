/*
====================================================

    FLOWMANAGER

    RESERVATION CONTROLLER

====================================================
*/

const db =
    require("../config/database");


// ====================================================
// SQLITE HELPERS
// ====================================================

const get =
    (
        sql,
        params = []
    ) =>
        new Promise(
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


const all =
    (
        sql,
        params = []
    ) =>
        new Promise(
            (
                resolve,
                reject
            ) => {

                db.all(

                    sql,

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


const run =
    (
        sql,
        params = []
    ) =>
        new Promise(
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


// ====================================================
// TABLA RESERVACIONES DE COACH
// ====================================================

let coachReservationsReady =
    null;


async function initializeCoachReservationsTable() {

    if (
        coachReservationsReady
    ) {

        return coachReservationsReady;

    }


    coachReservationsReady =
        run(`

            CREATE TABLE IF NOT EXISTS coach_reservations (

                reservationId TEXT PRIMARY KEY,

                coachId TEXT NOT NULL,

                scheduleId TEXT NOT NULL,

                reservationDate TEXT NOT NULL,

                status TEXT NOT NULL DEFAULT 'CONFIRMED',

                createdAt TEXT NOT NULL,

                updatedAt TEXT NOT NULL

            )

        `);


    return coachReservationsReady;

}


// ====================================================
// FECHA LOCAL
// ====================================================

function localDateKey() {

    const date =
        new Date();


    return `${date.getFullYear()}-${String(
        date.getMonth() + 1
    ).padStart(
        2,
        "0"
    )}-${String(
        date.getDate()
    ).padStart(
        2,
        "0"
    )}`;

}


// ====================================================
// HORA
// ====================================================

function timeToMinutes(
    time
) {

    if (!time) {

        return null;

    }


    const parts =
        String(
            time
        )
            .slice(
                0,
                5
            )
            .split(
                ":"
            )
            .map(
                Number
            );


    if (

        !Number.isFinite(
            parts[0]
        )

        ||

        !Number.isFinite(
            parts[1]
        )

    ) {

        return null;

    }


    return (

        parts[0] * 60

    )
        +
        parts[1];

}


// ====================================================
// CANCELACIÓN
// ====================================================

function canCancelReservation(
    reservationDate,
    startTime
) {

    if (
        !reservationDate
        ||
        !startTime
    ) {

        return false;

    }


    const date =
        String(
            reservationDate
        )
            .split(
                "T"
            )[0];


    const time =
        String(
            startTime
        )
            .slice(
                0,
                5
            );


    const classDateTime =
        new Date(
            `${date}T${time}:00`
        );


    if (
        Number.isNaN(
            classDateTime.getTime()
        )
    ) {

        return false;

    }


    return (

        classDateTime.getTime()
        -
        Date.now()

    ) >=
        (
            3
            *
            60
            *
            60
            *
            1000
        );

}


// ====================================================
// OCUPACIÓN TOTAL
//
// CLIENTAS + COACHES
// ====================================================

async function getOccupiedCount(
    scheduleId,
    reservationDate
) {

    await initializeCoachReservationsTable();


    const clients =
        await get(`

            SELECT

                COUNT(*) AS total

            FROM reservations

            WHERE

                scheduleId = ?

                AND reservationDate = ?

                AND status = 'CONFIRMED'

        `, [

            scheduleId,

            reservationDate

        ]);


    const coaches =
        await get(`

            SELECT

                COUNT(*) AS total

            FROM coach_reservations

            WHERE

                scheduleId = ?

                AND reservationDate = ?

                AND status = 'CONFIRMED'

        `, [

            scheduleId,

            reservationDate

        ]);


    return (

        Number(
            clients?.total
        )
        +
        Number(
            coaches?.total
        )

    );

}


// ====================================================
// GENERAR ID
// ====================================================

async function generateReservationId() {

    await initializeCoachReservationsTable();


    const rows =
        await all(`

            SELECT reservationId

            FROM reservations

            UNION ALL

            SELECT reservationId

            FROM coach_reservations

        `);


    let max =
        0;


    rows.forEach(
        row => {

            const value =
                String(
                    row.reservationId || ""
                );


            const number =
                Number(
                    value.replace(
                        "RS-",
                        ""
                    )
                );


            if (
                Number.isFinite(
                    number
                )
                &&
                number > max
            ) {

                max =
                    number;

            }

        }
    );


    return `RS-${String(
        max + 1
    ).padStart(
        4,
        "0"
    )}`;

}


// ====================================================
// RESOLVER COACH AUTENTICADO
//
// NO DEPENDE DEL FRONTEND.
// ====================================================

async function resolveCoachFromRequest(
    req
) {

    let user =
        null;


    const userId =
        req.user?.userId ||
        null;


    let coachId =
        req.user?.coachId ||
        null;


    if (
        userId
    ) {

        user =
            await get(`

                SELECT

                    userId,

                    fullName,

                    email,

                    role,

                    coachId

                FROM users

                WHERE

                    userId = ?

                    AND isActive = 1

                LIMIT 1

            `, [

                userId

            ]);

    }


    if (
        !user
        &&
        req.user?.email
    ) {

        user =
            await get(`

                SELECT

                    userId,

                    fullName,

                    email,

                    role,

                    coachId

                FROM users

                WHERE

                    LOWER(email) =
                    LOWER(?)

                    AND isActive = 1

                LIMIT 1

            `, [

                req.user.email

            ]);

    }


    if (
        user
    ) {

        const role =
            String(
                user.role || ""
            )
                .trim()
                .toLowerCase();


        if (
            role !== "coach"
        ) {

            throw new Error(
                "Esta operación solo está disponible para coaches."
            );

        }


        if (
            user.coachId
        ) {

            coachId =
                user.coachId;

        }

    }


    if (
        coachId
    ) {

        const coach =
            await get(`

                SELECT

                    *

                FROM coaches

                WHERE

                    coachId = ?

                    AND isActive = 1

                LIMIT 1

            `, [

                coachId

            ]);


        if (
            coach
        ) {

            return coach;

        }

    }


    // =================================================
    // BUSCAR POR CORREO
    // =================================================

    const email =
        user?.email
        ||
        req.user?.email
        ||
        null;


    if (
        email
    ) {

        const normalizedEmail =
            String(
                email
            )
                .trim()
                .toLowerCase();


        const coach =
            await get(`

                SELECT

                    *

                FROM coaches

                WHERE

                    LOWER(email) = ?

                    AND isActive = 1

                LIMIT 1

            `, [

                normalizedEmail

            ]);


        if (
            coach
        ) {

            if (
                user?.userId
            ) {

                await run(`

                    UPDATE users

                    SET

                        coachId = ?,

                        updatedAt = ?

                    WHERE

                        userId = ?

                `, [

                    coach.coachId,

                    new Date()
                        .toISOString(),

                    user.userId

                ]);

            }


            return coach;

        }

    }


    throw new Error(
        "No fue posible identificar el coach autenticado."
    );

}


// ====================================================
// VALIDAR RESERVACIÓN CLIENTA
// ====================================================

async function validateReservation(
    clientId,
    scheduleId,
    reservationDate
) {

    const client =
        await get(`

            SELECT *

            FROM clients

            WHERE

                clientId = ?

                AND isActive = 1

        `, [

            clientId

        ]);


    if (
        !client
    ) {

        return {

            valid:
                false,

            message:
                "Cliente no encontrado o inactivo."

        };

    }


    const schedule =
        await get(`

            SELECT *

            FROM schedules

            WHERE

                scheduleId = ?

                AND isActive = 1

        `, [

            scheduleId

        ]);


    if (
        !schedule
    ) {

        return {

            valid:
                false,

            message:
                "Horario no encontrado o inactivo."

        };

    }


    const weekday =
        new Date(
            `${reservationDate}T12:00:00`
        )
            .toLocaleDateString(
                "en-US",
                {
                    weekday:
                        "long"
                }
            );


    if (
        String(
            schedule.weekday || ""
        )
            .toLowerCase()
        !==
        String(
            weekday
        )
            .toLowerCase()
    ) {

        return {

            valid:
                false,

            message:
                "La clase no está programada para esa fecha."

        };

    }


    const existing =
        await get(`

            SELECT

                reservationId

            FROM reservations

            WHERE

                clientId = ?

                AND scheduleId = ?

                AND reservationDate = ?

                AND status = 'CONFIRMED'

            LIMIT 1

        `, [

            clientId,

            scheduleId,

            reservationDate

        ]);


    if (
        existing
    ) {

        return {

            valid:
                false,

            message:
                "La clienta ya tiene una reservación para esta clase."

        };

    }


    const occupied =
        await getOccupiedCount(
            scheduleId,
            reservationDate
        );


    const capacity =
        Number(
            schedule.capacity
        )
        ||
        0;


    if (
        occupied >= capacity
    ) {

        return {

            valid:
                false,

            message:
                "No hay lugares disponibles para esta clase."

        };

    }


    if (
        client.remainingClasses !==
        null
        &&
        client.remainingClasses !==
        undefined
    ) {

        const remaining =
            Number(
                client.remainingClasses
            );


        if (
            Number.isFinite(
                remaining
            )
            &&
            remaining <= 0
        ) {

            return {

                valid:
                    false,

                message:
                    "La clienta no tiene clases disponibles."

            };

        }

    }


    return {

        valid:
            true,

        client,

        schedule

    };

}


// ====================================================
// VALIDAR RESERVACIÓN COACH
//
// REGLA:
//
// EL COACH PUEDE RESERVAR CLASES DE OTROS COACHES,
// PERO NUNCA UNA CLASE QUE ÉL MISMO IMPARTE.
//
// ADEMAS COMPARTEN EL MISMO CUPO FÍSICO.
// ====================================================

async function validateCoachReservation(
    coachId,
    scheduleId,
    reservationDate
) {

    const coach =
        await get(`

            SELECT *

            FROM coaches

            WHERE

                coachId = ?

                AND isActive = 1

            LIMIT 1

        `, [

            coachId

        ]);


    if (
        !coach
    ) {

        return {

            valid:
                false,

            message:
                "Coach no encontrado o inactivo."

        };

    }


    const schedule =
        await get(`

            SELECT

                s.*,

                a.name AS activityName,

                a.icon AS activityIcon,

                a.color AS activityColor

            FROM schedules s

            LEFT JOIN activities a

                ON s.activityId =
                a.activityId

            WHERE

                s.scheduleId = ?

                AND s.isActive = 1

            LIMIT 1

        `, [

            scheduleId

        ]);


    if (
        !schedule
    ) {

        return {

            valid:
                false,

            message:
                "Horario no encontrado o inactivo."

        };

    }


    // =================================================
    // REGLA PRINCIPAL
    //
    // EL COACH NO PUEDE RESERVAR UNA CLASE
    // QUE ÉL MISMO VA A IMPARTIR.
    // =================================================

    if (

        schedule.coachId

        &&

        String(
            schedule.coachId
        )
        ===
        String(
            coachId
        )

    ) {

        return {

            valid:
                false,

            message:
                "No puedes reservar una clase que tú impartes."

        };

    }


    const weekday =
        new Date(
            `${reservationDate}T12:00:00`
        )
            .toLocaleDateString(
                "en-US",
                {
                    weekday:
                        "long"
                }
            );


    if (

        String(
            schedule.weekday || ""
        )
            .toLowerCase()

        !==

        String(
            weekday
        )
            .toLowerCase()

    ) {

        return {

            valid:
                false,

            message:
                "La clase no está programada para esa fecha."

        };

    }


    const duplicate =
        await get(`

            SELECT

                reservationId

            FROM coach_reservations

            WHERE

                coachId = ?

                AND scheduleId = ?

                AND reservationDate = ?

                AND status = 'CONFIRMED'

            LIMIT 1

        `, [

            coachId,

            scheduleId,

            reservationDate

        ]);


    if (
        duplicate
    ) {

        return {

            valid:
                false,

            message:
                "Ya tienes una reservación para esta clase."

        };

    }


    const occupied =
        await getOccupiedCount(
            scheduleId,
            reservationDate
        );


    const capacity =
        Number(
            schedule.capacity
        )
        ||
        0;


    if (
        occupied >= capacity
    ) {

        return {

            valid:
                false,

            message:
                "No hay lugares disponibles para esta clase."

        };

    }


    return {

        valid:
            true,

        coach,

        schedule

    };

}


// ====================================================
// TODAS LAS RESERVACIONES
// ====================================================

const getAllReservations =
    async (
        req,
        res
    ) => {

        try {

            await initializeCoachReservationsTable();


            const reservations =
                await all(`

                    SELECT

                        r.reservationId,

                        r.clientId,

                        r.clientMembershipId,

                        NULL AS coachId,

                        r.scheduleId,

                        r.reservationDate,

                        r.status,

                        r.createdAt,

                        r.updatedAt,

                        c.fullName,

                        'client'
                            AS reservationType,

                        s.startTime,

                        s.duration,

                        s.capacity,

                        a.name
                            AS activityName,

                        a.icon
                            AS activityIcon,

                        a.color
                            AS activityColor

                    FROM reservations r

                    INNER JOIN clients c

                        ON r.clientId =
                        c.clientId

                    INNER JOIN schedules s

                        ON r.scheduleId =
                        s.scheduleId

                    LEFT JOIN activities a

                        ON s.activityId =
                        a.activityId

                    UNION ALL

                    SELECT

                        cr.reservationId,

                        NULL AS clientId,

                        NULL AS clientMembershipId,

                        cr.coachId,

                        cr.scheduleId,

                        cr.reservationDate,

                        cr.status,

                        cr.createdAt,

                        cr.updatedAt,

                        co.fullName,

                        'coach'
                            AS reservationType,

                        s.startTime,

                        s.duration,

                        s.capacity,

                        a.name
                            AS activityName,

                        a.icon
                            AS activityIcon,

                        a.color
                            AS activityColor

                    FROM coach_reservations cr

                    INNER JOIN coaches co

                        ON cr.coachId =
                        co.coachId

                    INNER JOIN schedules s

                        ON cr.scheduleId =
                        s.scheduleId

                    LEFT JOIN activities a

                        ON s.activityId =
                        a.activityId

                    ORDER BY

                        reservationDate DESC,

                        startTime ASC

                `);


            res.json(
                reservations
            );

        }

        catch (
        error
        ) {

            console.error(
                "getAllReservations:",
                error
            );


            res.status(
                500
            )
                .json({

                    message:
                        error.message

                });

        }

    };


// ====================================================
// UNA RESERVACIÓN
// ====================================================

const getReservationById =
    async (
        req,
        res
    ) => {

        try {

            await initializeCoachReservationsTable();


            const reservation =
                await get(`

                    SELECT *

                    FROM (

                        SELECT

                            r.reservationId,

                            r.clientId,

                            NULL AS coachId,

                            r.scheduleId,

                            r.reservationDate,

                            r.status,

                            r.createdAt,

                            r.updatedAt,

                            c.fullName,

                            'client'
                                AS reservationType,

                            s.startTime,

                            s.duration,

                            s.capacity,

                            a.name
                                AS activityName,

                            a.icon
                                AS activityIcon,

                            a.color
                                AS activityColor

                        FROM reservations r

                        INNER JOIN clients c

                            ON r.clientId =
                            c.clientId

                        INNER JOIN schedules s

                            ON r.scheduleId =
                            s.scheduleId

                        LEFT JOIN activities a

                            ON s.activityId =
                            a.activityId

                        WHERE

                            r.reservationId = ?

                        UNION ALL

                        SELECT

                            cr.reservationId,

                            NULL AS clientId,

                            cr.coachId,

                            cr.scheduleId,

                            cr.reservationDate,

                            cr.status,

                            cr.createdAt,

                            cr.updatedAt,

                            co.fullName,

                            'coach'
                                AS reservationType,

                            s.startTime,

                            s.duration,

                            s.capacity,

                            a.name
                                AS activityName,

                            a.icon
                                AS activityIcon,

                            a.color
                                AS activityColor

                        FROM coach_reservations cr

                        INNER JOIN coaches co

                            ON cr.coachId =
                            co.coachId

                        INNER JOIN schedules s

                            ON cr.scheduleId =
                            s.scheduleId

                        LEFT JOIN activities a

                            ON s.activityId =
                            a.activityId

                        WHERE

                            cr.reservationId = ?

                    )

                    LIMIT 1

                `, [

                    req.params.reservationId,

                    req.params.reservationId

                ]);


            if (
                !reservation
            ) {

                return res.status(
                    404
                )
                    .json({

                        message:
                            "Reservación no encontrada."

                    });

            }


            res.json(
                reservation
            );

        }

        catch (
        error
        ) {

            console.error(
                "getReservationById:",
                error
            );


            res.status(
                500
            )
                .json({

                    message:
                        error.message

                });

        }

    };


// ====================================================
// RESERVACIONES POR CLIENTE
// ====================================================

const getReservationsByClient =
    async (
        req,
        res
    ) => {

        try {

            const reservations =
                await all(`

                    SELECT

                        r.reservationId,

                        r.clientId,

                        r.clientMembershipId,

                        r.scheduleId,

                        r.reservationDate,

                        r.status,

                        r.createdAt,

                        r.updatedAt,

                        s.startTime,

                        s.duration,

                        s.capacity,

                        a.name
                            AS activityName,

                        a.icon
                            AS activityIcon,

                        a.color
                            AS activityColor,

                        c2.fullName
                            AS coachName

                    FROM reservations r

                    INNER JOIN schedules s

                        ON r.scheduleId =
                        s.scheduleId

                    LEFT JOIN activities a

                        ON s.activityId =
                        a.activityId

                    LEFT JOIN coaches c2

                        ON s.coachId =
                        c2.coachId

                    WHERE

                        r.clientId = ?

                    ORDER BY

                        r.reservationDate DESC,

                        s.startTime DESC

                `, [

                    req.params.clientId

                ]);


            res.json(
                reservations
            );

        }

        catch (
        error
        ) {

            res.status(
                500
            )
                .json({

                    message:
                        error.message

                });

        }

    };


// ====================================================
// RESERVACIONES POR COACH
// ====================================================

const getReservationsByCoach =
    async (
        req,
        res
    ) => {

        try {

            await initializeCoachReservationsTable();


            const coach =
                await resolveCoachFromRequest(
                    req
                );


            const reservations =
                await all(`

                    SELECT

                        cr.reservationId,

                        cr.coachId,

                        cr.scheduleId,

                        cr.reservationDate,

                        cr.status,

                        cr.createdAt,

                        cr.updatedAt,

                        s.startTime,

                        s.duration,

                        s.capacity,

                        s.coachId
                            AS teachingCoachId,

                        a.name
                            AS activityName,

                        a.icon
                            AS activityIcon,

                        a.color
                            AS activityColor

                    FROM coach_reservations cr

                    INNER JOIN schedules s

                        ON cr.scheduleId =
                        s.scheduleId

                    LEFT JOIN activities a

                        ON s.activityId =
                        a.activityId

                    WHERE

                        cr.coachId = ?

                    ORDER BY

                        cr.reservationDate DESC,

                        s.startTime DESC

                `, [

                    coach.coachId

                ]);


            res.json(
                reservations
            );

        }

        catch (
        error
        ) {

            console.error(
                "getReservationsByCoach:",
                error
            );


            res.status(
                500
            )
                .json({

                    message:
                        error.message

                });

        }

    };


// ====================================================
// DISPONIBILIDAD CLIENTA
// ====================================================

const getAvailability =
    async (
        req,
        res
    ) => {

        const {

            clientId,

            scheduleId,

            from,

            to

        } =
            req.query;


        if (

            !clientId
            ||
            !scheduleId
            ||
            !from
            ||
            !to

        ) {

            return res.status(
                400
            )
                .json({

                    message:
                        "clientId, scheduleId, from y to son requeridos."

                });

        }


        try {

            const schedule =
                await get(`

                    SELECT *

                    FROM schedules

                    WHERE

                        scheduleId = ?

                        AND isActive = 1

                    LIMIT 1

                `, [

                    scheduleId

                ]);


            if (
                !schedule
            ) {

                return res.status(
                    404
                )
                    .json({

                        message:
                            "Horario no encontrado."

                    });

            }


            const client =
                await get(`

                    SELECT *

                    FROM clients

                    WHERE

                        clientId = ?

                        AND isActive = 1

                    LIMIT 1

                `, [

                    clientId

                ]);


            if (
                !client
            ) {

                return res.status(
                    404
                )
                    .json({

                        message:
                            "Cliente no encontrado."

                    });

            }


            const clientReservations =
                await all(`

                    SELECT

                        reservationDate,

                        COUNT(*) AS occupied

                    FROM reservations

                    WHERE

                        scheduleId = ?

                        AND reservationDate
                            BETWEEN ?
                            AND ?

                        AND status = 'CONFIRMED'

                    GROUP BY
                        reservationDate

                `, [

                    scheduleId,

                    from,

                    to

                ]);


            const coachReservations =
                await all(`

                    SELECT

                        reservationDate,

                        COUNT(*) AS occupied

                    FROM coach_reservations

                    WHERE

                        scheduleId = ?

                        AND reservationDate
                            BETWEEN ?
                            AND ?

                        AND status = 'CONFIRMED'

                    GROUP BY
                        reservationDate

                `, [

                    scheduleId,

                    from,

                    to

                ]);


            const occupiedByDate =
                {};


            clientReservations.forEach(
                item => {

                    occupiedByDate[
                        item.reservationDate
                    ] =
                        Number(
                            item.occupied
                        );

                }
            );


            coachReservations.forEach(
                item => {

                    occupiedByDate[
                        item.reservationDate
                    ] =
                        (
                            occupiedByDate[
                            item.reservationDate
                            ]
                            ||
                            0
                        )
                        +
                        Number(
                            item.occupied
                        );

                }
            );


            const dates =
                {};


            const start =
                new Date(
                    `${from}T12:00:00`
                );


            const end =
                new Date(
                    `${to}T12:00:00`
                );


            for (

                let date =
                    new Date(
                        start
                    );

                date <= end;

                date.setDate(
                    date.getDate() + 1
                )

            ) {

                const dateKey =
                    date
                        .toISOString()
                        .slice(
                            0,
                            10
                        );


                const weekday =
                    date
                        .toLocaleDateString(
                            "en-US",
                            {
                                weekday:
                                    "long"
                            }
                        );


                const occupied =
                    occupiedByDate[
                    dateKey
                    ]
                    ||
                    0;


                const capacity =
                    Number(
                        schedule.capacity
                    )
                    ||
                    0;


                const remaining =
                    Math.max(
                        0,
                        capacity - occupied
                    );


                let eligible =

                    String(
                        schedule.weekday || ""
                    )
                        .toLowerCase()

                    ===

                    String(
                        weekday
                    )
                        .toLowerCase()

                    &&

                    remaining > 0;


                if (

                    client.remainingClasses !==
                    null

                    &&

                    client.remainingClasses !==
                    undefined

                ) {

                    const remainingClasses =
                        Number(
                            client.remainingClasses
                        );


                    if (

                        Number.isFinite(
                            remainingClasses
                        )

                        &&

                        remainingClasses <= 0

                    ) {

                        eligible =
                            false;

                    }

                }


                const existing =
                    await get(`

                        SELECT

                            reservationId

                        FROM reservations

                        WHERE

                            clientId = ?

                            AND scheduleId = ?

                            AND reservationDate = ?

                            AND status = 'CONFIRMED'

                        LIMIT 1

                    `, [

                        clientId,

                        scheduleId,

                        dateKey

                    ]);


                if (
                    existing
                ) {

                    eligible =
                        false;

                }


                dates[
                    dateKey
                ] = {

                    eligible,

                    occupied,

                    remaining,

                    capacity

                };

            }


            res.json({

                scheduleId,

                dates

            });

        }

        catch (
        error
        ) {

            res.status(
                500
            )
                .json({

                    message:
                        error.message

                });

        }

    };


// ====================================================
// DISPONIBILIDAD COACH
//
// EL COACH PUEDE VER LAS CLASES DISPONIBLES,
// EXCEPTO LAS CLASES QUE ÉL MISMO IMPARTE.
// ====================================================

const getCoachAvailability =
    async (
        req,
        res
    ) => {

        const {

            scheduleId,

            from,

            to

        } =
            req.query;


        if (

            !scheduleId
            ||
            !from
            ||
            !to

        ) {

            return res.status(
                400
            )
                .json({

                    message:
                        "scheduleId, from y to son requeridos."

                });

        }


        try {

            await initializeCoachReservationsTable();


            const coach =
                await resolveCoachFromRequest(
                    req
                );


            const schedule =
                await get(`

                    SELECT *

                    FROM schedules

                    WHERE

                        scheduleId = ?

                        AND isActive = 1

                    LIMIT 1

                `, [

                    scheduleId

                ]);


            if (
                !schedule
            ) {

                return res.status(
                    404
                )
                    .json({

                        message:
                            "Horario no encontrado o inactivo."

                    });

            }


            // =================================================
            // NO PERMITIR SU PROPIA CLASE
            // =================================================

            const isOwnClass =

                schedule.coachId

                &&

                String(
                    schedule.coachId
                )
                ===
                String(
                    coach.coachId
                );


            const clientReservations =
                await all(`

                    SELECT

                        reservationDate,

                        COUNT(*) AS occupied

                    FROM reservations

                    WHERE

                        scheduleId = ?

                        AND reservationDate
                            BETWEEN ?
                            AND ?

                        AND status = 'CONFIRMED'

                    GROUP BY
                        reservationDate

                `, [

                    scheduleId,

                    from,

                    to

                ]);


            const coachReservations =
                await all(`

                    SELECT

                        reservationDate,

                        COUNT(*) AS occupied

                    FROM coach_reservations

                    WHERE

                        scheduleId = ?

                        AND reservationDate
                            BETWEEN ?
                            AND ?

                        AND status = 'CONFIRMED'

                    GROUP BY
                        reservationDate

                `, [

                    scheduleId,

                    from,

                    to

                ]);


            const occupiedByDate =
                {};


            clientReservations.forEach(
                item => {

                    occupiedByDate[
                        item.reservationDate
                    ] =
                        Number(
                            item.occupied
                        );

                }
            );


            coachReservations.forEach(
                item => {

                    occupiedByDate[
                        item.reservationDate
                    ] =
                        (
                            occupiedByDate[
                            item.reservationDate
                            ]
                            ||
                            0
                        )
                        +
                        Number(
                            item.occupied
                        );

                }
            );


            const dates =
                {};


            const start =
                new Date(
                    `${from}T12:00:00`
                );


            const end =
                new Date(
                    `${to}T12:00:00`
                );


            for (

                let date =
                    new Date(
                        start
                    );

                date <= end;

                date.setDate(
                    date.getDate() + 1
                )

            ) {

                const dateKey =
                    date
                        .toISOString()
                        .slice(
                            0,
                            10
                        );


                const weekday =
                    date
                        .toLocaleDateString(
                            "en-US",
                            {
                                weekday:
                                    "long"
                            }
                        );


                const occupied =
                    occupiedByDate[
                    dateKey
                    ]
                    ||
                    0;


                const capacity =
                    Number(
                        schedule.capacity
                    )
                    ||
                    0;


                const remaining =
                    Math.max(
                        0,
                        capacity - occupied
                    );


                let eligible =

                    !isOwnClass

                    &&

                    String(
                        schedule.weekday || ""
                    )
                        .toLowerCase()

                    ===

                    String(
                        weekday
                    )
                        .toLowerCase()

                    &&

                    remaining > 0;


                const existing =
                    await get(`

                        SELECT

                            reservationId

                        FROM coach_reservations

                        WHERE

                            coachId = ?

                            AND scheduleId = ?

                            AND reservationDate = ?

                            AND status = 'CONFIRMED'

                        LIMIT 1

                    `, [

                        coach.coachId,

                        scheduleId,

                        dateKey

                    ]);


                if (
                    existing
                ) {

                    eligible =
                        false;

                }


                dates[
                    dateKey
                ] = {

                    eligible,

                    occupied,

                    remaining,

                    capacity

                };

            }


            res.json({

                scheduleId,

                coachId:
                    coach.coachId,

                ownClass:
                    isOwnClass,

                dates

            });

        }

        catch (
        error
        ) {

            console.error(
                "getCoachAvailability:",
                error
            );


            res.status(
                500
            )
                .json({

                    message:
                        error.message

                });

        }

    };


// ====================================================
// CREAR RESERVACIÓN CLIENTA
// ====================================================

const createReservation =
    async (
        req,
        res
    ) => {

        const {

            clientId,

            scheduleId,

            reservationDate,

            clientMembershipId = null

        } =
            req.body;


        if (

            !clientId
            ||
            !scheduleId
            ||
            !reservationDate

        ) {

            return res.status(
                400
            )
                .json({

                    message:
                        "clientId, scheduleId y reservationDate son requeridos."

                });

        }


        try {

            const validation =
                await validateReservation(

                    clientId,

                    scheduleId,

                    reservationDate

                );


            if (
                !validation.valid
            ) {

                return res.status(
                    400
                )
                    .json({

                        message:
                            validation.message

                    });

            }


            const reservationId =
                await generateReservationId();


            const now =
                new Date()
                    .toISOString();


            await run(`

                INSERT INTO reservations (

                    reservationId,

                    clientId,

                    clientMembershipId,

                    scheduleId,

                    reservationDate,

                    status,

                    createdAt,

                    updatedAt

                )

                VALUES (

                    ?,

                    ?,

                    ?,

                    ?,

                    ?,

                    'CONFIRMED',

                    ?,

                    ?

                )

            `, [

                reservationId,

                clientId,

                clientMembershipId,

                scheduleId,

                reservationDate,

                now,

                now

            ]);


            res.status(
                201
            )
                .json({

                    message:
                        "Reservación creada correctamente.",

                    reservationId

                });

        }

        catch (
        error
        ) {

            res.status(
                500
            )
                .json({

                    message:
                        error.message

                });

        }

    };


// ====================================================
// RESERVACIONES CLIENTA EN LOTE
// ====================================================

const createReservationsBatch =
    async (
        req,
        res
    ) => {

        const {

            clientId,

            scheduleId,

            reservationDates,

            clientMembershipId = null

        } =
            req.body;


        if (

            !clientId
            ||
            !scheduleId
            ||
            !Array.isArray(
                reservationDates
            )
            ||
            !reservationDates.length

        ) {

            return res.status(
                400
            )
                .json({

                    message:
                        "Datos de reservación inválidos."

                });

        }


        try {

            const client =
                await get(`

                    SELECT *

                    FROM clients

                    WHERE

                        clientId = ?

                        AND isActive = 1

                    LIMIT 1

                `, [

                    clientId

                ]);


            if (
                !client
            ) {

                return res.status(
                    404
                )
                    .json({

                        message:
                            "Cliente no encontrado."

                    });

            }


            if (

                client.remainingClasses !==
                null

                &&

                client.remainingClasses !==
                undefined

            ) {

                const available =
                    Number(
                        client.remainingClasses
                    );


                if (

                    Number.isFinite(
                        available
                    )

                    &&

                    reservationDates.length >
                    available

                ) {

                    return res.status(
                        400
                    )
                        .json({

                            message:
                                `La membresía solo tiene ${available} clases disponibles.`

                        });

                }

            }


            const invalidDates =
                [];


            for (
                const reservationDate
                of reservationDates
            ) {

                const validation =
                    await validateReservation(

                        clientId,

                        scheduleId,

                        reservationDate

                    );


                if (
                    !validation.valid
                ) {

                    invalidDates.push({

                        date:
                            reservationDate,

                        message:
                            validation.message

                    });

                }

            }


            if (
                invalidDates.length
            ) {

                return res.status(
                    400
                )
                    .json({

                        message:
                            "Algunas fechas ya no están disponibles.",

                        invalidDates

                    });

            }


            const uniqueDates =
                [
                    ...new Set(
                        reservationDates
                    )
                ];


            if (
                uniqueDates.length !==
                reservationDates.length
            ) {

                return res.status(
                    400
                )
                    .json({

                        message:
                            "No se puede repetir una fecha dentro del mismo lote."

                    });

            }


            const now =
                new Date()
                    .toISOString();


            const created =
                [];


            await run(
                "BEGIN IMMEDIATE"
            );


            try {

                for (
                    const reservationDate
                    of uniqueDates
                ) {

                    const reservationId =
                        await generateReservationId();


                    await run(`

                        INSERT INTO reservations (

                            reservationId,

                            clientId,

                            clientMembershipId,

                            scheduleId,

                            reservationDate,

                            status,

                            createdAt,

                            updatedAt

                        )

                        VALUES (

                            ?,

                            ?,

                            ?,

                            ?,

                            ?,

                            'CONFIRMED',

                            ?,

                            ?

                        )

                    `, [

                        reservationId,

                        clientId,

                        clientMembershipId,

                        scheduleId,

                        reservationDate,

                        now,

                        now

                    ]);


                    created.push({

                        reservationId,

                        reservationDate

                    });

                }


                // =========================================
                // DESCONTAR CLASES
                // =========================================

                if (

                    client.remainingClasses !==
                    null

                    &&

                    client.remainingClasses !==
                    undefined

                ) {

                    const newRemaining =
                        Number(
                            client.remainingClasses
                        )
                        -
                        uniqueDates.length;


                    await run(`

                        UPDATE clients

                        SET

                            remainingClasses = ?

                        WHERE

                            clientId = ?

                    `, [

                        newRemaining,

                        clientId

                    ]);

                }


                await run(
                    "COMMIT"
                );

            }

            catch (
            transactionError
            ) {

                await run(
                    "ROLLBACK"
                );

                throw transactionError;

            }


            res.status(
                201
            )
                .json({

                    message:
                        "Reservaciones confirmadas correctamente.",

                    reservations:
                        created

                });

        }

        catch (
        error
        ) {

            res.status(
                500
            )
                .json({

                    message:
                        error.message

                });

        }

    };


// ====================================================
// RESERVACIONES COACH EN LOTE
//
// EL coachId SIEMPRE VIENE DE LA SESIÓN.
// ====================================================

const createCoachReservationsBatch =
    async (
        req,
        res
    ) => {

        const {

            scheduleId,

            reservationDates

        } =
            req.body;


        if (

            !scheduleId
            ||
            !Array.isArray(
                reservationDates
            )
            ||
            !reservationDates.length

        ) {

            return res.status(
                400
            )
                .json({

                    message:
                        "Horario y al menos una fecha son requeridos."

                });

        }


        try {

            await initializeCoachReservationsTable();


            // =================================================
            // SEGURIDAD: SOLO COACHES PUEDEN USAR ESTE ENDPOINT
            // =================================================

            const requestRole =
                String(
                    req.user?.role || ""
                )
                    .trim()
                    .toLowerCase();


            if (
                requestRole !== "coach"
                &&
                req.user?.isRoot !== true
                &&
                Number(
                    req.user?.isRoot
                ) !== 1
            ) {

                return res.status(
                    403
                )
                    .json({

                        message:
                            "Esta operación solo está disponible para coaches."

                    });

            }


            const coach =
                await resolveCoachFromRequest(
                    req
                );


            // =================================================
            // SEGURIDAD: VALIDAR DIRECTAMENTE EL HORARIO
            // ANTES DE PROCESAR EL LOTE
            // =================================================

            const requestedSchedule =
                await get(`

                    SELECT

                        scheduleId,

                        coachId,

                        activityId,

                        isActive

                    FROM schedules

                    WHERE

                        scheduleId = ?

                    LIMIT 1

                `, [

                    scheduleId

                ]);


            if (
                !requestedSchedule
                ||
                Number(
                    requestedSchedule.isActive
                ) !== 1
            ) {

                return res.status(
                    404
                )
                    .json({

                        message:
                            "Horario no encontrado o inactivo."

                    });

            }


            if (
                requestedSchedule.coachId
                &&
                String(
                    requestedSchedule.coachId
                )
                ===
                String(
                    coach.coachId
                )
            ) {

                return res.status(
                    403
                )
                    .json({

                        message:
                            "No puedes reservar una clase que tú impartes."

                    });

            }


            const uniqueDates =
                [
                    ...new Set(
                        reservationDates
                    )
                ];


            if (
                uniqueDates.length !==
                reservationDates.length
            ) {

                return res.status(
                    400
                )
                    .json({

                        message:
                            "No se puede repetir una fecha dentro del mismo lote."

                    });

            }


            const invalidDates =
                [];


            for (
                const reservationDate
                of uniqueDates
            ) {

                const validation =
                    await validateCoachReservation(

                        coach.coachId,

                        scheduleId,

                        reservationDate

                    );


                if (
                    !validation.valid
                ) {

                    invalidDates.push({

                        date:
                            reservationDate,

                        message:
                            validation.message

                    });

                }

            }


            if (
                invalidDates.length
            ) {

                return res.status(
                    409
                )
                    .json({

                        message:
                            "Una o más fechas ya no están disponibles.",

                        invalidDates

                    });

            }


            const created =
                [];


            const now =
                new Date()
                    .toISOString();


            await run(
                "BEGIN IMMEDIATE"
            );


            try {

                for (
                    const reservationDate
                    of uniqueDates
                ) {

                    const validation =
                        await validateCoachReservation(

                            coach.coachId,

                            scheduleId,

                            reservationDate

                        );


                    if (
                        !validation.valid
                    ) {

                        const validationError =
                            new Error(
                                validation.message
                            );


                        validationError.status =
                            409;


                        throw validationError;

                    }


                    const reservationId =
                        await generateReservationId();


                    await run(`

                        INSERT INTO coach_reservations (

                            reservationId,

                            coachId,

                            scheduleId,

                            reservationDate,

                            status,

                            createdAt,

                            updatedAt

                        )

                        VALUES (

                            ?,

                            ?,

                            ?,

                            ?,

                            'CONFIRMED',

                            ?,

                            ?

                        )

                    `, [

                        reservationId,

                        coach.coachId,

                        scheduleId,

                        reservationDate,

                        now,

                        now

                    ]);


                    created.push({

                        reservationId,

                        reservationDate

                    });

                }


                await run(
                    "COMMIT"
                );

            }

            catch (
            transactionError
            ) {

                await run(
                    "ROLLBACK"
                );

                throw transactionError;

            }


            res.status(
                201
            )
                .json({

                    message:
                        "Reservaciones confirmadas correctamente.",

                    reservations:
                        created,

                    coachId:
                        coach.coachId

                });

        }

        catch (
        error
        ) {

            res.status(
                error.status ||
                500
            )
                .json({

                    message:
                        error.message

                });

        }

    };


// ====================================================
// CANCELAR RESERVACIÓN
// ====================================================

const cancelReservation =
    async (
        req,
        res
    ) => {

        const {

            reservationId

        } =
            req.params;


        try {

            await initializeCoachReservationsTable();


            // =================================================
            // CLIENTA
            // =================================================

            const clientReservation =
                await get(`

                    SELECT

                        r.*,

                        s.startTime,

                        s.duration

                    FROM reservations r

                    INNER JOIN schedules s

                        ON r.scheduleId =
                        s.scheduleId

                    WHERE

                        r.reservationId = ?

                    LIMIT 1

                `, [

                    reservationId

                ]);


            if (
                clientReservation
            ) {

                if (
                    clientReservation.status !==
                    "CONFIRMED"
                ) {

                    return res.status(
                        400
                    )
                        .json({

                            message:
                                "Esta reservación ya no puede cancelarse."

                        });

                }


                if (
                    !canCancelReservation(

                        clientReservation.reservationDate,

                        clientReservation.startTime

                    )
                ) {

                    return res.status(
                        400
                    )
                        .json({

                            message:
                                "La reservación ya no puede cancelarse. Deben faltar al menos 3 horas para el inicio de la clase."

                        });

                }


                await run(
                    "BEGIN IMMEDIATE"
                );


                try {

                    const now =
                        new Date()
                            .toISOString();


                    await run(`

                        UPDATE reservations

                        SET

                            status = 'CANCELLED',

                            updatedAt = ?

                        WHERE

                            reservationId = ?

                            AND status = 'CONFIRMED'

                    `, [

                        now,

                        reservationId

                    ]);


                    const client =
                        await get(`

                            SELECT

                                remainingClasses

                            FROM clients

                            WHERE

                                clientId = ?

                        `, [

                            clientReservation.clientId

                        ]);


                    if (

                        client

                        &&

                        client.remainingClasses !==
                        null

                        &&

                        client.remainingClasses !==
                        undefined

                    ) {

                        await run(`

                            UPDATE clients

                            SET

                                remainingClasses =
                                remainingClasses + 1

                            WHERE

                                clientId = ?

                        `, [

                            clientReservation.clientId

                        ]);

                    }


                    await run(
                        "COMMIT"
                    );

                }

                catch (
                transactionError
                ) {

                    await run(
                        "ROLLBACK"
                    );

                    throw transactionError;

                }


                return res.json({

                    message:
                        "Reservación cancelada correctamente. La clase fue devuelta a la membresía.",

                    reservationId

                });

            }


            // =================================================
            // COACH
            // =================================================

            const coachReservation =
                await get(`

                    SELECT

                        cr.*,

                        s.startTime,

                        s.duration

                    FROM coach_reservations cr

                    INNER JOIN schedules s

                        ON cr.scheduleId =
                        s.scheduleId

                    WHERE

                        cr.reservationId = ?

                    LIMIT 1

                `, [

                    reservationId

                ]);


            if (
                !coachReservation
            ) {

                return res.status(
                    404
                )
                    .json({

                        message:
                            "Reservación no encontrada."

                    });

            }


            const coach =
                await resolveCoachFromRequest(
                    req
                );


            if (

                String(
                    coachReservation.coachId
                )

                !==

                String(
                    coach.coachId
                )

            ) {

                return res.status(
                    403
                )
                    .json({

                        message:
                            "No tienes permiso para cancelar esta reservación."

                    });

            }


            if (
                coachReservation.status !==
                "CONFIRMED"
            ) {

                return res.status(
                    400
                )
                    .json({

                        message:
                            "Esta reservación ya no puede cancelarse."

                    });

            }


            if (
                !canCancelReservation(

                    coachReservation.reservationDate,

                    coachReservation.startTime

                )
            ) {

                return res.status(
                    400
                )
                    .json({

                        message:
                            "La reservación ya no puede cancelarse. Deben faltar al menos 3 horas para el inicio de la clase."

                    });

            }


            await run(`

                UPDATE coach_reservations

                SET

                    status = 'CANCELLED',

                    updatedAt = ?

                WHERE

                    reservationId = ?

                    AND coachId = ?

                    AND status = 'CONFIRMED'

            `, [

                new Date()
                    .toISOString(),

                reservationId,

                coach.coachId

            ]);


            return res.json({

                message:
                    "Reservación cancelada correctamente.",

                reservationId

            });

        }

        catch (
        error
        ) {

            console.error(
                "cancelReservation:",
                error
            );


            res.status(
                500
            )
                .json({

                    message:
                        error.message

                });

        }

    };


// ====================================================
// RESERVACIONES RECIENTES
// ====================================================

const getRecentReservations =
    async (
        req,
        res
    ) => {

        try {

            await initializeCoachReservationsTable();


            const reservations =
                await all(`

                    SELECT *

                    FROM (

                        SELECT

                            r.reservationId,

                            r.clientId,

                            NULL AS coachId,

                            r.scheduleId,

                            r.reservationDate,

                            r.status,

                            r.createdAt,

                            s.startTime,

                            s.duration,

                            a.name
                                AS activityName,

                            a.icon
                                AS activityIcon,

                            a.color
                                AS activityColor,

                            c.fullName,

                            'client'
                                AS reservationType

                        FROM reservations r

                        INNER JOIN clients c

                            ON r.clientId =
                            c.clientId

                        INNER JOIN schedules s

                            ON r.scheduleId =
                            s.scheduleId

                        LEFT JOIN activities a

                            ON s.activityId =
                            a.activityId

                        UNION ALL

                        SELECT

                            cr.reservationId,

                            NULL AS clientId,

                            cr.coachId,

                            cr.scheduleId,

                            cr.reservationDate,

                            cr.status,

                            cr.createdAt,

                            s.startTime,

                            s.duration,

                            a.name
                                AS activityName,

                            a.icon
                                AS activityIcon,

                            a.color
                                AS activityColor,

                            co.fullName,

                            'coach'
                                AS reservationType

                        FROM coach_reservations cr

                        INNER JOIN coaches co

                            ON cr.coachId =
                            co.coachId

                        INNER JOIN schedules s

                            ON cr.scheduleId =
                            s.scheduleId

                        LEFT JOIN activities a

                            ON s.activityId =
                            a.activityId

                    )

                    ORDER BY

                        createdAt DESC

                    LIMIT 10

                `);


            res.json(
                reservations
            );

        }

        catch (
        error
        ) {

            res.status(
                500
            )
                .json({

                    message:
                        error.message

                });

        }

    };


// ====================================================
// PRÓXIMAS CLASES
// ====================================================

const getUpcomingClasses =
    async (
        req,
        res
    ) => {

        try {

            await initializeCoachReservationsTable();


            const today =
                localDateKey();


            const classes =
                await all(`

                    SELECT *

                    FROM (

                        SELECT

                            r.reservationId,

                            r.clientId,

                            NULL AS coachId,

                            r.reservationDate,

                            r.status,

                            c.fullName,

                            s.scheduleId,

                            s.startTime,

                            s.duration,

                            a.name
                                AS activityName,

                            a.icon
                                AS activityIcon,

                            a.color
                                AS activityColor,

                            'client'
                                AS reservationType

                        FROM reservations r

                        INNER JOIN clients c

                            ON r.clientId =
                            c.clientId

                        INNER JOIN schedules s

                            ON r.scheduleId =
                            s.scheduleId

                        LEFT JOIN activities a

                            ON s.activityId =
                            a.activityId

                        WHERE

                            r.reservationDate >= ?

                            AND r.status =
                            'CONFIRMED'

                        UNION ALL

                        SELECT

                            cr.reservationId,

                            NULL AS clientId,

                            cr.coachId,

                            cr.reservationDate,

                            cr.status,

                            co.fullName,

                            s.scheduleId,

                            s.startTime,

                            s.duration,

                            a.name
                                AS activityName,

                            a.icon
                                AS activityIcon,

                            a.color
                                AS activityColor,

                            'coach'
                                AS reservationType

                        FROM coach_reservations cr

                        INNER JOIN coaches co

                            ON cr.coachId =
                            co.coachId

                        INNER JOIN schedules s

                            ON cr.scheduleId =
                            s.scheduleId

                        LEFT JOIN activities a

                            ON s.activityId =
                            a.activityId

                        WHERE

                            cr.reservationDate >= ?

                            AND cr.status =
                            'CONFIRMED'

                    )

                    ORDER BY

                        reservationDate ASC,

                        startTime ASC

                    LIMIT 20

                `, [

                    today,

                    today

                ]);


            res.json(
                classes
            );

        }

        catch (
        error
        ) {

            res.status(
                500
            )
                .json({

                    message:
                        error.message

                });

        }

    };


// ====================================================
// OCUPACIÓN POR CLASE
// ====================================================

const getClassOccupancy =
    async (
        req,
        res
    ) => {

        try {

            await initializeCoachReservationsTable();


            const {

                from,

                to

            } =
                req.query;


            let clientWhere =
                `WHERE r.status = 'CONFIRMED'`;


            let coachWhere =
                `WHERE cr.status = 'CONFIRMED'`;


            const clientParams =
                [];


            const coachParams =
                [];


            if (
                from
            ) {

                clientWhere +=
                    ` AND r.reservationDate >= ?`;


                clientParams.push(
                    from
                );


                coachWhere +=
                    ` AND cr.reservationDate >= ?`;


                coachParams.push(
                    from
                );

            }


            if (
                to
            ) {

                clientWhere +=
                    ` AND r.reservationDate <= ?`;


                clientParams.push(
                    to
                );


                coachWhere +=
                    ` AND cr.reservationDate <= ?`;


                coachParams.push(
                    to
                );

            }


            const rows =
                await all(`

                    SELECT

                        scheduleId,

                        reservationDate,

                        COUNT(*) AS occupied

                    FROM (

                        SELECT

                            r.scheduleId,

                            r.reservationDate

                        FROM reservations r

                        ${clientWhere}

                        UNION ALL

                        SELECT

                            cr.scheduleId,

                            cr.reservationDate

                        FROM coach_reservations cr

                        ${coachWhere}

                    )

                    GROUP BY

                        scheduleId,

                        reservationDate

                    ORDER BY

                        reservationDate ASC

                `, [

                    ...clientParams,

                    ...coachParams

                ]);


            const result =
                [];


            for (
                const row
                of rows
            ) {

                const schedule =
                    await get(`

                        SELECT

                            s.capacity,

                            s.startTime,

                            s.duration,

                            a.name
                                AS activityName,

                            a.color
                                AS activityColor

                        FROM schedules s

                        LEFT JOIN activities a

                            ON s.activityId =
                            a.activityId

                        WHERE

                            s.scheduleId = ?

                        LIMIT 1

                    `, [

                        row.scheduleId

                    ]);


                if (
                    !schedule
                ) {

                    continue;

                }


                const occupied =
                    Number(
                        row.occupied
                    )
                    ||
                    0;


                const capacity =
                    Number(
                        schedule.capacity
                    )
                    ||
                    0;


                result.push({

                    scheduleId:
                        row.scheduleId,

                    reservationDate:
                        row.reservationDate,

                    occupied,

                    capacity,

                    remaining:
                        Math.max(
                            0,
                            capacity -
                            occupied
                        ),

                    startTime:
                        schedule.startTime,

                    duration:
                        schedule.duration,

                    activityName:
                        schedule.activityName,

                    activityColor:
                        schedule.activityColor,

                    occupancy:

                        capacity > 0

                            ?

                            Number(

                                (
                                    occupied /
                                    capacity
                                )
                                *
                                100

                            ).toFixed(1)

                            :

                            0

                });

            }


            res.json(
                result
            );

        }

        catch (
        error
        ) {

            res.status(
                500
            )
                .json({

                    message:
                        error.message

                });

        }

    };


// ====================================================
// EXPORTS
// ====================================================

module.exports = {

    getAllReservations,

    getReservationById,

    getReservationsByClient,

    getReservationsByCoach,

    getAvailability,

    getCoachAvailability,

    createReservation,

    createReservationsBatch,

    createCoachReservationsBatch,

    cancelReservation,

    getRecentReservations,

    getUpcomingClasses,

    getClassOccupancy

};