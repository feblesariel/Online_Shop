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


        const categoriesWithProductCount = Category.findAll({
            attributes: ['id', 'name'],
            include: [{
                model: Product,
                as: 'products',
                attributes: [],
            }],
            group: ['Category.id', 'Category.name'],
            having: {
                '$Category.id$': {
                    [Op.ne]: null
                },
                '$Category.name$': {
                    [Op.ne]: null
                },
                '$products.id$': {
                    [Op.ne]: null
                }
            }
        }).then(categories => {
            // Obtener la cantidad de productos por categoría
            const categoriesWithCount = categories.map(category => ({
                id: category.id,
                name: category.name,
                productCount: category.products.length
            }));
            console.log(categoriesWithCount)
        })



        Promise.all([getCategories, getProductCountInCart])
            .then(([CategoriesResult, ProductCountInCart]) => {
                res.render('products', { CategoriesResult, ProductCountInCart });
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