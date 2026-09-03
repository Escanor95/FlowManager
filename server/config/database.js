/*
====================================================

    AURA ACCESS PRO

    DATABASE CONFIGURATION

====================================================
*/

const sqlite3 =
    require("sqlite3").verbose();

const path =
    require("path");


// ====================================================
// DATABASE PATH
// ====================================================

const databasePath =
    path.join(
        __dirname,
        "../../database/auraaccess.db"
    );


// ====================================================
// DATABASE CONNECTION
// ====================================================

const db =
    new sqlite3.Database(

        databasePath,

        error => {

            if (error) {

                console.error(
                    "❌ Database connection error:",
                    error.message
                );

                return;

            }


            console.log(
                "✅ SQLite Connected"
            );

            initializeDatabase();

        }

    );


// ====================================================
// SQLITE HELPERS
// ====================================================

function run(
    sql,
    params = []
) {

    return new Promise(

        (
            resolve,
            reject
        ) => {

            db.run(

                sql,

                params,

                function (
                    error
                ) {

                    if (error) {

                        reject(
                            error
                        );

                        return;

                    }


                    resolve({

                        changes:
                            this.changes,

                        lastID:
                            this.lastID

                    });

                }

            );

        }

    );

}


function all(
    sql,
    params = []
) {

    return new Promise(

        (
            resolve,
            reject
        ) => {

            db.all(

                sql,

                params,

                (
                    error,
                    rows
                ) => {

                    if (error) {

                        reject(
                            error
                        );

                        return;

                    }


                    resolve(
                        rows
                    );

                }

            );

        }

    );

}


// ====================================================
// OBTENER COLUMNAS
// ====================================================

async function getColumnNames(
    tableName
) {

    const columns =
        await all(
            `PRAGMA table_info(${tableName})`
        );


    return columns.map(
        column =>
            column.name
    );

}


// ====================================================
// AGREGAR COLUMNA SI NO EXISTE
// ====================================================

async function addColumnIfMissing(
    tableName,
    columnName,
    definition
) {

    const columns =
        await getColumnNames(
            tableName
        );


    if (
        columns.includes(
            columnName
        )
    ) {

        return;

    }


    await run(`

        ALTER TABLE ${tableName}

        ADD COLUMN ${columnName} ${definition}

    `);

}


// ====================================================
// INICIALIZAR BASE DE DATOS
// ====================================================

