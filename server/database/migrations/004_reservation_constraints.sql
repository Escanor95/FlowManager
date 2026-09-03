DROP INDEX IF EXISTS idx_reservations_confirmed_unique;


CREATE INDEX IF NOT EXISTS
idx_reservations_schedule_date_status

ON reservations (

    scheduleId,
    reservationDate,
    status

);