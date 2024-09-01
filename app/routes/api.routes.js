module.exports = (app) => {
  const db = require("../models")
  const { authJwt, validation } = require("../middleware");
  const User = db.user;

  // controller initialization
  const user = require("../controllers/user.controller");
  const auth = require("../controllers/auth.controller");

  // router initialization 
  var auth_route = require("express").Router();
  var profile_route = require("express").Router();

  // auth routes 
  auth_route.post("/signin", [validation.UserLoginValidation], auth.sign_in);
  auth_route.post("/submit-otp", auth.submit_otp);

  // profile routes
  profile_route.post("/profile", [authJwt.verifyToken], user.create_or_update_profile);
  profile_route.get("/profile", [authJwt.verifyToken], user.get_profile);


  var checkAPI = async function (req, res, next) {
    const access_token = req?.headers?.accesstoken;
    if (access_token) {
      var currentDate = new Date();
      var user_token_body = {
        token: access_token,
        expiry_date: {
          [Op.gt]: currentDate
            .toISOString()
            .replace(/T/, " ")
            .replace(/\..+/, ""),
        },
      };

      User_Token.findAll({ where: user_token_body }).then(
        (tokens) => {
          if (data[0]) {
            req.user_id = tokens[0]?.user_id;
            next();
          } else {
            res.status(401).send("Authorize Parameter Invalid");
          }
        })
    } else {
      res.status(401).send("Authorize Parameter not Provided");
    }
  };

  // return api data 
  app.use("/api/*", checkAPI);

  app.use("/auth/", auth_route);
  app.use("/api/", profile_route);
};
