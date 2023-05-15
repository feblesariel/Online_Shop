module.exports = (sequelize, dataTypes) => {
    let alias = 'Cart';
    let cols = {
        id: {
            type: dataTypes.INTEGER(5),
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        user_id: {
            type: dataTypes.INTEGER(5),
            allowNull: false
        }
    };
    let config = {
        tableName: "carts",
        timestamps: false
    }

    const Cart = sequelize.define(alias, cols, config);

    Cart.associate = function (models) {

        Cart.belongsTo(models.User, {
            as: 'user',
            foreignKey: 'user_id',
            onDelete: 'CASCADE'
        });
    }
    
    return Cart;
};