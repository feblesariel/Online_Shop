module.exports = (sequelize, dataTypes) => {
    let alias = 'Payment';
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
        },
        cart_id: {
            type: dataTypes.INTEGER(5),
            allowNull: false
        },
        amount: {
            type: dataTypes.DECIMAL(10,2),
            allowNull: false
        },
        payment_method: {
            type: dataTypes.ENUM('credit_card','debit_card','paypal', 'cash'),
            allowNull: false
        }, 
        transaction_id: {
            type: dataTypes.STRING(100),
            allowNull: false
        },
        status: {
            type: dataTypes.ENUM('pending','completed','failed'),
            allowNull: false,
            defaultValue: 'pending'
        }
    };
    let config = {
        tableName: "payments",
        timestamps: true
    }

    const Payment = sequelize.define(alias, cols, config); 

    Payment.associate = function (models) {

        Payment.belongsTo(models.User,{
            as: 'user',
            foreignKey: 'user_id'
        }); 
        Payment.belongsTo(models.Cart, { 
            as: 'cart',
            foreignKey: 'cart_id'
        });       
    }

    return Payment;
};