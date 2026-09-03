/*
====================================================

    FLOWMANAGER

    RESERVATION ROUTES

====================================================
*/

const express =
    require("express");


const router =
    express.Router();


const {

    authenticate

} = require(
    "../middleware/auth.middleware"
);


const {

    getAllReservations,

    getReservationById,

    getReservationsByClient,

    getReservationsByCoach,

    getAvailability,

    getCoachAvailability,

    createReservation,

    createReservationsBatch,

    createCoachReservationsBatch,

    cancelReservation,

    getRecentReservations,

    getUpcomingClasses,

    getClassOccupancy

} = require(
    "../controllers/reservation.controller"
);


// ====================================================
// VALIDAR CONTROLLER
// ====================================================

const requiredFunctions = {

    getAllReservations,

    getReservationById,

    getReservationsByClient,

    getReservationsByCoach,

    getAvailability,

    getCoachAvailability,

    createReservation,

    createReservationsBatch,

    createCoachReservationsBatch,

    cancelReservation,

    getRecentReservations,

    getUpcomingClasses,

    getClassOccupancy

};


for (

    const [

        name,

        handler

    ]

    of Object.entries(
        requiredFunctions
    )

) {

    if (

        typeof handler !==
        "function"

    ) {

        console.error(

            `❌ ERROR: ${name} no fue exportada correctamente desde reservation.controller.js`

        );

        throw new Error(

            `La función ${name} no existe o no fue exportada correctamente.`

        );

    }

}


// ====================================================
// DISPONIBILIDAD CLIENTA
// ====================================================

router.get(

    "/availability",

    getAvailability

);


// ====================================================
// DISPONIBILIDAD COACH
//
// El coach debe estar autenticado.
//
// coachId NO viene del frontend.
// ====================================================

router.get(

    "/coach/availability",

    authenticate,

    getCoachAvailability

);


// ====================================================
// RESERVACIONES DEL COACH
//
// Solo devuelve las reservaciones del coach
// autenticado.
// ====================================================

router.get(

    "/coach",

    authenticate,

    getReservationsByCoach

);


// ====================================================
// CREAR RESERVACIONES DEL COACH
//
// El coach debe estar autenticado.
//
// El backend obtiene coachId desde req.user.
// ====================================================

router.post(

    "/coach/batch",

    authenticate,

    createCoachReservationsBatch

);


// ====================================================
// RESERVACIONES RECIENTES
// ====================================================

router.get(

    "/recent",

    getRecentReservations

);


// ====================================================
// PRÓXIMAS CLASES
// ====================================================

router.get(

    "/upcoming",

    getUpcomingClasses

);


// ====================================================
// OCUPACIÓN POR CLASE
// ====================================================

router.get(

    "/occupancy",

    getClassOccupancy

);


// ====================================================
// RESERVACIONES POR CLIENTE
//
// IMPORTANTE:
// Debe ir antes de "/:reservationId"
// ====================================================

router.get(

    "/client/:clientId",

    getReservationsByClient

);


// ====================================================
// CREAR LOTE CLIENTA
// ====================================================

router.post(

    "/batch",

    createReservationsBatch

);


// ====================================================
// TODAS
// ====================================================

router.get(

    "/",

    getAllReservations

);


// ====================================================
// CREAR UNA
// ====================================================

router.post(

    "/",

    createReservation

);


// ====================================================
// CANCELAR
//
// Debe ir antes de "/:reservationId"
// ====================================================

router.delete(

    "/:reservationId",

    cancelReservation

);


// ====================================================
// UNA RESERVACIÓN
// ====================================================

router.get(

    "/:reservationId",

    getReservationById

);


// ====================================================
// EXPORTAR
// ====================================================

module.exports =
    router;