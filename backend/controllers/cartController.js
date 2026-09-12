const {
    getCartItems,
    addToCart,
    removeFromCart
} = require("../models/cartModel");


const getCart = async (req, res) => {
    try {

        const items = await getCartItems(req.user.id);

        res.json({
            success: true,
            items: items
        });

    } catch (error) {

        console.error("Get cart error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to get cart"
        });
    }
};


const addItem = async (req, res) => {
    try {

        const { productId, quantity } = req.body;

        if (!productId || !quantity || quantity < 1) {
            return res.status(400).json({
                success: false,
                message: "Valid productId and quantity are required"
            });
        }

        await addToCart(
            req.user.id,
            productId,
            quantity
        );

        res.json({
            success: true,
            message: "Product added to cart"
        });

    } catch (error) {

        console.error("Add cart error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to add product to cart"
        });
    }
};


const removeItem = async (req, res) => {
    try {

        const { productId } = req.params;

        await removeFromCart(
            req.user.id,
            productId
        );

        res.json({
            success: true,
            message: "Product removed from cart"
        });

    } catch (error) {

        console.error("Remove cart error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to remove product from cart"
        });
    }
};


module.exports = {
    getCart,
    addItem,
    removeItem
};