// models/shopping/cart.model.js

module.exports = (sequelize, Sequelize) => {
    const Cart = sequelize.define("cart", {
        cart_id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        user_id: {
            type: Sequelize.INTEGER,
            allowNull: false,
        },
    });

    return Cart;
};
