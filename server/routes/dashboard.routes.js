/*
====================================================

    FLOWMANAGER

    DASHBOARD ROUTES

====================================================
*/

const express =
    require("express");


const router =
    express.Router();


const {

    getDashboard

} = require(
    "../controllers/dashboard.controller"
);


const {

    authenticate

} = require(
    "../middleware/auth.middleware"
);


// ====================================================
// AUTENTICACIÓN
// ====================================================
//
// Necesario para que:
// req.user
// req.user.role
// req.user.coachId
//
// estén disponibles en dashboard.controller.js.
//

router.use(
    authenticate
);


// ====================================================
// DASHBOARD
// ====================================================

router.get(

    "/",

    getDashboard

);


// ====================================================
// EXPORTAR
// ====================================================

module.exports =
    router;