import mysql from '../config/mysql.js';

export const getAllUsers = async (req, res, next) => {
    try {
        const connection = await mysql.getConnection();
        const [rows] = await connection.execute('SELECT * FROM users');
        connection.release();
        res.json({
            status: 'success',
            data: rows
        });
    } catch (error) {
        next(error);
    }
};

export const createUser = async (req, res, next) => {
    const { name, email, age } = req.body;
    try {
        const connection = await mysql.getConnection();
        const [result] = await connection.execute(
            'INSERT INTO users (name, email, age) VALUES (?, ?, ?)',
            [name, email, age]
        );
        connection.release();
        res.status(201).json({
            status: 'success',
            data: {
                id: result.insertId,
                name,
                email,
                age
            }
        });
    } catch (error) {
        next(error);
    }
};

export const updateUser = async (req, res, next) => {
    const { id } = req.params;
    const { name, email, age } = req.body;
    try {
        const connection = await mysql.getConnection();
        await connection.execute(
            'UPDATE users SET name = ?, email = ?, age = ? WHERE id = ?',
            [name, email, age, id]
        );
        connection.release();
        res.json({
            status: 'success',
            data: {
                id,
                name,
                email,
                age
            }
        });
    } catch (error) {
        next(error);
    }
};

export const deleteUser = async (req, res, next) => {
    const { id } = req.params;
    try {
        const connection = await mysql.getConnection();
        await connection.execute('DELETE FROM users WHERE id = ?', [id]);
        connection.release();
        res.json({
            status: 'success',
            message: 'Utilisateur supprimé'
        });
    } catch (error) {
        next(error);
    }
};