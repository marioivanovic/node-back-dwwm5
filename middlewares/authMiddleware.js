import jwt from 'jsonwebtoken';
import mysql from '../config/mysql.js';

// On va ici vérifier que notre user est connecté
export const isAuth = async (req, res, next) => {
    try {
        // On vérifie si le token est présent dans les headers
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ 
                status: 'error',
                message: 'Non autorisé - Token manquant' 
            });
        }
        
        const token = authHeader.split(' ')[1];
        
        // Vérifie et décode le token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const { userId } = decoded;
        
        // Récupérer les infos de l'utilisateur
        const connection = await mysql.getConnection();
        const [users] = await connection.execute(
            'SELECT id, name, email, age, imageUrl, role FROM users WHERE id = ?',
            [userId]
        );
        connection.release();
        
        if (users.length === 0) {
            return res.status(401).json({ 
                status: 'error',
                message: 'Non autorisé - Utilisateur non trouvé' 
            });
        }
        
        // Attacher l'utilisateur à l'objet de requête
        req.user = users[0];
        next();
    } catch (err) {
        if (err.name === 'JsonWebTokenError') {
            return res.status(401).json({ 
                status: 'error',
                message: 'Non autorisé - Token invalide' 
            });
        }
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ 
                status: 'error',
                message: 'Non autorisé - Token expiré' 
            });
        }
        return res.status(500).json({ 
            status: 'error',
            message: 'Erreur serveur' 
        });
    }
};

// Middleware pour vérifier si l'user est administrateur
export const isAdmin = (req, res, next) => {
    // Le middleware isAuth doit être appelé avant
    if (!req.user) {
        return res.status(401).json({ 
            status: 'error',
            message: 'Non autorisé' 
        });
    }
    
    if (req.user.role !== 'admin') {
        return res.status(403).json({ 
            status: 'error',
            message: 'Accès refusé - Droits administrateur requis' 
        });
    }
    
    next();
};