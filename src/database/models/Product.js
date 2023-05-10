module.exports = (sequelize, dataTypes) => {
    let alias = 'Product';
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
        },
        price: {
            type: dataTypes.DECIMAL(10,2),
            allowNull: false
        },
        description: {
            type: dataTypes.TEXT,
            allowNull: false
        },
        stock: {
            type: dataTypes.INTEGER(5),
            allowNull: false,
        }, 
        is_featured: {
            type: dataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        category_id: {
            type: dataTypes.INTEGER(5),
            allowNull: false
        }
    };
    let config = {
        tableName: "products",
        timestamps: false
    }

    const Product = sequelize.define(alias, cols, config); 

    Product.associate = function (models) {

        Product.belongsTo(models.Category, { 
            as: 'category',
            foreignKey: 'category_id',
            onDelete: 'CASCADE'
        });        
    }

    return Product;
};