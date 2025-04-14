import express from 'express';
import { db } from '../services/firebase/firebase.js';

const router = express.Router();

router.post('/reviews', async (req, res) => {
    const { name, rating, description } = req.body;

    if (!name || !rating || !description) {
        return res.status(400).json({ error: 'Tous les champs sont requis.' });
    }

    try {
        const docRef = await db.collection('reviews').add({
            name,
            rating,
            description,
            createdAt: new Date()
        });
        res.status(201).json({ message: 'Avis ajouté', id: docRef.id });
    } catch (error) {
        console.error('Firebase error :', error);
        res.status(500).json({ error: 'Erreur lors de l’enregistrement de l’avis.' });
    }
});

router.get('/reviews', async (req, res) => {
    try {
        const snapshot = await db.collection('reviews').orderBy('createdAt', 'desc').get();
        const reviews = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.json(reviews);
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la récupération des avis.' });
    }
});

export default router;