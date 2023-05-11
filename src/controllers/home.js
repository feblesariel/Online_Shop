// ************ Requires ************

//--- DB

const db = require('../database/models/index.js');
const sequelize = db.sequelize;
const { Op } = require("sequelize");

const User = db.User;
const Cart = db.Cart;
const Cart_item = db.Cart_item;
const Product = db.Product;
const Category = db.Category;
const Payment = db.Payment;
const Shipment = db.Shipment;

// ************ Controllers ************

const homeController = {

    home: function (req, res) {
        return res.render("index");
    }
}

module.exports = homeController;