// ************ Require's ************

const express = require ("express");
const router = express.Router();

// ************ Controller Require ************

const homeController = require ("../controllers/home")

// ************ Rutas ************

router.get("/", homeController.home);
router.get("/contact", homeController.contact);


module.exports = router;