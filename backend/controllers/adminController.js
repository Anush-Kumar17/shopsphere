const db = require("../config/db");

// =========================================================
// GET ALL PRODUCTS
// =========================================================

const getProducts = async (req, res) => {
    try {
        const [products] = await db.query(`
            SELECT
                products.id,
                products.name,
                products.description,
                products.price,
                products.stock,
                products.category_id,
                products.image_url,
                categories.name AS category
            FROM products
            LEFT JOIN categories
                ON products.category_id = categories.id
            ORDER BY products.id DESC
        `);

        res.json({
            success: true,
            products
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch products"
        });
    }
};

// =========================================================
// ADD PRODUCT
// =========================================================

const addProduct = async (req, res) => {
    try {
        const {
            name,
            description,
            price,
            stock,
            category_id,
            image_url
        } = req.body;

        if (
            !name ||
            price === undefined ||
            stock === undefined
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Name, price and stock are required"
            });
        }

        const [result] = await db.query(
            `
            INSERT INTO products
            (
                name,
                description,
                price,
                stock,
                category_id,
                image_url
            )
            VALUES (?, ?, ?, ?, ?, ?)
            `,
            [
                name,
                description || "",
                price,
                stock,
                category_id || null,
                image_url || null
            ]
        );

        res.status(201).json({
            success: true,
            message:
                "Product added successfully",
            productId: result.insertId
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message:
                "Failed to add product"
        });
    }
};

// =========================================================
// UPDATE PRODUCT
// =========================================================

const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;

        const {
            name,
            description,
            price,
            stock,
            category_id,
            image_url
        } = req.body;

        if (
            !name ||
            price === undefined ||
            stock === undefined
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Name, price and stock are required"
            });
        }

        const [result] = await db.query(
            `
            UPDATE products
            SET
                name = ?,
                description = ?,
                price = ?,
                stock = ?,
                category_id = ?,
                image_url = ?
            WHERE id = ?
            `,
            [
                name,
                description || "",
                price,
                stock,
                category_id || null,
                image_url || null,
                id
            ]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        res.json({
            success: true,
            message:
                "Product updated successfully"
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message:
                "Failed to update product"
        });
    }
};

// =========================================================
// DELETE PRODUCT
// =========================================================

const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;

        const [result] = await db.query(
            "DELETE FROM products WHERE id = ?",
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        res.json({
            success: true,
            message:
                "Product deleted successfully"
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message:
                "Failed to delete product"
        });
    }
};

// =========================================================
// GET ALL ORDERS
// =========================================================

const getOrders = async (req, res) => {
    try {
        const [orders] = await db.query(`
            SELECT
                orders.id,
                orders.total_amount,
                orders.status,
                orders.created_at,
                users.name,
                users.email
            FROM orders
            JOIN users
                ON orders.user_id = users.id
            ORDER BY orders.created_at DESC
        `);

        res.json({
            success: true,
            orders
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message:
                "Failed to fetch orders"
        });
    }
};

// =========================================================
// UPDATE ORDER STATUS
// =========================================================

const updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const validStatuses = [
            "pending",
            "confirmed",
            "shipped",
            "delivered",
            "cancelled"
        ];

        if (
            !validStatuses.includes(status)
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid order status"
            });
        }

        const [result] = await db.query(
            `
            UPDATE orders
            SET status = ?
            WHERE id = ?
            `,
            [status, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        res.json({
            success: true,
            message:
                "Order status updated"
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message:
                "Failed to update order"
        });
    }
};

module.exports = {
    getProducts,
    addProduct,
    updateProduct,
    deleteProduct,
    getOrders,
    updateOrderStatus
};