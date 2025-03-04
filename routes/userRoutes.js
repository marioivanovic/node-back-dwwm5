import express from 'express';
import mysql from '../config/mysql.js';

const router = express.Router();

router.get('/users', async (req, res, next) => {
    try {
        const connection = await mysql.getConnection();
        const [rows] = await connection.execute('SELECT * FROM users');
        connection.release();
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


router.put('/user/:id', async (req, res) => {
    const { id } = req.params;
    // req.params =
    // {
    //     id: "azerty1234"
    // }
    const { name, mail, age } = req.body;
    // req.body =>
    // {
    //     "name": "Julien",
    //     "email": "julien@exemple.com",
    //     "age": 39
    // };
    try {
        const connection = await mysql.getConnection();
        await connection.execute('UPDATE user SET name = ?, mail = ?, age = ? WHERE id = ?', [name, email, age, id]);
        connection.release();
        res.json({ id, name, mail, age });
    } catch (err) {
        res.status(500).json({ err: err.message })
    }
});

router.delete('/user/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const connection = await mysql.getConnection();
        await connection.execute('DELETE FROM users WHERE id = ?', [id]);
        connection.release();
        res.json({ message: 'User supprimé de la db' });
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