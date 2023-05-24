// ************ Require's ************

const express = require("express");
const router = express.Router();
const routesLoggedRequired = require("../middlewares/routesLoggedRequired");

// ************ Controller Require ************

const cartController = require ("../controllers/cart")

// ************ Rutas ************

router.get("/", routesLoggedRequired, cartController.cart);
router.get("/:id/", routesLoggedRequired, cartController.cartProcces);
router.post("/detail/:id/", routesLoggedRequired, cartController.cartDetailProcces);
router.put("/edit/:id/", routesLoggedRequired ,cartController.cartEdit);
router.delete("/delete/:id/", routesLoggedRequired ,cartController.cartDelete);

module.exports = router;