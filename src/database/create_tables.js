import { sequelize } from "../models/sequelize-client.js"; 
import { User } from "../models/User.js"; 

async function createTables() {
  try {
    console.log(' Suppression de la table "user"...');
    await sequelize.getQueryInterface().dropTable('user', {}); // Supprime uniquement la table "user"

    console.log('Synchronisation du modèle User...');
    await User.sync({ force: true }); // Recréation de la table avec le modèle

    console.log('Table "user" créée avec succès!');
  } catch (error) {
    console.error('Erreur lors de la création de la table:', error);
  }
}

createTables();