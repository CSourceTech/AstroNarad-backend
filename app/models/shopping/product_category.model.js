// models/shopping/product_category.model.js

module.exports = (sequelize, Sequelize) => {
    const ProductCategory = sequelize.define("product_category", {
        category_id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        category_name: {
            type: Sequelize.STRING,
            allowNull: false,
        },
    });

    return ProductCategory;
};
