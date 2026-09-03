/*
====================================================

    AURA ACCESS

    ROOT USER SEED

====================================================
*/

const bcrypt = require("bcrypt");
const db = require("../config/database");

async function createRootUser() {

    try {

        const fullName =
            "Nestor Manzanarez";

        const email =
            "nestormanzanarez120@gmail.com";

        const password =
            "Riddick9584#3362";


        const normalizedEmail =
            email
                .trim()
                .toLowerCase();


        // ================================================
        // VERIFICAR SI YA EXISTE
        // ================================================

        db.get(
            `
            SELECT userId
            FROM users
            WHERE email = ?
            LIMIT 1
            `,
            [
                normalizedEmail
            ],
            async (error, user) => {

                if (error) {

                    console.error(
                        "❌ Error al buscar Root:",
                        error.message
                    );

                    return;

                }


                if (user) {

                    console.log(
                        "⚠️ El usuario Root ya existe."
                    );

                    return;

                }


                // ================================================
                // HASH PASSWORD
                // ================================================

                const passwordHash =
                    await bcrypt.hash(
                        password,
                        10
                    );


                const now =
                    new Date().toISOString();


                const userId =
                    "ROOT-001";


                // ================================================
                // CREAR ROOT
                // ================================================

                db.run(
                    `
                    INSERT INTO users (

                        userId,
                        fullName,
                        email,
                        passwordHash,
                        role,
                        clientId,
                        coachId,
                        isRoot,
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
                        NULL,
                        NULL,
                        1,
                        1,
                        ?,
                        ?

                    )
                    `,
                    [

                        userId,

                        fullName,

                        normalizedEmail,

                        passwordHash,

                        "manager",

                        now,

                        now

                    ],

                    error => {

                        if (error) {

                            console.error(
                                "❌ Error al crear Root:",
                                error.message
                            );

                            return;

                        }


                        console.log(
                            "✅ Usuario Root creado correctamente."
                        );

                        console.log(
                            `📧 Email: ${normalizedEmail}`
                        );

                        db.close();

                    }

                );

            }
        );

    }

    catch (error) {

        console.error(
            "❌ Error:",
            error
        );

    }

}


createRootUser();