const express = require("express");

const authMiddleware = require("../middleware/authMiddleware");

const {
    getCart,
    addItem,
    removeItem
} = require("../controllers/cartController");

const router = express.Router();

// Get logged-in user's cart
router.get("/", authMiddleware, getCart);

// Add product to cart
router.post("/", authMiddleware, addItem);

// Remove product from cart
router.delete("/:productId", authMiddleware, removeItem);

module.exports = router;