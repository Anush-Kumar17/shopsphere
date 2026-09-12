const db = require("../config/db");

const getOrCreateCart = async (userId) => {
    const [existingCart] = await db.query(
        "SELECT * FROM cart WHERE user_id = ?",
        [userId]
    );

    if (existingCart.length > 0) {
        return existingCart[0];
    }

    const [result] = await db.query(
        "INSERT INTO cart (user_id) VALUES (?)",
        [userId]
    );

    return {
        id: result.insertId,
        user_id: userId
    };
};


const getCartItems = async (userId) => {
    const [rows] = await db.query(
        `
        SELECT
            cart_items.id,
            cart_items.product_id,
            cart_items.quantity,
            products.name,
            products.price,
            products.image_url,
            products.stock
        FROM cart
        JOIN cart_items
            ON cart.id = cart_items.cart_id
        JOIN products
            ON products.id = cart_items.product_id
        WHERE cart.user_id = ?
        `,
        [userId]
    );

    return rows;
};


const addToCart = async (userId, productId, quantity) => {

    const cart = await getOrCreateCart(userId);

    const [existingItem] = await db.query(
        `
        SELECT * FROM cart_items
        WHERE cart_id = ? AND product_id = ?
        `,
        [cart.id, productId]
    );

    if (existingItem.length > 0) {

        await db.query(
            `
            UPDATE cart_items
            SET quantity = quantity + ?
            WHERE cart_id = ? AND product_id = ?
            `,
            [quantity, cart.id, productId]
        );

    } else {

        await db.query(
            `
            INSERT INTO cart_items
            (cart_id, product_id, quantity)
            VALUES (?, ?, ?)
            `,
            [cart.id, productId, quantity]
        );
    }
};


const removeFromCart = async (userId, productId) => {

    const [cart] = await db.query(
        "SELECT id FROM cart WHERE user_id = ?",
        [userId]
    );

    if (cart.length === 0) {
        return;
    }

    await db.query(
        `
        DELETE FROM cart_items
        WHERE cart_id = ? AND product_id = ?
        `,
        [cart[0].id, productId]
    );
};


module.exports = {
    getOrCreateCart,
    getCartItems,
    addToCart,
    removeFromCart
};