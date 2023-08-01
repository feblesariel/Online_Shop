// ************ Requires ************

const sharp = require('sharp');
const fs = require("fs");
const path = require("path");
const { validationResult } = require("express-validator");
const { stringify } = require("querystring");

//--- DB

const db = require('../database/models/index.js');
const sequelize = db.sequelize;
const { Op } = require("sequelize");
const { error } = require("console");

const User = db.User;
const Category = db.Category;
const Product = db.Product;
const Product_image = db.Product_image;
const Cart = db.Cart;
const Cart_item = db.Cart_item;
const Payment = db.Payment;
const Shipment_cost = db.Shipping_method;
const Shipment = db.Shipment;

// ************ Controllers ************

const settingsController = {

  main: function (req, res) {

    let user = 0;

    if (req.session.userLogged) {
      let userLogged = req.session.userLogged;
      user = userLogged.id;
    }

    // Consulto las categorias - navbar ---------------------------------------------------------------

    const getCategories = Category.findAll({
      attributes: [
        'id',
        'name',
        [
          sequelize.literal('(SELECT COUNT(*) FROM products WHERE products.category_id = Category.id)'),
          'productCount'
        ]
      ],
      having: sequelize.literal('productCount > 0'),
      order: [
        ['name', 'ASC']
      ],
      raw: true
    });

    // Calculo cuantos items hay en el carrito - navbar ----------------------------------------------

    const getProductCountInCart = Cart_item.sum('quantity', {
      include: [
        {
          model: Cart,
          as: 'cart',
          where: { user_id: user } // ACA MODIFICAR SEGUN USER LOGUEADO
        }
      ]
    });

    // Consulto los productos - listado de productos - AJUSTES ---------------------------------------

    const getProducts = Product.findAll({
      attributes: [
        'id',
        'code',
        'name',
        'price',
        'stock'
      ],
      order: [
        ['code', 'ASC']
      ],
      raw: true
    });

    // Consulto los usuarios - listado de usuarios - AJUSTES -----------------------------------------

    const getUsers = User.findAll({
      attributes: [
        'id',
        'name',
        'email',
        'role'
      ],
      order: [
        ['id', 'ASC']
      ],
      raw: true
    });

    Promise.all([getCategories, getProductCountInCart, getProducts, getUsers])
      .then(([Categories, ProductCountInCart, Products, Users]) => {
        res.render('settings', { Categories, ProductCountInCart, Products, Users });
      })
      .catch(error => {
        console.error('Error:', error);
        // Manejo de errores
      });
  },

  userDestroy: function (req, res) {

    let userId = req.params.id;

    if (req.session.userLogged.id == userId) {
      req.session.destroy();
    }

    User.destroy({ where: { id: userId }, force: true }).then(() => {
      return res.redirect('/settings/')
    }).catch(error => {
      console.error('Error:', error);
      // Manejo de errores
    });
  },

  productCreate: function (req, res) {

    let user = 0;

    if (req.session.userLogged) {
      let userLogged = req.session.userLogged;
      user = userLogged.id;
    }

    // Consulto las categorias - navbar ---------------------------------------------------------------

    const getCategories = Category.findAll({
      attributes: [
        'id',
        'name',
        [
          sequelize.literal('(SELECT COUNT(*) FROM products WHERE products.category_id = Category.id)'),
          'productCount'
        ]
      ],
      having: sequelize.literal('productCount > 0'),
      order: [
        ['name', 'ASC']
      ],
      raw: true
    });

    // Calculo cuantos items hay en el carrito - navbar ----------------------------------------------

    const getProductCountInCart = Cart_item.sum('quantity', {
      include: [
        {
          model: Cart,
          as: 'cart',
          where: { user_id: user } // ACA MODIFICAR SEGUN USER LOGUEADO
        }
      ]
    });

    // Consulto los productos - listado de productos - AJUSTES ---------------------------------------

    const getProducts = Product.findAll({
      attributes: [
        'id',
        'code',
        'name',
        'price',
        'stock'
      ],
      order: [
        ['code', 'ASC']
      ],
      raw: true
    });

    // Consulto los usuarios - listado de usuarios - AJUSTES ----------------------------------------

    const getUsers = User.findAll({
      attributes: [
        'id',
        'name',
        'email',
        'role'
      ],
      order: [
        ['id', 'ASC']
      ],
      raw: true
    });


    // Creacion de producto -------------------------------------------------------------------------

    let errors = validationResult(req);

    // Validaciones de la imagen -------

    if (req.file) {

      const maxFileSizeMB = 2;
      const maxFileSizeBytes = maxFileSizeMB * (1024 * 1024);

      if ((!errors.isEmpty()) || (req.file.size > maxFileSizeBytes) || (req.file.mimetype !== 'image/jpeg' && req.file.mimetype !== 'image/png')) {
        fs.unlink(req.file.path, (err) => {
          if (err) {
            console.error('Error al borrar el archivo:', err);
          } else {
            console.log('Archivo borrado exitosamente');
          }
        });
      }

      if (req.file.size > maxFileSizeBytes) {
        errors.errors.push({ msg: "El archivo supera el peso permitido de 2 MB." });
      }

      if (req.file.mimetype !== 'image/jpeg' && req.file.mimetype !== 'image/png') {
        errors.errors.push({ msg: "El archivo debe ser una imagen valida." });
      }

    } else {
      errors.errors.push({ msg: "Debes seleccionar una imagen." });
    }
      // Redimension -----
      
      const destinationFolder = path.join(__dirname, '../../public/img/'); // Ruta de la carpeta donde se guardarán las imágenes redimensionadas

      // Ruta completa de la imagen original y la redimensionada
      const originalImagePath = req.file.path;
      const resizedImagePath = destinationFolder + 'resized-' + req.file.filename;

      // Redimensionar la imagen utilizando la libreria "sharp"
      sharp(originalImagePath)
        .resize(500, 500) // Ajusta el tamaño según tus necesidades
        .toFile(resizedImagePath, (err) => {
          if (err) {
            console.error('Error al redimensionar la imagen:', err);
          }
          // Borra el archivo original que está en la carpeta temporal de Multer
          fs.unlinkSync(originalImagePath);
          // Actualiza el path del archivo para que apunte a la imagen redimensionada
          req.file.path = resizedImagePath;
          // Actualiza el nombre del archivo
          req.file.filename = 'resized-' + req.file.filename;
      });

      // Fin Redimension ---

    // Fin Validaciones de la imagen -----

    // Si hay algo en el campo code valido si el codigo ya existe en otro producto, si es asi, hago un push al array de errores, si no, procedo a crear el producto.

    if (req.body.code) {
      Product.findOne({
        where: {
          code: req.body.code
        }
      }).then((product) => {

        if (product) {
          errors.errors.push({ msg: "Ya existe un producto con ese codigo." });
        }

        if (!errors.isEmpty()) {

          Promise.all([getCategories, getProductCountInCart, getProducts, getUsers])
            .then(([Categories, ProductCountInCart, Products, Users]) => {
              res.render('settings', { Categories, ProductCountInCart, Products, Users, errors: errors.array(), old: req.body });
            })
            .catch(error => {
              console.error('Error:', error);
              // Manejo de errores
            });
    
        } else {
    
          // Función para convertir "on" y "off" a booleanos true o false
          function convertToBoolean(value) {
            return value === "on" ? true : false;
          }
    
          // En tu código, antes de insertar los valores en la base de datos
          // asegúrate de convertir los valores "on" y "off" a booleanos true o false
          let isFeatured = convertToBoolean(req.body.is_featured);
          let isOffer = convertToBoolean(req.body.is_offer);
    
          if (req.body.category === "other") {
            Category.create({
              name: req.body.newCategory,
            }).then((newCategory) => {
              Product.create({
                code: req.body.code,
                brand: req.body.brand,
                model: req.body.model,
                name: req.body.name,
                price: req.body.price,
                description: req.body.description,
                stock: req.body.stock,
                is_featured: isFeatured,
                is_offer: isOffer,
                category_id: newCategory.id,
              }).then((newProduct) => {
                Product_image.create({
                  url: req.file.filename,
                  product_id: newProduct.id,
                }).then(() => {
                  return res.redirect('/settings/');
                }).catch((error) => {
                  console.error('Error al crear la imagen del producto:', error);
                });
              }).catch((error) => {
                console.error('Error al crear el producto:', error);
              });
            }).catch((error) => {
              console.error('Error al crear la nueva categoría:', error);
            });
    
          } else {
    
            Category.findOne({
              where: {
                name: req.body.category
              }
            }).then((element) => {
              Product.create({
                code: req.body.code,
                brand: req.body.brand,
                model: req.body.model,
                name: req.body.name,
                price: req.body.price,
                description: req.body.description,
                stock: req.body.stock,
                is_featured: isFeatured,
                is_offer: isOffer,
                category_id: element.id,
              }).then((newProduct) => {
                Product_image.create({
                  url: req.file.filename,
                  product_id: newProduct.id,
                }).then(() => {
                  return res.redirect('/settings/');
                }).catch((error) => {
                  console.error('Error al crear la imagen del producto:', error);
                });
              }).catch((error) => {
                console.error('Error al crear el producto:', error);
              });
            }).catch((error) => {
              console.error('Error al buscar la categoria:', error);
            });
    
          }
    
        }        
      }).catch(error => {
        console.error('Error al buscar el producto:', error);
      });

    // Si no hay mada en el campo code se envian los errores a la vista.

    } else {

      if (!errors.isEmpty()) {

        Promise.all([getCategories, getProductCountInCart, getProducts, getUsers])
          .then(([Categories, ProductCountInCart, Products, Users]) => {
            res.render('settings', { Categories, ProductCountInCart, Products, Users, errors: errors.array(), old: req.body });
          })
          .catch(error => {
            console.error('Error:', error);
            // Manejo de errores
          });
            
      }

    }

  }

}

module.exports = settingsController;