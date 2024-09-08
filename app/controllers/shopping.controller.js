const db = require("../models");
const commonUtil = require("../util/common");
const ProductCategory = db.product_category;
const Product = db.product;
const Cart = db.cart;
const CartData = db.cart_data;
const Address = db.address;

/**
 * @swagger
 * /admin/product-category:
 *   post:
 *     description: Create a new product category
 *     summary: Create Product Category
 *     tags:
 *       - Shopping
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               category_name:
 *                 type: string
 *                 example: Electronics
 *     responses:
 *       201:
 *         description: Product category created successfully.
 *       400:
 *         description: Category name is required.
 *       500:
 *         description: Internal Server Error.
 */

// Create a new product category
exports.createProductCategory = async (req, res) => {
    try {
        const { category_name } = req.body;

        if (!category_name) {
            return res.status(400).send({ message: "Category name is required." });
        }

        const newCategory = await ProductCategory.create({ category_name });
        res.status(201).send(newCategory);
    } catch (error) {
        res.status(500).send({ message: error.message || "An error occurred while creating the category." });
    }
};


/**
 * @swagger
 * /api/product-category:
 *   get:
 *     description: Fetch all product categories
 *     summary: Get All Product Categories
 *     tags:
 *       - Shopping
 *     parameters:
 *       - in: header
 *         name: accesstoken
 *         schema:
 *           type: string
 *         required: true
 *         description: Access token for user authentication
 *     responses:
 *       200:
 *         description: Product categories fetched successfully.
 *       500:
 *         description: Internal Server Error.
 */

// Fetch all product categories
exports.getAllProductCategories = async (req, res) => {
    try {
        const categories = await ProductCategory.findAll();
        res.status(200).send(categories);

    } catch (error) {
        res.status(500).send({ message: error.message || "An error occurred while retrieving categories." });
    }
};


/**
 * @swagger
 * /admin/product:
 *   post:
 *     description: Create a new product within a category
 *     summary: Create Product
 *     tags:
 *       - Shopping
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               category_id:
 *                 type: integer
 *                 example: 1
 *               name:
 *                 type: string
 *                 example: "Smartphone"
 *               price_in_rupee:
 *                 type: number
 *                 format: float
 *                 example: 299.99
 *               quality:
 *                 type: number
 *                 format: float
 *                 example: 299.99
 *               discount:
 *                 type: number
 *                 format: float
 *                 example: 10
 *               description:
 *                 type: string
 *                 example: "Latest model with high-end features."
 *               stock_quantity:
 *                 type: integer
 *                 example: 50
 *               rating:
 *                 type: number
 *                 format: float
 *                 example: 4.5
 *               image:
 *                 type: string
 *                 example: "image_url.jpg"
 *               colour_options:
 *                 type: string
 *                 example: "Black, White, Blue"
 *               time_taken_to_deliver:
 *                 type: string
 *                 example: "2-3 days"
 *     responses:
 *       201:
 *         description: Product created successfully.
 *       400:
 *         description: Validation error.
 *       500:
 *         description: Internal Server Error.
 */

// Create a new product
exports.createProduct = async (req, res) => {
    try {
        const {
            category_id,
            name,
            price_in_rupee,
            quality,
            discount,
            description,
            stock_quantity,
            rating,
            image,
            colour_options,
            time_taken_to_deliver,
        } = req.body;

        if (!category_id || !name || !price_in_rupee || !quality || !stock_quantity) {
            return res.status(400).send({ message: "Category ID, name, price, and stock quantity are required." });
        }

        const newProduct = await Product.create({
            category_id,
            name,
            price_in_rupee,
            quality,
            discount,
            description,
            stock_quantity,
            rating,
            image,
            colour_options,
            time_taken_to_deliver,
        });

        res.status(201).send(newProduct);
    } catch (error) {
        res.status(500).send({ message: error.message || "An error occurred while creating the product." });
    }
};


