const express = require("express");

const adminMiddleware = require("../middleware/adminMiddleware");

const {
    getProducts,
    addProduct,
    updateProduct,
    deleteProduct,
    getOrders,
    updateOrderStatus
} = require("../controllers/adminController");

const router = express.Router();

router.get(
    "/products",
    adminMiddleware,
    getProducts
);

router.post(
    "/products",
    adminMiddleware,
    addProduct
);

router.put(
    "/products/:id",
    adminMiddleware,
    updateProduct
);

router.delete(
    "/products/:id",
    adminMiddleware,
    deleteProduct
);

router.get(
    "/orders",
    adminMiddleware,
    getOrders
);

router.put(
    "/orders/:id/status",
    adminMiddleware,
    updateOrderStatus
);

module.exports = router;