const db = require("../config/db");

const createOrder = async (userId) => {
    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        // Get user's cart
        const [cartRows] = await connection.query(
            "SELECT id FROM cart WHERE user_id = ?",
            [userId]
        );

        if (cartRows.length === 0) {
            throw new Error("Cart is empty");
        }

        const cartId = cartRows[0].id;

        // Get cart items
        const [items] = await connection.query(
            `
            SELECT
                cart_items.product_id,
                cart_items.quantity,
                products.price,
                products.stock
            FROM cart_items
            JOIN products
                ON products.id = cart_items.product_id
            WHERE cart_items.cart_id = ?
            `,
            [cartId]
        );

        if (items.length === 0) {
            throw new Error("Cart is empty");
        }

        // Check stock and calculate total
        let totalAmount = 0;

        for (const item of items) {

            if (item.quantity > item.stock) {
                throw new Error(
                    `Insufficient stock for product ID ${item.product_id}`
                );
            }

            totalAmount += Number(item.price) * item.quantity;
        }

        // Create order
        const [orderResult] = await connection.query(
            `
            INSERT INTO orders (user_id, total_amount, status)
            VALUES (?, ?, 'confirmed')
            `,
            [userId, totalAmount]
        );

        const orderId = orderResult.insertId;

        // Create order items and reduce stock
        for (const item of items) {

            await connection.query(
                `
                INSERT INTO order_items
                (order_id, product_id, quantity, price)
                VALUES (?, ?, ?, ?)
                `,
                [
                    orderId,
                    item.product_id,
                    item.quantity,
                    item.price
                ]
            );

            await connection.query(
                `
                UPDATE products
                SET stock = stock - ?
                WHERE id = ?
                `,
                [
                    item.quantity,
                    item.product_id
                ]
            );
        }

        // Clear cart
        await connection.query(
            "DELETE FROM cart_items WHERE cart_id = ?",
            [cartId]
        );

        await connection.commit();

        return {
            orderId,
            totalAmount
        };

    } catch (error) {

        await connection.rollback();
        throw error;

    } finally {

        connection.release();

    }
};


const getUserOrders = async (userId) => {

    const [orders] = await db.query(
        `
        SELECT
            id,
            total_amount,
            status,
            created_at
        FROM orders
        WHERE user_id = ?
        ORDER BY created_at DESC
        `,
        [userId]
    );

    return orders;
};


module.exports = {
    createOrder,
    getUserOrders
};