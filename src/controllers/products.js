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

        // consulto las categorias - navbar

        const getCategories = Category.findAll({
            order: [
                ['name', 'ASC']
            ]
        });

        // calculo cuantos items hay en el carrito - navbar

        const getProductCountInCart = Cart_item.sum('quantity', {
            include: [
                {
                    model: Cart,
                    as: 'cart',
                    where: { user_id: 1 } // ACA MODIFICAR SEGUN USER LOGUEADO
                }
            ]
        });

        // consulto todos los productos - productos

        const getAllProducts = Product.findAll({
            order: [
            ['name', 'ASC']
            ],
            include: [
            { association: 'product_images' }
            ]
        });

        // consulto las categorias y la cantidad de productos que tienen - filtro categoria

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
          
        // consulto el total de productos que hay - se usa en ambos filtros

        const getTotalProductCount = Product.count('category_id');


        // consulto las marcas y el total de productos que tienen - filtro marca

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
                // manejo de errores
        });
    },

    detail: function (req, res) {

        // consulto producto - detail

        const getProductByPk = Product.findByPk(req.params.id);

        // consulto las imagenes del producto - detail

        const getImagesProduct = Product_image.findAll({
            where: { product_id: req.params.id }
        })

        const getAllProducts = Product.findAll({
            order: [
            ['name', 'ASC']
            ],
            include: [
            { association: 'product_images' }
            ]
        });

        // consulto las categorias - navbar

        const getCategories = Category.findAll({
            order: [
                ['name', 'ASC']
            ]
        });

        // calculo cuantos items hay en el carrito - navbar

        const getProductCountInCart = Cart_item.sum('quantity', {
            include: [
                {
                    model: Cart,
                    as: 'cart',
                    where: { user_id: 1 } // ACA MODIFICAR SEGUN USER LOGUEADO
                }
            ]
        });

        Promise.all([getProductByPk, getImagesProduct, getCategories, getProductCountInCart, getAllProducts])
            .then(([ProductByPk, ImagesProduct, CategoriesResult, ProductCountInCart, AllProducts]) => {
                res.render('detail', { ProductByPk, ImagesProduct, CategoriesResult, ProductCountInCart, AllProducts });
            })
            .catch(error => {
                console.error('Error:', error);
                // manejo de errores
        });

    }
}

module.exports = productsController;