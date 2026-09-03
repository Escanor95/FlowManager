/*
====================================================

    FLOWMANAGER

    SCHEDULE ROUTES

====================================================
*/

const express =
    require("express");


const router =
    express.Router();


const {

    authenticate,

    authorizeRoles

} = require(
    "../middleware/auth.middleware"
);


const {

    getAllSchedules,

    getScheduleById,

    createSchedule,

    updateSchedule,

    deactivateSchedule,

    duplicateSchedule

} = require(
    "../controllers/schedule.controller"
);


// ====================================================
// OBTENER TODOS LOS HORARIOS
//
// Disponible para usuarios autenticados.
// El frontend de Coach necesita coachId.
// ====================================================

router.get(

    "/",

    authenticate,

    getAllSchedules

);


// ====================================================
// DUPLICAR HORARIO
//
// SOLO PERSONAL ADMINISTRATIVO
// ====================================================

router.post(

    "/duplicate",

    authenticate,

    authorizeRoles(
        "manager"
    ),

    duplicateSchedule

);


// ====================================================
// OBTENER UN HORARIO
//
// Disponible para usuarios autenticados.
// ====================================================

router.get(

    "/:scheduleId",

    authenticate,

    getScheduleById

);


// ====================================================
// CREAR HORARIO
//
// SOLO MANAGER.
// ====================================================

router.post(

    "/",

    authenticate,

    authorizeRoles(
        "manager"
    ),

    createSchedule

);


// ====================================================
// ACTUALIZAR HORARIO
//
// SOLO MANAGER.
// ====================================================

router.put(

    "/:scheduleId",

    authenticate,

    authorizeRoles(
        "manager"
    ),

    updateSchedule

);


// ====================================================
// DESACTIVAR HORARIO
//
// SOLO MANAGER.
// ====================================================

router.delete(

    "/:scheduleId",

    authenticate,

    authorizeRoles(
        "manager"
    ),

    deactivateSchedule

);


// ====================================================
// EXPORTAR
// ====================================================

module.exports =
    router;