async function initializeDatabase() {

    try {

        // =============================================
        // FOREIGN KEYS DESACTIVADAS DURANTE MIGRACIÓN
        // =============================================

        await run(
            "PRAGMA foreign_keys = OFF"
        );


        // =================================================
        // MEMBERSHIPS
        // =================================================

        await run(`

            CREATE TABLE IF NOT EXISTS memberships (

                id INTEGER PRIMARY KEY AUTOINCREMENT,

                membershipId TEXT UNIQUE,

                name TEXT NOT NULL,

                price REAL NOT NULL,

                classes INTEGER,

                durationDays INTEGER NOT NULL,

                description TEXT,

                isActive INTEGER DEFAULT 1,

                createdAt TEXT,

                updatedAt TEXT

            )

        `);


        // =================================================
        // CLIENTS
        // =================================================

        await run(`

            CREATE TABLE IF NOT EXISTS clients (

                id INTEGER PRIMARY KEY AUTOINCREMENT,

                clientId TEXT UNIQUE,

                fullName TEXT NOT NULL,

                phone TEXT,

                email TEXT,

                photoUrl TEXT,

                membershipId TEXT,

                membershipStatus TEXT,

                remainingClasses INTEGER DEFAULT 0,

                startDate TEXT,

                endDate TEXT,

                emergencyContactName TEXT,

                emergencyContactPhone TEXT,

                medicalNotes TEXT,

                createdAt TEXT,

                updatedAt TEXT,

                isActive INTEGER DEFAULT 1,

                FOREIGN KEY (membershipId)

                    REFERENCES memberships(membershipId)

            )

        `);


        await addColumnIfMissing(
            "clients",
            "photoUrl",
            "TEXT"
        );


        // =================================================
        // COACHES
        // =================================================

        await run(`

            CREATE TABLE IF NOT EXISTS coaches (

                id INTEGER PRIMARY KEY AUTOINCREMENT,

                coachId TEXT UNIQUE NOT NULL,

                fullName TEXT NOT NULL,

                phone TEXT,

                email TEXT UNIQUE,

                photoUrl TEXT,

                paymentPerClass REAL DEFAULT 0,

                notes TEXT,

                isActive INTEGER DEFAULT 1,

                createdAt TEXT,

                updatedAt TEXT

            )

        `);


        await addColumnIfMissing(
            "coaches",
            "photoUrl",
            "TEXT"
        );


        await addColumnIfMissing(
            "coaches",
            "notes",
            "TEXT"
        );


        // =================================================
        // USERS
        // =================================================

        await run(`

            CREATE TABLE IF NOT EXISTS users (

                id INTEGER PRIMARY KEY AUTOINCREMENT,

                userId TEXT UNIQUE NOT NULL,

                fullName TEXT NOT NULL,

                username TEXT UNIQUE,

                email TEXT UNIQUE NOT NULL,

                passwordHash TEXT NOT NULL,

                role TEXT NOT NULL DEFAULT 'reception',

                clientId TEXT,

                coachId TEXT,

                photoUrl TEXT,

                isRoot INTEGER DEFAULT 0,

                isActive INTEGER DEFAULT 1,

                lastLoginAt TEXT,

                createdAt TEXT,

                updatedAt TEXT,

                FOREIGN KEY(clientId)

                    REFERENCES clients(clientId),

                FOREIGN KEY(coachId)

                    REFERENCES coaches(coachId)

            )

        `);


        await addColumnIfMissing(
            "users",
            "username",
            "TEXT"
        );


        await addColumnIfMissing(
            "users",
            "coachId",
            "TEXT"
        );


        await addColumnIfMissing(
            "users",
            "photoUrl",
            "TEXT"
        );


        await addColumnIfMissing(
            "users",
            "isRoot",
            "INTEGER DEFAULT 0"
        );


        // =================================================
        // ACTIVITIES
        // =================================================

        await run(`

            CREATE TABLE IF NOT EXISTS activities (

                id INTEGER PRIMARY KEY AUTOINCREMENT,

                activityId TEXT UNIQUE,

                name TEXT NOT NULL,

                icon TEXT NOT NULL,

                color TEXT NOT NULL,

                duration INTEGER NOT NULL,

                suggestedCapacity INTEGER,

                description TEXT,

                isActive INTEGER DEFAULT 1,

                createdAt TEXT,

                updatedAt TEXT

            )

        `);


        // =================================================
        // SCHEDULES
        // =================================================

        await run(`

            CREATE TABLE IF NOT EXISTS schedules (

                id INTEGER PRIMARY KEY AUTOINCREMENT,

                scheduleId TEXT UNIQUE,

                activityId TEXT NOT NULL,

                coachId TEXT,

                weekday TEXT NOT NULL,

                startTime TEXT NOT NULL,

                duration INTEGER NOT NULL,

                capacity INTEGER NOT NULL,

                wellhubSuggested INTEGER DEFAULT 0,

                totalpassSuggested INTEGER DEFAULT 0,

                isRecurring INTEGER DEFAULT 1,

                repeatRule TEXT DEFAULT 'WEEKLY',

                repeatFrom TEXT,

                repeatUntil TEXT,

                isActive INTEGER DEFAULT 1,

                createdAt TEXT,

                updatedAt TEXT,

                FOREIGN KEY(activityId)

                    REFERENCES activities(activityId),

                FOREIGN KEY(coachId)

                    REFERENCES coaches(coachId)

            )

        `);


        await addColumnIfMissing(
            "schedules",
            "coachId",
            "TEXT"
        );


        await addColumnIfMissing(
            "schedules",
            "repeatFrom",
            "TEXT"
        );


        await addColumnIfMissing(
            "schedules",
            "repeatUntil",
            "TEXT"
        );


        // =================================================
        // RESERVATIONS
        //
        // TABLA DE CLIENTAS.
        //
        // NO SE ELIMINA NUNCA DURANTE ESTA MIGRACIÓN.
        // =================================================

        await run(`

            CREATE TABLE IF NOT EXISTS reservations (

                reservationId TEXT PRIMARY KEY,

                clientId TEXT,

                userId TEXT,

                clientMembershipId TEXT,

                scheduleId TEXT NOT NULL,

                reservationDate TEXT NOT NULL,

                status TEXT NOT NULL DEFAULT 'CONFIRMED',

                createdAt TEXT NOT NULL,

                updatedAt TEXT NOT NULL,

                CHECK (

                    (

                        clientId IS NOT NULL

                        AND

                        userId IS NULL

                    )

                    OR

                    (

                        clientId IS NULL

                        AND

                        userId IS NOT NULL

                    )

                ),

                FOREIGN KEY(clientId)

                    REFERENCES clients(clientId),

                FOREIGN KEY(userId)

                    REFERENCES users(userId),

                FOREIGN KEY(scheduleId)

                    REFERENCES schedules(scheduleId)

            )

        `);


        // =================================================
        // RESERVATIONS MIGRATION
        // =================================================

        const reservationColumns =
            await getColumnNames(
                "reservations"
            );


        // -------------------------------------------------
        // SI userId NO EXISTE
        //
        // Se reconstruye conservando los datos.
        // -------------------------------------------------

        if (
            !reservationColumns.includes(
                "userId"
            )
        ) {

            console.log(
                "🔄 Actualizando tabla reservations..."
            );


            await run(`

                DROP INDEX IF EXISTS
                idx_reservations_confirmed_unique

            `);


            await run(`

                DROP INDEX IF EXISTS
                idx_reservations_schedule_date_status

            `);


            await run(`

                ALTER TABLE reservations

                RENAME TO reservations_old

            `);


            await run(`

                CREATE TABLE reservations (

                    reservationId TEXT PRIMARY KEY,

                    clientId TEXT,

                    userId TEXT,

                    clientMembershipId TEXT,

                    scheduleId TEXT NOT NULL,

                    reservationDate TEXT NOT NULL,

                    status TEXT NOT NULL DEFAULT 'CONFIRMED',

                    createdAt TEXT NOT NULL,

                    updatedAt TEXT NOT NULL,

                    CHECK (

                        (

                            clientId IS NOT NULL

                            AND

                            userId IS NULL

                        )

                        OR

                        (

                            clientId IS NULL

                            AND

                            userId IS NOT NULL

                        )

                    ),

                    FOREIGN KEY(clientId)

                        REFERENCES clients(clientId),

                    FOREIGN KEY(userId)

                        REFERENCES users(userId),

                    FOREIGN KEY(scheduleId)

                        REFERENCES schedules(scheduleId)

                )

            `);


            const oldColumns =
                await getColumnNames(
                    "reservations_old"
                );


            const membershipExpression =

                oldColumns.includes(
                    "clientMembershipId"
                )

                    ? "clientMembershipId"

                    : "NULL";


            await run(`

                INSERT INTO reservations (

                    reservationId,

                    clientId,

                    userId,

                    clientMembershipId,

                    scheduleId,

                    reservationDate,

                    status,

                    createdAt,

                    updatedAt

                )

                SELECT

                    reservationId,

                    clientId,

                    NULL,

                    ${membershipExpression},

                    scheduleId,

                    reservationDate,

                    status,

                    createdAt,

                    updatedAt

                FROM reservations_old

            `);


            await run(`

                DROP TABLE reservations_old

            `);


            console.log(
                "✅ reservations migrada conservando los datos."
            );

        }

        else {

            await addColumnIfMissing(
                "reservations",
                "clientMembershipId",
                "TEXT"
            );

        }


        await run(`

            CREATE INDEX IF NOT EXISTS

            idx_reservations_schedule_date_status

            ON reservations (

                scheduleId,

                reservationDate,

                status

            )

        `);


        // =================================================
        // COACH RESERVATIONS
        // =================================================
        //
        // IMPORTANTE:
        // Esta tabla es independiente de reservations.
        //
        // NO BORRA RESERVACIONES DE CLIENTAS.
        // =================================================

        await run(`

            CREATE TABLE IF NOT EXISTS coach_reservations (

                reservationId TEXT PRIMARY KEY,

                userId TEXT,

                coachId TEXT,

                scheduleId TEXT,

                reservationDate TEXT,

                status TEXT DEFAULT 'CONFIRMED',

                createdAt TEXT,

                updatedAt TEXT

            )

        `);


        // =================================================
        // COACH RESERVATIONS MIGRATION
        // =================================================

        await addColumnIfMissing(
            "coach_reservations",
            "userId",
            "TEXT"
        );


        await addColumnIfMissing(
            "coach_reservations",
            "coachId",
            "TEXT"
        );


        await addColumnIfMissing(
            "coach_reservations",
            "scheduleId",
            "TEXT"
        );


        await addColumnIfMissing(
            "coach_reservations",
            "reservationDate",
            "TEXT"
        );


        await addColumnIfMissing(
            "coach_reservations",
            "status",
            "TEXT DEFAULT 'CONFIRMED'"
        );


        await addColumnIfMissing(
            "coach_reservations",
            "createdAt",
            "TEXT"
        );


        await addColumnIfMissing(
            "coach_reservations",
            "updatedAt",
            "TEXT"
        );


        // =================================================
        // COACH INDEXES
        //
        // SE CREAN SOLAMENTE DESPUÉS DE CONFIRMAR
        // QUE TODAS LAS COLUMNAS EXISTEN.
        // =================================================

        await run(`

            CREATE INDEX IF NOT EXISTS

            idx_coach_reservations_coach_date

            ON coach_reservations (

                coachId,

                reservationDate,

                status

            )

        `);


        await run(`

            CREATE INDEX IF NOT EXISTS

            idx_coach_reservations_schedule_date

            ON coach_reservations (

                scheduleId,

                reservationDate,

                status

            )

        `);


        await run(`

            CREATE INDEX IF NOT EXISTS

            idx_coach_reservations_user

            ON coach_reservations (

                userId

            )

        `);


        // =================================================
        // ATTENDANCES
        // =================================================

        await run(`

            CREATE TABLE IF NOT EXISTS attendances (

                id INTEGER PRIMARY KEY AUTOINCREMENT,

                attendanceId TEXT UNIQUE,

                clientId TEXT,

                userId TEXT,

                membershipId TEXT,

                clientMembershipId TEXT,

                reservationId TEXT,

                attendanceDate TEXT NOT NULL,

                remainingClassesAfter INTEGER,

                createdAt TEXT,

                CHECK (

                    (

                        clientId IS NOT NULL

                        AND

                        userId IS NULL

                    )

                    OR

                    (

                        clientId IS NULL

                        AND

                        userId IS NOT NULL

                    )

                ),

                FOREIGN KEY(clientId)

                    REFERENCES clients(clientId),

                FOREIGN KEY(userId)

                    REFERENCES users(userId),

                FOREIGN KEY(membershipId)

                    REFERENCES memberships(membershipId),

                FOREIGN KEY(reservationId)

                    REFERENCES reservations(reservationId)

            )

        `);


        // =================================================
        // ATTENDANCES MIGRATION
        // =================================================

        const attendanceColumns =
            await getColumnNames(
                "attendances"
            );


        if (
            !attendanceColumns.includes(
                "userId"
            )
        ) {

            console.log(
                "🔄 Actualizando tabla attendances..."
            );


            await run(`

                DROP INDEX IF EXISTS

                idx_attendances_reservationId

            `);


            await run(`

                ALTER TABLE attendances

                RENAME TO attendances_old

            `);


            await run(`

                CREATE TABLE attendances (

                    id INTEGER PRIMARY KEY AUTOINCREMENT,

                    attendanceId TEXT UNIQUE,

                    clientId TEXT,

                    userId TEXT,

                    membershipId TEXT,

                    clientMembershipId TEXT,

                    reservationId TEXT,

                    attendanceDate TEXT NOT NULL,

                    remainingClassesAfter INTEGER,

                    createdAt TEXT,

                    CHECK (

                        (

                            clientId IS NOT NULL

                            AND

                            userId IS NULL

                        )

                        OR

                        (

                            clientId IS NULL

                            AND

                            userId IS NOT NULL

                        )

                    ),

                    FOREIGN KEY(clientId)

                        REFERENCES clients(clientId),

                    FOREIGN KEY(userId)

                        REFERENCES users(userId),

                    FOREIGN KEY(membershipId)

                        REFERENCES memberships(membershipId),

                    FOREIGN KEY(reservationId)

                        REFERENCES reservations(reservationId)

                )

            `);


            const oldAttendanceColumns =
                await getColumnNames(
                    "attendances_old"
                );


            const membershipExpression =

                oldAttendanceColumns.includes(
                    "clientMembershipId"
                )

                    ? "clientMembershipId"

                    : "NULL";


            const reservationExpression =

                oldAttendanceColumns.includes(
                    "reservationId"
                )

                    ? "reservationId"

                    : "NULL";


            await run(`

                INSERT INTO attendances (

                    id,

                    attendanceId,

                    clientId,

                    userId,

                    membershipId,

                    clientMembershipId,

                    reservationId,

                    attendanceDate,

                    remainingClassesAfter,

                    createdAt

                )

                SELECT

                    id,

                    attendanceId,

                    clientId,

                    NULL,

                    membershipId,

                    ${membershipExpression},

                    ${reservationExpression},

                    attendanceDate,

                    remainingClassesAfter,

                    createdAt

                FROM attendances_old

            `);


            await run(`

                DROP TABLE attendances_old

            `);


            console.log(
                "✅ attendances migrada conservando los datos."
            );

        }

        else {

            await addColumnIfMissing(
                "attendances",
                "clientMembershipId",
                "TEXT"
            );


            await addColumnIfMissing(
                "attendances",
                "reservationId",
                "TEXT"
            );

        }


        await run(`

            CREATE INDEX IF NOT EXISTS

            idx_attendances_reservationId

            ON attendances(

                reservationId

            )

        `);


        // =================================================
        // REACTIVAR FOREIGN KEYS
        // =================================================

        await run(
            "PRAGMA foreign_keys = ON"
        );


        console.log(
            "✅ Base de datos inicializada correctamente."
        );


        // =================================================
        // VERIFICACIÓN DE SCHEDULES
        // =================================================

        const scheduleCount =
            await all(`

                SELECT

                    COUNT(*) AS total

                FROM schedules

            `);


        console.log(

            `📅 Horarios encontrados: ${scheduleCount[0]?.total || 0
            }`

        );

    }

    catch (
    error
    ) {

        console.error(

            "❌ Error inicializando la base de datos:",

            error

        );

    }

}


// ====================================================
// EXPORT
// ====================================================

module.exports =
    db;