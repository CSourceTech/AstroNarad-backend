// models/user_horoscope_relation.model.js

module.exports = (sequelize, Sequelize) => {
    const UserHoroscopeRelation = sequelize.define("user_horoscope_relation", {
        user_id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
                model: 'users',
                key: 'id'
            }
        },
        horoscope_id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
                model: 'user_horoscopes',
                key: 'id'
            }
        }
    });

    return UserHoroscopeRelation;
};
