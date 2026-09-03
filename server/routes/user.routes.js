/*
====================================================

    FLOWMANAGER

    USER ROUTES

====================================================
*/

const express =
    require("express");


const router =
    express.Router();


const {

    getAllUsers,

    createUser,

    updateUser,

    deactivateUser,

    activateUser

} = require(
    "../controllers/user.controller"
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
// PERMISOS
//
// ROOT Y MANAGER PUEDEN ADMINISTRAR USUARIOS
// ====================================================

router.use(

    authorizeRoles(

        "manager"

    )

);


// ====================================================
// LISTAR USUARIOS
// ====================================================

router.get(

    "/",

    getAllUsers

);


// ====================================================
// CREAR USUARIO
// ====================================================

router.post(

    "/",

    createUser

);


// ====================================================
// ACTUALIZAR USUARIO
// ====================================================

router.put(

    "/:userId",

    updateUser

);


// ====================================================
// DESACTIVAR USUARIO
// ====================================================

router.patch(

    "/:userId/deactivate",

    deactivateUser

);


// ====================================================
// ACTIVAR USUARIO
// ====================================================

router.patch(

    "/:userId/activate",

    activateUser

);


// ====================================================
// EXPORTAR
// ====================================================

module.exports =
    router;