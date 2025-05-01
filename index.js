import 'dotenv/config';
import express from 'express';
import { router } from "./src/router.js";
import { setupSwagger } from './src/docs/swagger/swagger.js'; // ← ajout ici


// Création de l'app Express
const app = express();

// Pour pouvoir utiliser le req.body et récupérer le JSON envoyé par le client
app.use(express.json());

setupSwagger(app); // ← setup Swagger ici

// Configuration du router
app.use(router);


// Lancement du serveur
const port = process.env.PORT;
app.listen(port, () => {
  console.log(`🚀 Server started at http://localhost:${port}`);
  console.log(`📚 Swagger available at http://localhost:${port}/api-docs`);

});