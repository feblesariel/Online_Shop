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
      let nombreCarpeta = path.join(__dirname, "../../public/img/products");
      cb(null, nombreCarpeta);
    },
    filename: function (req, file, cb) {
      let nombreImagen = "img-" + Date.now() + path.extname(file.originalname);
      cb(null, nombreImagen);
    }
});

const fileFilter = function (req, file, cb) {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
      cb(null, true);
    } else {
      cb(new Error('Formato de archivo no válido. Solo se permiten imágenes jpg y png.'), false);
    }
};

const upload = multer({
    storage: storage,
    limits: {
      fileSize: 2 * 1024 * 1024,
    },
    fileFilter: fileFilter,
  });

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
    body("newCategory").custom(validateNewCategory),
    // body("newCategory").notEmpty().withMessage("Debes ingresar el nombre de la nueva categoria."),
    body("code").notEmpty().withMessage("Debes ingresar el codigo."),
    body("name").notEmpty().withMessage("Debes ingresar el nombre."),
    body("brand").notEmpty().withMessage("Debes ingresar la marca."),
    body("model").notEmpty().withMessage("Debes ingresar el modelo."),
    body("price").notEmpty().withMessage("Debes ingresar el precio.").bail().isNumeric().withMessage("El precio debe ser numérico."),
    body("stock").notEmpty().withMessage("Debes ingresar el stock.").bail().isNumeric().withMessage("El stock debe ser numérico.")
];

// ************ Controller Require ************

const settingsController = require ("../controllers/settings")

// ************ Rutas ************

router.get("/", routesLoggedRequired, routesAdminRequired , settingsController.main);
router.delete("/user/delete/:id/", routesLoggedRequired, routesAdminRequired , settingsController.userDestroy);

router.post("/product/create/", routesLoggedRequired, routesAdminRequired , upload.array("images", 5) , validationsCreateProductForm, settingsController.productCreate);

module.exports = router;