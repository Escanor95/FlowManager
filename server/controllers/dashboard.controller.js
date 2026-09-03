/*
====================================================

    FLOWMANAGER

    DASHBOARD CONTROLLER

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


// ====================================================
// FECHA LOCAL
// ====================================================

const getLocalDate = () => {

    const now =
        new Date();


    const year =
        now.getFullYear();


    const month =
        String(
            now.getMonth() + 1
        )
            .padStart(
                2,
                "0"
            );


    const day =
        String(
            now.getDate()
        )
            .padStart(
                2,
                "0"
            );


    return `${year}-${month}-${day}`;

};


// ====================================================
// DÍA ACTUAL
// ====================================================

const getCurrentWeekday = () => {

    const weekdays = [

        "sunday",
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday"

    ];


    return weekdays[
        new Date().getDay()
    ];

};


// ====================================================
// HORA ACTUAL
// ====================================================

const getCurrentTime = () => {

    const now =
        new Date();


    return `${String(
        now.getHours()
    ).padStart(
        2,
        "0"
    )}:${String(
        now.getMinutes()
    ).padStart(
        2,
        "0"
    )}`;

};


// ====================================================
// CONVERTIR HORA A MINUTOS
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

        hours *
        60

    )
        +
        minutes;

}


// ====================================================
// VALIDAR SI UNA CLASE YA TERMINÓ
// ====================================================

function isClassFinished(
    startTime,
    duration,
    currentTime
) {

    const start =
        timeToMinutes(
            startTime
        );


    const current =
        timeToMinutes(
            currentTime
        );


    const classDuration =
        Number(
            duration
        ) || 0;


    if (

        start === null

        ||

        current === null

    ) {

        return false;

    }


    return (

        current >=

        (
            start +
            classDuration
        )

    );

}


// ====================================================
// DETECTAR COACH
// ====================================================

function isCoachRequest(
    req
) {

    const role =
        String(
            req.user?.role || ""
        )
            .trim()
            .toLowerCase();


    return (
        role === "coach"
    );

}


// ====================================================
// RESOLVER COACH AUTOMÁTICAMENTE
//
// La relación se resuelve por:
//
// 1. coachId presente en la sesión
// 2. correo del usuario
//
// Esto evita que el gerente tenga que seleccionar
// manualmente un "coach asociado".
// ====================================================

async function resolveCoachId(
    req
) {

    if (
        req.user?.coachId
    ) {

        return req.user.coachId;

    }


    const email =
        String(
            req.user?.email || ""
        )
            .trim()
            .toLowerCase();


    if (
        email
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
                    email
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
// CALCULAR RANGO DE SEMANA
// ====================================================

function getWeekRange(
    baseDate
) {

    const date =
        new Date(
            `${baseDate}T12:00:00`
        );


    const day =
        date.getDay();


    const diffToMonday =
        day === 0
            ? -6
            : 1 - day;


    const start =
        new Date(
            date
        );


    start.setDate(
        date.getDate() +
        diffToMonday
    );


    const end =
        new Date(
            start
        );


    end.setDate(
        start.getDate() +
        6
    );


    const format =
        value =>

            `${value.getFullYear()}-${String(
                value.getMonth() + 1
            ).padStart(
                2,
                "0"
            )}-${String(
                value.getDate()
            ).padStart(
                2,
                "0"
            )}`;


    return {

        from:
            format(start),

        to:
            format(end)

    };

}


// ====================================================
// CLASES DE COACH PARA UN RANGO DE FECHAS
//
// IMPORTANTE:
//
// schedules.weekday representa la recurrencia semanal.
//
// Generamos las fechas reales del rango y obtenemos
// las reservas correspondientes a cada ocurrencia.
// ====================================================

async function getCoachClassesForRange(
    coachId,
    from,
    to
) {

    const schedules =
        await all(

            `
            SELECT

                s.scheduleId,

                s.activityId,

                s.coachId,

                s.weekday,

                s.startTime,

                s.duration,

                s.capacity,

                a.name
                    AS activityName,

                a.icon
                    AS activityIcon,

                a.color
                    AS activityColor

            FROM schedules s

            INNER JOIN activities a

                ON s.activityId =
                a.activityId

            WHERE

                s.isActive = 1

                AND s.coachId = ?

            ORDER BY

                s.startTime ASC
            `,

            [
                coachId
            ]

        );


    const reservations =
        await all(

            `
            SELECT

                r.reservationId,

                r.clientId,

                r.scheduleId,

                r.reservationDate,

                r.status,

                c.fullName
                    AS clientName,

                c.photoUrl
                    AS clientPhoto

            FROM reservations r

            INNER JOIN clients c

                ON r.clientId =
                c.clientId

            WHERE

                r.reservationDate
                BETWEEN ?
                AND ?

                AND r.status =
                'CONFIRMED'

            ORDER BY

                c.fullName ASC
            `,

            [
                from,
                to
            ]

        );


    const reservationsByScheduleDate =
        {};


    reservations.forEach(

        reservation => {

            const key =
                `${reservation.scheduleId}__${String(
                    reservation.reservationDate
                ).split("T")[0]}`;


            if (
                !reservationsByScheduleDate[key]
            ) {

                reservationsByScheduleDate[key] =
                    [];

            }


            reservationsByScheduleDate[key]
                .push(
                    reservation
                );

        }

    );


    const weekdayMap = {

        sunday:
            0,

        monday:
            1,

        tuesday:
            2,

        wednesday:
            3,

        thursday:
            4,

        friday:
            5,

        saturday:
            6

    };


    const startDate =
        new Date(
            `${from}T12:00:00`
        );


    const endDate =
        new Date(
            `${to}T12:00:00`
        );


    const classes =
        [];


    for (

        let date =
            new Date(
                startDate
            );

        date <= endDate;

        date.setDate(
            date.getDate() + 1
        )

    ) {

        const dateKey =
            `${date.getFullYear()}-${String(
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


        const weekdayIndex =
            date.getDay();


        const weekday =
            Object.keys(
                weekdayMap
            )
                .find(

                    key =>
                        weekdayMap[key] ===
                        weekdayIndex

                );


        schedules.forEach(

            schedule => {

                const scheduleWeekday =
                    String(
                        schedule.weekday || ""
                    )
                        .trim()
                        .toLowerCase();


                if (
                    scheduleWeekday !==
                    weekday
                ) {

                    return;

                }


                const key =
                    `${schedule.scheduleId}__${dateKey}`;


                const clientNames =
                    reservationsByScheduleDate[key]
                    ||
                    [];


                const reserved =
                    clientNames.length;


                const capacity =
                    Number(
                        schedule.capacity
                    )
                    ||
                    0;


                const remaining =
                    Math.max(

                        0,

                        capacity -
                        reserved

                    );


                const dateTime =
                    new Date(

                        `${dateKey}T${String(
                            schedule.startTime
                        ).slice(
                            0,
                            5
                        )}:00`

                    );


                const now =
                    new Date();


                const isToday =
                    dateKey ===
                    getLocalDate();


                const startMinutes =
                    timeToMinutes(
                        schedule.startTime
                    );


                const currentMinutes =
                    isToday

                        ?

                        (
                            now.getHours() *
                            60
                        )
                        +
                        now.getMinutes()

                        :

                        null;


                const isStarted =

                    isToday

                    &&

                    startMinutes !== null

                    &&

                    currentMinutes !== null

                    &&

                    currentMinutes >=
                    startMinutes;


                const isFinished =

                    isToday

                        ?

                        isClassFinished(

                            schedule.startTime,

                            schedule.duration,

                            getCurrentTime()

                        )

                        :

                        dateTime.getTime()
                        <
                        now.getTime();


                classes.push({

                    scheduleId:
                        schedule.scheduleId,

                    activityId:
                        schedule.activityId,

                    coachId:
                        schedule.coachId,

                    weekday:
                        schedule.weekday,

                    startTime:
                        schedule.startTime,

                    duration:
                        schedule.duration,

                    capacity,

                    activityName:
                        schedule.activityName,

                    activityIcon:
                        schedule.activityIcon,

                    activityColor:
                        schedule.activityColor,

                    reservationDate:
                        dateKey,

                    reserved,

                    remaining,

                    occupancy:

                        capacity > 0

                            ?

                            Number(

                                (
                                    reserved /
                                    capacity
                                ) *
                                100

                            ).toFixed(1)

                            :

                            0,

                    isStarted,

                    isFinished,

                    clientNames

                });

            }

        );

    }


    classes.sort(

        (
            a,
            b
        ) => {

            const dateCompare =
                String(
                    a.reservationDate
                )
                    .localeCompare(
                        String(
                            b.reservationDate
                        )
                    );


            if (
                dateCompare !== 0
            ) {

                return dateCompare;

            }


            return (

                timeToMinutes(
                    a.startTime
                )

                -

                timeToMinutes(
                    b.startTime
                )

            );

        }

    );


    return classes;

}


// ====================================================
// DASHBOARD COACH
// ====================================================

async function getCoachDashboard(
    req
) {

    const coachId =
        await resolveCoachId(
            req
        );


    if (
        !coachId
    ) {

        throw new Error(
            "La cuenta del coach todavía no está vinculada correctamente."
        );

    }


    const today =
        getLocalDate();


    const weekday =
        getCurrentWeekday();


    const currentTime =
        getCurrentTime();


    // ====================================================
    // DATOS DEL COACH
    // ====================================================

    const coach =
        await get(

            `
            SELECT

                coachId,

                fullName,

                phone,

                email,

                photoUrl,

                notes,

                paymentPerClass,

                isActive,

                createdAt,

                updatedAt

            FROM coaches

            WHERE

                coachId = ?

            LIMIT 1
            `,

            [
                coachId
            ]

        );


    if (
        !coach
    ) {

        throw new Error(
            "No se encontró el coach asociado a esta cuenta."
        );

    }


    // ====================================================
    // CLASES DE HOY
    // ====================================================

    const todayClasses =
        await getCoachClassesForRange(

            coachId,

            today,

            today

        );


    // ====================================================
    // SEMANA
    // ====================================================

    const weekRange =
        getWeekRange(
            today
        );


    const weekClasses =
        await getCoachClassesForRange(

            coachId,

            weekRange.from,

            weekRange.to

        );


    // ====================================================
    // MES
    // ====================================================

    const monthStart =
        `${today.substring(
            0,
            7
        )}-01`;


    const todayDate =
        new Date(
            `${today}T12:00:00`
        );


    const monthEndDate =
        new Date(
            todayDate.getFullYear(),
            todayDate.getMonth() + 1,
            0
        );


    const monthEnd =
        `${monthEndDate.getFullYear()}-${String(
            monthEndDate.getMonth() + 1
        ).padStart(
            2,
            "0"
        )}-${String(
            monthEndDate.getDate()
        ).padStart(
            2,
            "0"
        )}`;


    const monthClasses =
        await getCoachClassesForRange(

            coachId,

            monthStart,

            monthEnd

        );


    // ====================================================
    // PRÓXIMA CLASE DE HOY
    // ====================================================

    let nextClass =
        todayClasses.find(

            item => {

                const start =
                    timeToMinutes(
                        item.startTime
                    );


                const current =
                    timeToMinutes(
                        currentTime
                    );


                if (

                    start === null

                    ||

                    current === null

                ) {

                    return false;

                }


                return (

                    start >=
                    current

                    &&

                    !item.isFinished

                );

            }

        )
        ||
        null;


    // ====================================================
    // SI HAY UNA CLASE EN CURSO
    // ====================================================

    if (
        !nextClass
    ) {

        nextClass =
            todayClasses.find(

                item =>

                    item.isStarted

                    &&

                    !item.isFinished

            )
            ||
            null;

    }


    // ====================================================
    // RESPUESTA
    // ====================================================

    return {

        role:
            "coach",

        today,

        weekday,

        currentTime,

        coach: {

            coachId:
                coach.coachId,

            fullName:
                coach.fullName,

            phone:
                coach.phone,

            email:
                coach.email,

            photoUrl:
                coach.photoUrl,

            notes:
                coach.notes,

            paymentPerClass:
                Number(
                    coach.paymentPerClass
                ) || 0,

            isActive:
                Number(
                    coach.isActive
                ) === 1,

            createdAt:
                coach.createdAt

        },

        todayClasses,

        weekClasses,

        monthClasses,

        nextClass

    };

}


// ====================================================
// DASHBOARD MANAGER
// ====================================================

async function getManagerDashboard() {

    const today =
        getLocalDate();


    const weekday =
        getCurrentWeekday();


    // ====================================================
    // CLIENTES ACTIVOS
    // ====================================================

    const activeClientsResult =
        await get(

            `
            SELECT COUNT(*) AS total

            FROM clients

            WHERE isActive = 1
            `

        );


    // ====================================================
    // CLIENTES VENCIDOS
    // ====================================================

    const expiredClientsResult =
        await get(

            `
            SELECT COUNT(*) AS total

            FROM clients

            WHERE

                isActive = 1

                AND membershipStatus = 'Expired'
            `

        );


    // ====================================================
    // CLIENTES SIN CLASES
    // ====================================================

    const noClassesClientsResult =
        await get(

            `
            SELECT COUNT(*) AS total

            FROM clients

            WHERE

                isActive = 1

                AND membershipStatus = 'NoClasses'
            `

        );


    // ====================================================
    // CLASES DE HOY
    // ====================================================

    const todayClassesResult =
        await get(

            `
            SELECT COUNT(*) AS total

            FROM schedules

            WHERE

                isActive = 1

                AND LOWER(weekday) = ?
            `,

            [
                weekday
            ]

        );


    // ====================================================
    // CAPACIDAD TOTAL DE HOY
    // ====================================================

    const totalCapacityResult =
        await get(

            `
            SELECT

                IFNULL(
                    SUM(capacity),
                    0
                ) AS total

            FROM schedules

            WHERE

                isActive = 1

                AND LOWER(weekday) = ?
            `,

            [
                weekday
            ]

        );


    // ====================================================
    // RESERVACIONES DE HOY
    // ====================================================

    const todayReservationsResult =
        await get(

            `
            SELECT COUNT(*) AS total

            FROM reservations

            WHERE

                reservationDate = ?

                AND status = 'CONFIRMED'
            `,

            [
                today
            ]

        );


    // ====================================================
    // ASISTENCIAS DE HOY
    // ====================================================

    const todayAttendancesResult =
        await get(

            `
            SELECT COUNT(*) AS total

            FROM attendances

            WHERE

                DATE(attendanceDate) = ?
            `,

            [
                today
            ]

        );


    // ====================================================
    // MEMBRESÍAS ACTIVAS
    // ====================================================

    const activeMembershipsResult =
        await get(

            `
            SELECT COUNT(*) AS total

            FROM memberships

            WHERE isActive = 1
            `

        );


    // ====================================================
    // MEMBRESÍAS INACTIVAS
    // ====================================================

    const inactiveMembershipsResult =
        await get(

            `
            SELECT COUNT(*) AS total

            FROM memberships

            WHERE isActive = 0
            `

        );


    // ====================================================
    // COACHES ACTIVOS
    // ====================================================

    const activeCoachesResult =
        await get(

            `
            SELECT COUNT(*) AS total

            FROM coaches

            WHERE isActive = 1
            `

        );


    // ====================================================
    // ACTIVIDADES ACTIVAS
    // ====================================================

    const activeActivitiesResult =
        await get(

            `
            SELECT COUNT(*) AS total

            FROM activities

            WHERE isActive = 1
            `

        );


    // ====================================================
    // RESERVACIONES RECIENTES
    // ====================================================

    const recentReservations =
        await all(

            `
            SELECT

                r.reservationId,

                r.clientId,

                r.clientMembershipId,

                r.scheduleId,

                r.reservationDate,

                r.status,

                r.createdAt,

                r.updatedAt,

                c.fullName AS clientName,

                a.name AS activityName,

                a.icon AS activityIcon,

                a.color AS activityColor,

                s.weekday,

                s.startTime,

                s.duration,

                s.capacity

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

            ORDER BY

                r.createdAt DESC

            LIMIT 10
            `

        );


    // ====================================================
    // PRÓXIMAS CLASES
    // ====================================================

    const upcomingClasses =
        await all(

            `
            SELECT

                s.scheduleId,

                s.activityId,

                s.coachId,

                s.weekday,

                s.startTime,

                s.duration,

                s.capacity,

                a.name AS activityName,

                a.icon AS activityIcon,

                a.color AS activityColor,

                c.fullName AS coachName,

                COUNT(r.reservationId) AS reserved,

                (

                    s.capacity -

                    COUNT(r.reservationId)

                ) AS remaining,

                CASE

                    WHEN s.capacity > 0

                    THEN

                        ROUND(

                            (

                                COUNT(
                                    r.reservationId
                                ) * 100.0

                                /

                                s.capacity

                            ),

                            1

                        )

                    ELSE 0

                END AS occupancy

            FROM schedules s

            LEFT JOIN activities a

                ON s.activityId =
                a.activityId

            LEFT JOIN coaches c

                ON s.coachId =
                c.coachId

            LEFT JOIN reservations r

                ON r.scheduleId =
                s.scheduleId

                AND r.reservationDate = ?

                AND r.status = 'CONFIRMED'

            WHERE

                s.isActive = 1

                AND LOWER(s.weekday) = ?

            GROUP BY

                s.scheduleId

            ORDER BY

                s.startTime ASC
            `,

            [

                today,

                weekday

            ]

        );


    // ====================================================
    // OCUPACIÓN POR CLASE
    // ====================================================

    const classOccupancy =
        await all(

            `
            SELECT

                s.scheduleId,

                s.weekday,

                s.startTime,

                s.duration,

                s.capacity,

                a.activityId,

                a.name AS activityName,

                a.icon AS activityIcon,

                a.color AS activityColor,

                c.fullName AS coachName,

                COUNT(r.reservationId) AS reserved,

                (

                    s.capacity -

                    COUNT(r.reservationId)

                ) AS remaining,

                CASE

                    WHEN s.capacity > 0

                    THEN

                        ROUND(

                            (

                                COUNT(
                                    r.reservationId
                                ) * 100.0

                                /

                                s.capacity

                            ),

                            1

                        )

                    ELSE 0

                END AS occupancy

            FROM schedules s

            LEFT JOIN activities a

                ON s.activityId =
                a.activityId

            LEFT JOIN coaches c

                ON s.coachId =
                c.coachId

            LEFT JOIN reservations r

                ON r.scheduleId =
                s.scheduleId

                AND r.reservationDate = ?

                AND r.status = 'CONFIRMED'

            WHERE

                s.isActive = 1

                AND LOWER(s.weekday) = ?

            GROUP BY

                s.scheduleId

            ORDER BY

                s.startTime ASC
            `,

            [

                today,

                weekday

            ]

        );


    // ====================================================
    // ASISTENCIAS RECIENTES
    // ====================================================

    const recentAttendances =
        await all(

            `
            SELECT

                at.attendanceId,

                at.clientId,

                at.membershipId,

                at.clientMembershipId,

                at.reservationId,

                at.attendanceDate,

                at.remainingClassesAfter,

                at.createdAt,

                c.fullName,

                s.scheduleId,

                s.startTime,

                s.duration,

                act.name AS activityName,

                act.icon AS activityIcon,

                act.color AS activityColor

            FROM attendances at

            INNER JOIN clients c

                ON at.clientId =
                c.clientId

            LEFT JOIN reservations r

                ON at.reservationId =
                r.reservationId

            LEFT JOIN schedules s

                ON r.scheduleId =
                s.scheduleId

            LEFT JOIN activities act

                ON s.activityId =
                act.activityId

            ORDER BY

                at.attendanceDate DESC

            LIMIT 10
            `

        );


    // ====================================================
    // OCUPACIÓN GENERAL
    // ====================================================

    const totalCapacity =
        Number(
            totalCapacityResult.total
        );


    const totalReservations =
        Number(
            todayReservationsResult.total
        );


    const occupancy =

        totalCapacity > 0

            ?

            Number(

                (

                    totalReservations /

                    totalCapacity

                ) * 100

            ).toFixed(1)

            :

            0;


    // ====================================================
    // RESPUESTA MANAGER
    // ====================================================

    return {

        role:
            "manager",

        today,

        activeClients:
            activeClientsResult.total,

        expiredClients:
            expiredClientsResult.total,

        noClassesClients:
            noClassesClientsResult.total,

        todayClasses:
            todayClassesResult.total,

        todayReservations:
            todayReservationsResult.total,

        todayAttendances:
            todayAttendancesResult.total,

        totalCapacity,

        occupancy,

        activeMemberships:
            activeMembershipsResult.total,

        inactiveMemberships:
            inactiveMembershipsResult.total,

        activeCoaches:
            activeCoachesResult.total,

        activeActivities:
            activeActivitiesResult.total,

        recentReservations,

        upcomingClasses,

        classOccupancy,

        recentAttendances

    };

}


// ====================================================
// ENDPOINT PRINCIPAL
// ====================================================

const getDashboard =
    async (
        req,
        res
    ) => {

        try {

            // =========================================
            // COACH
            // =========================================

            if (
                isCoachRequest(
                    req
                )
            ) {

                const coachDashboard =
                    await getCoachDashboard(
                        req
                    );


                return res.json(
                    coachDashboard
                );

            }


            // =========================================
            // MANAGER
            // =========================================

            const managerDashboard =
                await getManagerDashboard();


            return res.json(
                managerDashboard
            );

        }

        catch (
        error
        ) {

            console.error(

                "Dashboard error:",

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

    getDashboard

};