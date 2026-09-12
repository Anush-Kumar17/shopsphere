const {
    createOrder,
    getUserOrders
} = require("../models/orderModel");


const checkout = async (req, res) => {
    try {

        const order = await createOrder(req.user.id);

        res.status(201).json({
            success: true,
            message: "Order placed successfully",
            order: order
        });

    } catch (error) {

        console.error("Checkout error:", error);

        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};


const getOrders = async (req, res) => {
    try {

        const orders = await getUserOrders(req.user.id);

        res.json({
            success: true,
            orders: orders
        });

    } catch (error) {

        console.error("Get orders error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to get orders"
        });
    }
};


module.exports = {
    checkout,
    getOrders
};