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

        // CONSULTO LAS CATEGORIAS - NAVBAR

        const getCategories = Category.findAll({
            order: [
                ['name', 'ASC']
            ]
        });

        // CALCULO CUANTOS ITEMS HAY EN CARRITO - NAVBAR

        const getProductCountInCart = Cart_item.sum('quantity', {
            include: [
                {
                    model: Cart,
                    as: 'cart',
                    where: { user_id: 1 } // ACA MODIFICAR SEGUN USER LOGUEADO
                }
            ]
        });

        // CONSULTO TODOS LOS PRODUCTOS - PRODUCTOS

        const getAllProducts = Product.findAll({
            order: [
            ['name', 'ASC']
            ],
            include: [
            { association: 'product_images' }
            ]
        });

        // CONSULTO LAS CATEGORIAS Y LA CANTIDAD DE PRODUCTOS - FILTRO CATEGORIA

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
          
        // CONSULTO EL TOTAL DE PRODUCTOS DE TODAS LAS CATEGORIAS - FILTRO CATEGORIA

        const getTotalProductCount = Product.count('category_id');


        // CONSULTO LAS MARCAS Y EL TOTAL DE PRODUCTOS - FILTRO MARCA

        const getBrandProductCount = Product.findAll({
            attributes: [
              'brand',
              [sequelize.fn('COUNT', sequelize.col('id')), 'productCount']
            ],
            group: 'brand',
            raw: true
        });
                  
        Promise.all([getCategories, getProductCountInCart, getCategoriesWithProductCount, getTotalProductCount, getBrandProductCount, getAllProducts])
            .then(([CategoriesResult, ProductCountInCart, CategoriesWithProductCount, TotalProductCount, BrandProductCount, AllProducts]) => {
                res.render('products', { CategoriesResult, ProductCountInCart, CategoriesWithProductCount, TotalProductCount, BrandProductCount, AllProducts });
            })
            .catch(error => {
                console.error('Error:', error);
                // Manejo de errores
        });
    },

    detail: function (req, res) {

        // CONSULTO PRODUCTO - DETAIL

        const getProductByPk = Product.findByPk(req.params.id);

        // CONSULTO IMAGENES DE UN PRODUCTO - DETAIL

        const getImagesProduct = Product_image.findAll({
            where: { product_id: req.params.id }
        })

        // CONSULTO LAS CATEGORIAS - NAVBAR

        const getCategories = Category.findAll({
            order: [
                ['name', 'ASC']
            ]
        });

        // CALCULO CUANTOS ITEMS HAY EN CARRITO - NAVBAR

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