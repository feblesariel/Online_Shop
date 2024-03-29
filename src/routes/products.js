// ************ Require's ************

const express = require ("express");
const router = express.Router();

// ************ Controller Require ************

const productsController = require ("../controllers/products")

// ************ Rutas ************

router.get("/", productsController.products);
router.get("/detail/:id/", productsController.detail);
router.get("/offers/", productsController.offers);


module.exports = router;