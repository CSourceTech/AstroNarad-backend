const db = require("../models");
const UserProfile = db.user_profile;
const User = db.user;
const AstrologersReview = db.astrologers_review;
const AstrologersRating = db.astrologers_rating;
const UserHoroscope = db.user_horoscope;
const UserHoroscopeRelation = db.user_horoscope_relation;
const DailyHoroscope = db.daily_horoscope;


/**
 * @swagger
 * /api/profile:
 *   post:
 *     description: Create or Update User Profile
 *     summary: Create or Update User Profile
 *     parameters:
 *       - in: header
 *         name: accesstoken
 *         schema:
 *           type: string
 *           required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "John Doe"
 *               date_of_birth:
 *                 type: string
 *                 format: date
 *                 example: "1990-01-01"
 *               profile_image:
 *                 type: string
 *                 example: "http://example.com/profile.jpg"
 *               gender:
 *                 type: string
 *                 example: "Male"
 *               place_of_birth:
 *                 type: string
 *                 example: "New York"
 *               time_of_birth:
 *                 type: string
 *                 format: time
 *                 example: "15:30:00"
 *     tags:
 *       - User Profile
 *     responses:
 *       200:
 *         description: Profile saved successfully.
 *       400:
 *         description: Invalid input data.
 *       401:
 *         description: Unauthorized access.
 *       500:
 *         description: Internal Server Error
 */

// Controller to create or update user profile
exports.create_or_update_profile = async (req, res) => {
  try {
    const user_id = req.user_id;
    const { name, date_of_birth, profile_image, gender, place_of_birth, time_of_birth } = req.body;

    // Find or create user profile
    let userProfile = await UserProfile.findOne({ where: { user_id: user_id } });

    if (userProfile) {
      // Update existing profile
      userProfile = await userProfile.update({
        name,
        date_of_birth,
        profile_image,
        gender,
        place_of_birth,
        time_of_birth
      });
    } else {
      // Create new profile
      userProfile = await UserProfile.create({
        user_id,
        name,
        date_of_birth,
        profile_image,
        gender,
        place_of_birth,
        time_of_birth
      });
    }

    res.status(200).send({ message: "Profile saved successfully.", data: userProfile });
  } catch (error) {
    res.status(500).send({ message: "Error saving profile.", error: error.message });
  }
};


/**
 * @swagger
 * /api/profile:
 *   get:
 *     description: Get User Profile
 *     summary: Get User Profile
 *     tags:
 *       - User Profile
 *     parameters:
 *       - in: header
 *         name: accesstoken
 *         schema:
 *           type: string
 *           required: true
 *     responses:
 *       200:
 *         description: Profile retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 profile:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     user_id:
 *                       type: integer
 *                     name:
 *                       type: string
 *                     date_of_birth:
 *                       type: string
 *                       format: date
 *                     profile_image:
 *                       type: string
 *                     gender:
 *                       type: string
 *                     place_of_birth:
 *                       type: string
 *                     time_of_birth:
 *                       type: string
 *                       format: time
 *                 user:
 *                   type: object
 *                   properties:
 *                     email:
 *                       type: string
 *                     phone:
 *                       type: string
 *       401:
 *         description: Unauthorized access.
 *       404:
 *         description: Profile or user not found.
 *       500:
 *         description: Internal Server Error
 */

// Controller to get user profile
exports.get_profile = async (req, res) => {
  try {
    // Extract user ID from bearer token (already set in req.user_id by middleware)
    const userId = req.user_id;

    // Fetch user profile based on user ID
    const userProfile = await UserProfile.findOne({
      where: { user_id: userId },
    });

    if (!userProfile) {
      return res.status(404).send({ message: "User profile not found." });
    }

    // Fetch user details based on user ID
    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).send({ message: "User not found." });
    }

    const { user_id, ...userData } = userProfile.dataValues;

    res.status(200).send({
      ...userData,
      email: user.email,
      phone: user.phone,

    });
  } catch (error) {
    res.status(500).send({ message: "Error fetching profile.", error: error.message });
  }
};


/**
 * @swagger
 * /api/review:
 *   post:
 *     description: Create a review for an astrologer
 *     summary: Create a review
 *     tags:
 *       - Review
 *     parameters:
 *       - in: header
 *         name: accesstoken
 *         schema:
 *           type: string
 *           required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               astro_id:
 *                 type: integer
 *                 example: 1
 *               message:
 *                 type: string
 *                 example: "Great experience!"
 *     responses:
 *       201:
 *         description: Review created successfully.
 *       400:
 *         description: Validation error.
 *       500:
 *         description: Internal Server Error.
 */

