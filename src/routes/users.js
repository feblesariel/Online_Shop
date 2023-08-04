// ************ Require's ************

const express = require("express");
const router = express.Router();
const {body} = require("express-validator");
const routesNoLoggedRequired = require("../middlewares/routesNoLoggedRequired");
const routesLoggedRequired = require("../middlewares/routesLoggedRequired");

// ************ Validations ************

const validationsLoginForm = [
    body("email").isEmail().withMessage("Ingresar el correo electronico."),
    body("password").notEmpty().withMessage("Ingresar una contraseña.").bail().isLength({ min: 8 }).withMessage("Contraseña 8 caracteres minimo.")
];

const validationsRegisterForm = [
    body("name").notEmpty().withMessage("Ingresar un nombre de usuario.").bail().isLength({ min: 2}).withMessage("Usuario al menos 2 caracteres."),
    body("email").notEmpty().withMessage("Ingresar un correo electronico.").bail().isEmail().withMessage("Formato invalido para el correo."),
    body("password").notEmpty().withMessage("Ingresar una contraseña.").bail().isLength({ min: 8 }).withMessage("Contraseña 8 caracteres minimo."),
    body("rePassword").notEmpty().withMessage("Repetir contraseña.")
];

const validationsEditUsersForm = [
    body("name").notEmpty().withMessage("Ingresar un nombre de usuario.").bail().isLength({ min: 2}).withMessage("Usuario al menos 2 caracteres."),
    body("email").notEmpty().withMessage("Ingresar un correo electronico.").bail().isEmail().withMessage("Formato invalido para el correo."),
    body("password").notEmpty().withMessage("Ingresar una contraseña.").bail().isLength({ min: 8 }).withMessage("Contraseña 8 caracteres minimo.")
];

// ************ Controller Require ************

const usersController = require ("../controllers/users")

// ************ Rutas ************

router.get("/login/", routesNoLoggedRequired, usersController.login);
router.post("/login/", routesNoLoggedRequired,validationsLoginForm , usersController.loginProcess);

router.get("/register/", routesNoLoggedRequired ,usersController.register);
router.post("/register/", routesNoLoggedRequired ,validationsRegisterForm , usersController.registerProcess);

router.get("/profile/",routesLoggedRequired, usersController.profile);
router.get("/logout/", routesLoggedRequired, usersController.logout);

router.get("/profile/edit/", routesLoggedRequired, usersController.userEdit);
router.put("/profile/edit/", routesLoggedRequired, validationsEditUsersForm , usersController.userEditProcces);
router.delete("/profile/delete/:id/", routesLoggedRequired, usersController.userDestroy);


module.exports = router;