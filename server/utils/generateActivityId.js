const db = require("../config/database");

function generateActivityId(callback) {

    db.get(

        `

        SELECT COUNT(*) AS total

        FROM activities

        `,

        [],

        (error, row) => {

            if (error) {

                return callback(error);

            }

            const nextId = row.total + 1;

            const activityId =

                `AC-${String(nextId).padStart(4, "0")}`;

            callback(

                null,

                activityId

            );

        }

    );

}

module.exports = generateActivityId;