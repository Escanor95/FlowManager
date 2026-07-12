const express = require("express");

const router = express.Router();

const {
    getAllClients,
    createClient,
    searchClients,
    getClientById
} = require("../controllers/client.controller");

// SIEMPRE primero las rutas específicas
router.get("/search/:query", searchClients);

router.get("/:clientId", getClientById);

// Después las generales
router.get("/", getAllClients);

router.post("/", createClient);

module.exports = router;