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

const homeController = {

    home: function (req, res) {

      // consulto los productos destacados - home

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

      // consulto los productos mas vendidos - home
    
      const getPopularProducts = Product.findAll({
        limit: 8,
        order: [
          ['sold_count', 'DESC']
        ],
        include: [
          { association: 'product_images' }
        ]
      });

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
        raw: true
      });

      // calculo cuantos items hay en el carrito - navbar

      const getProductCountInCart = Cart_item.sum( 'quantity' ,{
        include: [
          {
            model: Cart,
            as: 'cart',
            where: { user_id: 1 } // ACA MODIFICAR SEGUN USER LOGUEADO
          }
        ]
      });  

      Promise.all([getFeaturedProducts, getPopularProducts, getCategories, getProductCountInCart])
        .then(([FeaturedProducts, PopularProducts, CategoriesResult, ProductCountInCart]) => {
          res.render('index', { FeaturedProducts, PopularProducts, CategoriesResult, ProductCountInCart});
        })
        .catch(error => {
          console.error('Error:', error);
          // manejo de errores
      });
    }
    

}

module.exports = homeController;