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

const searchController = {

    search: function (req, res) {

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
            order: [
            ['name', 'ASC']
            ],
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

        // consulto el total de productos que hay - se usa en ambos filtros

        const getTotalProductCount = Product.count('category_id');

        // consulto las categorias y la cantidad de productos que tienen - filtro categoria

        const getCategoriesWithProductCount = Category.findAll({
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

        // consulto las marcas y el total de productos que tienen - filtro marca

        const getBrandProductCount = Product.findAll({
            attributes: [
              'brand',
              [sequelize.fn('COUNT', sequelize.col('id')), 'productCount']
            ],
            group: 'brand',
            order: [['brand', 'ASC']],
            raw: true
        });   

        // barra de busqueda

        const searchTerm = req.query.query || '';
        const categoryFilter = req.query.categoryFilter ? JSON.parse(req.query.categoryFilter) : [];
        const brandFilter = req.query.brandFilter ? JSON.parse(req.query.brandFilter) : [];
        const order = req.query.order;
        
        let orderOption = [];
        
        if (order === 'name') {
          orderOption = [['name', 'ASC']];
        } else if (order === 'popular') {
          orderOption = [['sold_count', 'DESC']];
        } else if (order === 'lowPrice') {
          orderOption = [['price', 'ASC']];
        } else if (order === 'highPrice') {
          orderOption = [['price', 'DESC']];
        }
        
        const whereClause = {
          [Op.or]: [
            { name: { [Op.like]: `%${searchTerm}%` } },
            { brand: { [Op.like]: `%${searchTerm}%` } },
            { model: { [Op.like]: `%${searchTerm}%` } }
          ]
        };
        
        if (categoryFilter.length > 0) {
          whereClause.category_id = categoryFilter;
        }
        
        if (brandFilter.length > 0) {
          whereClause.brand = brandFilter;
        }
        
        const getAllProducts = Product.findAll({
          where: whereClause,
          order: orderOption,
          include: [{ association: 'product_images' }]
        });       
        
        Promise.all([getCategories, getProductCountInCart ,getAllProducts, getTotalProductCount, getCategoriesWithProductCount, getBrandProductCount])
            .then(([CategoriesResult, ProductCountInCart ,AllProducts, TotalProductCount, CategoriesWithProductCount, BrandProductCount]) => {
            res.render('products', { CategoriesResult, ProductCountInCart ,AllProducts, TotalProductCount, CategoriesWithProductCount, BrandProductCount});
            })
            .catch(error => {
            console.error('Error:', error);
            // Manejo de errores
        });
    }    
    
}

module.exports = searchController;