// Controller to create a review
exports.create_review = async (req, res) => {
  try {
    const { astro_id, message } = req.body;
    const user_id = req.user_id;

    // Validate input
    if (!astro_id || !message) {
      return res.status(400).send({ message: "Astrologer ID and message are required." });
    }

    // Create a new review
    const review = await AstrologersReview.create({
      user_id,
      astro_id,
      message,
    });

    res.status(201).send({ message: "Review created successfully.", review });
  } catch (error) {
    res.status(500).send({ message: "Error creating review.", error: error.message });
  }
};


/**
 * @swagger
 * /api/review/{astro_id}:
 *   get:
 *     description: Get all reviews for an astrologer
 *     summary: Get astrologer reviews
 *     tags:
 *       - Review
 *     parameters:
 *       - in: header
 *         name: accesstoken
 *         schema:
 *           type: string
 *         required: true
 *         description: Access token for user authentication
 *       - in: path
 *         name: astro_id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Astrologer ID
 *     responses:
 *       200:
 *         description: Reviews fetched successfully.
 *       404:
 *         description: No reviews found.
 *       500:
 *         description: Internal Server Error.
 */

// Controller to get all reviews for an astrologer
exports.get_reviews_for_astrologer = async (req, res) => {
  try {
    const astro_id = req.params.astro_id;

    if (!astro_id) {
      return res.status(400).send({ message: "Astrologer ID is required." });
    }

    // Fetch all reviews for the astrologer
    const reviews = await AstrologersReview.findAll({
      where: { astro_id },
    });

    res.status(200).send({ reviews });
  } catch (error) {
    res.status(500).send({ message: "Error fetching reviews.", error: error.message });
  }
};


/**
 * @swagger
 * /api/rating:
 *   post:
 *     description: Submit a rating for an astrologer
 *     summary: Submit a rating
 *     tags:
 *       - Rating
 *     parameters:
 *       - in: header
 *         name: accesstoken
 *         schema:
 *           type: string
 *         required: true
 *         description: Access token for user authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               astro_id:
 *                 type: integer
 *                 example: 1
 *               rating:
 *                 type: number
 *                 format: float
 *                 minimum: 1
 *                 maximum: 5
 *                 example: 4.5
 *     responses:
 *       201:
 *         description: Rating submitted successfully.
 *       400:
 *         description: Validation error.
 *       500:
 *         description: Internal Server Error.
 */

// Create and save a new rating
exports.createRating = async (req, res) => {
  try {
    const { astro_id, rating } = req.body;
    const user_id = req.user_id;

    // Validate input
    if (!astro_id || !rating) {
      return res.status(400).send({ message: "Astrologer ID and rating are required." });
    }

    // Create a rating
    const newRating = await AstrologersRating.create({
      astro_id,
      user_id,
      rating,
    });

    res.status(201).send(newRating);
  } catch (error) {
    res.status(500).send({ message: error.message || "An error occurred while creating the rating." });
  }
};


/**
 * @swagger
 * /api/rating/{astro_id}:
 *   get:
 *     description: Get all ratings for an astrologer
 *     summary: Get astrologer ratings
 *     tags:
 *       - Rating
 *     parameters:
 *       - in: header
 *         name: accesstoken
 *         schema:
 *           type: string
 *         required: true
 *         description: Access token for user authentication
 *       - in: path
 *         name: astro_id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Astrologer ID
 *     responses:
 *       200:
 *         description: Ratings fetched successfully.
 *       404:
 *         description: No ratings found.
 *       500:
 *         description: Internal Server Error.
 */

// Retrieve all ratings for an astrologer
exports.getRatingsByAstrologer = async (req, res) => {
  try {
    const astro_id = req.params.astro_id;

    const ratings = await AstrologersRating.findAll({
      where: { astro_id },
    });

    if (ratings.length === 0) {
      return res.status(404).send({ message: "No ratings found for this astrologer." });
    }

    res.status(200).send(ratings);
  } catch (error) {
    res.status(500).send({ message: error.message || "An error occurred while retrieving ratings." });
  }
};


