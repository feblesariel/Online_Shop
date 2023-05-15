// ************ Requires ************

//--- DB

const db = require('../database/models/index.js');
const sequelize = db.sequelize;
const { Op } = require("sequelize");

const Store = db.Store;
const User = db.User;
const Cart = db.Cart;
const Cart_item = db.Cart_item;
const Category = db.Category;
const Category_image = db.Category_image;
const Product = db.Product;
const Product_image = db.Product_image;
const Payment = db.Payment;
const Shipping_method = db.Shipping_method;
const Shipment = db.Shipment;
const Store_pickup = db.Store_pickup;

// ************ Controllers ************

const homeController = {

    home: function (req, res) {
        Category.findAll({
            include: [
              { association: 'category_image' },
              { association: 'products' }
            ],
            group: ['name']
          })
          .then(CategoriesResult => {
            Product.findAll({
              include: [
                { association: 'product_image' }
              ]
            })
            .then(ProductsResult => {
              res.render('index', { CategoriesResult, ProductsResult });
            })
            .catch(error => {
              console.error('Error:', error);
              // Manejo de errores
            });
          })
          .catch(error => {
            console.error('Error:', error);
            // Manejo de errores
          });
    }
}

module.exports = homeController;