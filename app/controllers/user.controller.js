const db = require("../models");
const { validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const { Op } = require("sequelize");
const UserProfile = db.user_profile;
const User = db.user;



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