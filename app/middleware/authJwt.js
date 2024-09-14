const db = require("../models");
const User_Token = db.user_login_token;
const Op = db.Sequelize.Op;

verifyToken = (req, res, next) => {
  const token = req?.headers?.accesstoken;
  if (!token) {
    return res.status(401).send({
      message: "No token provided!"
    });
  }
  var currentDate = new Date();
  var condition_unauthorised_token = { token: token, expiry_date: { [Op.gt]: currentDate.toISOString().replace(/T/, ' ').replace(/\..+/, '') } };
  User_Token.findAll({ where: condition_unauthorised_token })
    .then(data => {
      if (data[0]?.id != "") {
        res.locals.user_id = data[0].user_id;
        next();
      }
    })
    .catch(err => {
      User_Token.destroy({
        where: { token: token }
      }).then(num => {
        if (num == 1) {
          res.status(401).send({
            message: "Token Expired!"
          });
        } else {
          res.status(401).send({
            message: "Unauthorised User!"
          });
        }
      })
        .catch(err => {
          res.status(500).send({
            message: err
          });
        });
    });
};
const authJwt = {
  verifyToken: verifyToken
};
module.exports = authJwt;
