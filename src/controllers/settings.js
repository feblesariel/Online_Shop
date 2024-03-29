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
const Shipment_cost = db.Shipment_cost;
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

    // Consulto las categorias - modal ---------------------------------------------------------------

    const getCategoriesModal = Category.findAll({
      attributes: [
        'id',
        'name',
        ],
        order: [
          ['id', 'ASC']
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

    Promise.all([getCategories, getCategoriesModal ,getProductCountInCart, getProducts, getUsers])
      .then(([Categories, CategoriesModal ,ProductCountInCart, Products, Users]) => {
        res.render('settings', { Categories, CategoriesModal ,ProductCountInCart, Products, Users });
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

  productDestroy: function (req, res) {

    const productId = req.params.id;

    // Buscar la URL de la foto asociada al producto que se eliminará
    Product_image.findOne({
      where: { product_id: productId },
      attributes: ['url'],
      raw: true,
    })
    .then((productImage) => {

        if (productImage) {
          // Construir la ruta completa del archivo de la foto
          const imagePath = path.join(__dirname, '../../public/img/', productImage.url);

          // Eliminar el archivo de la foto
          fs.unlink(imagePath, (err) => {
            if (err) {
              console.error('Error al eliminar el archivo de la foto:', err);
            }

            // Eliminar el registro del producto de la base de datos
            Product.destroy({ where: { id: productId }, force: true })
              .then(() => {
                return res.redirect('/settings/');
              })
              .catch((error) => {
                console.error('Error al eliminar el producto:', error);
                // Manejo de errores
              });
          });
        } else {
          // No se encontró una foto asociada al producto, solo eliminar el registro del producto
          Product.destroy({ where: { id: productId }, force: true })
            .then(() => {
              return res.redirect('/settings/');
            })
            .catch((error) => {
              console.error('Error al eliminar el producto:', error);
              // Manejo de errores
            });
        }
      })
      .catch((error) => {
        console.error('Error al buscar la foto del producto:', error);
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

    // Consulto las categorias - modal ---------------------------------------------------------------

    const getCategoriesModal = Category.findAll({
      attributes: [
        'id',
        'name',
        ],
        order: [
          ['id', 'ASC']
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

    let nameImage = null;

    // Validaciones de la imagen -------

    if (req.file) {

      nameImage = 'resized-' + req.file.filename;

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

        if (req.file.size > maxFileSizeBytes) {
          errors.errors.push({ msg: "El archivo supera el peso permitido de 2 MB." });
        }
  
        if (req.file.mimetype !== 'image/jpeg' && req.file.mimetype !== 'image/png') {
          errors.errors.push({ msg: "El archivo debe ser una imagen valida." });
        }

      } else {

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
      });

      // Fin Redimension ---

      }          

    } else {
      errors.errors.push({ msg: "Debes seleccionar una imagen." });
    }

    // Fin Validaciones de la imagen -----


    // Comienzo de las validaciones de los campos y creacion -----

    const getCategoriesForExist = Category.findOne({
      where: {
        name: req.body.newCategory
      }
    });

    const getProductsForExist = Product.findOne({
      where: {
        code: req.body.code
      }
    });

    Promise.all([getCategories, getCategoriesModal ,getProductCountInCart, getProducts, getUsers, getProductsForExist, getCategoriesForExist])
    .then(([Categories, CategoriesModal, ProductCountInCart, Products, Users, ProductsForExist, CategoriesForExist]) => {
  
      if (errors.isEmpty()) {

        if (ProductsForExist) {

          errors.errors.push({ msg: "Ya existe un producto con ese codigo." });

        }

        if (CategoriesForExist) {

          errors.errors.push({ msg: "Ya existe una categoria con ese nombre." });

        }

        if (!errors.isEmpty()) {

          res.render('settings', { Categories, CategoriesModal ,ProductCountInCart, Products, Users, errors: errors.array(), old: req.body });
    
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
                  url: nameImage,
                  product_id: newProduct.id
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
                  url: nameImage,
                  product_id: newProduct.id
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

  
      } else {

        res.render('settings', { Categories, CategoriesModal ,ProductCountInCart, Products, Users, errors: errors.array(), old: req.body });

      }
      
    })
    .catch(error => {
      console.error('Error:', error);
      // Manejo de errores
    });    

  },

  productEdit: function (req, res) {

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

    // Consulto las categorias - modal ---------------------------------------------------------------

    const getCategoriesModal = Category.findAll({
      attributes: [
        'id',
        'name',
        ],
        order: [
          ['id', 'ASC']
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

    // Busqueda del producto a editar ----------------------------------------------------------------

    const getOldProductToEdit = Product.findOne({
      where: {
        id: req.query.id
      },
      include: [
        {
          model: Product_image,
          as: 'product_images'
        },
        {
          model: Category,
          as: 'category'
        }
      ]
    });

    Promise.all([getCategories, getCategoriesModal ,getProductCountInCart, getProducts, getUsers, getOldProductToEdit])
    .then(([Categories, CategoriesModal ,ProductCountInCart, Products, Users, editOld]) => {
      res.render('settings', { Categories, CategoriesModal,ProductCountInCart, Products, Users, editOld });
    })
    .catch(error => {
      console.error('Error:', error);
      // Manejo de errores
    });

  },

  productEditProcces: function (req, res) {

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

    // Consulto las categorias - modal ---------------------------------------------------------------

    const getCategoriesModal = Category.findAll({
      attributes: [
        'id',
        'name',
        ],
        order: [
          ['id', 'ASC']
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


    // Edicion de producto -------------------------------------------------------------------------

    let errors = validationResult(req);

    let hayImagen = false;
    
    let nameImage = null;

    let idProductToEdit = req.body.id;

    // Validaciones de la imagen -------

    if (req.file) {

      nameImage = 'resized-' + req.file.filename;

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

        if (req.file.size > maxFileSizeBytes) {
          errors.errors.push({ msg: "El archivo supera el peso permitido de 2 MB." });
        }
  
        if (req.file.mimetype !== 'image/jpeg' && req.file.mimetype !== 'image/png') {
          errors.errors.push({ msg: "El archivo debe ser una imagen valida." });
        }

      } else {

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
      });

      // Elimino imagen vieja que esta en archivos
      Product_image.findOne({
        where: {
          product_id: idProductToEdit
        }
      }).then((element) => {
        let pathOldImage = path.join(__dirname, '../../public/img/' + element.url);
        if (fs.existsSync(pathOldImage)) {
          fs.unlinkSync(pathOldImage);
        }
      });

      hayImagen = true;
  
      // Fin Redimension ---

      }      

    }

    // Fin Validaciones de la imagen -----

    // Comienzo de las validaciones de los campos y edicion-----

    const getCategoriesForExist = Category.findOne({
      where: {
        name: req.body.newCategory
      }
    });

    const getProductsForExist = Product.findOne({
      where: {
        code: req.body.code
      }
    });

    const getProductToEdit = Product.findOne({
      where: {
        id: idProductToEdit
      }
    });

    Promise.all([getCategories, getCategoriesModal, getProductCountInCart, getProducts, getUsers, getCategoriesForExist, getProductsForExist, getProductToEdit])
      .then(([Categories, CategoriesModal, ProductCountInCart, Products, Users, CategoriesForExist, ProductsForExist, ProductToEdit]) => {

        if (errors.isEmpty()) {


          if ((ProductToEdit.code !== req.body.code) && req.body.category === "other") {


            if (ProductsForExist) {

              errors.errors.push({ msg: "Ya existe un producto con ese codigo." });

            }

            if (CategoriesForExist) {

              errors.errors.push({ msg: "Ya existe una categoria con ese nombre." });

            }

            if (!errors.isEmpty()) {

              res.render('settings', { Categories, CategoriesModal ,ProductCountInCart, Products, Users, editErrors: errors.array(), editOld: req.body });

            } else {

              // --------------> ESCENARIO SI EL CODIGO ES DIFERENTE Y QUE LA CATEGORIA ES OTRA <-------------------

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

                  Product.update(
                    {
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
                    },
                    {
                      where: { id: idProductToEdit }
                    }).then(() => {

                      if (hayImagen) {

                        Product_image.update(
                          {
                            url: nameImage
                          },
                          {
                            where: { product_id: idProductToEdit }
                          }).then(() => {

                          })
                          .catch((error) => {
                            console.error('Error al actualizar la imagen:', error);
                          });
                      }

                    })
                    .catch((error) => {
                      console.error('Error al actualizar el producto:', error);
                    });
                }).catch((error) => {
                  console.error('Error al crear la nueva categoría:', error);
                });

                return res.redirect('/settings/');

              }

            }

          } else if (ProductToEdit.code !== req.body.code && req.body.category !== "other") {


            if (ProductsForExist) {

              errors.errors.push({ msg: "Ya existe un producto con ese codigo." });

            }

            if (CategoriesForExist) {

              errors.errors.push({ msg: "Ya existe una categoria con ese nombre." });

            }

            if (!errors.isEmpty()) {

              res.render('settings', { Categories, CategoriesModal ,ProductCountInCart, Products, Users, editErrors: errors.array(), editOld: req.body });

            } else {

              // --------------> ESCENARIO SI EL CODIGO ES DIFERENTE Y QUE LA CATEGORIA ES EXISTENTE <-------------------

              // Función para convertir "on" y "off" a booleanos true o false
              function convertToBoolean(value) {
                return value === "on" ? true : false;
              }

              // En tu código, antes de insertar los valores en la base de datos
              // asegúrate de convertir los valores "on" y "off" a booleanos true o false
              let isFeatured = convertToBoolean(req.body.is_featured);
              let isOffer = convertToBoolean(req.body.is_offer);

              Category.findOne({
                where: {
                  name: req.body.category
                }
              }).then((element) => {

                Product.update(
                  {
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
                  },
                  {
                    where: { id: idProductToEdit }
                  }).then(() => {

                    if (hayImagen) {

                      Product_image.update(
                        {
                          url: nameImage
                        },
                        {
                          where: { product_id: idProductToEdit }
                        }).then(() => {

                        })
                        .catch((error) => {
                          console.error('Error al actualizar la imagen:', error);
                        });
                    }

                  })
                  .catch((error) => {
                    console.error('Error al actualizar el producto:', error);
                  });

              }).catch((error) => {
                console.error('Error al buscar la categoria:', error);
              });

              return res.redirect('/settings/');

            }

          } else if (ProductToEdit.code === req.body.code && req.body.category === "other") {

            if (ProductsForExist) {

              if (req.body.code !== ProductToEdit.code ) {

              errors.errors.push({ msg: "Ya existe un producto con ese codigo." });

              }

            }

            if (CategoriesForExist) {

              errors.errors.push({ msg: "Ya existe una categoria con ese nombre." });

            }

            if (!errors.isEmpty()) {

              res.render('settings', { Categories, CategoriesModal ,ProductCountInCart, Products, Users, editErrors: errors.array(), editOld: req.body });

            } else {

              // --------------> ESCENARIO SI EL CODIGO ES IGUAL Y QUE LA CATEGORIA ES OTRA <-------------------

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

                  Product.update(
                    {
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
                    },
                    {
                      where: { id: idProductToEdit }
                    }).then(() => {

                      if (hayImagen) {

                        Product_image.update(
                          {
                            url: nameImage
                          },
                          {
                            where: { product_id: idProductToEdit }
                          }).then(() => {

                          })
                          .catch((error) => {
                            console.error('Error al actualizar la imagen:', error);
                          });
                      }

                    })
                    .catch((error) => {
                      console.error('Error al actualizar el producto:', error);
                    });
                }).catch((error) => {
                  console.error('Error al crear la nueva categoría:', error);
                });

                return res.redirect('/settings/');

              }

            }

          } else if (ProductToEdit.code === req.body.code && req.body.category !== "other") {            

            if (ProductsForExist) {

              if (req.body.code !== ProductToEdit.code ) {

                errors.errors.push({ msg: "Ya existe un producto con ese codigo." });

              }

            }

            if (CategoriesForExist) {

              errors.errors.push({ msg: "Ya existe una categoria con ese nombre." });

            }

            if (!errors.isEmpty()) {

              res.render('settings', { Categories, CategoriesModal ,ProductCountInCart, Products, Users, editErrors: errors.array(), editOld: req.body });

            } else {


              // --------------> ESCENARIO SI EL CODIGO ES IGUAL Y QUE LA CATEGORIA ES EXISTENTE <-------------------

              // Función para convertir "on" y "off" a booleanos true o false
              function convertToBoolean(value) {
                return value === "on" ? true : false;
              }

              // En tu código, antes de insertar los valores en la base de datos
              // asegúrate de convertir los valores "on" y "off" a booleanos true o false
              let isFeatured = convertToBoolean(req.body.is_featured);
              let isOffer = convertToBoolean(req.body.is_offer);

              Category.findOne({
                where: {
                  name: req.body.category
                }
              }).then((element) => {

                Product.update(
                  {
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
                  },
                  {
                    where: { id: idProductToEdit }
                  }).then(() => {

                    if (hayImagen) {

                      Product_image.update(
                        {
                          url: nameImage
                        },
                        {
                          where: { product_id: idProductToEdit }
                        }).then(() => {

                        })
                        .catch((error) => {
                          console.error('Error al actualizar la imagen:', error);
                        });
                    }

                  })
                  .catch((error) => {
                    console.error('Error al actualizar el producto:', error);
                  });

              }).catch((error) => {
                console.error('Error al buscar la categoria:', error);
              });

              return res.redirect('/settings/');

            }

          }

        } else {

          res.render('settings', { Categories, CategoriesModal ,ProductCountInCart, Products, Users, editErrors: errors.array(), editOld: req.body });

        }

      }).catch(error => {
        console.error('Error:', error);
        // Manejo de errores
      });    

  }

}

module.exports = settingsController;