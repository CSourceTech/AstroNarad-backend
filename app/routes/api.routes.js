module.exports = (app) => {
  const db = require("../models")
  const { authJwt, validation } = require("../middleware");
  const User = db.user;

  // controller initialization
  const user = require("../controllers/user.controller");
  const auth = require("../controllers/auth.controller");

  // router initialization 
  var user_route = require("express").Router();
  var auth_route = require("express").Router();

  // user routes 
  user_route.post("/user", [validation.UserCreateValidation], user.create_user);

  // auth routes 
  auth_route.post("/signin", [validation.UserLoginValidation], auth.sign_in);

  // user_task_details_api_router.get(
  //   "/user/task/task-detail/:taskId",
  //   [authJwt.verifyToken],
  //   user.getTaskDetails
  // );


  var checkAPI = async function (req, res, next) {
    if (req.token) {
      var basic_token = req.token;

    } else {
      res.status(401).send("Authorize Parameter not Provided");
    }
  };

  // return api data 
  app.use("/api/*", checkAPI);
  app.use("/", user_route);
  app.use("/auth/", auth_route);
};
