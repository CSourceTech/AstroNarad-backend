// app/models/user_otps.model.js

module.exports = (sequelize, Sequelize) => {
  const UserOtp = sequelize.define("user_otps", {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    otp: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    expiry_date: {
      type: Sequelize.DATE,
      allowNull: false,
    },
  });

  return UserOtp;
};