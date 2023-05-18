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

        const getProductCountInCart = Cart_item.sum('quantity', {
            include: [
                {
                    model: Cart,
                    as: 'cart',
                    where: { user_id: 1 } // ACA MODIFICAR SEGUN USER LOGUEADO
                }
            ]
        });

        // consulto todos los productos con parametros de ordenamiento - productos

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
          [Op.and]: [
            {
              [Op.or]: [
                { code: { [Op.like]: `%${searchTerm}%` } },
                { name: { [Op.like]: `%${searchTerm}%` } },
                { brand: { [Op.like]: `%${searchTerm}%` } },
                { model: { [Op.like]: `%${searchTerm}%` } }
              ]
            },
            ...(categoryFilter.length > 0 ? [{ category_id: categoryFilter }] : []),
            ...(brandFilter.length > 0 ? [{ brand: brandFilter }] : [])
          ]
        };
        
        const getAllProducts = Product.findAll({
          where: {
            [Op.and]: whereClause[Op.and]
          },
          order: orderOption,
          include: [{ association: 'product_images' }]
        });
        

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

        // consulto el total de productos que hay - category


        const getTotalProductCount = Product.count('category_id');
                        
          
        // consulto el total de productos que hay - brand

        const categoryFilterTotal = req.query.categoryFilter ? JSON.parse(req.query.categoryFilter) : [];

        const whereClauseTotal = {
          ...(categoryFilter.length > 0 ? { category_id: categoryFilterTotal } : {})
        };

        const getTotalProductCountBrand = Product.count({
          where: whereClauseTotal
        });

        // consulto las marcas y el total de productos que tienen - filtro marca

        const categoryFilterBrand = req.query.categoryFilter ? JSON.parse(req.query.categoryFilter) : [];

        const whereClauseBrand = {
          ...(categoryFilter.length > 0 ? { category_id: categoryFilterBrand } : {})
        };
        
        const getBrandProductCount = Product.findAll({
          attributes: [
            'brand',
            [sequelize.fn('COUNT', sequelize.col('id')), 'productCount']
          ],
          where: whereClauseBrand,
          group: 'brand',
          order: [['brand', 'ASC']],
          raw: true
        });    
                  
        Promise.all([getCategories, getProductCountInCart, getCategoriesWithProductCount, getTotalProductCount, getBrandProductCount, getAllProducts, getTotalProductCountBrand])
            .then(([CategoriesResult, ProductCountInCart, CategoriesWithProductCount, TotalProductCount, BrandProductCount, AllProducts, TotalProductCountBrand]) => {
                res.render('products', { CategoriesResult, ProductCountInCart, CategoriesWithProductCount, TotalProductCount, BrandProductCount, AllProducts, TotalProductCountBrand});
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