// models/shopping/transaction.model.js

module.exports = (sequelize, Sequelize) => {
    const Transaction = sequelize.define("transaction", {
        transaction_id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        user_id: {
            type: Sequelize.INTEGER,
            allowNull: false,
        },
        order_id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
                model: 'orders',
                key: 'order_id',
            },
        },
        amount: {
            type: Sequelize.FLOAT,
            allowNull: false,
        },
        payment_method: {
            type: Sequelize.STRING, // e.g., "UPI", "Credit Card"
        },
        status: {
            type: Sequelize.STRING, // e.g., "Success", "Failed"
            allowNull: false,
        },
        timestamp: {
            type: Sequelize.DATE,
            defaultValue: Sequelize.NOW,
        },
        gateway_response: {
            type: Sequelize.TEXT, // Store response from payment gateway
        }
    });

    return Transaction;
};
