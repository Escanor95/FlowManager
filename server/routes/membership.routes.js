const express = require("express");

const router = express.Router();

const {

    getAllMemberships,
    getMembershipById,
    searchMemberships,
    createMembership,
    updateMembership,
    deactivateMembership

} = require("../controllers/membership.controller");

// Obtener todas
router.get("/", getAllMemberships);

// Buscar
router.get("/search/:query", searchMemberships);

// Obtener una
router.get("/:membershipId", getMembershipById);

// Crear
router.post("/", createMembership);

// Actualizar
router.put("/:membershipId", updateMembership);

// Desactivar
router.delete("/:membershipId", deactivateMembership);

module.exports = router;