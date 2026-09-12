const express = require("express");

const authMiddleware = require("../middleware/authMiddleware");

const {
    checkout,
    getOrders
} = require("../controllers/orderController");

const router = express.Router();

// Place an order from the user's cart
router.post("/checkout", authMiddleware, checkout);

// Get logged-in user's orders
router.get("/", authMiddleware, getOrders);

module.exports = router;