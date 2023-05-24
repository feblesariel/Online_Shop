// ************ Requires ************

const fs = require("fs");
const path = require("path");
const { validationResult } = require("express-validator");
const { stringify } = require("querystring");
const bcrypt = require('bcryptjs');

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

const usersController = {

  login: function (req, res) {

    res.render("login");

  },

  loginProcess: function (req, res) {
    let errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.render("login", { errors: errors.array(), old: req.body })
    }

    User.findOne({ where: { email: req.body.email } }).then(function (user) {
      if (user) {
        let isOkPassword = bcrypt.compareSync(req.body.password, user.password);
        if (isOkPassword) {
          req.session.userLogged = user;
          return res.redirect("/users/profile");
        } else {
          return res.render("login", { errors: [{ msg: "Contraseña incorrecta." }], old: req.body });
        }
      }
      return res.render("login", { errors: [{ msg: "Usuario no registrado." }], old: req.body });
    }).catch(function (error) {
      console.log(error);
      return res.status(500).json({ error: "Error al buscar el usuario" });
    });
  },

  register: function (req, res) {

    res.render("register");

  },

  registerProcess: function (req, res) {

    let errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.render("register", { errors: errors.array(), old: req.body })
    }

    User.findOne({ where: { email: req.body.email } }).then(function (user) {
      if (user) {
        return res.render("register", { errors: [{ msg: "Email ya registrado." }], old: req.body })
      }
    })

    User.create(
      {
        email: req.body.email,
        password: bcrypt.hashSync(req.body.password, 10),
        name: req.body.name
      }
    ).then(function (user) {

      Cart.create({
        user_id: user.id
      }).then(function () {
        return res.redirect("/users/login");
      }).catch(function (error) {
        console.log(error);
        return res.status(500).json({ error: "Error al crear el carrito" });
      });

    }).catch(function (error) {
      console.log(error);
      return res.status(500).json({ error: "Error al crear el usuario" });
    });
  },

  profile: function (req, res) {

    let user = 0;

    if (req.session.userLogged) {
      let userLogged = req.session.userLogged;
      user = userLogged.id;
    }

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

    Promise.all([getCategories, getProductCountInCart])
      .then(([Categories, ProductCountInCart]) => {
        res.render('profile', { Categories, ProductCountInCart, user: req.session.userLogged });
      }).catch(error => {
        console.error('Error:', error);
        // Manejo de errores
    });
    
  },

  logout: function (req, res) {

    req.session.destroy();

    res.redirect("/")

  },

  userEdit: function (req, res) {

    let old = req.session.userLogged;

    return res.render("userEdit", { old });

  },

  userEditProcces: function (req, res) {

    let old = req.session.userLogged;

    let errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.render("userEdit", { errors: errors.array(), old: req.body })
    }

    User.update(
      {
        name: req.body.name,
        email: req.body.email,
        password: bcrypt.hashSync(req.body.password, 10)
      },
      {
        where: { id: old.id }
      })
      .then(() => {
        User.findByPk(old.id).then((user) => {
          req.session.userLogged = user;
          return res.redirect('/users/profile')
        }).catch(error => {
          console.error('Error:', error);
          // Manejo de errores
        });
      }).catch(error => {
        console.error('Error:', error);
        // Manejo de errores
      });
  },

  userDestroy: function (req, res) {

    let userId = req.params.id;

    req.session.destroy();

    User.destroy({ where: { id: userId }, force: true }).then(() => {
      return res.redirect('/users/login')
    }).catch(error => {
      console.error('Error:', error);
      // Manejo de errores
    });
  },

}

module.exports = usersController;