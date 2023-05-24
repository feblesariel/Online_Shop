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
const Product = db.Product;
const Product_image = db.Product_image;
const Payment = db.Payment;
const Shipping_method = db.Shipping_method;
const Shipment = db.Shipment;
const Store_pickup = db.Store_pickup;

// ************ Controllers ************

const settingsController = {

  main: function (req, res) {

    let user = req.session.userLogged;

    // consulto las categorias - navbar

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

    // calculo cuantos items hay en el carrito - navbar

    const getProductCountInCart = Cart_item.sum('quantity', {
      include: [
        {
          model: Cart,
          as: 'cart',
          where: { user_id: user.id } // ACA MODIFICAR SEGUN USER LOGUEADO
        }
      ]
    });

    Promise.all([getCategories, getProductCountInCart])
      .then(([Categories, ProductCountInCart]) => {
        res.render('settings', { Categories, ProductCountInCart});
      })
      .catch(error => {
        console.error('Error:', error);
        // Manejo de errores
    });
  }
}

module.exports = settingsController;