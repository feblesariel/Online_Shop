// ************ Require's ************

const express = require ("express");
const router = express.Router();

// ************ Controller Require ************

const settingsController = require ("../controllers/settings")

// ************ Rutas ************

router.get("/", settingsController.main);


module.exports = router;