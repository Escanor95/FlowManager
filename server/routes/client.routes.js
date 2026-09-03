const express = require("express");

const router =
    express.Router();


const {

    getAllClients,

    createClient,

    searchClients,

    getClientById,

    updateClient,

    deleteClient,

    renewClientMembership,

    purchaseClientMembership,

    getClientMemberships,

    activateClientMembership,

    freezeClientMembership,

    reactivateClientMembership,

    extendClientMembership,

    getClientAppAccess,

    generateClientAppAccess,

    updateClientAppAccess,

    getClientQr

} = require(
    "../controllers/client.controller"
);


// ====================================================
// BUSCAR
// ====================================================

router.get(

    "/search/:query",

    searchClients

);


// ====================================================
// ACCESO APP DEL CLIENTE
// ====================================================

router.get(

    "/:clientId/app-access",

    getClientAppAccess

);


router.post(

    "/:clientId/app-access",

    generateClientAppAccess

);


/*
====================================================

    ACTUALIZAR ACCESO APP

====================================================
*/

router.put(

    "/:clientId/app-access",

    updateClientAppAccess

);


// ====================================================
// QR DEL CLIENTE
// ====================================================

router.get(

    "/:clientId/qr",

    getClientQr

);


// ====================================================
// COMPRAR NUEVO PAQUETE
// ====================================================

router.post(

    "/:clientId/purchase",

    purchaseClientMembership

);


// ====================================================
// ELIMINAR CLIENTE
// ====================================================

router.delete(
    "/:clientId",
    deleteClient
);


// ====================================================
// COMPATIBILIDAD CON RENOVACIÓN ANTIGUA
// ====================================================

router.post(

    "/:clientId/renew",

    renewClientMembership

);


// ====================================================
// HISTORIAL DE PAQUETES
// ====================================================

router.get(

    "/:clientId/memberships",

    getClientMemberships

);


// ====================================================
// ACTIVAR PAQUETE
// ====================================================

router.post(

    "/memberships/:clientMembershipId/activate",

    activateClientMembership

);


// ====================================================
// CONGELAR PAQUETE
// ====================================================

router.post(

    "/memberships/:clientMembershipId/freeze",

    freezeClientMembership

);


// ====================================================
// REACTIVAR PAQUETE
// ====================================================

router.post(

    "/memberships/:clientMembershipId/reactivate",

    reactivateClientMembership

);


// ====================================================
// EXTENDER VIGENCIA
// ====================================================

router.post(

    "/memberships/:clientMembershipId/extend",

    extendClientMembership

);


// ====================================================
// OBTENER CLIENTE POR ID
// ====================================================

router.get(

    "/:clientId",

    getClientById

);


// ====================================================
// TODOS LOS CLIENTES
// ====================================================

router.get(

    "/",

    getAllClients

);


// ====================================================
// CREAR CLIENTE
// ====================================================

router.post(

    "/",

    createClient

);


// ====================================================
// ACTUALIZAR CLIENTE
// ====================================================

router.put(

    "/:clientId",

    updateClient

);


// ====================================================
// EXPORTAR
// ====================================================

module.exports =
    router;