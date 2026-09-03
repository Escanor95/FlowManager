/*
====================================================

    AURA ACCESS PRO

    COACH ROUTES

====================================================
*/

const express =
    require("express");


const router =
    express.Router();


const {

    getAllCoaches,

    getActiveCoaches,

    createCoach,

    updateCoach,

    deactivateCoach,

    activateCoach

} = require(
    "../controllers/coach.controller"
);


const {

    authenticate,

    authorizeRoles

} = require(
    "../middleware/auth.middleware"
);


// ====================================================
// AUTENTICACIÓN
// ====================================================

router.use(
    authenticate
);


// ====================================================
// LISTAR COACHES ACTIVOS
//
// Debe ir antes de "/"
// ====================================================

router.get(
    "/active",
    getActiveCoaches
);


// ====================================================
// LISTAR TODOS
// ====================================================

router.get(
    "/",
    authorizeRoles(
        "manager"
    ),
    getAllCoaches
);


// ====================================================
// CREAR
// ====================================================

router.post(
    "/",
    authorizeRoles(
        "manager"
    ),
    createCoach
);


// ====================================================
// ACTUALIZAR
// ====================================================

router.put(
    "/:coachId",
    authorizeRoles(
        "manager"
    ),
    updateCoach
);


// ====================================================
// DESACTIVAR
// ====================================================

router.patch(
    "/:coachId/deactivate",
    authorizeRoles(
        "manager"
    ),
    deactivateCoach
);


// ====================================================
// ACTIVAR
// ====================================================

router.patch(
    "/:coachId/activate",
    authorizeRoles(
        "manager"
    ),
    activateCoach
);


// ====================================================
// EXPORTAR
// ====================================================

module.exports =
    router;