/**
 * @swagger
 * /api/product/{category_id}:
 *   get:
 *     description: Fetch all products by category ID
 *     summary: Get Products By Category
 *     tags:
 *       - Shopping
 *     parameters:
 *       - in: header
 *         name: accesstoken
 *         schema:
 *           type: string
 *         required: true
 *         description: Access token for user authentication
 *       - in: path
 *         name: category_id
 *         schema:
 *           type: integer
 *         required: false
 *         description: ID of the product category
 *     responses:
 *       200:
 *         description: Products fetched successfully.
 *       400:
 *         description: Validation error.
 *       500:
 *         description: Internal Server Error.
 */

// Fetch all products by category ID
exports.getProductsByCategory = async (req, res) => {
    try {
        const { category_id } = req.params;

        if (isNaN(category_id)) {
            const products = await Product.findAll();
            res.status(200).send(products);
        } else {
            const products = await Product.findAll({
                where: { category_id },
            });

            if (products.length) {
                res.status(200).send(products);
            } else {
                res.status(200).send({ message: "No product found in this category." });
            }
        }


    } catch (error) {
        res.status(500).send({ message: error.message || "An error occurred while retrieving products." });
    }
};



/**
 * @swagger
 * /api/cart:
 *   post:
 *     description: Add an item to the cart
 *     summary: Add to Cart
 *     tags:
 *       - Shopping
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
 *               product_id:
 *                 type: integer
 *                 example: 2
 *               category_id:
 *                 type: integer
 *                 example: 1
 *               quantity:
 *                 type: integer
 *                 example: 3
 *     responses:
 *       201:
 *         description: Item added to cart successfully.
 *       400:
 *         description: Validation error.
 *       500:
 *         description: Internal Server Error.
 */

// Add an item to the cart
exports.addToCart = async (req, res) => {
    try {
        const user_id = req.user_id;
        const { product_id, category_id, quantity } = req.body;

        if (!product_id || !category_id || !quantity) {
            return res.status(400).send({ message: "Product ID, category ID, and quantity are required." });
        }

        var cartInfo = await Cart.findOne({
            where: { user_id: user_id },
            order: [['cart_id', 'DESC']]
        });

        if (!cartInfo) {
            cartInfo = await Cart.create({ user_id });
        }

        const cartDataInfo = await CartData.findOne({ where: { cart_id: cartInfo.cart_id, category_id: category_id, product_id: product_id } });

        if (cartDataInfo) {
            cartDataInfo.quantity = quantity;
            await cartDataInfo.save();
            res.status(200).send({ message: "Cart item updated successfully." });
        } else {
            await CartData.create({ cart_id: cartInfo.cart_id, user_id, product_id, category_id, quantity });
            res.status(201).send({ message: "Cart item created successfully." });
        }

    } catch (error) {
        res.status(500).send({ message: error.message || "An error occurred while adding item to cart." });
    }
};



/**
 * @swagger
 * /api/cart:
 *   get:
 *     description: Fetch all cart items for a user
 *     summary: Get Cart Items
 *     tags:
 *       - Shopping
 *     parameters:
 *       - in: header
 *         name: accesstoken
 *         schema:
 *           type: string
 *         required: true
 *         description: Access token for user authentication
 *     responses:
 *       200:
 *         description: Cart items fetched successfully.
 *       400:
 *         description: Validation error.
 *       500:
 *         description: Internal Server Error.
 */

// Fetch all cart items for a user
exports.getCartItems = async (req, res) => {
    try {
        const user_id = req.user_id;

        var cartInfo = await Cart.findOne({
            where: { user_id: user_id },
            order: [['cart_id', 'DESC']]
        });

        if (!cartInfo) {
            res.status(200).send({ message: "Shopping cart is Empty." });
        }

        const cartItems = await CartData.findAll({ where: { cart_id: cartInfo.cart_id } });

        // Fetch product details for each cart item
        const detailedCartItems = await Promise.all(
            cartItems.map(async (item) => {
                const product = await Product.findByPk(item.product_id);
                return {
                    ...item.toJSON(),
                    name: product.name,
                    price_in_rupee: product.price_in_rupee,
                    quality: product.quality,
                    discount: product.discount,
                    image: product.image,
                };
            })
        );
        const result = { data: detailedCartItems, total_amount: 0 };
        const amountRes = await commonUtil.getTotalCartPrice(cartInfo.cart_id);
        result.total_amount = amountRes.total_price;

        res.status(200).send(result);
    } catch (error) {
        res.status(500).send({ message: error.message || "An error occurred while retrieving cart items." });
    }
};



