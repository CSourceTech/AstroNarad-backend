const db = require("../models");
const commonUtil = require("../util/common");
const Message = db.message;
const { Op } = require("sequelize");

/**
 * @swagger
 * /api/chat/send:
 *   post:
 *     summary: Send a message
 *     description: Sends a message between a user and an astrologer
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
 *               message_type:
 *                 type: string
 *                 description: Type of messsage
 *                 enum: [edit, new]
 *                 example: "new"
 *               edit_message_id:
 *                 type: integer
 *                 description: Message ID to edit
 *                 example: 2
 *               reciever_id:
 *                 type: integer
 *                 description: ID of the user receiving the message
 *                 example: 2
 *               message:
 *                 type: string
 *                 description: Message content
 *                 example: "Hello, how can I help you?"
 *               from_user_type:
 *                 type: string
 *                 enum: [user, astro]
 *                 description: Indicates whether the message is from the user or the astrologer
 *                 example: "user"
 *     tags:
 *       - Chat
 *     responses:
 *       201:
 *         description: Message sent successfully
 *       500:
 *         description: Error while sending message
 */

// Send message between user and astrologer
exports.sendMessage = async (req, res) => {
    try {
        const user_id = req.user_id;
        const { message_type, reciever_id, message, from_user_type } = req.body;

        const sender_id = user_id;

        var messageData = {};
        if (message_type === "new") {
            messageData = await Message.create({
                sender_id,
                reciever_id,
                message,
                from_user_type,
                created_at: new Date(),
                updated_at: new Date(),
                is_edited: false
            });
        } else {
            const { edit_message_id } = req.body;
            messageData = await Message.findOne({ where: { message_id: edit_message_id } });

            messageData.message = message;
            messageData.is_edited = true;
            messageData.updated_at = new Date();

            messageData.save();
        }

        // Define room ID based on the participants
        const roomId = `chat_${sender_id}_${reciever_id}`;
        // Emit the message only to the recipient’s room using Socket.IO
        const socketData = {
            message: message,
            is_edited: message_type !== "new"
        };

        await global.io.to(roomId).emit('receiveMessage', socketData);

        res.status(201).send({ message: "Message sent successfully.", data: messageData });
    } catch (error) {
        res.status(500).send({ message: error.message || "An error occurred while sending the message." });
    }
};



/**
 * @swagger
 * /api/chat/thread/{reciever_id}:
 *   get:
 *     summary: Get message thread
 *     description: Fetch message thread between a user and astrologer with pagination support
 *     parameters:
 *       - in: header
 *         name: accesstoken
 *         schema:
 *           type: string
 *         required: true
 *         description: Access token for user authentication
 *       - in: path
 *         name: reciever_id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID of the reciever
 *         example: 2
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number for pagination (default is 1)
 *         example: 1
 *     tags:
 *       - Chat
 *     responses:
 *       200:
 *         description: Message thread fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalMessages:
 *                   type: integer
 *                   example: 100
 *                 totalPages:
 *                   type: integer
 *                   example: 5
 *                 currentPage:
 *                   type: integer
 *                   example: 1
 *                 messages:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       message_id:
 *                         type: integer
 *                         example: 101
 *                       sender_id:
 *                         type: integer
 *                         example: 1
 *                       reciever_id:
 *                         type: integer
 *                         example: 2
 *                       message:
 *                         type: string
 *                         example: "Hello, how can I help you?"
 *                       from_user_type:
 *                         type: string
 *                         example: "user"
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                         example: "2024-10-04T12:34:56.000Z"
 *                       is_edited:
 *                         type: boolean
 *                         example: false
 *       500:
 *         description: Error while fetching message thread
 */

// Fetch message thread between user and astrologer with pagination
exports.getMessageThread = async (req, res) => {
    try {
        const user_id = req.user_id;
        const sender_id = user_id;
        const { reciever_id } = req.params;
        const { page = 1 } = req.query; // Pagination variables (default to page 1, 20 messages per page)

        const limit = 15;
        const offset = (page - 1) * limit; // Messages limit is set to 20

        const messages = await Message.findAndCountAll({
            where: { sender_id, reciever_id },
            order: [['createdAt', 'DESC']],  // Get the latest messages first
            limit: parseInt(limit),
            offset: parseInt(offset),
        });

        res.status(200).send({
            totalMessages: messages.count,
            totalPages: Math.ceil(messages.count / limit),
            currentPage: page,
            messages: messages.rows
        });
    } catch (error) {
        res.status(500).send({ message: error.message || "An error occurred while fetching the message thread." });
    }
};