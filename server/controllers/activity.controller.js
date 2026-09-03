const db = require("../config/database");
const generateActivityId = require("../utils/generateActivityId");

// ======================================
// Obtener actividades
// ======================================

const getAllActivities = (req, res) => {

    db.all(

        `

        SELECT *

        FROM activities

        WHERE isActive = 1

        ORDER BY name ASC

        `,

        [],

        (error, rows) => {

            if (error) {

                return res.status(500).json(error);

            }

            res.json(rows);

        }

    );

};

// ======================================
// Obtener actividad
// ======================================

const getActivityById = (req, res) => {

    db.get(

        `

        SELECT *

        FROM activities

        WHERE activityId = ?

        `,

        [

            req.params.activityId

        ],

        (error, row) => {

            if (error) {

                return res.status(500).json(error);

            }

            if (!row) {

                return res.status(404).json({

                    message: "Activity not found"

                });

            }

            res.json(row);

        }

    );

};

// ======================================
// Buscar
// ======================================

const searchActivities = (req, res) => {

    const query = `%${req.params.query}%`;

    db.all(

        `

        SELECT *

        FROM activities

        WHERE

            isActive = 1

            AND (

                activityId LIKE ?

                OR name LIKE ?

            )

        ORDER BY name ASC

        `,

        [

            query,

            query

        ],

        (error, rows) => {

            if (error) {

                return res.status(500).json(error);

            }

            res.json(rows);

        }

    );

};

// ======================================
// Crear
// ======================================

const createActivity = (req, res) => {

    generateActivityId((error, activityId) => {

        if (error) {

            return res.status(500).json(error);

        }

        const {

            name,

            icon,

            color,

            duration,

            suggestedCapacity,

            description

        } = req.body;

        const now = new Date().toISOString();

        db.run(

            `

            INSERT INTO activities(

                activityId,

                name,

                icon,

                color,

                duration,

                suggestedCapacity,

                description,

                isActive,

                createdAt,

                updatedAt
            )

            VALUES(?,?,?,?,?,?,?,?,?,?)

            `,

            [

                activityId,

                name,

                icon,

                color,

                duration,

                suggestedCapacity,

                description,

                1,

                now,

                now

            ],

            function (error) {

                if (error) {

                    return res.status(500).json(error);

                }

                res.status(201).json({

                    activityId

                });

            }

        );

    });

};

// ======================================
// Actualizar
// ======================================

const updateActivity = (req, res) => {

    const {

        name,

        icon,

        color,

        duration,

        suggestedCapacity,

        description

    } = req.body;

    db.run(

        `

        UPDATE activities

        SET

            name=?,

            icon=?,

            color=?,

            duration=?,

            suggestedCapacity=?,

            description=?,

            updatedAt=?

        WHERE activityId=?

        `,

        [

            name,

            icon,

            color,

            duration,

            suggestedCapacity,

            description,

            new Date().toISOString(),

            req.params.activityId

        ],

        function (error) {

            if (error) {

                return res.status(500).json(error);

            }

            res.json({

                message: "Updated"

            });

        }

    );

};

// ======================================
// Desactivar
// ======================================

const deactivateActivity = (req, res) => {

    db.run(

        `

        UPDATE activities

        SET

            isActive=0,

            updatedAt=?

        WHERE activityId=?

        `,

        [

            new Date().toISOString(),

            req.params.activityId

        ],

        function (error) {

            if (error) {

                return res.status(500).json(error);

            }

            res.json({

                message: "Deactivated"

            });

        }

    );

};
// ======================================
// Select
// ======================================

const getActivityOptions = (req, res) => {

    db.all(

        `

        SELECT

            activityId,

            name,

            icon,

            color,

            duration,

            suggestedCapacity

        FROM activities

        WHERE isActive = 1

        ORDER BY name

        `,

        [],

        (error, rows) => {

            if (error) {

                return res.status(500).json(error);

            }

            res.json(rows);

        }

    );

};

module.exports = {

    getAllActivities,

    getActivityById,

    searchActivities,

    createActivity,

    updateActivity,

    deactivateActivity,

    getActivityOptions

};