/**
 * @swagger
 * /api/horoscope:
 *   post:
 *     description: Store horoscope data for a user
 *     summary: Store user horoscope
 *     tags:
 *       - Horoscope
 *     parameters:
 *       - in: header
 *         name: accesstoken
 *         schema:
 *           type: string
 *         required: true
 *         description: Access token for user authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "John Doe"
 *               sun_sign:
 *                 type: string
 *                 example: "Aries"
 *               moon_sign:
 *                 type: string
 *                 example: "Leo"
 *               element:
 *                 type: string
 *                 example: "Fire"
 *               rising_sign:
 *                 type: string
 *                 example: "Sagittarius"
 *               modality:
 *                 type: string
 *                 example: "Cardinal"
 *               married_status:
 *                 type: string
 *                 example: "Single"
 *               zodiac_sign:
 *                 type: string
 *                 example: "Scorpio"
 *     responses:
 *       201:
 *         description: Horoscope data stored successfully.
 *       400:
 *         description: Validation error.
 *       500:
 *         description: Internal Server Error.
 */

// Create and save a new horoscope entry
exports.createHoroscope = async (req, res) => {
  try {
    const { name, sun_sign, moon_sign, element, rising_sign, modality, married_status, zodiac_sign } = req.body;
    const user_id = req.user_id; // Assume `user_id` is extracted from the access token middleware

    // Validate input
    if (!name || !sun_sign || !moon_sign || !element || !rising_sign || !modality || !married_status || !zodiac_sign) {
      return res.status(400).send({ message: "All fields are required." });
    }

    // Create a new horoscope entry
    const newHoroscope = await UserHoroscope.create({
      user_id,
      name,
      sun_sign,
      moon_sign,
      element,
      rising_sign,
      modality,
      married_status,
      zodiac_sign,
    });

    res.status(201).send(newHoroscope);
  } catch (error) {
    res.status(500).send({ message: error.message || "An error occurred while creating the horoscope." });
  }
};


/**
 * @swagger
 * /api/horoscope:
 *   get:
 *     description: Get horoscope data for a user
 *     summary: Get user horoscope
 *     tags:
 *       - Horoscope
 *     parameters:
 *       - in: header
 *         name: accesstoken
 *         schema:
 *           type: string
 *         required: true
 *         description: Access token for user authentication
 *     responses:
 *       200:
 *         description: Horoscope data retrieved successfully.
 *       404:
 *         description: No horoscope data found for this user.
 *       500:
 *         description: Internal Server Error.
 */

// Retrieve a user's horoscope by user_id
exports.getHoroscopeByUserId = async (req, res) => {
  try {
    const user_id = req.user_id;
    const horoscope = await UserHoroscope.findOne({
      where: { user_id },
    });

    if (!horoscope) {
      return res.status(404).send({ message: "No horoscope found for this user." });
    }

    res.status(200).send(horoscope);
  } catch (error) {
    res.status(500).send({ message: error.message || "An error occurred while retrieving the horoscope." });
  }
};


/**
 * @swagger
 * /api/horoscope-list:
 *   post:
 *     description: Create or update a family member's horoscope for a user
 *     summary: Create or Update Family Horoscope
 *     tags:
 *       - Horoscope List
 *     parameters:
 *       - in: header
 *         name: accesstoken
 *         schema:
 *           type: string
 *         required: true
 *         description: Access token for user authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               horoscope_id:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       201:
 *         description: Horoscope created successfully.
 *       400:
 *         description: Validation error.
 *       401:
 *         description: This User already exist in your profile..
 *       500:
 *         description: Internal Server Error.
 */

// Update or Create User-Horoscope Relation
exports.createUserRelationHoroscope = async (req, res) => {
  try {
    const { horoscope_id } = req.body;
    const user_id = req.user_id;


    if (!user_id || !horoscope_id) {
      return res.status(400).send({ message: "Horoscope ID is required." });
    }

    // Check if the relationship already exists
    const existingRelation = await UserHoroscopeRelation.findOne({
      where: { user_id }
    });

    if (existingRelation) {
      // already existing relation
      return res.status(401).send({ message: "This User already exist in your profile." });
    } else {
      // Create a new relation
      const newRelation = await UserHoroscopeRelation.create({ user_id, horoscope_id });
      return res.status(201).send({ message: "Horoscope relation created successfully.", data: newRelation });
    }
  } catch (error) {
    res.status(500).send({ message: error.message || "Some error occurred while updating the relation." });
  }
};


