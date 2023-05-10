module.exports = (sequelize, dataTypes) => {
    let alias = 'Shipment';
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
        user_id: {
            type: dataTypes.INTEGER(5),
            allowNull: false
        },
        address: {
            type: dataTypes.STRING(100),
            allowNull: false
        },
        city: {
            type: dataTypes.STRING(50),
            allowNull: false
        }, 
        state: {
            type: dataTypes.STRING(50),
            allowNull: false
        },
        postal_code: {
            type: dataTypes.STRING(10),
            allowNull: false
        },
        total: {
            type: dataTypes.DECIMAL(10,2),
            allowNull: false
        },
        status: {
            type: dataTypes.ENUM('pending','shipped','delivered'),
            allowNull: false,
            defaultValue: 'pending'
        }
    };
    let config = {
        tableName: "shipments",
        timestamps: true
    }

    const Shipment = sequelize.define(alias, cols, config); 

    Shipment.associate = function (models) {

        Shipment.belongsTo(models.Cart, { 
            as: 'cart',
            foreignKey: 'cart_id'
        });

        Shipment.belongsTo(models.User,{
            as: 'user',
            foreignKey: 'user_id'
        });        
    }

    return Shipment;
};