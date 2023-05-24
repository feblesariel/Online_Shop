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

const searchController = {  

  search: function (req, res) {

    let user = 0;

    if (req.session.userLogged) {
      let userLogged = req.session.userLogged;
      user = userLogged.id;
    }   

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
          where: { user_id: user } // ACA MODIFICAR SEGUN USER LOGUEADO
        }
      ]
    });

    // barra de busqueda

    const searchTerm = req.query.query || null;
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

    Promise.all([getCategories, getProductCountInCart, getAllProducts])
      .then(([Categories, ProductCountInCart, AllProducts]) => {
        res.render('search', { Categories, ProductCountInCart, AllProducts });
      })
      .catch(error => {
        console.error('Error:', error);
        // Manejo de errores
    });
  }
}

module.exports = searchController;