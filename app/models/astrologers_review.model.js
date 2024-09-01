// app/models/astrologers_review.model.js

module.exports = (sequelize, DataTypes) => {
    const AstrologersReview = sequelize.define("astrologers_review", {
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        astro_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        message: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
    });

    return AstrologersReview;
};