import { sequelize } from "../models/sequelize-client.js";
import { User } from "../models/User.js";

async function seedUsers() {
  try {
    await sequelize.sync(); // synchronise les modèles avec la base de données, créer les tables si elles n'existent pas encore

    // bulkCreate permet de créer plusieurs enregistrements en une seule fois
    await User.bulkCreate([
        { firstname: "Alice", lastname: "Dupont", email: "alice.dupont@example.com", password: "password123@", role: "admin"},
        { firstname: "Bob", lastname: "Martin", email: "bob.martin@example.com", password: "password456@" },
        { firstname: "Charlie", lastname: "Lemoine", email: "charlie.lemoine@example.com", password: "password789@" }
    ]);
    
    console.log("✅ Utilisateurs insérés !");
  } catch (error) {
    console.error("❌ Erreur lors du seed :", error);
  }
}

seedUsers();