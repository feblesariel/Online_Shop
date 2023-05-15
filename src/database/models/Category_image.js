module.exports = (sequelize, dataTypes) => {
    let alias = 'Category_image';
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
        category_id: {
            type: dataTypes.INTEGER(5),
            allowNull: false,
        }
    };
    let config = {
        tableName: "categories_images",
        timestamps: false
    }

    const Category_image = sequelize.define(alias, cols, config); 

    Category_image.associate = function (models) {

        Category_image.belongsTo(models.Category, {
            as: 'category',
            foreignKey: 'category_id',
            onDelete: 'CASCADE'
        });
        
    }

    return Category_image;
};