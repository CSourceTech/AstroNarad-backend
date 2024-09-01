const db = require("../models");
const { Op } = require("sequelize");
const Astrologer = db.astrologer;

/**
 * @swagger
 * /admin/astrologer:
 *   post:
 *     description: Create or Update Astrologer Details
 *     summary: Create or Update Astrologer Details
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
 *               profile_image:
 *                 type: string
 *                 example: "https://test.com/1.jpg"
 *               about:
 *                 type: string
 *                 example: "Experienced astrologer specializing in Vedic astrology."
 *               experience:
 *                 type: integer
 *                 example: 10
 *               rating:
 *                 type: float
 *                 example: 4.5
 *               language_known:
 *                 type: string
 *                 example: "English, Hindi"
 *               type:
 *                 type: string
 *                 example: "Vedic"
 *               total_time_spent_on_call:
 *                 type: integer
 *                 example: 300
 *               total_time_spent_on_message:
 *                 type: integer
 *                 example: 150
 *               expertise:
 *                 type: integer
 *                 example: "Marriage"
 *               charge:
 *                 type: integer
 *                 example: 30
 *     tags:
 *       - Astrologer
 *     responses:
 *       200:
 *         description: Astrologer details updated successfully.
 *       201:
 *         description: Astrologer details saved successfully.
 *       400:
 *         description: Bad request.
 *       500:
 *         description: Internal Server Error.
 */


// Controller to create or update astrologer details
exports.create_or_update_astrologer = async (req, res) => {
    try {
        const { name, profile_image, about, experience, rating, language_known, type, total_time_spent_on_call, total_time_spent_on_message, expertise, charge } = req.body;

        // Validate required fields
        if (!name || !experience) {
            return res.status(400).send({ message: "Name and experience are required fields." });
        }

        // Check if the astrologer already exists, update if exists, create new if not
        const astrologer = await Astrologer.findOne({ where: { name: name, experience: experience } });

        if (astrologer) {
            // Update existing astrologer details
            astrologer.profile_image = profile_image;
            astrologer.about = about;
            astrologer.experience = experience;
            astrologer.rating = rating;
            astrologer.language_known = language_known;
            astrologer.type = type;
            astrologer.total_time_spent_on_call = total_time_spent_on_call;
            astrologer.total_time_spent_on_message = total_time_spent_on_message;
            astrologer.expertise = expertise;
            astrologer.charge = charge;

            await astrologer.save();
            return res.status(200).send({ message: "Astrologer details updated successfully." });
        } else {
            // Create new astrologer entry
            await Astrologer.create({
                name,
                profile_image,
                about,
                experience,
                rating,
                language_known,
                type,
                total_time_spent_on_call,
                total_time_spent_on_message,
                expertise,
                charge
            });

            return res.status(201).send({ message: "Astrologer details saved successfully." });
        }
    } catch (error) {
        res.status(500).send({ message: "Error while saving astrologer details.", error: error.message });
    }
};


/**
 * @swagger
 * /admin/astrologers:
 *   get:
 *     description: Retrieve all astrologer details
 *     summary: Retrieve all astrologer details
 *     tags:
 *       - Astrologer
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved all astrologer details.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 1
 *                   name:
 *                     type: string
 *                     example: "John Doe"
 *                   profile_image:
 *                     type: string
 *                     example: "https://test.com/1.jpg"
 *                   about:
 *                     type: string
 *                     example: "Experienced astrologer specializing in Vedic astrology."
 *                   experience:
 *                     type: integer
 *                     example: 10
 *                   rating:
 *                     type: float
 *                     example: 4.5
 *                   language_known:
 *                     type: string
 *                     example: "English, Hindi"
 *                   type:
 *                     type: string
 *                     example: "Vedic"
 *                   total_time_spent_on_call:
 *                     type: integer
 *                     example: 300
 *                   total_time_spent_on_message:
 *                     type: integer
 *                     example: 150
 *                   expertise:
 *                     type: integer
 *                     example: "Marriage"
 *                   charge:
 *                     type: integer
 *                     example: 30
 *       500:
 *         description: Internal Server Error.
 */

// Controller to fetch all astrologer details
exports.get_all_astrologers = async (req, res) => {
    try {
        const astrologers = await Astrologer.findAll();
        return res.status(200).json(astrologers);
    } catch (error) {
        res.status(500).send({
            message: "Error while fetching astrologer details.",
            error: error.message,
        });
    }
};

/**
 * @swagger
 * /admin/astrologer/{id}:
 *   get:
 *     description: Retrieve astrologer details by ID
 *     summary: Retrieve astrologer details by ID
 *     tags:
 *       - Astrologer
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the astrologer
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Successfully retrieved astrologer details.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 1
 *                 name:
 *                   type: string
 *                   example: "John Doe"
 *                 profile_image:
 *                   type: string
 *                   example: "https://test.com/1.jpg"
 *                 about:
 *                   type: string
 *                   example: "Experienced astrologer specializing in Vedic astrology."
 *                 experience:
 *                   type: integer
 *                   example: 10
 *                 rating:
 *                   type: float
 *                   example: 4.5
 *                 language_known:
 *                   type: string
 *                   example: "English, Hindi"
 *                 type:
 *                   type: string
 *                   example: "Vedic"
 *                 total_time_spent_on_call:
 *                   type: integer
 *                   example: 300
 *                 total_time_spent_on_message:
 *                   type: integer
 *                   example: 150
 *                 expertise:
 *                   type: integer
 *                   example: "Marriage"
 *                 charge:
 *                   type: integer
 *                   example: 30
 *       404:
 *         description: Astrologer not found.
 *       500:
 *         description: Internal Server Error.
 */

// Controller to fetch a specific astrologer by ID
exports.get_astrologer_by_id = async (req, res) => {
    try {
        const id = req.params.id;
        const astrologer = await Astrologer.findByPk(id);

        if (!astrologer) {
            return res.status(404).send({ message: "Astrologer not found." });
        }

        return res.status(200).json(astrologer);
    } catch (error) {
        res.status(500).send({
            message: "Error while fetching astrologer detail.",
            error: error.message,
        });
    }
};
