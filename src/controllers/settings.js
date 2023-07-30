// ************ Requires ************

//--- DB

const db = require('../database/models/index.js');
const sequelize = db.sequelize;
const { Op } = require("sequelize");

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
          where: { user_id: user } // ACA MODIFICAR SEGUN USER LOGUEADO
        }
      ]
    });

    // consulto los productos - listado de productos ajustes

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

    // consulto los usuarios - listado de usuarios ajustes

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

    Promise.all([getCategories, getProductCountInCart, getProducts ,getUsers])
      .then(([Categories, ProductCountInCart, Products, Users]) => {
        res.render('settings', { Categories, ProductCountInCart, Products, Users});
      })
      .catch(error => {
        console.error('Error:', error);
        // Manejo de errores
    });
  },

  userDestroy: function (req, res) {

    let userId = req.params.id;

    if (req.session.userLogged.id == userId){
      req.session.destroy();
    }

    User.destroy({ where: { id: userId }, force: true }).then(() => {
      return res.redirect('/settings/')
    }).catch(error => {
      console.error('Error:', error);
      // Manejo de errores
    });
  }

}

module.exports = settingsController;