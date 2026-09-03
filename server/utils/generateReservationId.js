const db = require("../config/database");

const generateReservationId = (callback) => {

    db.get(

        `

        SELECT MAX(CAST(SUBSTR(reservationId, 4) AS INTEGER)) AS lastNumber
        FROM reservations

        `,

        [],

        (error, row) => {

            if (error) {

                return callback(error);

            }

            let nextNumber = 1;

            if (row && Number.isInteger(row.lastNumber)) {

                nextNumber = row.lastNumber + 1;

            }

            const reservationId =

                `RS-${String(nextNumber).padStart(4, "0")}`;

            callback(

                null,

                reservationId

            );

        }

    );

};

module.exports = generateReservationId;
