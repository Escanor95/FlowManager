const bcrypt = require("bcrypt");
const db = require("../config/database");

const email =
    process.argv[2] ||
    "admin@flowmanager.local";

const password =
    process.argv[3] ||
    "FlowManager123!";

const fullName =
    process.argv[4] ||
    "Gerenta FlowManager";

async function createManager() {

    const passwordHash =
        await bcrypt.hash(password, 10);

    const userId =
        "USR-" +
        Date.now();

    db.run(
        `
        INSERT INTO users (
            userId,
            fullName,
            email,
            passwordHash,
            role,
            isActive,
            createdAt,
            updatedAt
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
            userId,
            fullName,
            email.toLowerCase(),
            passwordHash,
            "manager",
            1,
            new Date().toISOString(),
            new Date().toISOString()
        ],
        function (error) {

            if (error) {

                if (
                    error.message.includes(
                        "UNIQUE constraint failed: users.email"
                    )
                ) {

                    console.log(
                        "⚠️ Ese correo ya existe."
                    );

                }
                else {

                    console.error(
                        "❌ Error:",
                        error.message
                    );

                }

                process.exit(1);

            }

            console.log("");
            console.log(
                "✅ Gerenta creada correctamente."
            );
            console.log(
                "Usuario:",
                email
            );
            console.log(
                "Contraseña:",
                password
            );
            console.log(
                "Rol: manager"
            );
            console.log("");

            db.close();

        }
    );

}

createManager();