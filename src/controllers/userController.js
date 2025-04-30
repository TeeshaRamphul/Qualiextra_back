import { User } from "../models/User.js";

const userController = {

    async getAllUsers(req, res) {
        // Récupérer toutes les listes de la DB
        const users = await User.findAll();
      
        if (!users){
            return res.status(400).json({ error: "L'email et le mot de passe fournis ne correspondent pas." });
        }
        res.status(200).json(users);
    },
}

export { userController };