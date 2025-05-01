
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

export function authenticateToken(req, res, next) {
    const token = req.headers['authorization']?.split(' ')[1];  // On prend le token après le mot "Bearer"

    if (!token) {
        return res.status(401).json({ error: "Le token est manquant ou n'est pas correctement formaté." });
    }

    try {
        const user = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        req.user = user;  // Ajoute l'objet `user` dans la requête
        next();
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ error: "Le token a expiré." });
        }
        return res.status(403).json({ error: "Token invalide." });
    }
}
