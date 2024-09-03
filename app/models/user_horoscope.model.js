// models/user_horoscope.model.js

module.exports = (sequelize, Sequelize) => {
    const UserHoroscope = sequelize.define("user_horoscope", {
        user_id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
                model: 'users',
                key: 'id'
            }
        },
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        name: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        sun_sign: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        moon_sign: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        element: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        rising_sign: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        modality: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        married_status: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        zodiac_sign: {
            type: Sequelize.STRING,
            allowNull: false,
        }
    });

    return UserHoroscope;
};
