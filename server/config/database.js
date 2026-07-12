const sqlite3 = require("sqlite3").verbose();
const path = require("path");

// Ruta donde se guardará la base de datos
const databasePath = path.join(
    __dirname,
    "../../database/auraaccess.db"
);

// Crear o abrir la base de datos
const db = new sqlite3.Database(databasePath, (error) => {

    if (error) {

        console.error("❌ Database connection error:", error.message);

    } else {

        console.log("✅ SQLite Connected");

    }

});

// Crear las tablas al iniciar el servidor
db.serialize(() => {

    db.run(`
        CREATE TABLE IF NOT EXISTS clients (

            id INTEGER PRIMARY KEY AUTOINCREMENT,

            clientId TEXT UNIQUE,

            fullName TEXT NOT NULL,

            phone TEXT,

            email TEXT,

            membershipType TEXT,

            membershipStatus TEXT,

            remainingClasses INTEGER,

            startDate TEXT,

            endDate TEXT,

            emergencyContactName TEXT,

            emergencyContactPhone TEXT,

            medicalNotes TEXT,

            createdAt TEXT,

            updatedAt TEXT,

            isActive INTEGER

        )
    `);

});

// Exportar la conexión para usarla en otros archivos
module.exports = db;