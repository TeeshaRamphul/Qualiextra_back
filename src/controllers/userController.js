import { User } from "../models/User.js";

const userController = {

    async getAllUsers(req, res) {
        const users = await User.findAll();
      
        if (!users){
            return res.status(400).json({ error: "L'email et le mot de passe fournis ne correspondent pas." });
        }
        res.status(200).json(users);
    },

    async getOneUser(req, res) {
        const id = req.params.id;

        const user = await User.findByPk(id);
        if (!user){
            return res.status(400).json({ error: "Utilisateur non trouvé." });
        }

        res.status(200).json(user);
    },

}

export { userController };