const db = require("../models");
const { validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const { Op } = require("sequelize");

const User = db.user;


/**
* @swagger
* /user:
*   post:
*     description: Create User
*     summary: Create User
*     tags:
*      - Astrology Application
*     requestBody:
*        required: true
*        content:
*           application/json:
*             schema:
*                type: object
*                properties:
*                     first_name:
*                          type: string
*                          required: false
*                          example: Test
*                     last_name:
*                          type: string
*                          required: false
*                          example: Test
*                     email:
*                          type: string
*                          required: true
*                          example: abc@gmail.com
*                     password:
*                          type: string
*                          required: true
*                          example: Test@1234
*     responses:
*       200:
*         description: User Successfully Created
*       400:
*         description: Validation error
*       401:
*         description: User Already Exist
*       500:
*         description: Internal Server Error
* 
*/

exports.create_user = async (req, res) => {

  User.findOne({
    where: {
      email: req?.body?.email,
    },
  })
    .then(async (user) => {
      if (!user) {
        const body = {
          first_name: req?.body?.first_name,
          last_name: req?.body?.last_name,
          email: req?.body?.email,
          password: await bcrypt.hash(req?.body?.password, 10)
        }

        User.create(body).then(() => {
          res.status(200).send({
            message: "User Successfully Created"
          });
        }).catch((err) => {
          res.status(400).send({
            message: err.message || "Bad Request"
          });
        })
      } else {
        res.status(401).send({
          message: "User Already Exist"
        });
      }
    })
}