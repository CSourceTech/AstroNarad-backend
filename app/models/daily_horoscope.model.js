// models/daily_horoscope.model.js

module.exports = (sequelize, Sequelize) => {
    const DailyHoroscope = sequelize.define("daily_horoscope", {
        zodiac_sign: {
            type: Sequelize.STRING,
            allowNull: false,
            unique: true,
        },
        date: {
            type: Sequelize.DATEONLY,
            allowNull: false,
        },
        horoscope: {
            type: Sequelize.TEXT,
            allowNull: false,
        },
    });

    return DailyHoroscope;
};
