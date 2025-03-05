import express from 'express';
import mysql from '../config/mysql.js';
import { isAuth, isAdmin } from '../middlewares/authMiddleware.js';
import { upload } from '../config/multer.js';
import { uploadImage } from '../utils/cloudinaryUtils.js';

const router = express.Router();

router.get('/users', isAuth, isAdmin, async (req, res, next) => {
    try {
        const connection = await mysql.getConnection();
        const [rows] = await connection.execute('SELECT * FROM users');
        connection.release();
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/user/:id', isAuth, async (req, res) => {
    const { id } = req.params;
    if (req.user.role !== 'admin' && req.user.id != id) {
        return res.status(403).json({ 
            error: 'Accès refusé - Vous ne pouvez pas accéder au profil d\'un autre utilisateur' 
        });
    }
    try {
        const connection = await mysql.getConnection();
        const [rows] = await connection.execute('SELECT id, name, email, age, imageUrl, role FROM users WHERE id = ?', [id]);
        connection.release();
        
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Utilisateur non trouvé' });
        }
        
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.put('/user/:id', isAuth, async (req, res) => {
    const { id } = req.params;
    // req.params =
    // {
    //     id: "azerty1234"
    // }
    const { name, email, age, role } = req.body;

    // req.body =>
    // {
    //     "name": "Julien",
    //     "email": "julien@exemple.com",
    //     "age": 39
    // };
    if (req.user.role !== 'admin' && req.user.id != id) {
        return res.status(403).json({ 
            error: 'Accès refusé - Vous ne pouvez pas modifier le profil d\'un autre utilisateur' 
        });
    }
    if (role !== undefined && req.user.role !== 'admin') {
        return res.status(403).json({ 
            error: 'Accès refusé - Vous ne pouvez pas modifier les rôles' 
        });
    }
    try {
        const connection = await mysql.getConnection();
        const [userExists] = await connection.execute('SELECT id FROM users WHERE id = ?', [id]);
        if (userExists.length === 0) {
            connection.release();
            return res.status(404).json({ error: 'Utilisateur non trouvé' });
        }
        await connection.execute('UPDATE users SET name = ?, email = ?, age = ? WHERE id = ?', [name, email, age, id]);
        const [updatedUser] = await connection.execute(
            'SELECT id, name, email, age, imageUrl, role FROM users WHERE id = ?', 
            [id]
        );
        
        connection.release();
        res.json(updatedUser[0]);
    } catch (err) {
        res.status(500).json({ err: err.message })
    }
});

router.put('/user/profileImage/:id', isAuth, upload.single('profileImage'), async (req, res) => {
    const { id } = req.params;
    
    if (req.user.role !== 'admin' && req.user.id != id) {
        return res.status(403).json({ 
            error: 'Accès refusé - Vous ne pouvez pas modifier l\'image d\'un autre utilisateur' 
        });
    }
    
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'Aucune image fournie' });
        }
        
        const connection = await mysql.getConnection();
        
        const [userExists] = await connection.execute('SELECT id FROM users WHERE id = ?', [id]);
        if (userExists.length === 0) {
            connection.release();
            return res.status(404).json({ error: 'Utilisateur non trouvé' });
        }
        
        const result = await uploadImage(req.file.path, 'user-profiles');
        const imageUrl = result.secure_url;
        
        await connection.execute(
            'UPDATE users SET imageUrl = ? WHERE id = ?', 
            [imageUrl, id]
        );
        
        const [updatedUser] = await connection.execute(
            'SELECT id, name, email, age, imageUrl, role FROM users WHERE id = ?', 
            [id]
        );
        
        connection.release();
        res.json(updatedUser[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.delete('/user/:id', isAuth, isAdmin, async (req, res) => {
    const { id } = req.params;
    
    if (req.user.id == id) {
        return res.status(400).json({ 
            error: 'Vous ne pouvez pas supprimer votre propre compte !!!' 
        });
    }
    
    try {
        const connection = await mysql.getConnection();
        
        const [userExists] = await connection.execute('SELECT id FROM users WHERE id = ?', [id]);
        if (userExists.length === 0) {
            connection.release();
            return res.status(404).json({ error: 'Utilisateur non trouvé' });
        }
        
        await connection.execute('DELETE FROM users WHERE id = ?', [id]);
        connection.release();
        
        res.json({ 
            message: 'Utilisateur supprimé avec succès',
            id: id
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;

// import express from 'express';
// import { getAllUsers, createUser, updateUser, deleteUser } from '../controllers/userController.js';

// const router = express.Router();

// router.get('/users', getAllUsers);
// router.post('/user', createUser);
// router.put('/user/:id', updateUser);
// router.delete('/user/:id', deleteUser);

// export default router;





// {
//     id: 1,
//         "name": "pizza",
//         "price": 10,
//         "ingredients": [{
//             id: 1,
//             "name": "tomates",

//         },
//             {
//                 id: 2,
//                 "name": "fromage"
//             },
//             {
//             "id": 3,
            
//         }]    
// }