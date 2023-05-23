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

    User.findOne({ where: { email: req.body.email } }).then(function (usuario) {
        if (usuario) {
            let isOkPassword = bcrypt.compareSync(req.body.password, usuario.contraseña);
            if (isOkPassword) {
                req.session.userLogged = usuario;
                return res.redirect("/users/profile");
            } else {
                return res.render("login", { errors: [{ msg: "Contraseña incorrecta." }], old: req.body });
            }
        }
        return res.render("login", { errors: [{ msg: "Usuario no registrado." }], old: req.body });
    })
  },

  register: function (req, res) {

    res.render("register");

  },

}

module.exports = usersController;