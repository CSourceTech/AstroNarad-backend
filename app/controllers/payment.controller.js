// controllers/payment.controller.js

const db = require("../models");
const Order = db.order;
const Transaction = db.transaction;
const Cart = db.cart;
const axios = require('axios'); // For Razorpay API calls
const razorpay = require('razorpay');



/**
 * @swagger
 * /api/order:
 *   post:
 *     description: Create a new order
 *     summary: Create Order
 *     tags:
 *       - Payment
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
 *               amount:
 *                 type: number
 *                 format: float
 *                 example: 500.00
 *     responses:
 *       201:
 *         description: Order created successfully.
 *       400:
 *         description: Amount is required.
 *       404:
 *         description: No cart found.
 *       500:
 *         description: Internal Server Error.
 */

// Create an order
exports.createOrder = async (req, res) => {
    try {
        const user_id = req.user_id;
        const { amount } = req.body;

        if (!amount) {
            return res.status(400).send({ message: "Amount is required." });

        }

        const cartInfo = Cart.findOne({
            where: { user_id: user_id },
            order: [['cart_id', 'DESC']]
        });

        if (!cartInfo) {
            return res.status(404).send({ message: "No cart found." });
        }

        // Create a new order
        const newOrder = await Order.create({ user_id, transaction_id: null, cart_id: cartInfo.cart_id, amount });

        // Create a new transaction
        const newTransaction = await Transaction.create({
            user_id,
            order_id: newOrder.order_id,
            amount,
            payment_method: null,
            status: 'Pending',
            timestamp: new Date(),
            gateway_response: null
        });

        // Return order and transaction details
        res.status(201).send({ order: newOrder, transaction: newTransaction });
    } catch (error) {
        res.status(500).send({ message: error.message || "An error occurred while creating the order." });
    }
};


/**
 * @swagger
 * /api/payment/process:
 *   post:
 *     description: Process payment using Razorpay
 *     summary: Process Payment
 *     tags:
 *       - Payment
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
 *               order_id:
 *                 type: integer
 *                 example: 1
 *               payment_method:
 *                 type: string
 *                 example: "UPI"
 *     responses:
 *       200:
 *         description: Payment processed successfully.
 *       400:
 *         description: Validation error.
 *       500:
 *         description: Internal Server Error.
 */

// Handle payment with Razorpay
exports.processPayment = async (req, res) => {
    try {
        const { order_id, payment_method } = req.body;

        // Fetch the order
        const order = await Order.findByPk(order_id);

        if (!order) {
            return res.status(404).send({ message: "Order not found." });
        }

        const transaction = Transaction.findOne({ where: { order_id: order.order_id } });

        if (!transaction) {
            return res.status(400).send({ message: "Wrong order id." });
        }

        transaction.payment_method = payment_method;
        transaction.save();

        // Initialize Razorpay instance
        const instance = new razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET
        });

        // Create payment order
        const razorpayOrder = await instance.orders.create({
            amount: order.amount * 100, // amount in paise
            currency: "INR",
            receipt: `order_${order_id}`,
        });

        if (!razorpayOrder) {
            return res.status(400).send({ message: "Something went wrong while making order with payment gateway." });
        }

        // Update order with transaction_id
        await Order.update({ transaction_id: razorpayOrder.id }, { where: { order_id } });

        // Return payment details
        res.status(200).send({
            gateway_order_id: razorpayOrder.id,
            currency: razorpayOrder.currency,
            amount: razorpayOrder.amount,
            gateway_key_id: process.env.RAZORPAY_KEY_ID,
            order
        });
    } catch (error) {
        res.status(500).send({ message: error.message || "An error occurred while processing the payment." });
    }
};


/**
 * @swagger
 * /api/payment/confirm:
 *   post:
 *     description: Confirm payment after successful transaction
 *     summary: Confirm Payment
 *     tags:
 *       - Payment
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
 *               order_id:
 *                 type: integer
 *                 example: 1
 *               payment_id:
 *                 type: string
 *                 example: "rzp_test_123456"
 *               signature:
 *                 type: string
 *                 example: "a1b2c3d4e5f6g7h8i9j0"
 *     responses:
 *       200:
 *         description: Payment confirmed successfully.
 *       400:
 *         description: Invalid signature.
 *       500:
 *         description: Internal Server Error.
 */

// Handle payment confirmation
exports.confirmPayment = async (req, res) => {
    try {
        const { order_id, payment_id, signature } = req.body;

        // Verify payment signature
        const crypto = require('crypto');
        const generatedSignature = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(`${order_id}|${payment_id}`)
            .digest('hex');

        if (generatedSignature !== signature) {
            return res.status(400).send({ message: "Invalid signature." });
        }

        // Update transaction and order status
        await Transaction.update({ status: 'Success', gateway_response: { payment_id, signature } }, { where: { order_id } });
        await Order.update({ transaction_id: payment_id }, { where: { order_id } });

        res.status(200).send({ message: "Payment successful." });
    } catch (error) {
        res.status(500).send({ message: error.message || "An error occurred while confirming the payment." });
    }
};
