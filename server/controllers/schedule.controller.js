/*
====================================================

    AURA ACCESS PRO

    SCHEDULE CONTROLLER

====================================================
*/

const db =
    require("../config/database");

const generateScheduleId =
    require("../utils/generateScheduleId");


// ====================================================
// VALIDAR FECHAS DE REPETICIÓN
// ====================================================

function validateRepeatDates(
    repeatFrom,
    repeatUntil
) {

    if (
        !repeatFrom &&
        !repeatUntil
    ) {

        return null;

    }

    if (
        !repeatFrom ||
        !repeatUntil
    ) {

        return "Debes indicar la fecha de inicio y la fecha de fin.";

    }


    const from =
        new Date(
            `${repeatFrom}T00:00:00`
        );

    const until =
        new Date(
            `${repeatUntil}T00:00:00`
        );


    if (

        Number.isNaN(
            from.getTime()
        )

        ||

        Number.isNaN(
            until.getTime()
        )

    ) {

        return "Las fechas de repetición no son válidas.";

    }


    if (
        from > until
    ) {

        return "La fecha de inicio no puede ser posterior a la fecha de fin.";

    }


    return null;

}


// ====================================================
// OBTENER HORARIOS
// ====================================================

const getAllSchedules =
    (
        req,
        res
    ) => {

        db.all(

            `

            SELECT

                schedules.*,

                activities.name,

                activities.icon,

                activities.color,

                coaches.fullName AS coachName

            FROM schedules

            INNER JOIN activities

                ON schedules.activityId =
                activities.activityId

            LEFT JOIN coaches

                ON schedules.coachId =
                coaches.coachId

            WHERE

                schedules.isActive = 1

            ORDER BY

                schedules.startTime ASC,

                schedules.weekday ASC

            `,

            [],

            (
                error,
                rows
            ) => {

                if (
                    error
                ) {

                    console.error(
                        "Error obteniendo horarios:",
                        error
                    );


                    return res.status(
                        500
                    )
                        .json({

                            message:
                                "No fue posible obtener los horarios."

                        });

                }


                res.json(
                    rows
                );

            }

        );

    };


// ====================================================
// OBTENER HORARIO
// ====================================================

const getScheduleById =
    (
        req,
        res
    ) => {

        db.get(

            `

            SELECT

                schedules.*,

                activities.name,

                activities.icon,

                activities.color,

                coaches.fullName AS coachName

            FROM schedules

            INNER JOIN activities

                ON schedules.activityId =
                activities.activityId

            LEFT JOIN coaches

                ON schedules.coachId =
                coaches.coachId

            WHERE

                schedules.scheduleId = ?

            LIMIT 1

            `,

            [

                req.params.scheduleId

            ],

            (
                error,
                row
            ) => {

                if (
                    error
                ) {

                    console.error(
                        "Error obteniendo horario:",
                        error
                    );


                    return res.status(
                        500
                    )
                        .json({

                            message:
                                "No fue posible obtener el horario."

                        });

                }


                if (
                    !row
                ) {

                    return res.status(
                        404
                    )
                        .json({

                            message:
                                "Horario no encontrado."

                        });

                }


                res.json(
                    row
                );

            }

        );

    };


// ====================================================
// VALIDAR COACH
// ====================================================

function validateCoach(
    coachId,
    callback
) {

    if (
        !coachId
    ) {

        callback(
            null,
            null
        );

        return;

    }


    db.get(

        `

        SELECT

            coachId,

            fullName,

            isActive

        FROM coaches

        WHERE

            coachId = ?

        LIMIT 1

        `,

        [
            coachId
        ],

        (
            error,
            coach
        ) => {

            if (
                error
            ) {

                callback(
                    error
                );

                return;

            }


            if (
                !coach
                ||
                Number(
                    coach.isActive
                ) !== 1
            ) {

                callback(
                    null,
                    false
                );

                return;

            }


            callback(
                null,
                coach
            );

        }

    );

}


// ====================================================
// CREAR HORARIO
// ====================================================

