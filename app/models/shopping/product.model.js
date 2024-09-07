// models/shopping/product.model.js

module.exports = (sequelize, Sequelize) => {
    const Product = sequelize.define("product", {
        product_id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        category_id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
                model: 'product_categories',
                key: 'category_id',
            }
        },
        name: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        price_in_rupee: {
            type: Sequelize.FLOAT,
            allowNull: false,
        },
        quality: {
            type: Sequelize.FLOAT,
            allowNull: false,
        },
        discount: {
            type: Sequelize.FLOAT,
            allowNull: true,
        },
        description: {
            type: Sequelize.TEXT,
            allowNull: true,
        },
        stock_quantity: {
            type: Sequelize.INTEGER,
            allowNull: false,
        },
        rating: {
            type: Sequelize.FLOAT,
            allowNull: true,
        },
        image: {
            type: Sequelize.STRING,
            allowNull: true,
        },
        colour_options: {
            type: Sequelize.STRING,
            allowNull: true,
        },
        time_taken_to_deliver: {
            type: Sequelize.STRING,
            allowNull: true,
        },
    });

    return Product;
};
