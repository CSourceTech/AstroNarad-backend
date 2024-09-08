const nodemailer = require("nodemailer");
const dotenv = require('dotenv');
dotenv.config();
const db = require("../models");
const CartData = db.cart_data;
const Product = db.product;
const UserLoginToken = db.user_login_token;
const jwt = require("jsonwebtoken");
const { sequelize } = require("../models");
const crypto = require('crypto');


async function send_email(email_data) {
    const smtp_host = process.env.SMTP_HOST;
    const smtp_port = process.env.SMTP_PORT;
    const smtp_user = process.env.SMTP_USER;
    const smtp_pass = process.env.SMTP_PASSWORD;

    const to = email_data?.email;
    const subject = email_data?.subject;
    const message = email_data?.message;

    const transporter = nodemailer.createTransport({
        host: smtp_host,
        port: smtp_port,
        auth: {
            user: smtp_user,
            pass: smtp_pass
        }
    });

    const mail = await transporter.sendMail({
        from: smtp_user,
        to: to,
        subject: subject,
        html: message
    });

    return mail;
}

async function send_otp(otp_data) {

}

// Utility function to generate a random OTP
const generate_otp = () => {
    return Math.floor(100000 + Math.random() * 900000).toString(); // Generates a 6-digit OTP
};


// Save token to the database
const saveTokenToDB = async (user_id, token) => {
    const expiryDate = new Date();
    expiryDate.setSeconds(expiryDate.getSeconds() + 86400); // 24 hours expiration

    await UserLoginToken.create({
        user_id: user_id,
        token: token,
        expiry_date: expiryDate,
        is_revoked: false,
    });
};

// Generate a JWT token
const generateJwtToken = (user_id) => {
    return jwt.sign({ id: user_id }, process.env.JWT_SECRET, {
        expiresIn: 86400, // 24 hours
    });
};


// get total cart price using cart_id 
async function getTotalCartPrice(cartId) {
    const query = `
        SELECT 
            sub.cart_id, SUM(total_price) AS total_price
        FROM
            (SELECT 
                cd.cart_id,
                    cd.product_id,
                    cd.category_id,
                    cd.quantity,
                    p.price_in_rupee,
                    (cd.quantity * p.price_in_rupee) AS total_price
            FROM
                cart_data cd
            JOIN products p ON cd.product_id = p.product_id
                AND cd.category_id = p.category_id
            WHERE
                cd.cart_id = :cartId) AS sub
        GROUP BY sub.cart_id;
    `;

    var results = [];

    await sequelize.query(query, {
        replacements: { cartId },
        type: sequelize.QueryTypes.SELECT
    }).then(result => {
        results = result;
    }).catch(error => {
        console.error('Error executing query:', error);
    })
    return results[0];
}

// Function to generate HMAC SHA256 signature
const generateSignature = (data, secretKey) => {
    const hmac = crypto.createHmac('sha256', secretKey);
    hmac.update(data);
    return hmac.digest('hex');
};

module.exports = {
    send_email,
    send_otp,
    generate_otp,
    saveTokenToDB,
    generateJwtToken,
    getTotalCartPrice,
    generateSignature
};