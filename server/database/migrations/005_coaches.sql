/*
====================================================

    AURAACCESS

    COACHES

====================================================
*/

CREATE TABLE IF NOT EXISTS coaches (

    id INTEGER PRIMARY KEY AUTOINCREMENT,

    coachId TEXT UNIQUE NOT NULL,

    fullName TEXT NOT NULL,

    phone TEXT,

    email TEXT UNIQUE,

    paymentPerClass REAL DEFAULT 0,

    isActive INTEGER DEFAULT 1,

    createdAt TEXT,

    updatedAt TEXT

);


/*
====================================================

    ÍNDICES

====================================================
*/

CREATE INDEX IF NOT EXISTS idx_coaches_active

ON coaches(isActive);


CREATE INDEX IF NOT EXISTS idx_coaches_email

ON coaches(email);