/**
 * @swagger
 * /api/horoscope-list:
 *   get:
 *     description: Fetch all family horoscopes for a user
 *     summary: Get Family Horoscopes
 *     tags:
 *       - Horoscope List
 *     parameters:
 *       - in: header
 *         name: accesstoken
 *         schema:
 *           type: string
 *         required: true
 *         description: Access token for user authentication
 *     responses:
 *       200:
 *         description: Horoscopes fetched successfully.
 *       400:
 *         description: User ID is required.
 *       404:
 *         description: No horoscopes found for this user.
 *       500:
 *         description: Internal Server Error.
 */

// Fetch User-Horoscope Relation
exports.getUserRelationHoroscope = async (req, res) => {
  try {
    const user_id = req.user_id;

    if (!user_id) {
      return res.status(400).send({ message: "User ID is required." });
    }

    const relation = await UserHoroscopeRelation.findAll({
      where: { user_id }
    });

    if (relation.length === 0) {
      return res.status(404).send({ message: "No horoscopes found for this user." });
    }

    res.status(200).send(relation);
  } catch (error) {
    res.status(500).send({ message: error.message || "Some error occurred while fetching the relation." });
  }
};


/**
 * @swagger
 * /api/daily-horoscope:
 *   post:
 *     description: Create or update the daily horoscope for a zodiac sign
 *     summary: Create or Update Daily Horoscope
 *     tags:
 *       - Daily Horoscope
 *     parameters:
 *       - in: header
 *         name: accesstoken
 *         schema:
 *           type: string
 *         required: true
 *         description: Access token for user authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               zodiac_sign:
 *                 type: string
 *                 example: Aries
 *               date:
 *                 type: string
 *                 format: date
 *                 example: 2024-09-03
 *               horoscope:
 *                 type: string
 *                 example: "Today is a great day for new beginnings."
 *     responses:
 *       200:
 *         description: Horoscope updated successfully.
 *       201:
 *         description: Horoscope created successfully.
 *       400:
 *         description: Validation error.
 *       500:
 *         description: Internal Server Error.
 */

// Create or update daily horoscope for a zodiac sign
exports.createOrUpdateDailyHoroscope = async (req, res) => {
  try {
    const { zodiac_sign, date, horoscope } = req.body;

    if (!zodiac_sign || !date || !horoscope) {
      return res.status(400).send({ message: "Zodiac sign, date, and horoscope are required." });
    }

    // Check if the record already exists
    const existingRecord = await DailyHoroscope.findOne({
      where: { zodiac_sign, date },
    });

    if (existingRecord) {
      // If it exists, update the record
      existingRecord.horoscope = horoscope;
      await existingRecord.save();
      return res.status(200).send({ message: "Horoscope updated successfully." });
    } else {
      // If it does not exist, create a new record
      const newRecord = await DailyHoroscope.create({
        zodiac_sign,
        date,
        horoscope,
      });
      return res.status(201).send(newRecord);
    }
  } catch (error) {
    res.status(500).send({ message: error.message || "An error occurred while processing the request." });
  }
};


/**
 * @swagger
 * /api/daily-horoscope:
 *   get:
 *     description: Fetch daily horoscope for a specific zodiac sign and date
 *     summary: Get Daily Horoscope
 *     tags:
 *       - Daily Horoscope
 *     parameters:
 *       - in: header
 *         name: accesstoken
 *         schema:
 *           type: string
 *         required: true
 *         description: Access token for user authentication
 *       - in: query
 *         name: zodiac_sign
 *         schema:
 *           type: string
 *         required: true
 *         description: Zodiac sign
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *         required: true
 *         description: Date of the horoscope
 *     responses:
 *       200:
 *         description: Horoscope fetched successfully.
 *       400:
 *         description: Validation error.
 *       404:
 *         description: No horoscope found for this zodiac sign and date.
 *       500:
 *         description: Internal Server Error.
 */

// Fetch daily horoscope for a specific zodiac sign and date
exports.getDailyHoroscope = async (req, res) => {
  try {
    const { zodiac_sign, date } = req.query;

    if (!zodiac_sign || !date) {
      return res.status(400).send({ message: "Zodiac sign and date are required." });
    }

    const horoscope = await DailyHoroscope.findOne({
      where: { zodiac_sign, date },
    });

    if (!horoscope) {
      return res.status(404).send({ message: "No horoscope found for this zodiac sign and date." });
    }

    res.status(200).send(horoscope);
  } catch (error) {
    res.status(500).send({ message: error.message || "An error occurred while retrieving the horoscope." });
  }
};