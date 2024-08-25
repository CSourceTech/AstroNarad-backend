const db = require("../models");
var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");
const config = require("../config/auth.config");
const User = db.user;
const User_Token = db.user_login_token;

/**
 * @swagger
 * /auth/signin:
 *   post:
 *     description: User SignIn
 *     summary: User SignIn
 *     requestBody:
 *        required: true
 *        content:
 *           application/json:
 *             schema:
 *                type: object
 *                properties:
 *                     email:
 *                          type: string
 *                          required: true
 *                          example: abc@gmail.com
 *                     password:
 *                          type: password
 *                          required: true
 *                          example: Test@1234
 *     tags:
 *          - Astrology Application
 *     responses:
 *       200:
 *         description: Success
 *       400:
 *         description: Invalid Password
 *       402:
 *         description: Error occur while generating token
 *       403:
 *         description: Some error occurred while inserting the token
 *       404:
 *         description: User Not found
 *       500:
 *         description: Internal Server Error
 *
 */

exports.sign_in = (req, res) => {
  User.findOne({
    where: {
      email: req?.body?.email,
    },
  })
    .then((user) => {
      if (!user) {
        return res.status(404).send({ message: "User Not found" });
      }
      var passwordIsValid = bcrypt.compareSync(
        req?.body?.password,
        user.password
      );
      if (!passwordIsValid) {
        return res.status(400).send({ message: "Invalid Password" });
      }
      var token = jwt.sign({ id: user.id }, config.secret);
      if (!token) {
        res
          .status(400)
          .send({ message: "Error occur while generating token" });
        return;
      }
      var minutesToAdd = 525600; //add 1 year expiry
      var currentDate = new Date();
      var Expiry_Date = new Date(currentDate.getTime() + minutesToAdd * 60000);
      const token_user = {
        token: token,
        expiry_date: Expiry_Date.toISOString()
          .replace(/T/, " ")
          .replace(/\..+/, ""),
        user_id: user.id,
      };
      User_Token.create(token_user)
        .then((data) => {
          res.status(200).send({
            token: token,
            message: 'Success'
          });
        })
        .catch((err) => {
          res.status(403).send({
            message:
              err.message || "Some error occurred while inserting the token",
          });
        });
    })
    .catch((err) => {
      res.status(500).send({ message: err.message });
    });
};
