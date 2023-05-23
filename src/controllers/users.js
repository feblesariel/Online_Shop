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
          return res.redirect("/");
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

  logout: function (req, res) {

    req.session.destroy();

    res.redirect("/users/login")

  },
  

}

module.exports = usersController;