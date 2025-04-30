
import 'dotenv/config';
import { sequelize } from '../models/sequelize-client.js';
import { User } from '../models/User.js';
import { Sequelize } from 'sequelize';

async function addRoleToUserTable() {
  try {
    // 1) Ajout de la colonne role si elle n'existe pas déjà
    // On utilise la méthode queryInterface via sequelize
    await sequelize.getQueryInterface().addColumn('user', 'role', {
      type: Sequelize.ENUM('admin', 'member'),
      allowNull: false,
      defaultValue: 'member'
    });

    // 2) Mettre à jour l’utilisateur jeff@oclock.io pour qu’il devienne admin
    const [affectedCount] = await User.update(
      { role: 'admin' },  // Nouvel attribut
      { where: { email: 'tee@exemple.com' } }  // Condition
    );
    console.log(`✅ Utilisateurs mis à jour : ${affectedCount}`);

  } catch (err) {
    console.error('❌ Migration échouée :', err);
  }
}

addRoleToUserTable();
