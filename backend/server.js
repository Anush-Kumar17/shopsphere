const express = require("express");
const cors = require("cors");

require("dotenv").config();

const db = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const cartRoutes = require("./routes/cartRoutes");
const orderRoutes = require("./routes/orderRoutes");
const adminRoutes = require("./routes/adminRoutes");

const authMiddleware = require("./middleware/authMiddleware");

const app = express();


// =========================================
// MIDDLEWARE
// =========================================

app.use(cors());

app.use(express.json());


// =========================================
// BASIC ROUTE
// =========================================

app.get("/", (req, res) => {
    res.json({
        message: "ShopSphere API is running!"
    });
});


// =========================================
// DATABASE TEST
// =========================================

app.get("/api/test-db", async (req, res) => {
    try {
        const [rows] = await db.query(
            "SELECT 1 AS result"
        );

        res.json({
            success: true,
            message: "MySQL database connected successfully!",
            result: rows[0].result
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Database connection failed"
        });
    }
});


// =========================================
// PRODUCTS
// =========================================

app.get("/api/products", async (req, res) => {
    try {

        const [products] = await db.query(`
            SELECT
                products.id,
                products.name,
                products.description,
                products.price,
                products.stock,
                products.image_url,
                categories.name AS category
            FROM products
            LEFT JOIN categories
                ON products.category_id = categories.id
            ORDER BY products.id;
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
});


// =========================================
// AUTH
// =========================================

app.use(
    "/api/auth",
    authRoutes
);


// =========================================
// CART
// =========================================

app.use(
    "/api/cart",
    cartRoutes
);


// =========================================
// ORDERS
// =========================================

app.use(
    "/api/orders",
    orderRoutes
);


// =========================================
// ADMIN
// =========================================

app.use(
    "/api/admin",
    adminRoutes
);


// =========================================
// JWT TEST ROUTE
// =========================================

app.get(
    "/api/protected",
    authMiddleware,
    (req, res) => {

        res.json({
            success: true,
            message: "You accessed a protected route!",
            user: req.user
        });

    }
);


// =========================================
// SERVER
// =========================================

const PORT = process.env.PORT || 5000;

app.listen(
    PORT,
    () => {
        console.log(
            `ShopSphere API running on http://localhost:${PORT}`
        );
    }
);