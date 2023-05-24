// ************ Require's ************

const express = require("express");
const router = express.Router();
const {body} = require("express-validator");
const estasLogueadoMiddleware = require("../middlewares/estasLogueadoMiddleware");
const noEstasLogueadoMiddleware = require("../middlewares/noEstasLogueadoMiddleware");

// ************ Controller Require ************

const cartController = require ("../controllers/cart")

// ************ Rutas ************

router.get("/", noEstasLogueadoMiddleware, cartController.cart);
router.get("/:id/", noEstasLogueadoMiddleware, cartController.cartProcces);
router.post("/detail/:id/", noEstasLogueadoMiddleware, cartController.cartDetailProcces);
router.put("/edit/:id/", noEstasLogueadoMiddleware ,cartController.cartEdit);
router.delete("/delete/:id/", noEstasLogueadoMiddleware ,cartController.cartDelete);

module.exports = router;