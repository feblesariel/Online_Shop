module.exports = (sequelize, dataTypes) => {
    let alias = 'Shipment_cost';
    let cols = {
        id: {
            type: dataTypes.INTEGER(5),
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        price: {
            type: dataTypes.DECIMAL(10,2),
            allowNull: false
        }
    };
    let config = {
        tableName: "shipments_cost",
        timestamps: false
    }

    const Shipment_cost = sequelize.define(alias, cols, config);
    
    
    return Shipment_cost;
};