const db = require("../config/database");

function generateClientId(callback) {

    db.get(
        "SELECT COUNT(*) AS total FROM clients",
        [],
        (error, row) => {

            if (error) {
                return callback(error);
            }

            const nextNumber = row.total + 1;

            const clientId = `AU-${String(nextNumber).padStart(3, "0")}`;

            callback(null, clientId);

        }
    );

}

module.exports = generateClientId;