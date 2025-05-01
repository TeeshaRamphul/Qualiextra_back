import PasswordValidator from "password-validator";
import argon2 from "argon2";
import jwt from "jsonwebtoken";
import dotenv from 'dotenv';
dotenv.config();
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

    async loginUser(req, res) {
        try {
            // Récupérer l'email et le mot de passe fourni depuis req.body
            const { email, password } = req.body;

            // Valider la présence des champs -> sinon 400
            if (! email || ! password) {
            return res.status(400).json({ error: "Tous les champs sont obligatoires." });
            }

            // Récupérer en BDD l'utilisateur par son email (User.findOne ---> {...} || null)
            const user = await User.findOne({ where: { email : email } }); // { id, password, email }

            // Si pas d'utilisateur --> 400 : message d'erreur (rester vague !) + RETURN
            if (!user) {
                return res.status(400).json({ error: "Email ou mot de passe incorrect." });
            }

            // Vérifier si le mot de passe est valide 
            const passwordValid = await argon2.verify(user.password, password)

            // Si les mots de passe ne match pas --> 400 : message d'erreur (rester vague) + RETURN
            if (! passwordValid) {
                return res.status(400).json({ error: "Email ou mot de passe incorrect." });
            }

            const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;
            const tokenExpiry = process.env.ACCESS_TOKEN_EXPIRES_IN;
            const token = jwt.sign(
                { 
                    id: user.id, 
                    email: user.email,
                    firstname: user.firstname, 
                    role: user.role 
                },  // Inclure le rôle dans le token
                accessTokenSecret,
                { expiresIn: tokenExpiry }  // Expiration de 1h
            );

            res.json({ token });
        } catch (err) {
            console.error('loginUser error →', err);
            return res.status(500).json({ error: 'Erreur serveur, veuillez réessayer plus tard.' });
        }
    },

    async getAllUsers(req, res) {
        try {
          const users = await User.findAll();
          
          res.status(200).json(users);

        } catch (err) {
          console.error("Erreur lors de la récupération des utilisateurs :", err);
          res.status(500).json({ error: "Erreur serveur lors de la récupération des utilisateurs." });
        }
    },

    async getOneUser(req, res) {
        try {
          const id = req.params.id;
      
          if (req.user.role !== 'admin' && req.user.id != id) {
            return res.status(403).json({ error: "Vous ne pouvez accéder qu'à votre propre profil." });
          }
      
          const user = await User.findByPk(id);
          if (!user) {
            return res.status(400).json({ error: "Utilisateur non trouvé." });
          }
      
          res.status(200).json(user);
        } catch (err) {
          console.error("Erreur lors de la récupération de l'utilisateur :", err);
          res.status(500).json({ error: "Erreur serveur lors de la récupération de l'utilisateur." });
        }
    },

    async updateUser(req, res) {
        try {
            const id = req.params.id;

            if (req.user.role !== 'admin' && req.user.id != id) {
                return res.status(403).json({ error: "Vous ne pouvez modifier que votre propre profil." });
            }
            
            const user = await User.findByPk(id);
            if (!user){
                return res.status(400).json({ error: "Utilisateur non trouvé." });
            }

            const { firstname, lastname, email } = req.body;
            await user.update({ firstname, lastname, email });

            res.status(200).json(user);
        } catch (err) {
            console.error("Erreur lors de la mise à jour de l'utilisateur :", err);
            res.status(500).json({ error: "Erreur serveur lors de la mise à jour." });
        }
    },

    async deleteUser(req, res) {
        try {
            const id = req.params.id;

            const user = await User.findByPk(id);
            if (!user){
                return res.status(400).json({ error: "Utilisateur non trouvé." });
            }

            if (req.user.role !== 'admin') {
                return res.status(403).json({ error: "Vous n'êtes pas autorisé à supprimer cet utilisateur." });
            }

            await user.destroy();

            res.status(204).send();
        } catch (err) {
            console.error("Erreur lors de la suppression de l'utilisateur :", err);
            res.status(500).json({ error: "Erreur serveur lors de la suppression." });
        }
    },
}

export { userController };