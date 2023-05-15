module.exports = (sequelize, dataTypes) => {
    let alias = 'Store';
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
        }        
    };
    let config = {
        tableName: "stores",
        timestamps: false
    }

    const Store = sequelize.define(alias, cols, config);


    return Store;
};