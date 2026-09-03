const express = require("express");

const router = express.Router();

const {

    getAllActivities,

    getActivityById,

    getActivityOptions,

    searchActivities,

    createActivity,

    updateActivity,

    deactivateActivity

} = require(

    "../controllers/activity.controller"

);

// ======================================
// Buscar
// ======================================

router.get(

    "/search/:query",

    searchActivities

);

// ======================================
// Opciones para selects
// ======================================

router.get(

    "/options",

    getActivityOptions

);

// ======================================
// Obtener una actividad
// ======================================

router.get(

    "/:activityId",

    getActivityById

);

// ======================================
// Obtener todas
// ======================================

router.get(

    "/",

    getAllActivities

);

// ======================================
// Crear
// ======================================

router.post(

    "/",

    createActivity

);

// ======================================
// Actualizar
// ======================================

router.put(

    "/:activityId",

    updateActivity

);

// ======================================
// Desactivar
// ======================================

router.delete(

    "/:activityId",

    deactivateActivity

);

module.exports = router;