// app/models/user_profile.model.js

module.exports = (sequelize, Sequelize) => {
  const UserProfile = sequelize.define("user_profile", {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: Sequelize.INTEGER,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    name: {
      type: Sequelize.STRING,
    },
    date_of_birth: {
      type: Sequelize.DATE,
    },
    profile_image: {
      type: Sequelize.STRING,
    },
    gender: {
      type: Sequelize.STRING,
    },
    place_of_birth: {
      type: Sequelize.STRING,
    },
    time_of_birth: {
      type: Sequelize.TIME,
    }
  });

  return UserProfile;
};