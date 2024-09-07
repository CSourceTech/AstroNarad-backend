// models/shopping/order.model.js

module.exports = (sequelize, Sequelize) => {
    const Order = sequelize.define("order", {
        order_id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        user_id: {
            type: Sequelize.INTEGER,
            allowNull: false,
        },
        transaction_id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
                model: 'transactions',
                key: 'transaction_id',
            },
        },
        cart_id: {
            type: Sequelize.INTEGER,
            allowNull: false,
        },
        amount: {
            type: Sequelize.FLOAT,
            allowNull: false,
        },
    });

    return Order;
};
