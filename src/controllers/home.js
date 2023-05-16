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
const Favorite = db.Favorite;
const Payment = db.Payment;
const Shipping_method = db.Shipping_method;
const Shipment = db.Shipment;
const Store_pickup = db.Store_pickup;

// ************ Controllers ************

const homeController = {

    home: function (req, res) {
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
    
      const getPopularProducts = Product.findAll({
        limit: 8,
        order: [
          ['sold_count', 'DESC']
        ],
        include: [
          { association: 'product_images' }
        ]
      });
    
      const getCategories = Category.findAll({
        order: [
          ['name', 'ASC']
        ]
      });

      const getProductCountInCart = Cart_item.sum( 'quantity' ,{
        include: [
          {
            model: Cart,
            as: 'cart',
            where: { user_id: 1 } // ACA MODIFICAR SEGUN USER LOGUEADO
          }
        ]
      });

      const getProductCountInFavorite = Favorite.count({
        include: [
          {
            model: User,
            as: 'user',
            where: { id: 1 } // ACA MODIFICAR SEGUN USER LOGUEADO
          }
        ]
      });      

      Promise.all([getFeaturedProducts, getPopularProducts, getCategories, getProductCountInCart, getProductCountInFavorite])
        .then(([FeaturedProducts, PopularProducts, CategoriesResult, ProductCountInCart, ProductCountInFavorite]) => {
          res.render('index', { FeaturedProducts, PopularProducts, CategoriesResult, ProductCountInCart, ProductCountInFavorite });
        })
        .catch(error => {
          console.error('Error:', error);
          // Manejo de errores
        });
    }
    

}

module.exports = homeController;