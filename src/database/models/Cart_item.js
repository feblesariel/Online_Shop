module.exports = (sequelize, dataTypes) => {
    let alias = 'Cart_item';
    let cols = {
        id: {
            type: dataTypes.INTEGER(5),
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        cart_id: {
            type: dataTypes.INTEGER(5),
            allowNull: false
        },
        product_id: {
            type: dataTypes.INTEGER(5),
            allowNull: false
        },
        quantity: {
            type: dataTypes.INTEGER(5),
            allowNull: false
        }
    };
    let config = {
        tableName: "cart_items",
        timestamps: false
    }

    const Cart_item = sequelize.define(alias, cols, config);

    Cart_item.associate = function (models) {

        Cart_item.belongsTo(models.Cart, {
            as: 'cart',
            foreignKey: 'cart_id',
            onDelete: 'CASCADE'
        });

        Cart_item.belongsTo(models.Product, {
            as: 'product',
            foreignKey: 'product_id',
            onDelete: 'CASCADE'
        });
    }
    
    return Cart_item;
};