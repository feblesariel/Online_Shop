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

const productsController = {

    products: function (req, res) {

        // CONSULTO LAS CATEGORIAS

        const getCategories = Category.findAll({
            order: [
                ['name', 'ASC']
            ]
        });

        // CALCULO CUANTOS ITEMS HAY EN CARRITO

        const getProductCountInCart = Cart_item.sum('quantity', {
            include: [
                {
                    model: Cart,
                    as: 'cart',
                    where: { user_id: 1 } // ACA MODIFICAR SEGUN USER LOGUEADO
                }
            ]
        });

        // CONSULTO LAS CATEGORIAS CON LA CANTIDAD DE PRODUCTOS

        const getCategoriesWithProductCount = Category.findAll({
            attributes: [
              'name',
              [
                sequelize.literal('(SELECT COUNT(*) FROM products WHERE products.category_id = Category.id)'),
                'productCount'
              ]
            ],
            having: sequelize.literal('productCount > 0'),
            raw: true
        });                 
          
        // CONSULTO EL TOTAL DE PRODUCTOS DE TODAS LAS CATEGORIAS

        const getTotalProductCount = Product.findOne({
            attributes: [
              [sequelize.fn('COUNT', sequelize.col('id')), 'totalProductCount']
            ],
            raw: true
        });          
                  
        Promise.all([getCategories, getProductCountInCart, getCategoriesWithProductCount, getTotalProductCount])
            .then(([CategoriesResult, ProductCountInCart, CategoriesWithProductCount, TotalProductCount]) => {
                console.log(TotalProductCount);
                res.render('products', { CategoriesResult, ProductCountInCart, CategoriesWithProductCount, TotalProductCount });
            })
            .catch(error => {
                console.error('Error:', error);
                // Manejo de errores
        });
    },

    detail: function (req, res) {

        // CONSULTO PRODUCTO

        const getProductByPk = Product.findByPk(req.params.id);

        // CONSULTO IMAGENES DE UN PRODUCTO

        const getImagesProduct = Product_image.findAll({
            where: { product_id: req.params.id }
        })

        // CONSULTO LAS CATEGORIAS

        const getCategories = Category.findAll({
            order: [
                ['name', 'ASC']
            ]
        });

        // CALCULO CUANTSO ITEMS HAY EN CARRITO

        const getProductCountInCart = Cart_item.sum('quantity', {
            include: [
                {
                    model: Cart,
                    as: 'cart',
                    where: { user_id: 1 } // ACA MODIFICAR SEGUN USER LOGUEADO
                }
            ]
        });

        Promise.all([getProductByPk, getImagesProduct, getCategories, getProductCountInCart])
            .then(([ProductByPk, ImagesProduct, CategoriesResult, ProductCountInCart]) => {
                res.render('detail', { ProductByPk, ImagesProduct, CategoriesResult, ProductCountInCart });
            })
            .catch(error => {
                console.error('Error:', error);
                // Manejo de errores
        });

    }
}

module.exports = productsController;