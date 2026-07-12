const db = require("../config/database");
const generateClientId = require("../utils/generateClientId");

// Obtener todos los clientes
const getAllClients = (req, res) => {

    db.all(
        "SELECT * FROM clients",
        [],
        (error, rows) => {

            if (error) {
                return res.status(500).json(error);
            }

            res.json(rows);

        }
    );

};

// Crear un cliente
const createClient = (req, res) => {

    generateClientId((error, clientId) => {

        if (error) {
            return res.status(500).json(error);
        }

        const {
            fullName,
            phone,
            email,
            membershipType
        } = req.body;

        db.run(

            `INSERT INTO clients
            (
                clientId,
                fullName,
                phone,
                email,
                membershipType,
                membershipStatus,
                remainingClasses,
                createdAt,
                updatedAt,
                isActive
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,

            [
                clientId,
                fullName,
                phone,
                email,
                membershipType,
                "Active",
                0,
                new Date().toISOString(),
                new Date().toISOString(),
                1
            ],

            function (error) {

                if (error) {
                    return res.status(500).json(error);
                }

                res.status(201).json({

                    message: "Client created successfully",
                    clientId

                });

            }

        );

    });

};

const searchClients = (req, res) => {

    const query = `%${req.params.query}%`;

    db.all(

        `SELECT
            clientId,
            fullName,
            phone,
            email,
            membershipType,
            membershipStatus,
            remainingClasses,
            startDate,
            endDate
        FROM clients
        WHERE
            fullName LIKE ?
            OR phone LIKE ?
            OR clientId LIKE ?
        ORDER BY fullName ASC`,

        [query, query, query],

        (error, rows) => {

            if (error) {

                return res.status(500).json(error);

            }

            res.json(rows);

        }

    );

};
const getClientById = (req, res) => {

    const clientId = req.params.clientId;

    db.get(

        `SELECT *
         FROM clients
         WHERE clientId = ?`,

        [clientId],

        (error, row) => {

            if (error) {

                return res.status(500).json(error);

            }

            if (!row) {

                return res.status(404).json({

                    message: "Client not found"

                });

            }

            res.json(row);

        }

    );

};
module.exports = {

    getAllClients,
    createClient,
    searchClients,
    getClientById

};