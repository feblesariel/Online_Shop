// ************ Require's ************

const express = require ("express");
const router = express.Router();

// ************ Controller Require ************

const usersController = require ("../controllers/users")

// ************ Rutas ************

router.get("/login", usersController.login);


module.exports = router;