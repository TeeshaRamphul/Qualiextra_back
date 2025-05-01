import PasswordValidator from "password-validator";
import argon2 from "argon2";
import jwt from "jsonwebtoken";
import dotenv from 'dotenv';
dotenv.config();
import { User } from "../models/User.js";


const userController = {
     
    //<------------------------------------------------------------>
    //<------------------------- REGISTER ------------------------->
    //<------------------------------------------------------------>

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
    
            return res.status(201).json({ successMessage: "Utilisateur créé avec succès." });
    
        } catch (error) {
            console.error('Erreur lors de l\'enregistrement de l\'utilisateur :', error);
            return res.status(500).json({ error: "Erreur lors de l'enregistrement de l'utilisateur." });
        }
    },
    

    //<------------------------------------------------------------>
    //<-------------------------- LOGIN --------------------------->
    //<------------------------------------------------------------>

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

            res.status(200).json({ token });
        } catch (err) {
            console.error('loginUser error →', err);
            return res.status(500).json({ error: 'Erreur serveur.' });
        }
    },


    //<----------------------------------------------------------------->
    //<------------------------- GET-ALL-USERS ------------------------->
    //<----------------------------------------------------------------->

 /**
 * @openapi
 * /users:
 *   get:
 *     summary: "Récupère tous les utilisateurs (admin uniquement)"
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: "Liste des utilisateurs récupérée avec succès."
 *       401:
 *         description: "Token manquant ou invalide."
 *       403:
 *         description: "Accès interdit. Admin requis."
 *       500:
 *         description: "Erreur serveur lors de la récupération des utilisateurs."
 */
    async getAllUsers(req, res) {
        try {
            const users = await User.findAll({ attributes: { exclude: ['password'] } });
          
            res.status(200).json(users);

        } catch (err) {
            console.error("Erreur lors de la récupération des utilisateurs :", err);
            res.status(500).json({ error: "Erreur serveur lors de la récupération des utilisateurs." });
        }
    },


    //<----------------------------------------------------------------->
    //<------------------------- GET-ONE-USERS ------------------------->
    //<----------------------------------------------------------------->

/**
 * @openapi
 * /users/{id}:
 *   get:
 *     summary: Récupère un utilisateur par son ID
 *     description: |
 *       Retourne les informations d'un utilisateur spécifique.  
 *       Seul l'utilisateur concerné ou un administrateur peut accéder à cette ressource.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de l'utilisateur à récupérer
 *     responses:
 *       200:
 *         description: Utilisateur récupéré avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 firstname:
 *                   type: string
 *                 lastname:
 *                   type: string
 *                 email:
 *                   type: string
 *                 role:
 *                   type: string
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *       403:
 *         description: Accès refusé - vous ne pouvez accéder qu'à votre propre profil
 *       400:
 *         description: Utilisateur non trouvé
 *       500:
 *         description: Erreur serveur lors de la récupération de l'utilisateur.
 */
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


    //<---------------------------------------------------------->
    //<------------------------- UPDATE ------------------------->
    //<---------------------------------------------------------->


/**
 * @openapi
 * /users/{id}:
 *   patch:
 *     summary: "Met à jour un utilisateur"
 *     description: "Cette route permet de mettre à jour les informations d'un utilisateur (prénom, nom, email). Seul un utilisateur admin ou l'utilisateur lui-même peut modifier son profil."
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: "L'ID de l'utilisateur à mettre à jour"
 *         schema:
 *           type: integer
 *     requestBody:
 *       description: "Les données à mettre à jour pour l'utilisateur"
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstname:
 *                 type: string
 *                 description: "Le prénom de l'utilisateur"
 *               lastname:
 *                 type: string
 *                 description: "Le nom de l'utilisateur"
 *               email:
 *                 type: string
 *                 description: "L'email de l'utilisateur"
 *             example:
 *               firstname: "John"
 *               lastname: "Doe"
 *               email: "john.doe@example.com"
 *     responses:
 *       200:
 *         description: "Utilisateur mis à jour avec succès"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 firstname:
 *                   type: string
 *                 lastname:
 *                   type: string
 *                 email:
 *                   type: string
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: "Utilisateur non trouvé ou mauvais format de données"
 *       403:
 *         description: "Interdiction de modifier ce profil"
 *       500:
 *         description: "Erreur serveur lors de la mise à jour de l'utilisateur"
 */
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


    //<---------------------------------------------------------->
    //<------------------------- DELETE ------------------------->
    //<---------------------------------------------------------->

/**
 * @openapi
 * /users/{id}:
 *   delete:
 *     summary: Supprime un utilisateur (admin uniquement)
 *     description: |
 *       Permet de supprimer un utilisateur de l'API. Seul un administrateur peut effectuer cette opération.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de l'utilisateur à supprimer
 *     responses:
 *       204:
 *         description: Utilisateur supprimé avec succès
 *       403:
 *         description: Accès refusé - seul un administrateur peut supprimer un utilisateur
 *       400:
 *         description: Utilisateur non trouvé
 *       500:
 *         description: Erreur serveur
 */

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