/**
 * @swagger
 * /api/address:
 *   post:
 *     description: Add a new address for a user
 *     summary: Add Address
 *     tags:
 *       - Shopping
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
 *               street:
 *                 type: string
 *                 example: "123 Main St"
 *               city:
 *                 type: string
 *                 example: "Springfield"
 *               state:
 *                 type: string
 *                 example: "IL"
 *               postal_code:
 *                 type: string
 *                 example: "62701"
 *               country:
 *                 type: string
 *                 example: "USA"
 *               address_type:
 *                 type: string
 *                 example: "Home"
 *     responses:
 *       201:
 *         description: Address added successfully.
 *       400:
 *         description: Validation error.
 *       500:
 *         description: Internal Server Error.
 */

// Add an address
exports.addAddress = async (req, res) => {
    try {
        const user_id = req.user_id;
        const { street, city, state, postal_code, country, address_type } = req.body;

        if (!street || !city || !state || !postal_code || !country || !address_type) {
            return res.status(400).send({ message: "All address fields are required." });
        }

        const newAddress = await Address.create({ user_id, street, city, state, postal_code, country, address_type });
        res.status(201).send(newAddress);
    } catch (error) {
        res.status(500).send({ message: error.message || "An error occurred while adding the address." });
    }
};


/**
 * @swagger
 * /api/address:
 *   get:
 *     description: Fetch all addresses for a user
 *     summary: Get User Addresses
 *     tags:
 *       - Shopping
 *     parameters:
 *       - in: header
 *         name: accesstoken
 *         schema:
 *           type: string
 *         required: true
 *         description: Access token for user authentication
 *     responses:
 *       200:
 *         description: Addresses retrieved successfully.
 *       400:
 *         description: Validation error.
 *       500:
 *         description: Internal Server Error.
 */

// Fetch all addresses for a user
exports.getUserAddresses = async (req, res) => {
    try {
        const user_id = req.user_id;

        const addresses = await Address.findAll({ where: { user_id } });

        if (addresses.length) {
            res.status(200).send(addresses);
        } else {
            res.status(200).send({ message: "No address found." });
        }
    } catch (error) {
        res.status(500).send({ message: error.message || "An error occurred while retrieving addresses." });
    }
};



/**
 * @swagger
 * /api/select-address/{address_id}:
 *   post:
 *     description: Select default address for a user
 *     summary: Select user default address
 *     tags:
 *       - Shopping
 *     parameters:
 *       - in: header
 *         name: accesstoken
 *         schema:
 *           type: string
 *         required: true
 *         description: Access token for user authentication
 *       - in: path
 *         name: address_id
 *         schema:
 *           type: integer
 *         required: false
 *         description: ID of the address
 *     responses:
 *       200:
 *         description: Default address is now changed.
 *       400:
 *         description: Validation error.
 *       500:
 *         description: Internal Server Error.
 */

// Select address for a user
exports.selectUserAddress = async (req, res) => {
    try {
        const user_id = req.user_id;
        const { address_id } = req.params;

        const address = await Address.findOne({ where: { address_id } });

        if (!address) {
            res.status(404).send({ message: "Invalid address id." });
        } else {
            const addresses = await Address.findAll({ where: { user_id: user_id, is_selected: true } });

            if (addresses.length) {
                // Fetch and update address details for each addresses
                await addresses.map(async (item) => {
                    const address = await Address.findByPk(item.address_id);
                    address.is_selected = false;
                    await address.save();
                })
            }

            address.is_selected = true;
            await address.save();

            res.status(200).send({ message: "Default address is now changed." });
        }

    } catch (error) {
        res.status(500).send({ message: error.message || "An error occurred while retrieving addresses." });
    }
};