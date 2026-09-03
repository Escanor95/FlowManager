/*
====================================================

    FLOWMANAGER

    ATTENDANCE CONTROLLER

====================================================
*/

const db =
    require("../config/database");


// ====================================================
// SQLITE HELPERS
// ====================================================

const get = (
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


const all = (
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


const run = (
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
// GENERAR ID
// ====================================================

function generateAttendanceId(
    callback
) {

    db.get(

        `
        SELECT

            attendanceId

        FROM attendances

        ORDER BY id DESC

        LIMIT 1
        `,

        [],

        (
            error,
            row
        ) => {

            if (error) {

                return callback(
                    error
                );

            }


            const next =

                row

                    ?

                    parseInt(

                        String(
                            row.attendanceId
                        )
                            .replace(
                                "AT-",
                                ""
                            ),

                        10

                    ) + 1

                    :

                    1;


            callback(

                null,

                `AT-${String(
                    next
                ).padStart(
                    4,
                    "0"
                )}`

            );

        }

    );

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

    if (
        !time
    ) {

        return null;

    }


    const [

        hours,
        minutes

    ] =
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
            hours
        )

        ||

        !Number.isFinite(
            minutes
        )

    ) {

        return null;

    }


    return (

        hours * 60

        +

        minutes

    );

}


// ====================================================
// MINUTOS ACTUALES
// ====================================================

function currentMinutes() {

    const now = new Date();

    const mexicoTime =
        new Intl.DateTimeFormat(
            "en-US",
            {
                timeZone: "America/Mexico_City",
                hour: "2-digit",
                minute: "2-digit",
                hour12: false
            }
        ).formatToParts(now);

    const hour =
        Number(
            mexicoTime.find(
                part => part.type === "hour"
            ).value
        );

    const minute =
        Number(
            mexicoTime.find(
                part => part.type === "minute"
            ).value
        );

    return (
        hour * 60
        +
        minute
    );

}

// ====================================================
// OBTENER COACH ID
//
// Primero utiliza el JWT.
// Como respaldo, si el usuario coach todavía no tiene
// coachId en el token, intenta resolverlo por correo.
//
// Esto permite que el sistema sea más tolerante mientras
// se termina de sincronizar la cuenta.
// ====================================================

async function resolveRequestCoachId(
    req
) {

    const role =
        String(
            req.user?.role || ""
        )
            .trim()
            .toLowerCase();


    if (
        role !== "coach"
    ) {

        return null;

    }


    if (
        req.user?.coachId
    ) {

        return req.user.coachId;

    }


    if (
        req.user?.email
    ) {

        const coach =
            await get(

                `
                SELECT

                    coachId

                FROM coaches

                WHERE

                    LOWER(email) = LOWER(?)

                    AND isActive = 1

                LIMIT 1
                `,

                [

                    req.user.email

                ]

            );


        if (
            coach
        ) {

            return coach.coachId;

        }

    }


    return null;

}


// ====================================================
// TRANSACTION
// ====================================================

async function withTransaction(
    work
) {

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

    catch (
    error
    ) {

        try {

            await run(
                "ROLLBACK"
            );

        }

        catch (
        rollbackError
        ) {

            console.error(

                "Attendance rollback error:",

                rollbackError.message

            );

        }


        throw error;

    }

}


// ====================================================
// REGISTRAR ASISTENCIA
// ====================================================
//
// MANAGER / RECEPCIÓN:
// Puede registrar sobre cualquier clase válida.
//
// COACH:
// Solo puede registrar asistencia de una clienta que
// tenga reservación en una clase asignada a ese coach.
//
// La clase se descuenta al confirmar la reservación.
// Aquí solamente se registra la asistencia.
// ====================================================

const registerAttendance =
    async (
        req,
        res
    ) => {

        const {
            clientId
        } =
            req.body;


        if (
            !clientId
        ) {

            return res.status(
                400
            )
                .json({

                    message:
                        "ClientId requerido."

                });

        }


        try {

            const requestRole =
                String(
                    req.user?.role || ""
                )
                    .trim()
                    .toLowerCase();


            const requestCoachId =
                await resolveRequestCoachId(
                    req
                );


            // =================================================
            // SI ES COACH Y NO TIENE COACH ID
            // =================================================

            if (

                requestRole === "coach"

                &&

                !requestCoachId

            ) {

                return res.status(
                    403
                )
                    .json({

                        message:
                            "La cuenta de coach todavía no está vinculada correctamente."

                    });

            }


            // =================================================
            // CLIENTA
            // =================================================

            const client =
                await get(

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

                );


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


            const reservationDate =
                localDateKey();


            // =================================================
            // RESERVACIONES DE HOY
            //
            // PARA COACH:
            //
            // SOLO SUS CLASES.
            // =================================================

            let reservationSql = `

                SELECT

                    r.reservationId,

                    r.clientId,

                    r.clientMembershipId,

                    r.scheduleId,

                    r.reservationDate,

                    r.status,

                    s.startTime,

                    s.duration,

                    s.coachId,

                    a.name
                        AS activityName,

                    a.icon
                        AS activityIcon,

                    a.color
                        AS activityColor

                FROM reservations r

                INNER JOIN schedules s

                    ON r.scheduleId =
                    s.scheduleId

                LEFT JOIN activities a

                    ON s.activityId =
                    a.activityId

                WHERE

                    r.clientId = ?

                    AND r.reservationDate = ?

                    AND r.status = 'CONFIRMED'
            `;


            const reservationParams = [

                clientId,

                reservationDate

            ];


            if (
                requestRole === "coach"
            ) {

                reservationSql += `

                    AND s.coachId = ?

                `;


                reservationParams.push(
                    requestCoachId
                );

            }


            reservationSql += `

                ORDER BY

                    s.startTime ASC

            `;


            const reservations =
                await all(

                    reservationSql,

                    reservationParams

                );


            if (

                !reservations

                ||

                reservations.length === 0

            ) {

                return res.status(
                    400
                )
                    .json({

                        message:

                            requestRole === "coach"

                                ?

                                "No se puede registrar la asistencia porque la clienta no tiene una reservación confirmada para una de tus clases."

                                :

                                "No se puede registrar la asistencia porque la clienta no tiene una reservación confirmada para este momento."

                    });

            }


            // =================================================
            // VENTANA DE ASISTENCIA
            //
            // 15 MIN ANTES
            // HASTA 10 MIN DESPUÉS
            // =================================================

            const nowMinutes =
                currentMinutes();


            const activeReservation =
                reservations.find(

                    reservation => {

                        const startMinutes =
                            timeToMinutes(

                                reservation.startTime

                            );


                        if (
                            startMinutes === null
                        ) {

                            return false;

                        }


                        const allowedStart =
                            startMinutes -
                            15;


                        const allowedEnd =
                            startMinutes +
                            10;


                        return (

                            nowMinutes >=
                            allowedStart

                            &&

                            nowMinutes <=
                            allowedEnd

                        );

                    }

                );


            if (
                !activeReservation
            ) {

                return res.status(
                    400
                )
                    .json({

                        message:

                            requestRole === "coach"

                                ?

                                "La clienta tiene reservación, pero en este momento no se encuentra dentro del horario permitido de una de tus clases."

                                :

                                "No se puede registrar la asistencia en este momento. Solo está disponible desde 15 minutos antes del inicio y hasta 10 minutos después de comenzar la clase."

                    });

            }


            // =================================================
            // VERIFICAR ASISTENCIA DUPLICADA
            // =================================================

            const existingAttendance =
                await get(

                    `
                    SELECT

                        attendanceId

                    FROM attendances

                    WHERE

                        reservationId = ?

                    LIMIT 1
                    `,

                    [

                        activeReservation.reservationId

                    ]

                );


            if (
                existingAttendance
            ) {

                return res.status(
                    409
                )
                    .json({

                        message:
                            "La asistencia para esta clase ya fue registrada."

                    });

            }


            // =================================================
            // MEMBRESÍA
            // =================================================

            const clientMembership =

                activeReservation.clientMembershipId

                    ?

                    await get(

                        `
                        SELECT *

                        FROM client_memberships

                        WHERE

                            clientMembershipId = ?
                        `,

                        [

                            activeReservation.clientMembershipId

                        ]

                    )

                    :

                    null;


            if (

                activeReservation.clientMembershipId

                &&

                !clientMembership

            ) {

                return res.status(
                    409
                )
                    .json({

                        message:
                            "El paquete asociado a la reservación ya no existe."

                    });

            }


            // =================================================
            // GENERAR ID
            // =================================================

            generateAttendanceId(

                async (
                    idError,
                    attendanceId
                ) => {

                    if (
                        idError
                    ) {

                        return res.status(
                            500
                        )
                            .json(
                                idError
                            );

                    }


                    try {

                        const now =
                            new Date()
                                .toISOString();


                        const remainingClasses =

                            clientMembership

                                ?

                                clientMembership.remainingClasses

                                :

                                client.remainingClasses;


                        await withTransaction(

                            async () => {

                                await run(

                                    `
                                    INSERT INTO attendances (

                                        attendanceId,

                                        clientId,

                                        membershipId,

                                        clientMembershipId,

                                        reservationId,

                                        attendanceDate,

                                        remainingClassesAfter,

                                        createdAt

                                    )

                                    VALUES (

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

                                        attendanceId,

                                        client.clientId,

                                        clientMembership

                                            ?

                                            clientMembership.membershipId

                                            :

                                            client.membershipId,

                                        activeReservation.clientMembershipId
                                        ||
                                        null,

                                        activeReservation.reservationId,

                                        now,

                                        remainingClasses,

                                        now

                                    ]

                                );

                            }

                        );


                        return res.json({

                            message:
                                "Asistencia registrada correctamente.",

                            attendanceId,

                            reservationId:
                                activeReservation.reservationId,

                            clientMembershipId:
                                activeReservation.clientMembershipId,

                            remainingClasses,

                            coachId:
                                activeReservation.coachId || null,

                            class: {

                                name:

                                    activeReservation.activityName
                                    ||
                                    "Clase",

                                icon:

                                    activeReservation.activityIcon
                                    ||
                                    "",

                                color:

                                    activeReservation.activityColor
                                    ||
                                    "",

                                startTime:

                                    activeReservation.startTime,

                                duration:

                                    activeReservation.duration

                            }

                        });

                    }

                    catch (
                    attendanceError
                    ) {

                        console.error(

                            "Attendance insert error:",

                            attendanceError

                        );


                        return res.status(
                            500
                        )
                            .json({

                                message:
                                    attendanceError.message

                            });

                    }

                }

            );

        }

        catch (
        error
        ) {

            console.error(

                "Register attendance error:",

                error

            );


            return res.status(
                500
            )
                .json({

                    message:
                        error.message

                });

        }

    };


// ====================================================
// HISTORIAL COMPLETO
//
// MANAGER / RECEPCIÓN:
// Todas las asistencias.
//
// COACH:
// Solo asistencias de sus clases.
// ====================================================

const getAttendances =
    async (
        req,
        res
    ) => {

        try {

            const requestRole =
                String(
                    req.user?.role || ""
                )
                    .trim()
                    .toLowerCase();


            const requestCoachId =
                await resolveRequestCoachId(
                    req
                );


            if (

                requestRole === "coach"

                &&

                !requestCoachId

            ) {

                return res.status(
                    403
                )
                    .json({

                        message:
                            "La cuenta de coach todavía no está vinculada correctamente."

                    });

            }


            let sql = `

                SELECT

                    a.attendanceId,

                    a.clientId,

                    a.membershipId,

                    a.clientMembershipId,

                    a.reservationId,

                    a.attendanceDate,

                    a.remainingClassesAfter,

                    a.createdAt,

                    c.fullName,

                    s.scheduleId,

                    s.coachId,

                    s.startTime,

                    s.duration,

                    act.name
                        AS activityName,

                    act.icon
                        AS activityIcon,

                    act.color
                        AS activityColor

                FROM attendances a

                INNER JOIN clients c

                    ON a.clientId =
                    c.clientId

                LEFT JOIN reservations r

                    ON a.reservationId =
                    r.reservationId

                LEFT JOIN schedules s

                    ON r.scheduleId =
                    s.scheduleId

                LEFT JOIN activities act

                    ON s.activityId =
                    act.activityId

            `;


            const params = [];


            if (
                requestRole === "coach"
            ) {

                sql += `

                    WHERE

                        s.coachId = ?

                `;


                params.push(
                    requestCoachId
                );

            }


            sql += `

                ORDER BY

                    a.attendanceDate DESC

            `;


            const rows =
                await all(
                    sql,
                    params
                );


            return res.json(
                rows
            );

        }

        catch (
        error
        ) {

            console.error(

                "Get attendances error:",

                error

            );


            return res.status(
                500
            )
                .json({

                    message:
                        error.message

                });

        }

    };


// ====================================================
// HISTORIAL POR CLIENTA
// ====================================================
//
// Se mantiene disponible para el perfil de clienta.
// El acceso de coach también se limita a sus clases.
// ====================================================

const getAttendancesByClient =
    async (
        req,
        res
    ) => {

        const {
            clientId
        } =
            req.params;


        if (
            !clientId
        ) {

            return res.status(
                400
            )
                .json({

                    message:
                        "ClientId requerido."

                });

        }


        try {

            const requestRole =
                String(
                    req.user?.role || ""
                )
                    .trim()
                    .toLowerCase();


            const requestCoachId =
                await resolveRequestCoachId(
                    req
                );


            let sql = `

                SELECT

                    a.attendanceId,

                    a.clientId,

                    a.membershipId,

                    a.clientMembershipId,

                    a.reservationId,

                    a.attendanceDate,

                    a.remainingClassesAfter,

                    a.createdAt,

                    s.scheduleId,

                    s.coachId,

                    s.startTime,

                    s.duration,

                    act.name
                        AS activityName,

                    act.icon
                        AS activityIcon,

                    act.color
                        AS activityColor

                FROM attendances a

                LEFT JOIN reservations r

                    ON a.reservationId =
                    r.reservationId

                LEFT JOIN schedules s

                    ON r.scheduleId =
                    s.scheduleId

                LEFT JOIN activities act

                    ON s.activityId =
                    act.activityId

                WHERE

                    a.clientId = ?

            `;


            const params = [

                clientId

            ];


            if (
                requestRole === "coach"
            ) {

                if (
                    !requestCoachId
                ) {

                    return res.status(
                        403
                    )
                        .json({

                            message:
                                "La cuenta de coach todavía no está vinculada correctamente."

                        });

                }


                sql += `

                    AND s.coachId = ?

                `;


                params.push(
                    requestCoachId
                );

            }


            sql += `

                ORDER BY

                    a.attendanceDate DESC

            `;


            const rows =
                await all(

                    sql,

                    params

                );


            return res.json(
                rows
            );

        }

        catch (
        error
        ) {

            console.error(

                "Get client attendances error:",

                error

            );


            return res.status(
                500
            )
                .json({

                    message:
                        error.message

                });

        }

    };


// ====================================================
// ASISTENCIAS RECIENTES
//
// MANAGER:
// Todas.
//
// COACH:
// Solo sus clases.
// ====================================================

const getRecentAttendances =
    async (
        req,
        res
    ) => {

        try {

            const requestRole =
                String(
                    req.user?.role || ""
                )
                    .trim()
                    .toLowerCase();


            const requestCoachId =
                await resolveRequestCoachId(
                    req
                );


            let sql = `

                SELECT

                    a.attendanceId,

                    a.clientId,

                    a.membershipId,

                    a.clientMembershipId,

                    a.reservationId,

                    a.attendanceDate,

                    a.remainingClassesAfter,

                    c.fullName,

                    s.scheduleId,

                    s.coachId,

                    s.startTime,

                    s.duration,

                    act.name
                        AS activityName,

                    act.icon
                        AS activityIcon,

                    act.color
                        AS activityColor

                FROM attendances a

                INNER JOIN clients c

                    ON a.clientId =
                    c.clientId

                LEFT JOIN reservations r

                    ON a.reservationId =
                    r.reservationId

                LEFT JOIN schedules s

                    ON r.scheduleId =
                    s.scheduleId

                LEFT JOIN activities act

                    ON s.activityId =
                    act.activityId

            `;


            const params = [];


            if (
                requestRole === "coach"
            ) {

                if (
                    !requestCoachId
                ) {

                    return res.status(
                        403
                    )
                        .json({

                            message:
                                "La cuenta de coach todavía no está vinculada correctamente."

                        });

                }


                sql += `

                    WHERE

                        s.coachId = ?

                `;


                params.push(
                    requestCoachId
                );

            }


            sql += `

                ORDER BY

                    a.attendanceDate DESC

                LIMIT 10

            `;


            const rows =
                await all(

                    sql,

                    params

                );


            return res.json(
                rows
            );

        }

        catch (
        error
        ) {

            console.error(

                "Get recent attendances error:",

                error

            );


            return res.status(
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

    registerAttendance,

    getAttendances,

    getAttendancesByClient,

    getRecentAttendances

};
