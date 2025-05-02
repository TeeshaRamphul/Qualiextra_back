export function checkAdmin(req, res, next) {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: "Accès interdit. Vous n'êtes pas administrateur." });
    }
    next();  // L'utilisateur est admin, on continue
}