// models/shopping/address.model.js

module.exports = (sequelize, Sequelize) => {
    const Address = sequelize.define("address", {
        address_id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        user_id: {
            type: Sequelize.INTEGER,
            allowNull: false,
        },
        street: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        city: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        state: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        postal_code: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        country: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        address_type: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        is_selected: {
            type: Sequelize.BOOLEAN,
            defaultValue: false,
        }
    });

    return Address;
};
