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
router.put("/edit/:id/", noEstasLogueadoMiddleware ,cartController.cartEdit);
router.delete("/delete/:id/", noEstasLogueadoMiddleware ,cartController.cartDelete);


module.exports = router;