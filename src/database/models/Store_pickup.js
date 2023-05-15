module.exports = (sequelize, dataTypes) => {
    let alias = 'Store_pickup';
    let cols = {
        id: {
            type: dataTypes.INTEGER(5),
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        store_id: {
            type: dataTypes.INTEGER(5),
            allowNull: false
        },
        shipping_method_id: {
            type: dataTypes.INTEGER(5),
            allowNull: false
        },        
        cart_id: {
            type: dataTypes.INTEGER(5),
            allowNull: false
        },
        user_id: {
            type: dataTypes.INTEGER(5),
            allowNull: false
        },
        status: {
            type: dataTypes.ENUM('pending','retired'),
            allowNull: false,
            defaultValue: 'pending'
        }
    };
    let config = {
        tableName: "store_pickups",
        timestamps: true
    }

    const Store_pickup = sequelize.define(alias, cols, config); 

    Store_pickup.associate = function (models) {

        Store_pickup.belongsTo(models.Store, { 
            as: 'store',
            foreignKey: 'store_id'
        });

        Store_pickup.belongsTo(models.Shipping_method,{
            as: 'method',
            foreignKey: 'shipping_method_id'
        }); 

        Store_pickup.belongsTo(models.Cart, { 
            as: 'cart',
            foreignKey: 'cart_id'
        });

        Store_pickup.belongsTo(models.User,{
            as: 'user',
            foreignKey: 'user_id'
        });        
    }

    return Store_pickup;
};