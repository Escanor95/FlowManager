const db = require("../config/database");

function generateScheduleId(callback) {

    db.get(

        `

        SELECT scheduleId

        FROM schedules

        ORDER BY id DESC

        LIMIT 1

        `,

        [],

        (error, row) => {

            if (error) {

                return callback(error);

            }

            let next = 1;

            if (row) {

                next =

                    parseInt(

                        row.scheduleId.replace(

                            "SCH-",

                            ""

                        )

                    ) + 1;

            }

            const scheduleId =

                `SCH-${String(next).padStart(4, "0")}`;

            callback(

                null,

                scheduleId

            );

        }

    );

}

module.exports = generateScheduleId;