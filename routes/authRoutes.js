import express from 'express';
import mysql from '../config/mysql.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { upload } from '../config/multer.js';
import { uploadImage } from '../utils/cloudinaryUtils.js';
import { isAuth } from '../middlewares/authMiddleware.js';

const router = express.Router();


router.post('/register', upload.single('profileImage'), async (req, res) => {
    const { name, email, password, age } = req.body;

    if (!name || !email || !password || !age) {
        return res.status(400).json({
            status: 'error',
            message: 'Tous les champs sont requis'
        });
    }

    try {
        const connection = await mysql.getConnection();

        const [existingUser] = await connection.execute(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );

        if (existingUser.length > 0) {
            connection.release();
            return res.status(400).json({
                status: 'error',
                message: 'Email déjà utilisé'
            });
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        let imageUrl = null;

        if (req.file) {
            const result = await uploadImage(req.file.path, 'user-profiles');
            imageUrl = result.secure_url;
        }

        const role = 'user';

        const [result] = await connection.execute(
            'INSERT INTO users (name, email, password, age, imageUrl, role) VALUES (?, ?, ?, ?, ?, ?)',
            [name, email, hashedPassword, age, imageUrl, role]
        );

        const token = jwt.sign(
            { userId: result.insertId },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        connection.release();
        res.status(201).json({
            status: 'success',
            token,
            user: {
                id: result.insertId,
                name,
                email,
                age,
                imageUrl,
                role
            }
        });

    } catch (err) {
        console.error('Erreur:', err);
        res.status(500).json({
            status: 'error',
            message: err.message
        });
    }
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            status: 'error',
            message: 'Un Email et un mot de passe sont requis'
        });
    }

    try {
        const connection = await mysql.getConnection();

        const [users] = await connection.execute(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );

        if (users.length === 0) {
            connection.release();
            return res.status(401).json({
                status: 'error',
                message: 'Email et/ou mot de passe incorrect'
            });
        }

        const user = users[0];

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            connection.release();
            return res.status(401).json({
                status: 'error',
                message: 'Email et/ou mot de passe incorrect'
            });
        }

        const token = jwt.sign(
            { userId: user.id },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        connection.release();

        const { password: _, ...userWithoutPassword } = user;

        res.json({
            status: 'success',
            token,
            user: userWithoutPassword
        });

    } catch (err) {
        console.error('Erreur de connexion:', err);
        res.status(500).json({
            status: 'error',
            message: err.message
        });
    }
});

router.get('/me', isAuth, (req, res) => {
    res.json(req.user);
});

export default router;




