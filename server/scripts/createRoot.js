/*
====================================================

    AURA ACCESS PRO

    CREATE ROOT USER

====================================================
*/

const bcrypt = require("bcrypt");
const db = require("../config/database");


async function createRoot() {

    try {

        const email =
            "nestormanzanarez120@gmail.com"
                .trim()
                .toLowerCase();


        const password =
            "Riddick9584#3362";


        const fullName =
            "Nestor Manzanarez";


        // ============================================
        // REVISAR SI YA EXISTE EL ROOT
        // ============================================

        db.get(
            `
            SELECT
                userId,
                email,
                isRoot
            FROM users
            WHERE email = ?
            LIMIT 1
            `,
            [email],
            async (error, user) => {

                if (error) {

                    console.error(
                        "❌ Error al buscar Root:",
                        error.message
                    );

                    db.close();

                    return;

                }


                const passwordHash =
                    await bcrypt.hash(
                        password,
                        10
                    );


                const now =
                    new Date().toISOString();


                // ====================================
                // SI YA EXISTE → ACTUALIZAR
                // ====================================

                if (user) {

                    db.run(
                        `
                        UPDATE users

                        SET

                            fullName = ?,

                            passwordHash = ?,

                            role = 'manager',

                            isRoot = 1,

                            isActive = 1,

                            updatedAt = ?

                        WHERE email = ?
                        `,
                        [
                            fullName,
                            passwordHash,
                            now,
                            email
                        ],
                        error => {

                            if (error) {

                                console.error(
                                    "❌ Error al actualizar Root:",
                                    error.message
                                );

                            }
                            else {

                                console.log(
                                    "✅ Usuario Root actualizado correctamente."
                                );

                            }

                            db.close();

                        }
                    );

                    return;

                }


                // ====================================
                // CREAR ROOT NUEVO
                // ====================================

                const userId =
                    `ROOT-${Date.now()}`;


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

                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    `,
                    [
                        userId,

                        fullName,

                        email,

                        passwordHash,

                        "manager",

                        null,

                        null,

                        1,

                        1,

                        now,

                        now
                    ],
                    error => {

                        if (error) {

                            console.error(
                                "❌ Error al crear Root:",
                                error.message
                            );

                        }
                        else {

                            console.log(
                                "✅ Usuario Root creado correctamente."
                            );

                            console.log(
                                `📧 Email: ${email}`
                            );

                        }

                        db.close();

                    }
                );

            }
        );

    }

    catch (error) {

        console.error(
            "❌ Error inesperado:",
            error
        );

        db.close();

    }

}


createRoot();