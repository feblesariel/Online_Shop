module.exports = (sequelize, dataTypes) => {
    let alias = 'Shipping_method';
    let cols = {
        id: {
            type: dataTypes.INTEGER(5),
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: dataTypes.STRING(100),
            allowNull: false
        }
    };
    let config = {
        tableName: "shipping_methods",
        timestamps: false
    }

    const Shipping_method = sequelize.define(alias, cols, config);

    
    return Shipping_method;
};