const createSchedule =
    (
        req,
        res
    ) => {

        const {

            activityId,

            coachId,

            weekday,

            startTime,

            duration,

            capacity,

            wellhubSuggested,

            totalpassSuggested,

            isRecurring,

            repeatRule,

            repeatFrom,

            repeatUntil

        } =
            req.body;


        const dateError =
            validateRepeatDates(
                repeatFrom,
                repeatUntil
            );


        if (
            dateError
        ) {

            return res.status(
                400
            )
                .json({

                    message:
                        dateError

                });

        }


        if (
            !activityId
        ) {

            return res.status(
                400
            )
                .json({

                    message:
                        "La actividad es obligatoria."

                });

        }


        if (
            !weekday
        ) {

            return res.status(
                400
            )
                .json({

                    message:
                        "El día es obligatorio."

                });

        }


        if (
            !startTime
        ) {

            return res.status(
                400
            )
                .json({

                    message:
                        "La hora es obligatoria."

                });

        }


        if (
            Number(
                duration
            ) <= 0
        ) {

            return res.status(
                400
            )
                .json({

                    message:
                        "La duración debe ser mayor a 0."

                });

        }


        if (
            Number(
                capacity
            ) <= 0
        ) {

            return res.status(
                400
            )
                .json({

                    message:
                        "La capacidad debe ser mayor a 0."

                });

        }


        db.get(

            `

            SELECT

                activityId

            FROM activities

            WHERE

                activityId = ?

                AND isActive = 1

            LIMIT 1

            `,

            [

                activityId

            ],

            (
                error,
                activity
            ) => {

                if (
                    error
                ) {

                    return res.status(
                        500
                    )
                        .json({

                            message:
                                error.message

                        });

                }


                if (
                    !activity
                ) {

                    return res.status(
                        404
                    )
                        .json({

                            message:
                                "La actividad no existe."

                        });

                }


                validateCoach(

                    coachId,

                    (
                        coachError,
                        coach
                    ) => {

                        if (
                            coachError
                        ) {

                            return res.status(
                                500
                            )
                                .json({

                                    message:
                                        coachError.message

                                });

                        }


                        if (
                            coach === false
                        ) {

                            return res.status(
                                404
                            )
                                .json({

                                    message:
                                        "El coach no existe o está inactivo."

                                });

                        }


                        db.get(

                            `

                            SELECT

                                scheduleId

                            FROM schedules

                            WHERE

                                activityId = ?

                                AND weekday = ?

                                AND startTime = ?

                                AND isActive = 1

                            LIMIT 1

                            `,

                            [

                                activityId,

                                weekday,

                                startTime

                            ],

                            (
                                error,
                                row
                            ) => {

                                if (
                                    error
                                ) {

                                    return res.status(
                                        500
                                    )
                                        .json({

                                            message:
                                                error.message

                                        });

                                }


                                if (
                                    row
                                ) {

                                    return res.status(
                                        409
                                    )
                                        .json({

                                            message:
                                                "Ya existe un horario para esa actividad, día y hora."

                                        });

                                }


                                generateScheduleId(

                                    (
                                        idError,
                                        scheduleId
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


                                        const now =
                                            new Date()
                                                .toISOString();


                                        const recurring =
                                            Number(
                                                isRecurring
                                            )
                                                ? 1
                                                : 0;


                                        db.run(

                                            `

                                            INSERT INTO schedules (

                                                scheduleId,

                                                activityId,

                                                coachId,

                                                weekday,

                                                startTime,

                                                duration,

                                                capacity,

                                                wellhubSuggested,

                                                totalpassSuggested,

                                                isRecurring,

                                                repeatRule,

                                                repeatFrom,

                                                repeatUntil,

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

                                                scheduleId,

                                                activityId,

                                                coachId
                                                || null,

                                                weekday,

                                                startTime,

                                                Number(
                                                    duration
                                                ),

                                                Number(
                                                    capacity
                                                ),

                                                Number(
                                                    wellhubSuggested
                                                )
                                                || 0,

                                                Number(
                                                    totalpassSuggested
                                                )
                                                || 0,

                                                recurring,

                                                recurring
                                                    ? (
                                                        repeatRule
                                                        ||
                                                        "WEEKLY"
                                                    )
                                                    : null,

                                                repeatFrom
                                                || null,

                                                repeatUntil
                                                || null,

                                                1,

                                                now,

                                                now

                                            ],

                                            function (
                                                error
                                            ) {

                                                if (
                                                    error
                                                ) {

                                                    console.error(
                                                        "Error creando horario:",
                                                        error
                                                    );


                                                    return res.status(
                                                        500
                                                    )
                                                        .json({

                                                            message:
                                                                "No fue posible crear el horario."

                                                        });

                                                }


                                                res.status(
                                                    201
                                                )
                                                    .json({

                                                        message:
                                                            "Horario creado correctamente.",

                                                        scheduleId

                                                    });

                                            }

                                        );

                                    }

                                );

                            }

                        );

                    }

                );

            }

        );

    };


// ====================================================
// ACTUALIZAR HORARIO
// ====================================================

const updateSchedule =
    (
        req,
        res
    ) => {

        const {

            activityId,

            coachId,

            weekday,

            startTime,

            duration,

            capacity,

            wellhubSuggested,

            totalpassSuggested,

            isRecurring,

            repeatRule,

            repeatFrom,

            repeatUntil

        } =
            req.body;


        const dateError =
            validateRepeatDates(
                repeatFrom,
                repeatUntil
            );


        if (
            dateError
        ) {

            return res.status(
                400
            )
                .json({

                    message:
                        dateError

                });

        }


        if (
            !activityId
        ) {

            return res.status(
                400
            )
                .json({

                    message:
                        "La actividad es obligatoria."

                });

        }


        if (
            !weekday
        ) {

            return res.status(
                400
            )
                .json({

                    message:
                        "El día es obligatorio."

                });

        }


        if (
            !startTime
        ) {

            return res.status(
                400
            )
                .json({

                    message:
                        "La hora es obligatoria."

                });

        }


        if (
            Number(
                duration
            ) <= 0
        ) {

            return res.status(
                400
            )
                .json({

                    message:
                        "La duración debe ser mayor a 0."

                });

        }


        if (
            Number(
                capacity
            ) <= 0
        ) {

            return res.status(
                400
            )
                .json({

                    message:
                        "La capacidad debe ser mayor a 0."

                });

        }


        validateCoach(

            coachId,

            (
                coachError,
                coach
            ) => {

                if (
                    coachError
                ) {

                    return res.status(
                        500
                    )
                        .json({

                            message:
                                coachError.message

                        });

                }


                if (
                    coach === false
                ) {

                    return res.status(
                        404
                    )
                        .json({

                            message:
                                "El coach no existe o está inactivo."

                        });

                }


                db.get(

                    `

                    SELECT

                        scheduleId

                    FROM schedules

                    WHERE

                        scheduleId != ?

                        AND activityId = ?

                        AND weekday = ?

                        AND startTime = ?

                        AND isActive = 1

                    LIMIT 1

                    `,

                    [

                        req.params.scheduleId,

                        activityId,

                        weekday,

                        startTime

                    ],

                    (
                        duplicateError,
                        existing
                    ) => {

                        if (
                            duplicateError
                        ) {

                            return res.status(
                                500
                            )
                                .json({

                                    message:
                                        duplicateError.message

                                });

                        }


                        if (
                            existing
                        ) {

                            return res.status(
                                409
                            )
                                .json({

                                    message:
                                        "Ya existe otro horario para esa actividad, día y hora."

                                });

                        }


                        const recurring =
                            Number(
                                isRecurring
                            )
                                ? 1
                                : 0;


                        db.run(

                            `

                            UPDATE schedules

                            SET

                                activityId = ?,

                                coachId = ?,

                                weekday = ?,

                                startTime = ?,

                                duration = ?,

                                capacity = ?,

                                wellhubSuggested = ?,

                                totalpassSuggested = ?,

                                isRecurring = ?,

                                repeatRule = ?,

                                repeatFrom = ?,

                                repeatUntil = ?,

                                updatedAt = ?

                            WHERE

                                scheduleId = ?

                            `,

                            [

                                activityId,

                                coachId
                                || null,

                                weekday,

                                startTime,

                                Number(
                                    duration
                                ),

                                Number(
                                    capacity
                                ),

                                Number(
                                    wellhubSuggested
                                )
                                || 0,

                                Number(
                                    totalpassSuggested
                                )
                                || 0,

                                recurring,

                                recurring
                                    ? (
                                        repeatRule
                                        ||
                                        "WEEKLY"
                                    )
                                    : null,

                                repeatFrom
                                || null,

                                repeatUntil
                                || null,

                                new Date()
                                    .toISOString(),

                                req.params.scheduleId

                            ],

                            function (
                                error
                            ) {

                                if (
                                    error
                                ) {

                                    console.error(
                                        "Error actualizando horario:",
                                        error
                                    );


                                    return res.status(
                                        500
                                    )
                                        .json({

                                            message:
                                                "No fue posible actualizar el horario."

                                        });

                                }


                                if (
                                    this.changes === 0
                                ) {

                                    return res.status(
                                        404
                                    )
                                        .json({

                                            message:
                                                "Horario no encontrado."

                                        });

                                }


                                res.json({

                                    message:
                                        "Horario actualizado correctamente."

                                });

                            }

                        );

                    }

                );

            }

        );

    };


// ====================================================
// DESACTIVAR HORARIO
// ====================================================

const deactivateSchedule =
    (
        req,
        res
    ) => {

        db.run(

            `

            UPDATE schedules

            SET

                isActive = 0,

                updatedAt = ?

            WHERE

                scheduleId = ?

            `,

            [

                new Date()
                    .toISOString(),

                req.params.scheduleId

            ],

            function (
                error
            ) {

                if (
                    error
                ) {

                    return res.status(
                        500
                    )
                        .json({

                            message:
                                "No fue posible desactivar el horario."

                        });

                }


                if (
                    this.changes === 0
                ) {

                    return res.status(
                        404
                    )
                        .json({

                            message:
                                "Horario no encontrado."

                        });

                }


                res.json({

                    message:
                        "Horario desactivado correctamente."

                });

            }

        );

    };


// ====================================================
// DUPLICAR HORARIO
// ====================================================

const duplicateSchedule =
    (
        req,
        res
    ) => {

        const {

            scheduleId,

            weekdays,

            repeatFrom,

            repeatUntil

        } =
            req.body;


        if (
            !scheduleId
        ) {

            return res.status(
                400
            )
                .json({

                    message:
                        "ScheduleId requerido."

                });

        }


        if (

            !Array.isArray(
                weekdays
            )

            ||

            weekdays.length === 0

        ) {

            return res.status(
                400
            )
                .json({

                    message:
                        "Debes seleccionar al menos un día."

                });

        }


        const validWeekdays = [

            "Monday",

            "Tuesday",

            "Wednesday",

            "Thursday",

            "Friday",

            "Saturday",

            "Sunday"

        ];


        const invalidDay =
            weekdays.some(

                day =>
                    !validWeekdays.includes(
                        day
                    )

            );


        if (
            invalidDay
        ) {

            return res.status(
                400
            )
                .json({

                    message:
                        "Uno o más días no son válidos."

                });

        }


        const dateError =
            validateRepeatDates(
                repeatFrom,
                repeatUntil
            );


        if (
            dateError
        ) {

            return res.status(
                400
            )
                .json({

                    message:
                        dateError

                });

        }


        db.get(

            `

            SELECT *

            FROM schedules

            WHERE

                scheduleId = ?

                AND isActive = 1

            LIMIT 1

            `,

            [

                scheduleId

            ],

            (
                error,
                originalSchedule
            ) => {

                if (
                    error
                ) {

                    return res.status(
                        500
                    )
                        .json({

                            message:
                                error.message

                        });

                }


                if (
                    !originalSchedule
                ) {

                    return res.status(
                        404
                    )
                        .json({

                            message:
                                "El horario original no existe."

                        });

                }


                validateCoach(

                    originalSchedule.coachId,

                    (
                        coachError,
                        coach
                    ) => {

                        if (
                            coachError
                        ) {

                            return res.status(
                                500
                            )
                                .json({

                                    message:
                                        coachError.message

                                });

                        }


                        if (
                            originalSchedule.coachId
                            &&
                            coach === false
                        ) {

                            return res.status(
                                404
                            )
                                .json({

                                    message:
                                        "El coach asignado al horario no existe o está inactivo."

                                });

                        }


                        const created =
                            [];

                        const skipped =
                            [];

                        let index =
                            0;


                        const processNext =
                            () => {

                                if (
                                    index >=
                                    weekdays.length
                                ) {

                                    return res.status(
                                        201
                                    )
                                        .json({

                                            message:
                                                "Proceso de duplicación completado.",

                                            created,

                                            skipped

                                        });

                                }


                                const weekday =
                                    weekdays[index];


                                index++;


                                db.get(

                                    `

                                    SELECT

                                        scheduleId

                                    FROM schedules

                                    WHERE

                                        activityId = ?

                                        AND weekday = ?

                                        AND startTime = ?

                                        AND isActive = 1

                                    LIMIT 1

                                    `,

                                    [

                                        originalSchedule.activityId,

                                        weekday,

                                        originalSchedule.startTime

                                    ],

                                    (
                                        error,
                                        existing
                                    ) => {

                                        if (
                                            error
                                        ) {

                                            return res.status(
                                                500
                                            )
                                                .json({

                                                    message:
                                                        error.message

                                                });

                                        }


                                        if (
                                            existing
                                        ) {

                                            skipped.push({

                                                weekday,

                                                reason:
                                                    "Ya existe un horario para esa actividad, día y hora.",

                                                scheduleId:
                                                    existing.scheduleId

                                            });


                                            return processNext();

                                        }


                                        generateScheduleId(

                                            (
                                                idError,
                                                newScheduleId
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


                                                const now =
                                                    new Date()
                                                        .toISOString();


                                                db.run(

                                                    `

                                                    INSERT INTO schedules (

                                                        scheduleId,

                                                        activityId,

                                                        coachId,

                                                        weekday,

                                                        startTime,

                                                        duration,

                                                        capacity,

                                                        wellhubSuggested,

                                                        totalpassSuggested,

                                                        isRecurring,

                                                        repeatRule,

                                                        repeatFrom,

                                                        repeatUntil,

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

                                                        newScheduleId,

                                                        originalSchedule.activityId,

                                                        originalSchedule.coachId
                                                        || null,

                                                        weekday,

                                                        originalSchedule.startTime,

                                                        originalSchedule.duration,

                                                        originalSchedule.capacity,

                                                        originalSchedule.wellhubSuggested
                                                        || 0,

                                                        originalSchedule.totalpassSuggested
                                                        || 0,

                                                        Number(
                                                            originalSchedule.isRecurring
                                                        )
                                                        || 0,

                                                        originalSchedule.repeatRule
                                                        ||
                                                        "WEEKLY",

                                                        repeatFrom
                                                        ||
                                                        originalSchedule.repeatFrom
                                                        ||
                                                        null,

                                                        repeatUntil
                                                        ||
                                                        originalSchedule.repeatUntil
                                                        ||
                                                        null,

                                                        1,

                                                        now,

                                                        now

                                                    ],

                                                    function (
                                                        error
                                                    ) {

                                                        if (
                                                            error
                                                        ) {

                                                            return res.status(
                                                                500
                                                            )
                                                                .json({

                                                                    message:
                                                                        "No fue posible duplicar el horario."

                                                                });

                                                        }


                                                        created.push({

                                                            scheduleId:
                                                                newScheduleId,

                                                            weekday,

                                                            startTime:
                                                                originalSchedule.startTime,

                                                            coachId:
                                                                originalSchedule.coachId
                                                                ||
                                                                null,

                                                            repeatFrom:
                                                                repeatFrom
                                                                ||
                                                                originalSchedule.repeatFrom
                                                                ||
                                                                null,

                                                            repeatUntil:
                                                                repeatUntil
                                                                ||
                                                                originalSchedule.repeatUntil
                                                                ||
                                                                null

                                                        });


                                                        processNext();

                                                    }

                                                );

                                            }

                                        );

                                    }

                                );

                            };


                        processNext();

                    }

                );

            }

        );

    };


// ====================================================
// EXPORTS
// ====================================================

module.exports = {

    getAllSchedules,

    getScheduleById,

    createSchedule,

    updateSchedule,

    deactivateSchedule,

    duplicateSchedule

};