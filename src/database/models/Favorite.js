module.exports = (sequelize, dataTypes) => {
    let alias = 'Favorite';
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
        product_id: {
            type: dataTypes.INTEGER(5),
            allowNull: false
        }
    };
    let config = {
        tableName: "favorites",
        timestamps: false
    }

    const Favorite = sequelize.define(alias, cols, config);

    Favorite.associate = function (models) {

        Favorite.belongsTo(models.User, {
            as: 'user',
            foreignKey: 'user_id',
            onDelete: 'CASCADE'
        });

        Favorite.belongsTo(models.Product, {
            as: 'product',
            foreignKey: 'product_id',
            onDelete: 'CASCADE'
        });
    }
    
    return Favorite;
};