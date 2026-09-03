/*
====================================================

    FLOWMANAGER

    ATTENDANCE ROUTES

====================================================
*/

const express = require("express");

const router = express.Router();


const {

    registerAttendance,

    getAttendances,

    getAttendancesByClient,

    getRecentAttendances

} = require(
    "../controllers/attendance.controller"
);


// ====================================================
// ASISTENCIAS RECIENTES
//
// Debe ir antes de "/"
// ====================================================

router.get(

    "/recent",

    getRecentAttendances

);


// ====================================================
// ASISTENCIAS DE UNA CLIENTA
//
// Debe ir antes de "/"
// ====================================================

router.get(

    "/client/:clientId",

    getAttendancesByClient

);


// ====================================================
// OBTENER HISTORIAL COMPLETO
// ====================================================

router.get(

    "/",

    getAttendances

);


// ====================================================
// REGISTRAR ASISTENCIA
// ====================================================

router.post(

    "/",

    registerAttendance

);


module.exports =
    router;