// ************ Require's ************

const express = require("express");
const router = express.Router();
const routesLoggedRequired = require("../middlewares/routesLoggedRequired");
const routesAdminRequired = require("../middlewares/routesAdminRequired");

// ************ Controller Require ************

const settingsController = require ("../controllers/settings")

// ************ Rutas ************

router.get("/", routesLoggedRequired, routesAdminRequired , settingsController.main);


module.exports = router;