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

const cartController = {

  cart: function (req, res) {

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
          where: { user_id: user} // ACA MODIFICAR SEGUN USER LOGUEADO
        }
      ]
    });

    const getCartItems = Cart_item.findAll({
      where: { cart_id: user },
      include: [
        {
          model: Product,
          as: 'product'
        }
      ]
    });

    Promise.all([getCategories, getProductCountInCart, getCartItems])
      .then(([Categories, ProductCountInCart, CartItems]) => {
        res.render('cart', { Categories, ProductCountInCart, CartItems });
      })
      .catch(error => {
        console.error('Error:', error);
        // Manejo de errores
      });
  },

  cartDetailProcces: function (req, res) {

    let user = req.session.userLogged;

    Cart_item.create(
      {
        cart_id: user.id,
        product_id: req.params.id,
        quantity: req.body.quantity
      }
    ).then(() => {
      return res.redirect("/cart")
    }).catch(error => {
      console.error('Error:', error);
      // Manejo de errores
    });

  },

  cartProcces: function (req, res) {

    let user = req.session.userLogged;

    Cart_item.create(
      {
        cart_id: user.id,
        product_id: req.params.id,
        quantity: 1
      }
    ).then(() => {
      return res.redirect("/cart")
    }).catch(error => {
      console.error('Error:', error);
      // Manejo de errores
    });

  },

  cartEdit: function (req, res) {

    Cart_item.findByPk(req.params.id).then((item) => {
      Cart_item.update(
        {
          quantity: req.body.quantity
        },
        {
          where: { id: item.id }
        }).then(() => {
          return res.redirect('/cart')
        }).catch(error => {
          console.error('Error:', error);
          // Manejo de errores
        });
    }).catch(error => {
      console.error('Error:', error);
      // Manejo de errores
    });

  },

  cartDelete: function (req, res) {

    Cart_item.findByPk(req.params.id).then((item) => {
      Cart_item.destroy({ where: { id: item.id } })
        .then(() => {
          return res.redirect("/cart")
        }).catch(error => {
          console.error('Error:', error);
          // Manejo de errores
        });
    }).catch(error => {
      console.error('Error:', error);
      // Manejo de errores
    });

  }

}

module.exports = cartController;