module.exports = (sequelize, Sequelize) => {
  const User = sequelize.define("user", {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    email: {
      type: Sequelize.STRING,
      unique: true,
    },
    phone: {
      type: Sequelize.STRING,
      unique: true,
    },
    failed_login_attempts: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    otp_attempts: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    is_blocked: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    },
  });

  return User;
};