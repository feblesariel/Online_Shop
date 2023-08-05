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
const Shipment_cost = db.Shipment_cost;
const Shipment = db.Shipment;

// ************ Controllers ************

const productsController = {

  products: function (req, res) {

    let user = 0;

    if (req.session.userLogged) {
      let userLogged = req.session.userLogged;
      user = userLogged.id;
    }   

    // Consulto las categorias - navbar ------------------------------------------------------------

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

    // Calculo cuantos items hay en el carrito - navbar --------------------------------------------

    const getProductCountInCart = Cart_item.sum('quantity', {
      include: [
        {
          model: Cart,
          as: 'cart',
          where: { user_id: user } // ACA MODIFICAR SEGUN USER LOGUEADO
        }
      ]
    });

    // Consulto todos los productos con parametros de ordenamiento - productos ---------------------

    const categoryFilter = req.query.categoryFilter ? JSON.parse(req.query.categoryFilter) : [];
    const brandFilter = req.query.brandFilter ? JSON.parse(req.query.brandFilter) : [];
    const order = req.query.order;

    const page = req.query.page ? parseInt(req.query.page) : 1;
    const perPage = 9; // Cantidad de productos por página
    const offset = (page - 1) * perPage;
    const limit = perPage;

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
        ...(categoryFilter.length > 0 ? [{ category_id: categoryFilter }] : []),
        ...(brandFilter.length > 0 ? [{ brand: brandFilter }] : [])
      ]
    };

    const getAllProducts = Product.findAll({
      where: {
        [Op.and]: whereClause[Op.and]
      },
      order: orderOption,
      limit,
      offset,
      include: [{ association: 'product_images' }]
    });

    // Consulto la cantidad de productos que hay con la actual configuracion de filtrado -  paginacion

    const getTotalFilteredProductCount = Product.count({
      where: whereClause[Op.and]
    });

    // Consulto las categorias y la cantidad de productos que tienen - filtro categoria ------------

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

    // Consulto el total de productos que hay - category ------------------------------------------


    const getTotalProductCount = Product.count('category_id');


    // consulto el total de productos que hay - brand ---------------------------------------------

    const categoryFilterTotal = req.query.categoryFilter ? JSON.parse(req.query.categoryFilter) : [];

    const whereClauseTotal = {
      ...(categoryFilter.length > 0 ? { category_id: categoryFilterTotal } : {})
    };

    const getTotalProductCountBrand = Product.count({
      where: whereClauseTotal
    });

    // Consulto las marcas y el total de productos que tienen - filtro marca ----------------------

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

    Promise.all([getCategories, getProductCountInCart, getCategoriesWithProductCount, getTotalProductCount, getBrandProductCount, getAllProducts, getTotalProductCountBrand, getTotalFilteredProductCount])
      .then(([Categories, ProductCountInCart, CategoriesWithProductCount, TotalProductCount, BrandProductCount, AllProducts, TotalProductCountBrand, TotalFilteredProductCount]) => {
        const totalPages = Math.ceil(TotalFilteredProductCount / perPage);
        res.render('products', { Categories, ProductCountInCart, CategoriesWithProductCount, TotalProductCount, BrandProductCount, AllProducts, TotalProductCountBrand, currentPage: page, totalPages });
      })
      .catch(error => {
        console.error('Error:', error);
        // manejo de errores
    });
  },

  detail: function (req, res) {

    let user = 0;

    if (req.session.userLogged) {
      let userLogged = req.session.userLogged;
      user = userLogged.id;
    }   

    // Consulto las categorias - navbar ------------------------------------------------------------

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

    // Calculo cuantos items hay en el carrito - navbar --------------------------------------------

    const getProductCountInCart = Cart_item.sum('quantity', {
      include: [
        {
          model: Cart,
          as: 'cart',
          where: { user_id: user } // ACA MODIFICAR SEGUN USER LOGUEADO
        }
      ]
    });

    // Consulto producto - detail ------------------------------------------------------------------

    const getProductByPk = Product.findByPk(req.params.id);

    // Consulto las imagenes del producto - detail -------------------------------------------------

    const getImagesProduct = Product_image.findAll({
      where: { product_id: req.params.id }
    })

    // Consulto todos los productos - carrousel ----------------------------------------------------

    const getAllProducts = Product.findAll({
      order: [
        ['name', 'ASC']
      ],
      include: [
        { association: 'product_images' }
      ]
    });

    Promise.all([getProductByPk, getImagesProduct, getCategories, getProductCountInCart, getAllProducts])
      .then(([ProductByPk, ImagesProduct, Categories, ProductCountInCart, AllProducts]) => {
        res.render('detail', { ProductByPk, ImagesProduct, Categories, ProductCountInCart, AllProducts });
      })
      .catch(error => {
        console.error('Error:', error);
        // manejo de errores
    });
  },

  offers: function (req, res) {

    let user = 0;

    if (req.session.userLogged) {
      let userLogged = req.session.userLogged;
      user = userLogged.id;
    }

    // Consulto los productos en oferta - offers -----------------------------------------
  
    const getOffersProducts = Product.findAll({
      where: {
        is_offer: true
      },
      order: [
        ['name', 'ASC']
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

    Promise.all([getOffersProducts, getCategories, getProductCountInCart])
      .then(([OffersProducts, Categories, ProductCountInCart]) => {
        res.render('offers', { OffersProducts, Categories, ProductCountInCart});
      })
      .catch(error => {
        console.error('Error:', error);
        // manejo de errores
    });

  }

}

module.exports = productsController;