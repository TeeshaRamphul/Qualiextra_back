import PasswordValidator from "password-validator";
import argon2 from "argon2";
import { User } from "../models/User.js";


const userController = {

    async registerUser(req, res) {
        // Récupérer les données du body
        const { firstname, lastname, email, password, role } = req.body;

        // Vérifier que tous les champs sont présents
        if (!firstname || !lastname || !email || !password) {
            return res.status(400).json({ error: 'Tous les champs (firstname, lastname, email, password) sont obligatoires.' });
        }

        // Vérifier que le mot de passe est suffisamment complexe
        const schema = new PasswordValidator()
        .is().min(12)                  // 12 caractères mini
        .is().max(100)                 // Maximum 100
        .has().uppercase()             // 1 majuscule
        .has().lowercase()             // 1 minuscule
        .has().digits(1)               // 1 chiffre
        .has().symbols(1)              // 1 symbole
        .has().not().spaces();         // Pas d'espace
      
        if (! schema.validate(password)) {
            return res.status(400).json({ error: "Le mot de passe n'est pas suffisamment complexe. Veuillez utiliser au moins 12 caractères, une majuscule, une minuscule, un chiffre et un symbole." });
        }
    
        // Vérifier si un utilisateur avec le même email n'existe pas déjà en BDD => faire une requête pour récupérer un utilisateur par son email
        const existing = await User.findOne({ where: { email: email }});
        if (existing) {
            return res.status(409).json({ error: "L'email renseigné est déjà utilisé." });
        }

        // Vérifier le format de l'email --> on pourrait envoyer un mail de validation

        
        // Hacher le mot de passe (pour ne pas le sauvegarder en clair)
        const hash = await argon2.hash(password);
    
        // Sauvegarder l'utilisateur en BDD (via le model User)
        try {
            await User.create({
                firstname,
                lastname,
                email,
                password: hash,
                role: role || 'member',
            });
    
            return res.status(201).json({ successMessage: "Veuillez à présent vous authentifier." });
    
        } catch (error) {
            console.error('Erreur lors de l\'enregistrement de l\'utilisateur :', error); // LOG l'erreur SQL exacte !
            return res.status(500).json({ error: "Erreur lors de l'enregistrement de l'utilisateur." });
        }
    },

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

    async updateUser(req, res) {
        const id = req.params.id;
        
        const user = await User.findByPk(id);
        if (!user){
            return res.status(400).json({ error: "Utilisateur non trouvé." });
        }

        const { firstname, lastname, email, password } = req.body;
        await user.update({ firstname, lastname, email, password });

        res.status(200).json(user);
    },

    async deleteUser(req, res) {
        const id = req.params.id;

        const user = await User.findByPk(id);
        if (!user){
            return res.status(400).json({ error: "Utilisateur non trouvé." });
        }

        await user.destroy();

        res.status(204);
    },

}

export { userController };