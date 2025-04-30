import { sequelize } from "../models/sequelize-client.js"; // chemin selon ton projet
import { Users } from "../models/Users.js"; // ton modèle User

async function createTables() {
  try {
    // Drop la table si elle existe
    await sequelize.drop(); // drop tout ce qui match "user"

    // Synchroniser ton modèle User => ça crée la table automatiquement
    await Users.sync(); // force:true = drop puis recreate la table proprement

    console.log('✅ Table "user" created successfully!');
  } catch (error) {
    console.error('❌ Error creating table:', error);
  }
}

createTables();