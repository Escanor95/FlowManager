/*
====================================================

    AURA ACCESS PRO

    COACH CONTROLLER

====================================================
*/

const db =
    require("../config/database");


// ====================================================
// GENERAR ID
// ====================================================

function generateCoachId() {

    return `COA-${Date.now()}-${Math.floor(
        Math.random() * 1000
    )}`;

}


// ====================================================
// LISTAR COACHES
// ====================================================

function getAllCoaches(req, res) {

    db.all(
        `
            SELECT

                coachId,
                fullName,
                phone,
                email,
                paymentPerClass,
                notes,
                isActive,
                createdAt,
                updatedAt

            FROM coaches

            ORDER BY fullName ASC
        `,
        [],
        (error, coaches) => {

            if (error) {

                console.error(error);

                return res.status(500).json({

                    message:
                        "No fue posible obtener los coaches."

                });

            }


            res.json(coaches);

        }
    );

}


// ====================================================
// OBTENER COACHES ACTIVOS
// ====================================================

function getActiveCoaches(req, res) {

    db.all(
        `
            SELECT

                coachId,
                fullName,
                phone,
                email,
                paymentPerClass

            FROM coaches

            WHERE isActive = 1

            ORDER BY fullName ASC
        `,
        [],
        (error, coaches) => {

            if (error) {

                console.error(error);

                return res.status(500).json({

                    message:
                        "No fue posible obtener los coaches."

                });

            }


            res.json(coaches);

        }
    );

}


// ====================================================
// CREAR COACH
// ====================================================

function createCoach(req, res) {

    const {

        fullName,
        phone = null,
        email = null,
        paymentPerClass = 0,
        notes = null

    } = req.body;


    if (!fullName) {

        return res.status(400).json({

            message:
                "El nombre del coach es obligatorio."

        });

    }


    const coachId =
        generateCoachId();


    const now =
        new Date().toISOString();


    const normalizedEmail =
        email
            ? email.trim().toLowerCase()
            : null;


    db.run(
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

            VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?)
        `,
        [

            coachId,

            fullName.trim(),

            phone
                ? phone.trim()
                : null,

            normalizedEmail,

            Number(paymentPerClass) || 0,

            notes
                ? notes.trim()
                : null,

            now,

            now

        ],
        function (error) {

            if (error) {

                console.error(error);


                if (

                    error.message.includes(
                        "UNIQUE"
                    )

                ) {

                    return res.status(409).json({

                        message:
                            "Ya existe un coach con ese correo."

                    });

                }


                return res.status(500).json({

                    message:
                        "No fue posible crear el coach."

                });

            }


            res.status(201).json({

                message:
                    "Coach creado correctamente.",

                coach: {

                    coachId,

                    fullName:
                        fullName.trim(),

                    phone,

                    email:
                        normalizedEmail,

                    paymentPerClass:
                        Number(paymentPerClass) || 0,

                    notes,

                    isActive: 1

                }

            });

        }
    );

}


// ====================================================
// ACTUALIZAR COACH
// ====================================================

function updateCoach(req, res) {

    const {

        coachId

    } = req.params;


    const {

        fullName,
        phone = null,
        email = null,
        paymentPerClass = 0,
        notes = null

    } = req.body;


    if (!fullName) {

        return res.status(400).json({

            message:
                "El nombre del coach es obligatorio."

        });

    }


    const normalizedEmail =
        email
            ? email.trim().toLowerCase()
            : null;


    db.get(
        `
            SELECT coachId

            FROM coaches

            WHERE coachId = ?

            LIMIT 1
        `,
        [coachId],
        (findError, coach) => {

            if (findError) {

                console.error(findError);

                return res.status(500).json({

                    message:
                        "No fue posible buscar el coach."

                });

            }


            if (!coach) {

                return res.status(404).json({

                    message:
                        "Coach no encontrado."

                });

            }


            db.run(
                `
                    UPDATE coaches

                    SET

                        fullName = ?,

                        phone = ?,

                        email = ?,

                        paymentPerClass = ?,

                        notes = ?,

                        updatedAt = ?

                    WHERE coachId = ?
                `,
                [

                    fullName.trim(),

                    phone
                        ? phone.trim()
                        : null,

                    normalizedEmail,

                    Number(paymentPerClass) || 0,

                    notes
                        ? notes.trim()
                        : null,

                    new Date().toISOString(),

                    coachId

                ],
                function (error) {

                    if (error) {

                        console.error(error);


                        if (

                            error.message.includes(
                                "UNIQUE"
                            )

                        ) {

                            return res.status(409).json({

                                message:
                                    "Ya existe un coach con ese correo."

                            });

                        }


                        return res.status(500).json({

                            message:
                                "No fue posible actualizar el coach."

                        });

                    }


                    res.json({

                        message:
                            "Coach actualizado correctamente."

                    });

                }
            );

        }
    );

}


// ====================================================
// DESACTIVAR COACH
// ====================================================

function deactivateCoach(req, res) {

    const {

        coachId

    } = req.params;


    db.run(
        `
            UPDATE coaches

            SET

                isActive = 0,

                updatedAt = ?

            WHERE coachId = ?
        `,
        [

            new Date().toISOString(),

            coachId

        ],
        function (error) {

            if (error) {

                console.error(error);

                return res.status(500).json({

                    message:
                        "No fue posible desactivar el coach."

                });

            }


            if (

                this.changes === 0

            ) {

                return res.status(404).json({

                    message:
                        "Coach no encontrado."

                });

            }


            res.json({

                message:
                    "Coach desactivado correctamente."

            });

        }
    );

}


// ====================================================
// ACTIVAR COACH
// ====================================================

function activateCoach(req, res) {

    const {

        coachId

    } = req.params;


    db.run(
        `
            UPDATE coaches

            SET

                isActive = 1,

                updatedAt = ?

            WHERE coachId = ?
        `,
        [

            new Date().toISOString(),

            coachId

        ],
        function (error) {

            if (error) {

                console.error(error);

                return res.status(500).json({

                    message:
                        "No fue posible activar el coach."

                });

            }


            if (

                this.changes === 0

            ) {

                return res.status(404).json({

                    message:
                        "Coach no encontrado."

                });

            }


            res.json({

                message:
                    "Coach activado correctamente."

            });

        }
    );

}


module.exports = {

    getAllCoaches,

    getActiveCoaches,

    createCoach,

    updateCoach,

    deactivateCoach,

    activateCoach

};