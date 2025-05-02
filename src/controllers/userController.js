import { User } from "../models/User.js";
import dotenv from 'dotenv';
dotenv.config();

const userController = {
    
//<--------------------------------- GET-ALL-USERS --------------------------------->
    
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
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       401:
 *         description: "Token manquant ou invalide."
 *       403:
 *         description: "Accès interdit. Admin requis."
 *       500:
 *         description: "Erreur serveur lors de la récupération des utilisateurs."
 */

    async getAllUsers(req, res) {
        try {
            const users = await User.findAll({ attributes: { exclude: ['password'] }});
          
            res.status(200).json(users);

        } catch (err) {
            console.error("Erreur lors de la récupération des utilisateurs :", err);
            res.status(500).json({ error: "Erreur serveur lors de la récupération des utilisateurs." });
        }
    },


    
//<--------------------------------- GET-ONE-USERS --------------------------------->

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
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       401:
 *         description: "Token manquant ou invalide."
 *       403:
 *         description: "Accès interdit. Admin requis."
 *       500:
 *         description: "Erreur serveur lors de la récupération des utilisateurs."
 */

    async getOneUser(req, res) {
        try {
          const id = req.params.id;
      
          if (req.user.role !== 'admin' && req.user.id != id) {
            return res.status(403).json({ error: "Vous ne pouvez accéder qu'à votre propre profil." });
          }
      
          const user = await User.findByPk(id, { attributes: { exclude: ['password'] } });
          if (!user) {
            return res.status(400).json({ error: "Utilisateur non trouvé." });
          }
      
          res.status(200).json(user);
        } catch (err) {
          console.error("Erreur lors de la récupération de l'utilisateur :", err);
          res.status(500).json({ error: "Erreur serveur lors de la récupération de l'utilisateur." });
        }
    },


    
//<--------------------------------- UPDATE --------------------------------->
    
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


//<--------------------------------- DELETE --------------------------------->

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