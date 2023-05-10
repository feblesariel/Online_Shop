module.exports = (sequelize, dataTypes) => {
    let alias = 'Product_image';
    let cols = {
        id: {
            type: dataTypes.INTEGER(5),
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        url: {
            type: dataTypes.STRING(100),
            allowNull: false
        },
        product_id: {
            type: dataTypes.INTEGER(5),
            allowNull: false,
        },
        is_primary: {
            type: dataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        }
    };
    let config = {
        tableName: "product_images",
        timestamps: false
    }

    const Product_image = sequelize.define(alias, cols, config); 

    Product_image.associate = function (models) {

        Product_image.belongsTo(models.Product, {
            as: 'product',
            foreignKey: 'product_id',
            onDelete: 'CASCADE'
        });
        
    }

    return Product_image;
};