// ************ Requires ************

//--- DB

const db = require('../database/models/index.js');
const User = db.User;
const Cart = db.Cart;
const Cart_item = db.Cart_item;
const Product = db.Product;
const Category = db.Category;
const Payment = db.Payment;
const Shipment = db.Shipment;

// ************ Controllers ************

const mainController = {

    index: function (req, res) {

        // Product.create(
        //     {
        //         name: "NIKE",
        //         price: 150000,
        //         description: "La mejor",
        //         stock: 5,
        //         category_id: 1

        //     }
        // ).then(function () { console.log("TODO OK") })

        Category.destroy({ where: { id: 1 } })
        .then(() => {
            console.log("BORRADO");
        })

        return res.render("index");
    }
}

module.exports = mainController;