const db = require("../models");
const commonUtil = require("../util/common");
const User = db.user;
const UserOtp = db.user_otps;
const { Op } = require("sequelize");

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
 *                          example: abc@gmail.com
 *                     phone:
 *                          type: string
 *                          example: "+1234567890"
 *     tags:
 *          - Authentication
 *     responses:
 *       200:
 *         description: OTP has been sent to the user's email/phone.
 *       403:
 *         description: User is blocked due to too many failed attempts.
 *       500:
 *         description: Internal Server Error
 */

// Controller to handle user sign-in
exports.sign_in = async (req, res) => {
  try {
    const { email, phone } = req.body;

    // Check if user exists by email or phone
    let user = await User.findOne({
      where: {
        [Op.or]: [{ email: email }, { phone: phone }]
      }
    });

    if (!user) {
      user = await User.create({
        email: email,
        phone: phone,
        failed_login_attempts: 0,
        otp_attempts: 0,
        is_blocked: false,
      });
    }

    if (user.is_blocked) {
      return res.status(403).send({ message: "User is blocked due to too many failed attempts." });
    }

    // Increment OTP attempts
    if (user.otp_attempts >= 5) {
      user.is_blocked = true;
      await user.save();
      return res.status(403).send({ message: "User is blocked due to too many OTP requests." });
    }

    // Generate OTP and store it
    const otp = commonUtil.generate_otp();
    const expiryDate = new Date();
    expiryDate.setMinutes(expiryDate.getMinutes() + 10); // OTP valid for 10 minutes

    // Save OTP to the database
    await UserOtp.create({
      user_id: user.id,
      otp: otp,
      expiry_date: expiryDate,
    });

    // Increment OTP attempts count
    user.otp_attempts += 1;
    await user.save();

    // Here, send the OTP to the user's email or phone number using an external service (like Twilio or SendGrid)
    var messageData = {
      email: user.email,
      subject: 'Login OTP',
      message: `<div style="padding: 20px; background-color: rgb(255, 255, 255);">
                    <div style="color: rgb(0, 0, 0); text-align: left;">
                      <h1 style="margin: 1rem 0">Verification code</h1>
                      <p style="padding-bottom: 16px">Please use the verification code below to sign in.</p>
                      <p style="padding-bottom: 16px"><strong style="font-size: 130%">${otp}</strong></p>
                      <p style="padding-bottom: 16px">If you didn't request this, you can ignore this email.</p>
                      <p style="padding-bottom: 16px">Thanks,<br>The Astro team</p>
                    </div>
                  </div>`,
    };
    await commonUtil.send_email(messageData);
    console.log(`OTP for user ${user.email || user.phone}: ${otp}`); // For testing purposes

    res.status(200).send({ message: "OTP has been sent to your email/phone." });
  } catch (error) {
    res.status(500).send({ message: "Error signing in.", error: error.message });
  }
};



/**
 * @swagger
 * /auth/submit-otp:
 *   post:
 *     description: Verify OTP for user authentication
 *     summary: Verify OTP
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 required: true
 *                 example: "admin@gmail.com"
 *               otp:
 *                 type: string
 *                 required: true
 *                 example: "123456"
 *     tags:
 *       - Authentication
 *     responses:
 *       200:
 *         description: OTP verified successfully.
 *       400:
 *         description: Invalid or expired OTP.
 *       403:
 *         description: User is blocked due to too many failed attempts.
 *       404:
 *         description: User not found.
 *       500:
 *         description: Internal Server Error
 */


// Controller to handle OTP verification
exports.submit_otp = async (req, res) => {
  try {
    const { username, otp } = req.body;

    let user = await User.findOne({
      where: {
        [Op.or]: [{ email: username }, { phone: username }]
      }
    });

    if (!user) {
      return res.status(404).send({ message: "User not found." });
    }

    if (user.is_blocked) {
      return res.status(403).send({ message: "User is blocked due to too many failed attempts." });
    }

    const user_id = user.id;

    // Find OTP record for the user
    const otpRecord = await UserOtp.findOne({
      where: {
        user_id: user_id,
        otp: otp,
        expiry_date: {
          [Op.gt]: new Date(),
        },
      },
    });

    if (!otpRecord) {
      user.failed_login_attempts += 1;

      if (user.failed_login_attempts >= 5) {
        user.is_blocked = true;
      }

      await user.save();
      return res.status(400).send({ message: "Invalid or expired OTP." });
    }

    // If OTP is valid, generate a JWT token
    const token = commonUtil.generateJwtToken(user_id);

    // Reset failed attempts and OTP attempts on successful login
    user.failed_login_attempts = 0;
    user.otp_attempts = 0;
    await user.save();
    // Save token to the database
    await commonUtil.saveTokenToDB(user_id, token);

    // Clean up the OTP record after successful verification
    await UserOtp.destroy({ where: { id: otpRecord.id } });

    res.status(200).send({ message: "OTP verified successfully.", accessToken: token });
  } catch (error) {
    res.status(500).send({ message: "Error verifying OTP.", error: error.message });
  }
};
