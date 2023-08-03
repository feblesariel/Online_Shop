// ************ Require's ************

const express = require("express");
const router = express.Router();
const multer = require ("multer");
const path = require ("path");
const {body} = require("express-validator");
const routesLoggedRequired = require("../middlewares/routesLoggedRequired");
const routesAdminRequired = require("../middlewares/routesAdminRequired");

// ************ Multer Config ************

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      let nombreCarpeta = path.join(__dirname, "../../public/img/");
      cb(null, nombreCarpeta);
    },
    filename: function (req, file, cb) {
      let nombreImagen = "img-" + Date.now() + path.extname(file.originalname);
      cb(null, nombreImagen);
    }
});

const upload = multer({ storage });

// ************ Validations ************

const validateCategory = (value) => {
    if (value === "") {
      throw new Error("Debes seleccionar una categoria.");
    }
    return true;
  };

const validateNewCategory = (value, { req }) => {
    const category = req.body.category;
    if (category === 'other') {
        if (!value || value.trim() === '') {
        throw new Error('Debes ingresar el nombre de la nueva categoria.');
        }
    }
    return true;
};

const validationsCreateProductForm = [
    body("category").custom(validateCategory),
    body("newCategory").custom(validateNewCategory).bail().isLength({ max: 20 }).withMessage("La nueva categoria no puede exceder los 20 caracteres."),
    body("code").notEmpty().withMessage("Debes ingresar el codigo.").bail().isLength({ max: 20 }).withMessage("El codigo no puede exceder los 20 caracteres."),
    body("name").notEmpty().withMessage("Debes ingresar el nombre.").bail().isLength({ max: 20 }).withMessage("El nombre no puede exceder los 20 caracteres."),
    body("brand").notEmpty().withMessage("Debes ingresar la marca.").bail().isLength({ max: 20 }).withMessage("La marca no puede exceder los 20 caracteres."),
    body("model").notEmpty().withMessage("Debes ingresar el modelo.").bail().isLength({ max: 20 }).withMessage("El modelo no puede exceder los 20 caracteres."),
    body("price").notEmpty().withMessage("Debes ingresar el precio.").bail().isNumeric().withMessage("El precio debe ser numérico."),
    body("stock").notEmpty().withMessage("Debes ingresar el stock.").bail().isNumeric().withMessage("El stock debe ser numérico."),
    body("description").notEmpty().withMessage("Debes ingresar una descripción.").bail().isLength({ max: 200 }).withMessage("La descripción no puede exceder los 200 caracteres.")
];

// ************ Controller Require ************

const settingsController = require ("../controllers/settings")

// ************ Rutas ************

router.get("/", routesLoggedRequired, routesAdminRequired , settingsController.main);
router.delete("/user/delete/:id/", routesLoggedRequired, routesAdminRequired , settingsController.userDestroy);
router.post("/product/create/", routesLoggedRequired, routesAdminRequired , upload.single("images") , validationsCreateProductForm, settingsController.productCreate);
router.delete("/product/delete/:id/", routesLoggedRequired, routesAdminRequired , settingsController.productDestroy);
router.get("/product/edit/", routesLoggedRequired, routesAdminRequired , settingsController.productEdit);
router.put("/product/edit/", routesLoggedRequired, routesAdminRequired , upload.single("images") , validationsCreateProductForm, settingsController.productEditProcces);

module.exports = router;