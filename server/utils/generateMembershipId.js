const db = require("../config/database");

function generateMembershipId(callback) {

    db.get(

        `SELECT membershipId
         FROM memberships
         ORDER BY id DESC
         LIMIT 1`,

        [],

        (error, row) => {

            if (error) {

                return callback(error);

            }

            let nextNumber = 1;

            if (row && row.membershipId) {

                nextNumber = parseInt(

                    row.membershipId.replace("MB-", "")

                ) + 1;

            }

            const membershipId =
                `MB-${String(nextNumber).padStart(4, "0")}`;

            callback(null, membershipId);

        }

    );

}

module.exports = generateMembershipId;