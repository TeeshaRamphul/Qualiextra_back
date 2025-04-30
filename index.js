// Charger les variables d'environnement du .env
import 'dotenv/config';

// Import des dépendances
import express from 'express';
import { router } from "./src/router.js";

// Création de l'app Express
const app = express();

// Pour pouvoir utiliser le req.body et récupérer le JSON envoyé par le client
app.use(express.json());

// Configuration du router
app.use(router);

// Lancement du serveur
const port = process.env.PORT;
app.listen(port, () => {
  console.log(`🚀 Server started at http://localhost:${port}`);
});