module.exports = (sequelize, Sequelize) => {

  const User_Token = sequelize.define("user_login_token", {
    token: {
      type: Sequelize.STRING,
      allowNull: false
    },
    user_id: {
      type: Sequelize.INTEGER,
      allowNull: false
    },
    expiry_date: {
      type: Sequelize.STRING,
      allowNull: false
    }
  });

  return User_Token;

};