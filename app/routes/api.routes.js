module.exports = (app) => {
  const db = require("../models")
  const { authJwt, validation } = require("../middleware");
  const { Op } = require("sequelize");
  const UserLoginToken = db.user_login_token;


  // controller initialization
  const user = require("../controllers/user.controller");
  const auth = require("../controllers/auth.controller");
  const astrologer = require("../controllers/astrologer.controller");

  const shopping = require("../controllers/shopping.controller");
  const payment = require("../controllers/payment.controller");


  // router initialization 
  var auth_route = require("express").Router();
  var profile_route = require("express").Router();
  var astrologer_route = require("express").Router();
  var review_route = require("express").Router();
  var rating_router = require("express").Router();
  var horoscopeRouter = require("express").Router();

  var shoppingRouter = require("express").Router();
  var paymentRouter = require("express").Router();




  // auth routes 
  auth_route.post("/signin", [validation.UserLoginValidation], auth.sign_in);
  auth_route.post("/submit-otp", auth.submit_otp);

  // profile routes
  profile_route.post("/profile", [authJwt.verifyToken], user.create_or_update_profile);
  profile_route.get("/profile", [authJwt.verifyToken], user.get_profile);


  // Astrologer routes
  astrologer_route.post("/astrologer", astrologer.create_or_update_astrologer);
  astrologer_route.get("/astrologers", [authJwt.verifyToken], astrologer.get_all_astrologers);
  astrologer_route.get("/astrologer/:id", [authJwt.verifyToken], astrologer.get_astrologer_by_id);

  // Review routes
  review_route.post("/review", [authJwt.verifyToken], user.create_review);
  review_route.get("/review/:astro_id", [authJwt.verifyToken], user.get_reviews_for_astrologer);

  // Rating Routes
  rating_router.post("/rating", [authJwt.verifyToken], user.createRating);
  rating_router.get("/rating/:astro_id", [authJwt.verifyToken], user.getRatingsByAstrologer);

  // User Horoscope Routes
  horoscopeRouter.post("/horoscope", [authJwt.verifyToken], user.createHoroscope);
  horoscopeRouter.get("/horoscope", [authJwt.verifyToken], user.getHoroscopeByUserId);
  horoscopeRouter.post("/horoscope-list", [authJwt.verifyToken], user.createUserRelationHoroscope);
  horoscopeRouter.get("/horoscope-list", [authJwt.verifyToken], user.getUserRelationHoroscope);
  horoscopeRouter.post("/daily-horoscope", [authJwt.verifyToken], user.createOrUpdateDailyHoroscope);
  horoscopeRouter.get("/daily-horoscope", [authJwt.verifyToken], user.getDailyHoroscope);


  // Shopping routes 
  shoppingRouter.post("/product-category", shopping.createProductCategory);
  shoppingRouter.get("/product-category", [authJwt.verifyToken], shopping.getAllProductCategories);
  shoppingRouter.post("/product", shopping.createProduct);
  shoppingRouter.get("/product/:category_id", [authJwt.verifyToken], shopping.getProductsByCategory);
  shoppingRouter.post("/cart", [authJwt.verifyToken], shopping.addToCart);
  shoppingRouter.get("/cart", [authJwt.verifyToken], shopping.getCartItems);
  shoppingRouter.post("/address", [authJwt.verifyToken], shopping.addAddress);
  shoppingRouter.get("/address", [authJwt.verifyToken], shopping.getUserAddresses);
  shoppingRouter.post("/select-address/:address_id", [authJwt.verifyToken], shopping.selectUserAddress);


  // Payment Routes
  shoppingRouter.post("/order", [authJwt.verifyToken], payment.createOrder);
  paymentRouter.post("/payment/process", [authJwt.verifyToken], payment.processPayment);
  paymentRouter.post("/payment/confirm", [authJwt.verifyToken], payment.confirmPayment);


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

      UserLoginToken.findAll({ where: user_token_body }).then(
        (tokens) => {
          if (tokens[0]) {
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
  app.use("/api/", review_route);
  app.use("/api/", rating_router);
  app.use("/api/", horoscopeRouter);
  app.use("/api/", astrologer_route);
  app.use("/api/", paymentRouter);
  app.use("/admin/", astrologer_route);

  app.use("/api/", shoppingRouter);
  app.use("/admin/", shoppingRouter);
};
