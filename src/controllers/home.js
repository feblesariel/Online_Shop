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

const homeController = {

    home: function (req, res) {
      
      let user = 0;

      if (req.session.userLogged) {
        let userLogged = req.session.userLogged;
        user = userLogged.id;
      }    

      // Consulto los productos destacados - home -------------------------------------------

      const getFeaturedProducts = Product.findAll({
        where: {
          is_featured: true
        },
        limit: 8,
        order: [
          ['name', 'ASC']
        ],
        include: [
          { association: 'product_images' }
        ]
      });

      // Consulto los productos mas vendidos - home -----------------------------------------
    
      const getPopularProducts = Product.findAll({
        limit: 8,
        order: [
          ['sold_count', 'DESC']
        ],
        include: [
          { association: 'product_images' }
        ]
      });

      // Consulto las categorias - navbar ---------------------------------------------------
    
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

      // Calculo cuantos items hay en el carrito - navbar -----------------------------------

      const getProductCountInCart = Cart_item.sum( 'quantity' ,{
        include: [
          {
            model: Cart,
            as: 'cart',
            where: { user_id: user } // ACA MODIFICAR SEGUN USER LOGUEADO
          }
        ]
      });  

      Promise.all([getFeaturedProducts, getPopularProducts, getCategories, getProductCountInCart])
        .then(([FeaturedProducts, PopularProducts, Categories, ProductCountInCart]) => {
          res.render('index', { FeaturedProducts, PopularProducts, Categories, ProductCountInCart});
        })
        .catch(error => {
          console.error('Error:', error);
          // manejo de errores
      });
    }
}

module.exports = homeController;