const db = require("../config/db");

const createUser = async (name, email, hashedPassword) => {
    const [result] = await db.query(
        `INSERT INTO users (name, email, password)
         VALUES (?, ?, ?)`,
        [name, email, hashedPassword]
    );

    return result;
};

const findUserByEmail = async (email) => {
    const [rows] = await db.query(
        `SELECT * FROM users WHERE email = ?`,
        [email]
    );

    return rows[0];
};

module.exports = {
    createUser,
    findUserByEmail
};