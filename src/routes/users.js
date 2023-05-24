// ************ Require's ************

const express = require("express");
const router = express.Router();
const {body} = require("express-validator");
const routesNoLoggedRequired = require("../middlewares/routesNoLoggedRequired");
const routesLoggedRequired = require("../middlewares/routesLoggedRequired");

// ************ Validations ************

const validationsLoginForm = [
    body("email").isEmail().withMessage("Debes ingresar el correo electronico."),
    body("password").notEmpty().withMessage("Debes ingresar una contraseña.").bail().isLength({ min: 8 }).withMessage("La contraseña debe tener un minimo 8 caracteres.")
];

const validationsRegisterForm = [
    body("name").notEmpty().withMessage("Debes ingresar un nombre de usuario.").bail().isLength({ min: 2}).withMessage("El nombre de usuario debe tener al menos 2 caracteres."),
    body("email").notEmpty().withMessage("Debes ingresar un correo electronico.").bail().isEmail().withMessage("Debes usar un formato valido para el correo."),
    body("password").notEmpty().withMessage("Debes ingresar una contraseña para el usuario.").bail().isLength({ min: 8 }).withMessage("La contraseña debe tener un minimo 8 caracteres.")

];

const validationsEditUsersForm = [
    body("name").notEmpty().withMessage("Debes ingresar un nombre de usuario.").bail().isLength({ min: 2}).withMessage("El nombre de usuario debe tener al menos 2 caracteres."),
    body("email").notEmpty().withMessage("Debes ingresar un correo electronico.").bail().isEmail().withMessage("Debes usar un formato valido para el correo."),
    body("password").notEmpty().withMessage("Debes ingresar una contraseña para el usuario.").bail().isLength({ min: 8 }).withMessage("La contraseña debe tener un minimo 8 caracteres.")
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