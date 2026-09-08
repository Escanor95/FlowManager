-- AURAACCESS / RESERVATIONS
-- Idempotent schema kept in sync with server/config/database.js.

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
        (clientId IS NOT NULL AND userId IS NULL)
        OR
        (clientId IS NULL AND userId IS NOT NULL)
    ),
    FOREIGN KEY(clientId) REFERENCES clients(clientId),
    FOREIGN KEY(userId) REFERENCES users(userId),
    FOREIGN KEY(scheduleId) REFERENCES schedules(scheduleId)
);

CREATE INDEX IF NOT EXISTS idx_reservations_schedule_date_status
ON reservations(scheduleId, reservationDate, status);
