// ************ Require's ************

const express = require ("express");
const router = express.Router();

// ************ Controller Require ************

const searchController = require ("../controllers/search")

// ************ Rutas ************

router.get("/", searchController.search);


module.exports = router;