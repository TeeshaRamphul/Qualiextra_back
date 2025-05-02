import { User } from "../models/User.js";
import { sendEmail } from "../docs/swagger/nodemail.js";
import jwt from "jsonwebtoken";
import dotenv from 'dotenv';
dotenv.config();
import { v4 as uuidv4 } from 'uuid';
import validator from 'validator';

import PasswordValidator from "password-validator";
import argon2 from "argon2";

const authController = {
     
//<--------------------------------- REGISTER --------------------------------->
    
    /**
 * @openapi
 * /register:
 *   post:
 *     summary: "Créer un nouveau compte utilisateur"
 *     description: "Cette route permet à un utilisateur de s'inscrire. Le mot de passe doit respecter des critères de complexité."
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstname
 *               - lastname
 *               - email
 *               - password
 *             properties:
 *               firstname:
 *                 type: string
 *                 example: Jean
 *               lastname:
 *                 type: string
 *                 example: Dupont
 *               email:
 *                 type: string
 *                 example: jean.dupont@example.com
 *               password:
 *                 type: string
 *                 example: Password123!
 *               role:
 *                 type: string
 *                 example: member
 *     responses:
 *       201:
 *         description: "Utilisateur créé avec succès."
 *       400:
 *         description: "Le mot de passe n'est pas suffisamment complexe. Veuillez utiliser au moins 12 caractères, une majuscule, une minuscule, un chiffre et un symbole."
 *       409:
 *         description: "L'email renseigné est déjà utilisé."
 *       500:
 *         description: "Erreur lors de l'enregistrement de l'utilisateur."
 */

    async registerUser(req, res) {
        // Récupérer les données du corp et vérifier que tous les champs sont présents
        const { firstname, lastname, email, password, role } = req.body;
        if (!firstname || !lastname || !email || !password) {
            return res.status(400).json({ error: 'Tous les champs (firstname, lastname, email, password) sont obligatoires.' });
        }

        // Liste des domaines d'emails jetables (pour éviter les faux comptes)        
        const disposableEmailDomains = [
            "mailinator.com",
            "temp-mail.org",
            "10minutemail.com",
            "guerrillamail.com",
            "yopmail.com",
            "trashmail.com",
            "maildrop.cc",
        ];

        // Vérification du format de l'email
        if (!validator.isEmail(email)) {
            return res.status(400).json({ error: "Le format de l'adresse email est invalide." });
        }

        // Extraire le domaine de l'email (après le @)
        const domain = email.split("@")[1].toLowerCase();

        // Vérifier si l'email provient d'un domaine jetable
        if (disposableEmailDomains.includes(domain)) {
            return res.status(400).json({ error: "Les adresses email jetables ne sont pas autorisées." });
        }
        // Vérifier si l'email existe déjà
        const existing = await User.findOne({ where: { email: email }});
            if (existing) {
            return res.status(409).json({ error: "L'email renseigné est déjà utilisé." });
        }

        // Vérifier la complexité du mot de passe
        const schema = new PasswordValidator()
        .is().min(12)                  // 12 caractères mini
        .is().max(100)                 // Maximum 100
        .has().uppercase(1)             // 1 majuscule
        .has().lowercase(1)             // 1 minuscule
        .has().digits(1)               // 1 chiffre
        .has().symbols(1)              // 1 symbole
        .has().not().spaces();         // Pas d'espace
        
        // Si le mot de passe ne respecte pas les critères
        if (! schema.validate(password)) {
            return res.status(400).json({ error: "Le mot de passe n'est pas suffisamment complexe. Veuillez utiliser au moins 12 caractères, une majuscule, une minuscule, un chiffre et un symbole." });
        }

        // Hacher le mot de passe avant de l'enregistrer en base de données
        const hash = await argon2.hash(password);

        // Générer un token de vérification de l'email
        const emailVerificationToken = uuidv4();

        // Sauvegarder l'utilisateur en BDD (via le model User)
        try {
            await User.create({
                firstname,
                lastname,
                email,
                password: hash,
                role: role || 'member',  // Si aucun rôle n'est précisé, le rôle par défaut est 'member'
                isVerified: false,       // L'email n'est pas encore vérifié
                emailVerificationToken   // Token de vérification d'email
            });

            // Générer l'URL de vérification de l'email
            const baseUrl = process.env.BASE_URL 
            const verificationUrl = `${baseUrl}/verify-email?token=${emailVerificationToken}`;

             // Envoyer l'email de vérification
            await sendEmail({ email, firstname, verificationUrl});
            
            // Retourner une réponse de succès
            return res.status(201).json({ successMessage: "Utilisateur créé avec succès. Un email de vérification a été envoyé." });
    
        } catch (error) {
            console.error('Erreur lors de l\'enregistrement de l\'utilisateur :', error);
            return res.status(500).json({ error: "Erreur lors de l'enregistrement de l'utilisateur." });
        }
    },


//<--------------------------------- VERIFY-EMAIL --------------------------------->

    /**
 * @openapi
 * /verify-email:
 *   get:
 *     summary: Vérification de l'email après inscription
 *     description: Cette route permet de vérifier l'email de l'utilisateur après l'inscription en utilisant un token de vérification.
 *     parameters:
 *       - in: query
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Le token de vérification envoyé à l'email de l'utilisateur
 *     responses:
 *       200:
 *         description: Adresse email vérifiée avec succès
 *       400:
 *         description: Token manquant ou invalide
 *       500:
 *         description: Erreur serveur lors de la vérification de l'email
 */

    async verifyEmail(req, res) {
        // Extraire le token de la requête
        const { token } = req.query;
      
         // Vérifier si le token est présent
        if (!token) {
            return res.status(400).json({ error: "Token manquant." });
        }
      
        try {
            // Chercher l'utilisateur en base de données avec le token de vérification
            const user = await User.findOne({ where: { emailVerificationToken: token } });
            
            // Si l'utilisateur n'existe pas ou le token est invalide
            if (!user) {
                return res.status(400).json({ error: "Lien invalide ou expiré." });
            }
            
            // Marquer l'utilisateur comme vérifié
            user.isVerified = true;
            user.emailVerificationToken = null; // Supprime le token après vérification
            await user.save();
            
            // Retourner un message de succès
            return res.status(200).json({ message: "Adresse email vérifiée avec succès." });
        
        } catch (error) {
            console.error("Erreur vérification email:", error);
            return res.status(500).json({ error: "Erreur lors de la vérification de l'email." });
        }
      },
      
    
//<--------------------------------- LOGIN --------------------------------->
    
    /**
 * @openapi
 * /login:
 *   post:
 *     summary: Connexion d'un utilisateur
 *     description: Authentifie un utilisateur avec son email et mot de passe, et retourne un token JWT.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 example: MonSuperMotdepasse123!
 *     responses:
 *       200:
 *         description: Connexion réussie, retourne un token JWT.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *       400:
 *         description: Email ou mot de passe incorrect.
 *       500:
 *         description: Erreur serveur.
 */

    async loginUser(req, res) {
        try {
            // Récupérer l'email et le mot de passe fourni
            const { email, password } = req.body;

            // Valider la présence des champs
            if (! email || ! password) {
            return res.status(400).json({ error: "Tous les champs sont obligatoires." });
            }

            // Récupérer en BDD l'utilisateur par son email
            const user = await User.findOne({ where: { email : email } }); // { id, password, email }

            // Si l'utilisateur n'existe pas
            if (!user) {
                return res.status(400).json({ error: "Email ou mot de passe incorrect." });
            }

             // Vérifier si l'utilisateur a validé son email
            if (!user.isVerified) {
                return res.status(403).json({ error: "Veuillez vérifier votre adresse email avant de vous connecter." });
            }

            // Vérifier si le mot de passe est valide 
            const passwordValid = await argon2.verify(user.password, password)

            // Si les mots de passe ne match pas
            if (! passwordValid) {
                return res.status(400).json({ error: "Email ou mot de passe incorrect." });
            }

            // Générer un token JWT pour l'utilisateur
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
                { expiresIn: tokenExpiry }  // Expiration 
            );

            res.status(200).json({ token, id: user.id });
        } catch (err) {
            console.error('loginUser error →', err);
            return res.status(500).json({ error: 'Erreur serveur.' });
        }
    },

    /**
 * @swagger
 * /private:
 *   get:
 *     summary: Accès à une ressource protégée
 *     description: Retourne un message de bienvenue à l'utilisateur authentifié.
 *     tags:
 *       - Utilisateurs
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Succès - L'utilisateur est authentifié
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Hello John
 *       401:
 *         description: Non autorisé - Token manquant ou invalide
 *       403:
 *         description: Accès refusé
 */


    async private(req, res) {
        res.status(200).json({ message: `Hello ${req.user.firstname}` });
    }
}



export { authController };