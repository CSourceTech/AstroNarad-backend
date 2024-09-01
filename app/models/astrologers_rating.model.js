// models/rating.model.js

module.exports = (sequelize, Sequelize) => {
    const AstrologersRating = sequelize.define("astrologers_rating", {
        astro_id: {
            type: Sequelize.INTEGER,
            allowNull: false,
        },
        user_id: {
            type: Sequelize.INTEGER,
            allowNull: false,
        },
        rating: {
            type: Sequelize.FLOAT,
            allowNull: false,
            validate: {
                min: 1,
                max: 5
            }
        }
    });

    return AstrologersRating;
};